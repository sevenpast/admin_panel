import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function getCurrentCampId() {
  const { data: camps, error: campsError } = await supabase
    .from('camps')
    .select('id')
    .eq('is_active', true)
    .single()

  if (campsError || !camps) {
    const { data: newCamp, error: createError } = await supabase
      .from('camps')
      .insert([{ name: 'Default Camp', timezone: 'UTC', is_active: true }])
      .select('id')
      .single()
    if (createError || !newCamp) {
      throw new Error('Failed to create default camp')
    }
    return newCamp.id
  }
  return camps.id
}

export async function GET() {
  try {
    const campId = await getCurrentCampId()
    const { data, error } = await supabase
      .from('lesson_assignments')
      .select(`
        *,
        lessons (
          id,
          title,
          category,
          start_at,
          end_at
        ),
        guests (
          id,
          name,
          guest_id
        )
      `)
      .eq('camp_id', campId)
      .order('assigned_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const campId = await getCurrentCampId()
    const body = await request.json()

    const { lesson_id, guest_ids, assigned_by } = body

    // Validate required fields
    if (!lesson_id || !Array.isArray(guest_ids) || guest_ids.length === 0) {
      return NextResponse.json({ error: 'Lesson ID and guest IDs array are required' }, { status: 400 })
    }

    // Get lesson details
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('id, category, start_at, end_at')
      .eq('id', lesson_id)
      .single()

    if (lessonError || !lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    // Extract date from lesson start time
    const lessonDate = new Date(lesson.start_at).toISOString().split('T')[0]

    // Check for conflicts for each guest
    const conflicts = []
    for (const guest_id of guest_ids) {
      // Check if guest is active
      const { data: guest, error: guestError } = await supabase
        .from('guests')
        .select('id, is_active, in_surf_package')
        .eq('id', guest_id)
        .single()

      if (guestError || !guest) {
        conflicts.push({ guest_id, error: 'Guest not found' })
        continue
      }

      if (!guest.is_active) {
        conflicts.push({ guest_id, error: 'Guest is not active' })
        continue
      }

      if (!guest.in_surf_package) {
        conflicts.push({ guest_id, error: 'Guest is not in surf package' })
        continue
      }

      // Check if guest already has a lesson/theory of the same category on this date
      const { data: existingAssignments, error: existingError } = await supabase
        .from('lesson_assignments')
        .select(`
          id,
          lessons (
            category,
            start_at
          )
        `)
        .eq('guest_id', guest_id)
        .eq('camp_id', campId)

      if (existingError) {
        conflicts.push({ guest_id, error: existingError.message })
        continue
      }

      // Check for same-day conflicts by category
      const sameDayConflict = existingAssignments?.find(assignment => {
        const assignmentDate = new Date(assignment.lessons.start_at).toISOString().split('T')[0]
        return assignmentDate === lessonDate && assignment.lessons.category === lesson.category
      })

      if (sameDayConflict) {
        conflicts.push({
          guest_id,
          error: `Guest already has a ${lesson.category} on ${lessonDate}`,
          existing_lesson_id: sameDayConflict.id
        })
        continue
      }
    }

    // If there are conflicts, return them for frontend handling
    if (conflicts.length > 0) {
      return NextResponse.json({
        error: 'Assignment conflicts detected',
        conflicts,
        allow_override: true
      }, { status: 409 })
    }

    // Create assignments for all guests
    const assignments = guest_ids.map(guest_id => ({
      camp_id: campId,
      lesson_id,
      guest_id,
      assigned_at: new Date().toISOString(),
      assigned_by
    }))

    const { data: createdAssignments, error: assignmentError } = await supabase
      .from('lesson_assignments')
      .insert(assignments)
      .select(`
        *,
        lessons (
          id,
          title,
          category
        ),
        guests (
          id,
          name,
          guest_id
        )
      `)

    if (assignmentError) {
      return NextResponse.json({ error: assignmentError.message }, { status: 500 })
    }

    return NextResponse.json(createdAssignments, { status: 201 })
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assignment_id = searchParams.get('assignment_id')
    const lesson_id = searchParams.get('lesson_id')
    const guest_id = searchParams.get('guest_id')

    if (assignment_id) {
      // Delete specific assignment by ID
      const { error } = await supabase
        .from('lesson_assignments')
        .delete()
        .eq('id', assignment_id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    } else if (lesson_id && guest_id) {
      // Delete assignment by lesson_id and guest_id
      const { error } = await supabase
        .from('lesson_assignments')
        .delete()
        .eq('lesson_id', lesson_id)
        .eq('guest_id', guest_id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    } else {
      return NextResponse.json({ error: 'Either assignment_id or both lesson_id and guest_id are required' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT method for overriding conflicts (when user confirms they want to move guest from one lesson to another)
export async function PUT(request: NextRequest) {
  try {
    const campId = await getCurrentCampId()
    const body = await request.json()

    const { lesson_id, guest_id, override_conflicts, assigned_by } = body

    if (!lesson_id || !guest_id) {
      return NextResponse.json({ error: 'Lesson ID and guest ID are required' }, { status: 400 })
    }

    if (override_conflicts) {
      // Get lesson details
      const { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .select('id, category, start_at')
        .eq('id', lesson_id)
        .single()

      if (lessonError || !lesson) {
        return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
      }

      const lessonDate = new Date(lesson.start_at).toISOString().split('T')[0]

      // Remove existing assignments for same category on same date
      const { error: removeError } = await supabase
        .from('lesson_assignments')
        .delete()
        .eq('guest_id', guest_id)
        .eq('camp_id', campId)
        .in('lesson_id',
          await supabase
            .from('lessons')
            .select('id')
            .eq('category', lesson.category)
            .gte('start_at', `${lessonDate}T00:00:00.000Z`)
            .lt('start_at', `${lessonDate}T23:59:59.999Z`)
            .then(result => result.data?.map(l => l.id) || [])
        )

      if (removeError) {
        console.error('Error removing conflicting assignments:', removeError)
      }

      // Create new assignment
      const { data: assignment, error: assignmentError } = await supabase
        .from('lesson_assignments')
        .insert({
          camp_id: campId,
          lesson_id,
          guest_id,
          assigned_at: new Date().toISOString(),
          assigned_by
        })
        .select(`
          *,
          lessons (
            id,
            title,
            category
          ),
          guests (
            id,
            name,
            guest_id
          )
        `)
        .single()

      if (assignmentError) {
        return NextResponse.json({ error: assignmentError.message }, { status: 500 })
      }

      return NextResponse.json(assignment, { status: 201 })
    }

    return NextResponse.json({ error: 'Override conflicts flag is required for PUT method' }, { status: 400 })
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}