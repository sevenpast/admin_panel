import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function getCurrentCampId() {
  let campId: string
  
  const { data: camps, error: campsError } = await supabase
    .from('camps')
    .select('id')
    .limit(1)
    .single()

  if (campsError || !camps) {
    // Create a default camp if none exists
    const { data: newCamp, error: createError } = await supabase
      .from('camps')
      .insert({
        name: 'Default Camp',
        timezone: 'UTC',
        is_active: true
      })
      .select('id')
      .single()

    if (createError || !newCamp) {
      throw new Error('Failed to create default camp')
    }

    campId = newCamp.id
  } else {
    campId = camps.id
  }
  return campId
}

export async function GET() {
  try {
    const campId = await getCurrentCampId()
    const { data, error } = await supabase
      .from('rooms')
      .select(`
        *,
        beds!inner (
          id,
          bed_id,
          identifier,
          bed_type,
          capacity,
          current_occupancy,
          is_active,
          bed_assignments (
            id,
            assigned_at,
            status,
            guests (
              id,
              guest_id,
              name
            )
          )
        )
      `)
      .eq('camp_id', campId)
      .eq('is_active', true)
      .eq('beds.is_active', true)
      .order('name', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data || [])
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const campId = await getCurrentCampId()
    const body = await request.json()
    
    const { name, room_type, description, max_capacity, floor_number, room_number, base_name, beds, bed_count, numbering_type, numbering_start } = body

    // Validate required fields
    if (!name || !base_name) {
      return NextResponse.json({ error: 'Name and base_name are required' }, { status: 400 })
    }

    // Generate room_id
    const roomIdData = `R-${Date.now().toString(36).toUpperCase()}`

    // Create room
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .insert({
        room_id: roomIdData,
        camp_id: campId,
        name,
        base_name,
        room_type: room_type || 'dormitory',
        description,
        max_capacity: max_capacity || 0,
        floor_number: floor_number || 1,
        room_number,
        is_active: true
      })
      .select('*')
      .single()

    if (roomError) {
      return NextResponse.json({ error: roomError.message }, { status: 500 })
    }

    // Create beds if bed_count is provided
    if (bed_count && bed_count > 0) {
      for (let i = 0; i < bed_count; i++) {
        const bedIdData = `B${Date.now().toString(36).toUpperCase()}`
        
        // Generate identifier based on numbering type and start
        let identifier = ''
        if (numbering_type === 'alphabetic') {
          const startValue = numbering_start ? parseInt(numbering_start) : 1
          identifier = String.fromCharCode(97 + (startValue - 1 + i)) // a, b, c...
        } else {
          const startValue = numbering_start ? parseInt(numbering_start) : 1
          identifier = (startValue + i).toString() // 1, 2, 3...
        }

        const { error: bedError } = await supabase
          .from('beds')
          .insert({
            bed_id: bedIdData,
            camp_id: campId,
            room_id: room.id,
            identifier: identifier,
            bed_type: 'single',
            capacity: 1,
            current_occupancy: 0,
            is_active: true
          })

        if (bedError) {
          console.error('Error creating bed:', bedError)
        }
      }
    }

    return NextResponse.json(room, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('id')
    
    if (!roomId) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const { name, room_type, description, max_capacity, floor_number, room_number, base_name } = body

    const { data, error } = await supabase
      .from('rooms')
      .update({
        name,
        room_type,
        description,
        max_capacity,
        floor_number,
        room_number,
        base_name,
        updated_at: new Date().toISOString()
      })
      .eq('id', roomId)
      .select(`
        *,
        beds!inner (
          id,
          bed_id,
          identifier,
          bed_type,
          capacity,
          current_occupancy,
          bed_assignments (
            id,
            status,
            guests (
              id,
              name,
              guest_id
            )
          )
        )
      `)
      .eq('beds.is_active', true)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('id')
    
    if (!roomId) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 })
    }

    // Soft delete - set is_active to false
    const { data, error } = await supabase
      .from('rooms')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', roomId)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Also deactivate all beds in this room
    await supabase
      .from('beds')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('room_id', roomId)

    return NextResponse.json({ message: 'Room deleted successfully', data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
