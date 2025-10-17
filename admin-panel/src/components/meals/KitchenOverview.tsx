'use client'

import { useState, useEffect } from 'react'
import {
  ClockIcon,
  EyeIcon,
  XMarkIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CakeIcon,
  UserGroupIcon,
  MinusIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
// Remove the non-existent import - we'll use the API directly

// Delivery Status Types
interface GuestDeliveryStatus {
  [guestId: string]: boolean
}

interface OptionDeliveryStatus {
  [option: string]: GuestDeliveryStatus
}

interface MealDeliveryStatus {
  [mealId: string]: OptionDeliveryStatus
}

// Enhanced Meal Management Types
interface MealPlan {
  id: string
  parent_id?: string
  recurrence_rule_id?: string
  name: string
  description: string
  category: 'breakfast' | 'lunch' | 'dinner'
  dietary_option: 'meat' | 'animal_product' | 'vegetarian' | 'vegan' | 'other'
  image_path?: string
  start_time: string
  end_time: string
  prepTime: number
  ingredients: string[]
  allergens: string[]
  status: 'draft' | 'published' | 'archived'
  scheduled_date: string
  kitchen_notes?: string
  calories_per_portion?: number
  createdAt: string
}

// Convert database meals to UI format
const convertMealToUI = (meal: any): MealPlan => ({
  id: meal.id,
  parent_id: meal.parent_id,
  recurrence_rule_id: meal.recurrence_rule_id,
  name: meal.name,
  description: meal.description || '',
  category: meal.meal_type,
  dietary_option: meal.dietary_option || 'meat',
  image_path: meal.image_path,
  start_time: meal.start_time || '08:00', // Default time if not provided
  end_time: meal.end_time || '09:00', // Default time if not provided
  prepTime: meal.prep_time_minutes || 0, // Use prep_time_minutes from API
  ingredients: meal.ingredients || [],
  allergens: meal.allergens || [],
  status: meal.status || 'published', // Default status if not provided
  scheduled_date: meal.meal_date,
  kitchen_notes: meal.kitchen_notes,
  calories_per_portion: meal.calories_per_portion,
  createdAt: meal.created_at
})

interface KitchenOverviewProps {
  selectedDate: string
  onDateChange: (date: string) => void
}

export default function KitchenOverviewComponent({ selectedDate, onDateChange }: KitchenOverviewProps) {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [mealCounts, setMealCounts] = useState<Record<string, Record<string, number>>>({})
  const [deliveryStatus, setDeliveryStatus] = useState<MealDeliveryStatus>({})
  const [guests, setGuests] = useState<any[]>([])

  // Load data on component mount
  useEffect(() => {
    loadMeals()
    loadGuests()
    loadDeliveryStatus()
  }, [selectedDate])

  const loadMeals = async () => {
    try {
      setLoading(true)
      // Fetch meals for the selected date - same as Staff Overview
      const response = await fetch(`/api/meals?include_templates=false&meal_date=${selectedDate}`)
      if (response.ok) {
        const result = await response.json()
        const meals = result.success ? result.data : result
        const convertedMeals = meals.map(convertMealToUI)
        setMealPlans(convertedMeals)
        
        // Initialize meal counts from actual_portions - same as Staff Overview
        const initialCounts: Record<string, Record<string, number>> = {}
        
        convertedMeals.forEach(meal => {
          // Get the actual portions from the database meal
          const dbMeal = meals.find(m => m.id === meal.id)
          const actualPortions = dbMeal?.actual_portions || 0
          
          // Distribute actual portions across options (same logic as Staff Overview)
          const baseCount = Math.floor(actualPortions / 5) // Distribute across 5 options
          const remainder = actualPortions % 5
          
          initialCounts[meal.id] = {
            meat: baseCount + (remainder > 0 ? 1 : 0),
            animal_product: baseCount + (remainder > 1 ? 1 : 0),
            vegetarian: baseCount + (remainder > 2 ? 1 : 0),
            vegan: baseCount + (remainder > 3 ? 1 : 0),
            other: baseCount
          }
        })
        
        setMealCounts(initialCounts)
      } else {
        console.error('Error loading meals:', response.statusText)
      }
    } catch (error) {
      console.error('Error loading meals:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadGuests = async () => {
    try {
      const response = await fetch('/api/guests')
      if (response.ok) {
        const result = await response.json()
        const guestsData = result.success ? result.data : result
        setGuests(guestsData || [])
      }
    } catch (error) {
      console.error('Error loading guests:', error)
    }
  }

  const updateMealCount = (mealId: string, option: string, change: number) => {
    const currentCount = mealCounts[mealId]?.[option] || 0
    const newCount = Math.max(0, currentCount + change)
    
    setMealCounts(prev => ({
      ...prev,
      [mealId]: {
        ...prev[mealId],
        [option]: newCount
      }
    }))

    // If staff is adding orders, mark them as staff orders
    if (change > 0) {
      const newDeliveryStatus = { ...deliveryStatus }
      
      // Initialize meal and option if they don't exist
      if (!newDeliveryStatus[mealId]) {
        newDeliveryStatus[mealId] = {}
      }
      if (!newDeliveryStatus[mealId][option]) {
        newDeliveryStatus[mealId][option] = {}
      }

      // Mark new orders as staff orders
      for (let i = currentCount; i < newCount; i++) {
        const staffGuestId = `${mealId}-${option}-staff-${i}`
        newDeliveryStatus[mealId][option][staffGuestId] = false
      }

      setDeliveryStatus(newDeliveryStatus)
      saveDeliveryStatus(newDeliveryStatus)
    }
  }

  // Delivery Status Management
  const loadDeliveryStatus = () => {
    try {
      const saved = localStorage.getItem('meal-delivery-status')
      if (saved) {
        setDeliveryStatus(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Error loading delivery status:', error)
    }
  }

  const saveDeliveryStatus = (status: Record<string, boolean>) => {
    try {
      localStorage.setItem('meal-delivery-status', JSON.stringify(status))
    } catch (error) {
      console.error('Error saving delivery status:', error)
    }
  }

  const toggleDeliveryStatus = (mealId: string, option: string, guestId: string) => {
    const newStatus = {
      ...deliveryStatus,
      [mealId]: {
        ...deliveryStatus[mealId],
        [option]: {
          ...deliveryStatus[mealId]?.[option],
          [guestId]: !(deliveryStatus[mealId]?.[option]?.[guestId] || false)
        }
      }
    }
    setDeliveryStatus(newStatus)
    saveDeliveryStatus(newStatus)
  }

  const isDelivered = (mealId: string, option: string, guestId: string) => {
    return deliveryStatus[mealId]?.[option]?.[guestId] || false
  }

  const isOptionFullyDelivered = (mealId: string, option: string) => {
    const counts = mealCounts[mealId] || {}
    const count = counts[option] || 0
    if (count === 0) return true // No orders for this option
    
    const status = deliveryStatus[mealId]?.[option] || {}
    const deliveredCount = Object.values(status).filter(Boolean).length
    return deliveredCount === count
  }

  const isMealFullyDelivered = (mealId: string) => {
    const counts = mealCounts[mealId] || {}
    
    // Check if all options with orders are fully delivered
    return Object.keys(counts).every(option => {
      return isOptionFullyDelivered(mealId, option)
    })
  }

  const getDeliveryStats = () => {
    const totalOrders = Object.values(mealCounts).reduce((total, counts) => {
      return total + Object.values(counts).reduce((sum, count) => sum + count, 0)
    }, 0)
    
    const deliveredOrders = Object.entries(deliveryStatus).reduce((total, [mealId, mealStatus]) => {
      return total + Object.values(mealStatus).reduce((optionTotal, optionStatus) => {
        return optionTotal + Object.values(optionStatus).filter(Boolean).length
      }, 0)
    }, 0)
    
    return { totalOrders, deliveredOrders }
  }

  const generateGuestOrders = (mealId: string, option: string, count: number) => {
    const status = deliveryStatus[mealId]?.[option] || {}
    const orders = []
    
    // Get all existing guest IDs for this meal/option
    const existingGuestIds = Object.keys(status)
    const staffOrders = existingGuestIds.filter(id => id.includes('staff-'))
    const guestOrders = existingGuestIds.filter(id => !id.includes('staff-'))
    
    // Add existing guest orders with real guest data
    guestOrders.forEach((guestId, index) => {
      // Try to find a real guest for this order
      const guest = guests[index] || guests[0] // Fallback to first guest if available
      orders.push({
        id: guestId,
        name: guest ? `${guest.first_name} ${guest.last_name}` : `Guest ${index + 1}`,
        room: guest?.room_assignment?.room_name || `Room ${index + 1}`,
        option: option,
        isDelivered: status[guestId] || false,
        isStaffOrder: false
      })
    })
    
    // Add existing staff orders
    staffOrders.forEach((staffId, index) => {
      orders.push({
        id: staffId,
        name: '👨‍🍳 Staff',
        room: 'Kitchen',
        option: option,
        isDelivered: status[staffId] || false,
        isStaffOrder: true
      })
    })
    
    // If we have more orders than existing ones, add new ones as guests
    const totalExisting = guestOrders.length + staffOrders.length
    if (count > totalExisting) {
      for (let i = totalExisting; i < count; i++) {
        const guestId = `${mealId}-${option}-${i}`
        const guest = guests[i] || guests[0] // Try to use real guest data
        orders.push({
          id: guestId,
          name: guest ? `${guest.first_name} ${guest.last_name}` : `Guest ${i + 1}`,
          room: guest?.room_assignment?.room_name || `Room ${i + 1}`,
          option: option,
          isDelivered: false,
          isStaffOrder: false
        })
      }
    }
    
    return orders
  }

  // Date navigation functions
  const goToPreviousDay = () => {
    const currentDate = new Date(selectedDate)
    currentDate.setDate(currentDate.getDate() - 1)
    onDateChange(currentDate.toISOString().split('T')[0])
  }

  const goToNextDay = () => {
    const currentDate = new Date(selectedDate)
    currentDate.setDate(currentDate.getDate() + 1)
    onDateChange(currentDate.toISOString().split('T')[0])
  }

  const goToToday = () => {
    onDateChange(new Date().toISOString().split('T')[0])
  }

  return (
    <div className="space-y-6">
      {/* Date Navigation */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-4">
          <button
            onClick={goToPreviousDay}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
            title="Previous Day"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
            <button
              onClick={goToToday}
              className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
            >
              Today
            </button>
          </div>
          
          <button
            onClick={goToNextDay}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
            title="Next Day"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
        
        <div className="text-sm text-gray-600">
          {new Date(selectedDate).toLocaleDateString('de-DE', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Meals Overview */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading meals...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {mealPlans
              .filter(meal => meal.scheduled_date === selectedDate)
              .sort((a, b) => {
                // Sort by meal type first (breakfast, lunch, dinner), then by start time
                const typeOrder = { breakfast: 1, lunch: 2, dinner: 3 }
                const typeDiff = typeOrder[a.category] - typeOrder[b.category]
                if (typeDiff !== 0) return typeDiff
                return a.start_time.localeCompare(b.start_time)
              })
              .map(meal => (
                <div key={meal.id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{meal.name}</h3>
                      <p className="text-gray-600">{meal.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          meal.category === 'breakfast' ? 'bg-yellow-100 text-yellow-800' :
                          meal.category === 'lunch' ? 'bg-orange-100 text-orange-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {meal.category.toUpperCase()}
                        </span>
                        <span className="font-medium text-gray-700">{meal.start_time} - {meal.end_time}</span>
                        {meal.prepTime > 0 && (
                          <>
                            <span>•</span>
                            <span>{meal.prepTime} min prep</span>
                          </>
                        )}
                      </div>
                      {/* Show total orders for this meal */}
                      <div className="mt-2">
                        <span className="text-sm font-medium text-gray-700">
                          Total Orders: {Object.values(mealCounts[meal.id] || {}).reduce((sum, count) => sum + count, 0)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        meal.status === 'published' ? 'bg-green-100 text-green-800' :
                        meal.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {meal.status}
                      </span>
                      {/* Delivery status indicator */}
                      {isMealFullyDelivered(meal.id) && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          All Delivered
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Meal Counts */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {['meat', 'animal_product', 'vegetarian', 'vegan', 'other'].map(option => (
                      <div key={option} className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm font-medium text-gray-700 capitalize mb-2">
                          {option.replace('_', ' ')}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateMealCount(meal.id, option, -1)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            disabled={(mealCounts[meal.id]?.[option] || 0) === 0}
                          >
                            <MinusIcon className="h-4 w-4" />
                          </button>
                          <span className="text-lg font-semibold min-w-[2rem] text-center">
                            {mealCounts[meal.id]?.[option] || 0}
                          </span>
                          <button
                            onClick={() => updateMealCount(meal.id, option, 1)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Delivery Status for this option */}
                        {(mealCounts[meal.id]?.[option] || 0) > 0 && (
                          <div className="mt-2 space-y-1">
                            <div className="text-xs font-medium text-gray-500 mb-1">
                              Orders ({mealCounts[meal.id][option]})
                            </div>
                            {generateGuestOrders(meal.id, option, mealCounts[meal.id][option]).map((order, index) => (
                              <div key={order.id} className={`flex items-center justify-between text-xs p-1 rounded ${
                                order.isDelivered ? 'bg-green-50' : 'bg-gray-50'
                              }`}>
                                <div className="flex flex-col">
                                  <span className={`font-medium ${
                                    order.isStaffOrder ? 'text-blue-600' : 'text-gray-700'
                                  }`}>
                                    {order.isStaffOrder ? 'Staff' : order.name}
                                  </span>
                                  <span className={`text-xs ${
                                    order.isStaffOrder ? 'text-blue-500' : 'text-gray-500'
                                  }`}>
                                    {order.isStaffOrder ? 'Kitchen Staff' : order.room}
                                  </span>
                                </div>
                                <button
                                  onClick={() => toggleDeliveryStatus(meal.id, option, order.id)}
                                  className={`p-1 rounded transition-colors ${
                                    order.isDelivered
                                      ? 'text-green-600 bg-green-100 hover:bg-green-200'
                                      : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                                  }`}
                                  title={order.isDelivered ? 'Mark as not delivered' : 'Mark as delivered'}
                                >
                                  <CheckCircleIcon className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

            {mealPlans.filter(meal => meal.scheduled_date === selectedDate).length === 0 && (
              <div className="text-center py-12">
                <CakeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No meals scheduled</h3>
                <p className="text-gray-500">
                  No meals are scheduled for {new Date(selectedDate).toLocaleDateString()}.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
