'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  MagnifyingGlassIcon,
  UserCircleIcon,
  ArrowRightIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline'

interface Guest {
  id: string
  guest_id: string
  name: string
  mobile_number?: string
  surf_package: boolean
  is_active: boolean
  room_assignment?: {
    room_number: string
    bed_name: string
  }
}

export default function CheckInOutPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  useEffect(() => {
    loadGuests()
  }, [])

  const loadGuests = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/guests')
      if (response.ok) {
        const result = await response.json()
        const guestsData = result.success ? result.data : result
        setGuests(Array.isArray(guestsData) ? guestsData : [])
      } else {
        console.error('Error loading guests:', await response.text())
        setGuests([])
      }
    } catch (error) {
      console.error('Error loading guests:', error)
      setGuests([])
    } finally {
      setLoading(false)
    }
  }

  const filteredGuests = guests.filter(guest => 
    guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guest.guest_id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleGuestSelect = (guest: Guest) => {
    router.push(`/guests/${guest.id}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading guests...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Guest Overview</h1>
        <p className="text-gray-600 mt-1">Select a guest to view their complete profile and activities</p>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or guest ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Guests List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">All Guests</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredGuests.map((guest) => (
            <div
              key={guest.id}
              onClick={() => handleGuestSelect(guest)}
              className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <UserCircleIcon className="h-10 w-10 text-gray-400" />
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{guest.name}</div>
                    <div className="text-sm text-gray-500">{guest.guest_id}</div>
                    {guest.room_assignment && (
                      <div className="text-xs text-gray-400">
                        Room: {guest.room_assignment.room_number} - {guest.room_assignment.bed_name}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {guest.surf_package && (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      Surf Package
                    </span>
                  )}
                  <ArrowRightIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredGuests.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchQuery ? 'No guests found matching your search' : 'No guests found'}
          </div>
        )}
      </div>
    </div>
  )
}