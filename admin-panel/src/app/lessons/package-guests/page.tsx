'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import PackageGuestsComponent from '@/components/lessons/PackageGuests'

export default function PackageGuestsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center space-x-4">
        <Link
          href="/lessons"
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Lessons
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Package Guests</h1>
        <p className="text-gray-600 mt-2">Manage guests with surf packages and lesson assignments</p>
      </div>

      {/* Package Guests Component */}
      <PackageGuestsComponent
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />
    </div>
  )
}