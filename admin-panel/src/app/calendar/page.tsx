'use client'

import { useState, useEffect } from 'react'
import { ArrowLeftIcon, ArrowRightIcon, HomeIcon, EyeIcon, XMarkIcon, PlusIcon, ClockIcon, CalendarIcon } from '@heroicons/react/24/outline'

// Interfaces based on user stories and database schemas
interface SurfLesson {
  id: string
  lesson_id: string // L-XXXXXXXXXX
  title: string
  category: 'Lesson' | 'Theory' | 'Other'
  location: string
  start_at: string
  end_at: string
  status: 'draft' | 'published'
  instructors: string[]
  participants_count: number
}

interface Event {
  id: string
  event_id: string // E-XXXXXXXXXX
  name: string
  category: 'Day' | 'Night' | 'Sport' | 'Teaching'
  location: string
  start_at: string
  end_at: string
  status: 'draft' | 'published'
  min_participants: number
  max_participants: number
  assigned_staff: string[]
}

interface Meal {
  id: string
  meal_id: string // M-XXXXXXXXXX
  title: string
  category: 'Breakfast' | 'Lunch' | 'Dinner'
  start_at: string
  end_at: string
  published: boolean
}

// Calendar item interface for unified rendering
// Shift interfaces for shift calendar
interface Staff {
  id: string
  staff_id: string
  name: string
  labels: string[]
  is_active: boolean
  mobile_number?: string
  image_url?: string
  color?: string
}

interface Shift {
  id: string
  shift_id: string
  camp_id: string
  staff_id: string
  staff_name: string
  role_label: 'host' | 'teacher' | 'instructor' | 'kitchen' | 'maintenance' | 'other'
  start_at: string
  end_at: string
  color?: string
  recurrence_rule?: string
  recurrence_parent_id?: string
  notes?: string
  is_active: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

interface CalendarItem {
  id: string
  type: 'lesson' | 'event' | 'meal' | 'shift'
  title: string
  start_at: string
  end_at: string
  location: string
  color: string
  meta: {
    id: string
    category: string
    participants?: string
    instructors?: string[]
    assigned_staff?: string[]
    status?: string
    staff_name?: string
    role?: string
    notes?: string
  }
}

// Mock data for lessons (published only)
const mockLessons: SurfLesson[] = [
  {
    id: 'lesson-1',
    lesson_id: 'L-A1B2C3D4E5',
    title: 'Beginner Surf Lesson',
    category: 'Lesson',
    location: 'Main Beach',
    start_at: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(),
    end_at: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(),
    status: 'published',
    instructors: ['Max Mustermann', 'Tom Wilson'],
    participants_count: 8
  },
  {
    id: 'lesson-2',
    lesson_id: 'L-F6G7H8I9J0',
    title: 'Advanced Surf Theory',
    category: 'Theory',
    location: 'Conference Room',
    start_at: new Date(new Date().setHours(15, 30, 0, 0)).toISOString(),
    end_at: new Date(new Date().setHours(16, 30, 0, 0)).toISOString(),
    status: 'published',
    instructors: ['Tom Wilson'],
    participants_count: 12
  }
]

// Mock data for events (published only)
const mockEvents: Event[] = [
  {
    id: 'event-1',
    event_id: 'E-K1L2M3N4O5',
    name: 'Beach Volleyball Tournament',
    category: 'Sport',
    location: 'Beach Court',
    start_at: new Date(new Date().setHours(16, 0, 0, 0)).toISOString(),
    end_at: new Date(new Date().setHours(18, 0, 0, 0)).toISOString(),
    status: 'published',
    min_participants: 8,
    max_participants: 16,
    assigned_staff: ['Max Mustermann', 'Anna Schmidt']
  },
  {
    id: 'event-2',
    event_id: 'E-P6Q7R8S9T0',
    name: 'Sunset Yoga Session',
    category: 'Night',
    location: 'Beach Platform',
    start_at: new Date(new Date().setHours(19, 0, 0, 0)).toISOString(),
    end_at: new Date(new Date().setHours(20, 0, 0, 0)).toISOString(),
    status: 'published',
    min_participants: 5,
    max_participants: 20,
    assigned_staff: ['Lisa Mueller']
  }
]

// Mock data for meals (published only)
const mockMeals: Meal[] = [
  {
    id: 'meal-1',
    meal_id: 'M-U1V2W3X4Y5',
    title: 'Continental Breakfast',
    category: 'Breakfast',
    start_at: new Date(new Date().setHours(7, 0, 0, 0)).toISOString(),
    end_at: new Date(new Date().setHours(9, 30, 0, 0)).toISOString(),
    published: true
  },
  {
    id: 'meal-2',
    meal_id: 'M-Z6A7B8C9D0',
    title: 'BBQ Dinner',
    category: 'Dinner',
    start_at: new Date(new Date().setHours(18, 30, 0, 0)).toISOString(),
    end_at: new Date(new Date().setHours(21, 0, 0, 0)).toISOString(),
    published: true
  }
]

// Mock data for staff
const mockStaff: Staff[] = [
  {
    id: '1',
    staff_id: 'S-A1B2C3D4E5',
    name: 'Max Mustermann',
    labels: ['instructor', 'host'],
    is_active: true,
    mobile_number: '+49123456789',
    color: '#22C55E'
  },
  {
    id: '2',
    staff_id: 'S-F6G7H8I9J0',
    name: 'Anna Schmidt',
    labels: ['kitchen', 'other'],
    is_active: true,
    mobile_number: '+49987654321',
    color: '#3B82F6'
  },
  {
    id: '3',
    staff_id: 'S-K1L2M3N4O5',
    name: 'Tom Wilson',
    labels: ['teacher', 'instructor'],
    is_active: true,
    mobile_number: '+49555123456',
    color: '#8B5CF6'
  }
]

// Mock shifts data
const mockShifts: Shift[] = [
  {
    id: '1',
    shift_id: 'H-A1B2C3D4E5',
    camp_id: 'camp-1',
    staff_id: '1',
    staff_name: 'Max Mustermann',
    role_label: 'host',
    start_at: new Date(new Date().setHours(8, 0, 0, 0)).toISOString(),
    end_at: new Date(new Date().setHours(12, 0, 0, 0)).toISOString(),
    color: '#22C55E',
    notes: 'Morning reception and guest check-ins',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    shift_id: 'H-F6G7H8I9J0',
    camp_id: 'camp-1',
    staff_id: '1',
    staff_name: 'Max Mustermann',
    role_label: 'instructor',
    start_at: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
    end_at: new Date(new Date().setHours(18, 0, 0, 0)).toISOString(),
    color: '#22C55E',
    notes: 'Afternoon surf lesson instruction',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

// Color scheme constants
const COLORS = {
  lesson: '#22C55E',    // Green
  event: '#8B5CF6',     // Purple/Violet
  meal: '#F59E0B',      // Orange
  shift: '#EF4444'      // Red
}

// Utility functions
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

const getWeekDateRange = (date: Date): { start: Date; end: Date } => {
  const start = new Date(date)
  const day = start.getDay()
  const diff = start.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  start.setDate(diff)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

const getWeekDays = (startDate: Date): Date[] => {
  const days = []
  for (let i = 0; i < 7; i++) {
    const day = new Date(startDate)
    day.setDate(startDate.getDate() + i)
    days.push(day)
  }
  return days
}

const getCurrentTimePosition = (): number => {
  const now = new Date()
  const hours = now.getHours()
  const minutes = now.getMinutes()
  return (hours * 60 + minutes) / (24 * 60) * 100
}

// Convert data to unified calendar items
const convertToCalendarItems = (
  lessons: SurfLesson[],
  events: Event[],
  meals: Meal[],
  shifts: Shift[],
  filters: { lessons: boolean; events: boolean; meals: boolean; shifts: boolean }
): CalendarItem[] => {
  const items: CalendarItem[] = []

  // Add lessons (only published)
  if (filters.lessons) {
    lessons.filter(l => l.status === 'published').forEach(lesson => {
      items.push({
        id: lesson.id,
        type: 'lesson',
        title: lesson.title,
        start_at: lesson.start_at,
        end_at: lesson.end_at,
        location: lesson.location,
        color: COLORS.lesson,
        meta: {
          id: lesson.lesson_id,
          category: lesson.category,
          participants: lesson.participants_count.toString(),
          instructors: lesson.instructors,
          status: 'Published'
        }
      })
    })
  }

  // Add events (only published)
  if (filters.events) {
    events.filter(e => e.status === 'published').forEach(event => {
      items.push({
        id: event.id,
        type: 'event',
        title: event.name,
        start_at: event.start_at,
        end_at: event.end_at,
        location: event.location,
        color: COLORS.event,
        meta: {
          id: event.event_id,
          category: event.category,
          participants: `${event.min_participants}/${event.max_participants}`,
          assigned_staff: event.assigned_staff,
          status: 'Published'
        }
      })
    })
  }

  // Add meals (only published)
  if (filters.meals) {
    meals.filter(m => m.published).forEach(meal => {
      items.push({
        id: meal.id,
        type: 'meal',
        title: meal.title,
        start_at: meal.start_at,
        end_at: meal.end_at,
        location: 'Restaurant',
        color: COLORS.meal,
        meta: {
          id: meal.meal_id,
          category: meal.category,
          status: 'Published'
        }
      })
    })
  }

  // Add shifts (only active)
  if (filters.shifts) {
    shifts.filter(s => s.is_active).forEach(shift => {
      items.push({
        id: shift.id,
        type: 'shift',
        title: shift.staff_name,
        start_at: shift.start_at,
        end_at: shift.end_at,
        location: 'Work',
        color: shift.color || COLORS.shift,
        meta: {
          id: shift.shift_id,
          category: shift.role_label,
          staff_name: shift.staff_name,
          role: shift.role_label,
          notes: shift.notes,
          status: 'Active'
        }
      })
    })
  }

  return items
}

export default function CalendarPage() {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [activeTab, setActiveTab] = useState<'shifts' | 'camp'>('camp')
  const [filters, setFilters] = useState({ lessons: true, events: true, meals: true, shifts: true })
  const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null)
  const [showTooltip, setShowTooltip] = useState(false)
  const [nowLinePosition, setNowLinePosition] = useState(getCurrentTimePosition())

  // Update now line position every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setNowLinePosition(getCurrentTimePosition())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  const weekRange = getWeekDateRange(currentWeek)
  const weekDays = getWeekDays(weekRange.start)

  // Get calendar items for the current week based on active tab
  const currentFilters = activeTab === 'shifts'
    ? { lessons: false, events: false, meals: false, shifts: true }
    : { lessons: filters.lessons, events: filters.events, meals: filters.meals, shifts: false }

  const allItems = convertToCalendarItems(mockLessons, mockEvents, mockMeals, mockShifts, currentFilters)
  const weekItems = allItems.filter(item => {
    const itemDate = new Date(item.start_at)
    return itemDate >= weekRange.start && itemDate <= weekRange.end
  })

  // Calculate KPIs for the current week
  const weekKPIs = activeTab === 'shifts'
    ? {
        shifts: weekItems.filter(item => item.type === 'shift').length,
        host: weekItems.filter(item => item.type === 'shift' && item.meta.role === 'host').length,
        instructor: weekItems.filter(item => item.type === 'shift' && item.meta.role === 'instructor').length,
        total: weekItems.length
      }
    : {
        events: weekItems.filter(item => item.type === 'event').length,
        lessons: weekItems.filter(item => item.type === 'lesson').length,
        meals: weekItems.filter(item => item.type === 'meal').length,
        total: weekItems.length
      }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentWeek(newWeek)
  }

  const goToToday = () => {
    setCurrentWeek(new Date())
  }

  const goToNow = () => {
    setCurrentWeek(new Date())
    // Scroll to current time if needed
  }

  const getItemsForDay = (day: Date): CalendarItem[] => {
    return weekItems.filter(item => {
      const itemDate = new Date(item.start_at)
      return itemDate.toDateString() === day.toDateString()
    })
  }

  const getItemPosition = (item: CalendarItem): { top: number; height: number } => {
    const startTime = new Date(item.start_at)
    const endTime = new Date(item.end_at)

    const startMinutes = startTime.getHours() * 60 + startTime.getMinutes()
    const endMinutes = endTime.getHours() * 60 + endTime.getMinutes()
    const duration = endMinutes - startMinutes

    const top = (startMinutes / (24 * 60)) * 100
    const height = (duration / (24 * 60)) * 100

    return { top, height }
  }

  const handleItemClick = (item: CalendarItem) => {
    setSelectedItem(item)
    setShowTooltip(true)
  }

  const closeTooltip = () => {
    setShowTooltip(false)
    setSelectedItem(null)
  }

  const renderTimeGrid = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i)

    return (
      <div className="relative">
        {hours.map(hour => (
          <div
            key={hour}
            className="border-t border-gray-200 h-16 flex items-start"
          >
            <div className="w-16 text-xs text-gray-500 px-2 pt-1">
              {hour.toString().padStart(2, '0')}:00
            </div>
          </div>
        ))}

        {/* Now line */}
        <div
          className="absolute left-0 right-0 border-t-2 border-red-500 z-10 pointer-events-none"
          style={{ top: `${nowLinePosition}%` }}
        >
          <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-r-md">
            {formatTime(new Date())}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with Tabs */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
            <p className="text-gray-600 mt-1">
              {formatDate(weekRange.start)} - {formatDate(weekRange.end)}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Week Navigation */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateWeek('prev')}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>

              <button
                onClick={goToToday}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                Today
              </button>

              <button
                onClick={goToNow}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                Now
              </button>

              <button
                onClick={() => navigateWeek('next')}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('camp')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'camp'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <CalendarIcon className="w-5 h-5 mr-2 inline" />
              Camp Calendar
            </button>
            <button
              onClick={() => setActiveTab('shifts')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'shifts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ClockIcon className="w-5 h-5 mr-2 inline" />
              Shift Calendar
            </button>
          </nav>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {activeTab === 'camp' ? (
            <>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">{weekKPIs.events}</div>
                <div className="text-sm text-gray-600">Events this week</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">{weekKPIs.lessons}</div>
                <div className="text-sm text-gray-600">Surf Lessons this week</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">{weekKPIs.meals}</div>
                <div className="text-sm text-gray-600">Meals this week</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">{weekKPIs.total}</div>
                <div className="text-sm text-gray-600">Total Activities</div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">{weekKPIs.shifts}</div>
                <div className="text-sm text-gray-600">Shifts this week</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">{weekKPIs.host}</div>
                <div className="text-sm text-gray-600">Host shifts</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">{weekKPIs.instructor}</div>
                <div className="text-sm text-gray-600">Instructor shifts</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">{weekKPIs.total}</div>
                <div className="text-sm text-gray-600">Total Shifts</div>
              </div>
            </>
          )}
        </div>

        {/* Filter Toggle - Only for Camp Calendar */}
        {activeTab === 'camp' && (
          <div className="flex items-center space-x-4 mb-4">
            <span className="text-sm font-medium text-gray-700">Show:</span>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.events}
                onChange={(e) => setFilters({...filters, events: e.target.checked})}
                className="mr-2"
              />
              <span className="text-sm" style={{color: COLORS.event}}>Events</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.lessons}
                onChange={(e) => setFilters({...filters, lessons: e.target.checked})}
                className="mr-2"
              />
              <span className="text-sm" style={{color: COLORS.lesson}}>Lessons</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.meals}
                onChange={(e) => setFilters({...filters, meals: e.target.checked})}
                className="mr-2"
              />
              <span className="text-sm" style={{color: COLORS.meal}}>Meals</span>
            </label>
          </div>
        )}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="flex">
          {/* Time column */}
          <div className="w-16 border-r border-gray-200 bg-gray-50">
            <div className="h-12 border-b border-gray-200"></div>
            {renderTimeGrid()}
          </div>

          {/* Days columns */}
          <div className="flex-1 grid grid-cols-7">
            {weekDays.map((day, dayIndex) => (
              <div key={dayIndex} className="border-r border-gray-200 last:border-r-0">
                {/* Day header */}
                <div className="h-12 border-b border-gray-200 bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">
                      {day.toLocaleDateString('de-DE', { weekday: 'short' })}
                    </div>
                    <div className={`text-lg font-medium ${
                      day.toDateString() === new Date().toDateString()
                        ? 'text-blue-600'
                        : 'text-gray-900'
                    }`}>
                      {day.getDate()}
                    </div>
                  </div>
                </div>

                {/* Day content */}
                <div className="relative" style={{ height: '1536px' }}> {/* 24 hours * 64px */}
                  {/* Hour lines */}
                  {Array.from({ length: 24 }, (_, i) => (
                    <div
                      key={i}
                      className="absolute left-0 right-0 border-t border-gray-100"
                      style={{ top: `${(i / 24) * 100}%` }}
                    />
                  ))}

                  {/* Calendar Items */}
                  {getItemsForDay(day).map((item, itemIndex) => {
                    const position = getItemPosition(item)

                    return (
                      <div
                        key={`${item.type}-${item.id}-${dayIndex}`}
                        className="absolute left-1 right-1 bg-white border-l-4 rounded-md shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                        style={{
                          top: `${position.top}%`,
                          height: `${position.height}%`,
                          borderLeftColor: item.color,
                          minHeight: '40px'
                        }}
                        onClick={() => handleItemClick(item)}
                      >
                        <div className="p-2">
                          <div className="font-medium text-sm text-gray-900 truncate">
                            {item.title}
                          </div>
                          <div className="text-xs text-gray-600">
                            {item.location}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.meta.participants && `${item.meta.participants} participants`}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Item Details Tooltip/Modal */}
      {showTooltip && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg mx-4">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">{selectedItem.title}</h2>
              <button
                onClick={closeTooltip}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: selectedItem.color }}
                ></div>
                <span className="text-sm font-medium capitalize">{selectedItem.type}</span>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-600">{selectedItem.meta.category}</span>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-700">ID: </span>
                <span className="text-sm text-gray-600">{selectedItem.meta.id}</span>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-700">Time: </span>
                <span className="text-sm text-gray-600">
                  {formatTime(new Date(selectedItem.start_at))} - {formatTime(new Date(selectedItem.end_at))}
                </span>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-700">Location: </span>
                <span className="text-sm text-gray-600">{selectedItem.location}</span>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-700">Status: </span>
                <span className="text-sm text-gray-600">{selectedItem.meta.status}</span>
              </div>

              {selectedItem.meta.participants && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Participants: </span>
                  <span className="text-sm text-gray-600">{selectedItem.meta.participants}</span>
                </div>
              )}

              {selectedItem.meta.instructors && selectedItem.meta.instructors.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Instructors: </span>
                  <span className="text-sm text-gray-600">{selectedItem.meta.instructors.join(', ')}</span>
                </div>
              )}

              {selectedItem.meta.assigned_staff && selectedItem.meta.assigned_staff.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Assigned Staff: </span>
                  <span className="text-sm text-gray-600">{selectedItem.meta.assigned_staff.join(', ')}</span>
                </div>
              )}

              {selectedItem.type === 'shift' && selectedItem.meta.notes && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Notes: </span>
                  <span className="text-sm text-gray-600">{selectedItem.meta.notes}</span>
                </div>
              )}

              {selectedItem.type === 'shift' && selectedItem.meta.role && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Role: </span>
                  <span className="text-sm text-gray-600 capitalize">{selectedItem.meta.role}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={closeTooltip}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {weekItems.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-gray-500">
            <p className="text-lg">No activities for this week.</p>
          </div>
        </div>
      )}
    </div>
  )
}