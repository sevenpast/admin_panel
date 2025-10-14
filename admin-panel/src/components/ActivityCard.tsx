'use client'

import {
  CakeIcon,
  AcademicCapIcon,
  CalendarIcon,
  UserIcon,
  ClockIcon,
  ChatBubbleLeftIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  StarIcon,
  HeartIcon,
  TrophyIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

export interface Activity {
  id: string
  guest_id: string
  type: 'meal' | 'lesson' | 'event' | 'registration' | 'check_in' | 'check_out' | 'note'
  title: string
  description: string
  timestamp: string
  status: 'completed' | 'pending' | 'cancelled' | 'no_show'
  details?: any
  location?: string
  instructor?: string
  metadata?: any
  created_at?: string
  updated_at?: string
}

interface ActivityCardProps {
  activity: Activity
  compact?: boolean
  showGuestInfo?: boolean
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
      return DocumentTextIcon
  }
}

const getActivityColor = (type: Activity['type'], status: Activity['status']) => {
  if (status === 'cancelled') return 'text-red-500 bg-red-50 border-red-200'
  if (status === 'no_show') return 'text-orange-500 bg-orange-50 border-orange-200'
  if (status === 'pending') return 'text-blue-500 bg-blue-50 border-blue-200'

  switch (type) {
    case 'meal':
      return 'text-orange-600 bg-orange-50 border-orange-200'
    case 'lesson':
      return 'text-green-600 bg-green-50 border-green-200'
    case 'event':
      return 'text-purple-600 bg-purple-50 border-purple-200'
    case 'registration':
      return 'text-blue-600 bg-blue-50 border-blue-200'
    case 'check_in':
    case 'check_out':
      return 'text-indigo-600 bg-indigo-50 border-indigo-200'
    case 'note':
      return 'text-gray-600 bg-gray-50 border-gray-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
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

const getStatusColor = (status: Activity['status']) => {
  switch (status) {
    case 'completed':
      return 'text-green-500'
    case 'cancelled':
      return 'text-red-500'
    case 'no_show':
      return 'text-orange-500'
    case 'pending':
      return 'text-blue-500'
    default:
      return 'text-gray-500'
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

const getTypeLabel = (type: Activity['type']) => {
  switch (type) {
    case 'meal':
      return 'Meal'
    case 'lesson':
      return 'Surf Lesson'
    case 'event':
      return 'Event'
    case 'registration':
      return 'Registration'
    case 'check_in':
      return 'Check-in'
    case 'check_out':
      return 'Check-out'
    case 'note':
      return 'Note'
    default:
      return 'Activity'
  }
}

const renderLessonDetails = (details: any) => {
  if (!details) return null

  return (
    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
      <div className="grid grid-cols-2 gap-3 text-sm">
        {details.duration && (
          <div>
            <span className="font-medium text-gray-700">Duration:</span>
            <span className="ml-1 text-gray-600">{details.duration} min</span>
          </div>
        )}
        {details.skill_level && (
          <div>
            <span className="font-medium text-gray-700">Level:</span>
            <span className="ml-1 text-gray-600 capitalize">{details.skill_level}</span>
          </div>
        )}
        {details.progress && (
          <div className="flex items-center">
            <span className="font-medium text-gray-700">Progress:</span>
            <span className={`ml-1 px-2 py-1 text-xs rounded-full ${
              details.progress === 'excellent' ? 'bg-green-100 text-green-800' :
              details.progress === 'good' ? 'bg-blue-100 text-blue-800' :
              details.progress === 'fair' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {details.progress}
            </span>
          </div>
        )}
        {details.wave_conditions && (
          <div>
            <span className="font-medium text-gray-700">Conditions:</span>
            <span className="ml-1 text-gray-600">{details.wave_conditions}</span>
          </div>
        )}
      </div>
      {details.techniques_learned && details.techniques_learned.length > 0 && (
        <div className="mt-2">
          <span className="font-medium text-gray-700 text-sm">Techniques:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {details.techniques_learned.map((technique: string, index: number) => (
              <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                {technique.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const renderMealDetails = (details: any) => {
  if (!details) return null

  return (
    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
      <div className="grid grid-cols-2 gap-3 text-sm">
        {details.meal_type && (
          <div>
            <span className="font-medium text-gray-700">Type:</span>
            <span className="ml-1 text-gray-600 capitalize">{details.meal_type}</span>
          </div>
        )}
        {details.dietary_option && (
          <div>
            <span className="font-medium text-gray-700">Diet:</span>
            <span className="ml-1 text-gray-600 capitalize">{details.dietary_option}</span>
          </div>
        )}
        {details.calories && (
          <div>
            <span className="font-medium text-gray-700">Calories:</span>
            <span className="ml-1 text-gray-600">{details.calories} kcal</span>
          </div>
        )}
      </div>
      {details.ingredients && details.ingredients.length > 0 && (
        <div className="mt-2">
          <span className="font-medium text-gray-700 text-sm">Ingredients:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {details.ingredients.map((ingredient: string, index: number) => (
              <span key={index} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                {ingredient.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const renderEventDetails = (details: any) => {
  if (!details) return null

  return (
    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
      <div className="grid grid-cols-2 gap-3 text-sm">
        {details.duration && (
          <div>
            <span className="font-medium text-gray-700">Duration:</span>
            <span className="ml-1 text-gray-600">{details.duration} min</span>
          </div>
        )}
        {details.participants && (
          <div>
            <span className="font-medium text-gray-700">Participants:</span>
            <span className="ml-1 text-gray-600">{details.participants}</span>
          </div>
        )}
        {details.max_participants && (
          <div>
            <span className="font-medium text-gray-700">Max. Participants:</span>
            <span className="ml-1 text-gray-600">{details.max_participants}</span>
          </div>
        )}
        {details.score && (
          <div>
            <span className="font-medium text-gray-700">Result:</span>
            <span className="ml-1 text-gray-600">{details.score}</span>
          </div>
        )}
      </div>
      {details.teams && details.teams.length > 0 && (
        <div className="mt-2">
          <span className="font-medium text-gray-700 text-sm">Teams:</span>
          <div className="flex gap-2 mt-1">
            {details.teams.map((team: string, index: number) => (
              <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                {team}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const renderNoteDetails = (activity: Activity) => {
  const { metadata } = activity

  if (!metadata) return null

  return (
    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
      <div className="grid grid-cols-2 gap-3 text-sm">
        {metadata.staff_member && (
          <div>
            <span className="font-medium text-gray-700">Created by:</span>
            <span className="ml-1 text-gray-600">{metadata.staff_member}</span>
          </div>
        )}
        {metadata.rating && (
          <div className="flex items-center">
            <span className="font-medium text-gray-700">Rating:</span>
            <div className="flex items-center ml-1">
              <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="ml-1 text-gray-600">{metadata.rating}/5</span>
            </div>
          </div>
        )}
      </div>
      {metadata.next_goals && metadata.next_goals.length > 0 && (
        <div className="mt-2">
          <span className="font-medium text-gray-700 text-sm">Next Goals:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {metadata.next_goals.map((goal: string, index: number) => (
              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {goal.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ActivityCard({ activity, compact = false, showGuestInfo = false }: ActivityCardProps) {
  const ActivityIcon = getActivityIcon(activity.type)
  const StatusIcon = getStatusIcon(activity.status)
  const colorClasses = getActivityColor(activity.type, activity.status)
  const statusColor = getStatusColor(activity.status)

  if (compact) {
    return (
      <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 transition-colors">
        <div className={`p-2 rounded-lg ${colorClasses}`}>
          <ActivityIcon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900 truncate">{activity.title}</h3>
            <span className="text-xs text-gray-500">{formatTimestamp(activity.timestamp)}</span>
          </div>
          <p className="text-xs text-gray-600 truncate">{activity.description}</p>
        </div>
        <StatusIcon className={`h-4 w-4 ${statusColor}`} />
      </div>
    )
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-lg ${colorClasses}`}>
          <ActivityIcon className="h-6 w-6" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-semibold text-gray-900">{activity.title}</h3>
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                {getTypeLabel(activity.type)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <StatusIcon className={`h-5 w-5 ${statusColor}`} />
              <span className="text-sm text-gray-500">{formatTimestamp(activity.timestamp)}</span>
            </div>
          </div>

          <p className="text-sm text-gray-600 mt-2">{activity.description}</p>

          {(activity.location || activity.instructor) && (
            <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
              {activity.location && (
                <div className="flex items-center space-x-1">
                  <MapPinIcon className="h-4 w-4" />
                  <span>{activity.location}</span>
                </div>
              )}
              {activity.instructor && (
                <div className="flex items-center space-x-1">
                  <UserIcon className="h-4 w-4" />
                  <span>{activity.instructor}</span>
                </div>
              )}
            </div>
          )}

          {/* Type-specific details */}
          {activity.type === 'lesson' && renderLessonDetails(activity.details)}
          {activity.type === 'meal' && renderMealDetails(activity.details)}
          {activity.type === 'event' && renderEventDetails(activity.details)}
          {activity.type === 'note' && renderNoteDetails(activity)}
        </div>
      </div>
    </div>
  )
}