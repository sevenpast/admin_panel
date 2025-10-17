import { NextRequest } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { apiSuccess, apiError, ERROR_CODES, serverError } from '@/lib/api-helpers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lessonId, staffIds } = body

    if (!lessonId) {
      return apiError('Lesson ID is required', ERROR_CODES.MISSING_REQUIRED_FIELD, 400)
    }

    if (!Array.isArray(staffIds)) {
      return apiError('Staff IDs must be an array', ERROR_CODES.INVALID_INPUT, 400)
    }

    const supabase = createServiceRoleClient()

    // Get current camp ID
    const { data: campData, error: campError } = await supabase
      .from('camps')
      .select('id')
      .eq('is_active', true)
      .single()

    if (campError || !campData) {
      return apiError('No camp ID available', ERROR_CODES.INTERNAL_SERVER_ERROR, 500)
    }
    const campId = campData.id

    // Remove existing instructors for this lesson
    const { error: deleteError } = await supabase
      .from('lesson_instructors')
      .delete()
      .eq('lesson_id', lessonId)
      .eq('camp_id', campId)

    if (deleteError) {
      console.error('Error removing existing instructors:', deleteError)
      return apiError('Failed to remove existing instructors', ERROR_CODES.DATABASE_ERROR, 500)
    }

    // Add new instructors
    if (staffIds.length > 0) {
      const instructorAssignments = staffIds.map((staffId: string) => ({
        lesson_id: lessonId,
        staff_id: staffId,
        camp_id: campId
      }))

      const { error: insertError } = await supabase
        .from('lesson_instructors')
        .insert(instructorAssignments)

      if (insertError) {
        console.error('Error assigning instructors:', insertError)
        return apiError('Failed to assign instructors', ERROR_CODES.DATABASE_ERROR, 500)
      }
    }

    return apiSuccess({ message: 'Instructors assigned successfully' })
  } catch (error: any) {
    console.error('Error assigning instructors:', error)
    return serverError(error.message)
  }
}





