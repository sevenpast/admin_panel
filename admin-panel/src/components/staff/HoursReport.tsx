'use client'

import { useState, useEffect } from 'react'
import { useToastContext } from '@/components/common/ToastProvider'
import {
  ClockIcon,
  UserIcon,
  CalendarIcon,
  ChartBarIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'
import { format, startOfWeek, endOfWeek, subWeeks, addWeeks, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'

interface StaffHours {
  staff_id: string
  name: string
  color: string
  labels: string[]
  is_active: boolean
  totalHours: number
  shiftCount: number
  roles: string[]
  shifts: Array<{
    id: string
    start_at: string
    end_at: string
    role_label: string
    hours: number
  }>
}

interface HoursSummary {
  totalStaff: number
  totalHours: number
  totalShifts: number
  averageHoursPerStaff: number
  period: {
    from: string | null
    to: string | null
  }
}

interface HoursReportData {
  summary: HoursSummary
  staffHours: StaffHours[]
}

export default function HoursReport() {
  const { success, error: showError } = useToastContext()
  const [data, setdata] = useState<HoursReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedWeek, setSelectedWeek] = useState(new Date())
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const loadHoursData = async () => {
    try {
      setLoading(true)
      setError(null)

      const startOfWeekDate = startOfWeek(selectedWeek, { weekStartsOn: 1 }) // Monday
      const endOfWeekDate = endOfWeek(selectedWeek, { weekStartsOn: 1 }) // Sunday

      const from = startOfWeekDate.toISOString().split('T')[0]
      const to = endOfWeekDate.toISOString().split('T')[0]

      const response = await fetch(`/api/staff/hours?from=${from}&to=${to}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch hours data')
      }

      const result = await response.json()
      setData(result.data)
    } catch (err) {
      console.error('Error loading hours data:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHoursData()
  }, [selectedWeek])

  const navigateWeek = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setSelectedWeek(subWeeks(selectedWeek, 1))
    } else {
      setSelectedWeek(addWeeks(selectedWeek, 1))
    }
  }

  const goToCurrentWeek = () => {
    setSelectedWeek(new Date())
  }

  const filteredStaffHours = data?.staffHours.filter(staff => {
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && staff.is_active) ||
      (statusFilter === 'inactive' && !staff.is_active)
    
    const matchesSearch = searchTerm === '' || 
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.staff_id.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesStatus && matchesSearch
  }) || []

  const exportToCSV = () => {
    if (!data) return

    const csvContent = [
      ['Staff ID', 'Name', 'Total Hours', 'Shifts', 'Roles', 'Status'].join(','),
      ...filteredStaffHours.map(staff => [
        staff.staff_id,
        `"${staff.name}"`,
        staff.totalHours,
        staff.shiftCount,
        `"${staff.roles.join(', ')}"`,
        staff.is_active ? 'Active' : 'Inactive'
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `staff-hours-${format(selectedWeek, 'yyyy-MM-dd')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hours report...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <ChartBarIcon className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadHoursData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hours Report</h1>
          <p className="text-gray-600">Staff working hours and shift analysis</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={exportToCSV}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-2 rounded-md bg-gray-100 hover:bg-gray-200"
            >
              <CalendarIcon className="h-4 w-4" />
            </button>
            <h2 className="text-lg font-semibold">
              {format(startOfWeek(selectedWeek, { weekStartsOn: 1 }), 'MMM d', { locale: de })} - {format(endOfWeek(selectedWeek, { weekStartsOn: 1 }), 'MMM d, yyyy', { locale: de })}
            </h2>
            <button
              onClick={() => navigateWeek('next')}
              className="p-2 rounded-md bg-gray-100 hover:bg-gray-200"
            >
              <CalendarIcon className="h-4 w-4 rotate-180" />
            </button>
          </div>
          <button
            onClick={goToCurrentWeek}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Current Week
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Staff</p>
                <p className="text-2xl font-bold text-gray-900">{data.summary.totalStaff}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold text-gray-900">{data.summary.totalHours}h</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Shifts</p>
                <p className="text-2xl font-bold text-gray-900">{data.summary.totalShifts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Hours/Staff</p>
                <p className="text-2xl font-bold text-gray-900">{data.summary.averageHoursPerStaff}h</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Staff</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or staff ID..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Staff Hours Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Staff Hours Breakdown</h3>
        </div>
        
        {filteredStaffHours.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No staff found for current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shifts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStaffHours.map((staff) => (
                  <tr key={staff.staff_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                          style={{ backgroundColor: staff.color }}
                        >
                          {staff.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                          <div className="text-sm text-gray-500">{staff.staff_id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        staff.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {staff.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{staff.totalHours}h</div>
                      <div className="text-sm text-gray-500">
                        {staff.shiftCount > 0 ? `${(staff.totalHours / staff.shiftCount).toFixed(1)}h avg` : 'No shifts'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {staff.shiftCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {staff.roles.map((role) => (
                          <span
                            key={role}
                            className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          // TODO: Implement detailed view modal
                          showError(`Detailed view for ${staff.name} - ${staff.shiftCount} shifts, ${staff.totalHours}h total`)
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
