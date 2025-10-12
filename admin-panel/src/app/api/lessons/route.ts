import { NextRequest } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { apiSuccess, apiError, ERROR_CODES, serverError } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    
    if (!date) {
      return apiError('Date parameter is required', ERROR_CODES.MISSING_REQUIRED_FIELD, 400)
    }

    // Get current camp ID using service role client
    const supabase = createServiceRoleClient()
    const { data: campData, error: campError } = await supabase
      .from('camps')
      .select('id')
      .eq('is_active', true)
      .single()

    if (campError || !campData) {
      return apiError('No camp ID available', ERROR_CODES.INTERNAL_SERVER_ERROR, 500)
    }
    const campId = campData.id

    // Get lessons for the specified date directly with service role client
    const { data, error } = await supabase
      .from('lessons')
      .select(`
        *,
        lesson_instructors (
          staff_id,
          staff:staff_id (
            name,
            labels
          )
        ),
        lesson_assignments (
          guest_id,
          guest:guest_id (
            name,
            guest_id
          )
        )
      `)
      .eq('camp_id', campId)
      .gte('start_at', `${date}T00:00:00.000Z`)
      .lt('start_at', `${date}T23:59:59.999Z`)
      .order('start_at', { ascending: true })

    if (error) {
      console.error('Error fetching lessons:', error)
      return apiError('Failed to fetch lessons', ERROR_CODES.DATABASE_ERROR, 500)
    }
    
    return apiSuccess(data || [])
  } catch (error: any) {
    console.error('Error fetching lessons:', error)
    return serverError(error.message)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Get current camp ID using service role client
    const supabase = createServiceRoleClient()
    const { data: campData, error: campError } = await supabase
      .from('camps')
      .select('id')
      .eq('is_active', true)
      .single()

    if (campError || !campData) {
      return apiError('No camp ID available', ERROR_CODES.INTERNAL_SERVER_ERROR, 500)
    }
    const campId = campData.id

    // Generate lesson_id
    const lessonId = `L-${Math.random().toString(36).substr(2, 10).toUpperCase()}`

    const lessonData = {
      ...body,
      camp_id: campId,
      lesson_id: lessonId
    }

    // Create lesson directly with service role client
    const { data, error } = await supabase
      .from('lessons')
      .insert([lessonData])
      .select()
      .single()

    if (error) {
      console.error('Error creating lesson:', error)
      return apiError('Failed to create lesson', ERROR_CODES.DATABASE_ERROR, 500)
    }

    return apiSuccess(data)
  } catch (error: any) {
    console.error('Error creating lesson:', error)
    return serverError(error.message)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return apiError('Lesson ID is required', ERROR_CODES.MISSING_REQUIRED_FIELD, 400)
    }

    const supabase = createServiceRoleClient()
    const { data, error } = await supabase
      .from('lessons')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating lesson:', error)
      return apiError('Failed to update lesson', ERROR_CODES.DATABASE_ERROR, 500)
    }

    return apiSuccess(data)
  } catch (error: any) {
    console.error('Error updating lesson:', error)
    return serverError(error.message)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const bulkIds = searchParams.get('bulk_ids')

    // Handle bulk delete by IDs (multi-select)
    if (bulkIds) {
      try {
        const ids = JSON.parse(bulkIds)
        
        if (!Array.isArray(ids) || ids.length === 0) {
          return apiError('Invalid lesson IDs array', ERROR_CODES.INVALID_INPUT, 400)
        }

        console.log(`Bulk deleting ${ids.length} lessons by IDs:`, ids)

        const { error: deleteError } = await supabase
          .from('lessons')
          .delete()
          .in('id', ids)

        if (deleteError) {
          console.error('Error bulk deleting lessons by IDs:', deleteError)
          return apiError('Failed to delete lessons', ERROR_CODES.DATABASE_ERROR, 500)
        }

        console.log(`Successfully deleted ${ids.length} lessons by IDs`)
        return apiSuccess({ 
          deletedCount: ids.length,
          message: `Successfully deleted ${ids.length} lessons`
        })
      } catch (parseError) {
        console.error('Error parsing lesson IDs:', parseError)
        return apiError('Invalid lesson IDs format', ERROR_CODES.INVALID_FORMAT, 400)
      }
    }

    // Handle single delete
    if (!id) {
      return apiError('Lesson ID is required', ERROR_CODES.MISSING_REQUIRED_FIELD, 400)
    }
    
    // Delete lesson directly with service role client
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting lesson:', error)
      return apiError('Failed to delete lesson', ERROR_CODES.DATABASE_ERROR, 500)
    }
    
    return apiSuccess({ message: 'Lesson deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting lesson:', error)
    return serverError(error.message)
  }
}