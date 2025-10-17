'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import KitchenOverviewComponent from '@/components/meals/KitchenOverview'

export default function KitchenOverviewPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center space-x-4">
        <Link
          href="/meals"
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Meals
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Kitchen Overview</h1>
        <p className="text-gray-600 mt-2">Real-time kitchen operations and meal delivery tracking</p>
      </div>

      {/* Kitchen Overview Component */}
      <KitchenOverviewComponent
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />
    </div>
  )
}