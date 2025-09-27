'use client'

import { useState } from 'react'
import {
  ClockIcon,
  EyeIcon,
  DocumentTextIcon,
  XMarkIcon,
  CalendarDaysIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CakeIcon,
  UserGroupIcon,
  MinusIcon
} from '@heroicons/react/24/outline'
import KitchenOverview from '@/components/KitchenOverview'
import { mockMealOrders } from '@/lib/dashboard-data'

// Kitchen Management Types
interface MealPlan {
  id: string
  name: string
  description: string
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  dietary: string[]
  servings: number
  prepTime: number
  cookTime: number
  difficulty: 'easy' | 'medium' | 'hard'
  ingredients: string[]
  instructions: string[]
  isActive: boolean
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

// Mock data for Kitchen Management
const mockMealPlans: MealPlan[] = [
  {
    id: '1',
    name: 'Pancakes & Fresh Fruit',
    description: 'Fluffy pancakes served with seasonal fresh fruit and maple syrup',
    category: 'breakfast',
    dietary: ['vegetarian'],
    servings: 20,
    prepTime: 15,
    cookTime: 20,
    difficulty: 'easy',
    ingredients: ['Flour', 'Eggs', 'Milk', 'Sugar', 'Baking powder', 'Fresh fruit', 'Maple syrup'],
    instructions: [
      'Mix dry ingredients in a large bowl',
      'Whisk wet ingredients in separate bowl',
      'Combine wet and dry ingredients until just mixed',
      'Heat griddle and cook pancakes until golden',
      'Serve with fresh fruit and syrup'
    ],
    isActive: true,
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Mediterranean Quinoa Bowl',
    description: 'Healthy quinoa bowl with vegetables, feta cheese, and tahini dressing',
    category: 'lunch',
    dietary: ['vegetarian', 'gluten-free'],
    servings: 15,
    prepTime: 20,
    cookTime: 25,
    difficulty: 'medium',
    ingredients: ['Quinoa', 'Cucumber', 'Tomatoes', 'Feta cheese', 'Olives', 'Tahini', 'Lemon'],
    instructions: [
      'Cook quinoa according to package instructions',
      'Prepare vegetables by dicing',
      'Make tahini dressing with lemon and herbs',
      'Assemble bowls with quinoa base',
      'Top with vegetables, feta, and dressing'
    ],
    isActive: true,
    createdAt: '2024-01-16'
  },
  {
    id: '3',
    name: 'Surf & Turf Tacos',
    description: 'Fresh fish and grilled chicken tacos with avocado salsa',
    category: 'dinner',
    dietary: ['gluten-free'],
    servings: 25,
    prepTime: 30,
    cookTime: 20,
    difficulty: 'hard',
    ingredients: ['White fish', 'Chicken breast', 'Corn tortillas', 'Avocado', 'Lime', 'Cilantro', 'Onions'],
    instructions: [
      'Season and grill chicken and fish',
      'Prepare avocado salsa with lime and cilantro',
      'Warm tortillas on griddle',
      'Slice proteins and prepare toppings',
      'Assemble tacos and serve immediately'
    ],
    isActive: true,
    createdAt: '2024-01-17'
  }
]

// Using centralized meal orders data

export default function MealsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'management' | 'staff'>('overview')

  // Kitchen Management State
  const [mealPlans, setMealPlans] = useState<MealPlan[]>(mockMealPlans)
  const [selectedMeal, setSelectedMeal] = useState<MealPlan | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingMeal, setEditingMeal] = useState<Partial<MealPlan>>({})

  // Staff Overview State
  const [mealOrders, setMealOrders] = useState<MealOrder[]>(mockMealOrders)

  const tabs = [
    { id: 'overview', name: 'Kitchen Overview', icon: EyeIcon },
    { id: 'management', name: 'Kitchen Management', icon: CakeIcon },
    { id: 'staff', name: 'Staff Overview', icon: UserGroupIcon }
  ]

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
      dietary: [],
      servings: 10,
      prepTime: 15,
      cookTime: 30,
      difficulty: 'easy',
      ingredients: [],
      instructions: [],
      isActive: true
    })
    setIsCreateModalOpen(true)
  }

  const handleSaveMeal = () => {
    if (isCreateModalOpen) {
      const newMeal: MealPlan = {
        ...editingMeal as MealPlan,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split('T')[0]
      }
      setMealPlans([...mealPlans, newMeal])
      alert('Meal plan created successfully!')
    } else {
      setMealPlans(mealPlans.map(meal =>
        meal.id === editingMeal.id ? editingMeal as MealPlan : meal
      ))
      alert('Meal plan updated successfully!')
    }
    setIsCreateModalOpen(false)
    setIsEditModalOpen(false)
    setEditingMeal({})
  }

  const handleDeleteMeal = (mealId: string) => {
    if (confirm('Are you sure you want to delete this meal plan?')) {
      setMealPlans(mealPlans.filter(meal => meal.id !== mealId))
      alert('Meal plan deleted successfully!')
    }
  }

  const handleToggleActive = (mealId: string) => {
    setMealPlans(mealPlans.map(meal =>
      meal.id === mealId ? { ...meal, isActive: !meal.isActive } : meal
    ))
    alert('Meal plan status updated!')
  }

  const handlePublishMeal = (mealId: string) => {
    const meal = mealPlans.find(m => m.id === mealId)
    if (meal) {
      alert(`Meal plan "${meal.name}" has been published and is now available for ordering!`)
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
        <button
          onClick={handleCreateMeal}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Create Meal Plan</span>
        </button>
      </div>

      <div className="grid gap-6">
        {mealPlans.map((meal) => (
          <div key={meal.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{meal.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    meal.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {meal.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium capitalize">
                    {meal.category}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{meal.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Servings: {meal.servings}</span>
                  <span>Prep: {meal.prepTime}min</span>
                  <span>Cook: {meal.cookTime}min</span>
                  <span className="capitalize">Difficulty: {meal.difficulty}</span>
                </div>
                {meal.dietary.length > 0 && (
                  <div className="flex space-x-2 mt-2">
                    {meal.dietary.map((diet) => (
                      <span key={diet} className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                        {diet}
                      </span>
                    ))}
                  </div>
                )}
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
                  onClick={() => handleDeleteMeal(meal.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                  title="Delete"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleToggleActive(meal.id)}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    meal.isActive
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {meal.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handlePublishMeal(meal.id)}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  Publish
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

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
                    {selectedMeal.dietary.map((diet) => (
                      <span key={diet} className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                        {diet}
                      </span>
                    ))}
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
                <h4 className="font-semibold mb-2">Instructions</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  {selectedMeal.instructions.map((instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ol>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editingMeal.description || ''}
                  onChange={(e) => setEditingMeal({...editingMeal, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={editingMeal.category || 'breakfast'}
                    onChange={(e) => setEditingMeal({...editingMeal, category: e.target.value as any})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Servings</label>
                  <input
                    type="number"
                    value={editingMeal.servings || 10}
                    onChange={(e) => setEditingMeal({...editingMeal, servings: parseInt(e.target.value)})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
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