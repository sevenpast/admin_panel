import { NextRequest } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { apiSuccess, apiError } from '@/lib/api-helpers'

// Cache for camp ID to avoid repeated queries
let cachedCampId: string | null = null
let campIdCacheTime = 0
const CAMP_ID_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

async function getCampId(supabase: any): Promise<string> {
  const now = Date.now()
  
  // Return cached camp ID if still valid
  if (cachedCampId && (now - campIdCacheTime) < CAMP_ID_CACHE_DURATION) {
    return cachedCampId
  }

  try {
    const { data: camps, error: campsError } = await supabase
      .from('camps')
      .select('id')
      .limit(1)
      .single()

    if (campsError || !camps) {
      // Create default camp if none exists
      const { data: newCamp, error: createError } = await supabase
        .from('camps')
        .insert([{
          name: 'Default Camp',
          timezone: 'UTC',
          is_active: true
        }])
        .select('id')
        .single()

      if (createError || !newCamp) {
        console.error('Failed to create default camp:', createError)
        throw new Error('Failed to create default camp')
      }
      
      cachedCampId = newCamp.id
      campIdCacheTime = now
      return newCamp.id
    }

    cachedCampId = camps.id
    campIdCacheTime = now
    return camps.id
  } catch (error) {
    console.error('Error getting camp ID:', error)
    throw error
  }
}

export async function GET(request: NextRequest) {
  const supabase = createServiceRoleClient()
  
  try {
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const activeOnly = searchParams.get('active_only') === 'true'
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get camp ID with caching
    const campId = await getCampId(supabase)

    // Build optimized query
    let query = supabase
      .from('guests')
      .select(`
        id,
        guest_id,
        name,
        mobile_number,
        instagram,
        surf_package,
        is_active,
        allergies,
        other_allergies,
        created_at,
        bed_assignments!inner (
          id,
          status,
          beds!inner (
            id,
            name,
            rooms!inner (
              id,
              name,
              room_number
            )
          )
        )
      `)
      .eq('camp_id', campId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    if (search) {
      // Use text search for better performance
      query = query.or(`name.ilike.%${search}%,mobile_number.ilike.%${search}%,instagram.ilike.%${search}%,guest_id.ilike.%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching guests:', error)
      return apiError('Failed to fetch guests', 'GUESTS_FETCH_FAILED', 500)
    }

    // Transform data to match expected format
    const transformedGuests = (data || []).map(guest => {
      // Get the most recent active bed assignment
      const activeBedAssignment = guest.bed_assignments?.find((ba: any) => ba.status === 'active')
      
      return {
        id: guest.id,
        guest_id: guest.guest_id,
        name: guest.name,
        mobile_number: guest.mobile_number,
        instagram: guest.instagram,
        surf_package: guest.surf_package,
        is_active: guest.is_active,
        allergies: guest.allergies,
        other_allergies: guest.other_allergies,
        created_at: guest.created_at,
        room_assignment: activeBedAssignment ? {
          room_number: activeBedAssignment.beds?.rooms?.room_number || 'N/A',
          bed_name: activeBedAssignment.beds?.name || 'N/A'
        } : undefined
      }
    })

    return apiSuccess(transformedGuests)
  } catch (error: any) {
    console.error('Error in guests GET:', error)
    return apiError('Internal server error', 'INTERNAL_ERROR', 500)
  }
}

export async function POST(request: NextRequest) {
  const supabase = createServiceRoleClient()
  
  try {
    const body = await request.json()
    const { name, mobile_number, instagram, surf_package, allergies, other_allergies, assessment_answers } = body

    // Validate required fields
    if (!name || !name.trim()) {
      return apiError('Guest name is required', 'VALIDATION_ERROR', 400)
    }

    // Get camp ID with caching
    const campId = await getCampId(supabase)

    // Generate unique guest ID
    const guestId = `GUEST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Create guest
    const { data: guest, error: guestError } = await supabase
      .from('guests')
      .insert([{
        camp_id: campId,
        guest_id: guestId,
        name: name.trim(),
        mobile_number: mobile_number?.trim() || null,
        instagram: instagram?.trim() || null,
        surf_package: surf_package || false,
        allergies: allergies || {},
        other_allergies: other_allergies?.trim() || null,
        is_active: true
      }])
      .select()
      .single()

    if (guestError) {
      console.error('Error creating guest:', guestError)
      return apiError('Failed to create guest', 'GUEST_CREATION_FAILED', 500)
    }

    // Save assessment answers if provided
    if (assessment_answers && Object.keys(assessment_answers).length > 0) {
      const assessmentEntries = Object.entries(assessment_answers).map(([questionId, answer]) => ({
        camp_id: campId,
        guest_id: guest.id,
        question_id: questionId,
        answer: answer as number
      }))

      const { error: assessmentError } = await supabase
        .from('guest_assessments')
        .upsert(assessmentEntries, { onConflict: 'guest_id,question_id' })

      if (assessmentError) {
        console.error('Error saving assessment answers:', assessmentError)
        // Don't fail the entire request, just log the error
      }
    }

    return apiSuccess(guest)
  } catch (error: any) {
    console.error('Error in guests POST:', error)
    return apiError('Internal server error', 'INTERNAL_ERROR', 500)
  }
}
