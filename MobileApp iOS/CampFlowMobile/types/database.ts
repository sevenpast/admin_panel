export interface Guest {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  date_of_birth?: string
  nationality?: string
  passport_number?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  allergies?: string
  dietary_restrictions?: string
  check_in_date?: string
  check_out_date?: string
  room_number?: string
  status: 'checked_in' | 'checked_out' | 'reserved'
  created_at: string
  updated_at: string
}

export interface Room {
  id: string
  room_number: string
  room_type: 'single' | 'double' | 'family' | 'dorm'
  capacity: number
  price_per_night: number
  amenities?: string[]
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning'
  floor?: number
  created_at: string
}

export interface SurfLesson {
  id: string
  title: string
  instructor_id: string
  start_time: string
  end_time: string
  max_participants: number
  skill_level: 'beginner' | 'intermediate' | 'advanced'
  location: string
  price: number
  status: 'scheduled' | 'completed' | 'cancelled'
  created_at: string
}

export interface Staff {
  id: string
  employee_id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  role: 'manager' | 'receptionist' | 'instructor' | 'kitchen' | 'housekeeping'
  department?: string
  hire_date?: string
  hourly_rate?: number
  skills?: string[]
  certifications?: string[]
  status: 'active' | 'inactive' | 'on_leave'
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      guests: {
        Row: Guest
        Insert: Omit<Guest, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Guest, 'id' | 'created_at'>>
      }
      rooms: {
        Row: Room
        Insert: Omit<Room, 'id' | 'created_at'>
        Update: Partial<Omit<Room, 'id' | 'created_at'>>
      }
      surf_lessons: {
        Row: SurfLesson
        Insert: Omit<SurfLesson, 'id' | 'created_at'>
        Update: Partial<Omit<SurfLesson, 'id' | 'created_at'>>
      }
      staff: {
        Row: Staff
        Insert: Omit<Staff, 'id' | 'created_at'>
        Update: Partial<Omit<Staff, 'id' | 'created_at'>>
      }
    }
  }
}