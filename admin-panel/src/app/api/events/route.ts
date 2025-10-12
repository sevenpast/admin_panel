import { NextRequest } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase-server';
import { apiSuccess, apiError, ERROR_CODES, serverError } from '@/lib/api-helpers';

// GET - Fetch all events
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServiceClient();
  try {
    console.log('Fetching events from database...');
    
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
      return apiError('Failed to fetch events', ERROR_CODES.DATABASE_ERROR, 500);
    }

    console.log('Successfully fetched events:', events?.length || 0);
    return apiSuccess(events || []);
  } catch (e: any) {
    console.error('Error in GET /api/events:', e);
    return apiError(e.message || 'An unknown error occurred', ERROR_CODES.INTERNAL_SERVER_ERROR, 500);
  }
}

// POST - Create new event
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServiceClient();
  try {
    const body = await request.json();

    const { data: event, error } = await supabase
      .from('events')
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('Error creating event:', error);
      return apiError('Failed to create event', ERROR_CODES.DATABASE_ERROR, 500);
    }

    return apiSuccess(event, 201);
  } catch (e: any) {
    console.error('Error in POST /api/events:', e);
    return apiError(e.message || 'An unknown error occurred', ERROR_CODES.INTERNAL_SERVER_ERROR, 500);
  }
}

// PUT - Update event
export async function PUT(request: NextRequest) {
  const supabase = await createSupabaseServiceClient();
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return apiError('Event ID is required', ERROR_CODES.MISSING_REQUIRED_FIELD, 400);
    }

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
    console.error('Error in PUT /api/events:', e);
    return apiError(e.message || 'An unknown error occurred', ERROR_CODES.INTERNAL_SERVER_ERROR, 500);
  }
}

// DELETE - Delete event(s)
export async function DELETE(request: NextRequest) {
  const supabase = await createSupabaseServiceClient();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const bulkIds = searchParams.get('bulk_ids');

    // Handle bulk delete by IDs (multi-select)
    if (bulkIds) {
      try {
        const ids = JSON.parse(bulkIds);
        
        if (!Array.isArray(ids) || ids.length === 0) {
          return apiError('Invalid event IDs array', ERROR_CODES.INVALID_INPUT, 400);
        }

        console.log(`Bulk deleting ${ids.length} events by IDs:`, ids);

        const { error: deleteError } = await supabase
          .from('events')
          .delete()
          .in('id', ids);

        if (deleteError) {
          console.error('Error bulk deleting events by IDs:', deleteError);
          return apiError('Failed to delete events', ERROR_CODES.DATABASE_ERROR, 500);
        }

        console.log(`Successfully deleted ${ids.length} events by IDs`);
        return apiSuccess({ 
          deletedCount: ids.length,
          message: `Successfully deleted ${ids.length} events`
        });
      } catch (parseError: any) {
        console.error('Error parsing event IDs:', parseError);
        return apiError('Invalid event IDs format', ERROR_CODES.INVALID_FORMAT, 400);
      }
    }

    // Handle single delete
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
    console.error('Error in DELETE /api/events:', e);
    return apiError(e.message || 'An unknown error occurred', ERROR_CODES.INTERNAL_SERVER_ERROR, 500);
  }
}
