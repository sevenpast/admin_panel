import { NextRequest } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/service';
import { apiSuccess, apiError } from '@/lib/api-helpers';

export async function GET() {
  console.log('GET /api/guests called');
  const supabase = createServiceRoleClient();
  try {
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

    // Get guests for the camp with bed assignments
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
      .eq('camp_id', campId)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching guests:', error);
      return apiError(error.message, 'DB_FETCH_FAILED', 500);
    }

    return apiSuccess(data || []);
  } catch (e: any) {
    console.error('Error in GET /api/guests:', e);
    return apiError(e.message || 'An unknown error occurred', 'INTERNAL_SERVER_ERROR', 500);
  }
}

export async function POST(request: NextRequest) {
  const supabase = createServiceRoleClient();
  try {
    const body = await request.json();
    
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

    // Generate guest_id
    const guestId = `G-${Math.random().toString(36).substr(2, 10).toUpperCase()}`;
    
    const guestData = {
      ...body,
      guest_id: guestId,
      camp_id: campId,
      is_active: true
    };

    const { data, error } = await supabase
      .from('guests')
      .insert([guestData])
      .select()
      .single();

    if (error) {
      console.error('Error creating guest:', error);
      return apiError(error.message, 'DB_INSERT_FAILED', 500);
    }

    return apiSuccess(data, 201);
  } catch (e: any) {
    console.error('Error in POST /api/guests:', e);
    return apiError(e.message || 'An unknown error occurred', 'INTERNAL_SERVER_ERROR', 500);
  }
}

export async function PUT(request: NextRequest) {
  const supabase = createServiceRoleClient();
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
        return apiError('Guest ID is required', 'MISSING_ID', 400);
    }
    
    // Get current camp_id
    let campId: string;
    
    const { data: camps, error: campsError } = await supabase
      .from('camps')
      .select('id')
      .limit(1)
      .single();

    if (campsError || !camps) {
      return apiError('No camp found', 'CAMP_NOT_FOUND', 500);
    }
    campId = camps.id;

    const { data, error } = await supabase
      .from('guests')
      .update(updates)
      .eq('id', id)
      .eq('camp_id', campId)
      .select()
      .single();

    if (error) {
      console.error('Error updating guest:', error);
      return apiError(error.message, 'DB_UPDATE_FAILED', 500);
    }

    return apiSuccess(data);
  } catch (e: any) {
    console.error('Error in PUT /api/guests:', e);
    return apiError(e.message || 'An unknown error occurred', 'INTERNAL_SERVER_ERROR', 500);
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = createServiceRoleClient();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return apiError('Guest ID is required', 'MISSING_ID', 400);
    }

    // Get current camp_id
    let campId: string;
    
    const { data: camps, error: campsError } = await supabase
      .from('camps')
      .select('id')
      .limit(1)
      .single();

    if (campsError || !camps) {
      return apiError('No camp found', 'CAMP_NOT_FOUND', 500);
    }
    campId = camps.id;

    const { error } = await supabase
      .from('guests')
      .delete()
      .eq('id', id)
      .eq('camp_id', campId);

    if (error) {
      console.error('Error deleting guest:', error);
      return apiError(error.message, 'DB_DELETE_FAILED', 500);
    }

    return apiSuccess({ message: 'Guest deleted successfully' });
  } catch (e: any) {
    console.error('Error in DELETE /api/guests:', e);
    return apiError(e.message || 'An unknown error occurred', 'INTERNAL_SERVER_ERROR', 500);
  }
}