import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size too large (max 5MB)' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create filename with timestamp to avoid conflicts
    const timestamp = new Date().getTime()
    const fileExtension = file.name.split('.').pop()
    const fileName = `meal_${timestamp}.${fileExtension}`

    // Save to persistent storage directory (use /tmp for deployment compatibility)
    const uploadsDir = process.env.NODE_ENV === 'production' 
      ? join('/tmp', 'uploads') 
      : join(process.cwd(), 'public', 'uploads')
    const filePath = join(uploadsDir, fileName)

    // Create uploads directory if it doesn't exist
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }
    await writeFile(filePath, buffer)

    // Return the URL path (use absolute path for production)
    const fileUrl = process.env.NODE_ENV === 'production' 
      ? `/tmp/uploads/${fileName}`
      : `/uploads/${fileName}`

    return NextResponse.json({
      success: true,
      url: fileUrl,
      originalName: file.name,
      size: file.size
    })

  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}