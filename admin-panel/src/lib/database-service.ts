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
  dietary_option?: 'meat' | 'animal_product' | 'vegetarian' | 'vegan' | 'other'
  planned_portions?: number
  actual_portions?: number
  prep_time_minutes?: number
  cooking_time_minutes?: number
  kitchen_notes?: string
  is_active: boolean
  is_confirmed: boolean
  is_template?: boolean
  status?: 'draft' | 'published' | 'archived'
  start_time?: string
  end_time?: string
  image_path?: string
  calories_per_portion?: number
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

export interface Lesson {
  id: string
  lesson_id: string
  camp_id: string
  title: string
  category: 'lesson' | 'theory' | 'other'
  location: string
  start_at: string
  end_at: string
  status: 'draft' | 'published'
  alert_time?: string
  alert_text?: string
  description?: string
  max_participants?: number
  created_by?: string
  created_at: string
  updated_at: string
}

export interface LessonInstructor {
  id: string
  lesson_id: string
  staff_id: string
  assigned_at: string
  assigned_by?: string
}

export interface LessonAssignment {
  id: string
  lesson_id: string
  guest_id: string
  assigned_at: string
  assigned_by?: string
}

export interface AssessmentQuestion {
  id: string
  camp_id: string
  question_text: string
  category: 'experience' | 'safety' | 'preferences' | 'goals'
  scale_labels: Record<string, string>
  is_required: boolean
  is_active: boolean
  sort_order: number
}

export interface GuestAssessment {
  id: string
  guest_id: string
  question_id: string
  answer_value: number
  answered_at: string
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

export interface Room {
  id: string
  room_id: string
  camp_id: string
  name: string
  base_name: string
  room_type: 'dormitory' | 'private' | 'suite'
  description?: string
  max_capacity: number
  floor_number: number
  room_number?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Bed {
  id: string
  bed_id: string
  camp_id: string
  room_id: string
  identifier: string
  bed_type: 'single' | 'double' | 'bunk_upper' | 'bunk_lower' | 'queen' | 'king' | 'sofa' | 'extra' | 'crib'
  capacity: number
  current_occupancy: number
  group_id?: string
  slot: 'single' | 'upper' | 'lower'
  is_active: boolean
  notes?: string
  created_at: string
  updated_at: string
}

export interface BedAssignment {
  id: string
  camp_id: string
  guest_id: string
  bed_id: string
  status: 'active' | 'checked_out' | 'completed'
  assigned_at: string
  assigned_by?: string
  checked_out_at?: string
  completed_at?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface GearItem {
  id: string
  equipment_id: string
  camp_id: string
  name: string
  base_name: string
  category: string
  size?: string
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'needs_repair'
  is_active: boolean
  notes?: string
  created_at: string
  updated_at: string
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

  // Lesson operations
  async getLessons(date?: string, status?: 'draft' | 'published'): Promise<Lesson[]> {
    let query = this.supabase
      .from('lessons')
      .select('*')
      .order('start_at', { ascending: true })

    if (date) {
      query = query.gte('start_at', `${date}T00:00:00`)
               .lt('start_at', `${date}T23:59:59`)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching lessons:', error)
      return []
    }
    return data || []
  }

  async createLesson(lesson: Omit<Lesson, 'id' | 'created_at' | 'updated_at'>): Promise<Lesson | null> {
    const { data, error } = await this.supabase
      .from('lessons')
      .insert([lesson])
      .select()
      .single()

    if (error) {
      console.error('Error creating lesson:', error)
      return null
    }
    return data
  }

  async updateLesson(id: string, updates: Partial<Lesson>): Promise<Lesson | null> {
    const { data, error } = await this.supabase
      .from('lessons')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating lesson:', error)
      return null
    }
    return data
  }

  async deleteLesson(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('lessons')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting lesson:', error)
      return false
    }
    return true
  }

  // Lesson Instructor operations
  async getLessonInstructors(lessonId: string): Promise<LessonInstructor[]> {
    const { data, error } = await this.supabase
      .from('lesson_instructors')
      .select('*')
      .eq('lesson_id', lessonId)

    if (error) {
      console.error('Error fetching lesson instructors:', error)
      return []
    }
    return data || []
  }

  async assignInstructorsToLesson(lessonId: string, staffIds: string[]): Promise<boolean> {
    // First, remove existing instructors
    await this.supabase
      .from('lesson_instructors')
      .delete()
      .eq('lesson_id', lessonId)

    // Then add new ones
    const instructors = staffIds.map(staffId => ({
      lesson_id: lessonId,
      staff_id: staffId,
      assigned_at: new Date().toISOString()
    }))

    const { error } = await this.supabase
      .from('lesson_instructors')
      .insert(instructors)

    if (error) {
      console.error('Error assigning instructors:', error)
      return false
    }
    return true
  }

  // Lesson Assignment operations
  async getLessonAssignments(lessonId: string): Promise<LessonAssignment[]> {
    const { data, error } = await this.supabase
      .from('lesson_assignments')
      .select('*')
      .eq('lesson_id', lessonId)

    if (error) {
      console.error('Error fetching lesson assignments:', error)
      return []
    }
    return data || []
  }

  async assignGuestsToLesson(lessonId: string, guestIds: string[]): Promise<boolean> {
    // First, remove existing assignments
    await this.supabase
      .from('lesson_assignments')
      .delete()
      .eq('lesson_id', lessonId)

    // Then add new ones
    const assignments = guestIds.map(guestId => ({
      lesson_id: lessonId,
      guest_id: guestId,
      assigned_at: new Date().toISOString()
    }))

    const { error } = await this.supabase
      .from('lesson_assignments')
      .insert(assignments)

    if (error) {
      console.error('Error assigning guests:', error)
      return false
    }
    return true
  }

  // Assessment operations
  async getAssessmentQuestions(): Promise<AssessmentQuestion[]> {
    const { data, error } = await this.supabase
      .from('assessment_questions')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching assessment questions:', error)
      return []
    }
    return data || []
  }

  async createAssessmentQuestion(question: Omit<AssessmentQuestion, 'id'>): Promise<AssessmentQuestion | null> {
    const { data, error } = await this.supabase
      .from('assessment_questions')
      .insert([question])
      .select()
      .single()

    if (error) {
      console.error('Error creating assessment question:', error)
      return null
    }
    return data
  }

  async getGuestAssessments(guestId: string): Promise<GuestAssessment[]> {
    const { data, error } = await this.supabase
      .from('guest_assessments')
      .select('*')
      .eq('guest_id', guestId)

    if (error) {
      console.error('Error fetching guest assessments:', error)
      return []
    }
    return data || []
  }

  async updateGuestSurfLevel(guestId: string, level: 'beginner' | 'intermediate' | 'advanced', setBy: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('guests')
      .update({
        surf_level: level,
        surf_level_set_by: setBy,
        surf_level_set_at: new Date().toISOString()
      })
      .eq('id', guestId)

    if (error) {
      console.error('Error updating guest surf level:', error)
      return false
    }
    return true
  }

  // Package Guests operations
  async getSurfPackageGuests(): Promise<Guest[]> {
    const { data, error } = await this.supabase
      .from('guests')
      .select('*')
      .eq('is_active', true)
      .eq('surf_package', true)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching surf package guests:', error)
      return []
    }
    return data || []
  }

  // Check guest lesson conflicts for business rules
  async checkGuestLessonConflict(guestId: string, lessonDate: string, category: 'lesson' | 'theory'): Promise<Lesson | null> {
    const startOfDay = `${lessonDate}T00:00:00`
    const endOfDay = `${lessonDate}T23:59:59`

    const { data, error } = await this.supabase
      .from('lesson_assignments')
      .select(`
        *,
        lessons (
          id,
          title,
          category,
          start_at,
          end_at
        )
      `)
      .eq('guest_id', guestId)
      .gte('lessons.start_at', startOfDay)
      .lte('lessons.start_at', endOfDay)
      .eq('lessons.category', category)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error checking lesson conflict:', error)
      return null
    }

    return data?.lessons || null
  }

  // Get instructors with instructor role
  async getInstructors(): Promise<Staff[]> {
    const { data, error } = await this.supabase
      .from('staff')
      .select('*')
      .eq('is_active', true)
      .contains('labels', ['instructor'])
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching instructors:', error)
      return []
    }
    return data || []
  }

  // Duplicate lesson
  async duplicateLesson(lessonId: string): Promise<Lesson | null> {
    // Get original lesson
    const { data: originalLesson, error: fetchError } = await this.supabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .single()

    if (fetchError) {
      console.error('Error fetching original lesson:', fetchError)
      return null
    }

    // Create duplicate with modified title and draft status
    const duplicateData = {
      ...originalLesson,
      id: undefined,
      lesson_id: undefined,
      title: `${originalLesson.title} (Kopie)`,
      status: 'draft' as const,
      created_at: undefined,
      updated_at: undefined
    }

    const { data: newLesson, error: createError } = await this.supabase
      .from('lessons')
      .insert([duplicateData])
      .select()
      .single()

    if (createError) {
      console.error('Error creating duplicate lesson:', createError)
      return null
    }

    // Copy instructors
    const instructors = await this.getLessonInstructors(lessonId)
    if (instructors.length > 0) {
      await this.assignInstructorsToLesson(newLesson.id, instructors.map(i => i.staff_id))
    }

    return newLesson
  }

  // Room operations
  async getRooms(): Promise<Room[]> {
    const { data, error } = await this.supabase
      .from('rooms')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching rooms:', error)
      return []
    }
    return data || []
  }

  async createRoom(room: Omit<Room, 'id' | 'created_at' | 'updated_at'>): Promise<Room | null> {
    const { data, error } = await this.supabase
      .from('rooms')
      .insert([room])
      .select()
      .single()

    if (error) {
      console.error('Error creating room:', error)
      return null
    }
    return data
  }

  async updateRoom(id: string, updates: Partial<Room>): Promise<Room | null> {
    const { data, error } = await this.supabase
      .from('rooms')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating room:', error)
      return null
    }
    return data
  }

  async deleteRoom(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('rooms')
      .update({ is_active: false })
      .eq('id', id)

    if (error) {
      console.error('Error deleting room:', error)
      return false
    }
    return true
  }

  // Bed operations
  async getBeds(): Promise<Bed[]> {
    const { data, error } = await this.supabase
      .from('beds')
      .select('*')
      .eq('is_active', true)
      .order('identifier', { ascending: true })

    if (error) {
      console.error('Error fetching beds:', error)
      return []
    }
    return data || []
  }

  async getBedsByRoom(roomId: string): Promise<Bed[]> {
    const { data, error } = await this.supabase
      .from('beds')
      .select('*')
      .eq('room_id', roomId)
      .eq('is_active', true)
      .order('identifier', { ascending: true })

    if (error) {
      console.error('Error fetching beds by room:', error)
      return []
    }
    return data || []
  }

  async createBed(bed: Omit<Bed, 'id' | 'created_at' | 'updated_at'>): Promise<Bed | null> {
    const { data, error } = await this.supabase
      .from('beds')
      .insert([bed])
      .select()
      .single()

    if (error) {
      console.error('Error creating bed:', error)
      return null
    }
    return data
  }

  async updateBed(id: string, updates: Partial<Bed>): Promise<Bed | null> {
    const { data, error } = await this.supabase
      .from('beds')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating bed:', error)
      return null
    }
    return data
  }

  async deleteBed(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('beds')
      .update({ is_active: false })
      .eq('id', id)

    if (error) {
      console.error('Error deleting bed:', error)
      return false
    }
    return true
  }

  // Bed assignment operations
  async getBedAssignments(): Promise<BedAssignment[]> {
    const { data, error } = await this.supabase
      .from('bed_assignments')
      .select('*')
      .eq('status', 'active')
      .order('assigned_at', { ascending: false })

    if (error) {
      console.error('Error fetching bed assignments:', error)
      return []
    }
    return data || []
  }

  async createBedAssignment(assignment: Omit<BedAssignment, 'id' | 'created_at' | 'updated_at'>): Promise<BedAssignment | null> {
    const { data, error } = await this.supabase
      .from('bed_assignments')
      .insert([assignment])
      .select()
      .single()

    if (error) {
      console.error('Error creating bed assignment:', error)
      return null
    }
    return data
  }

  async updateBedAssignment(id: string, updates: Partial<BedAssignment>): Promise<BedAssignment | null> {
    const { data, error } = await this.supabase
      .from('bed_assignments')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating bed assignment:', error)
      return null
    }
    return data
  }

  async completeBedAssignment(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('bed_assignments')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      console.error('Error completing bed assignment:', error)
      return false
    }
    return true
  }

  // Equipment/Gear operations
  async getGearItems(): Promise<GearItem[]> {
    const { data, error } = await this.supabase
      .from('equipment')
      .select('*')
      .eq('is_active', true)
      .order('base_name', { ascending: true })

    if (error) {
      console.error('Error fetching gear items:', error)
      return []
    }
    return data || []
  }

  // Get current camp ID
  async getCurrentCampId(): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from('camps')
        .select('id')
        .eq('is_active', true)
        .single()

      if (error) {
        console.error('Error fetching camp ID:', error)
        return null
      }

      return data?.id || null
    } catch (error) {
      console.error('Error getting current camp ID:', error)
      return null
    }
  }

  // Dashboard statistics
  async getDashboardStats() {
    try {
      const [guestsResult, staffResult, mealsResult, roomsResult, bedsResult, bedAssignmentsResult] = await Promise.all([
        this.supabase.from('guests').select('is_active, surf_package'),
        this.supabase.from('staff').select('is_active'),
        this.supabase.from('meals').select('meal_date, is_active').gte('meal_date', new Date().toISOString().split('T')[0]),
        this.supabase.from('rooms').select('id, max_capacity, is_active'),
        this.supabase.from('beds').select('id, capacity, is_active'),
        this.supabase.from('bed_assignments').select('id, status')
      ])

      const guests = guestsResult.data || []
      const staff = staffResult.data || []
      const meals = mealsResult.data || []
      const rooms = roomsResult.data || []
      const beds = bedsResult.data || []
      const bedAssignments = bedAssignmentsResult.data || []

      const activeRooms = rooms.filter(r => r.is_active)
      const activeBeds = beds.filter(b => b.is_active)
      const activeBedAssignments = bedAssignments.filter(ba => ba.status === 'active')

      const totalBeds = activeBeds.reduce((sum, bed) => sum + bed.capacity, 0)
      const bedsOccupied = activeBedAssignments.length
      const occupancyPercentage = totalBeds > 0 ? Math.round((bedsOccupied / totalBeds) * 100) : 0

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
          bedsOccupied: bedsOccupied,
          bedsTotal: totalBeds,
          occupancyPercentage: occupancyPercentage,
          roomsCount: activeRooms.length,
          equipmentTotal: 0,
          equipmentAssigned: 0,
          equipmentAvailable: 0
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
        inventory: { bedsOccupied: 0, bedsTotal: 0, occupancyPercentage: 0, roomsCount: 0, equipmentTotal: 0, equipmentAssigned: 0, equipmentAvailable: 0 },
        shifts: { today: 0 }
      }
    }
  }
}

export const databaseService = new DatabaseService()