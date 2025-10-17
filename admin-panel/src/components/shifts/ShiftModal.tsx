'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon, ClockIcon, UserIcon, CalendarIcon } from '@heroicons/react/24/outline'

interface StaffMember {
  id: string
  staff_id: string
  name: string
  role: string
  labels: string[]
  roles: string[]
  is_active: boolean
  camp_id: string
  color: string
}

interface Shift {
  id: string
  shift_id: string
  camp_id: string
  staff_id: string
  role_label: string
  start_at: string
  end_at: string
  color: string
  recurrence_rule: string | null
  recurrence_parent_id: string | null
  notes: string | null
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

interface ShiftModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (shiftData: Omit<Shift, 'id' | 'shift_id' | 'camp_id' | 'created_at' | 'updated_at' | 'created_by' | 'is_active'>, id?: string) => Promise<boolean>
  onDelete?: (id: string) => Promise<boolean>
  initialData?: Shift | null
  isEditing?: boolean
  staffMembers: StaffMember[]
}

export default function ShiftModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  isEditing = false,
  staffMembers
}: ShiftModalProps) {
  const [formData, setFormData] = useState({
    staff_id: '',
    role_label: '',
    start_at: '',
    end_at: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [draggedRole, setDraggedRole] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      if (initialData && isEditing) {
        setFormData({
          staff_id: initialData.staff_id,
          role_label: initialData.role_label,
          start_at: new Date(initialData.start_at).toISOString().slice(0, 16),
          end_at: new Date(initialData.end_at).toISOString().slice(0, 16),
          notes: initialData.notes || ''
        })
      } else {
        // Reset form for new shift
        const now = new Date()
        const startTime = new Date(now.getTime() + 60 * 60 * 1000) // 1 hour from now
        const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000) // 2 hours from now
        
        setFormData({
          staff_id: '',
          role_label: '',
          start_at: startTime.toISOString().slice(0, 16),
          end_at: endTime.toISOString().slice(0, 16),
          notes: ''
        })
      }
      setErrors({})
    }
  }, [isOpen, initialData, isEditing])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.staff_id) {
      newErrors.staff_id = 'Staff member is required'
    }

    if (!formData.role_label) {
      newErrors.role_label = 'Role is required'
    }

    if (!formData.start_at) {
      newErrors.start_at = 'Start time is required'
    }

    if (!formData.end_at) {
      newErrors.end_at = 'End time is required'
    }

    if (formData.start_at && formData.end_at) {
      const start = new Date(formData.start_at)
      const end = new Date(formData.end_at)
      
      if (start >= end) {
        newErrors.end_at = 'End time must be after start time'
      }

      // Check if shift spans across midnight
      const startDate = start.toDateString()
      const endDate = end.toDateString()
      if (startDate !== endDate) {
        newErrors.end_at = 'Shifts cannot span across midnight'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const shiftData = {
        staff_id: formData.staff_id,
        role_label: formData.role_label,
        start_at: new Date(formData.start_at).toISOString(),
        end_at: new Date(formData.end_at).toISOString(),
        notes: formData.notes,
        color: getStaffColor(formData.staff_id)
      }

      const success = await onSave(shiftData, initialData?.id)
      if (success) {
        onClose()
      }
    } catch (error) {
      console.error('Error saving shift:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!initialData || !onDelete) return

    if (confirm('Are you sure you want to delete this shift?')) {
      setLoading(true)
      try {
        const success = await onDelete(initialData.id)
        if (success) {
          onClose()
        }
      } catch (error) {
        console.error('Error deleting shift:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleStaffChange = (staffId: string) => {
    const staff = staffMembers.find(s => s.id === staffId)
    setFormData(prev => ({
      ...prev,
      staff_id: staffId,
      role_label: staff?.role || ''
    }))
  }

  const getStaffName = (staffId: string) => {
    const staff = staffMembers.find(s => s.id === staffId)
    return staff ? staff.name : 'Unknown Staff'
  }

  const getStaffNumber = (staffId: string) => {
    const staff = staffMembers.find(s => s.id === staffId)
    return staff ? staff.staff_id : 'Unknown'
  }

  const getStaffColor = (staffId: string) => {
    const staff = staffMembers.find(s => s.id === staffId)
    return staff ? staff.color : '#6B7280'
  }

  const handleDragStart = (e: React.DragEvent, role: string) => {
    setDraggedRole(role)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (draggedRole) {
      setFormData(prev => ({
        ...prev,
        role_label: draggedRole
      }))
      setDraggedRole(null)
    }
  }

  const availableRoles = [
    'host', 'teacher', 'instructor', 'kitchen', 'maintenance', 'admin', 'manager', 'reception', 'cleaning', 'security'
  ]

  const getRoleColor = (role: string) => {
    const colors: { [key: string]: string } = {
      host: '#3B82F6',
      teacher: '#10B981',
      instructor: '#F59E0B',
      kitchen: '#EF4444',
      maintenance: '#8B5CF6',
      admin: '#6B7280',
      manager: '#1F2937',
      reception: '#06B6D4',
      cleaning: '#84CC16',
      security: '#F97316'
    }
    return colors[role] || '#6B7280'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
              <ClockIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
              <h3 className="text-base font-semibold leading-6 text-gray-900">
                {isEditing ? 'Edit Shift' : 'Create New Shift'}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  {isEditing ? 'Update shift details below.' : 'Fill in the details to create a new shift.'}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 sm:mt-6">
            <div className="space-y-4">
              {/* Staff Selection */}
              <div>
                <label htmlFor="staff_id" className="block text-sm font-medium text-gray-700">
                  Staff Member *
                </label>
                <select
                  id="staff_id"
                  value={formData.staff_id}
                  onChange={(e) => handleStaffChange(e.target.value)}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.staff_id ? 'border-red-300' : ''
                  }`}
                >
                  <option value="">Select a staff member</option>
                  {staffMembers.filter(staff => staff.is_active).map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.staff_id} - {staff.name} ({staff.role})
                    </option>
                  ))}
                </select>
                {formData.staff_id && (
                  <div className="mt-2 p-2 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-800">
                      <strong>Staff Number:</strong> {getStaffNumber(formData.staff_id)}
                    </p>
                    <p className="text-sm text-blue-800">
                      <strong>Name:</strong> {getStaffName(formData.staff_id)}
                    </p>
                  </div>
                )}
                {errors.staff_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.staff_id}</p>
                )}
              </div>

              {/* Role Selection with Drag & Drop */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role * - Drag a role to assign it
                </label>
                
                {/* Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={`min-h-[60px] p-3 border-2 border-dashed rounded-lg transition-colors ${
                    formData.role_label 
                      ? 'border-green-300 bg-green-50' 
                      : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                  }`}
                >
                  {formData.role_label ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: getRoleColor(formData.role_label) }}
                        ></div>
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {formData.role_label}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, role_label: '' }))}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center">
                      Drop a role here or click to select
                    </p>
                  )}
                </div>

                {/* Available Roles */}
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-2">Available roles:</p>
                  <div className="flex flex-wrap gap-2">
                    {availableRoles.map((role) => (
                      <div
                        key={role}
                        draggable
                        onDragStart={(e) => handleDragStart(e, role)}
                        onClick={() => setFormData(prev => ({ ...prev, role_label: role }))}
                        className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all hover:scale-105 ${
                          formData.role_label === role
                            ? 'bg-gray-800 text-white'
                            : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                        style={{
                          backgroundColor: formData.role_label === role ? getRoleColor(role) : undefined,
                          color: formData.role_label === role ? 'white' : undefined
                        }}
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: getRoleColor(role) }}
                        ></div>
                        <span className="capitalize">{role}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {errors.role_label && (
                  <p className="mt-1 text-sm text-red-600">{errors.role_label}</p>
                )}
              </div>

              {/* Start Time */}
              <div>
                <label htmlFor="start_at" className="block text-sm font-medium text-gray-700">
                  Start Time *
                </label>
                <input
                  type="datetime-local"
                  id="start_at"
                  value={formData.start_at}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_at: e.target.value }))}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.start_at ? 'border-red-300' : ''
                  }`}
                />
                {errors.start_at && (
                  <p className="mt-1 text-sm text-red-600">{errors.start_at}</p>
                )}
              </div>

              {/* End Time */}
              <div>
                <label htmlFor="end_at" className="block text-sm font-medium text-gray-700">
                  End Time *
                </label>
                <input
                  type="datetime-local"
                  id="end_at"
                  value={formData.end_at}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_at: e.target.value }))}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.end_at ? 'border-red-300' : ''
                  }`}
                />
                {errors.end_at && (
                  <p className="mt-1 text-sm text-red-600">{errors.end_at}</p>
                )}
              </div>

              {/* Staff Color Preview */}
              {formData.staff_id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Shift Color
                  </label>
                  <div className="mt-1 flex items-center space-x-3">
                    <div
                      className="h-10 w-16 rounded border border-gray-300"
                      style={{ backgroundColor: getStaffColor(formData.staff_id) }}
                    ></div>
                    <span className="text-sm text-gray-500">
                      Automatically assigned based on staff member
                    </span>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Optional notes about this shift..."
                />
              </div>
            </div>

            <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 sm:col-start-2"
              >
                {loading ? 'Saving...' : (isEditing ? 'Update Shift' : 'Create Shift')}
              </button>
              <button
                type="button"
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                onClick={onClose}
              >
                Cancel
              </button>
              {isEditing && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50 sm:col-start-1 sm:mt-0"
                >
                  {loading ? 'Deleting...' : 'Delete Shift'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
