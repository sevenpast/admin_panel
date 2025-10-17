'use client'

import Link from 'next/link'
import {
  CalendarDaysIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import EventCalendar from '@/components/calendar/EventCalendar'

const calendarModules = [
  {
    title: 'Calendar View',
    description: 'View and manage all camp events in calendar format',
    href: '/calendar',
    icon: CalendarDaysIcon,
    color: 'bg-blue-500'
  },
  {
    title: 'Schedule Planning',
    description: 'Manage daily schedules and activity planning',
    href: '/calendar/schedule-planning',
    icon: ClockIcon,
    color: 'bg-green-500'
  }
]

export default function CalendarMainPage() {
  const currentModule = calendarModules[0] // Calendar View

  return (
    <div className="space-y-6">
      {/* Main Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
      </div>

      {/* Description */}
      <div>
        <p className="text-gray-600">Manage events, schedules, and bookings across all camp activities</p>
      </div>

      {/* Navigation Links */}
      <div className="flex space-x-1 border-b border-gray-200">
        <div className="bg-blue-100 text-blue-700 px-4 py-2 text-sm font-medium rounded-t-md flex items-center space-x-2">
          <CalendarDaysIcon className="h-4 w-4" />
          <span>Calendar View</span>
        </div>
        {calendarModules.slice(1).map((module) => {
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
      <EventCalendar />
    </div>
  )
}