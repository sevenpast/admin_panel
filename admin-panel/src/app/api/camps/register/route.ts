import { NextRequest, NextResponse } from 'next/server'

// Simple response helpers for this endpoint
const apiSuccess = (data: any, status = 200) => {
  return NextResponse.json({ success: true, data }, { status })
}

const apiError = (message: string, status = 500) => {
  return NextResponse.json({ success: false, error: message }, { status })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      camp_id,
      name,
      mobile_number,
      instagram,
      surf_package = false,
      surf_level = 'beginner',
      allergies = [],
      other_allergies = '',
      notes = ''
    } = body

    // Validate required fields
    if (!camp_id) {
      return apiError('Camp ID is required', 400)
    }

    if (!name) {
      return apiError('Name is required', 400)
    }

    // Generate guest ID
    const guestId = `G-${Math.random().toString(36).substr(2, 8).toUpperCase()}`

    // For demo purposes, simulate successful registration
    console.log('Demo registration:', {
      guest_id: guestId,
      camp_id: camp_id,
      name: name.trim(),
      mobile_number: mobile_number?.trim() || null,
      instagram: instagram?.trim() || null,
      surf_package: surf_package,
      surf_level: surf_level,
      allergies: allergies,
      other_allergies: other_allergies?.trim() || null,
      notes: notes?.trim() || null,
      registration_date: new Date().toISOString()
    })

    return apiSuccess({
      guest: {
        id: guestId,
        guest_id: guestId,
        name: name,
        mobile_number: mobile_number,
        surf_package: surf_package,
        surf_level: surf_level,
        registration_date: new Date().toISOString()
      },
      camp: {
        id: camp_id,
        name: 'Demo Surf Camp'
      },
      message: `Successfully registered ${name} for Demo Surf Camp`
    }, 201)

  } catch (error: any) {
    console.error('Error in camp registration:', error)
    return apiError('Registration failed', 500)
  }
}

// GET - Check camp registration status and info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const campId = searchParams.get('camp_id')

    if (!campId) {
      return apiError('Camp ID is required', 400)
    }

    // For demo purposes, return mock camp info
    return apiSuccess({
      camp: {
        id: campId,
        name: 'Demo Surf Camp',
        is_active: true,
        timezone: 'Europe/Berlin',
        current_guests: 24
      },
      registration_available: true
    })

  } catch (error: any) {
    console.error('Error checking camp status:', error)
    return apiError('Failed to check camp status', 500)
  }
}