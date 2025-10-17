import { NextRequest } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { apiSuccess, apiError, ERROR_CODES, serverError } from '@/lib/api-helpers'

// GET - Fetch a specific guest
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServiceRoleClient()

  try {
    const { data, error } = await supabase
      .from('guests')
      .select(`
        *,
        bed_assignments (
          id,
          bed_id,
          status,
          assigned_at,
          beds (
            id,
            bed_id,
            identifier,
            bed_type,
            capacity,
            current_occupancy,
            rooms (
              id,
              name,
              room_number
            )
          )
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching guest:', error)
      return apiError(error.message, ERROR_CODES.DATABASE_ERROR, 500)
    }

    if (!data) {
      return apiError('Guest not found', ERROR_CODES.NOT_FOUND, 404)
    }

    // Transform the data to match frontend expectations
    const activeBedAssignment = data.bed_assignments?.find(assignment =>
      assignment.status === 'active'
    )

    const room_assignment = activeBedAssignment ? {
      room_number: activeBedAssignment.beds?.rooms?.room_number || activeBedAssignment.beds?.rooms?.name || 'Unknown',
      bed_name: activeBedAssignment.beds?.identifier || 'Unknown'
    } : undefined

    const transformedData = {
      ...data,
      room_assignment,
      bed_assignments: undefined
    }

    return apiSuccess(transformedData)
  } catch (e: any) {
    console.error('Error in GET /api/guests/[id]:', e)
    return apiError(e.message || 'An unknown error occurred', ERROR_CODES.INTERNAL_SERVER_ERROR, 500)
  }
}

// PUT - Update a specific guest
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServiceRoleClient()

  try {
    const body = await request.json()
    console.log('PUT /api/guests/[id] received body:', JSON.stringify(body, null, 2))

    // Remove invalid surf level values to prevent database errors
    if (body.surf_level) {
      const validLevels = ['beginner', 'intermediate', 'advanced']
      if (!validLevels.includes(body.surf_level)) {
        console.log(`Removing invalid surf_level value: ${body.surf_level}`)
        delete body.surf_level  // Remove the invalid value instead of mapping it
      }
    }

    // Also check if there are any nested fields that might contain surf_level
    if (body.assessment_answers && typeof body.assessment_answers === 'object') {
      for (const [key, value] of Object.entries(body.assessment_answers)) {
        if (typeof value === 'string' && !['beginner', 'intermediate', 'advanced'].includes(value) &&
            (value === 'expert' || value === 'professional' || value === 'pro')) {
          console.log(`Found invalid surf level in assessment_answers.${key}: ${value}`)
          // Remove or map the invalid value
          if (value === 'expert' || value === 'professional' || value === 'pro') {
            body.assessment_answers[key] = 'advanced'
          }
        }
      }
    }

    const { data, error } = await supabase
      .from('guests')
      .update(body)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating guest:', error)
      return apiError(error.message, ERROR_CODES.DATABASE_ERROR, 500)
    }

    if (!data) {
      return apiError('Guest not found', ERROR_CODES.NOT_FOUND, 404)
    }

    return apiSuccess(data)
  } catch (e: any) {
    console.error('Error in PUT /api/guests/[id]:', e)
    return apiError(e.message || 'An unknown error occurred', ERROR_CODES.INTERNAL_SERVER_ERROR, 500)
  }
}

// DELETE - Delete a specific guest
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServiceRoleClient()

  try {
    const { error } = await supabase
      .from('guests')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting guest:', error)
      return apiError(error.message, ERROR_CODES.DATABASE_ERROR, 500)
    }

    return apiSuccess({ message: 'Guest deleted successfully' })
  } catch (e: any) {
    console.error('Error in DELETE /api/guests/[id]:', e)
    return apiError(e.message || 'An unknown error occurred', ERROR_CODES.INTERNAL_SERVER_ERROR, 500)
  }
}