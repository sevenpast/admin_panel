'use client'

import { useState } from 'react'
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  UserIcon,
  DocumentArrowDownIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import StaffManagementComponent from './StaffManagement'
import ShiftsComponent from './Shifts'

export default function StaffPage() {
  const [activeTab, setActiveTab] = useState<'management' | 'shifts'>('management')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const tabs = [
    { id: 'management', name: 'Staff Management', icon: UserIcon },
    { id: 'shifts', name: 'Shifts', icon: ClockIcon }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Staff</h1>
        <p className="text-gray-600">Manage staff members and their shifts</p>
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
      {activeTab === 'management' && (
        <StaffManagementComponent 
          selectedDate={selectedDate} 
          onDateChange={setSelectedDate} 
        />
      )}
      {activeTab === 'shifts' && (
        <ShiftsComponent 
          selectedDate={selectedDate} 
          onDateChange={setSelectedDate} 
        />
      )}
    </div>
  )
}