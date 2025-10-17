import { supabase } from './supabase';

const API_BASE_URL = 'http://localhost:3001'; // Web dashboard API

export interface DashboardStats {
  guests: {
    total: number;
    inHouse: number;
    surfPackage: number;
    surfPackagePercentage: number;
  };
  lessons: {
    today: number;
    beginnerCount: number;
    intermediateCount: number;
    advancedCount: number;
  };
  meals: {
    ordersToday: number;
    meatCount: number;
    vegetarianCount: number;
    veganCount: number;
    otherCount: number;
  };
  events: {
    today: number;
    totalAttendance: number;
  };
  staff: {
    active: number;
  };
  inventory: {
    bedsOccupied: number;
    bedsTotal: number;
    occupancyPercentage: number;
    roomsCount: number;
  };
  shifts: {
    today: number;
  };
}

export interface Guest {
  id: string;
  guest_code: string;
  name: string;
  phone: string;
  instagram?: string;
  allergies?: string;
  is_active: boolean;
  has_surf_package: boolean;
  room_assignment?: {
    room_name: string;
    bed_name: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  lesson_code: string;
  title: string;
  instructor_id: string;
  instructor_name: string;
  start_time: string;
  end_time: string;
  max_participants: number;
  skill_level: 'beginner' | 'intermediate' | 'advanced';
  location: string;
  price: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Meal {
  id: string;
  meal_code: string;
  title: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner';
  meal_date: string;
  description: string;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  event_code: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  max_participants: number;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  is_active: boolean;
  color: string;
  created_at: string;
  updated_at: string;
}

class ApiService {
  private async fetchFromWebAPI<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'API request failed');
      }
      return result.data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  private async fetchFromSupabase<T>(
    table: string,
    select: string = '*',
    filters?: Record<string, any>
  ): Promise<T[]> {
    try {
      let query = supabase.from(table).select(select);
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }
      
      return data || [];
    } catch (error) {
      console.error(`Supabase Error (${table}):`, error);
      throw error;
    }
  }

  // Dashboard API
  async getDashboardStats(): Promise<DashboardStats> {
    return this.fetchFromWebAPI<DashboardStats>('/api/dashboard/stats');
  }

  // Guests API
  async getGuests(): Promise<Guest[]> {
    return this.fetchFromWebAPI<Guest[]>('/api/guests');
  }

  async getGuest(id: string): Promise<Guest> {
    return this.fetchFromWebAPI<Guest>(`/api/guests/${id}`);
  }

  async createGuest(guest: Partial<Guest>): Promise<Guest> {
    const response = await fetch(`${API_BASE_URL}/api/guests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(guest),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to create guest');
    }
    
    return result.data;
  }

  async updateGuest(id: string, guest: Partial<Guest>): Promise<Guest> {
    const response = await fetch(`${API_BASE_URL}/api/guests/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(guest),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to update guest');
    }
    
    return result.data;
  }

  async deleteGuest(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/guests/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete guest');
    }
  }

  // Lessons API
  async getLessons(): Promise<Lesson[]> {
    return this.fetchFromWebAPI<Lesson[]>('/api/lessons');
  }

  async getLesson(id: string): Promise<Lesson> {
    return this.fetchFromWebAPI<Lesson>(`/api/lessons/${id}`);
  }

  async createLesson(lesson: Partial<Lesson>): Promise<Lesson> {
    const response = await fetch(`${API_BASE_URL}/api/lessons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lesson),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to create lesson');
    }
    
    return result.data;
  }

  async updateLesson(id: string, lesson: Partial<Lesson>): Promise<Lesson> {
    const response = await fetch(`${API_BASE_URL}/api/lessons/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lesson),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to update lesson');
    }
    
    return result.data;
  }

  async deleteLesson(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/lessons/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete lesson');
    }
  }

  // Meals API
  async getMeals(): Promise<Meal[]> {
    return this.fetchFromWebAPI<Meal[]>('/api/meals');
  }

  async getMeal(id: string): Promise<Meal> {
    return this.fetchFromWebAPI<Meal>(`/api/meals/${id}`);
  }

  async createMeal(meal: Partial<Meal>): Promise<Meal> {
    const response = await fetch(`${API_BASE_URL}/api/meals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(meal),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to create meal');
    }
    
    return result.data;
  }

  async updateMeal(id: string, meal: Partial<Meal>): Promise<Meal> {
    const response = await fetch(`${API_BASE_URL}/api/meals/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(meal),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to update meal');
    }
    
    return result.data;
  }

  async deleteMeal(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/meals/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete meal');
    }
  }

  // Events API
  async getEvents(): Promise<Event[]> {
    return this.fetchFromWebAPI<Event[]>('/api/events');
  }

  async getEvent(id: string): Promise<Event> {
    return this.fetchFromWebAPI<Event>(`/api/events/${id}`);
  }

  async createEvent(event: Partial<Event>): Promise<Event> {
    const response = await fetch(`${API_BASE_URL}/api/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to create event');
    }
    
    return result.data;
  }

  async updateEvent(id: string, event: Partial<Event>): Promise<Event> {
    const response = await fetch(`${API_BASE_URL}/api/events/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to update event');
    }
    
    return result.data;
  }

  async deleteEvent(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/events/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete event');
    }
  }

  // Staff API
  async getStaff(): Promise<Staff[]> {
    return this.fetchFromWebAPI<Staff[]>('/api/staff');
  }

  async getStaffMember(id: string): Promise<Staff> {
    return this.fetchFromWebAPI<Staff>(`/api/staff/${id}`);
  }

  async createStaff(staff: Partial<Staff>): Promise<Staff> {
    const response = await fetch(`${API_BASE_URL}/api/staff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(staff),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to create staff member');
    }
    
    return result.data;
  }

  async updateStaff(id: string, staff: Partial<Staff>): Promise<Staff> {
    const response = await fetch(`${API_BASE_URL}/api/staff/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(staff),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to update staff member');
    }
    
    return result.data;
  }

  async deleteStaff(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/staff/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete staff member');
    }
  }

  // Assessment Questions API
  async getAssessmentQuestions(): Promise<any[]> {
    return this.fetchFromWebAPI<any[]>('/api/assessment-questions');
  }

  async createAssessmentQuestion(question: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/assessment-questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(question),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to create assessment question');
    }
    
    return result.data;
  }

  async updateAssessmentQuestion(id: string, question: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/assessment-questions`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, ...question }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to update assessment question');
    }
    
    return result.data;
  }

  async deleteAssessmentQuestion(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/assessment-questions`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete assessment question');
    }
  }
}

export const apiService = new ApiService();
