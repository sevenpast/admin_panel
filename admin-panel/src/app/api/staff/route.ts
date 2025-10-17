import { NextRequest } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/service';
import { apiSuccess, apiError } from '@/lib/api-helpers';

export async function GET() {
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

    // Transform labels to roles and is_active to status for frontend compatibility
    const transformedData = (data || []).map(staff => ({
      ...staff,
      roles: staff.labels || [],
      status: staff.is_active ? 'active' : 'inactive',
      color: staff.color || generateStaffColor(staff.id)
    }));

    return apiSuccess(transformedData);
  } catch (e: any) {
    console.error('Error in GET /api/staff:', e);
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

    // Generate S-XXXXXXXXXX staff_id
    const generateStaffId = (): string => {
      const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      let result = 'S-'
      for (let i = 0; i < 10; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return result
    }

    const staffId = generateStaffId();

    // Validate required fields
    if (!body.name?.trim()) {
      return apiError('Name is required', 'VALIDATION_ERROR', 400);
    }

    // Validate status (convert to is_active for database)
    if (body.status && !['active', 'inactive'].includes(body.status)) {
      return apiError('Invalid status. Must be active or inactive', 'VALIDATION_ERROR', 400);
    }

    // Validate labels
    const validLabels = ['host', 'teacher', 'instructor', 'kitchen', 'maintenance', 'other'];
    const labels = body.roles || body.labels || [];
    if (labels.some((label: string) => !validLabels.includes(label))) {
      return apiError('Invalid label. Must be one of: host, teacher, instructor, kitchen, maintenance, other', 'VALIDATION_ERROR', 400);
    }

    // Validate mobile number format (basic E.164 check)
    if (body.mobile_number && !/^\+?[1-9]\d{1,14}$/.test(body.mobile_number.replace(/\s/g, ''))) {
      return apiError('Invalid mobile number format', 'VALIDATION_ERROR', 400);
    }

    // Validate image URL
    if (body.image_url && !/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(body.image_url)) {
      return apiError('Invalid image URL format', 'VALIDATION_ERROR', 400);
    }

    const staffData = {
      staff_id: staffId,
      camp_id: campId,
      name: body.name.trim(),
      mobile_number: body.mobile_number || null,
      is_active: body.status === 'active' || body.status === undefined,
      image_url: body.image_url || null,
      description: body.description || null,
      labels: labels
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
        // Transform labels to roles and is_active to status for frontend compatibility
        const transformedRetryData = {
          ...retryData,
          roles: retryData.labels || [],
          status: retryData.is_active ? 'active' : 'inactive'
        };
        return apiSuccess(transformedRetryData, 201);
      }
      return apiError(error.message, 'DB_INSERT_FAILED', 500);
    }

    // Transform labels to roles and is_active to status for frontend compatibility
    const transformedData = {
      ...data,
      roles: data.labels || [],
      status: data.is_active ? 'active' : 'inactive'
    };
    return apiSuccess(transformedData, 201);
  } catch (e: any) {
    console.error('Error in POST /api/staff:', e);
    return apiError(e.message || 'An unknown error occurred', 'INTERNAL_SERVER_ERROR', 500);
  }
}

export async function PUT(request: NextRequest) {
  const supabase = createServiceRoleClient();
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return apiError('Staff ID is required', 'MISSING_ID', 400);
    }

    // Map roles to labels if present
    if (updates.roles) {
      updates.labels = updates.roles;
      delete updates.roles;
    }

    // Validate required fields
    if (updates.name !== undefined && !updates.name?.trim()) {
      return apiError('Name is required', 'VALIDATION_ERROR', 400);
    }

    // Validate status and convert to is_active
    if (updates.status && !['active', 'inactive'].includes(updates.status)) {
      return apiError('Invalid status. Must be active or inactive', 'VALIDATION_ERROR', 400);
    }

    // Convert status to is_active for database
    if (updates.status) {
      updates.is_active = updates.status === 'active';
      delete updates.status;
    }

    // Validate labels
    if (updates.labels) {
      const validLabels = ['host', 'teacher', 'instructor', 'kitchen', 'maintenance', 'other'];
      if (updates.labels.some((label: string) => !validLabels.includes(label))) {
        return apiError('Invalid label. Must be one of: host, teacher, instructor, kitchen, maintenance, other', 'VALIDATION_ERROR', 400);
      }
    }

    // Validate mobile number format
    if (updates.mobile_number && !/^\+?[1-9]\d{1,14}$/.test(updates.mobile_number.replace(/\s/g, ''))) {
      return apiError('Invalid mobile number format', 'VALIDATION_ERROR', 400);
    }

    // Validate image URL
    if (updates.image_url && !/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(updates.image_url)) {
      return apiError('Invalid image URL format', 'VALIDATION_ERROR', 400);
    }

    // Trim name if present
    if (updates.name) {
      updates.name = updates.name.trim();
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
        // Transform labels to roles and is_active to status for frontend compatibility
        const transformedRetryData = {
          ...retryData,
          roles: retryData.labels || [],
          status: retryData.is_active ? 'active' : 'inactive'
        };
        return apiSuccess(transformedRetryData);
      }
      return apiError(error.message, 'DB_UPDATE_FAILED', 500);
    }

    // Transform labels to roles and is_active to status for frontend compatibility
    const transformedData = {
      ...data,
      roles: data.labels || [],
      status: data.is_active ? 'active' : 'inactive'
    };
    return apiSuccess(transformedData);
  } catch (e: any) {
    console.error('Error in PUT /api/staff:', e);
    return apiError(e.message || 'An unknown error occurred', 'INTERNAL_SERVER_ERROR', 500);
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = createServiceRoleClient();
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