'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  UserGroupIcon,
  AcademicCapIcon,
  CubeIcon,
  Cog6ToothIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import LessonManagementComponent from '@/components/lessons/LessonManagement'

const lessonModules = [
  {
    title: 'Package Guests',
    description: 'Manage guests with surf packages and lesson assignments',
    href: '/lessons',
    icon: UserGroupIcon,
    color: 'bg-blue-500'
  },
  {
    title: 'Lesson Management',
    description: 'Create, schedule, and manage surf lessons',
    href: '/lessons/lesson-management',
    icon: AcademicCapIcon,
    color: 'bg-green-500'
  },
  {
    title: 'Equipment',
    description: 'Manage surfboards, wetsuits, and other equipment',
    href: '/lessons/equipment',
    icon: CubeIcon,
    color: 'bg-purple-500'
  },
  {
    title: 'Assessment Questions',
    description: 'Manage skill assessment questions and evaluations',
    href: '/lessons/assessment-questions',
    icon: Cog6ToothIcon,
    color: 'bg-orange-500'
  }
]

export default function LessonManagementPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [searchTerm, setSearchTerm] = useState('')

  const currentModule = lessonModules[1] // Lesson Management

  return (
    <div className="space-y-6">
      {/* Main Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Lessons</h1>
      </div>

      {/* Description */}
      <div>
        <p className="text-gray-600">Manage guests, lessons and equipment</p>
      </div>

      {/* Navigation Links */}
      <div className="flex space-x-1 border-b border-gray-200">
        <Link
          href="/lessons"
          className="text-gray-500 hover:text-gray-700 px-4 py-2 text-sm font-medium rounded-t-md hover:bg-gray-50 transition-colors flex items-center space-x-2"
        >
          <UserGroupIcon className="h-4 w-4" />
          <span>Package Guests</span>
        </Link>
        <div className="bg-blue-100 text-blue-700 px-4 py-2 text-sm font-medium rounded-t-md flex items-center space-x-2">
          <AcademicCapIcon className="h-4 w-4" />
          <span>Lesson Management</span>
        </div>
        <Link
          href="/lessons/equipment"
          className="text-gray-500 hover:text-gray-700 px-4 py-2 text-sm font-medium rounded-t-md hover:bg-gray-50 transition-colors flex items-center space-x-2"
        >
          <CubeIcon className="h-4 w-4" />
          <span>Equipment</span>
        </Link>
        <Link
          href="/lessons/assessment-questions"
          className="text-gray-500 hover:text-gray-700 px-4 py-2 text-sm font-medium rounded-t-md hover:bg-gray-50 transition-colors flex items-center space-x-2"
        >
          <Cog6ToothIcon className="h-4 w-4" />
          <span>Assessment Questions</span>
        </Link>
      </div>


      {/* Page Content */}
      <LessonManagementComponent
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />
    </div>
  )
}