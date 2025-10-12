import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient()
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('event_id')
    const category = searchParams.get('category')
    const date = searchParams.get('date')

    let query = supabase
      .from('events')
      .select('id, event_id, title, category, start_at, end_at, cutoff_time, cutoff_enabled, reset_time, reset_enabled, is_registration_active')
      .eq('is_active', true)

    if (eventId) {
      query = query.eq('id', eventId)
    }
    
    if (category) {
      query = query.eq('category', category)
    }
    
    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)
      
      query = query
        .gte('start_at', startDate.toISOString())
        .lt('start_at', endDate.toISOString())
    }

    const { data: events, error } = await query

    if (error) {
      console.error('Error fetching event cutoffs:', error)
      return NextResponse.json({ error: 'Failed to fetch event cutoffs' }, { status: 500 })
    }

    // Calculate current cutoff status for each event
    const eventsWithStatus = events?.map(event => {
      const now = new Date()
      const eventStart = new Date(event.start_at)
      
      if (!event.cutoff_enabled) {
        return {
          ...event,
          cutoff_status: 'active',
          can_register: true,
          cutoff_reached: false
        }
      }

      // Parse cutoff time
      const [cutoffHours, cutoffMinutes] = event.cutoff_time.split(':').map(Number)
      const cutoffDateTime = new Date(eventStart)
      cutoffDateTime.setHours(cutoffHours, cutoffMinutes, 0, 0)

      const cutoffReached = now >= cutoffDateTime

      return {
        ...event,
        cutoff_status: cutoffReached ? 'cutoff_reached' : 'active',
        can_register: !cutoffReached,
        cutoff_reached: cutoffReached,
        cutoff_time_formatted: event.cutoff_time,
        current_time: now.toTimeString().slice(0, 5),
        event_start_formatted: eventStart.toLocaleString()
      }
    }) || []

    return NextResponse.json(eventsWithStatus)
  } catch (error) {
    console.error('Error in event cutoffs API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient()
    const body = await request.json()
    const { event_id, cutoff_time, cutoff_enabled, reset_time, reset_enabled, is_registration_active } = body

    if (!event_id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }

    const updateData: any = {}
    
    if (cutoff_time !== undefined) updateData.cutoff_time = cutoff_time
    if (cutoff_enabled !== undefined) updateData.cutoff_enabled = cutoff_enabled
    if (reset_time !== undefined) updateData.reset_time = reset_time
    if (reset_enabled !== undefined) updateData.reset_enabled = reset_enabled
    if (is_registration_active !== undefined) updateData.is_registration_active = is_registration_active

    const { data, error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', event_id)
      .select()

    if (error) {
      console.error('Error updating event cutoff:', error)
      return NextResponse.json({ error: 'Failed to update event cutoff' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error in event cutoff update API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Reset event registration status (called by cron job)
export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient()
    const body = await request.json()
    const { action, category, date } = body

    if (action === 'reset_registration_status') {
      let query = supabase
        .from('events')
        .update({ is_registration_active: true })
        .eq('is_active', true)

      if (category) {
        query = query.eq('category', category)
      }
      
      if (date) {
        const startDate = new Date(date)
        const endDate = new Date(date)
        endDate.setDate(endDate.getDate() + 1)
        
        query = query
          .gte('start_at', startDate.toISOString())
          .lt('start_at', endDate.toISOString())
      }

      const { data, error } = await query.select()

      if (error) {
        console.error('Error resetting event registration status:', error)
        return NextResponse.json({ error: 'Failed to reset event registration status' }, { status: 500 })
      }

      return NextResponse.json({ success: true, reset_count: data?.length || 0 })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error in event cutoff reset API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
