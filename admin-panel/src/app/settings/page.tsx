'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  UserCircleIcon,
  CogIcon,
  BellIcon
} from '@heroicons/react/24/outline'
import BenutzerProfilComponent from '@/components/settings/BenutzerProfil'

const settingsModules = [
  {
    title: 'User Profile',
    description: 'Manage your account settings and preferences',
    href: '/settings',
    icon: UserCircleIcon,
    color: 'bg-blue-500'
  },
  {
    title: 'Camp Configuration',
    description: 'Configure camp settings, timezone, and general preferences',
    href: '/settings/camp-configuration',
    icon: CogIcon,
    color: 'bg-green-500'
  },
  {
    title: 'Notifications',
    description: 'Configure notification preferences and alert settings',
    href: '/settings/notifications',
    icon: BellIcon,
    color: 'bg-orange-500'
  }
]

export default function SettingsMainPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const currentModule = settingsModules[0] // User Profile

  return (
    <div className="space-y-6">
      {/* Main Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
      </div>

      {/* Description */}
      <div>
        <p className="text-gray-600">Manage system settings, user preferences, and configuration</p>
      </div>

      {/* Navigation Links */}
      <div className="flex space-x-1 border-b border-gray-200">
        <div className="bg-blue-100 text-blue-700 px-4 py-2 text-sm font-medium rounded-t-md flex items-center space-x-2">
          <UserCircleIcon className="h-4 w-4" />
          <span>Camp Information</span>
        </div>
        {settingsModules.slice(1).map((module) => {
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
      <BenutzerProfilComponent
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />
    </div>
  )
}