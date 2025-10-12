import { NextRequest } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { apiSuccess, apiError, ERROR_CODES, serverError } from '@/lib/api-helpers'

// Read-only status endpoint for meal cutoff status
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient()
    const now = new Date()
    const currentTime = now.toTimeString().slice(0, 5) // HH:MM format
    const today = now.toISOString().split('T')[0] // YYYY-MM-DD format

    // Check if any meals have cutoff status changes
    const { data: cutoffMeals, error: cutoffError } = await supabase
      .from('meals')
      .select('id, meal_id, name, meal_type, meal_date, cutoff_time, cutoff_enabled, is_booking_active')
      .eq('is_active', true)
      .eq('is_template', false)
      .eq('cutoff_enabled', true)
      .eq('meal_date', today)
      .lte('cutoff_time', currentTime)

    if (cutoffError) {
      console.error('Error checking cutoff status:', cutoffError)
      return apiError('Failed to check cutoff status', ERROR_CODES.DATABASE_ERROR, 500)
    }

    // Check if any meals need reset
    const { data: resetMeals, error: resetError } = await supabase
      .from('meals')
      .select('id, meal_id, name, meal_type, meal_date, reset_time, reset_enabled, is_booking_active')
      .eq('is_active', true)
      .eq('is_template', false)
      .eq('reset_enabled', true)
      .lte('reset_time', currentTime)

    if (resetError) {
      console.error('Error checking reset status:', resetError)
      return apiError('Failed to check reset status', ERROR_CODES.DATABASE_ERROR, 500)
    }

    const hasUpdates = (cutoffMeals && cutoffMeals.length > 0) || (resetMeals && resetMeals.length > 0)

    return apiSuccess({
      hasUpdates,
      currentTime,
      date: today,
      cutoffMeals: cutoffMeals || [],
      resetMeals: resetMeals || []
    })
  } catch (error: any) {
    console.error('Error in meals status check:', error)
    return serverError(error.message)
  }
}
