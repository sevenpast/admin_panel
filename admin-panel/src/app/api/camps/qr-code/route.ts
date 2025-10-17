import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'

// Simple response helpers for this endpoint
const apiSuccess = (data: any, status = 200) => {
  return NextResponse.json({ success: true, data }, { status })
}

const apiError = (message: string, status = 500) => {
  return NextResponse.json({ success: false, error: message }, { status })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const campId = searchParams.get('camp_id') || '00000000-0000-0000-0000-000000000001'
    const format = searchParams.get('format') || 'png'

    // Create registration URL with camp ID
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'
    const registrationUrl = `${baseUrl}/register?camp_id=${campId}`

    // Generate QR code
    const qrCodeOptions = {
      errorCorrectionLevel: 'M' as const,
      type: 'image/png' as const,
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 512
    }

    if (format === 'svg') {
      const qrCodeSvg = await QRCode.toString(registrationUrl, {
        ...qrCodeOptions,
        type: 'svg'
      })

      return new NextResponse(qrCodeSvg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Content-Disposition': `inline; filename="camp-${campId}-qr.svg"`
        }
      })
    } else {
      const qrCodeBuffer = await QRCode.toBuffer(registrationUrl, qrCodeOptions)

      return new NextResponse(qrCodeBuffer, {
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `inline; filename="camp-${campId}-qr.png"`
        }
      })
    }
  } catch (error: any) {
    console.error('Error generating QR code:', error)
    return apiError('Failed to generate QR code', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { camp_id = '00000000-0000-0000-0000-000000000001', size = 512, format = 'png' } = body

    // Create registration URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'
    const registrationUrl = `${baseUrl}/register?camp_id=${camp_id}`

    // Generate QR code as data URL for inline display
    const qrCodeDataUrl = await QRCode.toDataURL(registrationUrl, {
      errorCorrectionLevel: 'M',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: size
    })

    return apiSuccess({
      camp_id,
      camp_name: 'Demo Camp',
      registration_url: registrationUrl,
      qr_code_data_url: qrCodeDataUrl,
      download_url: `/api/camps/qr-code?camp_id=${camp_id}&format=${format}`
    })
  } catch (error: any) {
    console.error('Error generating QR code:', error)
    return apiError('Failed to generate QR code', 500)
  }
}