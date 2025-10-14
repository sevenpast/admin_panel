import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { databaseService } from '@/lib/database-service'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lessonId, staffIds } = body
    
    if (!lessonId) {
      return NextResponse.json({ error: 'Lesson ID is required' }, { status: 400 })
    }

    if (!Array.isArray(staffIds)) {
      return NextResponse.json({ error: 'Staff IDs must be an array' }, { status: 400 })
    }

    // Get current camp ID
    const campId = await databaseService.getCurrentCampId()
    if (!campId) {
      return NextResponse.json({ error: 'No camp ID available' }, { status: 500 })
    }

    // Remove existing instructors for this lesson
    const { error: deleteError } = await supabase
      .from('lesson_instructors')
      .delete()
      .eq('lesson_id', lessonId)
      .eq('camp_id', campId)

    if (deleteError) {
      console.error('Error removing existing instructors:', deleteError)
      return NextResponse.json({ error: 'Failed to remove existing instructors' }, { status: 500 })
    }

    // Add new instructors
    if (staffIds.length > 0) {
      const instructorAssignments = staffIds.map(staffId => ({
        lesson_id: lessonId,
        staff_id: staffId,
        camp_id: campId
      }))

      const { error: insertError } = await supabase
        .from('lesson_instructors')
        .insert(instructorAssignments)

      if (insertError) {
        console.error('Error assigning instructors:', insertError)
        return NextResponse.json({ error: 'Failed to assign instructors' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error assigning instructors:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}





