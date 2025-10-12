'use client'

import { useState } from 'react'
import {
  EyeIcon,
  CakeIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import KitchenOverviewComponent from './KitchenOverview'
import KitchenManagementComponent from './KitchenManagement'
import StaffOverviewComponent from './StaffOverview'

export default function MealsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'management' | 'staff'>('overview')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const tabs = [
    { id: 'overview', name: 'Kitchen Overview', icon: EyeIcon },
    { id: 'management', name: 'Kitchen Management', icon: CakeIcon },
    { id: 'staff', name: 'Staff Overview', icon: UserGroupIcon }
  ]

  return (
    <div className="space-y-6">
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
      {activeTab === 'overview' && (
        <KitchenOverviewComponent 
          selectedDate={selectedDate} 
          onDateChange={setSelectedDate} 
        />
      )}
      {activeTab === 'management' && (
        <KitchenManagementComponent 
          selectedDate={selectedDate} 
          onDateChange={setSelectedDate} 
        />
      )}
      {activeTab === 'staff' && (
        <StaffOverviewComponent 
          selectedDate={selectedDate} 
          onDateChange={setSelectedDate} 
        />
      )}
    </div>
  )
}