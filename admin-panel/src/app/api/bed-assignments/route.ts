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
      .from('bed_assignments')
      .select(`
        *,
        guests (
          id,
          name,
          guest_id
        ),
        beds (
          id,
          identifier,
          bed_id,
          capacity,
          rooms (
            id,
            name,
            room_type
          )
        )
      `)
      .eq('camp_id', campId)
      .eq('status', 'active')
      .order('assigned_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const campId = await getCurrentCampId()
    const body = await request.json()
    
    const { guest_id, bed_id, assigned_by, notes } = body

    // Validate required fields
    if (!guest_id || !bed_id) {
      return NextResponse.json({ error: 'Guest ID and Bed ID are required' }, { status: 400 })
    }

    // Check if guest is active
    const { data: guest, error: guestError } = await supabase
      .from('guests')
      .select('id, is_active')
      .eq('id', guest_id)
      .single()

    if (guestError || !guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
    }

    if (!guest.is_active) {
      return NextResponse.json({ error: 'Cannot assign bed to inactive guest' }, { status: 400 })
    }

    // Check if bed is available
    const { data: bed, error: bedError } = await supabase
      .from('beds')
      .select('id, capacity, current_occupancy, is_active')
      .eq('id', bed_id)
      .single()

    if (bedError || !bed) {
      return NextResponse.json({ error: 'Bed not found' }, { status: 404 })
    }

    if (!bed.is_active) {
      return NextResponse.json({ error: 'Cannot assign inactive bed' }, { status: 400 })
    }

    // Check if bed has capacity
    if (bed.current_occupancy >= bed.capacity) {
      return NextResponse.json({ 
        error: `Bed is at full capacity (${bed.current_occupancy}/${bed.capacity})` 
      }, { status: 400 })
    }

    // Check if guest already has an active bed assignment
    const { data: existingAssignment, error: existingError } = await supabase
      .from('bed_assignments')
      .select('id, bed_id')
      .eq('guest_id', guest_id)
      .eq('status', 'active')
      .single()

    if (existingError && existingError.code !== 'PGRST116') { // PGRST116 = no rows returned
      return NextResponse.json({ error: existingError.message }, { status: 500 })
    }

    // If guest has an existing assignment to a different bed, end it first
    if (existingAssignment && existingAssignment.bed_id !== bed_id) {
      // End existing assignment
      const { error: endAssignmentError } = await supabase
        .from('bed_assignments')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', existingAssignment.id)

      if (endAssignmentError) {
        return NextResponse.json({ error: endAssignmentError.message }, { status: 500 })
      }

      // Update occupancy for the old bed
      const { data: oldBed, error: oldBedError } = await supabase
        .from('beds')
        .select('current_occupancy')
        .eq('id', existingAssignment.bed_id)
        .single()

      if (!oldBedError && oldBed) {
        await supabase
          .from('beds')
          .update({ 
            current_occupancy: Math.max(0, oldBed.current_occupancy - 1)
          })
          .eq('id', existingAssignment.bed_id)
      }
    }

    // Create bed assignment
    const { data: assignment, error: assignmentError } = await supabase
      .from('bed_assignments')
      .insert({
        camp_id: campId,
        guest_id,
        bed_id,
        status: 'active',
        assigned_at: new Date().toISOString(),
        assigned_by,
        notes
      })
      .select(`
        *,
        guests (
          id,
          name,
          guest_id
        ),
        beds (
          id,
          identifier,
          bed_id,
          capacity,
          rooms (
            id,
            name,
            room_type
          )
        )
      `)
      .single()

    if (assignmentError) {
      return NextResponse.json({ error: assignmentError.message }, { status: 500 })
    }

    // Update bed occupancy
    const { error: bedUpdateError } = await supabase
      .from('beds')
      .update({ 
        current_occupancy: bed.current_occupancy + 1
      })
      .eq('id', bed_id)

    if (bedUpdateError) {
      console.error('Error updating bed occupancy:', bedUpdateError)
      // Don't fail the request, just log the error
    }

    return NextResponse.json(assignment, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assignmentId = searchParams.get('id')
    
    if (!assignmentId) {
      return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const { status, notes, checked_out_at, completed_at } = body

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (status !== undefined) updateData.status = status
    if (notes !== undefined) updateData.notes = notes
    if (checked_out_at !== undefined) updateData.checked_out_at = checked_out_at
    if (completed_at !== undefined) updateData.completed_at = completed_at

    const { data, error } = await supabase
      .from('bed_assignments')
      .update(updateData)
      .eq('id', assignmentId)
      .select(`
        *,
        guests (
          id,
          name,
          guest_id
        ),
        beds (
          id,
          identifier,
          bed_id,
          capacity,
          rooms (
            id,
            name,
            room_type
          )
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
    const assignmentId = searchParams.get('id')
    
    if (!assignmentId) {
      return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 })
    }

    // Get the assignment to find the bed_id before updating
    const { data: assignment, error: fetchError } = await supabase
      .from('bed_assignments')
      .select('bed_id')
      .eq('id', assignmentId)
      .single()

    if (fetchError || !assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    // Update assignment status to completed instead of deleting
    const { data, error } = await supabase
      .from('bed_assignments')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', assignmentId)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update bed occupancy (decrement)
    const { data: bed, error: bedError } = await supabase
      .from('beds')
      .select('current_occupancy')
      .eq('id', assignment.bed_id)
      .single()

    if (!bedError && bed) {
      await supabase
        .from('beds')
        .update({ 
          current_occupancy: Math.max(0, bed.current_occupancy - 1)
        })
        .eq('id', assignment.bed_id)
    }

    return NextResponse.json({ message: 'Bed assignment completed successfully', data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
