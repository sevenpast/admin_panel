import { NextRequest } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { apiSuccess, apiError, ERROR_CODES, serverError } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  try {
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

    // For now, return existing lessons as potential templates since is_template column doesn't exist yet
    // TODO: Implement proper template querying once database schema is updated
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
        )
      `)
      .eq('camp_id', campId)
      .order('title', { ascending: true })
      .limit(10) // Limit to 10 recent lessons as potential templates

    if (error) {
      console.error('Error fetching lessons (as templates):', error)
      return apiError('Failed to fetch lesson templates', ERROR_CODES.DATABASE_ERROR, 500)
    }

    // Transform lessons to look like templates
    const templates = (data || []).map(lesson => ({
      ...lesson,
      is_template: true,
      template_name: lesson.title + ' Template'
    }))

    return apiSuccess(templates)
  } catch (error: any) {
    console.error('Error fetching lesson templates:', error)
    return serverError(error.message)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lesson_id, template_name } = body

    if (!lesson_id) {
      return apiError('Lesson ID is required', ERROR_CODES.MISSING_REQUIRED_FIELD, 400)
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

    // Check if lesson exists first
    const { data: existingLesson, error: checkError } = await supabase
      .from('lessons')
      .select('id, title')
      .eq('id', lesson_id)
      .eq('camp_id', campId)
      .single()

    if (checkError || !existingLesson) {
      console.error('Lesson not found:', checkError)
      return apiError('Lesson not found', ERROR_CODES.NOT_FOUND, 404)
    }

    // For now, since we don't have is_template columns yet, return success with the lesson
    // TODO: Implement proper template storage once database schema is updated
    console.log('Template functionality not yet implemented in database schema')

    const data = {
      id: existingLesson.id,
      title: existingLesson.title,
      is_template: true,
      template_name: template_name || existingLesson.title + ' Template'
    }

    return apiSuccess(data)
  } catch (error: any) {
    console.error('Error creating lesson template:', error)
    return serverError(error.message)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lesson_id = searchParams.get('lesson_id')

    if (!lesson_id) {
      return apiError('Lesson ID is required', ERROR_CODES.MISSING_REQUIRED_FIELD, 400)
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

    // Remove template status from lesson
    const { data, error } = await supabase
      .from('lessons')
      .update({
        is_template: false,
        template_name: null
      })
      .eq('id', lesson_id)
      .eq('camp_id', campId)
      .select()
      .single()

    if (error) {
      console.error('Error removing lesson template:', error)
      return apiError('Failed to remove lesson template', ERROR_CODES.DATABASE_ERROR, 500)
    }

    return apiSuccess(data)
  } catch (error: any) {
    console.error('Error removing lesson template:', error)
    return serverError(error.message)
  }
}