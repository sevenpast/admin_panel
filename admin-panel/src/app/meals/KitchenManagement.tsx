'use client'

import { useState, useEffect } from 'react'
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  DocumentDuplicateIcon,
  ClockIcon,
  CakeIcon,
  GlobeAltIcon,
  ArrowPathIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'
import TemplatePool from './TemplatePool'

// Types
interface Meal {
  id: string
  meal_id: string
  camp_id: string
  name: string
  meal_type: string
  meal_date: string
  description?: string
  ingredients?: string[]
  dietary_restrictions?: string[]
  dietary_option?: string // Add dietary option field
  planned_portions: number
  actual_portions: number
  estimated_cost_per_portion?: number
  actual_cost_per_portion?: number
  prep_time_minutes?: number
  cooking_time_minutes?: number
  kitchen_notes?: string
  is_active: boolean
  is_confirmed: boolean
  created_at: string
  updated_at: string
  recurrence_rule_id?: string
  is_template?: boolean
  parent_id?: string
  image_path?: string
  calories_per_portion?: number
  // Cutoff system fields
  cutoff_time?: string
  cutoff_enabled?: boolean
  reset_time?: string
  reset_enabled?: boolean
  is_booking_active?: boolean
  cutoff_status?: 'active' | 'cutoff_reached'
  can_book?: boolean
  cutoff_reached?: boolean
}

interface MealPlan {
  id: string
  parent_id?: string
  recurrence_rule_id?: string
  name: string
  description: string
  category: string
  dietary_option: string
  image_path?: string
  start_time: string
  end_time: string
  prepTime: number
  ingredients: string[]
  allergens: string[]
  status: string
  scheduled_date: string
  kitchen_notes?: string
  calories_per_portion?: number
  is_template?: boolean
  is_active?: boolean
  createdAt: string
  planned_portions?: number
  estimated_cost_per_portion?: number
  cooking_time_minutes?: number
}

interface RecurrenceSettings {
  frequency: 'none' | 'daily' | 'weekly' | 'monthly'
  interval: number
  daysOfWeek?: number[]
  endDate?: string
  occurrences?: number
}

// Convert database meal to UI format
const convertMealToUI = (meal: Meal): MealPlan => ({
  id: meal.id,
  parent_id: meal.parent_id,
  recurrence_rule_id: meal.recurrence_rule_id,
  name: meal.name,
  description: meal.description || '',
  category: meal.meal_type,
  dietary_option: meal.dietary_option || 'meat', // Read from database or default
  image_path: meal.image_path,
  start_time: '12:00', // Default value
  end_time: '13:00', // Default value
  prepTime: meal.prep_time_minutes || 0,
  ingredients: meal.ingredients || [],
  allergens: meal.dietary_restrictions || [],
  status: meal.is_active ? 'published' : 'draft',
  scheduled_date: meal.meal_date,
  kitchen_notes: meal.kitchen_notes,
  calories_per_portion: meal.calories_per_portion,
  is_template: meal.is_template || false,
  is_active: meal.is_active !== undefined ? meal.is_active : true,
  createdAt: meal.created_at,
  planned_portions: meal.planned_portions,
  estimated_cost_per_portion: meal.estimated_cost_per_portion,
  cooking_time_minutes: meal.cooking_time_minutes
})

export default function KitchenManagementComponent({ 
  selectedDate, 
  onDateChange 
}: { 
  selectedDate: string
  onDateChange: (date: string) => void 
}) {
  // State
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [templates, setTemplates] = useState<MealPlan[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedMeal, setSelectedMeal] = useState<MealPlan | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false)
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [editingMeal, setEditingMeal] = useState<Partial<MealPlan>>({})
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published' | 'archived'>('all')
  // Multi-select state
  const [selectedMealIds, setSelectedMealIds] = useState<string[]>([])
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false)
  const [recurrenceSettings, setRecurrenceSettings] = useState<RecurrenceSettings>({
    frequency: 'none',
    interval: 1,
    daysOfWeek: [],
    endDate: '',
    occurrences: 1
  })

  // Load data on component mount and date change
  useEffect(() => {
    loadMeals()
    loadTemplates()
  }, [selectedDate])

  // Check cutoff status every minute
  useEffect(() => {
    const cutoffCheckInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/meals/status')
        if (response.ok) {
          const result = await response.json()
          const status = result.success ? result.data : result
          // Only reload meals if status indicates changes
          if (status.hasUpdates) {
            loadMeals()
          }
        }
      } catch (error) {
        console.error('Error checking cutoff status:', error)
      }
    }, 60000) // Check every minute

    return () => clearInterval(cutoffCheckInterval)
  }, [])

  const loadMeals = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/meals')
      if (response.ok) {
        const result = await response.json()
        const meals = result.success ? result.data : result
        const convertedMeals = meals.map(convertMealToUI)
        setMealPlans(convertedMeals)
      } else {
        console.error('Error loading meals:', response.statusText)
      }
    } catch (error) {
      console.error('Error loading meals:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/meals?templates_only=true')
      if (response.ok) {
        const result = await response.json()
        const templates = result.success ? result.data : result
        const convertedTemplates = templates.map(convertMealToUI)
        setTemplates(convertedTemplates)
      } else {
        console.error('Error loading templates:', response.statusText)
      }
    } catch (error) {
      console.error('Error loading templates:', error)
    }
  }

  // Template Functions
  const handleEditTemplate = (template: MealPlan) => {
    setEditingMeal(template)
    setIsEditModalOpen(true)
  }

  const handleDeleteTemplate = async (template: MealPlan) => {
    if (!confirm(`Are you sure you want to delete the template "${template.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/meals?id=${template.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Template deleted successfully!')
        loadTemplates()
      } else {
        const error = await response.json()
        alert(`Error deleting template: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting template:', error)
      alert('Error deleting template')
    }
  }

  const handleCopyFromTemplate = async (template: MealPlan) => {
    try {
      const response = await fetch('/api/meals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          copyFromTemplate: true,
          templateId: template.id,
          meal_date: selectedDate
        })
      })

      if (response.ok) {
        const newMeal = await response.json()
        const convertedMeal = convertMealToUI(newMeal)
        setMealPlans(prev => [...prev, convertedMeal])
        alert('Meal created from template successfully!')
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error copying from template:', error)
      alert('Error copying from template')
    }
  }

  // Meal Functions
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
      prepTime: 0,
      ingredients: [],
      allergens: [],
      status: 'draft',
      scheduled_date: selectedDate,
      kitchen_notes: '',
      is_template: false,
      is_active: true,
      planned_portions: 0,
      estimated_cost_per_portion: 0,
      cooking_time_minutes: 0
    })
    setIsCreateModalOpen(true)
  }

  const handleSaveMeal = async () => {
    try {
      if (!editingMeal.name || !editingMeal.scheduled_date) {
        alert('Please fill in all required fields')
        return
      }

      // Only use fields that exist in the database
      const mealData = {
        name: editingMeal.name!,
        description: editingMeal.description || null,
        meal_type: editingMeal.category!,
        meal_date: editingMeal.scheduled_date!,
        ingredients: editingMeal.ingredients || null,
        dietary_restrictions: editingMeal.allergens || null,
        dietary_option: editingMeal.dietary_option || 'meat', // Add dietary option
        planned_portions: editingMeal.planned_portions || 0,
        estimated_cost_per_portion: editingMeal.estimated_cost_per_portion || null,
        prep_time_minutes: editingMeal.prepTime || null,
        cooking_time_minutes: editingMeal.cooking_time_minutes || null,
        kitchen_notes: editingMeal.kitchen_notes || null,
        is_template: editingMeal.is_template || false,
        is_active: editingMeal.is_active !== undefined ? editingMeal.is_active : true,
        // Include recurrence settings if not 'none'
        ...(recurrenceSettings.frequency !== 'none' && { recurrence: recurrenceSettings })
      }

      if (isCreateModalOpen || isCopyModalOpen) {
        const response = await fetch('/api/meals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(mealData)
        })

        if (response.ok) {
          const successMessage = editingMeal.is_template 
            ? 'Template created successfully!' 
            : isCopyModalOpen 
            ? 'Meal copied successfully!' 
            : 'Meal plan created successfully!'
          alert(successMessage)
          loadMeals()
          loadTemplates() // Reload templates if a new template was created
        } else {
          const error = await response.json()
          alert(`Error creating meal: ${error.error}`)
        }
      } else if (editingMeal.id) {
        const response = await fetch('/api/meals', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: editingMeal.id,
            ...mealData
          })
        })

        if (response.ok) {
          const successMessage = editingMeal.is_template 
            ? 'Template updated successfully!' 
            : 'Meal plan updated successfully!'
          alert(successMessage)
          loadMeals()
          loadTemplates() // Reload templates if a template was updated
        } else {
          const error = await response.json()
          alert(`Error updating meal: ${error.error}`)
        }
      }
    } catch (error) {
      console.error('Error saving meal:', error)
      alert('Error saving meal')
    }

    setIsCreateModalOpen(false)
    setIsEditModalOpen(false)
    setIsCopyModalOpen(false)
    resetModalStates()
  }

  const handleDeleteMeal = async (mealId: string) => {
    if (confirm('Are you sure you want to delete this meal plan?')) {
      try {
        const response = await fetch(`/api/meals?id=${mealId}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          alert('Meal plan deleted successfully!')
          loadMeals()
        } else {
          const error = await response.json()
          alert(`Error deleting meal: ${error.error}`)
        }
      } catch (error) {
        console.error('Error deleting meal:', error)
        alert('Error deleting meal')
      }
    }
  }

  // Multi-select functions
  const handleSelectMeal = (mealId: string) => {
    setSelectedMealIds(prev => 
      prev.includes(mealId) 
        ? prev.filter(id => id !== mealId)
        : [...prev, mealId]
    )
  }

  const handleSelectAllMeals = () => {
    const filteredMeals = mealPlans.filter(meal => {
      if (filterStatus === 'all') return true
      if (filterStatus === 'draft') return !meal.is_active
      if (filterStatus === 'published') return meal.is_active
      if (filterStatus === 'archived') return false // Add archived logic if needed
      return true
    })
    
    if (selectedMealIds.length === filteredMeals.length) {
      setSelectedMealIds([])
    } else {
      setSelectedMealIds(filteredMeals.map(meal => meal.id))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedMealIds.length === 0) {
      alert('Please select meals to delete')
      return
    }

    try {
      const response = await fetch(`/api/meals?bulk_ids=${JSON.stringify(selectedMealIds)}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const result = await response.json()
        alert(`${result.deletedCount} meals deleted successfully!`)
        setSelectedMealIds([])
        setIsBulkDeleteModalOpen(false)
        loadMeals()
      } else {
        const error = await response.json()
        alert(`Error deleting meals: ${error.error}`)
      }
    } catch (error) {
      console.error('Error bulk deleting meals:', error)
      alert('Error deleting meals')
    }
  }

  const handlePublishMeal = async (mealId: string) => {
    try {
      const response = await fetch('/api/meals', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: mealId,
          is_active: true
        })
      })

      if (response.ok) {
        alert('Meal published successfully!')
        loadMeals()
      } else {
        const error = await response.json()
        alert(`Error publishing meal: ${error.error}`)
      }
    } catch (error) {
      console.error('Error publishing meal:', error)
      alert('Error publishing meal')
    }
  }

  const handleCopyMeal = async (meal: MealPlan) => {
    try {
      const response = await fetch('/api/meals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: `${meal.name} (Copy)`,
          description: meal.description,
          meal_type: meal.category,
          meal_date: selectedDate,
          ingredients: meal.ingredients,
        dietary_restrictions: meal.allergens,
        dietary_option: meal.dietary_option || 'meat', // Add dietary option
        planned_portions: meal.planned_portions || 0,
          estimated_cost_per_portion: meal.estimated_cost_per_portion || null,
          prep_time_minutes: meal.prepTime || null,
          cooking_time_minutes: meal.cooking_time_minutes || null,
          kitchen_notes: meal.kitchen_notes || null,
          is_template: false,
          is_active: false
        })
      })

      if (response.ok) {
        alert('Meal copied successfully!')
        loadMeals()
      } else {
        const error = await response.json()
        alert(`Error copying meal: ${error.error}`)
      }
    } catch (error) {
      console.error('Error copying meal:', error)
      alert('Error copying meal')
    }
  }

  const resetModalStates = () => {
    setEditingMeal({})
    setRecurrenceSettings({
      frequency: 'none',
      interval: 1,
      daysOfWeek: [],
      endDate: '',
      occurrences: 1
    })
  }

  const filteredMeals = mealPlans.filter(meal => {
    if (filterStatus === 'all') return true
    if (filterStatus === 'draft') return meal.status === 'draft'
    if (filterStatus === 'published') return meal.status === 'published'
    if (filterStatus === 'archived') return meal.status === 'archived'
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kitchen Management</h2>
          <p className="text-gray-600">Manage meal plans and templates</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsTemplateModalOpen(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
          >
            <DocumentDuplicateIcon className="h-5 w-5" />
            <span>Template Pool</span>
          </button>
          {/* Multi-select controls */}
          {selectedMealIds.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedMealIds.length} selected
              </span>
              <button
                onClick={() => setIsBulkDeleteModalOpen(true)}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 flex items-center space-x-1"
              >
                <TrashIcon className="h-4 w-4" />
                <span>Delete</span>
              </button>
              <button
                onClick={() => setSelectedMealIds([])}
                className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
              >
                Clear
              </button>
            </div>
          )}
          
          <button
            onClick={handleCreateMeal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Create Meal</span>
          </button>
        </div>
      </div>

      {/* Date Filter and Select All */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          
          {/* Select All Checkbox */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedMealIds.length > 0 && selectedMealIds.length === mealPlans.filter(meal => {
                if (filterStatus === 'all') return true
                if (filterStatus === 'draft') return !meal.is_active
                if (filterStatus === 'published') return meal.is_active
                return true
              }).length}
              onChange={handleSelectAllMeals}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="text-sm text-gray-700">Select All</label>
          </div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex space-x-4">
          {(['all', 'draft', 'published', 'archived'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Meals List */}
      <div className="space-y-6">
        {['breakfast', 'lunch', 'dinner'].map((category) => {
          const categoryMeals = filteredMeals.filter(meal => meal.category === category)
          const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1)

          return (
            <div key={category} className="bg-white rounded-lg border-2 border-gray-300 shadow-lg">
              {/* Category Header */}
              <div className="px-6 py-4 bg-gray-50 border-b-2 border-gray-300">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">{categoryTitle}</h2>
                  <button
                    onClick={handleCreateMeal}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <PlusIcon className="h-5 w-5" />
                    <span>Add {categoryTitle}</span>
                  </button>
                </div>
              </div>

              {/* Category Content */}
              <div className="p-6">
                {categoryMeals.length === 0 ? (
                  <div className="text-center py-8">
                    <CakeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 italic text-lg">No {category} meals for the selected date</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {categoryMeals.map((meal) => (
                      <div key={meal.id} className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                        selectedMealIds.includes(meal.id) 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 bg-gray-50'
                      }`}>
                        {/* Checkbox for multi-select */}
                        <div className="flex items-start justify-between mb-2">
                          <input
                            type="checkbox"
                            checked={selectedMealIds.includes(meal.id)}
                            onChange={() => handleSelectMeal(meal.id)}
                            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </div>
                        
                        {/* Meal Image */}
                        {meal.image_path ? (
                          <div className="w-full h-32 bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                            <PhotoIcon className="h-8 w-8 text-gray-400" />
                          </div>
                        ) : (
                          <div className="w-full h-32 bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                            <CakeIcon className="h-8 w-8 text-gray-400" />
                          </div>
                        )}

                        {/* Meal Info */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-500 uppercase">{meal.category}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              meal.status === 'published' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {meal.status || 'draft'}
                            </span>
                          </div>
                          
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-blue-600 uppercase">
                    {meal.dietary_option?.replace('_', ' ') || 'Meat'}
                  </span>
                  {meal.cutoff_enabled && (
                    <div className="flex items-center space-x-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        meal.cutoff_reached 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {meal.cutoff_reached ? 'Cutoff' : 'Active'}
                      </span>
                      {meal.cutoff_time && (
                        <span className="text-xs text-gray-500">
                          {meal.cutoff_time}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                          
                          <h3 className="font-semibold text-gray-900 text-lg">{meal.name}</h3>
                          
                          <p className="text-sm text-gray-600 line-clamp-2">{meal.description}</p>
                          
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <ClockIcon className="h-3 w-3" />
                            <span>{meal.start_time} - {meal.end_time}</span>
                          </div>
                          
                          {meal.ingredients && meal.ingredients.length > 0 && (
                            <div className="text-xs text-gray-500">
                              <span className="font-medium">Ingredients:</span>
                              <p className="line-clamp-2">{meal.ingredients.join(', ')}</p>
                            </div>
                          )}
                        </div>

                        {/* Action Icons */}
                        <div className="flex items-center justify-center space-x-2 mt-4 pt-3 border-t border-gray-200">
                          <button
                            onClick={() => handleViewMeal(meal)}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded transition-colors"
                            title="View Meal"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditMeal(meal)}
                            className="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 p-2 rounded transition-colors"
                            title="Edit Meal"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handlePublishMeal(meal.id)}
                            className="text-green-600 hover:text-green-800 hover:bg-green-50 p-2 rounded transition-colors"
                            title="Publish Meal"
                          >
                            <GlobeAltIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleCopyMeal(meal)}
                            className="text-purple-600 hover:text-purple-800 hover:bg-purple-50 p-2 rounded transition-colors"
                            title="Copy Meal"
                          >
                            <ArrowPathIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMeal(meal.id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded transition-colors"
                            title="Delete Meal"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
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

      {/* Template Pool Modal */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Template Pool</h3>
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <TemplatePool 
              selectedDate={selectedDate} 
              onMealCreated={loadMeals}
            />
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
                  setIsCreateModalOpen(false)
                  setIsEditModalOpen(false)
                  resetModalStates()
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSaveMeal(); }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={editingMeal.name || ''}
                    onChange={(e) => setEditingMeal({ ...editingMeal, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={editingMeal.category || 'breakfast'}
                    onChange={(e) => setEditingMeal({ ...editingMeal, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    required
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Dietary Option *</label>
      <select
        value={editingMeal.dietary_option || 'meat'}
        onChange={(e) => setEditingMeal({ ...editingMeal, dietary_option: e.target.value })}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        required
      >
        <option value="meat">Meat</option>
        <option value="animal_product">Animal Products</option>
        <option value="vegetarian">Vegetarian</option>
        <option value="vegan">Vegan</option>
        <option value="other">Other</option>
      </select>
    </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    value={editingMeal.scheduled_date || ''}
                    onChange={(e) => setEditingMeal({ ...editingMeal, scheduled_date: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                  <input
                    type="time"
                    value={editingMeal.start_time || ''}
                    onChange={(e) => setEditingMeal({ ...editingMeal, start_time: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
                  <input
                    type="time"
                    value={editingMeal.end_time || ''}
                    onChange={(e) => setEditingMeal({ ...editingMeal, end_time: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editingMeal.description || ''}
                  onChange={(e) => setEditingMeal({ ...editingMeal, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Describe the meal..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ingredients</label>
                <textarea
                  value={editingMeal.ingredients?.join(', ') || ''}
                  onChange={(e) => setEditingMeal({ ...editingMeal, ingredients: e.target.value.split(',').map(i => i.trim()).filter(i => i) })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  rows={2}
                  placeholder="Enter ingredients separated by commas..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image Upload</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
              </div>

              {/* Recurrence Settings */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Recurrence Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                    <select
                      value={recurrenceSettings.frequency}
                      onChange={(e) => setRecurrenceSettings({ ...recurrenceSettings, frequency: e.target.value as any })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="none">No Recurrence</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  {recurrenceSettings.frequency === 'weekly' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Days of Week</label>
                      <div className="flex flex-wrap gap-2">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => (
                          <label key={day} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={recurrenceSettings.daysOfWeek?.includes(index) || false}
                              onChange={(e) => {
                                const days = recurrenceSettings.daysOfWeek || []
                                if (e.target.checked) {
                                  setRecurrenceSettings({ ...recurrenceSettings, daysOfWeek: [...days, index] })
                                } else {
                                  setRecurrenceSettings({ ...recurrenceSettings, daysOfWeek: days.filter(d => d !== index) })
                                }
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-1 text-sm text-gray-700">{day}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {isCreateModalOpen && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="saveAsTemplate"
                    checked={editingMeal.is_template === true}
                    onChange={(e) => setEditingMeal({ ...editingMeal, is_template: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="saveAsTemplate" className="ml-2 block text-sm text-gray-700">
                    Save as Template
                  </label>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false)
                    setIsEditModalOpen(false)
                    resetModalStates()
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  {isCreateModalOpen ? 'Create' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && selectedMeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Meal Details</h3>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900">{selectedMeal.name}</h4>
                <p className="text-gray-600 mt-1">{selectedMeal.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Category:</span>
                  <span className="ml-2 capitalize">{selectedMeal.category}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Dietary Option:</span>
                  <span className="ml-2 capitalize">{selectedMeal.dietary_option?.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Date:</span>
                  <span className="ml-2">{selectedMeal.scheduled_date}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Prep Time:</span>
                  <span className="ml-2">{selectedMeal.prepTime} minutes</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Portions:</span>
                  <span className="ml-2">{selectedMeal.planned_portions}</span>
                </div>
              </div>

              {selectedMeal.kitchen_notes && (
                <div>
                  <span className="font-medium text-gray-700">Kitchen Notes:</span>
                  <p className="mt-1 text-gray-600">{selectedMeal.kitchen_notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Delete Meals</h3>
              <button
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                ✕
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600">
                Are you sure you want to delete <strong>{selectedMealIds.length}</strong> selected meals?
              </p>
              <p className="text-sm text-red-600 mt-2">
                This action cannot be undone.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete {selectedMealIds.length} Meals
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
