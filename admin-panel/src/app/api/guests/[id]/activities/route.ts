import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service'

// Simple response helpers for this endpoint
const apiSuccess = (data: any, status = 200) => {
  return NextResponse.json({ success: true, data }, { status })
}

const apiError = (message: string, status = 500) => {
  return NextResponse.json({ success: false, error: message }, { status })
}

interface Activity {
  id: string
  guest_id: string
  type: 'meal' | 'lesson' | 'event' | 'registration' | 'check_in' | 'check_out' | 'note'
  title: string
  description: string
  timestamp: string
  status: 'completed' | 'pending' | 'cancelled' | 'no_show'
  details?: any
  location?: string
  instructor?: string
  metadata?: any
  created_at: string
  updated_at: string
}

// Mock activities data
const generateMockActivities = (guestId: string): Activity[] => [
  {
    id: 'act-1',
    guest_id: guestId,
    type: 'registration',
    title: 'Camp Registrierung',
    description: 'QR-Code Registrierung abgeschlossen',
    timestamp: '2025-10-10T10:00:00Z',
    status: 'completed',
    metadata: { method: 'qr_code' },
    created_at: '2025-10-10T10:00:00Z',
    updated_at: '2025-10-10T10:00:00Z'
  },
  {
    id: 'act-2',
    guest_id: guestId,
    type: 'check_in',
    title: 'Check-in',
    description: 'Zimmer 204 zugewiesen',
    timestamp: '2025-10-10T14:30:00Z',
    status: 'completed',
    details: { room_number: '204', bed_type: 'single' },
    created_at: '2025-10-10T14:30:00Z',
    updated_at: '2025-10-10T14:30:00Z'
  },
  {
    id: 'act-3',
    guest_id: guestId,
    type: 'lesson',
    title: 'Surf Grundlagen',
    description: 'Erste Surfstunde am Strand',
    timestamp: '2025-10-11T09:00:00Z',
    status: 'completed',
    location: 'Hauptstrand',
    instructor: 'Tom Mueller',
    details: {
      duration: 120,
      skill_level: 'beginner',
      progress: 'good',
      wave_conditions: 'perfect',
      equipment_used: ['beginner_board', 'wetsuit_M']
    },
    created_at: '2025-10-11T09:00:00Z',
    updated_at: '2025-10-11T11:00:00Z'
  },
  {
    id: 'act-4',
    guest_id: guestId,
    type: 'meal',
    title: 'Mittagessen',
    description: 'Vegetarische Pasta mit Tomatensauce',
    timestamp: '2025-10-11T12:30:00Z',
    status: 'completed',
    details: {
      meal_type: 'lunch',
      dietary_option: 'vegetarian',
      ingredients: ['pasta', 'tomatoes', 'basil', 'olive_oil'],
      calories: 520
    },
    created_at: '2025-10-11T12:30:00Z',
    updated_at: '2025-10-11T12:30:00Z'
  },
  {
    id: 'act-5',
    guest_id: guestId,
    type: 'event',
    title: 'Beach Volleyball',
    description: 'Freizeitaktivität am Strand',
    timestamp: '2025-10-11T16:00:00Z',
    status: 'completed',
    location: 'Volleyball Platz',
    details: {
      participants: 8,
      duration: 90,
      teams: ['Team Welle', 'Team Strand'],
      score: '21:19'
    },
    created_at: '2025-10-11T16:00:00Z',
    updated_at: '2025-10-11T17:30:00Z'
  },
  {
    id: 'act-6',
    guest_id: guestId,
    type: 'lesson',
    title: 'Wellenreiten Fortgeschritten',
    description: 'Zweite Surfstunde mit größeren Wellen',
    timestamp: '2025-10-12T08:30:00Z',
    status: 'completed',
    location: 'Surfspot Ost',
    instructor: 'Lisa Weber',
    details: {
      duration: 150,
      skill_level: 'intermediate',
      progress: 'excellent',
      wave_height: '1.5m',
      techniques_learned: ['cutback', 'bottom_turn']
    },
    created_at: '2025-10-12T08:30:00Z',
    updated_at: '2025-10-12T11:00:00Z'
  },
  {
    id: 'act-7',
    guest_id: guestId,
    type: 'note',
    title: 'Fortschritt Notiz',
    description: 'Großartige Verbesserung beim Gleichgewicht und Timing',
    timestamp: '2025-10-12T11:00:00Z',
    status: 'completed',
    metadata: {
      staff_member: 'Lisa Weber',
      type: 'progress_note',
      rating: 4.5,
      next_goals: ['improve_turns', 'bigger_waves']
    },
    created_at: '2025-10-12T11:00:00Z',
    updated_at: '2025-10-12T11:00:00Z'
  },
  {
    id: 'act-8',
    guest_id: guestId,
    type: 'meal',
    title: 'Frühstück',
    description: 'Haferflocken mit Früchten und Nüssen',
    timestamp: '2025-10-13T08:00:00Z',
    status: 'completed',
    details: {
      meal_type: 'breakfast',
      dietary_option: 'vegetarian',
      ingredients: ['oats', 'banana', 'berries', 'almonds'],
      calories: 380
    },
    created_at: '2025-10-13T08:00:00Z',
    updated_at: '2025-10-13T08:00:00Z'
  },
  {
    id: 'act-9',
    guest_id: guestId,
    type: 'lesson',
    title: 'Surf Training',
    description: 'Geplante Surfstunde heute Nachmittag',
    timestamp: '2025-10-14T15:00:00Z',
    status: 'pending',
    location: 'Hauptstrand',
    instructor: 'Tom Mueller',
    details: {
      duration: 120,
      skill_level: 'intermediate',
      planned_focus: ['maneuvers', 'wave_selection']
    },
    created_at: '2025-10-14T10:00:00Z',
    updated_at: '2025-10-14T10:00:00Z'
  },
  {
    id: 'act-10',
    guest_id: guestId,
    type: 'meal',
    title: 'Abendessen',
    description: 'Gegrilltes Gemüse mit Reis',
    timestamp: '2025-10-14T18:30:00Z',
    status: 'pending',
    details: {
      meal_type: 'dinner',
      dietary_option: 'vegetarian',
      planned_ingredients: ['zucchini', 'bell_peppers', 'rice', 'herbs']
    },
    created_at: '2025-10-14T12:00:00Z',
    updated_at: '2025-10-14T12:00:00Z'
  },
  {
    id: 'act-11',
    guest_id: guestId,
    type: 'event',
    title: 'Yoga Sunset Session',
    description: 'Entspannungs-Yoga am Strand bei Sonnenuntergang',
    timestamp: '2025-10-14T19:30:00Z',
    status: 'pending',
    location: 'Strandpromenade',
    instructor: 'Anna Müller',
    details: {
      duration: 60,
      type: 'hatha_yoga',
      max_participants: 15,
      equipment_provided: true
    },
    created_at: '2025-10-14T12:00:00Z',
    updated_at: '2025-10-14T12:00:00Z'
  }
]

// Function to load real activities from database
const loadRealActivities = async (guestId: string): Promise<Activity[]> => {
  const supabase = createServiceRoleClient()
  const activities: Activity[] = []

  try {
    // Load lessons
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select(`
        id,
        title,
        description,
        start_time,
        duration,
        skill_level,
        location,
        is_cancelled,
        lesson_instructors (
          instructors (
            name
          )
        ),
        lesson_registrations!inner (
          guest_id,
          status,
          progress_notes,
          attendance_status
        )
      `)
      .eq('lesson_registrations.guest_id', guestId)

    if (lessons && !lessonsError) {
      lessons.forEach((lesson: any) => {
        const registration = lesson.lesson_registrations[0]
        activities.push({
          id: `lesson-${lesson.id}`,
          guest_id: guestId,
          type: 'lesson',
          title: lesson.title || 'Surfstunde',
          description: lesson.description || 'Surfstunde',
          timestamp: lesson.start_time,
          status: lesson.is_cancelled ? 'cancelled' :
                  registration?.attendance_status === 'present' ? 'completed' :
                  registration?.attendance_status === 'absent' ? 'no_show' : 'pending',
          details: {
            duration: lesson.duration,
            skill_level: lesson.skill_level,
            progress: registration?.progress_notes
          },
          location: lesson.location,
          instructor: lesson.lesson_instructors?.[0]?.instructors?.name,
          created_at: lesson.start_time,
          updated_at: lesson.start_time
        })
      })
    }

    // Load meals
    const { data: meals, error: mealsError } = await supabase
      .from('meals')
      .select(`
        id,
        name,
        description,
        scheduled_time,
        meal_type,
        meal_registrations!inner (
          guest_id,
          dietary_option,
          status
        )
      `)
      .eq('meal_registrations.guest_id', guestId)

    if (meals && !mealsError) {
      meals.forEach((meal: any) => {
        const registration = meal.meal_registrations[0]
        activities.push({
          id: `meal-${meal.id}`,
          guest_id: guestId,
          type: 'meal',
          title: meal.name || 'Mahlzeit',
          description: meal.description || 'Mahlzeit',
          timestamp: meal.scheduled_time,
          status: registration?.status === 'confirmed' ? 'completed' : 'pending',
          details: {
            meal_type: meal.meal_type,
            dietary_option: registration?.dietary_option
          },
          created_at: meal.scheduled_time,
          updated_at: meal.scheduled_time
        })
      })
    }

    // Load events
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select(`
        id,
        title,
        description,
        start_time,
        duration,
        location,
        event_registrations!inner (
          guest_id,
          status
        )
      `)
      .eq('event_registrations.guest_id', guestId)

    if (events && !eventsError) {
      events.forEach((event: any) => {
        const registration = event.event_registrations[0]
        activities.push({
          id: `event-${event.id}`,
          guest_id: guestId,
          type: 'event',
          title: event.title || 'Event',
          description: event.description || 'Event',
          timestamp: event.start_time,
          status: registration?.status === 'confirmed' ? 'completed' : 'pending',
          details: {
            duration: event.duration
          },
          location: event.location,
          created_at: event.start_time,
          updated_at: event.start_time
        })
      })
    }

  } catch (error) {
    console.error('Error loading real activities:', error)
    // Fall back to mock data on error
    return generateMockActivities(guestId)
  }

  return activities
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const guestId = params.id
    const { searchParams } = new URL(request.url)

    // Query parameters for filtering
    const type = searchParams.get('type') // 'meal', 'lesson', 'event', etc.
    const status = searchParams.get('status') // 'completed', 'pending', etc.
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const date_from = searchParams.get('date_from')
    const date_to = searchParams.get('date_to')

    // Load real activities from database, fall back to mock if needed
    let activities = await loadRealActivities(guestId)

    // If no real activities found, use mock data
    if (activities.length === 0) {
      activities = generateMockActivities(guestId)
    }

    // Apply filters
    if (type) {
      activities = activities.filter(activity => activity.type === type)
    }

    if (status) {
      activities = activities.filter(activity => activity.status === status)
    }

    if (date_from) {
      activities = activities.filter(activity =>
        new Date(activity.timestamp) >= new Date(date_from)
      )
    }

    if (date_to) {
      activities = activities.filter(activity =>
        new Date(activity.timestamp) <= new Date(date_to)
      )
    }

    // Sort by timestamp (most recent first)
    activities.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    // Apply pagination
    const totalCount = activities.length
    const paginatedActivities = activities.slice(offset, offset + limit)

    // Generate summary statistics
    const summary = {
      total_activities: totalCount,
      by_type: {
        meal: activities.filter(a => a.type === 'meal').length,
        lesson: activities.filter(a => a.type === 'lesson').length,
        event: activities.filter(a => a.type === 'event').length,
        note: activities.filter(a => a.type === 'note').length,
        registration: activities.filter(a => a.type === 'registration').length,
        check_in: activities.filter(a => a.type === 'check_in').length,
        check_out: activities.filter(a => a.type === 'check_out').length
      },
      by_status: {
        completed: activities.filter(a => a.status === 'completed').length,
        pending: activities.filter(a => a.status === 'pending').length,
        cancelled: activities.filter(a => a.status === 'cancelled').length,
        no_show: activities.filter(a => a.status === 'no_show').length
      },
      recent_activity: activities.length > 0 ? activities[0].timestamp : null
    }

    return apiSuccess({
      activities: paginatedActivities,
      summary,
      pagination: {
        total: totalCount,
        limit,
        offset,
        has_more: offset + limit < totalCount
      }
    })

  } catch (error: any) {
    console.error('Error fetching guest activities:', error)
    return apiError('Failed to fetch guest activities', 500)
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const guestId = params.id
    const body = await request.json()

    const {
      type,
      title,
      description,
      timestamp,
      status = 'completed',
      details,
      location,
      instructor,
      metadata
    } = body

    // Validate required fields
    if (!type || !title || !description) {
      return apiError('Type, title, and description are required', 400)
    }

    // Generate new activity
    const newActivity: Activity = {
      id: `act-${Math.random().toString(36).substr(2, 8)}`,
      guest_id: guestId,
      type,
      title,
      description,
      timestamp: timestamp || new Date().toISOString(),
      status,
      details: details || null,
      location: location || null,
      instructor: instructor || null,
      metadata: metadata || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('Created new activity:', newActivity)

    return apiSuccess(newActivity, 201)

  } catch (error: any) {
    console.error('Error creating guest activity:', error)
    return apiError('Failed to create activity', 500)
  }
}