'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  UserIcon,
  ClockIcon,
  ChartBarIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import StaffManagementComponent from '@/components/staff/StaffManagement'

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

export default function StaffMainPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [searchTerm, setSearchTerm] = useState('')

  const currentModule = staffModules[0] // Staff Management

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
        <div className="bg-blue-100 text-blue-700 px-4 py-2 text-sm font-medium rounded-t-md flex items-center space-x-2">
          <UserIcon className="h-4 w-4" />
          <span>Staff Management</span>
        </div>
        {staffModules.slice(1).map((module) => {
          const Icon = module.icon
          return (
            <Link
              key={module.href}
              href={module.href}
              className="text-gray-500 hover:text-gray-700 px-4 py-2 text-sm font-medium rounded-t-md hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <Icon className="h-4 w-4" />
              <span>{module.title}</span>
            </Link>
          )
        })}
      </div>

      {/* Page Content */}
      <StaffManagementComponent
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />
    </div>
  )
}