import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-client'

// Dashboard hooks
export const useDashboardStats = () => {
  return useQuery({
    queryKey: queryKeys.dashboardStats(),
    queryFn: async () => {
      const response = await fetch('/api/dashboard/stats')
      if (!response.ok) throw new Error('Failed to fetch dashboard stats')
      const result = await response.json()
      if (!result.success) throw new Error(result.error || 'Failed to fetch dashboard stats')
      return result.data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for dashboard data
  })
}

// Guest hooks
export const useGuests = () => {
  return useQuery({
    queryKey: queryKeys.guestsList(),
    queryFn: async () => {
      const response = await fetch('/api/guests')
      if (!response.ok) throw new Error('Failed to fetch guests')
      const result = await response.json()
      if (!result.success) throw new Error(result.error || 'Failed to fetch guests')
      return result.data
    },
  })
}

export const useGuest = (id: string) => {
  return useQuery({
    queryKey: queryKeys.guest(id),
    queryFn: async () => {
      const response = await fetch(`/api/guests/${id}`)
      if (!response.ok) throw new Error('Failed to fetch guest')
      const result = await response.json()
      if (!result.success) throw new Error(result.error || 'Failed to fetch guest')
      return result.data
    },
    enabled: !!id,
  })
}

export const useGuestAssessments = (guestId: string) => {
  return useQuery({
    queryKey: queryKeys.guestAssessments(guestId),
    queryFn: async () => {
      const response = await fetch(`/api/guest-assessments?guest_id=${guestId}`)
      if (!response.ok) throw new Error('Failed to fetch guest assessments')
      return response.json()
    },
    enabled: !!guestId,
  })
}

// Room hooks
export const useRooms = () => {
  return useQuery({
    queryKey: queryKeys.roomsList(),
    queryFn: async () => {
      const response = await fetch('/api/rooms')
      if (!response.ok) throw new Error('Failed to fetch rooms')
      const result = await response.json()
      return result
    },
  })
}

export const useAvailableBeds = (roomId?: string) => {
  return useQuery({
    queryKey: queryKeys.availableBeds(roomId),
    queryFn: async () => {
      const url = roomId ? `/api/available-beds?room_id=${roomId}` : '/api/available-beds'
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch available beds')
      const result = await response.json()
      return result
    },
  })
}

// Meal hooks
export const useMeals = (filters?: { date?: string; templates?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.mealsList(filters),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.date) params.append('meal_date', filters.date)
      if (filters?.templates) params.append('templates_only', 'true')
      
      const response = await fetch(`/api/meals?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch meals')
      const result = await response.json()
      if (!result.success) throw new Error(result.error || 'Failed to fetch meals')
      return result.data
    },
  })
}

export const useMealTemplates = () => {
  return useQuery({
    queryKey: queryKeys.mealTemplates(),
    queryFn: async () => {
      const response = await fetch('/api/meals?templates_only=true')
      if (!response.ok) throw new Error('Failed to fetch meal templates')
      const result = await response.json()
      if (!result.success) throw new Error(result.error || 'Failed to fetch meal templates')
      return result.data
    },
  })
}

// Event hooks
export const useEvents = (filters?: { date?: string }) => {
  return useQuery({
    queryKey: queryKeys.eventsList(filters),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.date) params.append('date', filters.date)
      
      const response = await fetch(`/api/events?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch events')
      const result = await response.json()
      if (!result.success) throw new Error(result.error || 'Failed to fetch events')
      return result.data
    },
  })
}

// Staff hooks
export const useStaff = () => {
  return useQuery({
    queryKey: queryKeys.staffList(),
    queryFn: async () => {
      const response = await fetch('/api/staff')
      if (!response.ok) throw new Error('Failed to fetch staff')
      const result = await response.json()
      if (!result.success) throw new Error(result.error || 'Failed to fetch staff')
      return result.data
    },
  })
}

export const useStaffHours = (filters?: { from?: string; to?: string }) => {
  return useQuery({
    queryKey: queryKeys.staffHours(filters),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.from) params.append('from', filters.from)
      if (filters?.to) params.append('to', filters.to)
      
      const response = await fetch(`/api/staff/hours?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch staff hours')
      const result = await response.json()
      if (!result.success) throw new Error(result.error || 'Failed to fetch staff hours')
      return result.data
    },
  })
}

// Lesson hooks
export const useLessons = (date: string) => {
  return useQuery({
    queryKey: queryKeys.lessonsList(date),
    queryFn: async () => {
      const response = await fetch(`/api/lessons?date=${date}`)
      if (!response.ok) throw new Error('Failed to fetch lessons')
      const result = await response.json()
      if (!result.success) throw new Error(result.error || 'Failed to fetch lessons')
      return result.data
    },
    enabled: !!date,
  })
}

// Equipment hooks
export const useEquipment = () => {
  return useQuery({
    queryKey: queryKeys.equipmentList(),
    queryFn: async () => {
      const response = await fetch('/api/equipment')
      if (!response.ok) throw new Error('Failed to fetch equipment')
      const result = await response.json()
      if (!result.success) throw new Error(result.error || 'Failed to fetch equipment')
      return result.data
    },
  })
}

export const useEquipmentAssignments = () => {
  return useQuery({
    queryKey: queryKeys.equipmentAssignments(),
    queryFn: async () => {
      const response = await fetch('/api/equipment-assignments')
      if (!response.ok) throw new Error('Failed to fetch equipment assignments')
      const result = await response.json()
      if (!result.success) throw new Error(result.error || 'Failed to fetch equipment assignments')
      return result.data
    },
  })
}

// Assessment Questions hooks
export const useAssessmentQuestions = () => {
  return useQuery({
    queryKey: queryKeys.assessmentQuestionsList(),
    queryFn: async () => {
      const response = await fetch('/api/assessment-questions')
      if (!response.ok) throw new Error('Failed to fetch assessment questions')
      const result = await response.json()
      if (!result.success) throw new Error(result.error || 'Failed to fetch assessment questions')
      return result.data
    },
  })
}

// Shift hooks
export const useShifts = (filters?: { from?: string; to?: string }) => {
  return useQuery({
    queryKey: queryKeys.shiftsList(filters),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.from) params.append('from', filters.from)
      if (filters?.to) params.append('to', filters.to)
      
      const response = await fetch(`/api/shifts?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch shifts')
      const result = await response.json()
      if (!result.success) throw new Error(result.error || 'Failed to fetch shifts')
      return result.data
    },
  })
}

// Mutation hooks for data updates
export const useCreateGuest = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (guestData: any) => {
      const response = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(guestData),
      })
      if (!response.ok) throw new Error('Failed to create guest')
      const result = await response.json()
      if (!result.success) throw new Error(result.error || 'Failed to create guest')
      return result.data
    },
    onSuccess: () => {
      // Invalidate and refetch guests list
      queryClient.invalidateQueries({ queryKey: queryKeys.guestsList() })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats() })
    },
  })
}

export const useUpdateGuest = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...guestData }: { id: string; [key: string]: any }) => {
      const response = await fetch(`/api/guests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(guestData),
      })
      if (!response.ok) throw new Error('Failed to update guest')
      const result = await response.json()
      if (!result.success) throw new Error(result.error || 'Failed to update guest')
      return result.data
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch guest data
      queryClient.invalidateQueries({ queryKey: queryKeys.guest(variables.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.guestsList() })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats() })
    },
  })
}

export const useDeleteGuest = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/guests/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete guest')
      const result = await response.json()
      if (!result.success) throw new Error(result.error || 'Failed to delete guest')
      return result.data
    },
    onSuccess: (data, id) => {
      // Remove guest from cache and invalidate lists
      queryClient.removeQueries({ queryKey: queryKeys.guest(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.guestsList() })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats() })
    },
  })
}

// Generic mutation hook for any API endpoint
export const useApiMutation = (endpoint: string, method: 'POST' | 'PUT' | 'DELETE' = 'POST') => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data?: any) => {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: data ? JSON.stringify(data) : undefined,
      })
      if (!response.ok) throw new Error(`Failed to ${method.toLowerCase()} ${endpoint}`)
      const result = await response.json()
      if (!result.success) throw new Error(result.error || `Failed to ${method.toLowerCase()} ${endpoint}`)
      return result.data
    },
    onSuccess: () => {
      // Invalidate all queries to ensure fresh data
      queryClient.invalidateQueries()
    },
  })
}
