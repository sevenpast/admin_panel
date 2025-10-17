'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  CalendarIcon,
  SparklesIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import EventManagementComponent from '@/components/events/EventManagement'

const eventModules = [
  {
    title: 'Event Management',
    description: 'Create, schedule, and manage camp events and activities',
    href: '/events',
    icon: CalendarIcon,
    color: 'bg-blue-500'
  },
  {
    title: 'Activity Planning',
    description: 'Plan and organize daily activities and entertainment',
    href: '/events/activity-planning',
    icon: SparklesIcon,
    color: 'bg-purple-500'
  }
]

export default function EventsMainPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const currentModule = eventModules[0] // Event Management

  return (
    <div className="space-y-6">
      {/* Main Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Events</h1>
      </div>

      {/* Description */}
      <div>
        <p className="text-gray-600">Manage camp events, activities, and entertainment programs</p>
      </div>

      {/* Navigation Links */}
      <div className="flex space-x-1 border-b border-gray-200">
        <div className="bg-blue-100 text-blue-700 px-4 py-2 text-sm font-medium rounded-t-md flex items-center space-x-2">
          <CalendarIcon className="h-4 w-4" />
          <span>Event Management</span>
        </div>
        {eventModules.slice(1).map((module) => {
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
      <EventManagementComponent />
    </div>
  )
}