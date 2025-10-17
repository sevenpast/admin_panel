'use client'

import { useState, useEffect } from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline'

interface CalendarEvent {
  id: string
  title: string
  type: 'lesson' | 'event' | 'meal' | 'shift'
  start_time: string
  end_time: string
  location: string
  description?: string
  participants?: number
  color: string
  status: 'draft' | 'published'
}

interface DayEvents {
  date: string
  events: CalendarEvent[]
}

export default function EventCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  useEffect(() => {
    loadEvents()
  }, [currentDate, view])

  const loadEvents = async () => {
    setLoading(true)
    try {
      // Mock data - replace with actual API calls
      const mockEvents: CalendarEvent[] = [
        {
          id: '1',
          title: 'Morning Surf Lesson',
          type: 'lesson',
          start_time: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1, 9, 0).toISOString(),
          end_time: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1, 11, 0).toISOString(),
          location: 'Main Beach',
          description: 'Beginner surf lesson for new guests',
          participants: 8,
          color: '#10B981',
          status: 'published'
        },
        {
          id: '2',
          title: 'Beach Volleyball',
          type: 'event',
          start_time: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1, 16, 0).toISOString(),
          end_time: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1, 18, 0).toISOString(),
          location: 'Beach Court',
          description: 'Fun beach volleyball tournament',
          participants: 16,
          color: '#8B5CF6',
          status: 'published'
        },
        {
          id: '3',
          title: 'BBQ Dinner',
          type: 'meal',
          start_time: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 2, 18, 30).toISOString(),
          end_time: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 2, 21, 0).toISOString(),
          location: 'Restaurant Terrace',
          description: 'Special BBQ dinner event',
          participants: 40,
          color: '#F59E0B',
          status: 'published'
        },
        {
          id: '4',
          title: 'Morning Shift',
          type: 'shift',
          start_time: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 8, 0).toISOString(),
          end_time: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 16, 0).toISOString(),
          location: 'Reception',
          description: 'Front desk coverage',
          color: '#EF4444',
          status: 'published'
        }
      ]

      setEvents(mockEvents)
    } catch (error) {
      console.error('Error loading events:', error)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const getEventsForDate = (date: Date) => {
    if (!date) return []

    return events.filter(event => {
      const eventDate = new Date(event.start_time)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'next') {
      newDate.setMonth(currentDate.getMonth() + 1)
    } else {
      newDate.setMonth(currentDate.getMonth() - 1)
    }
    setCurrentDate(newDate)
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'next') {
      newDate.setDate(currentDate.getDate() + 7)
    } else {
      newDate.setDate(currentDate.getDate() - 7)
    }
    setCurrentDate(newDate)
  }

  const navigateDay = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'next') {
      newDate.setDate(currentDate.getDate() + 1)
    } else {
      newDate.setDate(currentDate.getDate() - 1)
    }
    setCurrentDate(newDate)
  }

  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day
    startOfWeek.setDate(diff)

    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push(day)
    }
    return days
  }

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setShowEventModal(true)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lesson': return '🏄‍♂️'
      case 'event': return '🎉'
      case 'meal': return '🍽️'
      case 'shift': return '👥'
      default: return '📅'
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading calendar...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Event Calendar</h1>
          <p className="text-gray-600 mt-1">View and manage all camp events in calendar format</p>
        </div>
        <button
          onClick={() => setShowEventModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Event</span>
        </button>
      </div>

      {/* View Controls */}
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['month', 'week', 'day'] as const).map((viewOption) => (
              <button
                key={viewOption}
                onClick={() => setView(viewOption)}
                className={`px-3 py-1 rounded capitalize ${
                  view === viewOption
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {viewOption}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              if (view === 'month') navigateMonth('prev')
              else if (view === 'week') navigateWeek('prev')
              else navigateDay('prev')
            }}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>

          <h2 className="text-lg font-semibold text-gray-900 min-w-48 text-center">
            {view === 'month' && currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            {view === 'week' && `Week of ${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
            {view === 'day' && currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </h2>

          <button
            onClick={() => {
              if (view === 'month') navigateMonth('next')
              else if (view === 'week') navigateWeek('next')
              else navigateDay('next')
            }}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>

          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Today
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {view === 'month' && (
          <>
            {/* Month View Header */}
            <div className="grid grid-cols-7 bg-gray-50 border-b">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-r last:border-r-0">
                  {day}
                </div>
              ))}
            </div>

            {/* Month View Grid */}
            <div className="grid grid-cols-7">
              {getDaysInMonth(currentDate).map((date, index) => (
                <div
                  key={index}
                  className={`h-32 border-r border-b last:border-r-0 ${
                    date ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'
                  } ${date && !isCurrentMonth(date) ? 'text-gray-400' : ''}`}
                >
                  {date && (
                    <>
                      <div className={`p-2 text-sm ${
                        isToday(date) ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center ml-1 mt-1' : ''
                      }`}>
                        {date.getDate()}
                      </div>
                      <div className="px-1 space-y-1 max-h-20 overflow-y-auto">
                        {getEventsForDate(date).slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            onClick={() => handleEventClick(event)}
                            className="text-xs p-1 rounded cursor-pointer hover:opacity-80 truncate"
                            style={{ backgroundColor: event.color, color: 'white' }}
                            title={event.title}
                          >
                            {getTypeIcon(event.type)} {event.title}
                          </div>
                        ))}
                        {getEventsForDate(date).length > 3 && (
                          <div className="text-xs text-gray-500 pl-1">
                            +{getEventsForDate(date).length - 3} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {view === 'week' && (
          <>
            {/* Week View Header */}
            <div className="grid grid-cols-8 bg-gray-50 border-b">
              <div className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-r">Time</div>
              {getWeekDays(currentDate).map((date) => (
                <div key={date.toISOString()} className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-r last:border-r-0">
                  <div>{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                  <div className={`text-lg ${isToday(date) ? 'bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mt-1' : ''}`}>
                    {date.getDate()}
                  </div>
                </div>
              ))}
            </div>

            {/* Week View Grid */}
            <div className="grid grid-cols-8 divide-x">
              <div className="col-span-1">
                {Array.from({ length: 24 }, (_, hour) => (
                  <div key={hour} className="h-16 border-b flex items-center justify-center text-xs text-gray-500">
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                ))}
              </div>
              {getWeekDays(currentDate).map((date) => (
                <div key={date.toISOString()} className="col-span-1 relative">
                  {Array.from({ length: 24 }, (_, hour) => (
                    <div key={hour} className="h-16 border-b"></div>
                  ))}
                  {getEventsForDate(date).map((event) => {
                    const startHour = new Date(event.start_time).getHours()
                    const startMinute = new Date(event.start_time).getMinutes()
                    const endHour = new Date(event.end_time).getHours()
                    const endMinute = new Date(event.end_time).getMinutes()
                    const top = (startHour + startMinute / 60) * 64
                    const height = ((endHour + endMinute / 60) - (startHour + startMinute / 60)) * 64

                    return (
                      <div
                        key={event.id}
                        onClick={() => handleEventClick(event)}
                        className="absolute left-1 right-1 rounded p-1 cursor-pointer hover:opacity-80"
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                          backgroundColor: event.color,
                          color: 'white'
                        }}
                      >
                        <div className="text-xs font-semibold truncate">{event.title}</div>
                        <div className="text-xs truncate">
                          {formatTime(event.start_time)} - {formatTime(event.end_time)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </>
        )}

        {view === 'day' && (
          <>
            {/* Day View Header */}
            <div className="bg-gray-50 border-b px-4 py-3">
              <h3 className="text-lg font-semibold">
                {currentDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </h3>
            </div>

            {/* Day View Grid */}
            <div className="grid grid-cols-12 divide-x min-h-screen">
              <div className="col-span-2">
                {Array.from({ length: 24 }, (_, hour) => (
                  <div key={hour} className="h-16 border-b flex items-center justify-center text-sm text-gray-500">
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                ))}
              </div>
              <div className="col-span-10 relative">
                {Array.from({ length: 24 }, (_, hour) => (
                  <div key={hour} className="h-16 border-b"></div>
                ))}
                {getEventsForDate(currentDate).map((event) => {
                  const startHour = new Date(event.start_time).getHours()
                  const startMinute = new Date(event.start_time).getMinutes()
                  const endHour = new Date(event.end_time).getHours()
                  const endMinute = new Date(event.end_time).getMinutes()
                  const top = (startHour + startMinute / 60) * 64
                  const height = ((endHour + endMinute / 60) - (startHour + startMinute / 60)) * 64

                  return (
                    <div
                      key={event.id}
                      onClick={() => handleEventClick(event)}
                      className="absolute left-2 right-2 rounded p-3 cursor-pointer hover:opacity-80"
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        backgroundColor: event.color,
                        color: 'white'
                      }}
                    >
                      <div className="font-semibold">{getTypeIcon(event.type)} {event.title}</div>
                      <div className="text-sm">
                        {formatTime(event.start_time)} - {formatTime(event.end_time)}
                      </div>
                      <div className="text-sm flex items-center mt-1">
                        <MapPinIcon className="h-3 w-3 mr-1" />
                        {event.location}
                      </div>
                      {event.participants && (
                        <div className="text-sm">{event.participants} participants</div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Event Details</h2>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <CalendarIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold flex items-center">
                  <span className="mr-2">{getTypeIcon(selectedEvent.type)}</span>
                  {selectedEvent.title}
                </h3>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize`}
                      style={{ backgroundColor: selectedEvent.color, color: 'white' }}>
                  {selectedEvent.type}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <span>
                    {formatTime(selectedEvent.start_time)} - {formatTime(selectedEvent.end_time)}
                  </span>
                </div>

                <div className="flex items-center">
                  <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{selectedEvent.location}</span>
                </div>

                {selectedEvent.participants && (
                  <div className="flex items-center">
                    <span className="mr-2">👥</span>
                    <span>{selectedEvent.participants} participants</span>
                  </div>
                )}

                {selectedEvent.description && (
                  <div>
                    <h4 className="font-medium mb-1">Description</h4>
                    <p className="text-gray-600">{selectedEvent.description}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEventModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
              <button
                onClick={() => {
                  // Edit functionality would go here
                  setShowEventModal(false)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
              >
                <PencilIcon className="h-4 w-4" />
                <span>Edit</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}