import { NextRequest } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { apiSuccess, apiError, ERROR_CODES, serverError } from '@/lib/api-helpers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { template_id, lesson_date, start_time, end_time } = body

    if (!template_id || !lesson_date || !start_time || !end_time) {
      return apiError('Template ID, lesson date, start time, and end time are required', ERROR_CODES.MISSING_REQUIRED_FIELD, 400)
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

    // Get template lesson
    const { data: template, error: templateError } = await supabase
      .from('lessons')
      .select(`
        *,
        lesson_instructors (
          staff_id
        )
      `)
      .eq('id', template_id)
      .eq('camp_id', campId)
      .eq('is_template', true)
      .single()

    if (templateError || !template) {
      return apiError('Template not found', ERROR_CODES.NOT_FOUND, 404)
    }

    // Generate new lesson ID
    const lessonId = `L-${Math.random().toString(36).substr(2, 10).toUpperCase()}`

    // Create new lesson from template
    const newLessonData = {
      lesson_id: lessonId,
      camp_id: campId,
      title: template.title,
      category: template.category,
      location: template.location,
      start_at: `${lesson_date}T${start_time}:00.000Z`,
      end_at: `${lesson_date}T${end_time}:00.000Z`,
      description: template.description,
      max_participants: template.max_participants,
      status: 'draft', // Always start as draft
      is_template: false, // This is a real lesson, not a template
      created_by: template.created_by
    }

    const { data: newLesson, error: lessonError } = await supabase
      .from('lessons')
      .insert([newLessonData])
      .select()
      .single()

    if (lessonError) {
      console.error('Error creating lesson from template:', lessonError)
      return apiError('Failed to create lesson from template', ERROR_CODES.DATABASE_ERROR, 500)
    }

    // Copy instructor assignments from template
    if (template.lesson_instructors && template.lesson_instructors.length > 0) {
      const instructorAssignments = template.lesson_instructors.map((instructor: any) => ({
        camp_id: campId,
        lesson_id: newLesson.id,
        staff_id: instructor.staff_id,
        assigned_at: new Date().toISOString()
      }))

      const { error: instructorError } = await supabase
        .from('lesson_instructors')
        .insert(instructorAssignments)

      if (instructorError) {
        console.error('Error copying instructors from template:', instructorError)
        // Don't fail the whole operation for instructor assignment errors
      }
    }

    return apiSuccess(newLesson)
  } catch (error: any) {
    console.error('Error creating lesson from template:', error)
    return serverError(error.message)
  }
}