import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { apiSuccess, apiError, ERROR_CODES, serverError } from '@/lib/api-helpers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Helper function to copy from template
async function copyFromTemplate(body: any) {
  try {
    // Get the template
    const { data: template, error: templateError } = await supabase
      .from('meals')
      .select('*')
      .eq('id', body.templateId)
      .eq('is_template', true)
      .single()

    if (templateError || !template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Get or create a default camp
    let campId = '00000000-0000-0000-0000-000000000001'
    const { data: camps } = await supabase
      .from('camps')
      .select('id')
      .limit(1)
    
    if (camps && camps.length > 0) {
      campId = camps[0].id
    }

    // Create new meal from template
    const newMealData = {
      meal_id: `M-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      camp_id: campId,
      name: body.name || template.name,
      description: body.description || template.description,
      meal_type: body.meal_type || template.meal_type,
      meal_date: body.meal_date || new Date().toISOString().split('T')[0],
      ingredients: body.ingredients || template.ingredients,
      dietary_restrictions: body.dietary_restrictions || template.dietary_restrictions,
      dietary_option: body.dietary_option || template.dietary_option || 'meat', // Add dietary option field
      planned_portions: body.planned_portions || template.planned_portions,
      estimated_cost_per_portion: body.estimated_cost_per_portion || template.estimated_cost_per_portion,
      prep_time_minutes: body.prep_time_minutes || template.prep_time_minutes,
      cooking_time_minutes: body.cooking_time_minutes || template.cooking_time_minutes,
      kitchen_notes: body.kitchen_notes || template.kitchen_notes,
      is_template: false, // Always create as regular meal, not template
      is_active: body.is_active !== undefined ? body.is_active : true
    }

    const { data: newMeal, error: createError } = await supabase
      .from('meals')
      .insert([newMealData])
      .select()
      .single()

    if (createError) {
      console.error('Error creating meal from template:', createError)
      return apiError('Failed to create meal from template', ERROR_CODES.DATABASE_ERROR, 500)
    }

    return apiSuccess(newMeal, 201)
  } catch (error: any) {
    console.error('Error in copyFromTemplate:', error)
    return serverError(error.message)
  }
}

// Helper function to create recurring meals
async function createRecurringMeals(originalMeal: any, recurrence: any, campId: string, recurrenceRuleId: string) {
  const { frequency, interval = 1, maxOccurrences = 0, endDate, selectedDays, dayOfMonth } = recurrence
  const startDate = new Date(originalMeal.meal_date)
  // If maxOccurrences is 0, it means unlimited - set a far future end date
  const endDateObj = endDate ? new Date(endDate) : (maxOccurrences === 0 ? new Date('2099-12-31') : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
  
  let createdCount = 0
  const mealsToCreate = []

  if (frequency === 'weekly' && selectedDays && selectedDays.length > 0) {
    // Weekly with specific days
    let currentDate = new Date(startDate)
    
    while ((maxOccurrences === 0 || createdCount < maxOccurrences) && currentDate <= endDateObj) {
      // Check if current date matches any selected day of week
      const dayOfWeek = currentDate.getDay() // 0 = Sunday, 1 = Monday, etc.
      
      if (selectedDays.includes(dayOfWeek)) {
        const recurringMealData = {
          meal_id: `M-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
          camp_id: campId,
          name: originalMeal.name,
          description: originalMeal.description,
          meal_type: originalMeal.meal_type,
          meal_date: currentDate.toISOString().split('T')[0],
          recurrence_rule_id: recurrenceRuleId
        }
        mealsToCreate.push(recurringMealData)
        createdCount++
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1)
    }
  } else if (frequency === 'monthly' && dayOfMonth) {
    // Monthly with specific day of month
    let currentDate = new Date(startDate)
    
    while ((maxOccurrences === 0 || createdCount < maxOccurrences) && currentDate <= endDateObj) {
      // Set to the specified day of the month
      const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayOfMonth)
      
      // If the target date is valid and in the future
      if (targetDate >= startDate && targetDate <= endDateObj) {
        const recurringMealData = {
          meal_id: `M-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
          camp_id: campId,
          name: originalMeal.name,
          description: originalMeal.description,
          meal_type: originalMeal.meal_type,
          meal_date: targetDate.toISOString().split('T')[0],
          recurrence_rule_id: recurrenceRuleId
        }
        mealsToCreate.push(recurringMealData)
        createdCount++
      }
      
      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1)
    }
  } else {
    // Fallback to interval-based logic for other frequencies
    let currentDate = new Date(startDate)
    
    while ((maxOccurrences === 0 || createdCount < maxOccurrences) && currentDate <= endDateObj) {
      // Calculate next date based on frequency
      switch (frequency) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + interval)
          break
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + (7 * interval))
          break
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + interval)
          break
        default:
          break
      }

      if (currentDate <= endDateObj) {
        const recurringMealData = {
          meal_id: `M-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
          camp_id: campId,
          name: originalMeal.name,
          description: originalMeal.description,
          meal_type: originalMeal.meal_type,
          meal_date: currentDate.toISOString().split('T')[0],
          recurrence_rule_id: recurrenceRuleId
        }
        mealsToCreate.push(recurringMealData)
        createdCount++
      }
    }
  }

  if (mealsToCreate.length > 0) {
    const { error } = await supabase
      .from('meals')
      .insert(mealsToCreate)

    if (error) {
      console.error('Error creating recurring meals:', error)
    } else {
      console.log(`Successfully created ${mealsToCreate.length} recurring meals`)
    }
  }
}

// GET - Fetch all meals
export async function GET(request: NextRequest) {
  try {
    console.log('Fetching meals from database...')
    
    const { searchParams } = new URL(request.url)
    const includeTemplates = searchParams.get('include_templates') === 'true'
    const templatesOnly = searchParams.get('templates_only') === 'true'
    const mealDate = searchParams.get('meal_date')
    const mealType = searchParams.get('meal_type')
    
    let query = supabase
      .from('meals')
      .select('*')
      .order('created_at', { ascending: true })

    if (templatesOnly) {
      // Only return templates
      query = query.eq('is_template', true)
    } else if (!includeTemplates) {
      // Only return regular meals (not templates)
      query = query.eq('is_template', false)
    }
    // If includeTemplates is true, return both regular meals and templates
    
    // Apply date filter if provided
    if (mealDate) {
      query = query.eq('meal_date', mealDate)
    }
    
    // Apply meal type filter if provided
    if (mealType) {
      query = query.eq('meal_type', mealType)
    }
    
    const { data: meals, error } = await query

    if (error) {
      console.error('Error fetching meals:', error)
      return apiError('Failed to fetch meals', ERROR_CODES.DATABASE_ERROR, 500)
    }

    console.log('Successfully fetched meals:', meals?.length || 0)
    return apiSuccess(meals || [])
  } catch (error: any) {
    console.error('Error in GET /api/meals:', error)
    return serverError(error.message)
  }
}

// POST - Create new meal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Creating meal with data:', body)
    
    // Handle copy from template
    if (body.copyFromTemplate && body.templateId) {
      return await copyFromTemplate(body)
    }

    // First, get or create a default camp
    let campId = '00000000-0000-0000-0000-000000000001'
    
    // Try to get the first camp from the database
    const { data: camps } = await supabase
      .from('camps')
      .select('id')
      .limit(1)
    
    if (camps && camps.length > 0) {
      campId = camps[0].id
    }

    // Handle recurrence if specified
    let recurrenceRuleId = null
    if (body.recurrence && body.recurrence.frequency !== 'none') {
      const recurrenceData = {
        camp_id: campId,
        rule_name: `${body.name} - Recurrence`,
        frequency: body.recurrence.frequency,
        interval_value: body.recurrence.interval || 1,
        days_of_week: body.recurrence.selectedDays || body.recurrence.daysOfWeek || null,
        day_of_month: body.recurrence.dayOfMonth || null,
        end_date: body.recurrence.endDate || null,
        max_occurrences: body.recurrence.maxOccurrences || null,
        is_active: true
      }

      const { data: recurrenceRule, error: recurrenceError } = await supabase
        .from('recurrence_rules')
        .insert([recurrenceData])
        .select()
        .single()

      if (recurrenceError) {
        console.error('Error creating recurrence rule:', recurrenceError)
        return apiError('Failed to create recurrence rule', ERROR_CODES.DATABASE_ERROR, 500)
      }

      recurrenceRuleId = recurrenceRule.id
    }

    // Only use basic fields that should exist in any meals table
    const mealData = {
      meal_id: `M-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      camp_id: campId,
      name: body.name,
      description: body.description || null,
      meal_type: body.meal_type,
      meal_date: body.meal_date || new Date().toISOString().split('T')[0],
      ingredients: body.ingredients || null,
      dietary_restrictions: body.dietary_restrictions || null,
      dietary_option: body.dietary_option || 'meat', // Add dietary option field
      planned_portions: body.planned_portions || 0,
      estimated_cost_per_portion: body.estimated_cost_per_portion || null,
      prep_time_minutes: body.prep_time_minutes || null,
      cooking_time_minutes: body.cooking_time_minutes || null,
      kitchen_notes: body.kitchen_notes || null,
      is_template: body.is_template || false,
      is_active: body.is_active !== undefined ? body.is_active : true,
      recurrence_rule_id: recurrenceRuleId
    }

    console.log('Filtered meal data:', mealData)

    const { data: meal, error } = await supabase
      .from('meals')
      .insert([mealData])
      .select()
      .single()

    if (error) {
      console.error('Error creating meal:', error)
      return apiError('Failed to create meal', ERROR_CODES.DATABASE_ERROR, 500)
    }

    // If recurrence is enabled, create additional meals
    if (body.recurrence && body.recurrence.frequency !== 'none' && recurrenceRuleId) {
      await createRecurringMeals(meal, body.recurrence, campId, recurrenceRuleId)
    }

    console.log('Successfully created meal:', meal)
    return apiSuccess(meal)
  } catch (error: any) {
    console.error('Error in POST /api/meals:', error)
    return serverError(error.message)
  }
}

// PUT - Update meal
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    console.log('PUT /api/meals - Updating meal:', { id, updateData })

    if (!id) {
      return apiError('Meal ID is required', ERROR_CODES.MISSING_REQUIRED_FIELD, 400)
    }

    const { data: meal, error } = await supabase
      .from('meals')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating meal:', error)
      return apiError('Failed to update meal', ERROR_CODES.DATABASE_ERROR, 500)
    }

    console.log('Successfully updated meal:', meal)

    return apiSuccess(meal)
  } catch (error: any) {
    console.error('Error in PUT /api/meals:', error)
    return serverError(error.message)
  }
}

// DELETE - Delete meal(s)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const bulkDelete = searchParams.get('bulk_delete')
    const name = searchParams.get('name')
    const mealType = searchParams.get('meal_type')
    const bulkIds = searchParams.get('bulk_ids')

    // Handle bulk delete by IDs (multi-select)
    if (bulkIds) {
      try {
        const ids = JSON.parse(bulkIds)
        
        if (!Array.isArray(ids) || ids.length === 0) {
          return apiError('Invalid meal IDs array', ERROR_CODES.INVALID_INPUT, 400)
        }

        console.log(`Bulk deleting ${ids.length} meals by IDs:`, ids)

        const { error: deleteError } = await supabase
          .from('meals')
          .delete()
          .in('id', ids)

        if (deleteError) {
          console.error('Error bulk deleting meals by IDs:', deleteError)
          return apiError('Failed to delete meals', ERROR_CODES.DATABASE_ERROR, 500)
        }

        console.log(`Successfully deleted ${ids.length} meals by IDs`)
        return apiSuccess({ 
          deletedCount: ids.length,
          message: `Successfully deleted ${ids.length} meals`
        })
      } catch (parseError) {
        console.error('Error parsing meal IDs:', parseError)
        return apiError('Invalid meal IDs format', ERROR_CODES.INVALID_FORMAT, 400)
      }
    }

    // Handle bulk delete by name and meal_type
    if (bulkDelete === 'true' && name && mealType) {
      console.log(`Bulk deleting meals with name "${name}" and meal_type "${mealType}"`)
      
      const { data: mealsToDelete, error: fetchError } = await supabase
        .from('meals')
        .select('id, name, meal_type')
        .eq('name', name)
        .eq('meal_type', mealType)
        .eq('is_template', false) // Only delete regular meals, not templates

        if (fetchError) {
          console.error('Error fetching meals to delete:', fetchError)
          return apiError('Failed to fetch meals', ERROR_CODES.DATABASE_ERROR, 500)
        }

        if (!mealsToDelete || mealsToDelete.length === 0) {
          return apiSuccess({ deletedCount: 0, message: 'No meals found to delete' })
        }

      console.log(`Found ${mealsToDelete.length} meals to delete:`, mealsToDelete.map(m => ({ id: m.id, name: m.name, meal_type: m.meal_type })))

      const { error: deleteError } = await supabase
        .from('meals')
        .delete()
        .eq('name', name)
        .eq('meal_type', mealType)
        .eq('is_template', false)

        if (deleteError) {
          console.error('Error bulk deleting meals:', deleteError)
          return apiError('Failed to delete meals', ERROR_CODES.DATABASE_ERROR, 500)
        }

        console.log(`Successfully deleted ${mealsToDelete.length} meals`)
        return apiSuccess({ 
          deletedCount: mealsToDelete.length,
          message: `Successfully deleted ${mealsToDelete.length} meals with name "${name}" and meal_type "${mealType}"`
        })
    }

    // Handle single meal delete
    if (!id) {
      return apiError('Meal ID is required for single delete', ERROR_CODES.MISSING_REQUIRED_FIELD, 400)
    }

    const { error } = await supabase
      .from('meals')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting meal:', error)
      return apiError('Failed to delete meal', ERROR_CODES.DATABASE_ERROR, 500)
    }

    return apiSuccess({ message: 'Meal deleted successfully' })
  } catch (error: any) {
    console.error('Error in DELETE /api/meals:', error)
    return serverError(error.message)
  }
}
