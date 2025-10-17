'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  EyeIcon,
  CakeIcon,
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import KitchenManagementComponent from '@/components/meals/KitchenManagement'

const mealModules = [
  {
    title: 'Kitchen Overview',
    description: 'Real-time kitchen operations and meal delivery tracking',
    href: '/meals',
    icon: EyeIcon,
    color: 'bg-blue-500'
  },
  {
    title: 'Kitchen Management',
    description: 'Create and schedule meals, manage menu planning',
    href: '/meals/kitchen-management',
    icon: CakeIcon,
    color: 'bg-orange-500'
  },
  {
    title: 'Staff Overview',
    description: 'Kitchen staff scheduling and task assignments',
    href: '/meals/staff-overview',
    icon: UserGroupIcon,
    color: 'bg-green-500'
  }
]

export default function KitchenManagementPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [searchTerm, setSearchTerm] = useState('')

  const currentModule = mealModules[1] // Kitchen Management

  return (
    <div className="space-y-6">
      {/* Main Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Meals</h1>
      </div>

      {/* Description */}
      <div>
        <p className="text-gray-600">Manage kitchen operations, meal planning, and staff coordination</p>
      </div>

      {/* Navigation Links */}
      <div className="flex space-x-1 border-b border-gray-200">
        <Link
          href="/meals"
          className="text-gray-500 hover:text-gray-700 px-4 py-2 text-sm font-medium rounded-t-md hover:bg-gray-50 transition-colors flex items-center space-x-2"
        >
          <EyeIcon className="h-4 w-4" />
          <span>Kitchen Overview</span>
        </Link>
        <div className="bg-blue-100 text-blue-700 px-4 py-2 text-sm font-medium rounded-t-md flex items-center space-x-2">
          <CakeIcon className="h-4 w-4" />
          <span>Kitchen Management</span>
        </div>
        <Link
          href="/meals/staff-overview"
          className="text-gray-500 hover:text-gray-700 px-4 py-2 text-sm font-medium rounded-t-md hover:bg-gray-50 transition-colors flex items-center space-x-2"
        >
          <UserGroupIcon className="h-4 w-4" />
          <span>Staff Overview</span>
        </Link>
      </div>

      {/* Page Content */}
      <KitchenManagementComponent
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />
    </div>
  )
}