import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service'

// This endpoint is called by a cron job to automatically reset cutoff statuses
export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient()
    const now = new Date()
    const currentTime = now.toTimeString().slice(0, 5) // HH:MM format
    const today = now.toISOString().split('T')[0] // YYYY-MM-DD format
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    console.log(`Cutoff cron job running at ${currentTime} for date ${today}`)

    let resetCount = 0
    const results = []

    // Reset meal booking statuses based on reset_time
    const { data: mealsToReset, error: mealsError } = await supabase
      .from('meals')
      .select('id, meal_id, name, meal_type, meal_date, reset_time, reset_enabled')
      .eq('is_active', true)
      .eq('is_template', false)
      .eq('reset_enabled', true)
      .lte('reset_time', currentTime)

    if (mealsError) {
      console.error('Error fetching meals for reset:', mealsError)
    } else if (mealsToReset && mealsToReset.length > 0) {
      // Reset booking status for meals that should be reset
      const mealIds = mealsToReset.map(meal => meal.id)
      
      const { data: resetMeals, error: resetError } = await supabase
        .from('meals')
        .update({ is_booking_active: true })
        .in('id', mealIds)
        .select('id, meal_id, name, meal_type')

      if (resetError) {
        console.error('Error resetting meal booking status:', resetError)
      } else {
        resetCount += resetMeals?.length || 0
        results.push({
          type: 'meals',
          count: resetMeals?.length || 0,
          items: resetMeals?.map(meal => `${meal.name} (${meal.meal_type})`) || []
        })
        console.log(`Reset ${resetMeals?.length || 0} meal booking statuses`)
      }
    }

    // Reset event registration statuses based on reset_time
    const { data: eventsToReset, error: eventsError } = await supabase
      .from('events')
      .select('id, event_id, title, category, start_at, reset_time, reset_enabled')
      .eq('is_active', true)
      .eq('reset_enabled', true)
      .lte('reset_time', currentTime)

    if (eventsError) {
      console.error('Error fetching events for reset:', eventsError)
    } else if (eventsToReset && eventsToReset.length > 0) {
      // Reset registration status for events that should be reset
      const eventIds = eventsToReset.map(event => event.id)
      
      const { data: resetEvents, error: resetError } = await supabase
        .from('events')
        .update({ is_registration_active: true })
        .in('id', eventIds)
        .select('id, event_id, title, category')

      if (resetError) {
        console.error('Error resetting event registration status:', resetError)
      } else {
        resetCount += resetEvents?.length || 0
        results.push({
          type: 'events',
          count: resetEvents?.length || 0,
          items: resetEvents?.map(event => `${event.title} (${event.category})`) || []
        })
        console.log(`Reset ${resetEvents?.length || 0} event registration statuses`)
      }
    }

    // Apply cutoff statuses based on cutoff_time
    const { data: mealsToCutoff, error: mealsCutoffError } = await supabase
      .from('meals')
      .select('id, meal_id, name, meal_type, meal_date, cutoff_time, cutoff_enabled')
      .eq('is_active', true)
      .eq('is_template', false)
      .eq('cutoff_enabled', true)
      .eq('meal_date', today)
      .lte('cutoff_time', currentTime)

    if (mealsCutoffError) {
      console.error('Error fetching meals for cutoff:', mealsCutoffError)
    } else if (mealsToCutoff && mealsToCutoff.length > 0) {
      const mealIds = mealsToCutoff.map(meal => meal.id)
      
      const { data: cutoffMeals, error: cutoffError } = await supabase
        .from('meals')
        .update({ is_booking_active: false })
        .in('id', mealIds)
        .select('id, meal_id, name, meal_type')

      if (cutoffError) {
        console.error('Error applying meal cutoff:', cutoffError)
      } else {
        results.push({
          type: 'meal_cutoffs',
          count: cutoffMeals?.length || 0,
          items: cutoffMeals?.map(meal => `${meal.name} (${meal.meal_type})`) || []
        })
        console.log(`Applied cutoff to ${cutoffMeals?.length || 0} meals`)
      }
    }

    // Apply cutoff statuses for events
    const { data: eventsToCutoff, error: eventsCutoffError } = await supabase
      .from('events')
      .select('id, event_id, title, category, start_at, cutoff_time, cutoff_enabled')
      .eq('is_active', true)
      .eq('cutoff_enabled', true)
      .gte('start_at', `${today}T00:00:00`)
      .lt('start_at', `${today}T23:59:59`)

    if (eventsCutoffError) {
      console.error('Error fetching events for cutoff:', eventsCutoffError)
    } else if (eventsToCutoff && eventsToCutoff.length > 0) {
      // Filter events where cutoff time has passed
      const eventsPastCutoff = eventsToCutoff.filter(event => {
        const [cutoffHours, cutoffMinutes] = event.cutoff_time.split(':').map(Number)
        const [currentHours, currentMinutes] = currentTime.split(':').map(Number)
        const cutoffMinutesTotal = cutoffHours * 60 + cutoffMinutes
        const currentMinutesTotal = currentHours * 60 + currentMinutes
        return currentMinutesTotal >= cutoffMinutesTotal
      })

      if (eventsPastCutoff.length > 0) {
        const eventIds = eventsPastCutoff.map(event => event.id)
        
        const { data: cutoffEvents, error: cutoffError } = await supabase
          .from('events')
          .update({ is_registration_active: false })
          .in('id', eventIds)
          .select('id, event_id, title, category')

        if (cutoffError) {
          console.error('Error applying event cutoff:', cutoffError)
        } else {
          results.push({
            type: 'event_cutoffs',
            count: cutoffEvents?.length || 0,
            items: cutoffEvents?.map(event => `${event.title} (${event.category})`) || []
          })
          console.log(`Applied cutoff to ${cutoffEvents?.length || 0} events`)
        }
      }
    }

    const response = {
      success: true,
      timestamp: now.toISOString(),
      current_time: currentTime,
      date: today,
      total_reset: resetCount,
      results: results
    }

    console.log('Cutoff cron job completed:', response)
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in cutoff cron job:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Manual trigger endpoint for testing
export async function GET(request: NextRequest) {
  return POST(request)
}
