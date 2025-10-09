import { createClient } from './supabase'

export interface RecurrenceRule {
  id?: string
  type: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'
  interval_count: number
  days_of_week?: number[] // 0=Sunday, 1=Monday, etc.
  day_of_month?: number
  end_date?: string
  max_occurrences?: number
}

export interface MealTemplate {
  id?: string
  parent_id?: string
  recurrence_rule_id?: string
  name: string
  description?: string
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  serving_date: string
  serving_time: string
  price?: number
  max_portions?: number
  ingredients?: string[]
  allergens?: string[]
  calories_per_portion?: number
  dietary_options?: string[]
  status: 'draft' | 'published' | 'archived'
  preparation_time?: number
  kitchen_notes?: string,
  created_by?: string,
}

export interface EventTemplate {
  id?: string
  parent_id?: string
  recurrence_rule_id?: string
  title: string
  description?: string
  event_type?: string
  start_time: string
  end_time: string
  location?: string
  max_participants?: number
  price?: number
  organizer_id?: string
  status: 'draft' | 'published' | 'archived'
  equipment_needed?: string[]
  special_requirements?: string
  weather_dependent?: boolean,
  created_by?: string,
}

export interface SurfLessonTemplate {
  id?: string
  parent_id?: string
  recurrence_rule_id?: string
  title: string
  description?: string
  instructor_id?: string
  start_time: string
  end_time: string
  max_participants: number
  skill_level: 'beginner' | 'intermediate' | 'advanced'
  location?: string
  price?: number
  status: 'draft' | 'published' | 'archived'
  equipment_included?: string[]
  prerequisites?: string
  weather_conditions?: string[],
  created_by?: string
}

class RecurrenceService {
  private supabase = createClient()

  // Wiederholungsregel erstellen
  async createRecurrenceRule(rule: Omit<RecurrenceRule, 'id'>): Promise<RecurrenceRule | null> {
    try {
      const { data, error } = await this.supabase
        .from('recurrence_rules')
        .insert([rule])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating recurrence rule:', error)
      return null
    }
  }

  // Meal kopieren
  async copyMeal(sourceId: string, modifications: Partial<MealTemplate> = {}): Promise<MealTemplate | null> {
    try {
      // Original Meal laden
      const { data: originalMeal, error: fetchError } = await this.supabase
        .from('meals')
        .select('*')
        .eq('id', sourceId)
        .single()

      if (fetchError) throw fetchError

      // Kopie erstellen mit Modifikationen
      const copyData = {
        ...originalMeal,
        ...modifications,
        id: undefined, // Neue ID generieren lassen
        parent_id: sourceId,
        status: 'draft', // Kopien starten immer als Draft
        created_at: undefined,
        updated_at: undefined
      }

      const { data, error } = await this.supabase
        .from('meals')
        .insert([copyData])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error copying meal:', error)
      return null
    }
  }

  // Event kopieren
  async copyEvent(sourceId: string, modifications: Partial<EventTemplate> = {}): Promise<EventTemplate | null> {
    try {
      const { data: originalEvent, error: fetchError } = await this.supabase
        .from('events')
        .select('*')
        .eq('id', sourceId)
        .single()

      if (fetchError) throw fetchError

      const copyData = {
        ...originalEvent,
        ...modifications,
        id: undefined,
        parent_id: sourceId,
        status: 'draft',
        current_participants: 0, // Reset participant count
        created_at: undefined,
        updated_at: undefined
      }

      const { data, error } = await this.supabase
        .from('events')
        .insert([copyData])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error copying event:', error)
      return null
    }
  }

  // Surf Lesson kopieren
  async copySurfLesson(sourceId: string, modifications: Partial<SurfLessonTemplate> = {}): Promise<SurfLessonTemplate | null> {
    try {
      const { data: originalLesson, error: fetchError } = await this.supabase
        .from('surf_lessons')
        .select('*')
        .eq('id', sourceId)
        .single()

      if (fetchError) throw fetchError

      const copyData = {
        ...originalLesson,
        ...modifications,
        id: undefined,
        parent_id: sourceId,
        status: 'draft',
        current_participants: 0,
        created_at: undefined,
        updated_at: undefined
      }

      const { data, error } = await this.supabase
        .from('surf_lessons')
        .insert([copyData])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error copying surf lesson:', error)
      return null
    }
  }

  // Wiederholende Events generieren
  async generateRecurringEvents(
    templateId: string,
    startDate: string,
    endDate?: string
  ): Promise<EventTemplate[]> {
    try {
      // Template laden
      const { data: template, error: templateError } = await this.supabase
        .from('events')
        .select('*, recurrence_rules(*)')
        .eq('id', templateId)
        .single()

      if (templateError) throw templateError
      if (!template.recurrence_rules) return []

      const instances: EventTemplate[] = []
      const rule = template.recurrence_rules
      const start = new Date(startDate)
      const end = endDate ? new Date(endDate) : new Date(start.getTime() + 365 * 24 * 60 * 60 * 1000) // 1 Jahr default

      let currentDate = new Date(start)
      let count = 0
      const maxInstances = rule.max_occurrences || 100

      while (currentDate <= end && count < maxInstances) {
        let shouldCreate = false

        switch (rule.type) {
          case 'daily':
            shouldCreate = true
            currentDate.setDate(currentDate.getDate() + rule.interval_count)
            break

          case 'weekly':
            if (rule.days_of_week?.includes(currentDate.getDay())) {
              shouldCreate = true
            }
            currentDate.setDate(currentDate.getDate() + 1)
            break

          case 'monthly':
            if (currentDate.getDate() === rule.day_of_month) {
              shouldCreate = true
              currentDate.setMonth(currentDate.getMonth() + rule.interval_count)
            } else {
              currentDate.setDate(currentDate.getDate() + 1)
            }
            break
        }

        if (shouldCreate) {
          const newStartTime = new Date(template.start_time)
          const newEndTime = new Date(template.end_time)

          // Update date while keeping time
          newStartTime.setFullYear(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())
          newEndTime.setFullYear(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())

          const instanceData = {
            ...template,
            id: undefined,
            parent_id: templateId,
            start_time: newStartTime.toISOString(),
            end_time: newEndTime.toISOString(),
            status: template.status, // Behalte ursprünglichen Status
            current_participants: 0, // Reset participant count
            created_at: undefined,
            updated_at: undefined,
            recurrence_rule_id: undefined // Instanzen haben keine eigene Regel
          }

          const { data: instance, error } = await this.supabase
            .from('events')
            .insert([instanceData])
            .select()
            .single()

          if (!error && instance) {
            instances.push(instance)
            count++
          }
        }

        // Sicherheitsabbruch
        if (count >= maxInstances) break
      }

      return instances
    } catch (error) {
      console.error('Error generating recurring events:', error)
      return []
    }
  }

  // Wiederholende Surf Lessons generieren
  async generateRecurringSurfLessons(
    templateId: string,
    startDate: string,
    endDate?: string
  ): Promise<SurfLessonTemplate[]> {
    try {
      // Template laden
      const { data: template, error: templateError } = await this.supabase
        .from('surf_lessons')
        .select('*, recurrence_rules(*)')
        .eq('id', templateId)
        .single()

      if (templateError) throw templateError
      if (!template.recurrence_rules) return []

      const instances: SurfLessonTemplate[] = []
      const rule = template.recurrence_rules
      const start = new Date(startDate)
      const end = endDate ? new Date(endDate) : new Date(start.getTime() + 365 * 24 * 60 * 60 * 1000)

      let currentDate = new Date(start)
      let count = 0
      const maxInstances = rule.max_occurrences || 100

      while (currentDate <= end && count < maxInstances) {
        let shouldCreate = false

        switch (rule.type) {
          case 'daily':
            shouldCreate = true
            currentDate.setDate(currentDate.getDate() + rule.interval_count)
            break

          case 'weekly':
            if (rule.days_of_week?.includes(currentDate.getDay())) {
              shouldCreate = true
            }
            currentDate.setDate(currentDate.getDate() + 1)
            break

          case 'monthly':
            if (currentDate.getDate() === rule.day_of_month) {
              shouldCreate = true
              currentDate.setMonth(currentDate.getMonth() + rule.interval_count)
            } else {
              currentDate.setDate(currentDate.getDate() + 1)
            }
            break
        }

        if (shouldCreate) {
          const newStartTime = new Date(template.start_time)
          const newEndTime = new Date(template.end_time)

          // Update date while keeping time
          newStartTime.setFullYear(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())
          newEndTime.setFullYear(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())

          const instanceData = {
            ...template,
            id: undefined,
            parent_id: templateId,
            start_time: newStartTime.toISOString(),
            end_time: newEndTime.toISOString(),
            status: template.status,
            current_participants: 0,
            created_at: undefined,
            updated_at: undefined,
            recurrence_rule_id: undefined
          }

          const { data: instance, error } = await this.supabase
            .from('surf_lessons')
            .insert([instanceData])
            .select()
            .single()

          if (!error && instance) {
            instances.push(instance)
            count++
          }
        }

        if (count >= maxInstances) break
      }

      return instances
    } catch (error) {
      console.error('Error generating recurring surf lessons:', error)
      return []
    }
  }

  // Wiederholende Instanzen generieren
  async generateRecurringMeals(
    templateId: string,
    startDate: string,
    endDate?: string
  ): Promise<MealTemplate[]> {
    try {
      // Template laden
      const { data: template, error: templateError } = await this.supabase
        .from('meals')
        .select('*, recurrence_rules(*)')
        .eq('id', templateId)
        .single()

      if (templateError) throw templateError
      if (!template.recurrence_rules) return []

      const instances: MealTemplate[] = []
      const rule = template.recurrence_rules
      const start = new Date(startDate)
      const end = endDate ? new Date(endDate) : new Date(start.getTime() + 365 * 24 * 60 * 60 * 1000) // 1 Jahr default

      let currentDate = new Date(start)
      let count = 0
      const maxInstances = rule.max_occurrences || 100

      while (currentDate <= end && count < maxInstances) {
        let shouldCreate = false

        switch (rule.type) {
          case 'daily':
            shouldCreate = true
            currentDate.setDate(currentDate.getDate() + rule.interval_count)
            break

          case 'weekly':
            if (rule.days_of_week?.includes(currentDate.getDay())) {
              shouldCreate = true
            }
            currentDate.setDate(currentDate.getDate() + 1)
            break

          case 'monthly':
            if (currentDate.getDate() === rule.day_of_month) {
              shouldCreate = true
              currentDate.setMonth(currentDate.getMonth() + rule.interval_count)
            } else {
              currentDate.setDate(currentDate.getDate() + 1)
            }
            break
        }

        if (shouldCreate) {
          const instanceData = {
            ...template,
            id: undefined,
            parent_id: templateId,
            serving_date: currentDate.toISOString().split('T')[0],
            status: template.status, // Behalte ursprünglichen Status
            created_at: undefined,
            updated_at: undefined,
            recurrence_rule_id: undefined // Instanzen haben keine eigene Regel
          }

          const { data: instance, error } = await this.supabase
            .from('meals')
            .insert([instanceData])
            .select()
            .single()

          if (!error && instance) {
            instances.push(instance)
            count++
          }
        }

        // Sicherheitsabbruch
        if (count >= maxInstances) break
      }

      return instances
    } catch (error) {
      console.error('Error generating recurring meals:', error)
      return []
    }
  }

  // Status ändern (Draft/Published)
  async updateStatus(
    table: 'meals' | 'events' | 'surf_lessons',
    id: string,
    status: 'draft' | 'published' | 'archived'
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from(table)
        .update({ status })
        .eq('id', id)

      return !error
    } catch (error) {
      console.error('Error updating status:', error)
      return false
    }
  }

  // Templates laden
  async getTemplates(type: 'meal' | 'event' | 'lesson'): Promise<any[]> {
    // User has requested to remove template functionality.
    // Returning an empty array to prevent errors.
    return []
  }



  // Kommende Instanzen einer Serie laden
  async getUpcomingInstances(
    table: 'meals' | 'events' | 'surf_lessons',
    parentId: string,
    limit = 10
  ): Promise<any[]> {
    try {
      const timeColumn = table === 'meals' ? 'meal_date' : 'start_time'
      const currentTime = table === 'meals' ? new Date().toISOString().split('T')[0] : new Date().toISOString()

      const { data, error } = await this.supabase
        .from(table)
        .select('*')
        .eq('parent_id', parentId)
        .gte(timeColumn, currentTime)
        .order(timeColumn)
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error loading upcoming instances:', error)
      return []
    }
  }
}

export const recurrenceService = new RecurrenceService()