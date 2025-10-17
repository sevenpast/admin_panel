'use client'

import { useState, useEffect } from 'react'
import { useToastContext } from '@/components/common/ToastProvider'
import {
  PencilIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  DocumentDuplicateIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

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
  start_time: '12:00',
  end_time: '13:00',
  prepTime: meal.prep_time_minutes || 0,
  ingredients: meal.ingredients || [],
  allergens: meal.dietary_restrictions || [],
  status: meal.is_active ? 'published' : 'draft',
  scheduled_date: meal.meal_date,
  kitchen_notes: meal.kitchen_notes,
  calories_per_portion: meal.calories_per_portion,
  is_template: meal.is_template === true,
  is_active: meal.is_active !== undefined ? meal.is_active : true,
  createdAt: meal.created_at,
  planned_portions: meal.planned_portions,
  estimated_cost_per_portion: meal.estimated_cost_per_portion,
  cooking_time_minutes: meal.cooking_time_minutes
})

interface TemplatePoolProps {
  selectedDate: string
  onMealCreated: () => void
}

export default function TemplatePool({ selectedDate, onMealCreated }: TemplatePoolProps) {
  const { success, error } = useToastContext()
  const [templates, setTemplates] = useState<MealPlan[]>([])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Partial<MealPlan>>({})

  useEffect(() => {
    loadTemplates()
  }, [])

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

  const handleEditTemplate = (template: MealPlan) => {
    console.log('Editing template:', template)
    setEditingTemplate(template)
    setIsEditModalOpen(true)
  }

  const handleDeleteTemplate = async (template: MealPlan) => {
    if (!confirm(`Are you sure you want to delete the template "${template.name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/meals?id=${template.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        success('Template deleted successfully!')
        loadTemplates()
      } else {
        const err = await response.json()
        error(`Error deleting template: ${err.error}`)
      }
    } catch (err) {
      console.error('Error deleting template:', err)
      error('Error deleting template')
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
        success('Meal created from template successfully!')
        onMealCreated()
      } else {
        const err = await response.json()
        error(`Error: ${err.error}`)
      }
    } catch (err) {
      console.error('Error copying from template:', err)
      error('Error copying from template')
    }
  }

  const handleSaveTemplate = async () => {
    try {
      if (!editingTemplate.name || !editingTemplate.scheduled_date) {
        error('Please fill in all required fields')
        return
      }

      const templateData = {
        name: editingTemplate.name!,
        description: editingTemplate.description || null,
        meal_type: editingTemplate.category!,
        meal_date: editingTemplate.scheduled_date!,
        ingredients: editingTemplate.ingredients || null,
        dietary_restrictions: editingTemplate.allergens || null,
        dietary_option: editingTemplate.dietary_option || 'meat', // Add dietary option
        planned_portions: editingTemplate.planned_portions || 0,
        estimated_cost_per_portion: editingTemplate.estimated_cost_per_portion || null,
        prep_time_minutes: editingTemplate.prepTime || null,
        cooking_time_minutes: editingTemplate.cooking_time_minutes || null,
        kitchen_notes: editingTemplate.kitchen_notes || null,
        is_template: true,
        is_active: editingTemplate.is_active !== undefined ? editingTemplate.is_active : true
      }

      const response = await fetch('/api/meals', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: editingTemplate.id,
          ...templateData
        })
      })

      if (response.ok) {
        success('Template updated successfully!')
        loadTemplates()
        setIsEditModalOpen(false)
        setEditingTemplate({})
      } else {
        const err = await response.json()
        error(`Error updating template: ${err.error}`)
      }
    } catch (err) {
      console.error('Error saving template:', err)
      error('Error saving template')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Template Pool</h2>
          <p className="text-gray-600">Manage and use meal templates</p>
        </div>
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <div className="text-center py-8">
          <DocumentDuplicateIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No templates available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-semibold text-gray-900">{template.name}</h4>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleCopyFromTemplate(template)}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded transition-colors"
                    title="Copy Template to Meal"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEditTemplate(template)}
                    className="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 p-2 rounded transition-colors"
                    title="Edit Template"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded transition-colors"
                    title="Delete Template"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{template.description}</p>
              
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span className="capitalize">{template.category}</span>
                <span>•</span>
                <span className="text-blue-600 font-medium capitalize">
                  {template.dietary_option?.replace('_', ' ') || 'Meat'}
                </span>
                {template.prepTime > 0 && (
                  <>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="h-4 w-4" />
                      <span>{template.prepTime}min</span>
                    </div>
                  </>
                )}
              </div>
              
              {template.ingredients && template.ingredients.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">Ingredients:</p>
                  <p className="text-xs text-gray-600">{template.ingredients.join(', ')}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit Template Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Edit Template</h3>
              <button
                onClick={() => {
                  setIsEditModalOpen(false)
                  setEditingTemplate({})
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSaveTemplate(); }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={editingTemplate.name || ''}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={editingTemplate.category || 'breakfast'}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, category: e.target.value })}
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
        value={editingTemplate.dietary_option || 'meat'}
        onChange={(e) => setEditingTemplate({ ...editingTemplate, dietary_option: e.target.value })}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editingTemplate.description || ''}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    value={editingTemplate.scheduled_date || ''}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, scheduled_date: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time (minutes)</label>
                  <input
                    type="number"
                    value={editingTemplate.prepTime || 0}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, prepTime: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Planned Portions</label>
                  <input
                    type="number"
                    value={editingTemplate.planned_portions || 0}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, planned_portions: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost per Portion</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingTemplate.estimated_cost_per_portion || 0}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, estimated_cost_per_portion: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kitchen Notes</label>
                <textarea
                  value={editingTemplate.kitchen_notes || ''}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, kitchen_notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  rows={2}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false)
                    setEditingTemplate({})
                  }}
                  className="p-2 text-gray-600 hover:text-gray-800 rounded-md hover:bg-gray-100"
                  title="Cancel"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
                <button
                  type="submit"
                  className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  title="Update Template"
                >
                  <CheckIcon className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
