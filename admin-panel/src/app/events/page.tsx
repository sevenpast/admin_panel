'use client'

import { useState, useEffect } from 'react'
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  GlobeAltIcon,
  PlusIcon,
  XMarkIcon,
  CheckIcon,
  UserGroupIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  ArrowPathIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { recurrenceService, RecurrenceRule } from '@/lib/recurrence-service'

// Types based on database schema
interface Staff {
  id: string
  staff_id: string
  name: string
  labels: string[]
}

interface Guest {
  id: string
  guest_id: string
  name: string
}

interface EventAssignment {
  id: string
  guest_id: string
  guest: Guest
  status: 'pending' | 'confirmed' | 'cancelled' | 'no_show' | 'attended'
  special_requests?: string
  dietary_requirements?: string
  payment_required: number
  payment_status: 'none' | 'pending' | 'paid' | 'refunded'
}

interface RecurrenceSettings {
  type: 'none' | 'daily' | 'weekly' | 'monthly'
  interval: number
  daysOfWeek: number[]
  endDate?: string
  maxOccurrences?: number
}

interface Event {
  id: string
  parent_id?: string
  recurrence_rule_id?: string
  title: string
  description?: string
  event_type?: string
  start_time: string
  end_time: string
  location?: string
  min_participants?: number
  max_participants?: number
  current_participants: number
  price?: number
  status: 'draft' | 'published' | 'archived'
  equipment_needed?: string[]
  special_requirements?: string
  weather_dependent: boolean
  // Cutoff system fields
  cutoff_time?: string
  cutoff_enabled?: boolean
  reset_time?: string
  reset_enabled?: boolean
  is_registration_active?: boolean
  cutoff_status?: 'active' | 'cutoff_reached'
  can_register?: boolean
  cutoff_reached?: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

// Staff data will be loaded from API


// Category mappings
const categoryLabels = {
  day_activity: 'Day Activity',
  night_activity: 'Night Activity',
  sport_activity: 'Sport Activity',
  teaching: 'Teaching'
}

const categoryColors = {
  day_activity: 'bg-blue-50 border-blue-200',
  night_activity: 'bg-purple-50 border-purple-200',
  sport_activity: 'bg-green-50 border-green-200',
  teaching: 'bg-yellow-50 border-yellow-200'
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false)
  const [isRecurrenceModalOpen, setIsRecurrenceModalOpen] = useState(false)
  // Multi-select state
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([])
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false)
  const [recurrenceSettings, setRecurrenceSettings] = useState<RecurrenceSettings>({
    type: 'none',
    interval: 1,
    daysOfWeek: [],
    maxOccurrences: 10
  })
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published' | 'archived'>('all')

  // Enhanced filter state
  const [eventFilter, setEventFilter] = useState<{
    title: string
    category: string
    location: string
    dateFrom: string
    dateTo: string
  }>({ title: '', category: '', location: '', dateFrom: '', dateTo: '' })

  // Form state for create/edit
  const [formData, setFormData] = useState<Partial<Event>>({
    title: '',
    event_type: 'day_activity',
    location: '',
    start_time: '',
    end_time: '',
    description: '',
    max_participants: undefined,
    min_participants: undefined,
    price: 0,
    special_requirements: '',
    equipment_needed: [],
    weather_dependent: false,
    assigned_staff: [],
    repetition: 'none',
    selectedDays: []
  })

  // Separate date and time for form
  const [eventDate, setEventDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  // Load staff and events data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load staff
        const staffResponse = await fetch('/api/staff')
        if (staffResponse.ok) {
          const staffData = await staffResponse.json()
          setStaff(staffData)
        } else {
          console.error('Error loading staff:', staffResponse.statusText)
        }

        // Load events
        const eventsResponse = await fetch('/api/events')
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json()
          setEvents(eventsData)
        } else {
          console.error('Error loading events:', eventsResponse.statusText)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }

    loadData()
  }, [])

  // Check cutoff status every minute
  useEffect(() => {
    const cutoffCheckInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/cutoff-cron')
        if (response.ok) {
          // Reload events to get updated cutoff status
          const eventsResponse = await fetch('/api/events')
          if (eventsResponse.ok) {
            const eventsData = await eventsResponse.json()
            setEvents(eventsData)
          }
        }
      } catch (error) {
        console.error('Error checking cutoff status:', error)
      }
    }, 60000) // Check every minute

    return () => clearInterval(cutoffCheckInterval)
  }, [])

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime)
    return {
      date: date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const formatDuration = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffMs = endDate.getTime() - startDate.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (diffHours > 0) {
      return diffMinutes > 0 ? `${diffHours}h ${diffMinutes}m` : `${diffHours}h`
    }
    return `${diffMinutes}m`
  }

  const handlePublishToggle = (event: Event) => {
    const newStatus = event.status === 'published' ? 'draft' : 'published'
    setEvents(events.map(e =>
      e.id === event.id
        ? { ...e, status: newStatus }
        : e
    ))
  }

  const handleCopyEvent = (event: Event) => {
    setSelectedEvent(event)
    setFormData({
      ...event,
      id: undefined,
      parent_id: event.id,
      title: `${event.title} (Kopie)`,
      status: 'draft',
      current_participants: 0
    })
    setIsCopyModalOpen(true)
  }

  const handleSetupRecurrence = (event: Event) => {
    setSelectedEvent(event)
    setRecurrenceSettings({
      type: 'none',
      interval: 1,
      daysOfWeek: [],
      maxOccurrences: 10
    })
    setIsRecurrenceModalOpen(true)
  }


  const handleCreateRecurrence = async () => {
    if (!selectedEvent || recurrenceSettings.type === 'none') return

    try {
      // Create recurrence rule
      const rule: Omit<RecurrenceRule, 'id'> = {
        type: recurrenceSettings.type,
        interval_count: recurrenceSettings.interval,
        days_of_week: recurrenceSettings.daysOfWeek,
        end_date: recurrenceSettings.endDate,
        max_occurrences: recurrenceSettings.maxOccurrences
      }

      const ruleResult = await recurrenceService.createRecurrenceRule(rule)

      if (ruleResult) {
        // Generate recurring instances
        const startDate = new Date()
        const endDate = recurrenceSettings.endDate ? new Date(recurrenceSettings.endDate) : undefined

        const instances = await recurrenceService.generateRecurringEvents(
          selectedEvent.id,
          startDate.toISOString().split('T')[0],
          endDate?.toISOString().split('T')[0]
        )

        alert(`Created ${instances.length} recurring event instances!`)
        // Refresh events - in real app would refetch from database
      }
    } catch (error) {
      alert('Error creating recurrence')
    }

    setIsRecurrenceModalOpen(false)
    setSelectedEvent(null)
  }

  const handleDuplicate = (event: Event) => {
    const newEvent: Event = {
      ...event,
      id: `${Date.now()}`,
      title: `${event.title} (Kopie)`,
      status: 'draft',
      current_participants: 0
    }
    setEvents([...events, newEvent])
  }

  const handleDelete = (event: Event) => {
    setEvents(events.filter(e => e.id !== event.id))
    setIsDeleteModalOpen(false)
    setSelectedEvent(null)
  }

  // Multi-select functions
  const handleSelectEvent = (eventId: string) => {
    setSelectedEventIds(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    )
  }

  const handleSelectAllEvents = () => {
    const filteredEvents = events.filter(event => {
      if (filterStatus === 'all') return true
      if (filterStatus === 'draft') return event.status === 'draft'
      if (filterStatus === 'published') return event.status === 'published'
      if (filterStatus === 'archived') return event.status === 'archived'
      return true
    })
    
    if (selectedEventIds.length === filteredEvents.length) {
      setSelectedEventIds([])
    } else {
      setSelectedEventIds(filteredEvents.map(event => event.id))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedEventIds.length === 0) {
      alert('Please select events to delete')
      return
    }

    try {
      const response = await fetch(`/api/events?bulk_ids=${JSON.stringify(selectedEventIds)}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const result = await response.json()
        alert(`${result.deletedCount} events deleted successfully!`)
        setSelectedEventIds([])
        setIsBulkDeleteModalOpen(false)
        loadData()
      } else {
        const error = await response.json()
        alert(`Error deleting events: ${error.error}`)
      }
    } catch (error) {
      console.error('Error bulk deleting events:', error)
      alert('Error deleting events')
    }
  }

  const handleCreate = () => {
    setFormData({
      title: '',
      event_type: 'day_activity',
      location: '',
      start_time: '',
      end_time: '',
      description: '',
      min_participants: undefined,
      max_participants: undefined,
      price: 0,
      special_requirements: '',
      equipment_needed: [],
      weather_dependent: false,
      assigned_staff: [],
      repetition: 'none',
      selectedDays: []
    })
    setEventDate('')
    setStartTime('')
    setEndTime('')
    setIsCreateModalOpen(true)
  }

  const handleEdit = (event: Event) => {
    setFormData({
      ...event,
      repetition: 'none',
      selectedDays: []
    })

    // Split start_time into date and time
    const startDateTime = new Date(event.start_time)
    const endDateTime = new Date(event.end_time)

    setEventDate(startDateTime.toISOString().split('T')[0])
    setStartTime(startDateTime.toTimeString().slice(0, 5))
    setEndTime(endDateTime.toTimeString().slice(0, 5))

    setSelectedEvent(event)
    setIsEditModalOpen(true)
  }

  const handleSave = () => {
    if (!formData.title || !formData.location || !eventDate || !startTime || !endTime) {
      alert('Please fill in all required fields')
      return
    }

    // Combine date and time
    const startDateTime = `${eventDate}T${startTime}:00`
    const endDateTime = `${eventDate}T${endTime}:00`

    const newEvent: Event = {
      id: selectedEvent?.id || `${Date.now()}`,
      title: formData.title!,
      event_type: formData.event_type,
      location: formData.location!,
      start_time: startDateTime,
      end_time: endDateTime,
      description: formData.description || '',
      status: selectedEvent?.status || 'draft',
      min_participants: formData.min_participants || undefined,
      max_participants: formData.max_participants || undefined,
      current_participants: selectedEvent?.current_participants || 0,
      price: formData.price || 0,
      equipment_needed: formData.equipment_needed || [],
      special_requirements: formData.special_requirements || '',
      weather_dependent: formData.weather_dependent || false,
      assigned_staff: formData.assigned_staff || [],
      created_at: selectedEvent?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    if (selectedEvent) {
      // Edit existing event
      setEvents(events.map(e => e.id === selectedEvent.id ? newEvent : e))
    } else {
      // Create new event
      setEvents([...events, newEvent])
    }

    setIsCreateModalOpen(false)
    setIsEditModalOpen(false)
    setSelectedEvent(null)
    setEventDate('')
    setStartTime('')
    setEndTime('')
  }

  const getFilteredEvents = () => {
    if (!Array.isArray(events)) return []
    return events.filter(event => {
      // Status filter
      if (filterStatus !== 'all' && event.status !== filterStatus) return false

      // Title filter
      if (eventFilter.title && !event.title.toLowerCase().includes(eventFilter.title.toLowerCase())) {
        return false
      }

      // Category filter
      if (eventFilter.category && eventFilter.category !== 'all' && event.event_type !== eventFilter.category) {
        return false
      }

      // Location filter
      if (eventFilter.location && !event.location?.toLowerCase().includes(eventFilter.location.toLowerCase())) {
        return false
      }

      // Date range filter
      if (eventFilter.dateFrom || eventFilter.dateTo) {
        const eventDate = event.start_time.split('T')[0]
        if (eventFilter.dateFrom && eventDate < eventFilter.dateFrom) return false
        if (eventFilter.dateTo && eventDate > eventFilter.dateTo) return false
      }

      return true
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const groupedEvents = getFilteredEvents().reduce((acc, event) => {
    const eventType = event.event_type || 'day_activity'
    if (!acc[eventType]) {
      acc[eventType] = []
    }
    acc[eventType].push(event)
    return acc
  }, {} as Record<string, Event[]>)

  const EventCard = ({ event }: { event: Event }) => {
    const startDateTime = formatDateTime(event.start_time)
    const duration = formatDuration(event.start_time, event.end_time)

    return (
      <div className={`bg-white rounded-lg border-2 p-4 shadow-sm hover:shadow-md transition-shadow ${
        selectedEventIds.includes(event.id) 
          ? 'border-blue-500 bg-blue-50' 
          : categoryColors[event.event_type || 'day_activity']
      }`}>
        {/* Checkbox for multi-select */}
        <div className="flex items-start justify-between mb-2">
          <input
            type="checkbox"
            checked={selectedEventIds.includes(event.id)}
            onChange={() => handleSelectEvent(event.id)}
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
        
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <ClockIcon className="w-4 h-4 mr-1" />
              {startDateTime.date} • {startDateTime.time} ({duration})
            </div>
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <MapPinIcon className="w-4 h-4 mr-1" />
              {event.location}
            </div>
          </div>
          <div className={`px-2 py-1 rounded text-xs font-medium ${
            event.status === 'published'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {event.status === 'published' ? 'Published' : 'Draft'}
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-sm text-gray-600">
            <UserGroupIcon className="w-4 h-4 mr-1" />
            {event.current_participants} / {event.max_participants || '∞'}
            {event.min_participants && (
              <span className="ml-2 text-xs text-gray-500">
                (min: {event.min_participants})
              </span>
            )}
            {event.is_mandatory && (
              <span className="ml-2 px-1 py-0.5 bg-red-100 text-red-800 text-xs rounded">
                Mandatory
              </span>
            )}
          </div>
          {event.price && event.price > 0 && (
            <div className="text-sm font-medium text-gray-900">
              {event.price}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {categoryLabels[event.event_type || 'day_activity']}
            </span>
            {event.cutoff_enabled && (
              <div className="flex items-center space-x-1">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  event.cutoff_reached 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {event.cutoff_reached ? 'Cutoff' : 'Active'}
                </span>
                {event.cutoff_time && (
                  <span className="text-xs text-gray-500">
                    {event.cutoff_time}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex space-x-1">
            <button
              onClick={() => {
                setSelectedEvent(event)
                setIsViewModalOpen(true)
              }}
              className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="View"
            >
              <EyeIcon className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleEdit(event)}
              className="p-1.5 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
              title="Edit"
            >
              <PencilIcon className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleCopyEvent(event)}
              className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
              title="Copy Event"
            >
              <DocumentDuplicateIcon className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleSetupRecurrence(event)}
              className="p-1.5 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
              title="Setup Recurrence"
            >
              <ArrowPathIcon className="w-4 h-4" />
            </button>


            <button
              onClick={() => handlePublishToggle(event)}
              className={`p-1.5 rounded transition-colors ${
                event.status === 'published'
                  ? 'text-green-600 hover:text-gray-600 hover:bg-gray-50'
                  : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
              }`}
              title={event.status === 'published' ? 'Unpublish' : 'Publish'}
            >
              <GlobeAltIcon className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setSelectedEvent(event)
                setIsDeleteModalOpen(true)
              }}
              className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
            <p className="text-gray-600">Manage events with recurrence and copy functionality</p>
          </div>
          {/* Multi-select controls */}
          {selectedEventIds.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedEventIds.length} selected
              </span>
              <button
                onClick={() => setIsBulkDeleteModalOpen(true)}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 flex items-center space-x-1"
              >
                <TrashIcon className="h-4 w-4" />
                <span>Delete</span>
              </button>
              <button
                onClick={() => setSelectedEventIds([])}
                className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
              >
                Clear
              </button>
            </div>
          )}
          
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Create Event
          </button>
        </div>

        {/* Enhanced Filter Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Filter Events</h2>
            
            {/* Select All Checkbox */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedEventIds.length > 0 && selectedEventIds.length === events.filter(event => {
                  if (filterStatus === 'all') return true
                  if (filterStatus === 'draft') return event.status === 'draft'
                  if (filterStatus === 'published') return event.status === 'published'
                  if (filterStatus === 'archived') return event.status === 'archived'
                  return true
                }).length}
                onChange={handleSelectAllEvents}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm text-gray-700">Select All</label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Title</label>
              <input
                type="text"
                value={eventFilter.title}
                onChange={(e) => setEventFilter({ ...eventFilter, title: e.target.value })}
                placeholder="Search events..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={eventFilter.category}
                onChange={(e) => setEventFilter({ ...eventFilter, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All Categories</option>
                <option value="day_activity">Day Activity</option>
                <option value="night_activity">Night Activity</option>
                <option value="sport_activity">Sport Activity</option>
                <option value="teaching">Teaching</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={eventFilter.location}
                onChange={(e) => setEventFilter({ ...eventFilter, location: e.target.value })}
                placeholder="Search location..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={eventFilter.dateFrom}
                onChange={(e) => setEventFilter({ ...eventFilter, dateFrom: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={eventFilter.dateTo}
                onChange={(e) => setEventFilter({ ...eventFilter, dateTo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {Object.entries(groupedEvents).map(([category, categoryEvents]) => (
            <div key={category} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                {categoryLabels[category as keyof typeof categoryLabels]}
                <span className="ml-2 bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded-full">
                  {categoryEvents.length}
                </span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          ))}

          {events.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600">No events have been created yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Event Details</h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">{selectedEvent.title}</h3>
                  <p className="text-sm text-gray-600 mb-1">ID: {selectedEvent.id}</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    selectedEvent.status === 'published'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedEvent.status}
                  </span>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-medium text-gray-900">{categoryLabels[selectedEvent.event_type || 'day_activity']}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Date & Time</p>
                  <p className="font-medium text-gray-900">
                    {formatDateTime(selectedEvent.start_time).date}
                  </p>
                  <p className="text-sm text-gray-700">
                    {formatDateTime(selectedEvent.start_time).time} - {formatDateTime(selectedEvent.end_time).time}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium text-gray-900">{selectedEvent.location}</p>
                </div>
              </div>

              {selectedEvent.description && (
                <div className="mb-6">
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="text-gray-900 mt-1">{selectedEvent.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Participants</p>
                  <p className="font-medium text-gray-900">
                    {selectedEvent.current_participants} / {selectedEvent.max_participants || '∞'}
                    {selectedEvent.min_participants && (
                      <span className="text-xs text-gray-500 block">
                        (Minimum: {selectedEvent.min_participants})
                      </span>
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Cost</p>
                  <p className="font-medium text-gray-900">
                    {selectedEvent.price && selectedEvent.price > 0
                      ? `${selectedEvent.price}`
                      : 'Free'
                    }
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600">Assigned Staff</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedEvent.assigned_staff && selectedEvent.assigned_staff.length > 0 ? (
                    selectedEvent.assigned_staff.map(staffId => {
                      const staffMember = staff.find(s => s.id === staffId)
                      return staffMember ? (
                        <span key={staffMember.id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {staffMember.name}
                        </span>
                      ) : null
                    })
                  ) : (
                    <span className="text-gray-500 text-xs">No staff assigned</span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Registered Participants ({selectedEvent.current_participants})</p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 italic">No participants registered yet</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                {isCreateModalOpen ? 'Create Event' : 'Edit Event'}
              </h2>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false)
                  setIsEditModalOpen(false)
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Name *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Morning Beach Volleyball"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.event_type}
                    onChange={(e) => setFormData({ ...formData, event_type: e.target.value as Event['event_type'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="day_activity">Day Activity</option>
                    <option value="night_activity">Night Activity</option>
                    <option value="sport_activity">Sport Activity</option>
                    <option value="teaching">Teaching</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Beach Court"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assigned Staff
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {staff.map(staffMember => (
                      <label key={staffMember.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.assigned_staff?.includes(staffMember.id) || false}
                          onChange={(e) => {
                            const currentStaff = formData.assigned_staff || []
                            if (e.target.checked) {
                              setFormData({ ...formData, assigned_staff: [...currentStaff, staffMember.id] })
                            } else {
                              setFormData({ ...formData, assigned_staff: currentStaff.filter(id => id !== staffMember.id) })
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">{staffMember.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Date & Time - Separate fields like meals */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Time *
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Participants */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Participants
                    </label>
                    <input
                      type="number"
                      value={formData.min_participants || ''}
                      onChange={(e) => setFormData({ ...formData, min_participants: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Optional"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Participants
                    </label>
                    <input
                      type="number"
                      value={formData.max_participants || ''}
                      onChange={(e) => setFormData({ ...formData, max_participants: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Optional (unlimited)"
                      min="1"
                    />
                  </div>
                </div>

                {/* Cost */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cost per Person
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Describe what participants can expect..."
                />
              </div>

              {/* Requirements */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requirements
                </label>
                <input
                  type="text"
                  value={formData.special_requirements}
                  onChange={(e) => setFormData({ ...formData, special_requirements: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Bring water bottle and wear sports shoes"
                />
              </div>


              {/* Options */}
              <div className="mt-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.weather_dependent}
                    onChange={(e) => setFormData({ ...formData, weather_dependent: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Weather dependent</span>
                </label>
              </div>

              {/* Repetition - Same as meals */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Wiederholung</label>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[
                    { value: 'none', label: 'Keine' },
                    { value: 'daily', label: 'Täglich' },
                    { value: 'weekly', label: 'Wöchentlich' },
                    { value: 'monthly', label: 'Monatlich' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({...formData, repetition: option.value, selectedDays: []})}
                      className={`px-3 py-2 rounded-md text-sm font-medium border transition-colors ${
                        (formData.repetition || 'none') === option.value
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {formData.repetition === 'weekly' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Wochentage auswählen</label>
                    <div className="grid grid-cols-7 gap-1">
                      {[
                        { value: 0, label: 'So' },
                        { value: 1, label: 'Mo' },
                        { value: 2, label: 'Di' },
                        { value: 3, label: 'Mi' },
                        { value: 4, label: 'Do' },
                        { value: 5, label: 'Fr' },
                        { value: 6, label: 'Sa' }
                      ].map((day) => (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => {
                            const currentDays = formData.selectedDays || [];
                            const newDays = currentDays.includes(day.value)
                              ? currentDays.filter(d => d !== day.value)
                              : [...currentDays, day.value];
                            setFormData({...formData, selectedDays: newDays});
                          }}
                          className={`px-3 py-2 rounded-md text-sm font-medium border transition-colors ${
                            (formData.selectedDays || []).includes(day.value)
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {formData.repetition !== 'none' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Anzahl Wiederholungen</label>
                    <input
                      type="number"
                      value={formData.maxOccurrences || 10}
                      onChange={(e) => setFormData({...formData, maxOccurrences: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                      max="100"
                      placeholder="Anzahl der Wiederholungen (z.B. 10)"
                    />
                  </div>
                )}
              </div>


              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
                <button
                  onClick={() => {
                    setIsCreateModalOpen(false)
                    setIsEditModalOpen(false)
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <XMarkIcon className="w-4 h-4 inline mr-1" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <CheckIcon className="w-4 h-4 inline mr-1" />
                  Save Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Delete Event</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{selectedEvent.title}"? This action cannot be undone and will remove all participant assignments.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(selectedEvent)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Copy Modal */}
      {isCopyModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Copy Event</h3>
              <button
                onClick={() => {
                  setIsCopyModalOpen(false)
                  setSelectedEvent(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.start_time || ''}
                  onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.end_time || ''}
                  onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsCopyModalOpen(false)
                    setSelectedEvent(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recurrence Modal */}
      {isRecurrenceModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Setup Recurrence</h3>
              <button
                onClick={() => setIsRecurrenceModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Repeat</label>
                <select
                  value={recurrenceSettings.type}
                  onChange={(e) => setRecurrenceSettings({...recurrenceSettings, type: e.target.value as any})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="none">No Repeat</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {recurrenceSettings.type === 'weekly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Days of Week</label>
                  <div className="grid grid-cols-7 gap-1">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                      <label key={day} className="flex items-center justify-center p-2 border rounded cursor-pointer hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={recurrenceSettings.daysOfWeek.includes(index)}
                          onChange={(e) => {
                            const days = e.target.checked
                              ? [...recurrenceSettings.daysOfWeek, index]
                              : recurrenceSettings.daysOfWeek.filter(d => d !== index)
                            setRecurrenceSettings({...recurrenceSettings, daysOfWeek: days})
                          }}
                          className="sr-only"
                        />
                        <span className={`text-xs ${
                          recurrenceSettings.daysOfWeek.includes(index) ? 'text-blue-600 font-medium' : 'text-gray-600'
                        }`}>
                          {day}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Occurrences</label>
                <input
                  type="number"
                  value={recurrenceSettings.maxOccurrences || 10}
                  onChange={(e) => setRecurrenceSettings({...recurrenceSettings, maxOccurrences: parseInt(e.target.value)})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  min="1"
                  max="100"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsRecurrenceModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateRecurrence}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  disabled={recurrenceSettings.type === 'none'}
                >
                  Create Recurrence
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Delete Events</h3>
              <button
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                ✕
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600">
                Are you sure you want to delete <strong>{selectedEventIds.length}</strong> selected events?
              </p>
              <p className="text-sm text-red-600 mt-2">
                This action cannot be undone.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete {selectedEventIds.length} Events
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}