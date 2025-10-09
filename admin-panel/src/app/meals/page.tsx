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
} from '@heroicons/react/24/outline'
import KitchenOverview from '@/components/KitchenOverview'
import { mockMealOrders } from '@/lib/dashboard-data'
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

// Staff Overview Types
interface MealOrder {
  id: string
  name: string
  category: 'breakfast' | 'lunch' | 'dinner'
  currentCount: number
  estimatedCount: number
  specialRequests: string[]
  guests: string[]
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
  scheduled_date: meal.scheduled_date,
  kitchen_notes: meal.kitchen_notes,
  calories_per_portion: meal.calories_per_portion,
  createdAt: meal.created_at
})

// Using centralized meal orders data

export default function MealsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'management' | 'staff'>('overview')

  // Kitchen Management State
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMeal, setSelectedMeal] = useState<MealPlan | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false)
  const [editingMeal, setEditingMeal] = useState<Partial<MealPlan>>({})
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published' | 'archived'>('all')

  // Staff Overview State
  const [mealOrders, setMealOrders] = useState<MealOrder[]>(mockMealOrders)

  const tabs = [
    { id: 'overview', name: 'Kitchen Overview', icon: EyeIcon },
    { id: 'management', name: 'Kitchen Management', icon: CakeIcon },
    { id: 'staff', name: 'Staff Overview', icon: UserGroupIcon }
  ]

  // Load data on component mount
  useEffect(() => {
    loadMeals()
  }, [])

  const loadMeals = async () => {
    try {
      setLoading(true)
      const meals = await databaseService.getMeals()
      const convertedMeals = meals.map(convertMealToUI)

      // Add demo data for now since database returns empty
      if (convertedMeals.length === 0) {
        const demoMeals: MealPlan[] = [
          {
            id: '1',
            name: 'Mediterranean Breakfast Bowl',
            description: 'Fresh quinoa bowl with Mediterranean vegetables and feta',
            category: 'breakfast',
            dietary_option: 'vegetarian',
            image_path: '/images/meals/mediterranean-bowl.jpg',
            start_time: '07:00',
            end_time: '09:00',
            prepTime: 15,
            ingredients: ['quinoa', 'tomatoes', 'feta cheese', 'olive oil'],
            allergens: ['dairy'],
            status: 'published',
            scheduled_date: new Date().toISOString().split('T')[0],
            calories_per_portion: 380,
            kitchen_notes: 'Prepare quinoa the night before',
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Vegan Power Smoothie',
            description: 'Energizing smoothie with plant-based protein',
            category: 'breakfast',
            dietary_option: 'vegan',
            start_time: '08:00',
            end_time: '10:00',
            prepTime: 5,
            ingredients: ['bananas', 'spinach', 'almond milk', 'protein powder'],
            allergens: ['nuts'],
            status: 'draft',
            scheduled_date: new Date().toISOString().split('T')[0],
            calories_per_portion: 250,
            createdAt: new Date().toISOString()
          },
          {
            id: '3',
            name: 'Grilled Salmon with Herbs',
            description: 'Fresh Atlantic salmon with seasonal herbs',
            category: 'dinner',
            dietary_option: 'meat',
            image_path: '/images/meals/grilled-salmon.jpg',
            start_time: '18:00',
            end_time: '20:00',
            prepTime: 20,
            ingredients: ['salmon', 'rosemary', 'thyme', 'lemon'],
            allergens: ['fish'],
            status: 'published',
            scheduled_date: new Date().toISOString().split('T')[0],
            calories_per_portion: 450,
            kitchen_notes: 'Check for pin bones before serving',
            createdAt: new Date().toISOString()
          }
        ]
        setMealPlans(demoMeals)
      } else {
        setMealPlans(convertedMeals)
      }
    } catch (error) {
      console.error('Error loading meals:', error)
    } finally {
      setLoading(false)
    }
  }

  // Kitchen Management Functions
  const handleViewMeal = (meal: MealPlan) => {
    setSelectedMeal(meal)
    setIsViewModalOpen(true)
  }

  const handleEditMeal = (meal: MealPlan) => {
    setEditingMeal(meal)
    setIsEditModalOpen(true)
  }

  const handleCreateMeal = () => {
    setEditingMeal({
      name: '',
      description: '',
      category: 'breakfast',
      dietary_option: 'meat',
      start_time: '12:00',
      end_time: '13:00',
      ingredients: [],
      status: 'draft',
      scheduled_date: new Date().toISOString().split('T')[0],
    })
    setIsCreateModalOpen(true)
  }

  const handleCopyMeal = (meal: MealPlan) => {
    setEditingMeal({
      ...meal,
      id: undefined,
      parent_id: meal.id,
      name: `${meal.name} (Copy)`,
      status: 'draft',
      scheduled_date: new Date().toISOString().split('T')[0]
    })
    setIsCopyModalOpen(true)
  }

  const handleSaveMeal = async () => {
    try {
      if (!editingMeal.name || !editingMeal.scheduled_date) {
        alert('Please fill in all required fields')
        return
      }

      const mealData: Omit<Meal, 'id' | 'created_at' | 'updated_at'> = {
        parent_id: editingMeal.parent_id,
        recurrence_rule_id: editingMeal.recurrence_rule_id,
        name: editingMeal.name!,
        description: editingMeal.description,
        meal_type: editingMeal.category!,
        scheduled_date: editingMeal.scheduled_date!,
        start_time: editingMeal.start_time!,
        end_time: editingMeal.end_time!,
        price: 0,
        ingredients: editingMeal.ingredients || [],
        allergens: [],
        calories_per_portion: 0,
        status: editingMeal.status!,
        preparation_time: editingMeal.prepTime,
        kitchen_notes: '',
        created_by: 'admin'
      }

      if (isCreateModalOpen || isCopyModalOpen) {
        const newMeal = await databaseService.createMeal(mealData)
        if (newMeal) {
          alert(isCopyModalOpen ? 'Meal copied successfully!' : 'Meal plan created successfully!')
          loadMeals()
        } else {
          alert('Error creating meal')
        }
      } else if (editingMeal.id) {
        const updatedMeal = await databaseService.updateMeal(editingMeal.id, mealData)
        if (updatedMeal) {
          alert('Meal plan updated successfully!')
          loadMeals()
        } else {
          alert('Error updating meal')
        }
      }
    } catch (error) {
      console.error('Error saving meal:', error)
      alert('Error saving meal')
    }

    setIsCreateModalOpen(false)
    setIsEditModalOpen(false)
    setIsCopyModalOpen(false)
    setEditingMeal({})
  }

  const handleDeleteMeal = async (mealId: string) => {
    if (confirm('Are you sure you want to delete this meal plan?')) {
      const success = await databaseService.deleteMeal(mealId)
      if (success) {
        alert('Meal plan deleted successfully!')
        loadMeals()
      } else {
        alert('Error deleting meal')
      }
    }
  }

  const handleUpdateStatus = async (mealId: string, newStatus: 'draft' | 'published' | 'archived') => {
    const success = await databaseService.updateMeal(mealId, { status: newStatus })
    if (success) {
      alert(`Meal plan status updated to ${newStatus}!`)
      loadMeals()
    } else {
      alert('Error updating status')
    }
  }

  const getFilteredMeals = () => {
    if (filterStatus === 'all') return mealPlans
    return mealPlans.filter(meal => meal.status === filterStatus)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Staff Overview Functions
  const updateMealCount = (mealId: string, increment: boolean) => {
    setMealOrders(prev =>
      prev.map(meal =>
        meal.id === mealId
          ? { ...meal, currentCount: Math.max(0, meal.currentCount + (increment ? 1 : -1)) }
          : meal
      )
    )
  }

  const getMealsByCategory = (category: 'breakfast' | 'lunch' | 'dinner') => {
    return mealOrders.filter(meal => meal.category === category)
  }

  const getTotalByCategory = (category: 'breakfast' | 'lunch' | 'dinner') => {
    return getMealsByCategory(category).reduce((total, meal) => total + meal.currentCount, 0)
  }

  const renderKitchenManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kitchen Management</h2>
          <p className="text-gray-600">Manage meal plans and recipes</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          <button
            onClick={handleCreateMeal}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Create Meal Plan</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading meals...</div>
        </div>
      ) : (
        <div className="grid gap-6">
          {getFilteredMeals().map((meal) => (
          <div key={meal.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{meal.name}</h3>
                    <div className="text-sm text-gray-500">
                      {meal.start_time} - {meal.end_time}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(meal.status)}`}>
                      {meal.status === 'draft' ? 'Entwurf' :
                       meal.status === 'published' ? 'Veröffentlicht' :
                       meal.status === 'archived' ? 'Archiviert' : meal.status}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 mb-3">{meal.description}</p>

                <div className="flex flex-wrap gap-2">
                  {/* Kategorie Tag */}
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                    {meal.category === 'breakfast' ? 'Frühstück' :
                     meal.category === 'lunch' ? 'Mittagessen' :
                     meal.category === 'dinner' ? 'Abendessen' :
                     meal.category}
                  </span>

                  {/* Ernährungsart Tag */}
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                    {meal.dietary_option === 'meat' ? 'Fleisch' :
                     meal.dietary_option === 'vegetarian' ? 'Vegetarisch' :
                     meal.dietary_option === 'vegan' ? 'Vegan' :
                     meal.dietary_option === 'animal_product' ? 'Tierisch' :
                     meal.dietary_option}
                  </span>

                  {/* Besondere Tags */}
                  {meal.parent_id && (
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs">
                      Kopie
                    </span>
                  )}

                  {meal.image_path && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                      📷 Foto
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => handleViewMeal(meal)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                  title="View Details"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleEditMeal(meal)}
                  className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded"
                  title="Edit"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleCopyMeal(meal)}
                  className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded"
                  title="Copy Meal"
                >
                  <DocumentDuplicateIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteMeal(meal.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                  title="Delete"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>

                {/* Status Actions */}
                {meal.status === 'draft' && (
                  <button
                    onClick={() => handleUpdateStatus(meal.id, 'published')}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center space-x-1"
                  >
                    <CheckCircleIcon className="h-3 w-3" />
                    <span>Publish</span>
                  </button>
                )}
                {meal.status === 'published' && (
                  <button
                    onClick={() => handleUpdateStatus(meal.id, 'archived')}
                    className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                  >
                    Archive
                  </button>
                )}
                {meal.status === 'archived' && (
                  <button
                    onClick={() => handleUpdateStatus(meal.id, 'draft')}
                    className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                  >
                    Restore
                  </button>
                )}
              </div>
            </div>
          </div>
          ))}
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && selectedMeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{selectedMeal.name}</h3>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600">{selectedMeal.description}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Details</h4>
                  <div className="space-y-1 text-sm">
                    <p>Category: {selectedMeal.category}</p>
                    <p>Servings: {selectedMeal.servings}</p>
                    <p>Prep Time: {selectedMeal.prepTime} minutes</p>
                    <p>Cook Time: {selectedMeal.cookTime} minutes</p>
                    <p>Difficulty: {selectedMeal.difficulty}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Dietary</h4>
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                      {selectedMeal.dietary_option}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Ingredients</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {selectedMeal.ingredients.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Allergens</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedMeal.allergens.map((allergen, index) => (
                    <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                      {allergen}
                    </span>
                  ))}
                </div>
              </div>
              {selectedMeal.kitchen_notes && (
                <div>
                  <h4 className="font-semibold mb-2">Kitchen Notes</h4>
                  <p className="text-sm text-gray-600">{selectedMeal.kitchen_notes}</p>
                </div>
              )}
              {selectedMeal.calories_per_portion && (
                <div>
                  <h4 className="font-semibold mb-2">Calories per Portion</h4>
                  <p className="text-sm">{selectedMeal.calories_per_portion} kcal</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Copy Modal */}
      {isCopyModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Copy Meal Plan</h3>
              <button
                onClick={() => {
                  setIsCopyModalOpen(false)
                  setEditingMeal({})
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editingMeal.name || ''}
                  onChange={(e) => setEditingMeal({...editingMeal, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
                <input
                  type="date"
                  value={editingMeal.scheduled_date || ''}
                  onChange={(e) => setEditingMeal({...editingMeal, scheduled_date: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={editingMeal.start_time || ''}
                    onChange={(e) => setEditingMeal({...editingMeal, start_time: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={editingMeal.end_time || ''}
                    onChange={(e) => setEditingMeal({...editingMeal, end_time: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dietary Option</label>
                <select
                  value={editingMeal.dietary_option || 'meat'}
                  onChange={(e) => setEditingMeal({...editingMeal, dietary_option: e.target.value as 'meat' | 'animal_product' | 'vegetarian' | 'vegan' | 'other'})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="meat">Meat</option>
                  <option value="animal_product">Animal Product</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // For now, just store the file name - in production you'd upload to storage
                      setEditingMeal({...editingMeal, image_path: `/images/meals/${file.name}`});
                    }
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
                {editingMeal.image_path && (
                  <p className="text-sm text-gray-500 mt-1">Current: {editingMeal.image_path}</p>
                )}
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsCopyModalOpen(false)
                    setEditingMeal({})
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveMeal}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Create Modal */}
      {(isEditModalOpen || isCreateModalOpen) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {isCreateModalOpen ? 'Create Meal Plan' : 'Edit Meal Plan'}
              </h3>
              <button
                onClick={() => {
                  setIsEditModalOpen(false)
                  setIsCreateModalOpen(false)
                  setEditingMeal({})
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editingMeal.name || ''}
                  onChange={(e) => setEditingMeal({...editingMeal, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                <textarea
                  value={editingMeal.description || ''}
                  onChange={(e) => setEditingMeal({...editingMeal, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategorie</label>
                  <select
                    value={editingMeal.category || 'breakfast'}
                    onChange={(e) => setEditingMeal({...editingMeal, category: e.target.value as any})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="breakfast">Frühstück</option>
                    <option value="lunch">Mittagessen</option>
                    <option value="dinner">Abendessen</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    value={editingMeal.scheduled_date || ''}
                    onChange={(e) => setEditingMeal({...editingMeal, scheduled_date: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={editingMeal.start_time || ''}
                    onChange={(e) => setEditingMeal({...editingMeal, start_time: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={editingMeal.end_time || ''}
                    onChange={(e) => setEditingMeal({...editingMeal, end_time: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dietary Option</label>
                <select
                  value={editingMeal.dietary_option || 'meat'}
                  onChange={(e) => setEditingMeal({...editingMeal, dietary_option: e.target.value as 'meat' | 'animal_product' | 'vegetarian' | 'vegan' | 'other'})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="meat">Meat</option>
                  <option value="animal_product">Animal Product</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ingredients (comma separated)</label>
                <textarea
                  value={editingMeal.ingredients?.join(', ') || ''}
                  onChange={(e) => setEditingMeal({...editingMeal, ingredients: e.target.value.split(',').map(item => item.trim()).filter(item => item.length > 0)})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={2}
                  placeholder="e.g., tomatoes, feta cheese, olive oil"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Foto Upload</label>
                <div
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                    const file = e.dataTransfer.files?.[0];
                    if (file && file.type.startsWith('image/')) {
                      setEditingMeal({...editingMeal, image_path: `/images/meals/${file.name}`});
                    }
                  }}
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        setEditingMeal({...editingMeal, image_path: `/images/meals/${file.name}`});
                      }
                    };
                    input.click();
                  }}
                >
                  {editingMeal.image_path ? (
                    <div className="space-y-2">
                      <div className="text-green-600">✓ Foto hochgeladen</div>
                      <div className="text-sm text-gray-500">{editingMeal.image_path}</div>
                      <div className="text-xs text-gray-400">Klicken oder ziehen Sie ein neues Foto hierher</div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-gray-400">📷</div>
                      <div className="text-sm text-gray-600">Foto hier hinziehen oder klicken zum Hochladen</div>
                      <div className="text-xs text-gray-400">PNG, JPG, GIF bis 10MB</div>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editingMeal.status || 'draft'}
                  onChange={(e) => setEditingMeal({...editingMeal, status: e.target.value as any})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="draft">Entwurf</option>
                  <option value="published">Veröffentlicht</option>
                  <option value="archived">Archiviert</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsEditModalOpen(false)
                    setIsCreateModalOpen(false)
                    setEditingMeal({})
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveMeal}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {isCreateModalOpen ? 'Create' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderStaffOverview = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Staff Overview</h2>
        <p className="text-gray-600">Meal quantity management - adjust portions with +/- controls</p>
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
      <div className="space-y-4">
        {['breakfast', 'lunch', 'dinner'].map((category) => {
          const categoryMeals = getMealsByCategory(category as any)
          const categoryTotal = getTotalByCategory(category as any)

          return (
            <div key={category} className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900 capitalize">{category}</h3>
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
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{meal.name}</h4>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                              <span>{meal.currentCount} current orders</span>
                              <span>{meal.estimatedCount} estimated</span>
                              {meal.specialRequests.length > 0 && (
                                <span className="text-orange-600">{meal.specialRequests.length} special requests</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-gray-900">{meal.currentCount}</div>
                              <div className="text-xs text-gray-600">Orders</div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => updateMealCount(meal.id, false)}
                                className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded hover:bg-red-200"
                              >
                                <MinusIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => updateMealCount(meal.id, true)}
                                className="w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 rounded hover:bg-green-200"
                              >
                                <PlusIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {meal.specialRequests.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-sm text-gray-600 mb-1">Special Requests:</p>
                            <div className="flex flex-wrap gap-1">
                              {meal.specialRequests.map((request, index) => (
                                <span key={index} className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                                  {request}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <KitchenOverview mealOrders={mealOrders} />}
      {activeTab === 'management' && renderKitchenManagement()}
      {activeTab === 'staff' && renderStaffOverview()}
    </div>
  )
}