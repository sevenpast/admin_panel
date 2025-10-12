import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { guestId, level, setBy } = body

    console.log('Surf level update request:', { guestId, level, setBy })

    if (!guestId || !level || !setBy) {
      console.log('Missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields: guestId, level, setBy' },
        { status: 400 }
      )
    }

    console.log('Updating guest surf level in database...')
    const { error } = await supabase
      .from('guests')
      .update({
        surf_level: level,
        surf_level_set_by: setBy,
        surf_level_set_at: new Date().toISOString()
      })
      .eq('id', guestId)

    if (error) {
      console.error('Database error updating guest surf level:', error)
      return NextResponse.json(
        { error: 'Failed to update surf level', details: error.message },
        { status: 500 }
      )
    }

    console.log('Successfully updated guest surf level')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in surf level update:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
