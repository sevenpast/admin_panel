'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import StaffManagementComponent from '@/components/staff/StaffManagement'

export default function StaffManagementPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center space-x-4">
        <Link
          href="/staff"
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Staff
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
        <p className="text-gray-600 mt-2">Manage staff members, roles, and permissions</p>
      </div>

      {/* Staff Management Component */}
      <StaffManagementComponent
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />
    </div>
  )
}