import { createServiceRoleClient } from '@/lib/supabase/service'
import { NextRequest, NextResponse } from 'next/server'
import { apiSuccess, apiError, ERROR_CODES, serverError } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient()
    
    const { data, error } = await supabase
      .from('automation_rules')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching automation rules:', error)
      return apiError('Failed to fetch automation rules', ERROR_CODES.DATABASE_ERROR, 500)
    }

    return apiSuccess(data || [])
  } catch (error: any) {
    console.error('Error in automation-rules GET:', error)
    return serverError(error.message)
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from('automation_rules')
      .insert([body])
      .select()

    if (error) {
      console.error('Error creating automation rule:', error)
      return apiError('Failed to create automation rule', ERROR_CODES.DATABASE_ERROR, 500)
    }

    return apiSuccess(data[0])
  } catch (error: any) {
    console.error('Error in automation-rules POST:', error)
    return serverError(error.message)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient()
    const body = await request.json()
    const { id, ...updateData } = body

    const { data, error } = await supabase
      .from('automation_rules')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating automation rule:', error)
      return apiError('Failed to update automation rule', ERROR_CODES.DATABASE_ERROR, 500)
    }

    return apiSuccess(data[0])
  } catch (error: any) {
    console.error('Error in automation-rules PUT:', error)
    return serverError(error.message)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('automation_rules')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting automation rule:', error)
      return apiError('Failed to delete automation rule', ERROR_CODES.DATABASE_ERROR, 500)
    }

    return apiSuccess({ message: 'Automation rule deleted successfully' })
  } catch (error: any) {
    console.error('Error in automation-rules DELETE:', error)
    return serverError(error.message)
  }
}
