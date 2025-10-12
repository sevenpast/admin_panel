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
    const { data: newCamp, error: createError } = await supabase
      .from('camps')
      .insert([{ name: 'Default Camp', timezone: 'UTC', is_active: true }])
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
      .from('equipment_assignments')
      .select(`
        *,
        guests (
          id,
          name,
          guest_id
        ),
        equipment (
          id,
          name,
          equipment_id,
          category
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
    
    const { equipment_id, guest_id, assigned_by, notes } = body

    // Validate required fields
    if (!equipment_id || !guest_id) {
      return NextResponse.json({ error: 'Equipment ID and Guest ID are required' }, { status: 400 })
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
      return NextResponse.json({ error: 'Cannot assign equipment to inactive guest' }, { status: 400 })
    }

    // Check if equipment is available
    const { data: equipment, error: equipmentError } = await supabase
      .from('equipment')
      .select('id, status, category, is_active')
      .eq('id', equipment_id)
      .single()

    if (equipmentError || !equipment) {
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 })
    }

    if (!equipment.is_active) {
      return NextResponse.json({ error: 'Cannot assign inactive equipment' }, { status: 400 })
    }

    if (equipment.status !== 'available') {
      return NextResponse.json({ error: 'Equipment is not available' }, { status: 400 })
    }

    // Check if guest already has equipment of the same category
    const { data: existingAssignments, error: existingError } = await supabase
      .from('equipment_assignments')
      .select(`
        id,
        equipment (
          category
        )
      `)
      .eq('guest_id', guest_id)
      .eq('status', 'active')

    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 500 })
    }

    // Check if guest already has equipment of the same category
    const hasSameCategory = existingAssignments?.some(assignment => 
      assignment.equipment?.category === equipment.category
    )

    if (hasSameCategory) {
      return NextResponse.json({ error: `Guest already has ${equipment.category} assigned` }, { status: 400 })
    }

    // Create equipment assignment
    const { data: assignment, error: assignmentError } = await supabase
      .from('equipment_assignments')
      .insert({
        camp_id: campId,
        equipment_id,
        guest_id,
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
        equipment (
          id,
          name,
          equipment_id,
          category
        )
      `)
      .single()

    if (assignmentError) {
      return NextResponse.json({ error: assignmentError.message }, { status: 500 })
    }

    // Update equipment status
    const { error: updateEquipmentError } = await supabase
      .from('equipment')
      .update({ 
        status: 'assigned',
        currently_assigned_to: guest_id
      })
      .eq('id', equipment_id)

    if (updateEquipmentError) {
      console.error('Error updating equipment status:', updateEquipmentError)
    }

    return NextResponse.json(assignment, { status: 201 })
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    // Get assignment details
    const { data: assignment, error: assignmentError } = await supabase
      .from('equipment_assignments')
      .select('equipment_id')
      .eq('id', id)
      .single()

    if (assignmentError || !assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 400 })
    }

    // Delete assignment
    const { error } = await supabase
      .from('equipment_assignments')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update equipment status
    await supabase
      .from('equipment')
      .update({ 
        status: 'available',
        currently_assigned_to: null
      })
      .eq('id', assignment.equipment_id)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

