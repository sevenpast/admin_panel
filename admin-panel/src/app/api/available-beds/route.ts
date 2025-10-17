import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('room_id')
    
    // Get current camp_id
    let campId: string
    
    const { data: camps, error: campsError } = await supabase
      .from('camps')
      .select('id')
      .limit(1)
      .single()

    if (campsError || !camps) {
      return NextResponse.json({ error: 'No camp found' }, { status: 500 })
    }
    campId = camps.id

    // Build query with room name
    let query = supabase
      .from('beds')
      .select(`
        id,
        bed_id,
        identifier,
        bed_type,
        capacity,
        rooms (
          name
        )
      `)
      .eq('camp_id', campId)
      .eq('is_active', true)

    // Filter by room if specified
    if (roomId) {
      query = query.eq('room_id', roomId)
    }

    const { data: beds, error: bedsError } = await query

    if (bedsError) {
      return NextResponse.json({ error: 'Error fetching beds' }, { status: 500 })
    }

    // For each bed, count actual active assignments
    const availableBeds = []
    
    for (const bed of beds || []) {
      // Count current active assignments for this bed
      const { count: currentAssignments, error: countError } = await supabase
        .from('bed_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('bed_id', bed.id)
        .eq('status', 'active')

      if (countError) {
        console.error(`Error counting assignments for bed ${bed.id}:`, countError)
        continue
      }

      const occupancy = currentAssignments || 0
      const isAvailable = occupancy < bed.capacity

      // Only return beds that are actually available
      if (isAvailable) {
        availableBeds.push({
          ...bed,
          room_name: bed.rooms?.name || 'Unknown Room',
          bed_name: bed.identifier || `Bed ${bed.bed_id}`,
          current_occupancy: occupancy,
          available_spots: bed.capacity - occupancy,
          is_available: true
        })
      }
    }

    return NextResponse.json(availableBeds)
  } catch (error) {
    console.error('Error in GET /api/available-beds:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
