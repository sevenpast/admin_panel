export interface Database {
  public: {
    Tables: {
      camps: {
        Row: {
          id: string
          name: string
          timezone: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          timezone?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          timezone?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      guests: {
        Row: {
          id: string
          guest_id: string
          camp_id: string
          name: string
          mobile_number: string | null
          instagram: string | null
          surf_package: boolean
          is_active: boolean
          surf_level: 'beginner' | 'intermediate' | 'advanced' | null
          surf_level_set_by: string | null
          surf_level_set_at: string | null
          allergies: Record<string, any>
          other_allergies: string | null
          qr_code_payload: Record<string, any> | null
          qr_code_generated_at: string | null
          notes: string | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          guest_id?: string
          camp_id: string
          name: string
          mobile_number?: string | null
          instagram?: string | null
          surf_package?: boolean
          is_active?: boolean
          surf_level?: 'beginner' | 'intermediate' | 'advanced' | null
          surf_level_set_by?: string | null
          surf_level_set_at?: string | null
          allergies?: Record<string, any>
          other_allergies?: string | null
          qr_code_payload?: Record<string, any> | null
          qr_code_generated_at?: string | null
          notes?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          guest_id?: string
          camp_id?: string
          name?: string
          mobile_number?: string | null
          instagram?: string | null
          surf_package?: boolean
          is_active?: boolean
          surf_level?: 'beginner' | 'intermediate' | 'advanced' | null
          surf_level_set_by?: string | null
          surf_level_set_at?: string | null
          allergies?: Record<string, any>
          other_allergies?: string | null
          qr_code_payload?: Record<string, any> | null
          qr_code_generated_at?: string | null
          notes?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      staff: {
        Row: {
          id: string
          staff_id: string
          camp_id: string
          name: string
          mobile_number: string | null
          labels: string[]
          is_active: boolean
          image_url: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          staff_id?: string
          camp_id: string
          name: string
          mobile_number?: string | null
          labels?: string[]
          is_active?: boolean
          image_url?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          staff_id?: string
          camp_id?: string
          name?: string
          mobile_number?: string | null
          labels?: string[]
          is_active?: boolean
          image_url?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      rooms: {
        Row: {
          id: string
          room_id: string
          camp_id: string
          name: string
          room_type: 'dormitory' | 'private' | 'suite'
          description: string | null
          max_capacity: number
          floor_number: number
          room_number: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
      }
      beds: {
        Row: {
          id: string
          bed_id: string
          camp_id: string
          room_id: string
          identifier: string
          bed_type: 'single' | 'double' | 'bunk_upper' | 'bunk_lower' | 'queen' | 'king' | 'sofa' | 'extra' | 'crib'
          capacity: number
          current_occupancy: number
          group_id: string | null
          slot: 'single' | 'upper' | 'lower'
          is_active: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
      }
      lessons: {
        Row: {
          id: string
          lesson_id: string
          camp_id: string
          title: string
          category: 'lesson' | 'theory' | 'other'
          location: string
          start_at: string
          end_at: string
          status: 'draft' | 'published' | 'cancelled' | 'completed'
          alert_time: string | null
          alert_text: string | null
          description: string | null
          max_participants: number | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
      }
      events: {
        Row: {
          id: string
          event_id: string
          camp_id: string
          title: string
          category: 'day_activity' | 'night_activity' | 'sport_activity' | 'teaching'
          location: string
          start_at: string
          end_at: string
          description: string | null
          status: 'draft' | 'published' | 'cancelled' | 'completed'
          max_participants: number | null
          current_participants: number
          requirements: string | null
          min_age: number | null
          max_age: number | null
          cost_per_person: number
          included_in_package: boolean
          organizer_id: string | null
          additional_staff: string[]
          alert_time: string | null
          alert_text: string | null
          is_active: boolean
          is_mandatory: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
      }
      meal_plans: {
        Row: {
          id: string
          meal_plan_id: string
          camp_id: string
          name: string
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          meal_date: string
          description: string | null
          ingredients: string[]
          dietary_restrictions: string[]
          planned_portions: number
          actual_portions: number
          estimated_cost_per_portion: number | null
          actual_cost_per_portion: number | null
          prep_time_minutes: number | null
          cooking_time_minutes: number | null
          kitchen_notes: string | null
          is_active: boolean
          is_confirmed: boolean
          created_at: string
          updated_at: string
        }
      }
      meal_options: {
        Row: {
          id: string
          meal_option_id: string
          camp_id: string
          meal_plan_id: string
          name: string
          description: string | null
          max_portions: number | null
          current_orders: number
          is_available: boolean
          price_per_portion: number
          dietary_tags: string[]
          allergen_info: Record<string, any> | null
          prep_notes: string | null
          order_deadline: string | null
          created_at: string
          updated_at: string
        }
      }
      meal_orders: {
        Row: {
          id: string
          meal_order_id: string
          camp_id: string
          meal_option_id: string
          guest_id: string
          portion_count: number
          special_requests: string | null
          status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled'
          price_per_portion: number | null
          total_price: number | null
          has_dietary_conflict: boolean
          dietary_notes: string | null
          ordered_at: string
          confirmed_at: string | null
          preparation_started_at: string | null
          ready_at: string | null
          served_at: string | null
          cancelled_at: string | null
          confirmed_by: string | null
          prepared_by: string | null
          served_by: string | null
          cancelled_by: string | null
          cancellation_reason: string | null
          created_at: string
          updated_at: string
        }
      }
      equipment: {
        Row: {
          id: string
          equipment_id: string
          camp_id: string
          name: string
          category: 'surfboard' | 'wetsuit' | 'safety' | 'cleaning' | 'other'
          type: string | null
          brand: string | null
          size: string | null
          status: 'available' | 'assigned' | 'maintenance' | 'retired'
          condition: 'excellent' | 'good' | 'fair' | 'poor'
          currently_assigned_to: string | null
          description: string | null
          serial_number: string | null
          purchase_date: string | null
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
      }
      shifts: {
        Row: {
          id: string
          shift_id: string
          camp_id: string
          staff_id: string
          role_label: 'host' | 'teacher' | 'instructor' | 'kitchen' | 'maintenance' | 'other'
          start_at: string
          end_at: string
          color: string | null
          recurrence_rule: string | null
          recurrence_parent_id: string | null
          notes: string | null
          is_active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
      }
      automation_rules: {
        Row: {
          id: string
          automation_rule_id: string
          camp_id: string
          name: string
          target: 'meals' | 'events' | 'surf_lessons'
          meal_type: 'breakfast' | 'lunch' | 'dinner' | null
          alert_days_before: number
          alert_time: string
          alert_message: string
          send_automatically: boolean
          cutoff_enabled: boolean
          cutoff_days_before: number | null
          cutoff_time: string | null
          recurring: boolean
          recurrence_type: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom'
          recurrence_payload: Record<string, any> | null
          season_override: Record<string, any> | null
          special_dates: Record<string, any>[]
          is_active: boolean
          created_by: string | null
          updated_by: string | null
          created_at: string
          updated_at: string
        }
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string
          camp_id: string
          role: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}