'use client'

import { useState, useEffect } from 'react'
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline'

// Interfaces based on database schema
interface AutomationRule {
  id: string
  automation_rule_id: string // A-XXXXXXXXXX
  camp_id: string
  name: string
  target: 'meals' | 'events' | 'surf_lessons'
  meal_type?: 'breakfast' | 'lunch' | 'dinner'
  alert_days_before: number
  alert_time: string
  alert_message: string
  send_automatically: boolean
  cutoff_enabled: boolean
  cutoff_days_before?: number
  cutoff_time?: string
  recurring: boolean
  recurrence_type: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom'
  recurrence_payload?: any
  season_override?: any
  special_dates?: any[]
  is_active: boolean
  created_by?: string
  updated_by?: string
  created_at: string
  updated_at: string
}

interface AutomationJob {
  id: string
  rule_id: string
  job_type: 'alert' | 'cutoff'
  execute_at: string
  status: 'pending' | 'completed' | 'failed' | 'skipped'
  result_meta?: any
}

// Generate automation rule ID function (A-XXXXXXXXXX)
const generateAutomationRuleId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'A-'
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Mock data for automation rules
const mockAutomationRules: AutomationRule[] = [
  {
    id: 'rule-1',
    automation_rule_id: 'A-A1B2C3D4E5',
    camp_id: 'camp-1',
    name: 'Breakfast Daily Alert',
    target: 'meals',
    meal_type: 'breakfast',
    alert_days_before: 0,
    alert_time: '19:00',
    alert_message: 'Frühstück morgen verfügbar! Bitte bis 07:00 Uhr bestellen.',
    send_automatically: true,
    cutoff_enabled: true,
    cutoff_days_before: 0,
    cutoff_time: '07:00',
    recurring: true,
    recurrence_type: 'daily',
    recurrence_payload: { frequency: 'daily' },
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'rule-2',
    automation_rule_id: 'A-F6G7H8I9J0',
    camp_id: 'camp-1',
    name: 'Lunch Daily Alert',
    target: 'meals',
    meal_type: 'lunch',
    alert_days_before: 0,
    alert_time: '10:00',
    alert_message: 'Mittagessen heute verfügbar! Bitte bis 12:00 Uhr bestellen.',
    send_automatically: true,
    cutoff_enabled: true,
    cutoff_days_before: 0,
    cutoff_time: '12:00',
    recurring: true,
    recurrence_type: 'daily',
    recurrence_payload: { frequency: 'daily' },
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'rule-3',
    automation_rule_id: 'A-K1L2M3N4O5',
    camp_id: 'camp-1',
    name: 'Dinner Daily Alert',
    target: 'meals',
    meal_type: 'dinner',
    alert_days_before: 0,
    alert_time: '15:00',
    alert_message: 'Abendessen heute verfügbar! Bitte bis 17:00 Uhr bestellen.',
    send_automatically: true,
    cutoff_enabled: true,
    cutoff_days_before: 0,
    cutoff_time: '17:00',
    recurring: true,
    recurrence_type: 'daily',
    recurrence_payload: { frequency: 'daily' },
    is_active: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'rule-4',
    automation_rule_id: 'A-P6Q7R8S9T0',
    camp_id: 'camp-1',
    name: 'Surf Lessons Weekly Alert',
    target: 'surf_lessons',
    alert_days_before: 1,
    alert_time: '08:00',
    alert_message: 'Deine Surf-Stunden diese Woche sind geplant! Schaue in die App für Details.',
    send_automatically: true,
    cutoff_enabled: false,
    recurring: true,
    recurrence_type: 'weekly',
    recurrence_payload: { days: ['MO', 'WE', 'FR'], frequency: 'weekly' },
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'rule-5',
    automation_rule_id: 'A-U1V2W3X4Y5',
    camp_id: 'camp-1',
    name: 'Weekend Special Events',
    target: 'events',
    alert_days_before: 1,
    alert_time: '18:00',
    alert_message: 'Morgen ist Wochenende! Besondere Events warten auf dich.',
    send_automatically: true,
    cutoff_enabled: false,
    recurring: true,
    recurrence_type: 'weekly',
    recurrence_payload: { days: ['SA', 'SO'], frequency: 'weekly' },
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

// Utility functions
const formatTime = (time: string): string => {
  return time
}

const getRecurrenceBadge = (rule: AutomationRule): string => {
  if (!rule.recurring || rule.recurrence_type === 'none') return 'One-time'

  switch (rule.recurrence_type) {
    case 'daily': return 'Daily'
    case 'weekly':
      if (rule.recurrence_payload?.days) {
        return `Weekly (${rule.recurrence_payload.days.join(', ')})`
      }
      return 'Weekly'
    case 'monthly': return 'Monthly'
    case 'custom': return 'Custom'
    default: return 'One-time'
  }
}

const getTargetLabel = (rule: AutomationRule): string => {
  switch (rule.target) {
    case 'meals':
      return `Meals${rule.meal_type ? ` - ${rule.meal_type.charAt(0).toUpperCase() + rule.meal_type.slice(1)}` : ''}`
    case 'events':
      return 'Events'
    case 'surf_lessons':
      return 'Surf Lessons'
    default:
      return rule.target
  }
}

export default function AlertManagementPage() {
  const [rules, setRules] = useState<AutomationRule[]>(mockAutomationRules)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null)
  const [expandedSections, setExpandedSections] = useState({
    meals: true,
    events: true,
    surf_lessons: true
  })

  // Group rules by target
  const groupedRules = {
    meals: rules.filter(rule => rule.target === 'meals'),
    events: rules.filter(rule => rule.target === 'events'),
    surf_lessons: rules.filter(rule => rule.target === 'surf_lessons')
  }

  const handleCreateRule = () => {
    setSelectedRule(null)
    setShowCreateModal(true)
  }

  const handleEditRule = (rule: AutomationRule) => {
    setSelectedRule(rule)
    setShowEditModal(true)
  }

  const handleViewRule = (rule: AutomationRule) => {
    setSelectedRule(rule)
    setShowViewModal(true)
  }

  const handleDeleteRule = (rule: AutomationRule) => {
    if (confirm(`Regel "${rule.name}" wirklich löschen? Alle geplanten Jobs werden entfernt.`)) {
      setRules(rules.filter(r => r.id !== rule.id))
      alert(`Regel "${rule.name}" wurde gelöscht`)
    }
  }

  const handleToggleActive = (rule: AutomationRule) => {
    const newActiveState = !rule.is_active
    setRules(rules.map(r =>
      r.id === rule.id ? { ...r, is_active: newActiveState, updated_at: new Date().toISOString() } : r
    ))
    alert(newActiveState ? 'Regel aktiviert' : 'Regel deaktiviert')
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const renderRuleCard = (rule: AutomationRule) => (
    <div
      key={rule.id}
      className={`bg-white border rounded-lg p-4 ${rule.is_active ? 'border-gray-200' : 'border-gray-300 bg-gray-50'}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className={`font-medium ${rule.is_active ? 'text-gray-900' : 'text-gray-500'}`}>
              {rule.name}
            </h3>
            <span className={`px-2 py-1 text-xs rounded-full ${
              rule.is_active
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {rule.is_active ? 'Active' : 'Inactive'}
            </span>
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
              {getRecurrenceBadge(rule)}
            </span>
          </div>

          <div className="text-sm text-gray-600 mb-2">
            <div><strong>Target:</strong> {getTargetLabel(rule)}</div>
            <div><strong>Alert:</strong> {rule.alert_days_before} days before at {formatTime(rule.alert_time)}</div>
            {rule.cutoff_enabled && (
              <div><strong>Cutoff:</strong> {rule.cutoff_days_before} days before at {formatTime(rule.cutoff_time!)}</div>
            )}
          </div>

          <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
            <strong>Message:</strong> {rule.alert_message}
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          {/* Active Toggle */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={rule.is_active}
              onChange={() => handleToggleActive(rule)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>

          {/* Action Buttons */}
          <button
            onClick={() => handleViewRule(rule)}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
            title="View Details"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleEditRule(rule)}
            className="p-2 text-gray-400 hover:text-yellow-600 transition-colors"
            title="Edit Rule"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteRule(rule)}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete Rule"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )

  const renderSection = (
    title: string,
    sectionKey: keyof typeof expandedSections,
    rules: AutomationRule[],
    description: string
  ) => (
    <div className="mb-6">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg border border-gray-200"
      >
        <div className="text-left">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            {rules.length} rules
          </span>
          <span className={`transform transition-transform ${expandedSections[sectionKey] ? 'rotate-180' : ''}`}>
            ↓
          </span>
        </div>
      </button>

      {expandedSections[sectionKey] && (
        <div className="mt-4 space-y-3">
          {rules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No automation rules for {title.toLowerCase()}</p>
              <button
                onClick={handleCreateRule}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                Create your first rule
              </button>
            </div>
          ) : (
            rules.map(renderRuleCard)
          )}
        </div>
      )}
    </div>
  )

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alert Management</h1>
          <p className="text-gray-600 mt-1">
            Manage automated notifications and cutoffs for meals, events, and surf lessons
          </p>
        </div>

        <button
          onClick={handleCreateRule}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Create Rule</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1">
        {/* Meal Automations */}
        {renderSection(
          'Meal Automations',
          'meals',
          groupedRules.meals,
          'Breakfast, lunch, and dinner notification rules'
        )}

        {/* Event Automations */}
        {renderSection(
          'Event Automations',
          'events',
          groupedRules.events,
          'Special events and activities notification rules'
        )}

        {/* Surf Lesson Automations */}
        {renderSection(
          'Surf Lesson Automations',
          'surf_lessons',
          groupedRules.surf_lessons,
          'Surf lesson and instruction notification rules'
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateRuleModal
          onClose={() => setShowCreateModal(false)}
          onSave={(ruleData) => {
            const newRule: AutomationRule = {
              id: Date.now().toString(),
              automation_rule_id: generateAutomationRuleId(),
              camp_id: 'camp-1',
              ...ruleData,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
            setRules([...rules, newRule])
            setShowCreateModal(false)
            alert(`Regel erstellt: ${newRule.automation_rule_id}`)
          }}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedRule && (
        <EditRuleModal
          rule={selectedRule}
          onClose={() => {
            setShowEditModal(false)
            setSelectedRule(null)
          }}
          onSave={(ruleData) => {
            setRules(rules.map(r =>
              r.id === selectedRule.id
                ? { ...r, ...ruleData, updated_at: new Date().toISOString() }
                : r
            ))
            setShowEditModal(false)
            setSelectedRule(null)
            alert('Regel aktualisiert')
          }}
        />
      )}

      {/* View Modal */}
      {showViewModal && selectedRule && (
        <ViewRuleModal
          rule={selectedRule}
          onClose={() => {
            setShowViewModal(false)
            setSelectedRule(null)
          }}
        />
      )}
    </div>
  )
}

// Create Rule Modal Component
interface CreateRuleModalProps {
  onClose: () => void
  onSave: (ruleData: Partial<AutomationRule>) => void
}

function CreateRuleModal({ onClose, onSave }: CreateRuleModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    target: 'meals' as const,
    meal_type: 'breakfast' as const,
    alert_days_before: 0,
    alert_time: '19:00',
    alert_message: '',
    send_automatically: true,
    cutoff_enabled: false,
    cutoff_days_before: 0,
    cutoff_time: '07:00',
    recurring: false,
    recurrence_type: 'none' as const
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      alert('Rule Name ist erforderlich')
      return
    }

    if (!formData.alert_message.trim()) {
      alert('Alert Message ist erforderlich')
      return
    }

    if (formData.target === 'meals' && !formData.meal_type) {
      alert('Meal Type ist für Meal-Regeln erforderlich')
      return
    }

    onSave({
      ...formData,
      meal_type: formData.target === 'meals' ? formData.meal_type : undefined,
      is_active: true
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Create Automation Rule</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rule Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Breakfast Daily Alert"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target *
                </label>
                <select
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value as any })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="meals">Meals</option>
                  <option value="events">Events</option>
                  <option value="surf_lessons">Surf Lessons</option>
                </select>
              </div>

              {formData.target === 'meals' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meal Type *
                  </label>
                  <select
                    value={formData.meal_type}
                    onChange={(e) => setFormData({ ...formData, meal_type: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Alert Configuration */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Alert Configuration</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Days Before Event
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.alert_days_before}
                  onChange={(e) => setFormData({ ...formData, alert_days_before: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alert Time
                </label>
                <input
                  type="time"
                  value={formData.alert_time}
                  onChange={(e) => setFormData({ ...formData, alert_time: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alert Message *
              </label>
              <textarea
                value={formData.alert_message}
                onChange={(e) => setFormData({ ...formData, alert_message: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Message to send to guests..."
                required
              />
            </div>

            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.send_automatically}
                  onChange={(e) => setFormData({ ...formData, send_automatically: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Send alert automatically</span>
              </label>
            </div>
          </div>

          {/* Cutoff Configuration */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cutoff Configuration</h3>

            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.cutoff_enabled}
                  onChange={(e) => setFormData({ ...formData, cutoff_enabled: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Enable cutoff</span>
              </label>
            </div>

            {formData.cutoff_enabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cutoff Days Before
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.cutoff_days_before}
                    onChange={(e) => setFormData({ ...formData, cutoff_days_before: parseInt(e.target.value) })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cutoff Time
                  </label>
                  <input
                    type="time"
                    value={formData.cutoff_time}
                    onChange={(e) => setFormData({ ...formData, cutoff_time: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Recurrence Configuration */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule</h3>

            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.recurring}
                  onChange={(e) => setFormData({
                    ...formData,
                    recurring: e.target.checked,
                    recurrence_type: e.target.checked ? 'daily' : 'none'
                  })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Recurring</span>
              </label>
            </div>

            {formData.recurring && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Repetition
                </label>
                <select
                  value={formData.recurrence_type}
                  onChange={(e) => setFormData({ ...formData, recurrence_type: e.target.value as any })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              ✕
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <span>💾</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Edit Rule Modal Component (simplified - similar to Create)
interface EditRuleModalProps {
  rule: AutomationRule
  onClose: () => void
  onSave: (ruleData: Partial<AutomationRule>) => void
}

function EditRuleModal({ rule, onClose, onSave }: EditRuleModalProps) {
  const [formData, setFormData] = useState({
    name: rule.name,
    target: rule.target,
    meal_type: rule.meal_type || 'breakfast',
    alert_days_before: rule.alert_days_before,
    alert_time: rule.alert_time,
    alert_message: rule.alert_message,
    send_automatically: rule.send_automatically,
    cutoff_enabled: rule.cutoff_enabled,
    cutoff_days_before: rule.cutoff_days_before || 0,
    cutoff_time: rule.cutoff_time || '07:00',
    recurring: rule.recurring,
    recurrence_type: rule.recurrence_type
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      alert('Rule Name ist erforderlich')
      return
    }

    if (!formData.alert_message.trim()) {
      alert('Alert Message ist erforderlich')
      return
    }

    onSave({
      ...formData,
      meal_type: formData.target === 'meals' ? formData.meal_type : undefined
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Edit Automation Rule</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form - Similar to Create Modal */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alert Message *</label>
            <textarea
              value={formData.alert_message}
              onChange={(e) => setFormData({ ...formData, alert_message: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alert Time</label>
              <input
                type="time"
                value={formData.alert_time}
                onChange={(e) => setFormData({ ...formData, alert_time: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {formData.cutoff_enabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cutoff Time</label>
                <input
                  type="time"
                  value={formData.cutoff_time}
                  onChange={(e) => setFormData({ ...formData, cutoff_time: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              ✕
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              💾
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// View Rule Modal Component
interface ViewRuleModalProps {
  rule: AutomationRule
  onClose: () => void
}

function ViewRuleModal({ rule, onClose }: ViewRuleModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Rule Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="font-medium text-gray-900">{rule.name}</h3>
            <p className="text-sm text-gray-600">ID: {rule.automation_rule_id}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Target:</span>
              <span className="ml-2">{getTargetLabel(rule)}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Status:</span>
              <span className={`ml-2 ${rule.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                {rule.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Alert Time:</span>
              <span className="ml-2">{formatTime(rule.alert_time)}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Recurrence:</span>
              <span className="ml-2">{getRecurrenceBadge(rule)}</span>
            </div>
          </div>

          <div>
            <span className="font-medium text-gray-700">Message:</span>
            <div className="mt-1 p-3 bg-gray-50 rounded text-sm">
              {rule.alert_message}
            </div>
          </div>

          {rule.cutoff_enabled && (
            <div>
              <span className="font-medium text-gray-700">Cutoff:</span>
              <div className="mt-1 text-sm text-gray-600">
                {rule.cutoff_days_before} days before at {formatTime(rule.cutoff_time!)}
              </div>
            </div>
          )}

          <div className="bg-blue-50 p-3 rounded">
            <span className="font-medium text-blue-800">Next Execution:</span>
            <div className="text-sm text-blue-700 mt-1">
              Today at {formatTime(rule.alert_time)} (estimated)
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}