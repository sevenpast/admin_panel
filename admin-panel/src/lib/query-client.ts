import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 5 minutes
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Data stays in cache for 10 minutes after last use
      cacheTime: 10 * 60 * 1000, // 10 minutes
      // Retry failed requests 2 times
      retry: 2,
      // Don't refetch on window focus for better UX
      refetchOnWindowFocus: false,
      // Don't refetch on reconnect unless data is stale
      refetchOnReconnect: 'always',
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
})

// Query keys for consistent caching
export const queryKeys = {
  // Dashboard
  dashboard: ['dashboard'] as const,
  dashboardStats: () => [...queryKeys.dashboard, 'stats'] as const,
  
  // Guests
  guests: ['guests'] as const,
  guestsList: () => [...queryKeys.guests, 'list'] as const,
  guest: (id: string) => [...queryKeys.guests, 'detail', id] as const,
  guestAssessments: (guestId: string) => [...queryKeys.guests, 'assessments', guestId] as const,
  
  // Rooms
  rooms: ['rooms'] as const,
  roomsList: () => [...queryKeys.rooms, 'list'] as const,
  availableBeds: (roomId?: string) => [...queryKeys.rooms, 'available-beds', roomId] as const,
  
  // Meals
  meals: ['meals'] as const,
  mealsList: (filters?: { date?: string; templates?: boolean }) => 
    [...queryKeys.meals, 'list', filters] as const,
  mealTemplates: () => [...queryKeys.meals, 'templates'] as const,
  
  // Events
  events: ['events'] as const,
  eventsList: (filters?: { date?: string }) => 
    [...queryKeys.events, 'list', filters] as const,
  
  // Staff
  staff: ['staff'] as const,
  staffList: () => [...queryKeys.staff, 'list'] as const,
  staffHours: (filters?: { from?: string; to?: string }) => 
    [...queryKeys.staff, 'hours', filters] as const,
  
  // Lessons
  lessons: ['lessons'] as const,
  lessonsList: (date: string) => [...queryKeys.lessons, 'list', date] as const,
  
  // Equipment
  equipment: ['equipment'] as const,
  equipmentList: () => [...queryKeys.equipment, 'list'] as const,
  equipmentAssignments: () => [...queryKeys.equipment, 'assignments'] as const,
  
  // Assessment Questions
  assessmentQuestions: ['assessment-questions'] as const,
  assessmentQuestionsList: () => [...queryKeys.assessmentQuestions, 'list'] as const,
  
  // Shifts
  shifts: ['shifts'] as const,
  shiftsList: (filters?: { from?: string; to?: string }) => 
    [...queryKeys.shifts, 'list', filters] as const,
} as const
