import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { databaseService } from '@/lib/database-service'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lessonId } = body
    
    if (!lessonId) {
      return NextResponse.json({ error: 'Lesson ID is required' }, { status: 400 })
    }

    // Get current camp ID
    const campId = await databaseService.getCurrentCampId()
    if (!campId) {
      return NextResponse.json({ error: 'No camp ID available' }, { status: 500 })
    }

    // Get original lesson
    const { data: originalLesson, error: fetchError } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .eq('camp_id', campId)
      .single()

    if (fetchError) {
      console.error('Error fetching original lesson:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch original lesson' }, { status: 500 })
    }

    // Generate new lesson_id
    const newLessonId = `L-${Math.random().toString(36).substr(2, 10).toUpperCase()}`

    // Create duplicate with modified title and draft status
    const duplicateData = {
      lesson_id: newLessonId,
      camp_id: campId,
      title: `${originalLesson.title} (Kopie)`,
      category: originalLesson.category,
      location: originalLesson.location,
      start_at: originalLesson.start_at,
      end_at: originalLesson.end_at,
      status: 'draft',
      alert_time: originalLesson.alert_time,
      alert_text: originalLesson.alert_text,
      description: originalLesson.description,
      max_participants: originalLesson.max_participants
    }

    const { data: newLesson, error: createError } = await supabase
      .from('lessons')
      .insert([duplicateData])
      .select()
      .single()

    if (createError) {
      console.error('Error creating duplicate lesson:', createError)
      return NextResponse.json({ error: 'Failed to create duplicate lesson' }, { status: 500 })
    }

    // Copy instructors from original lesson
    const { data: originalInstructors, error: instructorsError } = await supabase
      .from('lesson_instructors')
      .select('staff_id')
      .eq('lesson_id', lessonId)
      .eq('camp_id', campId)

    if (instructorsError) {
      console.error('Error fetching original instructors:', instructorsError)
    } else if (originalInstructors && originalInstructors.length > 0) {
      // Insert new instructor assignments
      const instructorAssignments = originalInstructors.map(instructor => ({
        lesson_id: newLesson.id,
        staff_id: instructor.staff_id,
        camp_id: campId
      }))

      const { error: insertInstructorsError } = await supabase
        .from('lesson_instructors')
        .insert(instructorAssignments)

      if (insertInstructorsError) {
        console.error('Error copying instructors:', insertInstructorsError)
      }
    }

    return NextResponse.json(newLesson)
  } catch (error) {
    console.error('Error duplicating lesson:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
