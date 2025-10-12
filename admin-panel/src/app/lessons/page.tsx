'use client'

import { useState } from 'react'
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  GlobeAltIcon,
  PlusIcon,
  XMarkIcon,
  CheckIcon,
  UserGroupIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserPlusIcon,
  AcademicCapIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import PackageGuestsComponent from './PackageGuests'
import LessonManagementComponent from './LessonManagement'
import AssessmentQuestionsComponent from './AssessmentQuestions'

export default function SurfLessonsPage() {
  const [activeTab, setActiveTab] = useState<'guests' | 'lessons' | 'questions'>('guests')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const tabs = [
    { id: 'guests', name: 'Package Guests', icon: UserGroupIcon },
    { id: 'lessons', name: 'Lesson Management', icon: AcademicCapIcon },
    { id: 'questions', name: 'Assessment Questions', icon: Cog6ToothIcon }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Surf Lessons</h1>
        <p className="text-gray-600">Manage surf lessons, guests, and assessments</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'guests' && (
        <PackageGuestsComponent 
          selectedDate={selectedDate} 
          onDateChange={setSelectedDate} 
        />
      )}
      {activeTab === 'lessons' && (
        <LessonManagementComponent 
          selectedDate={selectedDate} 
          onDateChange={setSelectedDate} 
        />
      )}
      {activeTab === 'questions' && (
        <AssessmentQuestionsComponent 
          selectedDate={selectedDate} 
          onDateChange={setSelectedDate} 
        />
      )}
    </div>
  )
}