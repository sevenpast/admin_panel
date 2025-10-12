import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { apiSuccess, apiError } from '@/lib/api-helpers';

export async function GET() {
  const supabase = createClient();
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

    // Get staff for the camp
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('camp_id', campId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching staff:', error);
      return apiError(error.message, 'DB_FETCH_FAILED', 500);
    }

    return apiSuccess(data || []);
  } catch (e: any) {
    console.error('Error in GET /api/staff:', e);
    return apiError(e.message || 'An unknown error occurred', 'INTERNAL_SERVER_ERROR', 500);
  }
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
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

    // Generate staff_id
    const staffId = `S-${Math.random().toString(36).substr(2, 10).toUpperCase()}`;
    
    const staffData = {
      ...body,
      staff_id: staffId,
      camp_id: campId,
      labels: body.labels || [],
      color: body.color || null
    };

    const { data, error } = await supabase
      .from('staff')
      .insert([staffData])
      .select()
      .single();

    if (error) {
      console.error('Error creating staff:', error);
       // If color field doesn't exist, try without it
      if (error.message?.includes('column "color" does not exist')) {
        const { color, ...staffDataWithoutColor } = staffData;
        const { data: retryData, error: retryError } = await supabase
          .from('staff')
          .insert([staffDataWithoutColor])
          .select()
          .single();
        
        if (retryError) {
          console.error('Error creating staff (retry):', retryError);
          return apiError(retryError.message, 'DB_INSERT_FAILED', 500);
        }
        return apiSuccess(retryData, 201);
      }
      return apiError(error.message, 'DB_INSERT_FAILED', 500);
    }

    return apiSuccess(data, 201);
  } catch (e: any) {
    console.error('Error in POST /api/staff:', e);
    return apiError(e.message || 'An unknown error occurred', 'INTERNAL_SERVER_ERROR', 500);
  }
}

export async function PUT(request: NextRequest) {
  const supabase = createClient();
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return apiError('Staff ID is required', 'MISSING_ID', 400);
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
      .from('staff')
      .update(updates)
      .eq('id', id)
      .eq('camp_id', campId)
      .select()
      .single();

    if (error) {
      console.error('Error updating staff:', error);
      // If color field doesn't exist, try without it
      if (error.message?.includes('column "color" does not exist')) {
        const { color, ...updatesWithoutColor } = updates;
        const { data: retryData, error: retryError } = await supabase
          .from('staff')
          .update(updatesWithoutColor)
          .eq('id', id)
          .eq('camp_id', campId)
          .select()
          .single();
        
        if (retryError) {
          console.error('Error updating staff (retry):', retryError);
          return apiError(retryError.message, 'DB_UPDATE_FAILED', 500);
        }
        return apiSuccess(retryData);
      }
      return apiError(error.message, 'DB_UPDATE_FAILED', 500);
    }

    return apiSuccess(data);
  } catch (e: any) {
    console.error('Error in PUT /api/staff:', e);
    return apiError(e.message || 'An unknown error occurred', 'INTERNAL_SERVER_ERROR', 500);
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = createClient();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return apiError('Staff ID is required', 'MISSING_ID', 400);
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
      .from('staff')
      .delete()
      .eq('id', id)
      .eq('camp_id', campId);

    if (error) {
      console.error('Error deleting staff:', error);
      return apiError(error.message, 'DB_DELETE_FAILED', 500);
    }

    return apiSuccess({ message: 'Staff member deleted successfully' });
  } catch (e: any) {
    console.error('Error in DELETE /api/staff:', e);
    return apiError(e.message || 'An unknown error occurred', 'INTERNAL_SERVER_ERROR', 500);
  }
}