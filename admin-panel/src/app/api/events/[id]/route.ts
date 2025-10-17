import { NextRequest } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/service';
import { apiSuccess, apiError, ERROR_CODES, serverError } from '@/lib/api-helpers';

// GET - Fetch single event by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServiceRoleClient();
  try {
    const { id } = await params;

    if (!id) {
      return apiError('Event ID is required', ERROR_CODES.MISSING_REQUIRED_FIELD, 400);
    }

    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching event:', error);
      return apiError('Failed to fetch event', ERROR_CODES.DATABASE_ERROR, 500);
    }

    if (!event) {
      return apiError('Event not found', ERROR_CODES.NOT_FOUND, 404);
    }

    return apiSuccess(event);
  } catch (e: any) {
    console.error('Error in GET /api/events/[id]:', e);
    return apiError(e.message || 'An unknown error occurred', ERROR_CODES.INTERNAL_SERVER_ERROR, 500);
  }
}

// PUT - Update event by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServiceRoleClient();
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return apiError('Event ID is required', ERROR_CODES.MISSING_REQUIRED_FIELD, 400);
    }

    // Remove id from update data if it exists
    const { id: bodyId, ...updateData } = body;

    const { data: event, error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating event:', error);
      return apiError('Failed to update event', ERROR_CODES.DATABASE_ERROR, 500);
    }

    return apiSuccess(event);
  } catch (e: any) {
    console.error('Error in PUT /api/events/[id]:', e);
    return apiError(e.message || 'An unknown error occurred', ERROR_CODES.INTERNAL_SERVER_ERROR, 500);
  }
}

// DELETE - Delete event by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServiceRoleClient();
  try {
    const { id } = await params;

    if (!id) {
      return apiError('Event ID is required', ERROR_CODES.MISSING_REQUIRED_FIELD, 400);
    }

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting event:', error);
      return apiError('Failed to delete event', ERROR_CODES.DATABASE_ERROR, 500);
    }

    return apiSuccess({ message: 'Event deleted successfully' });
  } catch (e: any) {
    console.error('Error in DELETE /api/events/[id]:', e);
    return apiError(e.message || 'An unknown error occurred', ERROR_CODES.INTERNAL_SERVER_ERROR, 500);
  }
}