import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { apiSuccess, apiError } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  try {
    const { searchParams } = new URL(request.url);
    const campId = searchParams.get('camp_id');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // Get current camp_id if not provided or if 'current' is specified
    let currentCampId = campId;
    if (!campId || campId === 'current') {
      const { data: campData, error: campError } = await supabase
        .from('camps')
        .select('id')
        .eq('is_active', true)
        .single();

      if (campError || !campData) {
        console.error('Error fetching current camp:', campError);
        return apiError('Camp not found', 'CAMP_NOT_FOUND', 404);
      }
      currentCampId = campData.id;
    }

    // Build query
    let query = supabase
      .from('shifts')
      .select(`
        *,
        staff:staff_id (
          staff_id,
          name,
          labels,
          is_active
        )
      `)
      .eq('camp_id', currentCampId)
      .eq('is_active', true);

    // Add date filters if provided
    if (from) {
      query = query.gte('start_at', from);
    }
    if (to) {
      query = query.lte('start_at', to);
    }

    const { data: shifts, error } = await query.order('start_at', { ascending: true });

    if (error) {
      console.error('Error fetching shifts:', error);
      if (error.message?.includes('relation "shifts" does not exist')) {
        console.log('Shifts table not available in current database schema');
        return apiSuccess([]);
      }
      return apiError('Failed to fetch shifts', 'DB_FETCH_FAILED', 500);
    }

    return apiSuccess(shifts || []);
  } catch (e: any) {
    console.error('Error in GET /api/shifts:', e);
    return apiError(e.message || 'An unknown error occurred', 'INTERNAL_SERVER_ERROR', 500);
  }
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  try {
    const body = await request.json();
    
    // Check if shifts table exists by trying a simple query
    const { error: tableCheckError } = await supabase
      .from('shifts')
      .select('id')
      .limit(1);
    
    if (tableCheckError && tableCheckError.message?.includes('relation "shifts" does not exist')) {
      return apiError('Shifts table not available in current database schema. Please create the shifts table first.', 'TABLE_NOT_FOUND', 503);
    }
    
    const {
      staff_id,
      role_label,
      start_at,
      end_at,
      color,
      notes,
      recurrence
    } = body;

    // Get current camp_id
    const { data: campData, error: campError } = await supabase
      .from('camps')
      .select('id')
      .eq('is_active', true)
      .single();

    if (campError || !campData) {
      return apiError('Camp not found', 'CAMP_NOT_FOUND', 404);
    }

    const campId = campData.id;

    // Validate required fields
    if (!staff_id || !role_label || !start_at || !end_at) {
      return apiError('Missing required fields: staff_id, role_label, start_at, end_at', 'INVALID_INPUT', 400);
    }

    // Validate staff is active
    const { data: staffData, error: staffError } = await supabase
      .from('staff')
      .select('is_active, labels, name, staff_id')
      .eq('id', staff_id)
      .eq('camp_id', campId)
      .maybeSingle();

    if (staffError || !staffData) {
      console.error('Staff validation error:', staffError);
      return apiError('Staff not found', 'STAFF_NOT_FOUND', 404);
    }

    if (!staffData.is_active) {
      return apiError('Staff is inactive and cannot be assigned', 'STAFF_INACTIVE', 400);
    }

    // Check for time conflicts
    const { data: conflictingShifts, error: conflictError } = await supabase
      .from('shifts')
      .select('id, shift_id')
      .eq('staff_id', staff_id)
      .eq('is_active', true)
      .or(`and(start_at.lt.${end_at},end_at.gt.${start_at})`);

    if (conflictError) {
      console.error('Error checking conflicts:', conflictError);
    } else if (conflictingShifts && conflictingShifts.length > 0) {
      return apiError('Conflict: Overlap with existing shift', 'SHIFT_CONFLICT', 409);
    }

    // Validate no overnight shifts
    const startDate = new Date(start_at).toDateString();
    const endDate = new Date(end_at).toDateString();
    if (startDate !== endDate) {
      return apiError('Shifts cannot span across midnight', 'INVALID_SHIFT_TIME', 400);
    }

    // Generate shift_id
    const shiftId = `H-${Math.random().toString(36).substr(2, 10).toUpperCase()}`;

    // Create shift data
    const shiftData = {
      shift_id: shiftId,
      camp_id: campId,
      staff_id,
      role_label,
      start_at,
      end_at,
      color: color || null,
      notes: notes || null,
      is_active: true,
      created_by: null // TODO: Get from auth context
    };

    // Handle recurrence
    if (recurrence && recurrence.frequency !== 'none') {
        // ... (recurrence logic remains complex and out of scope for this refactor)
        return apiError('Recurrence creation not fully refactored yet.', 'NOT_IMPLEMENTED', 501);
    } else {
      // Create single shift
      const { data: newShift, error: insertError } = await supabase
        .from('shifts')
        .insert(shiftData)
        .select()
        .single();

      if (insertError) {
        console.error('Error creating shift:', insertError);
        return apiError('Failed to create shift', 'DB_INSERT_FAILED', 500);
      }

      return apiSuccess({ message: `Shift created: ${shiftId}`, shift: newShift }, 201);
    }
  } catch (e: any) {
    console.error('Error in POST /api/shifts:', e);
    return apiError(e.message || 'An unknown error occurred', 'INTERNAL_SERVER_ERROR', 500);
  }
}