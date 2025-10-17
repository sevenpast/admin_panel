import { NextRequest } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { apiSuccess, apiError } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  const supabase = createServiceRoleClient()
  
  try {
    // Get current camp_id
    let campId: string
    
    const { data: camps, error: campsError } = await supabase
      .from('camps')
      .select('id')
      .limit(1)
      .single()

    if (campsError || !camps) {
      // Create default camp if none exists
      const { data: newCamp, error: createError } = await supabase
        .from('camps')
        .insert([{
          name: 'Default Camp',
          timezone: 'UTC',
          is_active: true
        }])
        .select('id')
        .single()

      if (createError || !newCamp) {
        console.error('Failed to create default camp:', createError)
        return apiError('Failed to create default camp', 'CAMP_CREATION_FAILED', 500)
      }
      campId = newCamp.id
    } else {
      campId = camps.id
    }

    const today = new Date().toISOString().split('T')[0]

    // Execute all queries in parallel for maximum performance
    const [
      guestsResult,
      roomsResult,
      mealsResult,
      eventsResult,
      staffResult,
      lessonsResult
    ] = await Promise.all([
      // Guest stats
      supabase
        .from('guests')
        .select('id, surf_package, is_active')
        .eq('camp_id', campId)
        .eq('is_active', true),
      
      // Room stats with bed occupancy
      supabase
        .from('rooms')
        .select(`
          id,
          name,
          max_capacity,
          beds!inner (
            id,
            capacity,
            current_occupancy,
            is_active
          )
        `)
        .eq('camp_id', campId)
        .eq('is_active', true)
        .eq('beds.is_active', true),
      
      // Meal stats for today
      supabase
        .from('meals')
        .select('id, meal_type, meal_options, is_template')
        .eq('camp_id', campId)
        .eq('meal_date', today)
        .eq('is_template', false),
      
      // Event stats for today
      supabase
        .from('events')
        .select('id, current_participants, max_participants')
        .eq('camp_id', campId)
        .eq('event_date', today),
      
      // Staff stats
      supabase
        .from('staff')
        .select('id, is_active')
        .eq('camp_id', campId)
        .eq('is_active', true),
      
      // Lesson stats for today
      supabase
        .from('lessons')
        .select(`
          id,
          level,
          lesson_assignments (
            id
          )
        `)
        .eq('camp_id', campId)
        .gte('start_at', `${today}T00:00:00.000Z`)
        .lt('start_at', `${today}T23:59:59.999Z`)
    ])

    // Process guest statistics
    const guests = guestsResult.data || []
    const guestStats = {
      total: guests.length,
      inHouse: guests.length, // All active guests are in-house
      surfPackage: guests.filter(g => g.surf_package).length,
      surfPackagePercentage: guests.length > 0 ? 
        Math.round((guests.filter(g => g.surf_package).length / guests.length) * 100) : 0
    }

    // Process room and bed statistics
    const rooms = roomsResult.data || []
    let bedsOccupied = 0
    let bedsTotal = 0
    
    rooms.forEach(room => {
      room.beds?.forEach((bed: any) => {
        bedsTotal += bed.capacity
        bedsOccupied += bed.current_occupancy
      })
    })

    const inventoryStats = {
      bedsOccupied,
      bedsTotal,
      occupancyPercentage: bedsTotal > 0 ? Math.round((bedsOccupied / bedsTotal) * 100) : 0,
      roomsCount: rooms.length
    }

    // Process meal statistics
    const meals = mealsResult.data || []
    let ordersToday = 0
    let meatCount = 0
    let vegetarianCount = 0
    let veganCount = 0
    let otherCount = 0

    meals.forEach(meal => {
      if (meal.meal_options) {
        const options = typeof meal.meal_options === 'string' 
          ? JSON.parse(meal.meal_options) 
          : meal.meal_options
        
        Object.values(options).forEach((option: any) => {
          if (option && typeof option === 'object') {
            ordersToday += option.quantity || 0
            
            if (option.type === 'meat') meatCount += option.quantity || 0
            else if (option.type === 'vegetarian') vegetarianCount += option.quantity || 0
            else if (option.type === 'vegan') veganCount += option.quantity || 0
            else otherCount += option.quantity || 0
          }
        })
      }
    })

    const mealStats = {
      ordersToday,
      meatCount,
      vegetarianCount,
      veganCount,
      otherCount
    }

    // Process event statistics
    const events = eventsResult.data || []
    const eventStats = {
      today: events.length,
      totalAttendance: events.reduce((sum, event) => sum + (event.current_participants || 0), 0)
    }

    // Process staff statistics
    const staff = staffResult.data || []
    const staffStats = {
      active: staff.length
    }

    // Process lesson statistics
    const lessons = lessonsResult.data || []
    const lessonStats = {
      today: lessons.length,
      beginnerCount: lessons.filter(l => l.level === 'beginner').length,
      intermediateCount: lessons.filter(l => l.level === 'intermediate').length,
      advancedCount: lessons.filter(l => l.level === 'advanced').length
    }

    // Get shifts for today (if shifts table exists)
    let shiftsToday = 0
    try {
      const { data: shifts } = await supabase
        .from('shifts')
        .select('id')
        .eq('camp_id', campId)
        .eq('is_active', true)
        .gte('start_at', `${today}T00:00:00.000Z`)
        .lt('start_at', `${today}T23:59:59.999Z`)
      
      shiftsToday = shifts?.length || 0
    } catch (error) {
      // Shifts table might not exist, continue without it
      console.log('Shifts table not available')
    }

    const shiftStats = {
      today: shiftsToday
    }

    const dashboardStats = {
      guests: guestStats,
      lessons: lessonStats,
      meals: mealStats,
      events: eventStats,
      staff: staffStats,
      inventory: inventoryStats,
      shifts: shiftStats
    }

    return apiSuccess(dashboardStats)
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error)
    return apiError('Failed to fetch dashboard statistics', 'DASHBOARD_FETCH_FAILED', 500)
  }
}
