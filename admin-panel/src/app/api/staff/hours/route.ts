import { NextRequest } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/service';
import { apiSuccess, apiError } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  const supabase = createServiceRoleClient();
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const staffId = searchParams.get('staff_id');

    // Get current camp_id
    let campId: string;
    
    const { data: camps, error: campsError } = await supabase
      .from('camps')
      .select('id')
      .limit(1)
      .single();

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
        .single();

      if (createError || !newCamp) {
        console.error('Failed to create default camp:', createError);
        return apiError('Failed to create default camp', 'CAMP_CREATION_FAILED', 500);
      }
      campId = newCamp.id;
    } else {
      campId = camps.id;
    }

    // Build query for shifts
    let shiftsQuery = supabase
      .from('shifts')
      .select(`
        id,
        staff_id,
        start_at,
        end_at,
        role_label,
        staff:staff_id (
          id,
          staff_id,
          name,
          labels,
          is_active
        )
      `)
      .eq('camp_id', campId)
      .eq('is_active', true);

    // Apply date filters
    if (from) {
      shiftsQuery = shiftsQuery.gte('start_at', from);
    }
    if (to) {
      shiftsQuery = shiftsQuery.lte('start_at', to);
    }
    if (staffId) {
      shiftsQuery = shiftsQuery.eq('staff_id', staffId);
    }

    const { data: shifts, error: shiftsError } = await shiftsQuery;

    if (shiftsError) {
      console.error('Error fetching shifts:', shiftsError);
      return apiError(shiftsError.message, 'DB_FETCH_FAILED', 500);
    }

    // Generate consistent color for each staff member based on their ID
    const generateStaffColor = (staffId: string) => {
      let hash = 0;
      for (let i = 0; i < staffId.length; i++) {
        hash = staffId.charCodeAt(i) + ((hash << 5) - hash);
      }
      let color = '#';
      for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substr(-2);
      }
      return color;
    };

    // Calculate hours for each staff member
    const staffHoursMap = new Map();

    shifts?.forEach(shift => {
      if (!shift.staff) return;

      const staffId = shift.staff.id;
      const startTime = new Date(shift.start_at);
      const endTime = new Date(shift.end_at);
      const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

      if (!staffHoursMap.has(staffId)) {
        staffHoursMap.set(staffId, {
          staff: {
            ...shift.staff,
            color: generateStaffColor(shift.staff.id)
          },
          totalHours: 0,
          shifts: [],
          roles: new Set()
        });
      }

      const staffData = staffHoursMap.get(staffId);
      staffData.totalHours += hours;
      staffData.shifts.push({
        id: shift.id,
        start_at: shift.start_at,
        end_at: shift.end_at,
        role_label: shift.role_label,
        hours: hours
      });
      staffData.roles.add(shift.role_label);
    });

    // Convert to array and format
    const staffHours = Array.from(staffHoursMap.values()).map(data => ({
      staff_id: data.staff.staff_id,
      name: data.staff.name,
      color: data.staff.color,
      labels: data.staff.labels,
      is_active: data.staff.is_active,
      totalHours: Math.round(data.totalHours * 100) / 100, // Round to 2 decimal places
      shiftCount: data.shifts.length,
      roles: Array.from(data.roles),
      shifts: data.shifts.sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
    }));

    // Sort by total hours (descending)
    staffHours.sort((a, b) => b.totalHours - a.totalHours);

    // Calculate summary statistics
    const totalHours = staffHours.reduce((sum, staff) => sum + staff.totalHours, 0);
    const totalShifts = staffHours.reduce((sum, staff) => sum + staff.shiftCount, 0);
    const averageHoursPerStaff = staffHours.length > 0 ? totalHours / staffHours.length : 0;

    const summary = {
      totalStaff: staffHours.length,
      totalHours: Math.round(totalHours * 100) / 100,
      totalShifts,
      averageHoursPerStaff: Math.round(averageHoursPerStaff * 100) / 100,
      period: {
        from: from || null,
        to: to || null
      }
    };

    return apiSuccess({
      summary,
      staffHours
    });

  } catch (e: any) {
    console.error('Error in GET /api/staff/hours:', e);
    return apiError(e.message || 'An unknown error occurred', 'INTERNAL_SERVER_ERROR', 500);
  }
}
