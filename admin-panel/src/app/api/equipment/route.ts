import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Helper to get current camp_id or create a default one
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')

  try {
    const campId = await getCurrentCampId()
    let query = supabase
      .from('equipment')
      .select(`
        *,
        equipment_assignments (
          id,
          assigned_at,
          status,
          guests (
            id,
            guest_id,
            name
          )
        )
      `)
      .eq('camp_id', campId)
      .eq('is_active', true)
      .order('base_name', { ascending: true })
      .order('name', { ascending: true })

    if (category) {
      query = query.eq('category', category)
    }

    const { data: equipment, error } = await query

    if (error) {
      console.error('Error fetching equipment:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(equipment || [], { status: 200 })
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const campId = await getCurrentCampId()
    const body = await request.json()
    
    const { name, category, type, size, brand, condition, items, numbering_type, numbering_start } = body

    // Validate required fields
    if (!name || !category) {
      return NextResponse.json({ error: 'Name and category are required' }, { status: 400 })
    }

    const quantity = items > 0 ? items : 1

    // Create equipment items
    const equipmentItems = []
    for (let i = 0; i < quantity; i++) {
      // Generate equipment_id with unique timestamp
      const equipmentId = `E${Date.now().toString(36).toUpperCase()}${i}`
      
      // Generate identifier based on numbering type and start
      let identifier = ''
      if (numbering_type === 'alphabetic') {
        const startValue = numbering_start ? parseInt(numbering_start) : 1
        identifier = String.fromCharCode(97 + (startValue - 1 + i)) // a, b, c...
      } else {
        const startValue = numbering_start ? parseInt(numbering_start) : 1
        identifier = (startValue + i).toString() // 1, 2, 3...
      }

      // Create name with identifier if multiple items
      const itemName = quantity > 1 ? `${name} ${identifier}` : name

      equipmentItems.push({
        equipment_id: equipmentId,
        camp_id: campId,
        name: itemName,
        base_name: name,
        category,
        type: type || null,
        brand: brand || null,
        size: size || null,
        status: 'available',
        condition: condition || 'good',
        is_active: true
      })
    }

    // Insert equipment items
    const { data: equipmentResult, error: equipmentError } = await supabase
      .from('equipment')
      .insert(equipmentItems)
      .select(`
        *,
        equipment_assignments (
          id,
          assigned_at,
          status,
          guests (
            id,
            guest_id,
            name
          )
        )
      `)

    if (equipmentError) {
      return NextResponse.json({ error: equipmentError.message }, { status: 500 })
    }

    return NextResponse.json(equipmentResult, { status: 201 })
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Equipment ID is required for update' }, { status: 400 })
    }

    const body = await request.json()
    const campId = await getCurrentCampId()

    const { data: updatedEquipment, error } = await supabase
      .from('equipment')
      .update(body)
      .eq('id', id)
      .eq('camp_id', campId)
      .select(`
        *,
        equipment_assignments (
          id,
          assigned_at,
          status,
          guests (
            id,
            guest_id,
            name
          )
        )
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(updatedEquipment, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const equipmentId = searchParams.get('id')
    
    if (!equipmentId) {
      return NextResponse.json({ error: 'Equipment ID is required' }, { status: 400 })
    }

    // Check if equipment has active assignments
    const { data: assignments, error: checkError } = await supabase
      .from('equipment_assignments')
      .select('id')
      .eq('equipment_id', equipmentId)
      .eq('status', 'active')

    if (checkError) {
      return NextResponse.json({ error: checkError.message }, { status: 500 })
    }

    if (assignments && assignments.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete equipment with active assignments. Please remove assignments first.' 
      }, { status: 400 })
    }

    // Soft delete - set is_active to false
    const { data, error } = await supabase
      .from('equipment')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', equipmentId)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Equipment deleted successfully', data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}