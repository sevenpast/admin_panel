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
import KitchenOverview from '@/components/KitchenOverview'
import { databaseService, Meal } from '@/lib/database-service'

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
const convertMealToUI = (meal: Meal): MealPlan => ({
  id: meal.id,
  parent_id: meal.parent_id,
  recurrence_rule_id: meal.recurrence_rule_id,
  name: meal.name,
  description: meal.description || '',
  category: meal.meal_type,
  dietary_option: meal.dietary_option,
  image_path: meal.image_path,
  start_time: meal.start_time,
  end_time: meal.end_time,
  prepTime: meal.preparation_time || 0,
  ingredients: meal.ingredients || [],
  allergens: meal.allergens || [],
  status: meal.status,
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

  // Load data on component mount
  useEffect(() => {
    loadMeals()
    loadDeliveryStatus()
  }, [selectedDate])

  const loadMeals = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/meals')
      if (response.ok) {
        const result = await response.json()
        const meals = result.success ? result.data : result
        const convertedMeals = (Array.isArray(meals) ? meals : []).map(convertMealToUI)
        setMealPlans(convertedMeals)
        
        // Initialize meal counts after meals are loaded
        const filteredMeals = convertedMeals.filter(meal => meal.scheduled_date === selectedDate)
        const initialCounts: Record<string, Record<string, number>> = {}
        
        filteredMeals.forEach(meal => {
          initialCounts[meal.id] = {
            meat: 0,
            animal_product: 0,
            vegetarian: 0,
            vegan: 0,
            other: 0
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
    
    // Add existing guest orders
    guestOrders.forEach((guestId, index) => {
      orders.push({
        id: guestId,
        name: `Guest ${index + 1}`,
        room: `Room 10${index + 1}`,
        option: option,
        isDelivered: status[guestId] || false,
        isStaffOrder: false
      })
    })
    
    // Add existing staff orders
    staffOrders.forEach((staffId, index) => {
      orders.push({
        id: staffId,
        name: 'Staff',
        room: 'No Room',
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
        orders.push({
          id: guestId,
          name: `Guest ${i + 1}`,
          room: `Room 10${i + 1}`,
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

      {/* Kitchen Overview Component */}
      <KitchenOverview 
        mealOrders={mealPlans.filter(meal => meal.scheduled_date === selectedDate)} 
        mealCounts={mealCounts} 
        selectedDate={selectedDate} 
        deliveryStatus={deliveryStatus} 
        onToggleDelivery={toggleDeliveryStatus} 
        isMealFullyDelivered={isMealFullyDelivered} 
        isDelivered={isDelivered} 
        getDeliveryStats={getDeliveryStats} 
        generateGuestOrders={generateGuestOrders} 
      />
    </div>
  )
}
