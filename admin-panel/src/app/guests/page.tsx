'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { createClient } from '@/lib/supabase'

interface Guest {
  id: string
  guest_id: string
  name: string
  mobile_number?: string
  instagram?: string
  surf_package: boolean
  is_active: boolean
  surf_level?: 'beginner' | 'intermediate' | 'advanced'
  allergies?: Record<string, boolean>
  other_allergies?: string
  room?: {
    id: string
    room_number: string
  }
  bed?: {
    id: string
    bed_name: string
  }
  created_at: string
}

interface Room {
  id: string
  room_number: string
  beds: Bed[]
}

interface Bed {
  id: string
  bed_name: string
  capacity: number
  occupied_count: number
}

const ALLERGY_OPTIONS = [
  'nuts', 'dairy', 'gluten', 'shellfish', 'eggs', 'soy', 'fish', 'sesame'
]

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [packageFilter, setPackageFilter] = useState('all')
  const [roomFilter, setRoomFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)

  // Create/Edit Form State
  const [formData, setFormData] = useState({
    name: '',
    mobile_number: '',
    instagram: '',
    room_id: '',
    bed_id: '',
    surf_package: true,
    is_active: true,
    allergies: {} as Record<string, boolean>,
    other_allergies: ''
  })

  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load mock data since Supabase is not configured
      const mockGuests: Guest[] = [
        {
          id: '1',
          guest_id: 'G-A1B2C3D4E5',
          name: 'John Doe',
          mobile_number: '+49123456789',
          instagram: 'johndoe_surf',
          surf_package: true,
          is_active: true,
          surf_level: 'intermediate',
          allergies: { nuts: true, dairy: false },
          other_allergies: 'Shellfish allergy (severe)',
          room: { id: '1', room_number: '101' },
          bed: { id: '1', bed_name: 'A1' },
          created_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          guest_id: 'G-F6G7H8I9J0',
          name: 'Maria Garcia',
          mobile_number: '+34666777888',
          instagram: 'maria_waves',
          surf_package: true,
          is_active: true,
          surf_level: 'beginner',
          allergies: { gluten: true },
          room: { id: '1', room_number: '101' },
          bed: { id: '2', bed_name: 'A2' },
          created_at: '2024-01-16T14:30:00Z'
        },
        {
          id: '3',
          guest_id: 'G-K1L2M3N4O5',
          name: 'Tom Wilson',
          mobile_number: '+44777888999',
          surf_package: false,
          is_active: true,
          allergies: {},
          room: { id: '2', room_number: '102' },
          bed: { id: '3', bed_name: 'B1' },
          created_at: '2024-01-17T09:15:00Z'
        },
        {
          id: '4',
          guest_id: 'G-P6Q7R8S9T0',
          name: 'Sarah Connor',
          mobile_number: '+1555123456',
          instagram: 'sarah_surfgirl',
          surf_package: true,
          is_active: true,
          surf_level: 'advanced',
          allergies: { dairy: true, eggs: true },
          other_allergies: 'No spicy food',
          room: { id: '2', room_number: '102' },
          bed: { id: '4', bed_name: 'B2' },
          created_at: '2024-01-18T16:45:00Z'
        },
        {
          id: '5',
          guest_id: 'G-U1V2W3X4Y5',
          name: 'Alex Johnson',
          instagram: 'alex_boardrider',
          surf_package: true,
          is_active: false,
          allergies: {},
          created_at: '2024-01-19T11:20:00Z'
        }
      ]

      const mockRooms: Room[] = [
        {
          id: '1',
          room_number: '101',
          beds: [
            { id: '1', bed_name: 'A1', capacity: 1, occupied_count: 1 },
            { id: '2', bed_name: 'A2', capacity: 1, occupied_count: 1 }
          ]
        },
        {
          id: '2',
          room_number: '102',
          beds: [
            { id: '3', bed_name: 'B1', capacity: 1, occupied_count: 1 },
            { id: '4', bed_name: 'B2', capacity: 1, occupied_count: 1 }
          ]
        },
        {
          id: '3',
          room_number: '103',
          beds: [
            { id: '5', bed_name: 'C1', capacity: 2, occupied_count: 0 },
            { id: '6', bed_name: 'C2', capacity: 1, occupied_count: 0 }
          ]
        }
      ]

      setGuests(mockGuests)
      setRooms(mockRooms)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter and search logic
  const filteredGuests = useMemo(() => {
    return guests.filter(guest => {
      // Search filter
      if (searchQuery && !guest.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      // Package filter
      if (packageFilter === 'surf_package' && !guest.surf_package) return false
      if (packageFilter === 'no_surf_package' && guest.surf_package) return false

      // Room filter
      if (roomFilter !== 'all' && guest.room?.id !== roomFilter) return false

      // Status filter
      if (statusFilter === 'active' && !guest.is_active) return false
      if (statusFilter === 'inactive' && guest.is_active) return false

      return true
    })
  }, [guests, searchQuery, packageFilter, roomFilter, statusFilter])

  const handleCreateGuest = () => {
    setFormData({
      name: '',
      mobile_number: '',
      instagram: '',
      room_id: '',
      bed_id: '',
      surf_package: true,
      is_active: true,
      allergies: {},
      other_allergies: ''
    })
    setShowCreateModal(true)
  }

  const handleViewGuest = (guest: Guest) => {
    setSelectedGuest(guest)
    setShowViewModal(true)
  }

  const handleEditGuest = (guest: Guest) => {
    setSelectedGuest(guest)
    setFormData({
      name: guest.name,
      mobile_number: guest.mobile_number || '',
      instagram: guest.instagram || '',
      room_id: guest.room?.id || '',
      bed_id: guest.bed?.id || '',
      surf_package: guest.surf_package,
      is_active: guest.is_active,
      allergies: guest.allergies || {},
      other_allergies: guest.other_allergies || ''
    })
    setShowEditModal(true)
  }

  const handleDeleteGuest = async (guest: Guest) => {
    if (confirm(`Are you sure you want to delete ${guest.name}? This action cannot be undone.`)) {
      // Mock delete - in real app would call Supabase
      setGuests(guests.filter(g => g.id !== guest.id))
      alert('Guest deleted successfully')
    }
  }

  const handleSaveGuest = async () => {
    try {
      // Mock save - in real app would call Supabase
      const newGuest: Guest = {
        id: Date.now().toString(),
        guest_id: `G-${Math.random().toString(36).substr(2, 10).toUpperCase()}`,
        name: formData.name,
        mobile_number: formData.mobile_number || undefined,
        instagram: formData.instagram || undefined,
        surf_package: formData.surf_package,
        is_active: formData.is_active,
        allergies: formData.allergies,
        other_allergies: formData.other_allergies || undefined,
        room: formData.room_id ? rooms.find(r => r.id === formData.room_id) : undefined,
        bed: formData.bed_id ? (() => {
          const bed = rooms.flatMap(r => r.beds).find(b => b.id === formData.bed_id);
          return bed ? { id: formData.bed_id, bed_name: bed.bed_name } : undefined;
        })() : undefined,
        created_at: new Date().toISOString()
      }

      if (showEditModal && selectedGuest) {
        // Update existing guest
        setGuests(guests.map(g => g.id === selectedGuest.id ? { ...g, ...newGuest, id: selectedGuest.id, guest_id: selectedGuest.guest_id, created_at: selectedGuest.created_at } : g))
      } else {
        // Add new guest
        setGuests([newGuest, ...guests])
      }

      setShowCreateModal(false)
      setShowEditModal(false)
      alert('Guest saved successfully')
    } catch (error) {
      console.error('Error saving guest:', error)
      alert('Error saving guest')
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setPackageFilter('all')
    setRoomFilter('all')
    setStatusFilter('all')
  }

  const getAvailableBeds = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId)
    return room?.beds.filter(bed => bed.occupied_count < bed.capacity) || []
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading guests...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Guest Management</h1>
        <button
          onClick={handleCreateGuest}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
          title="Create Guest"
        >
          <PlusIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Package Filter */}
          <select
            value={packageFilter}
            onChange={(e) => setPackageFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Packages</option>
            <option value="surf_package">In Surf Package</option>
            <option value="no_surf_package">Not in Surf Package</option>
          </select>

          {/* Room Filter */}
          <select
            value={roomFilter}
            onChange={(e) => setRoomFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Rooms</option>
            {rooms.map(room => (
              <option key={room.id} value={room.id}>Room {room.room_number}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Clear Filters */}
        {(searchQuery || packageFilter !== 'all' || roomFilter !== 'all' || statusFilter !== 'all') && (
          <div className="mt-4">
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Guest List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name + ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Active
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Surf Package
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Room
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bed
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredGuests.map((guest) => (
              <tr key={guest.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{guest.name}</div>
                    <div className="text-sm text-gray-500">{guest.guest_id}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    guest.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {guest.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    guest.surf_package
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {guest.surf_package ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {guest.room ? (
                    <span className="cursor-pointer text-blue-600 hover:text-blue-800">
                      {guest.room.room_number}
                    </span>
                  ) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {guest.bed?.bed_name || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleViewGuest(guest)}
                    className="text-blue-600 hover:text-blue-800"
                    title="View"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEditGuest(guest)}
                    className="text-green-600 hover:text-green-800"
                    title="Edit"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteGuest(guest)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredGuests.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {guests.length === 0 ? 'No guests found' : 'No guests match your filters'}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {showCreateModal ? 'Create Guest' : 'Edit Guest'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setShowEditModal(false)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Personal Information Tab */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Personal Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    value={formData.mobile_number}
                    onChange={(e) => setFormData({...formData, mobile_number: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instagram
                  </label>
                  <input
                    type="text"
                    value={formData.instagram}
                    onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room
                  </label>
                  <select
                    value={formData.room_id}
                    onChange={(e) => setFormData({...formData, room_id: e.target.value, bed_id: ''})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Room</option>
                    {rooms.map(room => (
                      <option key={room.id} value={room.id}>Room {room.room_number}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bed
                  </label>
                  <select
                    value={formData.bed_id}
                    onChange={(e) => setFormData({...formData, bed_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!formData.room_id}
                  >
                    <option value="">Select Bed</option>
                    {formData.room_id && getAvailableBeds(formData.room_id).map(bed => (
                      <option key={bed.id} value={bed.id}>{bed.bed_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.surf_package}
                    onChange={(e) => setFormData({...formData, surf_package: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm">Included in surf package</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm">Active</span>
                </label>
              </div>

              {/* Allergies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allergies
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {ALLERGY_OPTIONS.map(allergy => (
                    <label key={allergy} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.allergies[allergy] || false}
                        onChange={(e) => setFormData({
                          ...formData,
                          allergies: {
                            ...formData.allergies,
                            [allergy]: e.target.checked
                          }
                        })}
                        className="mr-1"
                      />
                      <span className="text-sm capitalize">{allergy}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Other Allergies
                </label>
                <textarea
                  value={formData.other_allergies}
                  onChange={(e) => setFormData({...formData, other_allergies: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setShowEditModal(false)
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveGuest}
                disabled={!formData.name}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Guest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedGuest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Guest Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedGuest.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Guest ID</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedGuest.guest_id}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Mobile</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedGuest.mobile_number || '-'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Instagram</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedGuest.instagram || '-'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Surf Package</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedGuest.surf_package
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedGuest.surf_package ? 'Yes' : 'No'}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedGuest.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedGuest.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Room</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedGuest.room?.room_number || 'Not assigned'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Bed</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedGuest.bed?.bed_name || 'Not assigned'}</p>
                </div>
              </div>

              {/* Allergies */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Allergies</label>
                <div className="mt-1 flex flex-wrap gap-1">
                  {selectedGuest.allergies && Object.entries(selectedGuest.allergies)
                    .filter(([_, value]) => value)
                    .map(([allergy]) => (
                      <span key={allergy} className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 capitalize">
                        {allergy}
                      </span>
                    ))}
                  {(!selectedGuest.allergies || Object.keys(selectedGuest.allergies).length === 0) && (
                    <span className="text-sm text-gray-500">None</span>
                  )}
                </div>
              </div>

              {selectedGuest.other_allergies && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Other Allergies</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedGuest.other_allergies}</p>
                </div>
              )}

              {/* QR Code placeholder */}
              <div>
                <label className="block text-sm font-medium text-gray-700">QR Code</label>
                <div className="mt-1 h-32 w-32 bg-gray-100 border border-gray-300 rounded-md flex items-center justify-center">
                  <span className="text-xs text-gray-500">QR Code</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}