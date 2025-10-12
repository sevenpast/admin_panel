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
      .from('beds')
      .select(`
        *,
        bed_assignments (
          id,
          assigned_at,
          status,
          guests (
            id,
            guest_id,
            name
          )
        ),
        rooms (
          id,
          name,
          room_type
        )
      `)
      .eq('camp_id', campId)
      .eq('is_active', true)
      .order('identifier', { ascending: true })

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
    
    const { room_id, identifier, bed_type, capacity, group_id, slot, notes } = body

    // Validate required fields
    if (!room_id || !identifier) {
      return NextResponse.json({ error: 'Room ID and identifier are required' }, { status: 400 })
    }

    // Generate bed_id
    const bedIdData = `B-${Date.now().toString(36).toUpperCase()}`

    // Create bed
    const { data: bed, error: bedError } = await supabase
      .from('beds')
      .insert({
        bed_id: bedIdData,
        camp_id: campId,
        room_id,
        identifier,
        bed_type: bed_type || 'single',
        capacity: capacity || 1,
        current_occupancy: 0,
        group_id,
        slot: slot || 'single',
        is_active: true,
        notes
      })
      .select(`
        *,
        bed_assignments (
          id,
          assigned_at,
          status,
          guests (
            id,
            guest_id,
            name
          )
        ),
        rooms (
          id,
          name,
          room_type
        )
      `)
      .single()

    if (bedError) {
      return NextResponse.json({ error: bedError.message }, { status: 500 })
    }

    return NextResponse.json(bed, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bedId = searchParams.get('id')
    
    if (!bedId) {
      return NextResponse.json({ error: 'Bed ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const { identifier, bed_type, capacity, group_id, slot, notes } = body

    const { data, error } = await supabase
      .from('beds')
      .update({
        identifier,
        bed_type,
        capacity,
        group_id,
        slot,
        notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', bedId)
      .select(`
        *,
        bed_assignments (
          id,
          assigned_at,
          status,
          guests (
            id,
            guest_id,
            name
          )
        ),
        rooms (
          id,
          name,
          room_type
        )
      `)
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
    const bedId = searchParams.get('id')
    
    if (!bedId) {
      return NextResponse.json({ error: 'Bed ID is required' }, { status: 400 })
    }

    // Check if bed has active assignments
    const { data: assignments, error: checkError } = await supabase
      .from('bed_assignments')
      .select('id')
      .eq('bed_id', bedId)
      .eq('status', 'active')

    if (checkError) {
      return NextResponse.json({ error: checkError.message }, { status: 500 })
    }

    if (assignments && assignments.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete bed with active assignments. Please check out guests first.' 
      }, { status: 400 })
    }

    // Soft delete - set is_active to false
    const { data, error } = await supabase
      .from('beds')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', bedId)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Bed deleted successfully', data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
