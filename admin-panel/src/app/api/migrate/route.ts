import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient()

    // Add status column to staff table
    const { error: statusError } = await supabase
      .from('staff')
      .select('status')
      .limit(1)

    if (statusError?.message?.includes('does not exist') || statusError?.message?.includes('column "status" does not exist')) {
      // Column doesn't exist, we need to add it through a different approach
      console.log('Status column does not exist, attempting to add via SQL...')

      // Try to execute individual operations
      const operations = [
        'ALTER TABLE staff ADD COLUMN status VARCHAR(20) DEFAULT \'active\'',
        'ALTER TABLE staff ADD COLUMN image_url TEXT',
        'ALTER TABLE staff ADD COLUMN description TEXT'
      ]

      for (const sql of operations) {
        try {
          const { error } = await supabase.rpc('exec', { sql })
          if (error && !error.message.includes('already exists')) {
            console.error('SQL Error:', error)
          }
        } catch (err) {
          console.error('Operation error:', err)
        }
      }
    }

    if (statusError) {
      console.error('Migration error:', statusError)
      return NextResponse.json({
        success: false,
        error: statusError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Staff table schema updated successfully!'
    })

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to execute migration'
    }, { status: 500 })
  }
}