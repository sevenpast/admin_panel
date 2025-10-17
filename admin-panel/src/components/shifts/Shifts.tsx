'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  UserIcon,
  DocumentArrowDownIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { databaseService, Staff as DbStaff } from '@/lib/database-service'

// Use database service interface
type Staff = DbStaff

// Shift interfaces
interface Shift {
  id: string
  shift_id: string
  staff_id: string
  role_label: string
  start_at: string
  end_at: string
  color?: string
  notes?: string
  is_active: boolean
  staff?: Staff
}

interface RecurrenceSettings {
  frequency: 'none' | 'daily' | 'weekly' | 'monthly'
  interval: number
  maxOccurrences: number
  endDate?: string
  selectedDays?: number[]
  dayOfMonth?: number
}

interface ShiftsProps {
  selectedDate: string
  onDateChange: (date: string) => void
}

const roleLabels = {
  host: 'Host',
  teacher: 'Teacher', 
  instructor: 'Instructor',
  kitchen: 'Kitchen',
  maintenance: 'Maintenance',
  admin: 'Admin',
  manager: 'Manager'
}

const roleColors = {
  host: '#3B82F6',
  teacher: '#10B981',
  instructor: '#F59E0B',
  kitchen: '#EF4444',
  maintenance: '#8B5CF6',
  admin: '#6B7280',
  manager: '#1F2937'
}

export default function ShiftsComponent({ selectedDate, onDateChange }: ShiftsProps) {
  // Modal states
  const { success, error } = useToastContext()
  const [isShiftModalOpen, setisShiftModalOpen] = useState(false)
  const [isRecurrenceModalOpen, setIsRecurrenceModalOpen] = useState(false)

  // Selected items
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null)
  const [editingShift, setEditingShift] = useState<Partial<Shift>>({})
  const [isEditMode, setIsEditMode] = useState(false)

  // Data states
  const [shifts, setShifts] = useState<Shift[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)

  // Recurrence state
  const [recurrenceSettings, setRecurrenceSettings] = useState<RecurrenceSettings>({
    frequency: 'none',
    interval: 1,
    maxOccurrences: 0,
    selectedDays: []
  })

  // Load data from database
  useEffect(() => {
    loadData()
  }, [])

  // Load shifts when date changes
  useEffect(() => {
    if (!loading) {
      loadShiftsForDate(selectedDate)
    }
  }, [selectedDate])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load staff
      const staffResponse = await fetch('/api/staff').catch(() => null)
      if (staffResponse?.ok) {
        const staffData = await staffResponse.json()
        setStaff(staffData.data || staffData || [])
      }

      // Load shifts for selected date
      await loadShiftsForDate(selectedDate)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadShiftsForDate = async (date: string) => {
    try {
      const response = await fetch(`/api/shifts?date=${date}`).catch(() => null)
      if (response?.ok) {
        const shiftsData = await response.json()
        setShifts(shiftsData.data || shiftsData || [])
      }
    } catch (err) {
      console.error('Error:', err)
    }
  }

  // Shift management functions
  const handleCreateShift = () => {
    setEditingShift({
      staff_id: '',
      role_label: 'instructor',
      start_at: '09:00',
      end_at: '17:00',
      notes: '',
      is_active: true
    })
    setIsEditMode(false)
    setIsShiftModalOpen(true)
  }

  const handleEditShift = (shift: Shift) => {
    setEditingShift(shift)
    setIsEditMode(true)
    setIsShiftModalOpen(true)
  }

  const handleSaveShift = async () => {
    try {
      if (!editingShift.staff_id || !editingShift.start_at || !editingShift.end_at) {
        error('Please fill in all required fields')
        return
      }

      const shiftData = {
        staff_id: editingShift.staff_id,
        role_label: editingShift.role_label || 'instructor',
        start_at: editingShift.start_at,
        end_at: editingShift.end_at,
        notes: editingShift.notes || null,
        is_active: editingShift.is_active !== false,
        shift_date: selectedDate
      }

      if (isEditMode && editingShift.id) {
        const response = await fetch('/api/shifts', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: editingShift.id,
            ...shiftData
          })
        }).catch(() => null)

        if (response?.ok) {
          success('Shift updated successfully!')
          loadShiftsForDate(selectedDate)
        } else if (response) {
          const error = await response.json()
          error(`Error: ${err.error}`)
        }
      } else {
        const response = await fetch('/api/shifts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(shiftData)
        }).catch(() => null)

        if (response?.ok) {
          success('Shift created successfully!')
          loadShiftsForDate(selectedDate)
        } else if (response) {
          const error = await response.json()
          const errorMessage = error.error?.message || error.error || error.message || 'Unknown error'
          error(`Error creating shift: ${errorMessage}`)
        }
      }
    } catch (err) {
      console.error('Error:', err)
      error('Error saving shift')
    }

    setIsShiftModalOpen(false)
    setEditingShift({})
    setIsEditMode(false)
  }

  const handleDeleteShift = async (shiftId: string) => {
    if (confirm('Are you sure you want to delete this shift?')) {
      try {
        const response = await fetch(`/api/shifts?id=${shiftId}`, {
          method: 'DELETE'
        }).catch(() => null)

        if (response?.ok) {
          success('Shift deleted successfully!')
          loadShiftsForDate(selectedDate)
        } else if (response) {
          const error = await response.json()
          const errorMessage = error.error?.message || error.error || error.message || 'Unknown error'
          error(`Error deleting shift: ${errorMessage}`)
        }
      } catch (err) {
        console.error('Error:', err)
        error('Error deleting shift')
      }
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

  const goToToday = () => {
    onDateChange(new Date().toISOString().split('T')[0])
  }

  // Get shifts grouped by hour
  const shiftsByHour = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => i)
    const grouped: { [hour: number]: Shift[] } = {}
    
    hours.forEach(hour => {
      grouped[hour] = (Array.isArray(shifts) ? shifts : []).filter(shift => {
        const startHour = parseInt(shift.start_at.split(':')[0])
        const endHour = parseInt(shift.end_at.split(':')[0])
        return hour >= startHour && hour < endHour
      })
    })
    
    return grouped
  }, [shifts])

  const getRoleColor = (role: string) => {
    return roleColors[role as keyof typeof roleColors] || '#6B7280'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Shift Management</h2>
          <p className="text-gray-600">Manage staff shifts and schedules</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
            <ClockIcon className="h-4 w-4" />
            <span className="text-sm font-medium">{(shifts || []).length}</span>
          </div>
          <button
            onClick={handleCreateShift}
            className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <PlusIcon className="h-5 w-5" />
          </button>
        </div>
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

      {/* Shift Schedule */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Shift Schedule</h3>
          <p className="text-sm text-gray-600">Staff shifts for {new Date(selectedDate).toLocaleDateString('de-DE')}</p>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="text-lg">Loading shifts...</div>
          </div>
        ) : (shifts || []).length === 0 ? (
          <div className="p-6 text-center">
            <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No shifts scheduled</h3>
            <p className="text-gray-500 mb-4">
              No shifts are scheduled for {new Date(selectedDate).toLocaleDateString('de-DE')}.
            </p>
            <button
              onClick={handleCreateShift}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Add First Shift
            </button>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-24 gap-1">
              {/* Hour labels */}
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} className="text-xs text-gray-500 text-center py-2">
                  {i.toString().padStart(2, '0')}:00
                </div>
              ))}
              
              {/* Shift bars */}
              {(Array.isArray(shifts) ? shifts : []).map((shift) => {
                const startHour = parseInt(shift.start_at.split(':')[0])
                const startMinute = parseInt(shift.start_at.split(':')[1])
                const endHour = parseInt(shift.end_at.split(':')[0])
                const endMinute = parseInt(shift.end_at.split(':')[1])
                
                const startPosition = startHour + (startMinute / 60)
                const duration = (endHour + (endMinute / 60)) - startPosition
                
                return (
                  <div
                    key={shift.id}
                    className="relative"
                    style={{
                      gridColumn: `${Math.floor(startPosition * 2) + 1} / span ${Math.floor(duration * 2)}`,
                      gridRow: '2'
                    }}
                  >
                    <div
                      className="absolute inset-0 rounded-md p-2 text-white text-xs font-medium flex items-center justify-between cursor-pointer hover:opacity-80"
                      style={{ backgroundColor: getRoleColor(shift.role_label) }}
                      onClick={() => handleEditShift(shift)}
                    >
                      <div className="truncate">
                        <div className="font-semibold">{shift.staff?.name || 'Unknown'}</div>
                        <div className="text-xs opacity-90">{roleLabels[shift.role_label as keyof typeof roleLabels] || shift.role_label}</div>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditShift(shift)
                          }}
                          className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                          title="Edit Shift"
                        >
                          <PencilIcon className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteShift(shift.id)
                          }}
                          className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                          title="Delete Shift"
                        >
                          <TrashIcon className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Shift Modal */}
      {isShiftModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {isEditMode ? 'Edit Shift' : 'Create Shift'}
              </h3>
              <button
                onClick={() => {
                  setIsShiftModalOpen(false)
                  setEditingShift({})
                  setIsEditMode(false)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Staff Member *</label>
                <select
                  value={editingShift.staff_id || ''}
                  onChange={(e) => setEditingShift({...editingShift, staff_id: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select staff member</option>
                  {(staff || []).filter(s => s.is_active).map((staffMember) => (
                    <option key={staffMember.id} value={staffMember.id}>
                      {staffMember.name} ({staffMember.role})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select
                  value={editingShift.role_label || 'instructor'}
                  onChange={(e) => setEditingShift({...editingShift, role_label: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  {Object.entries(roleLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                  <input
                    type="time"
                    value={editingShift.start_at || ''}
                    onChange={(e) => setEditingShift({...editingShift, start_at: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
                  <input
                    type="time"
                    value={editingShift.end_at || ''}
                    onChange={(e) => setEditingShift({...editingShift, end_at: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={editingShift.notes || ''}
                  onChange={(e) => setEditingShift({...editingShift, notes: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                  placeholder="Add any notes about this shift..."
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editingShift.is_active !== false}
                  onChange={(e) => setEditingShift({...editingShift, is_active: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                  Active (shift is scheduled and active)
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setIsShiftModalOpen(false)
                  setEditingShift({})
                  setIsEditMode(false)
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveShift}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {isEditMode ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
