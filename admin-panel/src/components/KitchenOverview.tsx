'use client'

import { useState, useEffect } from 'react'
import {
  ClockIcon,
  EyeIcon,
  DocumentTextIcon,
  XMarkIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline'

interface MealOrder {
  id: string
  name: string
  category: 'breakfast' | 'lunch' | 'dinner'
  currentCount: number
  estimatedCount: number
  specialRequests: string[]
  guests: string[]
  options: {
    meat: { count: number; guests: string[] }
    animal_product: { count: number; guests: string[] }
    vegetarian: { count: number; guests: string[] }
    vegan: { count: number; guests: string[] }
    other: { count: number; guests: string[] }
  }
  deliveryStatus: {
    [option: string]: {
      [guestId: string]: boolean
    }
  }
}

interface KitchenOverviewProps {
  selectedDate: string
  onDateChange: (date: string) => void
}

export default function KitchenOverview({ selectedDate, onDateChange }: KitchenOverviewProps) {
  const [mealOrders, setMealOrders] = useState<MealOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedMeal, setSelectedMeal] = useState<MealOrder | null>(null)
  const [selectedOption, setSelectedOption] = useState<string>('')

  // Load data on component mount
  useEffect(() => {
    loadMeals()
  }, [selectedDate])

  const loadMeals = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/meals')
      if (response.ok) {
        const meals = await response.json()
        
        // Convert database meals to MealOrder format with options and delivery status
        const convertedMeals: MealOrder[] = (Array.isArray(meals) ? meals : [])
          .filter(meal => meal.meal_date === selectedDate && meal.is_active)
          .map(meal => {
            // Load delivery status from localStorage (same as StaffOverview)
            const savedDeliveryStatus = localStorage.getItem('meal-delivery-status')
            const deliveryStatus = savedDeliveryStatus ? JSON.parse(savedDeliveryStatus) : {}
            
            // Load delivery status and determine staff vs guest orders
            const actualPortions = meal.actual_portions || 0
            const mealDeliveryStatus = deliveryStatus[meal.id] || {}
            
            // Count staff orders vs guest orders for each option
            const options = {
              meat: { count: 0, guests: [] as string[] },
              animal_product: { count: 0, guests: [] as string[] },
              vegetarian: { count: 0, guests: [] as string[] },
              vegan: { count: 0, guests: [] as string[] },
              other: { count: 0, guests: [] as string[] }
            }
            
            // Process delivery status to separate staff and guest orders
            Object.entries(mealDeliveryStatus).forEach(([option, optionStatus]) => {
              if (optionStatus && typeof optionStatus === 'object') {
                Object.entries(optionStatus).forEach(([guestId, isDelivered]) => {
                  if (guestId.includes('staff')) {
                    // Staff order - add "staff" to guests array
                    if (!options[option as keyof typeof options].guests.includes('staff')) {
                      options[option as keyof typeof options].guests.push('staff')
                      options[option as keyof typeof options].count++
                    }
                  } else if (!guestId.includes('Guest-') && !guestId.includes('mock')) {
                    // Only add real guest orders (not mock data)
                    options[option as keyof typeof options].guests.push(guestId)
                    options[option as keyof typeof options].count++
                  }
                })
              }
            })
            
            return {
              id: meal.id,
              name: meal.name || 'Unnamed Meal',
              category: meal.meal_type as 'breakfast' | 'lunch' | 'dinner',
              currentCount: actualPortions,
              estimatedCount: meal.planned_portions || 0,
              specialRequests: meal.dietary_restrictions || [],
              guests: [], // TODO: Load actual guest assignments
              options,
              deliveryStatus: mealDeliveryStatus
            }
          })
        
        setMealOrders(convertedMeals)
      } else {
        console.error('Failed to fetch meals')
        setMealOrders([])
      }
    } catch (error) {
      console.error('Error loading meals:', error)
      setMealOrders([])
    } finally {
      setLoading(false)
    }
  }

  const handleViewOption = (meal: MealOrder, option: string) => {
    setSelectedMeal(meal)
    setSelectedOption(option)
    setShowViewModal(true)
  }

  const closeViewModal = () => {
    setShowViewModal(false)
    setSelectedMeal(null)
    setSelectedOption('')
  }

  const toggleDeliveryStatus = (mealId: string, option: string, guestId: string) => {
    const savedDeliveryStatus = localStorage.getItem('meal-delivery-status')
    const deliveryStatus = savedDeliveryStatus ? JSON.parse(savedDeliveryStatus) : {}
    
    if (!deliveryStatus[mealId]) {
      deliveryStatus[mealId] = {}
    }
    if (!deliveryStatus[mealId][option]) {
      deliveryStatus[mealId][option] = {}
    }
    
    // Toggle the delivery status
    const currentStatus = deliveryStatus[mealId][option][guestId] || false
    deliveryStatus[mealId][option][guestId] = !currentStatus
    
    // Save to localStorage
    localStorage.setItem('meal-delivery-status', JSON.stringify(deliveryStatus))
    
    // Update local state immediately
    setMealOrders(prev => prev.map(meal => 
      meal.id === mealId 
        ? {
            ...meal,
            deliveryStatus: {
              ...meal.deliveryStatus,
              [option]: {
                ...meal.deliveryStatus[option],
                [guestId]: !currentStatus
              }
            }
          }
        : meal
    ))
    
    // Also update the selected meal in the modal if it's the same meal
    if (selectedMeal && selectedMeal.id === mealId) {
      setSelectedMeal(prev => prev ? {
        ...prev,
        deliveryStatus: {
          ...prev.deliveryStatus,
          [option]: {
            ...prev.deliveryStatus[option],
            [guestId]: !currentStatus
          }
        }
      } : null)
    }
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

  const getTotalByCategory = (category: string) => {
    return mealOrders
      .filter(meal => meal.category === category)
      .reduce((total, meal) => {
        if (!meal || !meal.options) return total
        return total + Object.values(meal.options).reduce((optionTotal, option) => optionTotal + (option.count || 0), 0)
      }, 0)
  }

  const getDeliveredCount = (meal: MealOrder) => {
    if (!meal.deliveryStatus) return 0
    return Object.values(meal.deliveryStatus).reduce((total, optionStatus) => {
      return total + Object.values(optionStatus).filter(delivered => delivered).length
    }, 0)
  }

  // Add loading state display
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Kitchen Overview</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading meals...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Kitchen Overview</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={goToPreviousDay}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <CalendarDaysIcon className="h-5 w-5" />
          </button>
          <span className="text-sm font-medium text-gray-700">
            {new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
          <button
            onClick={goToNextDay}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <CalendarDaysIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Breakfast</p>
              <p className="text-2xl font-bold text-gray-900">{getTotalByCategory('breakfast')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Lunch</p>
              <p className="text-2xl font-bold text-gray-900">{getTotalByCategory('lunch')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Dinner</p>
              <p className="text-2xl font-bold text-gray-900">{getTotalByCategory('dinner')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Meal Orders */}
      <div className="space-y-6">
        {mealOrders.length === 0 ? (
          <div className="text-center py-12">
            <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No meals scheduled</h3>
            <p className="text-gray-600">No meals are scheduled for {new Date(selectedDate).toLocaleDateString()}</p>
          </div>
        ) : (
          mealOrders.map((meal) => (
            <div key={meal.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{meal.name}</h3>
                  <p className="text-sm text-gray-600 capitalize">{meal.category}</p>
                  <p className="text-xs text-gray-500">12:00 (Standard Time)</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{meal.currentCount}</p>
                  <p className="text-sm text-gray-600">Total Orders</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[
                  { key: 'meat', label: 'Meat' },
                  { key: 'animal_product', label: 'Animal Products' },
                  { key: 'vegetarian', label: 'Vegetarian' },
                  { key: 'vegan', label: 'Vegan' },
                  { key: 'other', label: 'Others' }
                ].map((option) => (
                  <div key={option.key} className="text-center border border-gray-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">{option.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mb-2">
                      {meal.options[option.key as keyof typeof meal.options]?.count || 0}
                    </p>
                    <button
                      onClick={() => handleViewOption(meal, option.key)}
                      className="w-full flex items-center justify-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      <EyeIcon className="h-4 w-4" />
                      <span>View</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* View Modal */}
      {showViewModal && selectedMeal && selectedOption && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedMeal.name} - {selectedOption.charAt(0).toUpperCase() + selectedOption.slice(1).replace('_', ' ')} Orders
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
                const optionData = selectedMeal.options[selectedOption as keyof typeof selectedMeal.options]
                const count = optionData?.count || 0
                const guests = optionData?.guests || []
                const optionDeliveryStatus = selectedMeal.deliveryStatus[selectedOption] || {}
                
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
                            {/* Header */}
                            <div className="grid grid-cols-3 gap-4 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200 pb-2">
                              <div>Option</div>
                              <div>Meal</div>
                              <div>Status</div>
                            </div>
                            
                            {guests.map((guestId) => {
                              // For staff orders, we need to find the actual staff guest ID in delivery status
                              let actualGuestId = guestId
                              let isDelivered = false
                              
                              if (guestId === 'staff') {
                                // Find the first staff guest ID for this option
                                const staffGuestId = Object.keys(optionDeliveryStatus).find(id => id.includes('staff'))
                                if (staffGuestId) {
                                  actualGuestId = staffGuestId
                                  isDelivered = optionDeliveryStatus[staffGuestId] || false
                                }
                              } else {
                                isDelivered = optionDeliveryStatus[guestId] || false
                              }
                              
                              return (
                                <div key={guestId} className="grid grid-cols-3 gap-4 text-sm border-b border-gray-100 pb-2 items-center">
                                  <div className="text-gray-600 font-medium">
                                    {selectedOption.charAt(0).toUpperCase() + selectedOption.slice(1).replace('_', ' ')}
                                  </div>
                                  <div className="text-gray-800">
                                    {selectedMeal.name}
                                  </div>
                                  <div className="flex justify-end">
                                    <button
                                      onClick={() => toggleDeliveryStatus(selectedMeal.id, selectedOption, actualGuestId)}
                                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                        isDelivered
                                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                                      }`}
                                    >
                                      {isDelivered ? 'Delivered' : 'Pending'}
                                    </button>
                                  </div>
                                </div>
                              )
                            })}
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