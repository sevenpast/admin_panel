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
import { databaseService, Meal } from '@/lib/database-service'

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

interface StaffOverviewProps {
  selectedDate: string
  onDateChange: (date: string) => void
}

export default function StaffOverviewComponent({ selectedDate, onDateChange }: StaffOverviewProps) {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [mealCounts, setMealCounts] = useState<Record<string, Record<string, number>>>({})
  const [deliveryStatus, setDeliveryStatus] = useState<MealDeliveryStatus>({})
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedMeal, setSelectedMeal] = useState<MealPlan | null>(null)
  const [selectedOption, setSelectedOption] = useState<string>('')

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
        const convertedMeals = meals.map(convertMealToUI)
        setMealPlans(convertedMeals)
        
        // Initialize meal counts after meals are loaded
        const filteredMeals = convertedMeals.filter(meal => meal.scheduled_date === selectedDate)
        const initialCounts: Record<string, Record<string, number>> = {}
        
        filteredMeals.forEach(meal => {
          // Get the actual portions from the database meal
          const dbMeal = meals.find(m => m.id === meal.id)
          const actualPortions = dbMeal?.actual_portions || 0
          
          // Distribute actual portions across options (simple distribution for now)
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

  const updateMealCount = async (mealId: string, option: string, change: number) => {
    const currentCount = mealCounts[mealId]?.[option] || 0
    const newCount = Math.max(0, currentCount + change)
    
    // Update local state immediately for UI responsiveness
    setMealCounts(prev => ({
      ...prev,
      [mealId]: {
        ...prev[mealId],
        [option]: newCount
      }
    }))

    // Calculate total actual portions for this meal
    const currentMealCounts = mealCounts[mealId] || {}
    const updatedMealCounts = { ...currentMealCounts, [option]: newCount }
    const totalActualPortions = Object.values(updatedMealCounts).reduce((sum, count) => sum + count, 0)

    // Update database with new actual_portions
    try {
      const response = await fetch('/api/meals', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: mealId,
          actual_portions: totalActualPortions
        })
      })

      if (!response.ok) {
        console.error('Failed to update meal portions in database')
        // Revert local state on error
        setMealCounts(prev => ({
          ...prev,
          [mealId]: {
            ...prev[mealId],
            [option]: currentCount
          }
        }))
        return
      }
    } catch (error) {
      console.error('Error updating meal portions:', error)
      // Revert local state on error
      setMealCounts(prev => ({
        ...prev,
        [mealId]: {
          ...prev[mealId],
          [option]: currentCount
        }
      }))
      return
    }

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

  const getTotalByCategory = (category: string) => {
    const filteredMeals = mealPlans.filter(meal => meal.scheduled_date === selectedDate)
    const categoryMeals = filteredMeals.filter(meal => meal.category === category)
    return categoryMeals.reduce((total, meal) => {
      const counts = mealCounts[meal.id] || {}
      return total + Object.values(counts).reduce((sum, count) => sum + count, 0)
    }, 0)
  }

  const getTotalForMeal = (mealId: string) => {
    const counts = mealCounts[mealId] || {}
    return Object.values(counts).reduce((sum, count) => sum + count, 0)
  }

  const handleViewOption = (meal: MealPlan, option: string) => {
    setSelectedMeal(meal)
    setSelectedOption(option)
    setShowViewModal(true)
  }

  const closeViewModal = () => {
    setShowViewModal(false)
    setSelectedMeal(null)
    setSelectedOption('')
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

  const filteredMeals = mealPlans.filter(meal => meal.scheduled_date === selectedDate)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Staff Overview</h2>
        <p className="text-gray-600">Meal quantity management - adjust portions with +/- controls</p>
      </div>

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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-yellow-500 p-3 rounded-lg">
              <ClockIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Breakfast</h3>
              <p className="text-2xl font-bold text-gray-900">{getTotalByCategory('breakfast')}</p>
              <p className="text-sm text-gray-600">Total Orders</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-orange-500 p-3 rounded-lg">
              <ClockIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Lunch</h3>
              <p className="text-2xl font-bold text-gray-900">{getTotalByCategory('lunch')}</p>
              <p className="text-sm text-gray-600">Total Orders</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-purple-500 p-3 rounded-lg">
              <ClockIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Dinner</h3>
              <p className="text-2xl font-bold text-gray-900">{getTotalByCategory('dinner')}</p>
              <p className="text-sm text-gray-600">Total Orders</p>
            </div>
          </div>
        </div>
      </div>

      {/* Meal Orders */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading meals...</div>
          </div>
        ) : (
          ['breakfast', 'lunch', 'dinner'].map((category) => {
            const categoryMeals = filteredMeals.filter(meal => meal.category === category)
            const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1)
            
            return (
              <div key={category} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{categoryTitle}</h3>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{getTotalByCategory(category)}</p>
                    <p className="text-sm text-gray-600">Total Orders</p>
                  </div>
                </div>
                
                {categoryMeals.length === 0 ? (
                  /* Show empty options for categories without meals - identical layout */
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {[
                      { key: 'meat', label: 'Meat' },
                      { key: 'animal_product', label: 'Animal Products' },
                      { key: 'vegetarian', label: 'Vegetarian' },
                      { key: 'vegan', label: 'Vegan' },
                      { key: 'other', label: 'Others' }
                    ].map((option) => (
                      <div 
                        key={option.key} 
                        className="text-center p-3 border border-gray-200 rounded-lg bg-gray-50"
                      >
                        <p className="text-sm font-medium text-gray-500 mb-2">{option.label}</p>
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            disabled
                            className="w-8 h-8 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center cursor-not-allowed"
                          >
                            <MinusIcon className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-semibold text-gray-400">0</span>
                          <button
                            disabled
                            className="w-8 h-8 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center cursor-not-allowed"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {categoryMeals.map((meal) => (
                      <div key={meal.id} className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">{meal.name}</h4>
                            <p className="text-xs text-gray-500">{meal.start_time} - {meal.end_time}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-gray-900">{getTotalForMeal(meal.id)}</p>
                            <p className="text-sm text-gray-600">Total Orders</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                          {[
                            { key: 'meat', label: 'Meat' },
                            { key: 'animal_product', label: 'Animal Products' },
                            { key: 'vegetarian', label: 'Vegetarian' },
                            { key: 'vegan', label: 'Vegan' },
                            { key: 'other', label: 'Others' }
                          ].map((option) => (
                            <div 
                              key={option.key} 
                              className="text-center cursor-pointer hover:bg-gray-100 rounded-lg p-3 transition-colors border border-gray-200 bg-white"
                              onClick={() => handleViewOption(meal, option.key)}
                            >
                              <p className="text-sm font-medium text-gray-700 mb-2">{option.label}</p>
                              <div className="flex items-center justify-center space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    updateMealCount(meal.id, option.key, -1)
                                  }}
                                  className="w-8 h-8 bg-red-100 text-red-600 rounded-full hover:bg-red-200 flex items-center justify-center"
                                >
                                  <MinusIcon className="h-4 w-4" />
                                </button>
                                <span className="w-8 text-center font-semibold">
                                  {mealCounts[meal.id]?.[option.key] || 0}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    updateMealCount(meal.id, option.key, 1)
                                  }}
                                  className="w-8 h-8 bg-green-100 text-green-600 rounded-full hover:bg-green-200 flex items-center justify-center"
                                >
                                  <PlusIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* View Modal */}
    {showViewModal && selectedMeal && selectedOption && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedMeal.name} - {selectedOption.charAt(0).toUpperCase() + selectedOption.slice(1).replace('_', ' ')} Details
            </h3>
            <button
              onClick={closeViewModal}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            {(() => {
              const count = mealCounts[selectedMeal.id]?.[selectedOption] || 0
              const optionDeliveryStatus = deliveryStatus[selectedMeal.id]?.[selectedOption] || {}
              
              return (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-gray-900">
                      {selectedOption.charAt(0).toUpperCase() + selectedOption.slice(1).replace('_', ' ')}
                    </h4>
                    <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {count} orders
                    </span>
                  </div>
                  
                  {count > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(optionDeliveryStatus).map(([guestId, isDelivered]) => (
                        <div key={guestId} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{guestId}</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            isDelivered
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {isDelivered ? 'Delivered' : 'Pending'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No orders for this option</p>
                  )}
                </div>
              )
            })()}
          </div>
        </div>
      </div>
    )}
    </div>
  )
}
