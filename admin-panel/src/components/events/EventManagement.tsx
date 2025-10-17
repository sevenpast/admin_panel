'use client'

import { useState, useEffect } from 'react'
import { useToastContext } from '@/components/common/ToastProvider'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  XMarkIcon,
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  DocumentDuplicateIcon,
  RectangleStackIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'
import UnifiedCard from '@/components/common/UnifiedCard'

interface Event {
  id: string
  event_id: string
  title: string
  description?: string
  category: 'activity' | 'social' | 'sport' | 'workshop'
  location: string
  start_at: string
  end_at: string
  status: 'draft' | 'published'
  min_participants?: number
  max_participants?: number
  current_participants?: number
  organizer_id?: string
  additional_staff?: string[]
  is_active: boolean
  created_at: string
}

interface EventTemplate {
  id: string
  name: string
  title: string
  description?: string
  category: 'activity' | 'social' | 'sport' | 'workshop'
  location: string
  start_time: string
  end_time: string
  min_participants?: number
  max_participants?: number
  organizer_id?: string
  additional_staff?: string[]
  created_at: string
}

interface Staff {
  id: string
  staff_id: string
  name: string
  labels: string[]
  is_active: boolean
}

export default function EventManagement() {
  const { success, error } = useToastContext()
  const [events, setEvents] = useState<Event[]>([])
  const [templates, setTemplates] = useState<EventTemplate[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showTemplatesList, setShowTemplatesList] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([])
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [weeklyDays, setWeeklyDays] = useState<number[]>([])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'activity' as 'activity' | 'social' | 'sport' | 'workshop',
    location: '',
    event_date: '',
    start_time: '',
    end_time: '',
    min_participants: 1,
    max_participants: 20,
    organizer_id: '',
    additional_staff: [] as string[],
    repetition: 'none' as 'none' | 'daily' | 'weekly' | 'monthly'
  })

  const [templateData, setTemplateData] = useState({
    name: '',
    title: '',
    description: '',
    category: 'activity' as 'activity' | 'social' | 'sport' | 'workshop',
    location: '',
    start_time: '',
    end_time: '',
    min_participants: 1,
    max_participants: 20,
    organizer_id: '',
    additional_staff: [] as string[]
  })

  useEffect(() => {
    loadEvents()
    loadStaff()
    loadTemplates()
  }, [])

  const loadEvents = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/events').catch(() => null)
      if (response?.ok) {
        const result = await response.json()
        const eventsData = result.success ? result.data : result
        setEvents(Array.isArray(eventsData) ? eventsData : [])
      } else {
        console.error('Error loading events:', await response.text())
        setEvents([])
      }
    } catch (err) {
      console.error('Error:', err)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const loadStaff = async () => {
    try {
      const response = await fetch('/api/staff').catch(() => null)
      if (response?.ok) {
        const result = await response.json()
        const staffData = result.success ? result.data : result
        setStaff(Array.isArray(staffData) ? staffData : [])
      } else {
        console.error('Error loading staff:', await response?.text())
        setStaff([])
      }
    } catch (err) {
      console.error('Error:', err)
      setStaff([])
    }
  }

  const filteredEvents = events.filter(event => {
    if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    if (categoryFilter !== 'all' && event.category !== categoryFilter) {
      return false
    }
    if (statusFilter !== 'all' && event.status !== statusFilter) {
      return false
    }
    return true
  })

  const handleCreateEvent = () => {
    setFormData({
      title: '',
      description: '',
      category: 'activity',
      location: '',
      event_date: '',
      start_time: '',
      end_time: '',
      min_participants: 1,
      max_participants: 20,
      organizer_id: '',
      additional_staff: [],
      repetition: 'none'
    })
    setWeeklyDays([])
    setSelectedEvent(null)
    setShowCreateModal(true)
  }

  const handleCreateFromTemplate = (template: EventTemplate) => {
    setFormData({
      title: template.title,
      description: template.description || '',
      category: template.category,
      location: template.location,
      event_date: '',
      start_time: template.start_time,
      end_time: template.end_time,
      min_participants: template.min_participants || 1,
      max_participants: template.max_participants || 20,
      organizer_id: template.organizer_id || '',
      additional_staff: template.additional_staff || [],
      repetition: 'none'
    })
    setWeeklyDays([])
    setSelectedEvent(null)
    setShowCreateModal(true)
    setShowTemplatesList(false)
  }

  const handleSaveAsTemplate = (event?: Event) => {
    const eventData = event || {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      location: formData.location,
      start_time: formData.start_time,
      end_time: formData.end_time,
      min_participants: formData.min_participants,
      max_participants: formData.max_participants,
      organizer_id: formData.organizer_id,
      additional_staff: formData.additional_staff
    }

    setTemplateData({
      name: '',
      title: eventData.title,
      description: eventData.description,
      category: eventData.category,
      location: eventData.location,
      start_time: eventData.start_time,
      end_time: eventData.end_time,
      min_participants: eventData.min_participants,
      max_participants: eventData.max_participants,
      organizer_id: eventData.organizer_id,
      additional_staff: eventData.additional_staff
    })
    setShowTemplateModal(true)
  }

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event)
    const startDate = new Date(event.start_at)
    const endDate = new Date(event.end_at)
    setFormData({
      title: event.title,
      description: event.description || '',
      category: event.category,
      location: event.location,
      event_date: startDate.toISOString().split('T')[0],
      start_time: startDate.toTimeString().slice(0, 5),
      end_time: endDate.toTimeString().slice(0, 5),
      min_participants: event.min_participants || 1,
      max_participants: event.max_participants || 20,
      organizer_id: event.organizer_id || '',
      additional_staff: event.additional_staff || [],
      repetition: 'none' // Default for existing events
    })
    setShowEditModal(true)
  }

  const handleViewEvent = (event: Event) => {
    setSelectedEvent(event)
    setShowViewModal(true)
  }

  const handleSaveEvent = async () => {
    try {
      // Validate required fields
      if (!formData.title.trim()) {
        error('Event title is required')
        return
      }
      if (!formData.event_date) {
        error('Event date is required')
        return
      }
      if (!formData.start_time) {
        error('Start time is required')
        return
      }
      if (!formData.end_time) {
        error('End time is required')
        return
      }
      if (!formData.location.trim()) {
        error('Location is required')
        return
      }

      // Convert date and time fields to full timestamps
      const { event_date, start_time, end_time, repetition, min_participants, ...otherFields } = formData

      const eventData = {
        ...otherFields,
        start_at: `${event_date}T${start_time}:00.000Z`,
        end_at: `${event_date}T${end_time}:00.000Z`,
        status: 'draft' as const,
        is_active: true
        // Note: repetition and min_participants fields are removed as they're not supported by the database yet
      }

      const url = showEditModal && selectedEvent
        ? `/api/events/${selectedEvent.id}`
        : '/api/events'

      const method = showEditModal ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: `HTTP ${response.status}` }))
        console.error('Event save error:', error)
        console.error('Response status:', response.status)
        console.error('Event data sent:', eventData)
        const errorMessage = error.error?.message || error.error || error.message || `HTTP Error ${response.status}` || 'Unknown error'
        error(`Error saving event: ${errorMessage}`)
        return
      }

      const result = await response.json()
      const savedEvent = result.success ? result.data : result

      if (showEditModal) {
        setEvents(events.map(e => e.id === selectedEvent?.id ? savedEvent : e))
        success('Event updated successfully')
      } else {
        setEvents([savedEvent, ...events])
        success('Event created successfully')
      }

      // Reset form and close modals
      setFormData({
        title: '',
        description: '',
        category: 'activity',
        location: '',
        event_date: '',
        start_time: '',
        end_time: '',
        min_participants: 1,
        max_participants: 20,
        organizer_id: '',
        additional_staff: [],
        repetition: 'none'
      })
      setShowCreateModal(false)
      setShowEditModal(false)
    } catch (err) {
      console.error('Error:', err)
      error('Error saving event')
    }
  }

  const handleSaveTemplate = async () => {
    try {
      if (!templateData.name.trim()) {
        error('Template name is required')
        return
      }

      // Save template to localStorage for now (in real app, save to database)
      const newTemplate: EventTemplate = {
        id: Date.now().toString(),
        name: templateData.name,
        title: templateData.title,
        description: templateData.description,
        category: templateData.category,
        location: templateData.location,
        start_time: templateData.start_time,
        end_time: templateData.end_time,
        min_participants: templateData.min_participants,
        max_participants: templateData.max_participants,
        organizer_id: templateData.organizer_id,
        additional_staff: templateData.additional_staff,
        created_at: new Date().toISOString()
      }

      const existingTemplates = JSON.parse(localStorage.getItem('eventTemplates') || '[]')
      existingTemplates.push(newTemplate)
      localStorage.setItem('eventTemplates', JSON.stringify(existingTemplates))
      
      setTemplates(existingTemplates)
      setShowTemplateModal(false)
      success('Template saved successfully!')
    } catch (err) {
      console.error('Error:', err)
      error('Error saving template')
    }
  }

  const loadTemplates = () => {
    try {
      const savedTemplates = JSON.parse(localStorage.getItem('eventTemplates') || '[]')
      setTemplates(savedTemplates)
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const handleDeleteEvent = async (event: Event) => {
    if (confirm(`Are you sure you want to delete "${event.title}"?`)) {
      try {
        const response = await fetch(`/api/events/${event.id}`, {
          method: 'DELETE'
        }).catch(() => null)

        if (!response?.ok) {
          const error = await response.json()
          console.error('Event delete error:', error)
          const errorMessage = error.error?.message || error.error || error.message || 'Unknown error'
          error(`Error deleting event: ${errorMessage}`)
          return
        }

        setEvents(events.filter(e => e.id !== event.id))
        success('Event deleted successfully')
      } catch (err) {
        console.error('Error:', err)
        error('Error deleting event')
      }
    }
  }

  const toggleEventStatus = async (event: Event) => {
    try {
      const newStatus = event.status === 'published' ? 'draft' : 'published'

      const response = await fetch(`/api/events/${event.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...event,
          status: newStatus
        })
      }).catch(() => null)

      if (!response?.ok) {
        const error = await response.json()
        console.error('Event status update error:', error)
        const errorMessage = error.error?.message || error.error || error.message || 'Unknown error'
        error(`Error updating event status: ${errorMessage}`)
        return
      }

      const updatedEvent = await response.json()
      setEvents(events.map(e => e.id === event.id ? updatedEvent : e))
    } catch (err) {
      console.error('Error:', err)
      error('Error updating event status')
    }
  }

  const getCategoryDisplayName = (category: string) => {
    switch (category) {
      case 'activity': return 'Day Activity'
      case 'social': return 'Night Activity'
      case 'sport': return 'Sport Activity'
      case 'workshop': return 'Teaching'
      default: return category
    }
  }

  const getStaffName = (staffId: string) => {
    const staffMember = staff.find(s => s.id === staffId)
    return staffMember ? staffMember.name : 'Unknown Staff'
  }

  const toggleStaffAssignment = (staffId: string) => {
    const currentStaff = formData.additional_staff || []
    if (currentStaff.includes(staffId)) {
      setFormData({
        ...formData,
        additional_staff: currentStaff.filter(id => id !== staffId)
      })
    } else {
      setFormData({
        ...formData,
        additional_staff: [...currentStaff, staffId]
      })
    }
  }


  const handleDuplicateEvent = (event: Event) => {
    const startDate = new Date(event.start_at)
    const endDate = new Date(event.end_at)
    setFormData({
      title: event.title,
      description: event.description || '',
      category: event.category,
      location: event.location,
      event_date: '',
      start_time: startDate.toTimeString().slice(0, 5),
      end_time: endDate.toTimeString().slice(0, 5),
      min_participants: event.min_participants || 1,
      max_participants: event.max_participants || 20,
      organizer_id: event.organizer_id || '',
      additional_staff: event.additional_staff || [],
      repetition: 'none'
    })
    setSelectedEvent(event)
    setShowCreateModal(true)
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'activity': return 'bg-blue-100 text-blue-800'    // Day Activity
      case 'social': return 'bg-purple-100 text-purple-800'  // Night Activity
      case 'sport': return 'bg-orange-100 text-orange-800'   // Sport Activity
      case 'workshop': return 'bg-green-100 text-green-800'  // Teaching
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleSelectEvent = (eventId: string) => {
    setSelectedEventIds(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    )
  }

  const handleSelectAllEvents = () => {
    if (selectedEventIds.length === filteredEvents.length) {
      setSelectedEventIds([])
    } else {
      setSelectedEventIds(filteredEvents.map(event => event.id))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedEventIds.length === 0) {
      error('Please select events to delete')
      return
    }

    try {
      const response = await fetch(`/api/events?bulk_ids=${JSON.stringify(selectedEventIds)}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const result = await response.json()
        error(`${result.deletedCount} events deleted successfully!`)
        setSelectedEventIds([])
        setShowBulkDeleteModal(false)
        loadEvents()
      } else {
        const error = await response.json()
        const errorMessage = error.error?.message || error.error?.code || error.message || 'Failed to delete events'
        error(`Error deleting events: ${errorMessage}`)
      }
    } catch (err) {
      console.error('Error:', err)
      error('Error deleting events')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading events...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
          <p className="text-gray-600 mt-1">Create and manage camp events and activities</p>
        </div>
        <div className="flex space-x-3">
          {selectedEventIds.length > 0 && (
            <button
              onClick={() => setShowBulkDeleteModal(true)}
              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              title={`Delete Selected (${selectedEventIds.length})`}
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={() => setShowTemplatesList(true)}
            className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
            title={`Templates (${templates.length})`}
          >
            <RectangleStackIcon className="h-5 w-5" />
          </button>
          <button
            onClick={handleCreateEvent}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            title="Create Event"
          >
            <PlusIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="activity">Day Activity</option>
              <option value="social">Night Activity</option>
              <option value="sport">Sport Activity</option>
              <option value="workshop">Teaching</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {/* Bulk Actions */}
        {selectedEventIds.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">
                {selectedEventIds.length} event(s) selected
              </span>
              <button
                onClick={handleBulkDelete}
                className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                title="Delete Selected"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredEvents.map((event, index) => (
            <div key={event.id || `event-${index}`} className="relative">
              {/* Selection Checkbox */}
              <div className="absolute top-2 left-2 z-10">
                <input
                  type="checkbox"
                  checked={selectedEventIds.includes(event.id)}
                  onChange={() => handleSelectEvent(event.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white shadow-sm"
                />
              </div>

              <UnifiedCard
                id={event.id}
                title={event.title}
                subtitle={event.location}
                description={event.description}
                status={event.status}
                category={getCategoryDisplayName(event.category)}
                date={new Date(event.start_at).toLocaleDateString()}
                time={`${new Date(event.start_at).toLocaleTimeString()} - ${new Date(event.end_at).toLocaleTimeString()}`}
                participants={`${event.current_participants || 0} / ${event.max_participants || 'No limit'}`}
                color={getCategoryColor(event.category).includes('blue') ? '#3B82F6' : 
                       getCategoryColor(event.category).includes('green') ? '#10B981' :
                       getCategoryColor(event.category).includes('yellow') ? '#F59E0B' : '#8B5CF6'}
                onView={(id) => handleViewEvent(event)}
                onEdit={(id) => handleEditEvent(event)}
                onPublish={(id) => toggleEventStatus(event)}
                onUnpublish={(id) => toggleEventStatus(event)}
                onCopy={(id) => handleDuplicateEvent(event)}
                onTemplate={(id) => handleSaveAsTemplate(event)}
                onDelete={(id) => handleDeleteEvent(event)}
              />
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No events found</p>
            <p className="text-sm">Create your first event to get started</p>
          </div>
        )}
      </div>

      {/* Bulk Delete Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-red-600">Delete Events</h2>
              <button
                onClick={() => setShowBulkDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete {selectedEventIds.length} selected event(s)? This action cannot be undone.
              </p>
              
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> This will permanently delete the selected events and all associated data.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowBulkDeleteModal(false)}
                className="p-2 text-gray-600 hover:text-gray-800 rounded-md hover:bg-gray-100"
                title="Cancel"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
              <button
                onClick={handleBulkDelete}
                className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                title={`Delete ${selectedEventIds.length} Event(s)`}
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Save as Template</h2>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Save this event as a template that can be reused later. Template will include all details except the date and will be marked with the title as shown.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="p-2 text-gray-600 hover:text-gray-800 rounded-md hover:bg-gray-100"
                title="Cancel"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => {
                  setShowTemplateModal(false)
                  setShowCreateModal(true)
                }}
                className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                title="Use Template"
              >
                <CheckIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {showCreateModal ? 'Create Event' : 'Edit Event'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setShowEditModal(false)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="activity">Day Activity</option>
                    <option value="social">Night Activity</option>
                    <option value="sport">Sport Activity</option>
                    <option value="workshop">Teaching</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData({...formData, event_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Participants
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.min_participants}
                    onChange={(e) => setFormData({...formData, min_participants: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Participants
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.max_participants}
                    onChange={(e) => setFormData({...formData, max_participants: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Repetition
                  </label>
                  <select
                    value={formData.repetition}
                    onChange={(e) => setFormData({...formData, repetition: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="none">No repetition</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                  
                  {formData.repetition === 'weekly' && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Days of Week
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { value: 0, label: 'Sunday' },
                          { value: 1, label: 'Monday' },
                          { value: 2, label: 'Tuesday' },
                          { value: 3, label: 'Wednesday' },
                          { value: 4, label: 'Thursday' },
                          { value: 5, label: 'Friday' },
                          { value: 6, label: 'Saturday' }
                        ].map((day) => (
                          <button
                            key={day.value}
                            type="button"
                            onClick={() => {
                              if (weeklyDays.includes(day.value)) {
                                setWeeklyDays(weeklyDays.filter(d => d !== day.value))
                              } else {
                                setWeeklyDays([...weeklyDays, day.value])
                              }
                            }}
                            className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                              weeklyDays.includes(day.value)
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
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Staff Assignment
                </label>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Organizer
                    </label>
                    <select
                      value={formData.organizer_id}
                      onChange={(e) => setFormData({...formData, organizer_id: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select organizer...</option>
                      {staff.map(staffMember => (
                        <option key={staffMember.id} value={staffMember.id}>
                          {staffMember.name} ({staffMember.labels.join(', ')})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Additional Staff
                    </label>
                    <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                      {staff.map(staffMember => (
                        <label key={staffMember.id} className="flex items-center space-x-2 py-1">
                          <input
                            type="checkbox"
                            checked={formData.additional_staff?.includes(staffMember.id) || false}
                            onChange={() => toggleStaffAssignment(staffMember.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm">
                            {staffMember.name} ({staffMember.labels.join(', ')})
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={handleSaveAsTemplate}
                className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                title="Save as Template"
              >
                <RectangleStackIcon className="h-4 w-4" />
              </button>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setShowEditModal(false)
                    setShowTemplateModal(false)
                  }}
                  className="p-2 text-gray-600 hover:text-gray-800 rounded-md hover:bg-gray-100"
                  title="Cancel"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={handleSaveEvent}
                  disabled={!formData.title || !formData.event_date || !formData.start_time || !formData.end_time}
                  className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Save Event"
                >
                  <CheckIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Event Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Event Title</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedEvent.title}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(selectedEvent.category)}`}>
                    {getCategoryDisplayName(selectedEvent.category)}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedEvent.location}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedEvent.status)}`}>
                    {selectedEvent.status}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date & Time</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedEvent.start_at).toLocaleString()}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date & Time</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedEvent.end_at).toLocaleString()}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Participants</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedEvent.current_participants || 0} / {selectedEvent.min_participants || 1}-{selectedEvent.max_participants || 'No limit'} people
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Organizer</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedEvent.organizer_id ? getStaffName(selectedEvent.organizer_id) : 'No organizer assigned'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Additional Staff</label>
                  <div className="mt-1">
                    {selectedEvent.additional_staff && selectedEvent.additional_staff.length > 0 ? (
                      selectedEvent.additional_staff.map(staffId => (
                        <span key={staffId} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-2 mb-1">
                          {getStaffName(staffId)}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No additional staff assigned</p>
                    )}
                  </div>
                </div>
              </div>

              {selectedEvent.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedEvent.description}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Templates List Modal */}
      {showTemplatesList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Event Templates</h2>
              <button
                onClick={() => setShowTemplatesList(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {templates.length === 0 ? (
              <div className="text-center py-8">
                <RectangleStackIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No templates available. Create your first template!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <div key={template.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{template.title}</p>
                    <p className="text-xs text-gray-500 mb-3">
                      {template.category} • {template.start_time} - {template.end_time}
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleCreateFromTemplate(template)}
                        className="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        Use Template
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Save Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Save as Template</h2>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  value={templateData.name}
                  onChange={(e) => setTemplateData({...templateData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter template name"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTemplate}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}