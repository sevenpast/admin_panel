'use client'

import { useState, useEffect } from 'react'
import { PlusIcon, CalendarIcon, ArrowLeftIcon, ArrowRightIcon, HomeIcon } from '@heroicons/react/24/outline'

// Shift interfaces based on database schema
interface Staff {
  id: string
  staff_id: string
  name: string
  labels: string[]
  is_active: boolean
  mobile_number?: string
  image_url?: string
  color?: string
}

interface Shift {
  id: string
  shift_id: string
  camp_id: string
  staff_id: string
  staff_name: string
  role_label: 'host' | 'teacher' | 'instructor' | 'kitchen' | 'maintenance' | 'other'
  start_at: string
  end_at: string
  color?: string
  recurrence_rule?: string
  recurrence_parent_id?: string
  notes?: string
  is_active: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

// Mock data for staff
const mockStaff: Staff[] = [
  {
    id: '1',
    staff_id: 'S-A1B2C3D4E5',
    name: 'Max Mustermann',
    labels: ['instructor', 'host'],
    is_active: true,
    mobile_number: '+49123456789',
    color: '#22C55E'
  },
  {
    id: '2',
    staff_id: 'S-F6G7H8I9J0',
    name: 'Anna Schmidt',
    labels: ['kitchen', 'other'],
    is_active: true,
    mobile_number: '+49987654321',
    color: '#3B82F6'
  },
  {
    id: '3',
    staff_id: 'S-K1L2M3N4O5',
    name: 'Tom Wilson',
    labels: ['teacher', 'instructor'],
    is_active: true,
    mobile_number: '+49555123456',
    color: '#8B5CF6'
  },
  {
    id: '4',
    staff_id: 'S-P6Q7R8S9T0',
    name: 'Lisa Mueller',
    labels: ['maintenance', 'other'],
    is_active: false,
    mobile_number: '+49444987654',
    color: '#EF4444'
  }
]

// Generate shift ID function (H-XXXXXXXXXX)
const generateShiftId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'H-'
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Mock shifts data
const mockShifts: Shift[] = [
  {
    id: '1',
    shift_id: 'H-A1B2C3D4E5',
    camp_id: 'camp-1',
    staff_id: '1',
    staff_name: 'Max Mustermann',
    role_label: 'host',
    start_at: new Date(new Date().setHours(8, 0, 0, 0)).toISOString(),
    end_at: new Date(new Date().setHours(12, 0, 0, 0)).toISOString(),
    color: '#22C55E',
    notes: 'Morning reception and guest check-ins',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    shift_id: 'H-F6G7H8I9J0',
    camp_id: 'camp-1',
    staff_id: '1',
    staff_name: 'Max Mustermann',
    role_label: 'instructor',
    start_at: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
    end_at: new Date(new Date().setHours(18, 0, 0, 0)).toISOString(),
    color: '#22C55E',
    notes: 'Afternoon surf lesson instruction',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

// Utility functions
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

const getWeekDateRange = (date: Date): { start: Date; end: Date } => {
  const start = new Date(date)
  const day = start.getDay()
  const diff = start.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  start.setDate(diff)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

const getWeekDays = (startDate: Date): Date[] => {
  const days = []
  for (let i = 0; i < 7; i++) {
    const day = new Date(startDate)
    day.setDate(startDate.getDate() + i)
    days.push(day)
  }
  return days
}

const getCurrentTimePosition = (): number => {
  const now = new Date()
  const hours = now.getHours()
  const minutes = now.getMinutes()
  return (hours * 60 + minutes) / (24 * 60) * 100
}

export default function ShiftsPage() {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [shifts, setShifts] = useState<Shift[]>(mockShifts)
  const [staff, setStaff] = useState<Staff[]>(mockStaff.filter(s => s.is_active))
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [nowLinePosition, setNowLinePosition] = useState(getCurrentTimePosition())

  // Update now line position every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setNowLinePosition(getCurrentTimePosition())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  const weekRange = getWeekDateRange(currentWeek)
  const weekDays = getWeekDays(weekRange.start)

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentWeek(newWeek)
  }

  const goToToday = () => {
    setCurrentWeek(new Date())
  }

  const goToNow = () => {
    setCurrentWeek(new Date())
    // Scroll to current time if needed
  }

  const handleCreateShift = () => {
    setShowCreateModal(true)
  }

  const handleEditShift = (shift: Shift) => {
    setSelectedShift(shift)
    setShowEditModal(true)
  }

  const getShiftsForDay = (day: Date): Shift[] => {
    return shifts.filter(shift => {
      const shiftDate = new Date(shift.start_at)
      return shiftDate.toDateString() === day.toDateString()
    })
  }

  const getShiftPosition = (shift: Shift): { top: number; height: number } => {
    const startTime = new Date(shift.start_at)
    const endTime = new Date(shift.end_at)

    const startMinutes = startTime.getHours() * 60 + startTime.getMinutes()
    const endMinutes = endTime.getHours() * 60 + endTime.getMinutes()
    const duration = endMinutes - startMinutes

    const top = (startMinutes / (24 * 60)) * 100
    const height = (duration / (24 * 60)) * 100

    return { top, height }
  }

  const renderTimeGrid = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i)

    return (
      <div className="relative">
        {hours.map(hour => (
          <div
            key={hour}
            className="border-t border-gray-200 h-16 flex items-start"
          >
            <div className="w-16 text-xs text-gray-500 px-2 pt-1">
              {hour.toString().padStart(2, '0')}:00
            </div>
          </div>
        ))}

        {/* Now line */}
        <div
          className="absolute left-0 right-0 border-t-2 border-red-500 z-10"
          style={{ top: `${nowLinePosition}%` }}
        >
          <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-r-md">
            {formatTime(new Date())}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shifts</h1>
          <p className="text-gray-600 mt-1">
            {formatDate(weekRange.start)} - {formatDate(weekRange.end)}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Week Navigation */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>

            <button
              onClick={goToToday}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              Today
            </button>

            <button
              onClick={goToNow}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              Now
            </button>

            <button
              onClick={() => navigateWeek('next')}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ArrowRightIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Create Shift Button */}
          <button
            onClick={handleCreateShift}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Create Shift</span>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="flex">
          {/* Time column */}
          <div className="w-16 border-r border-gray-200 bg-gray-50">
            <div className="h-12 border-b border-gray-200"></div>
            {renderTimeGrid()}
          </div>

          {/* Days columns */}
          <div className="flex-1 grid grid-cols-7">
            {weekDays.map((day, dayIndex) => (
              <div key={dayIndex} className="border-r border-gray-200 last:border-r-0">
                {/* Day header */}
                <div className="h-12 border-b border-gray-200 bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">
                      {day.toLocaleDateString('de-DE', { weekday: 'short' })}
                    </div>
                    <div className={`text-lg font-medium ${
                      day.toDateString() === new Date().toDateString()
                        ? 'text-blue-600'
                        : 'text-gray-900'
                    }`}>
                      {day.getDate()}
                    </div>
                  </div>
                </div>

                {/* Day content */}
                <div className="relative" style={{ height: '1536px' }}> {/* 24 hours * 64px */}
                  {/* Hour lines */}
                  {Array.from({ length: 24 }, (_, i) => (
                    <div
                      key={i}
                      className="absolute left-0 right-0 border-t border-gray-100"
                      style={{ top: `${(i / 24) * 100}%` }}
                    />
                  ))}

                  {/* Shifts */}
                  {getShiftsForDay(day).map((shift, shiftIndex) => {
                    const position = getShiftPosition(shift)
                    const staffMember = staff.find(s => s.id === shift.staff_id)

                    return (
                      <div
                        key={shift.id}
                        className="absolute left-1 right-1 bg-white border-l-4 rounded-md shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                        style={{
                          top: `${position.top}%`,
                          height: `${position.height}%`,
                          borderLeftColor: shift.color || staffMember?.color || '#6B7280',
                          minHeight: '40px'
                        }}
                        onClick={() => handleEditShift(shift)}
                      >
                        <div className="p-2">
                          <div className="font-medium text-sm text-gray-900 truncate">
                            {shift.staff_name}
                          </div>
                          <div className="text-xs text-gray-600 capitalize">
                            {shift.role_label}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatTime(new Date(shift.start_at))} - {formatTime(new Date(shift.end_at))}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Shift Modal */}
      {showCreateModal && (
        <CreateShiftModal
          staff={staff}
          onClose={() => setShowCreateModal(false)}
          onSave={(shiftData) => {
            const newShift: Shift = {
              id: Date.now().toString(),
              shift_id: generateShiftId(),
              camp_id: 'camp-1',
              staff_id: shiftData.staff_id,
              staff_name: staff.find(s => s.id === shiftData.staff_id)?.name || '',
              role_label: shiftData.role_label,
              start_at: shiftData.start_at,
              end_at: shiftData.end_at,
              color: shiftData.color,
              notes: shiftData.notes,
              recurrence_rule: shiftData.recurrence_rule,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }

            // Add all shift instances if recurrence is set
            const newShifts = [newShift]
            if (shiftData.recurrence_rule && shiftData.recurrence_rule !== 'none') {
              // Generate recurrence instances (simplified)
              // In real implementation, this would parse RFC-5545 style rules
              const recurringShifts = generateRecurringShifts(newShift, shiftData.recurrence_rule, shiftData.recurrence_count || 1)
              newShifts.push(...recurringShifts)
            }

            setShifts([...shifts, ...newShifts])
            setShowCreateModal(false)
            alert(`Shift erstellt: ${newShift.shift_id}`)
          }}
        />
      )}

      {/* Edit Shift Modal */}
      {showEditModal && selectedShift && (
        <EditShiftModal
          shift={selectedShift}
          staff={staff}
          onClose={() => {
            setShowEditModal(false)
            setSelectedShift(null)
          }}
          onSave={(shiftData) => {
            setShifts(shifts.map(s =>
              s.id === selectedShift.id
                ? { ...s, ...shiftData, updated_at: new Date().toISOString() }
                : s
            ))
            setShowEditModal(false)
            setSelectedShift(null)
            alert('Shift aktualisiert')
          }}
          onDelete={(deleteScope) => {
            // Handle delete based on scope
            let shiftsToDelete = [selectedShift.id]

            if (selectedShift.recurrence_parent_id) {
              if (deleteScope === 'following') {
                shiftsToDelete = shifts.filter(s =>
                  s.recurrence_parent_id === selectedShift.recurrence_parent_id &&
                  new Date(s.start_at) >= new Date(selectedShift.start_at)
                ).map(s => s.id)
              } else if (deleteScope === 'series') {
                shiftsToDelete = shifts.filter(s =>
                  s.recurrence_parent_id === selectedShift.recurrence_parent_id ||
                  s.id === selectedShift.recurrence_parent_id
                ).map(s => s.id)
              }
            }

            setShifts(shifts.filter(s => !shiftsToDelete.includes(s.id)))
            setShowEditModal(false)
            setSelectedShift(null)
            alert('Shift gelöscht')
          }}
        />
      )}
    </div>
  )
}

// Helper function to generate recurring shifts (simplified)
function generateRecurringShifts(parentShift: Shift, recurrenceRule: string, count: number): Shift[] {
  const recurringShifts: Shift[] = []

  // Simple weekly recurrence example
  if (recurrenceRule === 'weekly') {
    for (let i = 1; i < count; i++) {
      const newStart = new Date(parentShift.start_at)
      newStart.setDate(newStart.getDate() + (7 * i))

      const newEnd = new Date(parentShift.end_at)
      newEnd.setDate(newEnd.getDate() + (7 * i))

      recurringShifts.push({
        ...parentShift,
        id: `${parentShift.id}-${i}`,
        shift_id: generateShiftId(),
        start_at: newStart.toISOString(),
        end_at: newEnd.toISOString(),
        recurrence_parent_id: parentShift.id,
        recurrence_rule: undefined
      })
    }
  }

  return recurringShifts
}

// Create Shift Modal Component
interface CreateShiftModalProps {
  staff: Staff[]
  onClose: () => void
  onSave: (shiftData: any) => void
}

function CreateShiftModal({ staff, onClose, onSave }: CreateShiftModalProps) {
  const [formData, setFormData] = useState({
    staff_id: '',
    role_label: 'other' as const,
    date: new Date().toISOString().split('T')[0],
    start_time: '09:00',
    end_time: '17:00',
    color: '',
    notes: '',
    recurrence_rule: 'none',
    recurrence_count: 1
  })

  const selectedStaff = staff.find(s => s.id === formData.staff_id)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.staff_id) {
      alert('Staff Member ist erforderlich')
      return
    }

    // Validate role against staff labels
    if (selectedStaff && !selectedStaff.labels.includes(formData.role_label)) {
      if (!confirm(`Hinweis: Staff hat das Label "${formData.role_label}" nicht. Trotzdem zuweisen?`)) {
        return
      }
    }

    const startDateTime = new Date(`${formData.date}T${formData.start_time}`)
    const endDateTime = new Date(`${formData.date}T${formData.end_time}`)

    if (endDateTime <= startDateTime) {
      alert('End-Zeit muss nach Start-Zeit liegen')
      return
    }

    // Check for conflicts
    // This would be implemented with proper conflict detection logic

    onSave({
      ...formData,
      start_at: startDateTime.toISOString(),
      end_at: endDateTime.toISOString(),
      color: formData.color || selectedStaff?.color
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Create Shift</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Staff Member */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Staff Member *
            </label>
            <select
              value={formData.staff_id}
              onChange={(e) => setFormData({ ...formData, staff_id: e.target.value, role_label: 'other' })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Staff Member</option>
              {staff.map(member => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.staff_id})
                </option>
              ))}
            </select>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role *
            </label>
            <select
              value={formData.role_label}
              onChange={(e) => setFormData({ ...formData, role_label: e.target.value as any })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="other">Other</option>
              {selectedStaff?.labels.map(label => (
                <option key={label} value={label}>
                  {label.charAt(0).toUpperCase() + label.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time *
              </label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time *
              </label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Recurrence */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frequency
            </label>
            <select
              value={formData.recurrence_rule}
              onChange={(e) => setFormData({ ...formData, recurrence_rule: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="none">None</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          {formData.recurrence_rule !== 'none' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Count
              </label>
              <input
                type="number"
                min="1"
                max="52"
                value={formData.recurrence_count}
                onChange={(e) => setFormData({ ...formData, recurrence_count: parseInt(e.target.value) })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Optional notes..."
            />
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

// Edit Shift Modal Component
interface EditShiftModalProps {
  shift: Shift
  staff: Staff[]
  onClose: () => void
  onSave: (shiftData: any) => void
  onDelete: (deleteScope: 'single' | 'following' | 'series') => void
}

function EditShiftModal({ shift, staff, onClose, onSave, onDelete }: EditShiftModalProps) {
  const [formData, setFormData] = useState({
    staff_id: shift.staff_id,
    role_label: shift.role_label,
    date: shift.start_at.split('T')[0],
    start_time: new Date(shift.start_at).toTimeString().slice(0, 5),
    end_time: new Date(shift.end_at).toTimeString().slice(0, 5),
    color: shift.color || '',
    notes: shift.notes || ''
  })

  const [deleteScope, setDeleteScope] = useState<'single' | 'following' | 'series'>('single')
  const selectedStaff = staff.find(s => s.id === formData.staff_id)
  const isRecurringSeries = !!shift.recurrence_parent_id

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.staff_id) {
      alert('Staff Member ist erforderlich')
      return
    }

    const startDateTime = new Date(`${formData.date}T${formData.start_time}`)
    const endDateTime = new Date(`${formData.date}T${formData.end_time}`)

    if (endDateTime <= startDateTime) {
      alert('End-Zeit muss nach Start-Zeit liegen')
      return
    }

    onSave({
      ...formData,
      start_at: startDateTime.toISOString(),
      end_at: endDateTime.toISOString(),
      color: formData.color || selectedStaff?.color
    })
  }

  const handleDelete = () => {
    if (confirm('Shift wirklich löschen?')) {
      onDelete(deleteScope)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Edit Shift</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Series Scope (if applicable) */}
          {isRecurringSeries && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
              <p className="text-sm text-yellow-800 mb-2">This shift is part of a recurring series:</p>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="scope"
                    value="single"
                    checked={deleteScope === 'single'}
                    onChange={(e) => setDeleteScope(e.target.value as any)}
                    className="mr-2"
                  />
                  <span className="text-sm">Nur dieses Vorkommen</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="scope"
                    value="following"
                    checked={deleteScope === 'following'}
                    onChange={(e) => setDeleteScope(e.target.value as any)}
                    className="mr-2"
                  />
                  <span className="text-sm">Dieser und alle folgenden</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="scope"
                    value="series"
                    checked={deleteScope === 'series'}
                    onChange={(e) => setDeleteScope(e.target.value as any)}
                    className="mr-2"
                  />
                  <span className="text-sm">Gesamte Serie</span>
                </label>
              </div>
            </div>
          )}

          {/* Staff Member */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Staff Member *
            </label>
            <select
              value={formData.staff_id}
              onChange={(e) => setFormData({ ...formData, staff_id: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {staff.map(member => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.staff_id})
                </option>
              ))}
            </select>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role *
            </label>
            <select
              value={formData.role_label}
              onChange={(e) => setFormData({ ...formData, role_label: e.target.value as any })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="other">Other</option>
              {selectedStaff?.labels.map(label => (
                <option key={label} value={label}>
                  {label.charAt(0).toUpperCase() + label.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time *
              </label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time *
              </label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Optional notes..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4">
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete
            </button>

            <div className="flex space-x-3">
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
          </div>
        </form>
      </div>
    </div>
  )
}