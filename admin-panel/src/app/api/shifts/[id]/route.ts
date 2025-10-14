import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceRoleClient()
    const body = await request.json()
    
    const {
      staff_id,
      role_label,
      start_at,
      end_at,
      color,
      notes
    } = body

    const shiftId = params.id

    // Validate required fields
    if (!staff_id || !role_label || !start_at || !end_at) {
      return NextResponse.json({ 
        error: 'Missing required fields: staff_id, role_label, start_at, end_at' 
      }, { status: 400 })
    }

    // Validate staff is active
    const { data: staffData, error: staffError } = await supabase
      .from('staff')
      .select('is_active, labels')
      .eq('id', staff_id)
      .single()

    if (staffError || !staffData) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 })
    }

    if (!staffData.is_active) {
      return NextResponse.json({ error: 'Staff is inactive and cannot be assigned' }, { status: 400 })
    }

    // Check for role label mismatch (warning only)
    const hasRoleLabel = staffData.labels?.includes(role_label)
    if (!hasRoleLabel) {
      console.warn(`Staff does not have role label: ${role_label}`)
    }

    // Check for time conflicts (excluding current shift)
    const { data: conflictingShifts, error: conflictError } = await supabase
      .from('shifts')
      .select('id, shift_id')
      .eq('staff_id', staff_id)
      .eq('is_active', true)
      .neq('id', shiftId)
      .or(`and(start_at.lt.${end_at},end_at.gt.${start_at})`)

    if (conflictError) {
      console.error('Error checking conflicts:', conflictError)
    } else if (conflictingShifts && conflictingShifts.length > 0) {
      return NextResponse.json({ 
        error: 'Conflict: Overlap with existing shift' 
      }, { status: 409 })
    }

    // Validate no overnight shifts
    const startDate = new Date(start_at).toDateString()
    const endDate = new Date(end_at).toDateString()
    if (startDate !== endDate) {
      return NextResponse.json({ 
        error: 'Shifts cannot span across midnight' 
      }, { status: 400 })
    }

    // Update shift
    const { data: updatedShift, error: updateError } = await supabase
      .from('shifts')
      .update({
        staff_id,
        role_label,
        start_at,
        end_at,
        color: color || null,
        notes: notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', shiftId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating shift:', updateError)
      return NextResponse.json({ error: 'Failed to update shift' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Shift updated successfully',
      shift: updatedShift
    })
  } catch (error) {
    console.error('Error in shifts PATCH API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceRoleClient()
    const shiftId = params.id

    // Check if shift exists
    const { data: existingShift, error: fetchError } = await supabase
      .from('shifts')
      .select('id, shift_id, recurrence_parent_id')
      .eq('id', shiftId)
      .single()

    if (fetchError || !existingShift) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 })
    }

    // For now, we'll do a soft delete by setting is_active to false
    // This preserves the data for audit purposes
    const { error: deleteError } = await supabase
      .from('shifts')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', shiftId)

    if (deleteError) {
      console.error('Error deleting shift:', deleteError)
      return NextResponse.json({ error: 'Failed to delete shift' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Shift deleted successfully'
    })
  } catch (error) {
    console.error('Error in shifts DELETE API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


