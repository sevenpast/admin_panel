'use client'

import Link from 'next/link'
import {
  BellIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import AlertManagementComponent from '@/components/alerts/AlertManagement'

const alertModules = [
  {
    title: 'Alert Management',
    description: 'Configure and manage system alerts and notifications',
    href: '/alerts',
    icon: BellIcon,
    color: 'bg-red-500'
  },
  {
    title: 'Cutoff Management',
    description: 'Manage booking cutoffs and time-based restrictions',
    href: '/alerts/cutoff-management',
    icon: ClockIcon,
    color: 'bg-orange-500'
  }
]

export default function AlertsMainPage() {
  const currentModule = alertModules[0] // Alert Management

  return (
    <div className="space-y-6">
      {/* Main Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Alert Management</h1>
      </div>

      {/* Description */}
      <div>
        <p className="text-gray-600">Manage system alerts, notifications, and automated cutoffs</p>
      </div>

      {/* Navigation Links */}
      <div className="flex space-x-1 border-b border-gray-200">
        <div className="bg-blue-100 text-blue-700 px-4 py-2 text-sm font-medium rounded-t-md flex items-center space-x-2">
          <BellIcon className="h-4 w-4" />
          <span>Alert Management</span>
        </div>
        {alertModules.slice(1).map((module) => {
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
      <AlertManagementComponent />
    </div>
  )
}