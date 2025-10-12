'use client'

import { useState, useEffect } from 'react'
import { ClockIcon, CheckCircleIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

interface MealCutoff {
  id: string
  name: string
  meal_type: 'breakfast' | 'lunch' | 'dinner'
  meal_date: string
  cutoff_time?: string
  cutoff_enabled: boolean
  reset_time?: string
  reset_enabled: boolean
  is_booking_active: boolean
  cutoff_status?: 'active' | 'cutoff_reached'
  can_book?: boolean
  cutoff_reached?: boolean
}

interface EventCutoff {
  id: string
  title: string
  start_at: string
  end_at: string
  cutoff_time?: string
  cutoff_enabled: boolean
  reset_time?: string
  reset_enabled: boolean
  is_registration_active: boolean
  cutoff_status?: 'active' | 'cutoff_reached'
  can_register?: boolean
  cutoff_reached?: boolean
}

export default function CutoffManagement() {
  const [meals, setMeals] = useState<MealCutoff[]>([])
  const [events, setEvents] = useState<EventCutoff[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  // Load cutoff data
  useEffect(() => {
    const loadCutoffData = async () => {
      setLoading(true)
      try {
        // Load meals with cutoff info
        const mealsResponse = await fetch('/api/meals')
        if (mealsResponse.ok) {
          const mealsData = await mealsResponse.json()
          setMeals((mealsData.data || []).filter((meal: any) => meal.meal_date === selectedDate))
        }

        // Load events with cutoff info
        const eventsResponse = await fetch('/api/events')
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json()
          setEvents((eventsData.data || []).filter((event: any) => 
            event.start_at.startsWith(selectedDate)
          ))
        }
      } catch (error) {
        console.error('Error loading cutoff data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCutoffData()
  }, [selectedDate])

  // Toggle cutoff status for meals
  const toggleMealCutoff = async (mealId: string, isBookingActive: boolean) => {
    try {
      const response = await fetch('/api/meal-cutoffs', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mealId,
          isBookingActive
        })
      })

      if (response.ok) {
        setMeals(meals.map(meal =>
          meal.id === mealId
            ? { ...meal, is_booking_active: isBookingActive }
            : meal
        ))
      } else {
        alert('Fehler beim Aktualisieren des Cutoff-Status')
      }
    } catch (error) {
      console.error('Error updating meal cutoff:', error)
      alert('Fehler beim Aktualisieren des Cutoff-Status')
    }
  }

  // Toggle cutoff status for events
  const toggleEventCutoff = async (eventId: string, isRegistrationActive: boolean) => {
    try {
      const response = await fetch('/api/event-cutoffs', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          eventId,
          isRegistrationActive
        })
      })

      if (response.ok) {
        setEvents(events.map(event =>
          event.id === eventId
            ? { ...event, is_registration_active: isRegistrationActive }
            : event
        ))
      } else {
        alert('Fehler beim Aktualisieren des Cutoff-Status')
      }
    } catch (error) {
      console.error('Error updating event cutoff:', error)
      alert('Fehler beim Aktualisieren des Cutoff-Status')
    }
  }

  // Run cutoff cron job
  const runCutoffCron = async () => {
    try {
      const response = await fetch('/api/cutoff-cron', {
        method: 'GET'
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Cutoff Cron ausgeführt: ${result.message}`)
        // Reload data
        window.location.reload()
      } else {
        alert('Fehler beim Ausführen des Cutoff Cron')
      }
    } catch (error) {
      console.error('Error running cutoff cron:', error)
      alert('Fehler beim Ausführen des Cutoff Cron')
    }
  }

  const getCutoffStatus = (item: MealCutoff | EventCutoff) => {
    if (!item.cutoff_enabled) return 'disabled'
    if (item.cutoff_reached || !item.is_booking_active) return 'cutoff'
    return 'active'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'cutoff': return 'text-red-600 bg-red-100'
      case 'disabled': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIcon className="h-4 w-4" />
      case 'cutoff': return <XCircleIcon className="h-4 w-4" />
      case 'disabled': return <ClockIcon className="h-4 w-4" />
      default: return <ClockIcon className="h-4 w-4" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active'
      case 'cutoff': return 'Cutoff Reached'
      case 'disabled': return 'Disabled'
      default: return 'Unknown'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading cutoff data...</div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cutoff Management</h1>
          <p className="text-gray-600 mt-1">
            Manage booking cutoffs and automatic resets for meals and events
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Date Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Run Cron Button */}
          <button
            onClick={runCutoffCron}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <ArrowPathIcon className="h-5 w-5" />
            <span>Run Cutoff Check</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-6">
        {/* Meals Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Meal Cutoffs</h2>
            <span className="text-sm text-gray-500">
              {meals.length} meals for {selectedDate}
            </span>
          </div>

          {meals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ClockIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No meals scheduled for this date</p>
            </div>
          ) : (
            <div className="space-y-3">
              {meals.map((meal) => {
                const status = getCutoffStatus(meal)
                return (
                  <div
                    key={meal.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium text-gray-900">{meal.name}</h3>
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {meal.meal_type}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full flex items-center space-x-1 ${getStatusColor(status)}`}>
                          {getStatusIcon(status)}
                          <span>{getStatusText(status)}</span>
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 mt-1">
                        {meal.cutoff_enabled ? (
                          <>
                            Cutoff: {meal.cutoff_time} | 
                            Reset: {meal.reset_time} | 
                            Booking: {meal.is_booking_active ? 'Active' : 'Inactive'}
                          </>
                        ) : (
                          'Cutoff disabled'
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {meal.cutoff_enabled && (
                        <button
                          onClick={() => toggleMealCutoff(meal.id, !meal.is_booking_active)}
                          className={`px-3 py-1 text-sm rounded-md transition-colors ${
                            meal.is_booking_active
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {meal.is_booking_active ? 'Disable Booking' : 'Enable Booking'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Events Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Event Cutoffs</h2>
            <span className="text-sm text-gray-500">
              {events.length} events for {selectedDate}
            </span>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ClockIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No events scheduled for this date</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => {
                const status = getCutoffStatus(event)
                return (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium text-gray-900">{event.title}</h3>
                        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                          Event
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full flex items-center space-x-1 ${getStatusColor(status)}`}>
                          {getStatusIcon(status)}
                          <span>{getStatusText(status)}</span>
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 mt-1">
                        {event.start_at} - {event.end_at}
                        {event.cutoff_enabled && (
                          <>
                            {' | '}Cutoff: {event.cutoff_time} | 
                            Reset: {event.reset_time} | 
                            Registration: {event.is_registration_active ? 'Active' : 'Inactive'}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {event.cutoff_enabled && (
                        <button
                          onClick={() => toggleEventCutoff(event.id, !event.is_registration_active)}
                          className={`px-3 py-1 text-sm rounded-md transition-colors ${
                            event.is_registration_active
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {event.is_registration_active ? 'Disable Registration' : 'Enable Registration'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Cutoff Information */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Cutoff System Information</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p><strong>Active:</strong> Guests can book/register</p>
            <p><strong>Cutoff Reached:</strong> Booking/registration is disabled</p>
            <p><strong>Disabled:</strong> Cutoff system is not enabled for this item</p>
            <p><strong>Automatic Reset:</strong> The system automatically resets cutoffs based on configured reset times</p>
          </div>
        </div>
      </div>
    </div>
  )
}
