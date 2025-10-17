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
import KitchenOverviewComponent from '@/components/meals/KitchenOverview'

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

export default function MealsMainPage() {
  const [selectedDate, setSelectedDate] = useState('2025-10-11') // Set to a date with meals for testing
  const [searchTerm, setSearchTerm] = useState('')

  const currentModule = mealModules[0] // Kitchen Overview

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
        <div className="bg-blue-100 text-blue-700 px-4 py-2 text-sm font-medium rounded-t-md flex items-center space-x-2">
          <EyeIcon className="h-4 w-4" />
          <span>Kitchen Overview</span>
        </div>
        {mealModules.slice(1).map((module) => {
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
      <KitchenOverviewComponent
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />
    </div>
  )
}