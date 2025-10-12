'use client'

import { useState } from 'react'
import { HomeIcon, CubeIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import BedInventory from './BedInventory'
import MaterialInventory from './MaterialInventory'
import AnalyseComponent from './Analyse'

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<'beds' | 'equipment' | 'analyse'>('beds')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Manage beds, rooms, and equipment</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('beds')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'beds'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <HomeIcon className="h-5 w-5 inline mr-2" />
              Bed Inventory
            </button>
            <button
              onClick={() => setActiveTab('equipment')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'equipment'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <CubeIcon className="h-5 w-5 inline mr-2" />
              Material Inventory
            </button>
            <button
              onClick={() => setActiveTab('analyse')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analyse'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ChartBarIcon className="h-5 w-5 inline mr-2" />
              Analyse
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'beds' && <BedInventory />}
        {activeTab === 'equipment' && <MaterialInventory />}
        {activeTab === 'analyse' && (
          <AnalyseComponent 
            selectedDate={selectedDate} 
            onDateChange={setSelectedDate} 
          />
        )}
      </div>
    </div>
  )
}