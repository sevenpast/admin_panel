'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeftIcon,
  UserIcon,
  PhoneIcon,
  CakeIcon,
  AcademicCapIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  StarIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline'

interface Guest {
  id: string
  guest_id: string
  name: string
  mobile_number?: string
  instagram?: string
  surf_package: boolean
  surf_level?: string
  allergies?: string[]
  other_allergies?: string
  notes?: string
  image_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface Activity {
  id: string
  type: 'meal' | 'lesson' | 'event' | 'registration' | 'check_in' | 'check_out' | 'note'
  title: string
  description: string
  timestamp: string
  status: 'completed' | 'pending' | 'cancelled' | 'no_show'
  details?: any
  location?: string
  instructor?: string
  metadata?: any
}

const mockGuest: Guest = {
  id: 'guest-123',
  guest_id: 'G-DEMO123',
  name: 'Maria Schmidt',
  mobile_number: '+49 123 456 7890',
  instagram: '@maria_surfs',
  surf_package: true,
  surf_level: 'intermediate',
  allergies: ['vegetarian', 'lactose_free'],
  other_allergies: 'Keine Nüsse',
  notes: 'Erste Surfstunden, sehr motiviert!',
  image_url: null,
  is_active: true,
  created_at: '2025-10-10T10:00:00Z',
  updated_at: '2025-10-14T12:00:00Z'
}

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'registration',
    title: 'Camp Registrierung',
    description: 'QR-Code Registrierung abgeschlossen',
    timestamp: '2025-10-10T10:00:00Z',
    status: 'completed',
    metadata: { method: 'qr_code' }
  },
  {
    id: '2',
    type: 'check_in',
    title: 'Check-in',
    description: 'Zimmer 204 zugewiesen',
    timestamp: '2025-10-10T14:30:00Z',
    status: 'completed',
    details: { room_number: '204', bed_type: 'single' }
  },
  {
    id: '3',
    type: 'lesson',
    title: 'Surf Grundlagen',
    description: 'Erste Surfstunde am Strand',
    timestamp: '2025-10-11T09:00:00Z',
    status: 'completed',
    location: 'Hauptstrand',
    instructor: 'Tom Mueller',
    details: { duration: 120, skill_level: 'beginner', progress: 'good' }
  },
  {
    id: '4',
    type: 'meal',
    title: 'Mittagessen',
    description: 'Vegetarische Pasta mit Tomatensauce',
    timestamp: '2025-10-11T12:30:00Z',
    status: 'completed',
    details: { meal_type: 'lunch', dietary_option: 'vegetarian' }
  },
  {
    id: '5',
    type: 'event',
    title: 'Beach Volleyball',
    description: 'Freizeitaktivität am Strand',
    timestamp: '2025-10-11T16:00:00Z',
    status: 'completed',
    location: 'Volleyball Platz',
    details: { participants: 8, duration: 90 }
  },
  {
    id: '6',
    type: 'lesson',
    title: 'Wellenreiten Fortgeschritten',
    description: 'Zweite Surfstunde mit größeren Wellen',
    timestamp: '2025-10-12T08:30:00Z',
    status: 'completed',
    location: 'Surfspot Ost',
    instructor: 'Lisa Weber',
    details: { duration: 150, skill_level: 'intermediate', progress: 'excellent' }
  },
  {
    id: '7',
    type: 'note',
    title: 'Fortschritt Notiz',
    description: 'Großartige Verbesserung beim Gleichgewicht',
    timestamp: '2025-10-12T11:00:00Z',
    status: 'completed',
    metadata: { staff_member: 'Lisa Weber', type: 'progress_note' }
  },
  {
    id: '8',
    type: 'lesson',
    title: 'Surf Training',
    description: 'Geplante Surfstunde heute Nachmittag',
    timestamp: '2025-10-14T15:00:00Z',
    status: 'pending',
    location: 'Hauptstrand',
    instructor: 'Tom Mueller',
    details: { duration: 120, skill_level: 'intermediate' }
  },
  {
    id: '9',
    type: 'meal',
    title: 'Abendessen',
    description: 'Gegrilltes Gemüse mit Reis',
    timestamp: '2025-10-14T18:30:00Z',
    status: 'pending',
    details: { meal_type: 'dinner', dietary_option: 'vegetarian' }
  }
]

export default function GuestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [guest, setGuest] = useState<Guest | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'timeline' | 'meals' | 'lessons' | 'events' | 'notes'>('timeline')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'cancelled' | 'no_show'>('all')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')

  useEffect(() => {
    if (params.id) {
      loadGuestData(params.id as string)
    }
  }, [params.id])

  const loadGuestData = async (guestId: string) => {
    setLoading(true)
    try {
      // Load guest data from guests API
      const guestResponse = await fetch('/api/guests')
      if (guestResponse.ok) {
        const guestsData = await guestResponse.json()
        const foundGuest = guestsData.data?.find((g: any) => g.id === guestId)
        if (foundGuest) {
          setGuest(foundGuest)
        } else {
          // Use mock guest if not found
          setGuest(mockGuest)
        }
      } else {
        setGuest(mockGuest)
      }

      // Load activities for this guest
      const activitiesResponse = await fetch(`/api/guests/${guestId}/activities`)
      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json()
        setActivities(activitiesData.data?.activities || mockActivities)
      } else {
        setActivities(mockActivities)
      }
    } catch (error) {
      console.error('Error loading guest data:', error)
      setGuest(mockGuest)
      setActivities(mockActivities)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'meal':
        return CakeIcon
      case 'lesson':
        return AcademicCapIcon
      case 'event':
        return CalendarIcon
      case 'registration':
        return UserIcon
      case 'check_in':
      case 'check_out':
        return ClockIcon
      case 'note':
        return ChatBubbleLeftIcon
      default:
        return UserIcon
    }
  }

  const getActivityColor = (type: Activity['type'], status: Activity['status']) => {
    if (status === 'cancelled') return 'text-red-500 bg-red-50'
    if (status === 'no_show') return 'text-orange-500 bg-orange-50'
    if (status === 'pending') return 'text-blue-500 bg-blue-50'

    switch (type) {
      case 'meal':
        return 'text-orange-600 bg-orange-50'
      case 'lesson':
        return 'text-green-600 bg-green-50'
      case 'event':
        return 'text-purple-600 bg-purple-50'
      case 'registration':
        return 'text-blue-600 bg-blue-50'
      case 'check_in':
      case 'check_out':
        return 'text-indigo-600 bg-indigo-50'
      case 'note':
        return 'text-gray-600 bg-gray-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: Activity['status']) => {
    switch (status) {
      case 'completed':
        return CheckCircleIcon
      case 'cancelled':
        return XCircleIcon
      case 'no_show':
        return ExclamationTriangleIcon
      default:
        return ClockIcon
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return `Today ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
    } else if (diffDays === 1) {
      return `Yesterday ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const filteredActivities = activities.filter(activity => {
    // Tab filter
    if (activeTab !== 'timeline') {
      const activityType = activeTab.slice(0, -1) // Remove 's' from plural (lessons -> lesson)
      if (activity.type !== activityType) return false
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (!activity.title.toLowerCase().includes(query) &&
          !activity.description.toLowerCase().includes(query) &&
          !(activity.instructor?.toLowerCase().includes(query)) &&
          !(activity.location?.toLowerCase().includes(query))) {
        return false
      }
    }

    // Status filter
    if (statusFilter !== 'all' && activity.status !== statusFilter) {
      return false
    }

    // Date filter
    if (dateFilter !== 'all') {
      const activityDate = new Date(activity.timestamp)
      const now = new Date()
      const diffMs = now.getTime() - activityDate.getTime()
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      if (dateFilter === 'today' && diffDays !== 0) return false
      if (dateFilter === 'week' && diffDays > 7) return false
      if (dateFilter === 'month' && diffDays > 30) return false
    }

    return true
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const stats = {
    totalLessons: activities.filter(a => a.type === 'lesson').length,
    completedLessons: activities.filter(a => a.type === 'lesson' && a.status === 'completed').length,
    totalMeals: activities.filter(a => a.type === 'meal').length,
    totalEvents: activities.filter(a => a.type === 'event').length,
    daysInCamp: guest ? Math.ceil((new Date().getTime() - new Date(guest.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading guest details...</div>
      </div>
    )
  }

  if (!guest) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Guest not found</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Guest Profile</h1>
            <p className="text-gray-600 mt-1">{guest.name} • {guest.guest_id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            guest.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {guest.is_active ? 'Active' : 'Inactive'}
          </span>
          {guest.surf_package && (
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              Surf Package
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Guest Info Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            {/* Profile Image */}
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto flex items-center justify-center mb-4">
                {guest.image_url ? (
                  <img src={guest.image_url} alt={guest.name} className="w-24 h-24 rounded-full object-cover" />
                ) : (
                  <UserIcon className="h-12 w-12 text-gray-400" />
                )}
              </div>
              <h2 className="text-xl font-semibold text-gray-900">{guest.name}</h2>
              <p className="text-gray-600">{guest.guest_id}</p>
            </div>

            {/* Contact Info */}
            <div className="space-y-4 mb-6">
              {guest.mobile_number && (
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-900">{guest.mobile_number}</span>
                </div>
              )}
              {guest.instagram && (
                <div className="flex items-center space-x-3">
                  <span className="text-gray-400">@</span>
                  <span className="text-sm text-gray-900">{guest.instagram}</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="border-t pt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Camp Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Days in Camp</span>
                  <span className="text-sm font-medium text-gray-900">{stats.daysInCamp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Surf Lessons</span>
                  <span className="text-sm font-medium text-gray-900">{stats.completedLessons}/{stats.totalLessons}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Meals</span>
                  <span className="text-sm font-medium text-gray-900">{stats.totalMeals}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Events</span>
                  <span className="text-sm font-medium text-gray-900">{stats.totalEvents}</span>
                </div>
              </div>
            </div>

            {/* Surf Level */}
            {guest.surf_package && guest.surf_level && (
              <div className="border-t pt-6 mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Surf Level</h3>
                <div className="flex items-center space-x-2">
                  <StarIcon className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm text-gray-900 capitalize">{guest.surf_level}</span>
                </div>
              </div>
            )}

            {/* Allergies */}
            {(guest.allergies?.length || guest.other_allergies) && (
              <div className="border-t pt-6 mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Allergies & Diet</h3>
                <div className="space-y-2">
                  {guest.allergies?.map((allergy) => (
                    <span key={allergy} className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full mr-1">
                      {allergy}
                    </span>
                  ))}
                  {guest.other_allergies && (
                    <p className="text-sm text-gray-600 mt-2">{guest.other_allergies}</p>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {guest.notes && (
              <div className="border-t pt-6 mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Notes</h3>
                <p className="text-sm text-gray-600">{guest.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow border border-gray-200">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                {[
                  { id: 'timeline', label: 'Timeline', count: activities.length },
                  { id: 'lessons', label: 'Surf Lessons', count: stats.totalLessons },
                  { id: 'meals', label: 'Meals', count: stats.totalMeals },
                  { id: 'events', label: 'Events', count: stats.totalEvents },
                  { id: 'notes', label: 'Notes', count: activities.filter(a => a.type === 'note').length }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-3 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                    <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-gray-100 text-gray-600">
                      {tab.count}
                    </span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Filters */}
            <div className="border-b border-gray-200 bg-gray-50 p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by title, description, instructor..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Status Filter */}
                <div className="sm:w-40">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no_show">No Show</option>
                  </select>
                </div>

                {/* Date Filter */}
                <div className="sm:w-32">
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="all">All Times</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>

                {/* Clear Filters */}
                {(searchQuery || statusFilter !== 'all' || dateFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setStatusFilter('all')
                      setDateFilter('all')
                    }}
                    className="px-3 py-2 text-sm text-blue-600 hover:text-blue-800 whitespace-nowrap"
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              {/* Results Count */}
              <div className="mt-3 text-sm text-gray-600">
                {filteredActivities.length} of {activities.length} activities
                {activeTab !== 'timeline' && ` (filtered by ${activeTab})`}
              </div>
            </div>

            {/* Activity List */}
            <div className="p-6">
              {filteredActivities.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No activities found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredActivities.map((activity) => {
                    const ActivityIcon = getActivityIcon(activity.type)
                    const StatusIcon = getStatusIcon(activity.status)
                    const colorClasses = getActivityColor(activity.type, activity.status)

                    return (
                      <div key={activity.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className={`p-2 rounded-lg ${colorClasses}`}>
                          <ActivityIcon className="h-5 w-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-900">{activity.title}</h3>
                            <div className="flex items-center space-x-2">
                              <StatusIcon className={`h-4 w-4 ${
                                activity.status === 'completed' ? 'text-green-500' :
                                activity.status === 'cancelled' ? 'text-red-500' :
                                activity.status === 'no_show' ? 'text-orange-500' :
                                'text-blue-500'
                              }`} />
                              <span className="text-xs text-gray-500">{formatTimestamp(activity.timestamp)}</span>
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 mt-1">{activity.description}</p>

                          {(activity.location || activity.instructor) && (
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              {activity.location && (
                                <div className="flex items-center space-x-1">
                                  <MapPinIcon className="h-3 w-3" />
                                  <span>{activity.location}</span>
                                </div>
                              )}
                              {activity.instructor && (
                                <div className="flex items-center space-x-1">
                                  <UserIcon className="h-3 w-3" />
                                  <span>{activity.instructor}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {activity.details && activity.type === 'lesson' && (
                            <div className="mt-2 text-xs text-gray-500">
                              <span>Duration: {activity.details.duration}min</span>
                              {activity.details.progress && (
                                <span className="ml-4">Progress: {activity.details.progress}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}