import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient()
    const { searchParams } = new URL(request.url)
    const mealId = searchParams.get('meal_id')
    const mealType = searchParams.get('meal_type')
    const date = searchParams.get('date')

    let query = supabase
      .from('meals')
      .select('id, meal_id, name, meal_type, meal_date, cutoff_time, cutoff_enabled, reset_time, reset_enabled, is_booking_active')
      .eq('is_active', true)
      .eq('is_template', false)

    if (mealId) {
      query = query.eq('id', mealId)
    }
    
    if (mealType) {
      query = query.eq('meal_type', mealType)
    }
    
    if (date) {
      query = query.eq('meal_date', date)
    }

    const { data: meals, error } = await query

    if (error) {
      console.error('Error fetching meal cutoffs:', error)
      return NextResponse.json({ error: 'Failed to fetch meal cutoffs' }, { status: 500 })
    }

    // Calculate current cutoff status for each meal
    const mealsWithStatus = meals?.map(meal => {
      const now = new Date()
      const mealDate = new Date(meal.meal_date)
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      // Check if meal is for today
      const isToday = mealDate.getTime() === today.getTime()
      
      if (!isToday || !meal.cutoff_enabled) {
        return {
          ...meal,
          cutoff_status: 'active',
          can_book: true,
          cutoff_reached: false
        }
      }

      // Parse cutoff time
      const [cutoffHours, cutoffMinutes] = meal.cutoff_time.split(':').map(Number)
      const cutoffDateTime = new Date(today)
      cutoffDateTime.setHours(cutoffHours, cutoffMinutes, 0, 0)

      const cutoffReached = now >= cutoffDateTime

      return {
        ...meal,
        cutoff_status: cutoffReached ? 'cutoff_reached' : 'active',
        can_book: !cutoffReached,
        cutoff_reached: cutoffReached,
        cutoff_time_formatted: meal.cutoff_time,
        current_time: now.toTimeString().slice(0, 5)
      }
    }) || []

    return NextResponse.json(mealsWithStatus)
  } catch (error) {
    console.error('Error in meal cutoffs API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient()
    const body = await request.json()
    const { meal_id, cutoff_time, cutoff_enabled, reset_time, reset_enabled, is_booking_active } = body

    if (!meal_id) {
      return NextResponse.json({ error: 'Meal ID is required' }, { status: 400 })
    }

    const updateData: any = {}
    
    if (cutoff_time !== undefined) updateData.cutoff_time = cutoff_time
    if (cutoff_enabled !== undefined) updateData.cutoff_enabled = cutoff_enabled
    if (reset_time !== undefined) updateData.reset_time = reset_time
    if (reset_enabled !== undefined) updateData.reset_enabled = reset_enabled
    if (is_booking_active !== undefined) updateData.is_booking_active = is_booking_active

    const { data, error } = await supabase
      .from('meals')
      .update(updateData)
      .eq('id', meal_id)
      .select()

    if (error) {
      console.error('Error updating meal cutoff:', error)
      return NextResponse.json({ error: 'Failed to update meal cutoff' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error in meal cutoff update API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Reset meal booking status (called by cron job)
export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient()
    const body = await request.json()
    const { action, meal_type, date } = body

    if (action === 'reset_booking_status') {
      let query = supabase
        .from('meals')
        .update({ is_booking_active: true })
        .eq('is_active', true)
        .eq('is_template', false)

      if (meal_type) {
        query = query.eq('meal_type', meal_type)
      }
      
      if (date) {
        query = query.eq('meal_date', date)
      }

      const { data, error } = await query.select()

      if (error) {
        console.error('Error resetting meal booking status:', error)
        return NextResponse.json({ error: 'Failed to reset meal booking status' }, { status: 500 })
      }

      return NextResponse.json({ success: true, reset_count: data?.length || 0 })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error in meal cutoff reset API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
