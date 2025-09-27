'use client'

import { useState } from 'react'
import {
  ClockIcon,
  EyeIcon,
  DocumentTextIcon,
  XMarkIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline'
import { mockMealOrders } from '@/lib/dashboard-data'

interface MealOrder {
  id: string
  name: string
  category: 'breakfast' | 'lunch' | 'dinner'
  currentCount: number
  estimatedCount: number
  specialRequests: string[]
  guests: string[]
}

interface KitchenOverviewProps {
  mealOrders?: MealOrder[]
}

interface GuestModalProps {
  isOpen: boolean
  onClose: () => void
  mealItem: MealOrder | null
  type: 'view' | 'requests'
}

function GuestModal({ isOpen, onClose, mealItem, type }: GuestModalProps) {
  if (!isOpen || !mealItem) return null

  const guests = type === 'view' ? mealItem.guests || [] : mealItem.specialRequests || []
  const title = type === 'view'
    ? `Guests for ${mealItem.name}`
    : `Special Requests for ${mealItem.name}`

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-2">
          {guests.length > 0 ? (
            guests.map((guest, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-900">{guest}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">
              {type === 'view' ? 'Keine Gäste' : 'Keine besonderen Anfragen'}
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default function KitchenOverview({ mealOrders = mockMealOrders }: KitchenOverviewProps) {
  const [selectedMeal, setSelectedMeal] = useState<MealOrder | null>(null)
  const [modalType, setModalType] = useState<'view' | 'requests'>('view')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const currentDate = new Date().toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })

  const handleViewGuests = (meal: MealOrder) => {
    setSelectedMeal(meal)
    setModalType('view')
    setIsModalOpen(true)
  }

  const handleViewRequests = (meal: MealOrder) => {
    setSelectedMeal(meal)
    setModalType('requests')
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedMeal(null)
  }

  const getMealsByCategory = (category: 'breakfast' | 'lunch' | 'dinner') => {
    return mealOrders.filter(meal => meal.category === category)
  }

  const getTotalByCategory = (category: 'breakfast' | 'lunch' | 'dinner') => {
    return getMealsByCategory(category).reduce((total, meal) => total + meal.currentCount, 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kitchen Overview</h1>
          <p className="text-gray-600 mt-1 flex items-center">
            <CalendarDaysIcon className="h-4 w-4 mr-1" />
            Read-only overview of all meal orders for today, {currentDate}
          </p>
        </div>
      </div>

      {/* Meal Sections */}
      <div className="space-y-6">
        {['breakfast', 'lunch', 'dinner'].map((category) => {
          const categoryMeals = getMealsByCategory(category as any)
          const categoryTotal = getTotalByCategory(category as any)
          const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1)

          return (
            <div key={category} className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">{categoryTitle}</h2>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{categoryTotal}</div>
                    <div className="text-xs text-gray-600">Total Orders</div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {categoryMeals.length === 0 ? (
                  <p className="text-gray-500 italic">No {category} orders for today.</p>
                ) : (
                  <div className="space-y-4">
                    {categoryMeals.map((meal) => (
                      <div key={meal.id} className="border border-gray-200 rounded-lg p-4">
                        {/* Time Header */}
                        <div className="flex items-center mb-3">
                          <ClockIcon className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="font-medium text-gray-900">
                            {category === 'breakfast' ? '08:00' : category === 'lunch' ? '12:00' : '19:00'}
                          </span>
                          <span className="text-sm text-gray-500 ml-2">(Standard Time)</span>
                        </div>

                        {/* Meal Item */}
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-1">{meal.name}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>{meal.currentCount} current orders</span>
                              <span>{meal.estimatedCount} estimated</span>
                              {meal.specialRequests.length > 0 && (
                                <span className="text-orange-600">{meal.specialRequests.length} special requests</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-4">
                            {/* Order Count */}
                            <div className="text-center">
                              <div className="text-2xl font-bold text-gray-900">{meal.currentCount}</div>
                              <div className="text-xs text-gray-600">Orders</div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewGuests(meal)}
                                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center space-x-1"
                              >
                                <EyeIcon className="h-4 w-4" />
                                <span>View</span>
                              </button>

                              {meal.specialRequests.length > 0 && (
                                <button
                                  onClick={() => handleViewRequests(meal)}
                                  className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded hover:bg-orange-200 flex items-center space-x-1"
                                >
                                  <DocumentTextIcon className="h-4 w-4" />
                                  <span>Requests</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Guest Modal */}
      <GuestModal
        isOpen={isModalOpen}
        onClose={closeModal}
        mealItem={selectedMeal}
        type={modalType}
      />
    </div>
  )
}