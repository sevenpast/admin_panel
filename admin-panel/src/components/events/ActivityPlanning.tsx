'use client'

import { useState, useEffect } from 'react'
import { useToastContext } from '@/components/common/ToastProvider'
import {
  CalendarIcon,
  ClockIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  MapPinIcon,
  UsersIcon
} from '@heroicons/react/24/outline'

interface Activity {
  id: string
  title: string
  description?: string
  type: 'Event' | 'Lesson' | 'Meal' | 'Free Time'
  date: string
  start_time: string
  end_time: string
  location: string
  capacity: number
  assigned_staff: string[]
  notes?: string
  is_recurring: boolean
  recurrence_pattern?: string
}

interface DailySchedule {
  date: string
  activities: Activity[]
}

export default function ActivityPlanning() {
  const { success, error } = useToastContext()
  const [schedules, setschedules] = useState<DailySchedule[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Event' as 'Event' | 'Lesson' | 'Meal' | 'Free Time',
    date: selectedDate,
    start_time: '09:00',
    end_time: '10:00',
    location: '',
    capacity: 20,
    assigned_staff: [] as string[],
    notes: '',
    is_recurring: false,
    recurrence_pattern: 'daily'
  })

  useEffect(() => {
    loadSchedules()
  }, [selectedDate])

  const loadSchedules = async () => {
    setLoading(true)
    try {
      // Simulate API call - replace with actual API endpoint
      const mockSchedules: DailySchedule[] = [
        {
          date: selectedDate,
          activities: [
            {
              id: '1',
              title: 'Morning Yoga',
              description: 'Start the day with relaxing yoga session',
              type: 'Event',
              date: selectedDate,
              start_time: '07:00',
              end_time: '08:00',
              location: 'Beach Platform',
              capacity: 15,
              assigned_staff: ['Instructor Anna'],
              is_recurring: true,
              recurrence_pattern: 'daily'
            },
            {
              id: '2',
              title: 'Breakfast',
              type: 'Meal',
              date: selectedDate,
              start_time: '08:00',
              end_time: '09:30',
              location: 'Restaurant',
              capacity: 50,
              assigned_staff: ['Chef Mario', 'Kitchen Staff'],
              is_recurring: true,
              recurrence_pattern: 'daily'
            },
            {
              id: '3',
              title: 'Beginner Surf Lesson',
              description: 'Learn the basics of surfing',
              type: 'Lesson',
              date: selectedDate,
              start_time: '09:30',
              end_time: '11:30',
              location: 'Main Beach',
              capacity: 8,
              assigned_staff: ['Surf Instructor Tom'],
              is_recurring: false
            }
          ]
        }
      ]
      setSchedules(mockSchedules)
    } catch (err) {
      console.error('Error:', err)
      setSchedules([])
    } finally {
      setLoading(false)
    }
  }

  const getCurrentSchedule = (): DailySchedule => {
    return schedules.find(s => s.date === selectedDate) || { date: selectedDate, activities: [] }
  }

  const handleCreateActivity = () => {
    setFormData({
      title: '',
      description: '',
      type: 'Event',
      date: selectedDate,
      start_time: '09:00',
      end_time: '10:00',
      location: '',
      capacity: 20,
      assigned_staff: [],
      notes: '',
      is_recurring: false,
      recurrence_pattern: 'daily'
    })
    setShowCreateModal(true)
  }

  const handleEditActivity = (activity: Activity) => {
    setSelectedActivity(activity)
    setFormData({
      title: activity.title,
      description: activity.description || '',
      type: activity.type,
      date: activity.date,
      start_time: activity.start_time,
      end_time: activity.end_time,
      location: activity.location,
      capacity: activity.capacity,
      assigned_staff: activity.assigned_staff,
      notes: activity.notes || '',
      is_recurring: activity.is_recurring,
      recurrence_pattern: activity.recurrence_pattern || 'daily'
    })
    setShowEditModal(true)
  }

  const handleSaveActivity = async () => {
    try {
      const activityData: Activity = {
        id: selectedActivity?.id || Date.now().toString(),
        ...formData
      }

      const currentSchedule = getCurrentSchedule()
      let updatedActivities = currentSchedule.activities

      if (showEditModal && selectedActivity) {
        updatedActivities = updatedActivities.map(a =>
          a.id === selectedActivity.id ? activityData : a
        )
      } else {
        updatedActivities = [...updatedActivities, activityData]
      }

      const updatedSchedule: DailySchedule = {
        date: selectedDate,
        activities: updatedActivities.sort((a, b) => a.start_time.localeCompare(b.start_time))
      }

      setSchedules(schedules.map(s =>
        s.date === selectedDate ? updatedSchedule : s
      ).concat(schedules.find(s => s.date === selectedDate) ? [] : [updatedSchedule]))

      setShowCreateModal(false)
      setShowEditModal(false)
      error(`Activity ${showEditModal ? 'updated' : 'created'} successfully`)
    } catch (err) {
      console.error('Error:', err)
      error('Error saving activity')
    }
  }

  const handleDeleteActivity = async (activity: Activity) => {
    if (confirm(`Are you sure you want to delete "${activity.title}"?`)) {
      try {
        const currentSchedule = getCurrentSchedule()
        const updatedActivities = currentSchedule.activities.filter(a => a.id !== activity.id)

        const updatedSchedule: DailySchedule = {
          date: selectedDate,
          activities: updatedActivities
        }

        setSchedules(schedules.map(s =>
          s.date === selectedDate ? updatedSchedule : s
        ))

        success('Activity deleted successfully')
      } catch (err) {
        console.error('Error:', err)
        error('Error deleting activity')
      }
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Event': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'Lesson': return 'bg-green-100 text-green-800 border-green-200'
      case 'Meal': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'Free Time': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const getTimeSlots = () => {
    const slots = []
    for (let hour = 6; hour <= 23; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
      if (hour < 23) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`)
      }
    }
    return slots
  }

  const getNextWeek = () => {
    const dates = []
    const startDate = new Date(selectedDate)
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      dates.push(date.toISOString().split('T')[0])
    }
    return dates
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading activity schedule...</div>
      </div>
    )
  }

  const currentSchedule = getCurrentSchedule()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activity Planning</h1>
          <p className="text-gray-600 mt-1">Plan and schedule daily camp activities</p>
        </div>
        <button
          onClick={handleCreateActivity}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Activity</span>
        </button>
      </div>

      {/* Date Selection */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Select Date</h2>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Week View */}
        <div className="grid grid-cols-7 gap-2">
          {getNextWeek().map((date) => {
            const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' })
            const dayNumber = new Date(date).getDate()
            const isSelected = date === selectedDate
            const isToday = date === new Date().toISOString().split('T')[0]

            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`p-3 text-center rounded-lg border transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600'
                    : isToday
                    ? 'bg-blue-50 text-blue-600 border-blue-200'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="text-xs font-medium">{dayName}</div>
                <div className="text-lg font-bold">{dayNumber}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Daily Schedule */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2" />
            Schedule for {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h2>
        </div>

        <div className="p-6">
          {currentSchedule.activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No activities scheduled for this date</p>
              <button
                onClick={handleCreateActivity}
                className="mt-2 text-blue-600 hover:text-blue-800"
              >
                Add the first activity
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {currentSchedule.activities.map((activity) => (
                <div
                  key={activity.id}
                  className={`border rounded-lg p-4 ${getTypeColor(activity.type)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(activity.type)}`}>
                          {activity.type}
                        </span>
                        {activity.is_recurring && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            Recurring
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {activity.start_time} - {activity.end_time}
                        </div>
                        <div className="flex items-center">
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          {activity.location}
                        </div>
                        <div className="flex items-center">
                          <UsersIcon className="h-4 w-4 mr-1" />
                          {activity.capacity} capacity
                        </div>
                      </div>

                      {activity.description && (
                        <p className="text-sm text-gray-600 mt-2">{activity.description}</p>
                      )}

                      {activity.assigned_staff.length > 0 && (
                        <div className="mt-2">
                          <span className="text-xs font-medium text-gray-700">Staff: </span>
                          <span className="text-xs text-gray-600">
                            {activity.assigned_staff.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEditActivity(activity)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteActivity(activity)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {showCreateModal ? 'Add Activity' : 'Edit Activity'}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Activity Title *
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
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Event">Event</option>
                    <option value="Lesson">Lesson</option>
                    <option value="Meal">Meal</option>
                    <option value="Free Time">Free Time</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
                    Start Time
                  </label>
                  <select
                    value={formData.start_time}
                    onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {getTimeSlots().map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <select
                    value={formData.end_time}
                    onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {getTimeSlots().map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="flex items-center mt-6">
                    <input
                      type="checkbox"
                      checked={formData.is_recurring}
                      onChange={(e) => setFormData({...formData, is_recurring: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm">Recurring Activity</span>
                  </label>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setShowEditModal(false)
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveActivity}
                disabled={!formData.title}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Activity
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}