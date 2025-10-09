import { createClient } from './supabase'

export interface Guest {
  id: string
  guest_id: string
  name: string
  mobile_number?: string
  instagram?: string
  surf_package: boolean
  is_active: boolean
  surf_level?: string
  allergies?: any
  other_allergies?: string
  notes?: string
  image_url?: string
  created_at: string
  updated_at: string
}

export interface Staff {
  id: string
  staff_id: string
  name: string
  mobile_number?: string
  labels?: string[]
  is_active: boolean
  image_url?: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Meal {
  id: string
  meal_id: string
  name: string
  meal_type: 'breakfast' | 'lunch' | 'dinner'
  meal_date: string
  description?: string
  ingredients?: string[]
  dietary_restrictions?: string[]
  planned_portions?: number
  actual_portions?: number
  prep_time_minutes?: number
  cooking_time_minutes?: number
  kitchen_notes?: string
  is_active: boolean
  is_confirmed: boolean
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  parent_id?: string
  recurrence_rule_id?: string
  title: string
  description?: string
  event_type?: string
  start_time: string
  end_time: string
  location?: string
  max_participants?: number
  current_participants: number
  price?: number
  status: 'draft' | 'published' | 'archived'
  equipment_needed?: string[]
  special_requirements?: string
  weather_dependent: boolean,
  created_by?: string,
  created_at: string
  updated_at: string
}

export interface SurfLesson {
  id: string
  parent_id?: string
  recurrence_rule_id?: string
  title: string
  description?: string
  instructor_ids?: string[]
  start_time: string
  end_time: string
  max_participants: number
  current_participants: number
  skill_level: 'beginner' | 'intermediate' | 'advanced'
  location?: string
  price?: number
  status: 'draft' | 'published' | 'archived'
  equipment_included?: string[]
  prerequisites?: string
  weather_conditions?: string[],
  created_by?: string,
  created_at: string
  updated_at: string
}

export interface SurfParticipant {
  id: string
  lesson_id: string
  guest_id: string
  participation_status: 'registered' | 'attended' | 'no_show' | 'cancelled'
  skill_assessment?: string
  equipment_size?: string
  registered_at: string
  attended_at?: string
  notes?: string
}

class DatabaseService {
  private supabase = createClient()

  // Guest operations
  async getGuests(): Promise<Guest[]> {
    const { data, error } = await this.supabase
      .from('guests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching guests:', error)
      return []
    }
    return data || []
  }

  async createGuest(guest: Omit<Guest, 'id' | 'created_at' | 'updated_at'>): Promise<Guest | null> {
    const { data, error } = await this.supabase
      .from('guests')
      .insert([guest])
      .select()
      .single()

    if (error) {
      console.error('Error creating guest:', error)
      return null
    }
    return data
  }

  async updateGuest(id: string, updates: Partial<Guest>): Promise<Guest | null> {
    const { data, error } = await this.supabase
      .from('guests')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating guest:', error)
      return null
    }
    return data
  }

  async deleteGuest(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('guests')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting guest:', error)
      return false
    }
    return true
  }

  // Staff operations
  async getStaff(): Promise<Staff[]> {
    const { data, error } = await this.supabase
      .from('staff')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching staff:', error)
      return []
    }
    return data || []
  }

  async createStaff(staff: Omit<Staff, 'id' | 'created_at'>): Promise<Staff | null> {
    const { data, error } = await this.supabase
      .from('staff')
      .insert([staff])
      .select()
      .single()

    if (error) {
      console.error('Error creating staff:', error)
      return null
    }
    return data
  }

  async updateStaff(id: string, updates: Partial<Staff>): Promise<Staff | null> {
    const { data, error } = await this.supabase
      .from('staff')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating staff:', error)
      return null
    }
    return data
  }

  // Meal operations
  async getMeals(): Promise<Meal[]> {
    const { data, error } = await this.supabase
      .from('meals')
      .select('*')
      .order('meal_date', { ascending: true })

    if (error) {
      console.error('Error fetching meals:', JSON.stringify(error, null, 2))
      return []
    }
    return data || []
  }

  async createMeal(meal: Omit<Meal, 'id' | 'created_at' | 'updated_at'>): Promise<Meal | null> {
    const { data, error } = await this.supabase
      .from('meals')
      .insert([meal])
      .select()
      .single()

    if (error) {
      console.error('Error creating meal:', error)
      return null
    }
    return data
  }

  async updateMeal(id: string, updates: Partial<Meal>): Promise<Meal | null> {
    const { data, error } = await this.supabase
      .from('meals')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating meal:', error)
      return null
    }
    return data
  }

  async deleteMeal(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('meals')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting meal:', error)
      return false
    }
    return true
  }

  // Lesson participant operations
  async getSurfParticipants(lessonId: string): Promise<SurfParticipant[]> {
    const { data, error } = await this.supabase
      .from('surf_participants')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('registered_at', { ascending: false })

    if (error) {
      console.error('Error fetching surf participants:', error)
      return []
    }
    return data || []
  }

  async addGuestToLesson(lessonId: string, guestId: string, skillAssessment?: string, equipmentSize?: string): Promise<SurfParticipant | null> {
    const { data, error } = await this.supabase
      .from('surf_participants')
      .insert([{
        lesson_id: lessonId,
        guest_id: guestId,
        skill_assessment: skillAssessment,
        equipment_size: equipmentSize,
        participation_status: 'registered'
      }])
      .select()
      .single()

    if (error) {
      console.error('Error adding guest to lesson:', error)
      return null
    }

    // Update current participants count
    await this.updateSurfLesson(lessonId, {
      current_participants: await this.getCurrentParticipantCount(lessonId)
    })

    return data
  }

  async removeGuestFromLesson(participantId: string): Promise<boolean> {
    const participant = await this.supabase
      .from('surf_participants')
      .select('lesson_id')
      .eq('id', participantId)
      .single()

    const { error } = await this.supabase
      .from('surf_participants')
      .delete()
      .eq('id', participantId)

    if (error) {
      console.error('Error removing guest from lesson:', error)
      return false
    }

    // Update current participants count
    if (participant.data) {
      await this.updateSurfLesson(participant.data.lesson_id, {
        current_participants: await this.getCurrentParticipantCount(participant.data.lesson_id)
      })
    }

    return true
  }

  async updateParticipantStatus(participantId: string, status: 'registered' | 'attended' | 'no_show' | 'cancelled'): Promise<boolean> {
    const { error } = await this.supabase
      .from('surf_participants')
      .update({
        participation_status: status,
        attended_at: status === 'attended' ? new Date().toISOString() : null
      })
      .eq('id', participantId)

    if (error) {
      console.error('Error updating participant status:', error)
      return false
    }
    return true
  }

  private async getCurrentParticipantCount(lessonId: string): Promise<number> {
    const { data, error } = await this.supabase
      .from('surf_participants')
      .select('id')
      .eq('lesson_id', lessonId)
      .in('participation_status', ['registered', 'attended'])

    if (error) {
      console.error('Error counting participants:', error)
      return 0
    }
    return data?.length || 0
  }

  // Event operations
  async getEvents(status?: 'draft' | 'published' | 'archived'): Promise<Event[]> {
    let query = this.supabase
      .from('events')
      .select('*')
      .order('start_time', { ascending: true })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching events:', error)
      return []
    }
    return data || []
  }

  async createEvent(event: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event | null> {
    const { data, error } = await this.supabase
      .from('events')
      .insert([event])
      .select()
      .single()

    if (error) {
      console.error('Error creating event:', error)
      return null
    }
    return data
  }

  async updateEvent(id: string, updates: Partial<Event>): Promise<Event | null> {
    const { data, error } = await this.supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating event:', error)
      return null
    }
    return data
  }

  async deleteEvent(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('events')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting event:', error)
      return false
    }
    return true
  }

  // Surf Lesson operations
  async getSurfLessons(status?: 'draft' | 'published' | 'archived'): Promise<SurfLesson[]> {
    let query = this.supabase
      .from('surf_lessons')
      .select('*')
      .order('start_time', { ascending: true })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching surf lessons:', error)
      return []
    }
    return data || []
  }

  async createSurfLesson(lesson: Omit<SurfLesson, 'id' | 'created_at' | 'updated_at'>): Promise<SurfLesson | null> {
    const { data, error } = await this.supabase
      .from('surf_lessons')
      .insert([lesson])
      .select()
      .single()

    if (error) {
      console.error('Error creating surf lesson:', error)
      return null
    }
    return data
  }

  async updateSurfLesson(id: string, updates: Partial<SurfLesson>): Promise<SurfLesson | null> {
    const { data, error } = await this.supabase
      .from('surf_lessons')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating surf lesson:', error)
      return null
    }
    return data
  }

  async deleteSurfLesson(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('surf_lessons')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting surf lesson:', error)
      return false
    }
    return true
  }

  // Dashboard statistics
  async getDashboardStats() {
    try {
      const [guestsResult, staffResult, mealsResult] = await Promise.all([
        this.supabase.from('guests').select('is_active'),
        this.supabase.from('staff').select('is_active'),
        this.supabase.from('meals').select('meal_date, is_active').gte('meal_date', new Date().toISOString().split('T')[0])
      ])

      const guests = guestsResult.data || []
      const staff = staffResult.data || []
      const meals = mealsResult.data || []

      return {
        guests: {
          total: guests.length,
          inHouse: guests.filter(g => g.is_active).length,
          surfPackage: guests.filter(g => g.surf_package).length,
          surfPackagePercentage: Math.round((guests.filter(g => g.surf_package).length / guests.length) * 100) || 0
        },
        lessons: {
          today: 0,
          beginnerCount: 0,
          intermediateCount: 0,
          advancedCount: 0
        },
        meals: {
          ordersToday: meals.filter(m => m.meal_date === new Date().toISOString().split('T')[0]).length,
          meatCount: 0,
          vegetarianCount: 0,
          veganCount: 0,
          otherCount: 0
        },
        events: {
          today: 0,
          totalAttendance: 0
        },
        staff: {
          active: staff.filter(s => s.is_active).length
        },
        inventory: {
          bedsOccupied: 0,
          bedsTotal: 0,
          occupancyPercentage: 0,
          roomsCount: 0
        },
        shifts: { today: 0 }
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      // Return fallback mock data if database fails
      return {
        guests: { total: 0, inHouse: 0, surfPackage: 0, surfPackagePercentage: 0 },
        lessons: { today: 0, beginnerCount: 0, intermediateCount: 0, advancedCount: 0 },
        meals: { ordersToday: 0, meatCount: 0, vegetarianCount: 0, veganCount: 0, otherCount: 0 },
        events: { today: 0, totalAttendance: 0 },
        staff: { active: 0 },
        inventory: { bedsOccupied: 0, bedsTotal: 0, occupancyPercentage: 0, roomsCount: 0 },
        shifts: { today: 0 }
      }
    }
  }
}

export const databaseService = new DatabaseService()