'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useToastContext } from '@/components/common/ToastProvider'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, isSameDay, isSameMonth, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'
import ShiftModal from './ShiftModal'

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

interface ShiftEvent {
  id: string
  title: string
  type: 'shift'
  start_time: string
  end_time: string
  location: string
  description?: string
  color: string
  staff_id: string
  role_label: string
}

export default function ShiftCalendar() {
  const { success, error } = useToastContext()
  const [currentDate, setcurrentDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')
  const [shifts, setShifts] = useState<Shift[]>([])
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showShiftModal, setShowShiftModal] = useState(false)
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    loadStaff()
    loadShifts()
  }, [currentDate, view])

  const loadStaff = async () => {
    try {
      const response = await fetch('/api/staff')
      if (response.ok) {
        const staffData = await response.json()
        setStaff(staffData.data || staffData || [])
      } else {
        console.error('Failed to load staff:', response.statusText)
      }
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const loadShifts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/shifts')
      if (response.ok) {
        const shiftsData = await response.json()
        setShifts(shiftsData.data || shiftsData || [])
      } else {
        console.error('Failed to load shifts:', response.statusText)
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveShift = async (shiftData: Omit<Shift, 'id' | 'shift_id' | 'camp_id' | 'created_at' | 'updated_at' | 'created_by' | 'is_active'>, id?: string) => {
    try {
      const method = id ? 'PUT' : 'POST'
      const url = id ? `/api/shifts/${id}` : '/api/shifts'
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shiftData),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: `HTTP ${response.status}` }))
        console.error('Shift save error:', error)
        const errorMessage = error.error?.message || error.error || error.message || `HTTP Error ${response.status}` || 'Unknown error'
        error(`Error saving shift: ${errorMessage}`)
        return false
      }

      await loadShifts()
      setShowShiftModal(false)
      setSelectedShift(null)
      setIsEditing(false)
      return true
    } catch (error: any) {
      console.error('Error:', err)
      const errorMessage = error.error?.message || error.error || error.message || 'Unknown error'
      error(`Error saving shift: ${errorMessage}`)
      return false
    }
  }

  const handleDeleteShift = async (id: string) => {
    if (!confirm('Are you sure you want to delete this shift?')) return

    try {
      const response = await fetch(`/api/shifts/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: `HTTP ${response.status}` }))
        console.error('Shift delete error:', error)
        const errorMessage = error.error?.message || error.error || error.message || `HTTP Error ${response.status}` || 'Unknown error'
        error(`Error deleting shift: ${errorMessage}`)
        return false
      }

      await loadShifts()
      setShowShiftModal(false)
      setSelectedShift(null)
      return true
    } catch (error: any) {
      console.error('Error:', err)
      const errorMessage = error.error?.message || error.error || error.message || 'Unknown error'
      error(`Error deleting shift: ${errorMessage}`)
      return false
    }
  }

  const getStaffName = (staffId: string) => {
    const member = staff.find(s => s.id === staffId)
    return member ? member.name : 'Unknown Staff'
  }

  const getStaffRole = (staffId: string) => {
    const member = staff.find(s => s.id === staffId)
    return member ? member.role : 'Unknown Role'
  }

  const getStaffColor = (staffId: string) => {
    const member = staff.find(s => s.id === staffId)
    return member ? member.color : '#cccccc'
  }

  const getStaffNumber = (staffId: string) => {
    const member = staff.find(s => s.id === staffId)
    return member ? member.staff_id : 'Unknown'
  }

  const mappedShifts: ShiftEvent[] = useMemo(() => {
    return shifts.map(shift => ({
      id: shift.id,
      title: `${getStaffNumber(shift.staff_id)} - ${getStaffName(shift.staff_id)} (${getStaffRole(shift.staff_id)})`,
      type: 'shift',
      start_time: shift.start_at,
      end_time: shift.end_at,
      location: getStaffName(shift.staff_id),
      description: shift.notes || '',
      color: shift.color || getStaffColor(shift.staff_id),
      staff_id: shift.staff_id,
      role_label: shift.role_label,
    }))
  }, [shifts, staff])

  const startMonth = startOfMonth(currentDate)
  const endMonth = endOfMonth(currentDate)
  const startWeek = startOfWeek(currentDate, { weekStartsOn: 1 }) // Monday
  const endWeek = endOfWeek(currentDate, { weekStartsOn: 1 }) // Sunday

  const daysInMonth = useMemo(() => {
    const days = []
    let day = startOfWeek(startMonth, { weekStartsOn: 1 })
    while (day <= endOfWeek(endMonth, { weekStartsOn: 1 })) {
      days.push(day)
      day = addDays(day, 1)
    }
    return days
  }, [startMonth, endMonth])

  const daysInWeek = useMemo(() => {
    const days = []
    let day = startWeek
    while (day <= endWeek) {
      days.push(day)
      day = addDays(day, 1)
    }
    return days
  }, [startWeek, endWeek])

  const getShiftsForDay = useCallback((day: Date) => {
    return mappedShifts.filter(shift =>
      isSameDay(parseISO(shift.start_time), day) ||
      (parseISO(shift.start_time) < day && parseISO(shift.end_time) > day)
    ).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
  }, [mappedShifts])

  const handlePrev = () => {
    if (view === 'month') setCurrentDate(subMonths(currentDate, 1))
    else if (view === 'week') setCurrentDate(subWeeks(currentDate, 1))
    else setCurrentDate(subDays(currentDate, 1))
  }

  const handleNext = () => {
    if (view === 'month') setCurrentDate(addMonths(currentDate, 1))
    else if (view === 'week') setCurrentDate(addWeeks(currentDate, 1))
    else setCurrentDate(addDays(currentDate, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleOpenCreateShiftModal = () => {
    setSelectedShift(null)
    setIsEditing(false)
    setShowShiftModal(true)
  }

  const handleOpenEditShiftModal = (shift: ShiftEvent) => {
    const originalShift = shifts.find(s => s.id === shift.id)
    if (originalShift) {
      setSelectedShift(originalShift)
      setIsEditing(true)
      setShowShiftModal(true)
    }
  }

  const renderMonthView = () => (
    <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden shadow-sm">
      {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day, i) => (
        <div key={i} className="bg-gray-50 px-3 py-2 text-center text-xs font-semibold text-gray-500">
          {day}
        </div>
      ))}
      {daysInMonth.map((day, dayIdx) => (
        <div
          key={day.toISOString()}
          className={`relative h-32 p-2 group ${isSameMonth(day, currentDate) ? 'bg-white' : 'bg-gray-50'} ${isSameDay(day, new Date()) ? 'ring-2 ring-blue-500' : ''}`}
        >
          <time
            dateTime={format(day, 'yyyy-MM-dd')}
            className={`flex h-6 w-6 items-center justify-center rounded-full text-sm font-semibold ${isSameDay(day, new Date()) ? 'bg-blue-600 text-white' : isSameMonth(day, currentDate) ? 'text-gray-900' : 'text-gray-400'}`}
          >
            {format(day, 'd')}
          </time>
          <ol className="mt-2 space-y-1">
            {getShiftsForDay(day).slice(0, 2).map((shift) => (
              <li key={shift.id} className="flex">
                <button
                  onClick={() => handleOpenEditShiftModal(shift)}
                  className={`group flex w-full items-center space-x-2 rounded-md px-2 py-1 text-xs font-medium text-white hover:opacity-80 transition-opacity`}
                  style={{ backgroundColor: shift.color }}
                >
                  <ClockIcon className="h-3 w-3" />
                  <p className="truncate">{shift.title}</p>
                </button>
              </li>
            ))}
            {getShiftsForDay(day).length > 2 && (
              <li className="text-gray-500 text-xs mt-1">
                + {getShiftsForDay(day).length - 2} more
              </li>
            )}
          </ol>
          <button
            onClick={() => {
              setSelectedShift(null)
              setIsEditing(false)
              setShowShiftModal(true)
            }}
            className="absolute bottom-2 right-2 p-1 rounded-full bg-blue-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            title="Add Shift"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )

  const renderWeekView = () => (
    <div className="isolate flex flex-auto flex-col bg-white rounded-lg shadow-sm">
      <div className="flex flex-none items-center justify-between border-b border-gray-200 px-6 py-2">
        <h2 className="text-base font-semibold leading-6 text-gray-900">
          <time dateTime={format(startWeek, 'yyyy-MM-dd')}>{format(startWeek, 'MMM d', { locale: de })}</time> - <time dateTime={format(endWeek, 'yyyy-MM-dd')}>{format(endWeek, 'MMM d, yyyy', { locale: de })}</time>
        </h2>
        <div className="flex items-center">
          <div className="relative flex items-center rounded-md bg-white shadow-sm md:items-stretch">
            <button
              onClick={handlePrev}
              type="button"
              className="flex h-9 w-12 items-center justify-center rounded-l-md border-y border-l border-gray-300 pr-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pr-0"
            >
              <span className="sr-only">Previous week</span>
              <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              onClick={handleToday}
              type="button"
              className="hidden border-y border-gray-300 px-3.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:relative md:block"
            >
              Today
            </button>
            <span className="relative -mx-px h-5 w-px bg-gray-300 md:hidden" />
            <button
              onClick={handleNext}
              type="button"
              className="flex h-9 w-12 items-center justify-center rounded-r-md border-y border-r border-gray-300 pl-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pl-0"
            >
              <span className="sr-only">Next week</span>
              <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="hidden md:ml-4 md:flex md:items-center">
            <div className="ml-6 h-6 w-px bg-gray-300" />
            <button
              onClick={handleOpenCreateShiftModal}
              type="button"
              className="ml-6 flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <PlusIcon className="-ml-0.5 mr-2 h-5 w-5" aria-hidden="true" />
              New Shift
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-auto overflow-hidden">
        <div className="flex w-full flex-auto flex-col overflow-auto">
          <div className="sticky top-0 z-10 grid flex-none bg-white ring-1 ring-gray-900 ring-opacity-5 sm:grid-cols-7 md:hidden">
            {daysInWeek.map((day) => (
              <button key={day.toISOString()} type="button" className="flex flex-col items-center pb-3 pt-2">
                <time dateTime={format(day, 'yyyy-MM-dd')} className="text-xs leading-4 text-gray-900">
                  {format(day, 'EEE', { locale: de })} <span className="mt-1 flex h-8 w-8 items-center justify-center font-semibold text-gray-900">{format(day, 'd')}</span>
                </time>
              </button>
            ))}
          </div>
          <div className="flex flex-auto">
            <div className="isolate grid w-full grid-cols-7 grid-rows-1 divide-x divide-gray-100">
              {daysInWeek.map((day) => (
                <div key={day.toISOString()} className="flex flex-col">
                  <div className="sticky top-0 z-10 hidden flex-none bg-white ring-1 ring-gray-900 ring-opacity-5 sm:grid-cols-7 md:block">
                    <div className="flex flex-col items-center pb-3 pt-2">
                      <time dateTime={format(day, 'yyyy-MM-dd')} className="text-xs leading-4 text-gray-900">
                        {format(day, 'EEE', { locale: de })} <span className="mt-1 flex h-8 w-8 items-center justify-center font-semibold text-gray-900">{format(day, 'd')}</span>
                      </time>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col overflow-y-auto">
                    <div className="relative flex flex-auto flex-col">
                      <div className="sticky top-0 z-10 grid h-10 grid-cols-1 grid-rows-1 bg-white text-xs leading-6 text-gray-500">
                        <div className="col-start-1 col-end-2 row-start-1 grid divide-y divide-gray-100">
                          <div className="h-px" />
                          <div></div>
                        </div>
                      </div>
                      <ol className="col-start-1 col-end-2 row-start-1 grid divide-y divide-gray-100 text-sm leading-6">
                        {Array.from({ length: 24 }).map((_, hour) => (
                          <li key={hour} className="relative flex-auto">
                            <div className="sticky left-0 -mt-2.5 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                              {hour === 0 ? '12AM' : hour === 12 ? '12PM' : hour < 12 ? `${hour}AM` : `${hour - 12}PM`}
                            </div>
                            <div className="absolute inset-0 grid grid-cols-1 grid-rows-2">
                              <div className="border-t border-gray-100" />
                              <div className="border-t border-gray-100" />
                            </div>
                          </li>
                        ))}
                      </ol>
                      <div className="absolute inset-0">
                        {getShiftsForDay(day).map((shift) => {
                          const start = parseISO(shift.start_time)
                          const end = parseISO(shift.end_time)
                          const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60)
                          const startHour = start.getHours() + start.getMinutes() / 60
                          const top = (startHour / 24) * 100
                          const height = (durationMinutes / (24 * 60)) * 100

                          return (
                            <button
                              key={shift.id}
                              onClick={() => handleOpenEditShiftModal(shift)}
                              className={`absolute inset-x-0 flex flex-col rounded-lg p-2 text-xs leading-5 text-white hover:opacity-80 transition-opacity`}
                              style={{
                                top: `${top}%`,
                                height: `${height}%`,
                                backgroundColor: shift.color,
                                zIndex: 10,
                              }}
                            >
                              <p className="font-semibold">{shift.title}</p>
                              <p>{format(start, 'HH:mm')} - {format(end, 'HH:mm')}</p>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderDayView = () => {
    const dayShifts = getShiftsForDay(currentDate)
    return (
      <div className="isolate flex flex-auto flex-col bg-white rounded-lg shadow-sm">
        <div className="flex flex-none items-center justify-between border-b border-gray-200 px-6 py-2">
          <h2 className="text-base font-semibold leading-6 text-gray-900">
            <time dateTime={format(currentDate, 'yyyy-MM-dd')}>{format(currentDate, 'EEEE, MMM d, yyyy', { locale: de })}</time>
          </h2>
          <div className="flex items-center">
            <div className="relative flex items-center rounded-md bg-white shadow-sm md:items-stretch">
              <button
                onClick={handlePrev}
                type="button"
                className="flex h-9 w-12 items-center justify-center rounded-l-md border-y border-l border-gray-300 pr-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pr-0"
              >
                <span className="sr-only">Previous day</span>
                <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                onClick={handleToday}
                type="button"
                className="hidden border-y border-gray-300 px-3.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:relative md:block"
              >
                Today
              </button>
              <span className="relative -mx-px h-5 w-px bg-gray-300 md:hidden" />
              <button
                onClick={handleNext}
                type="button"
                className="flex h-9 w-12 items-center justify-center rounded-r-md border-y border-r border-gray-300 pl-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pl-0"
              >
                <span className="sr-only">Next day</span>
                <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="hidden md:ml-4 md:flex md:items-center">
              <div className="ml-6 h-6 w-px bg-gray-300" />
              <button
                onClick={handleOpenCreateShiftModal}
                type="button"
                className="ml-6 flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <PlusIcon className="-ml-0.5 mr-2 h-5 w-5" aria-hidden="true" />
                New Shift
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-auto overflow-hidden">
          <div className="flex w-full flex-auto flex-col overflow-auto">
            <div className="flex flex-auto">
              <div className="isolate grid w-full grid-cols-1 grid-rows-1 divide-x divide-gray-100">
                <div className="flex flex-col">
                  <div className="flex flex-1 flex-col overflow-y-auto">
                    <div className="relative flex flex-auto flex-col">
                      <div className="sticky top-0 z-10 grid h-10 grid-cols-1 grid-rows-1 bg-white text-xs leading-6 text-gray-500">
                        <div className="col-start-1 col-end-2 row-start-1 grid divide-y divide-gray-100">
                          <div className="h-px" />
                          <div></div>
                        </div>
                      </div>
                      <ol className="col-start-1 col-end-2 row-start-1 grid divide-y divide-gray-100 text-sm leading-6">
                        {Array.from({ length: 24 }).map((_, hour) => (
                          <li key={hour} className="relative flex-auto">
                            <div className="sticky left-0 -mt-2.5 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                              {hour === 0 ? '12AM' : hour === 12 ? '12PM' : hour < 12 ? `${hour}AM` : `${hour - 12}PM`}
                            </div>
                            <div className="absolute inset-0 grid grid-cols-1 grid-rows-2">
                              <div className="border-t border-gray-100" />
                              <div className="border-t border-gray-100" />
                            </div>
                          </li>
                        ))}
                      </ol>
                      <div className="absolute inset-0">
                        {dayShifts.map((shift) => {
                          const start = parseISO(shift.start_time)
                          const end = parseISO(shift.end_time)
                          const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60)
                          const startHour = start.getHours() + start.getMinutes() / 60
                          const top = (startHour / 24) * 100
                          const height = (durationMinutes / (24 * 60)) * 100

                          return (
                            <button
                              key={shift.id}
                              onClick={() => handleOpenEditShiftModal(shift)}
                              className={`absolute inset-x-0 flex flex-col rounded-lg p-2 text-xs leading-5 text-white hover:opacity-80 transition-opacity`}
                              style={{
                                top: `${top}%`,
                                height: `${height}%`,
                                backgroundColor: shift.color,
                                zIndex: 10,
                              }}
                            >
                              <p className="font-semibold">{shift.title}</p>
                              <p>{format(start, 'HH:mm')} - {format(end, 'HH:mm')}</p>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrev}
            className="rounded-md bg-white px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <h2 className="text-base font-semibold leading-6 text-gray-900">
            {view === 'month' && format(currentDate, 'MMMM yyyy', { locale: de })}
            {view === 'week' && `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d', { locale: de })} - ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d, yyyy', { locale: de })}`}
            {view === 'day' && format(currentDate, 'EEEE, MMM d, yyyy', { locale: de })}
          </h2>
          <button
            onClick={handleNext}
            className="rounded-md bg-white px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
          <button
            onClick={handleToday}
            className="rounded-md bg-white px-2 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Today
          </button>
        </div>
        <div className="mt-4 flex items-center gap-x-2 sm:mt-0">
          <div className="hidden md:flex md:items-center">
            <button
              onClick={handleOpenCreateShiftModal}
              type="button"
              className="flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <PlusIcon className="-ml-0.5 mr-2 h-5 w-5" aria-hidden="true" />
              New Shift
            </button>
          </div>
          <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300">
            <button
              onClick={() => setView('month')}
              type="button"
              className={`relative rounded-l-md px-3 py-2 text-sm font-semibold ${view === 'month' ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 hover:bg-gray-50'}`}
            >
              Month
            </button>
            <button
              onClick={() => setView('week')}
              type="button"
              className={`relative -ml-px px-3 py-2 text-sm font-semibold ${view === 'week' ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 hover:bg-gray-50'}`}
            >
              Week
            </button>
            <button
              onClick={() => setView('day')}
              type="button"
              className={`relative -ml-px rounded-r-md px-3 py-2 text-sm font-semibold ${view === 'day' ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 hover:bg-gray-50'}`}
            >
              Day
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading shifts...</p>
          </div>
        </div>
      ) : (
        <>
          {view === 'month' && renderMonthView()}
          {view === 'week' && renderWeekView()}
          {view === 'day' && renderDayView()}
        </>
      )}

      {showShiftModal && (
        <ShiftModal
          isOpen={showShiftModal}
          onClose={() => {
            setShowShiftModal(false)
            setSelectedShift(null)
            setIsEditing(false)
          }}
          onSave={handleSaveShift}
          onDelete={handleDeleteShift}
          initialData={selectedShift}
          isEditing={isEditing}
          staffMembers={staff}
        />
      )}
    </div>
  )
}