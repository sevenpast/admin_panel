'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  UserIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import HoursReport from '@/components/staff/HoursReport'

const staffModules = [
  {
    title: 'Staff Management',
    description: 'Manage staff members, roles, and permissions',
    href: '/staff',
    icon: UserIcon,
    color: 'bg-blue-500'
  },
  {
    title: 'Shifts',
    description: 'Schedule and manage staff shifts and assignments',
    href: '/staff/shifts',
    icon: ClockIcon,
    color: 'bg-green-500'
  },
  {
    title: 'Hours Report',
    description: 'View staff working hours and shift analysis',
    href: '/staff/hours',
    icon: ChartBarIcon,
    color: 'bg-purple-500'
  }
]

export default function StaffHoursPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [searchTerm, setSearchTerm] = useState('')

  const currentModule = staffModules[2] // Hours Report

  return (
    <div className="space-y-6">
      {/* Main Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Staff</h1>
      </div>

      {/* Description */}
      <div>
        <p className="text-gray-600">Manage staff members, shifts, and work assignments</p>
      </div>

      {/* Navigation Links */}
      <div className="flex space-x-1 border-b border-gray-200">
        <Link
          href="/staff"
          className="text-gray-500 hover:text-gray-700 px-4 py-2 text-sm font-medium rounded-t-md hover:bg-gray-50 transition-colors flex items-center space-x-2"
        >
          <UserIcon className="h-4 w-4" />
          <span>Staff Management</span>
        </Link>
        <Link
          href="/staff/shifts"
          className="text-gray-500 hover:text-gray-700 px-4 py-2 text-sm font-medium rounded-t-md hover:bg-gray-50 transition-colors flex items-center space-x-2"
        >
          <ClockIcon className="h-4 w-4" />
          <span>Shifts</span>
        </Link>
        <div className="bg-purple-100 text-purple-700 px-4 py-2 text-sm font-medium rounded-t-md flex items-center space-x-2">
          <ChartBarIcon className="h-4 w-4" />
          <span>Hours Report</span>
        </div>
      </div>

      {/* Hours Report Component */}
      <HoursReport />
    </div>
  )
}
