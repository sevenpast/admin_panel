import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { databaseService } from '@/lib/database-service'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// GET - Fetch assessment answers for a guest
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const guestId = searchParams.get('guest_id')
    
    const campId = await databaseService.getCurrentCampId()

    if (!guestId) {
      // If no guest_id provided, return empty array (for loading assessment questions)
      return NextResponse.json([])
    }

    const { data, error } = await supabase
      .from('guest_assessments')
      .select(`
        *,
        assessment_questions (
          id,
          question_text,
          category,
          scale_labels,
          is_required
        )
      `)
      .eq('camp_id', campId)
      .eq('guest_id', guestId)

    if (error) {
      console.error('Error fetching guest assessments:', error)
      return NextResponse.json({ error: 'Failed to fetch assessments' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in GET /api/guest-assessments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Save assessment answers for a guest
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { guest_id, answers } = body

    if (!guest_id || !answers) {
      return NextResponse.json({ error: 'Guest ID and answers are required' }, { status: 400 })
    }

    const campId = await databaseService.getCurrentCampId()

    // Prepare data for batch insert/update
    const assessmentData = answers.map((answer: any) => ({
      camp_id: campId,
      guest_id: guest_id,
      question_id: answer.question_id,
      answer_value: answer.answer_value,
      answered_at: new Date().toISOString()
    }))

    // Use upsert to handle both insert and update
    const { data, error } = await supabase
      .from('guest_assessments')
      .upsert(assessmentData, {
        onConflict: 'guest_id,question_id'
      })
      .select()

    if (error) {
      console.error('Error saving guest assessments:', error)
      return NextResponse.json({ error: 'Failed to save assessments' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in POST /api/guest-assessments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
