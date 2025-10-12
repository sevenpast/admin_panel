import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { databaseService } from '@/lib/database-service'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Get current camp_id
    const campId = await databaseService.getCurrentCampId()
    
    // Validate and set default category (enum values are lowercase)
    const validCategories = ['experience', 'safety', 'preferences', 'goals']
    const category = validCategories.includes(body.category?.toLowerCase()) ? body.category.toLowerCase() : 'experience'
    
    const questionData = {
      ...body,
      camp_id: campId,
      category: category
      // Don't set id - let the database generate UUID automatically
    }

    const { data, error } = await supabase
      .from('assessment_questions')
      .insert([questionData])
      .select()
      .single()

    if (error) {
      console.error('Error creating assessment question:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in assessment questions POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const campId = await databaseService.getCurrentCampId()
    
    const { data, error } = await supabase
      .from('assessment_questions')
      .select('*')
      .eq('camp_id', campId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching assessment questions:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error in assessment questions GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body
    
    const campId = await databaseService.getCurrentCampId()

    // Validate category if provided (enum values are lowercase)
    if (updateData.category) {
      const validCategories = ['experience', 'safety', 'preferences', 'goals']
      if (!validCategories.includes(updateData.category.toLowerCase())) {
        updateData.category = 'experience'
      } else {
        updateData.category = updateData.category.toLowerCase()
      }
    }

    const { data, error } = await supabase
      .from('assessment_questions')
      .update(updateData)
      .eq('id', id)
      .eq('camp_id', campId)
      .select()
      .single()

    if (error) {
      console.error('Error updating assessment question:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in assessment questions PUT:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const campId = await databaseService.getCurrentCampId()

    const { error } = await supabase
      .from('assessment_questions')
      .delete()
      .eq('id', id)
      .eq('camp_id', campId)

    if (error) {
      console.error('Error deleting assessment question:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in assessment questions DELETE:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}