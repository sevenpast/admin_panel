'use client'

import { useState } from 'react'
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
  UserIcon
} from '@heroicons/react/24/outline'

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

interface Event {
  id: string
  event_id: string
  title: string
  category: 'activity' | 'excursion' | 'social' | 'sport' | 'workshop' | 'meal_event' | 'other'
  location: string
  start_at: string
  end_at: string
  description?: string
  status: 'draft' | 'published' | 'cancelled' | 'completed'
  max_participants?: number
  min_participants?: number
  current_participants: number
  min_age?: number
  max_age?: number
  cost_per_person: number
  included_in_package: boolean
  is_mandatory: boolean
  requirements?: string
  organizer_id?: string
  organizer?: Staff
  additional_staff: string[]
  assigned_staff: Staff[]
  assignments: EventAssignment[]
  alert_time?: string
  alert_text?: string
}

// Mock data based on database demo data
const mockStaff: Staff[] = [
  { id: '1', staff_id: 'S-MAX123MUSTER', name: 'Max Mustermann', labels: ['instructor', 'host'] },
  { id: '2', staff_id: 'S-ANNA456SCHMIDT', name: 'Anna Schmidt', labels: ['kitchen'] },
  { id: '3', staff_id: 'S-TOM789WILSON', name: 'Tom Wilson', labels: ['teacher', 'instructor'] }
]

const mockGuests: Guest[] = [
  { id: '1', guest_id: 'G-JOHN123DOE', name: 'John Doe' },
  { id: '2', guest_id: 'G-MARIA456GARCIA', name: 'Maria Garcia' },
  { id: '3', guest_id: 'G-SARAH789CONNOR', name: 'Sarah Connor' }
]

const mockEvents: Event[] = [
  {
    id: '1',
    event_id: 'E-A1B2C3D4E5',
    title: 'Morning Beach Volleyball',
    category: 'sport',
    location: 'Beach Court',
    start_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T08:00',
    end_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T09:30',
    description: 'Friendly beach volleyball tournament with prizes for winners',
    status: 'published',
    max_participants: 12,
    current_participants: 3,
    cost_per_person: 0,
    included_in_package: true,
    is_mandatory: false,
    requirements: 'Bring water bottle and wear sports shoes',
    organizer_id: '1',
    organizer: mockStaff[0],
    additional_staff: [],
    assigned_staff: [mockStaff[0]],
    assignments: [
      {
        id: '1',
        guest_id: '1',
        guest: mockGuests[0],
        status: 'confirmed',
        special_requests: 'Prefer team captain role',
        payment_required: 0,
        payment_status: 'none'
      }
    ]
  },
  {
    id: '2',
    event_id: 'E-F6G7H8I9J0',
    title: 'Sunrise Yoga Session',
    category: 'activity',
    location: 'Yoga Deck',
    start_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T06:30',
    end_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T07:30',
    description: 'Start your day with peaceful yoga overlooking the ocean',
    status: 'published',
    max_participants: 20,
    current_participants: 2,
    cost_per_person: 0,
    included_in_package: true,
    is_mandatory: false,
    requirements: 'Bring yoga mat if you have one, wear comfortable clothes',
    organizer_id: '1',
    organizer: mockStaff[0],
    additional_staff: [],
    assigned_staff: [mockStaff[0]],
    assignments: [
      {
        id: '2',
        guest_id: '2',
        guest: mockGuests[1],
        status: 'confirmed',
        special_requests: 'Beginner level, need yoga mat',
        payment_required: 0,
        payment_status: 'none'
      }
    ]
  },
  {
    id: '3',
    event_id: 'E-K1L2M3N4O5',
    title: 'Sunset Photography Workshop',
    category: 'workshop',
    location: 'Viewpoint Deck',
    start_at: new Date().toISOString().split('T')[0] + 'T17:30',
    end_at: new Date().toISOString().split('T')[0] + 'T19:00',
    description: 'Learn professional photography techniques during golden hour',
    status: 'draft',
    max_participants: 8,
    current_participants: 1,
    cost_per_person: 25,
    included_in_package: false,
    is_mandatory: false,
    requirements: 'Bring camera or smartphone, basic photography knowledge helpful',
    organizer_id: '1',
    organizer: mockStaff[0],
    additional_staff: [],
    assigned_staff: [mockStaff[0]],
    assignments: [
      {
        id: '3',
        guest_id: '1',
        guest: mockGuests[0],
        status: 'confirmed',
        special_requests: 'Have DSLR camera, intermediate level',
        payment_required: 25,
        payment_status: 'paid'
      }
    ]
  },
  {
    id: '4',
    event_id: 'E-P6Q7R8S9T0',
    title: 'BBQ Night & Live Music',
    category: 'social',
    location: 'Main Terrace',
    start_at: new Date().toISOString().split('T')[0] + 'T19:00',
    end_at: new Date().toISOString().split('T')[0] + 'T23:00',
    description: 'Community BBQ with live acoustic music and campfire stories',
    status: 'published',
    max_participants: 50,
    current_participants: 8,
    cost_per_person: 15,
    included_in_package: false,
    is_mandatory: false,
    requirements: 'Vegetarian and vegan options available',
    organizer_id: '1',
    organizer: mockStaff[0],
    additional_staff: ['2'],
    assigned_staff: [mockStaff[0], mockStaff[1]],
    assignments: [
      {
        id: '4',
        guest_id: '3',
        guest: mockGuests[2],
        status: 'pending',
        special_requests: 'Vegetarian meal please',
        payment_required: 15,
        payment_status: 'pending'
      }
    ]
  },
  {
    id: '5',
    event_id: 'E-U1V2W3X4Y5',
    title: 'Island Boat Tour',
    category: 'excursion',
    location: 'Harbor Dock',
    start_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T09:00',
    end_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T16:00',
    description: 'Full-day boat tour exploring nearby islands with snorkeling stops',
    status: 'published',
    max_participants: 15,
    current_participants: 0,
    cost_per_person: 45,
    included_in_package: false,
    is_mandatory: false,
    requirements: 'Bring sunscreen, hat, swimwear, and snorkeling gear if you have it',
    organizer_id: '1',
    organizer: mockStaff[0],
    additional_staff: [],
    assigned_staff: [mockStaff[0]],
    assignments: []
  },
  {
    id: '6',
    event_id: 'E-Z6A7B8C9D0',
    title: 'Camp Orientation & Safety Briefing',
    category: 'other',
    location: 'Main Hall',
    start_at: new Date().toISOString().split('T')[0] + 'T16:00',
    end_at: new Date().toISOString().split('T')[0] + 'T17:00',
    description: 'Mandatory orientation for all new arrivals covering camp rules, safety procedures, and activity schedules',
    status: 'published',
    max_participants: 100,
    current_participants: 3,
    cost_per_person: 0,
    included_in_package: true,
    is_mandatory: true,
    requirements: 'Attendance required for all guests',
    organizer_id: '1',
    organizer: mockStaff[0],
    additional_staff: [],
    assigned_staff: [mockStaff[0]],
    assignments: [
      {
        id: '5',
        guest_id: '1',
        guest: mockGuests[0],
        status: 'confirmed',
        payment_required: 0,
        payment_status: 'none'
      },
      {
        id: '6',
        guest_id: '2',
        guest: mockGuests[1],
        status: 'confirmed',
        payment_required: 0,
        payment_status: 'none'
      },
      {
        id: '7',
        guest_id: '3',
        guest: mockGuests[2],
        status: 'confirmed',
        payment_required: 0,
        payment_status: 'none'
      }
    ]
  }
]

// Category mappings
const categoryLabels = {
  activity: 'Day Activity',
  sport: 'Sport Activity',
  social: 'Night Activity',
  workshop: 'Teaching',
  excursion: 'Excursion',
  meal_event: 'Meal Event',
  other: 'Other'
}

const categoryColors = {
  activity: 'bg-blue-50 border-blue-200',
  sport: 'bg-green-50 border-green-200',
  social: 'bg-purple-50 border-purple-200',
  workshop: 'bg-yellow-50 border-yellow-200',
  excursion: 'bg-orange-50 border-orange-200',
  meal_event: 'bg-red-50 border-red-200',
  other: 'bg-gray-50 border-gray-200'
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>(mockEvents)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Form state for create/edit
  const [formData, setFormData] = useState<Partial<Event>>({
    title: '',
    category: 'activity',
    location: '',
    start_at: '',
    end_at: '',
    description: '',
    max_participants: undefined,
    min_participants: undefined,
    cost_per_person: 0,
    included_in_package: true,
    is_mandatory: false,
    requirements: '',
    organizer_id: '',
    additional_staff: [],
    alert_time: '',
    alert_text: ''
  })

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

  const handleDuplicate = (event: Event) => {
    const newEvent: Event = {
      ...event,
      id: `${Date.now()}`,
      event_id: `E-${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
      title: `${event.title} (Kopie)`,
      status: 'draft',
      current_participants: 0,
      assignments: []
    }
    setEvents([...events, newEvent])
  }

  const handleDelete = (event: Event) => {
    setEvents(events.filter(e => e.id !== event.id))
    setIsDeleteModalOpen(false)
    setSelectedEvent(null)
  }

  const handleCreate = () => {
    setFormData({
      title: '',
      category: 'activity',
      location: '',
      start_at: '',
      end_at: '',
      description: '',
      max_participants: undefined,
      min_participants: undefined,
      cost_per_person: 0,
      included_in_package: true,
      is_mandatory: false,
      requirements: '',
      organizer_id: '1',
      additional_staff: [],
      alert_time: '',
      alert_text: ''
    })
    setIsCreateModalOpen(true)
  }

  const handleEdit = (event: Event) => {
    setFormData({
      ...event,
      start_at: event.start_at.split('T')[0] + 'T' + event.start_at.split('T')[1].split(':').slice(0, 2).join(':'),
      end_at: event.end_at.split('T')[0] + 'T' + event.end_at.split('T')[1].split(':').slice(0, 2).join(':'),
    })
    setSelectedEvent(event)
    setIsEditModalOpen(true)
  }

  const handleSave = () => {
    if (!formData.title || !formData.location || !formData.start_at || !formData.end_at) {
      alert('Please fill in all required fields')
      return
    }

    const newEvent: Event = {
      id: selectedEvent?.id || `${Date.now()}`,
      event_id: selectedEvent?.event_id || `E-${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
      title: formData.title!,
      category: formData.category!,
      location: formData.location!,
      start_at: formData.start_at!,
      end_at: formData.end_at!,
      description: formData.description || '',
      status: selectedEvent?.status || 'draft',
      max_participants: formData.max_participants || undefined,
      min_participants: formData.min_participants || undefined,
      current_participants: selectedEvent?.current_participants || 0,
      min_age: formData.min_age,
      max_age: formData.max_age,
      cost_per_person: formData.cost_per_person!,
      included_in_package: formData.included_in_package!,
      is_mandatory: formData.is_mandatory!,
      requirements: formData.requirements || '',
      organizer_id: formData.organizer_id || '1',
      organizer: mockStaff.find(s => s.id === (formData.organizer_id || '1')),
      additional_staff: formData.additional_staff!,
      assigned_staff: [
        mockStaff.find(s => s.id === (formData.organizer_id || '1'))!,
        ...mockStaff.filter(s => formData.additional_staff!.includes(s.id))
      ],
      assignments: selectedEvent?.assignments || [],
      alert_time: formData.alert_time || '',
      alert_text: formData.alert_text || ''
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
  }

  const groupedEvents = events.reduce((acc, event) => {
    if (!acc[event.category]) {
      acc[event.category] = []
    }
    acc[event.category].push(event)
    return acc
  }, {} as Record<string, Event[]>)

  const EventCard = ({ event }: { event: Event }) => {
    const startDateTime = formatDateTime(event.start_at)
    const duration = formatDuration(event.start_at, event.end_at)

    return (
      <div className={`bg-white rounded-lg border-2 ${categoryColors[event.category]} p-4 shadow-sm hover:shadow-md transition-shadow`}>
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
            {event.is_mandatory && (
              <span className="ml-2 px-1 py-0.5 bg-red-100 text-red-800 text-xs rounded">
                Mandatory
              </span>
            )}
          </div>
          {event.cost_per_person > 0 && !event.included_in_package && (
            <div className="text-sm font-medium text-gray-900">
              €{event.cost_per_person}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {categoryLabels[event.category]}
          </span>

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
              onClick={() => handleDuplicate(event)}
              className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
              title="Duplicate"
            >
              <DocumentDuplicateIcon className="w-4 h-4" />
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
          <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Create Event
          </button>
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
              <p className="text-gray-600 mb-4">Get started by creating your first event.</p>
              <button
                onClick={handleCreate}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Create Event
              </button>
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
                  <p className="text-sm text-gray-600 mb-1">ID: {selectedEvent.event_id}</p>
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
                  <p className="font-medium text-gray-900">{categoryLabels[selectedEvent.category]}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Date & Time</p>
                  <p className="font-medium text-gray-900">
                    {formatDateTime(selectedEvent.start_at).date}
                  </p>
                  <p className="text-sm text-gray-700">
                    {formatDateTime(selectedEvent.start_at).time} - {formatDateTime(selectedEvent.end_at).time}
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
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Cost</p>
                  <p className="font-medium text-gray-900">
                    {selectedEvent.cost_per_person > 0
                      ? `€${selectedEvent.cost_per_person}`
                      : 'Free'
                    }
                    {selectedEvent.included_in_package && selectedEvent.cost_per_person === 0 && (
                      <span className="text-xs text-green-600 ml-1">(Included)</span>
                    )}
                  </p>
                </div>
              </div>

              {selectedEvent.organizer && (
                <div className="mb-6">
                  <p className="text-sm text-gray-600">Organizer</p>
                  <p className="font-medium text-gray-900">{selectedEvent.organizer.name}</p>
                  {selectedEvent.assigned_staff.length > 1 && (
                    <>
                      <p className="text-sm text-gray-600 mt-2">Additional Staff</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedEvent.assigned_staff.slice(1).map(staff => (
                          <span key={staff.id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            {staff.name}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {selectedEvent.assignments.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Registered Participants</p>
                  <div className="space-y-2">
                    {selectedEvent.assignments.map(assignment => (
                      <div key={assignment.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                        <div>
                          <p className="font-medium text-gray-900">{assignment.guest.name}</p>
                          <p className="text-xs text-gray-600">{assignment.guest.guest_id}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            assignment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            assignment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            assignment.status === 'attended' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {assignment.status}
                          </span>
                          {assignment.payment_required > 0 && (
                            <p className="text-xs text-gray-600 mt-1">
                              €{assignment.payment_required} - {assignment.payment_status}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Event['category'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="activity">Day Activity</option>
                    <option value="social">Night Activity</option>
                    <option value="sport">Sport Activity</option>
                    <option value="workshop">Teaching</option>
                    <option value="excursion">Excursion</option>
                    <option value="meal_event">Meal Event</option>
                    <option value="other">Other</option>
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
                    Organizer
                  </label>
                  <select
                    value={formData.organizer_id}
                    onChange={(e) => setFormData({ ...formData, organizer_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {mockStaff.map(staff => (
                      <option key={staff.id} value={staff.id}>{staff.name}</option>
                    ))}
                  </select>
                </div>

                {/* Date & Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.start_at}
                    onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.end_at}
                    onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
                    Cost per Person (€)
                  </label>
                  <input
                    type="number"
                    value={formData.cost_per_person}
                    onChange={(e) => setFormData({ ...formData, cost_per_person: parseFloat(e.target.value) || 0 })}
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
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Bring water bottle and wear sports shoes"
                />
              </div>

              {/* Additional Staff */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Staff
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {mockStaff.filter(staff => staff.id !== formData.organizer_id).map(staff => (
                    <label key={staff.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.additional_staff?.includes(staff.id) || false}
                        onChange={(e) => {
                          const currentStaff = formData.additional_staff || []
                          if (e.target.checked) {
                            setFormData({ ...formData, additional_staff: [...currentStaff, staff.id] })
                          } else {
                            setFormData({ ...formData, additional_staff: currentStaff.filter(id => id !== staff.id) })
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{staff.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.included_in_package}
                    onChange={(e) => setFormData({ ...formData, included_in_package: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Included in package</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_mandatory}
                    onChange={(e) => setFormData({ ...formData, is_mandatory: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Mandatory event</span>
                </label>
              </div>

              {/* Alert Settings */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alert Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.alert_time}
                    onChange={(e) => setFormData({ ...formData, alert_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alert Message
                  </label>
                  <input
                    type="text"
                    value={formData.alert_text}
                    onChange={(e) => setFormData({ ...formData, alert_text: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Event starts in 30 minutes at Beach Court"
                  />
                </div>
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
    </div>
  )
}