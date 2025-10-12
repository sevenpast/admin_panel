'use client'

import { useState } from 'react'
import AlertManagement from './AlertManagement'
import CutoffManagement from './CutoffManagement'

export default function AlertManagementPage() {
  const [activeTab, setActiveTab] = useState<'alerts' | 'cutoffs'>('alerts')

  return (
    <div className="h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'alerts'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Alert Management
        </button>
        <button
          onClick={() => setActiveTab('cutoffs')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'cutoffs'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Cutoff Management
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {activeTab === 'alerts' && <AlertManagement />}
        {activeTab === 'cutoffs' && <CutoffManagement />}
      </div>
    </div>
  )
}