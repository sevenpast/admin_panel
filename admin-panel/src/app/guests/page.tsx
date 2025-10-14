'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  UserCircleIcon
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
  bed_assignments?: Array<{
    id: string
    bed_id: string
    status: string
    assigned_at: string
    beds?: {
      id: string
      bed_id: string
      identifier: string
      bed_type: string
      capacity: number
      current_occupancy: number
      rooms?: {
        id: string
        name: string
        room_number: string
      }
    }
  }>
  equipment_assignments?: Array<{
    id: string
    equipment_id: string
    status: string
    assigned_at: string
    equipment?: {
      id: string
      name: string
      equipment_id: string
      category: string
    }
  }>
  created_at: string
}

interface Room {
  id: string
  room_id: string
  name: string
  room_number?: string
  room_type: string
  description?: string
  beds?: Bed[]
}

interface Bed {
  id: string
  bed_id: string
  identifier: string
  bed_type: string
  capacity: number
  current_occupancy: number
  bed_assignments?: Array<{
    id: string
    status: string
    guest_id: string
    guests?: {
      id: string
      guest_id: string
      name: string
    }
  }>
}

const ALLERGY_OPTIONS = [
  'nuts', 'dairy', 'gluten', 'shellfish', 'eggs', 'soy', 'fish', 'sesame'
]

export default function GuestsPage() {
  const router = useRouter()
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
  const [activeTab, setActiveTab] = useState<'information' | 'assessment'>('information')
  const [assessmentQuestions, setAssessmentQuestions] = useState<any[]>([])
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, number>>({})

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
    loadAssessmentQuestions()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load guests first
      const guestsResponse = await fetch('/api/guests')
      if (guestsResponse.ok) {
        const guestsData = await guestsResponse.json()
        setGuests(guestsData.data || [])
      } else {
        console.error('Error loading guests:', await guestsResponse.text())
        setGuests([])
      }

      // Load rooms with beds and assignments
      try {
        const roomsResponse = await fetch('/api/rooms')
        if (roomsResponse.ok) {
          const roomsData = await roomsResponse.json()
          setRooms(roomsData)
        } else {
          console.warn('Rooms API not available:', await roomsResponse.text())
          setRooms([])
        }
      } catch (roomsError) {
        console.warn('Rooms API not found, continuing without rooms data')
        setRooms([])
      }
    } catch (error) {
      console.error('Error loading data:', error)
      setGuests([])
      setRooms([])
    } finally {
      setLoading(false)
    }
  }

  // Filter and search logic
  const filteredGuests = useMemo(() => {
    if (!Array.isArray(guests)) return []
    return guests.filter(guest => {
      // Search filter
      if (searchQuery && !guest.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      // Package filter
      if (packageFilter === 'surf_package' && !guest.surf_package) return false
      if (packageFilter === 'no_surf_package' && guest.surf_package) return false

      // Room filter
      if (roomFilter !== 'all') {
        const currentBedAssignment = guest.bed_assignments?.find(assignment => assignment.status === 'active')
        const currentRoomId = currentBedAssignment?.beds?.rooms?.id
        if (currentRoomId !== roomFilter) return false
      }

      // Status filter
      if (statusFilter === 'active' && !guest.is_active) return false
      if (statusFilter === 'inactive' && guest.is_active) return false

      return true
    })
  }, [guests, searchQuery, packageFilter, roomFilter, statusFilter])

  // Load assessment questions
  const loadAssessmentQuestions = async () => {
    try {
      const response = await fetch('/api/assessment-questions')
      if (response.ok) {
        const questions = await response.json()
        setAssessmentQuestions(questions)
      }
    } catch (error) {
      console.error('Error loading assessment questions:', error)
    }
  }

  // Load assessment answers for a guest
  const loadAssessmentAnswers = async (guestId: string) => {
    try {
      const response = await fetch(`/api/guest-assessments?guest_id=${guestId}`)
      if (response.ok) {
        const answers = await response.json()
        const answersMap: Record<string, number> = {}
        answers.forEach((answer: any) => {
          answersMap[answer.question_id] = answer.answer_value
        })
        setAssessmentAnswers(answersMap)
      }
    } catch (error) {
      console.error('Error loading assessment answers:', error)
    }
  }

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
    setAssessmentAnswers({})
    setActiveTab('information')
    setShowCreateModal(true)
  }

  const handleViewModal = (guest: Guest) => {
    setSelectedGuest(guest)
    setShowViewModal(true)
  }

  const handleViewGuest = (guest: Guest) => {
    router.push(`/guests/${guest.id}`)
  }

  const handleEditGuest = async (guest: Guest) => {
    setSelectedGuest(guest)
    
    // Get current bed assignment
    const currentBedAssignment = guest.bed_assignments?.find(assignment => assignment.status === 'active')
    const currentBed = currentBedAssignment?.beds
    const currentRoom = currentBed?.rooms
    
    setFormData({
      name: guest.name,
      mobile_number: guest.mobile_number || '',
      instagram: guest.instagram || '',
      room_id: currentRoom?.id || '',
      bed_id: currentBed?.id || '',
      surf_package: guest.surf_package,
      is_active: guest.is_active,
      allergies: guest.allergies || {},
      other_allergies: guest.other_allergies || ''
    })
    
    // Load assessment answers for this guest
    await loadAssessmentAnswers(guest.id)
    
    setActiveTab('information')
    setShowEditModal(true)
  }

  const handleDeleteGuest = async (guest: Guest) => {
    if (confirm(`Are you sure you want to delete ${guest.name}? This action cannot be undone.`)) {
      try {
        const { error } = await supabase
          .from('guests')
          .delete()
          .eq('id', guest.id)

        if (error) {
          console.error('Error deleting guest:', error)
          alert('Error deleting guest')
          return
        }

        setGuests(guests.filter(g => g.id !== guest.id))
        alert('Guest deleted successfully')
      } catch (error) {
        console.error('Error deleting guest:', error)
        alert('Error deleting guest')
      }
    }
  }

  // BED ASSIGNMENT LOGIC - COMPLETELY INDEPENDENT
  const handleBedAssignment = async (guestId: string) => {
    if (!formData.bed_id) return

    try {
      // If editing, remove existing bed assignment first
      if (showEditModal && selectedGuest) {
        const currentBedAssignment = selectedGuest.bed_assignments?.find(assignment => assignment.status === 'active')
        if (currentBedAssignment && currentBedAssignment.bed_id !== formData.bed_id) {
          await fetch(`/api/bed-assignments?id=${currentBedAssignment.id}`, {
            method: 'DELETE'
          })
        }
      }

      // Check bed availability
      if (formData.room_id && formData.bed_id) {
        const currentAvailableBeds = await loadAvailableBeds(formData.room_id)
        const selectedBed = currentAvailableBeds.find(bed => bed.id === formData.bed_id)
        
        if (!selectedBed) {
          alert('Selected bed is no longer available. Please select a different bed.')
          setFormData({...formData, bed_id: ''})
          return
        }
      }

      // Assign bed
      const bedResponse = await fetch('/api/bed-assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bed_id: formData.bed_id,
          guest_id: guestId
        })
      })

      if (!bedResponse.ok) {
        const error = await bedResponse.json()
        alert(`Bed assignment failed: ${error.error}`)
        return
      }

      alert('Bed assignment saved successfully')
    } catch (error) {
      console.error('Error assigning bed:', error)
      alert('Bed assignment failed')
    }
  }

  // SURF ASSESSMENT LOGIC - COMPLETELY INDEPENDENT
  const handleSurfAssessment = async (guestId: string) => {
    if (Object.keys(assessmentAnswers).length === 0) return

    try {
      const answers = Object.entries(assessmentAnswers).map(([questionId, value]) => ({
        question_id: questionId,
        answer_value: value
      }))

      const assessmentResponse = await fetch('/api/guest-assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          guest_id: guestId,
          answers: answers
        })
      })

      if (!assessmentResponse.ok) {
        const error = await assessmentResponse.json()
        alert(`Assessment answers failed: ${error.error}`)
        return
      }

      alert('Assessment answers saved successfully')
    } catch (error) {
      console.error('Error saving assessment answers:', error)
      alert('Assessment answers failed')
    }
  }

  // MAIN SAVE FUNCTION - ORCHESTRATES INDEPENDENT LOGICS
  const handleSaveGuest = async () => {
    try {
      const guestData = {
        name: formData.name,
        mobile_number: formData.mobile_number || null,
        instagram: formData.instagram || null,
        surf_package: formData.surf_package,
        is_active: formData.is_active,
        allergies: formData.allergies,
        other_allergies: formData.other_allergies || null
      }

      let guestId: string

      if (showEditModal && selectedGuest) {
        // Update existing guest
        const response = await fetch('/api/guests', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: selectedGuest.id,
            ...guestData
          })
        })

        if (!response.ok) {
          const error = await response.json()
          alert(`Error updating guest: ${error.error}`)
          return
        }

        const updatedGuest = await response.json()
        guestId = updatedGuest.id
        setGuests(guests.map(g => g.id === selectedGuest.id ? updatedGuest : g))
        alert('Guest updated successfully')
      } else {
        // Create new guest
        const response = await fetch('/api/guests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(guestData)
        })

        if (!response.ok) {
          const error = await response.json()
          alert(`Error creating guest: ${error.error}`)
          return
        }

        const newGuest = await response.json()
        guestId = newGuest.id
        setGuests([newGuest, ...guests])
        alert('Guest created successfully')
      }

      // EXECUTE INDEPENDENT LOGICS BASED ON ACTIVE TAB
      if (activeTab === 'information') {
        // Only handle bed assignment on information tab
        await handleBedAssignment(guestId)
      } else if (activeTab === 'assessment') {
        // Only handle surf assessment on assessment tab
        await handleSurfAssessment(guestId)
      }

      // Refresh data to show updated bed assignments and assessment answers
      await loadData()

      setShowCreateModal(false)
      setShowEditModal(false)
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

  const [availableBeds, setAvailableBeds] = useState<any[]>([])

  const loadAvailableBeds = async (roomId: string) => {
    try {
      const response = await fetch(`/api/available-beds?room_id=${roomId}`)
      if (response.ok) {
        const beds = await response.json()
        setAvailableBeds(beds)
        return beds // Return the beds directly
      } else {
        console.error('Error loading available beds:', response.statusText)
        setAvailableBeds([])
        return []
      }
    } catch (error) {
      console.error('Error loading available beds:', error)
      setAvailableBeds([])
      return []
    }
  }

  const getAvailableBeds = (roomId: string) => {
    return availableBeds // API now returns only available beds
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
            {rooms.length > 0 ? (
              rooms.map(room => (
                <option key={room.id} value={room.id}>
                  {room.room_number || room.name || `Room ${room.room_id}`}
                </option>
              ))
            ) : (
              <option value="no_rooms" disabled>No rooms available</option>
            )}
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
                  {(() => {
                    const currentBedAssignment = guest.bed_assignments?.find(assignment => assignment.status === 'active')
                    const currentRoom = currentBedAssignment?.beds?.rooms
                    return currentRoom ? (
                      <div className="flex flex-col">
                        <span className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                          {currentRoom.room_number || currentRoom.name || `Room ${currentRoom.id}`}
                        </span>
                        <span className="text-xs text-gray-500">
                          Room ID: {currentRoom.id.slice(0, 8)}...
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">No room assigned</span>
                    )
                  })()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {(() => {
                    const currentBedAssignment = guest.bed_assignments?.find(assignment => assignment.status === 'active')
                    const currentBed = currentBedAssignment?.beds
                    return currentBed ? (
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {currentBed.identifier || currentBed.bed_id}
                        </span>
                        <span className="text-xs text-gray-500">
                          {currentBed.bed_type} • {currentBed.current_occupancy}/{currentBed.capacity} occupied
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">No bed assigned</span>
                    )
                  })()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleViewModal(guest)}
                    className="text-blue-600 hover:text-blue-800"
                    title="View"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleViewGuest(guest)}
                    className="text-purple-600 hover:text-purple-800"
                    title="Guest Detail"
                  >
                    <UserCircleIcon className="h-4 w-4" />
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

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab('information')}
                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                  activeTab === 'information'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Personal Information
              </button>
              <button
                onClick={() => setActiveTab('assessment')}
                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                  activeTab === 'assessment'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Surf Assessment
              </button>
            </div>

            {/* Personal Information Tab */}
            {activeTab === 'information' && (
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

                {rooms.length > 0 && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Room
                      </label>
                      <select
                        value={formData.room_id}
                        onChange={(e) => {
                          const roomId = e.target.value
                          setFormData({...formData, room_id: roomId, bed_id: ''})
                          if (roomId) {
                            loadAvailableBeds(roomId)
                          } else {
                            setAvailableBeds([])
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Room</option>
                        {rooms.map(room => (
                          <option key={room.id} value={room.id}>
                            {room.room_number || room.name || `Room ${room.room_id}`}
                          </option>
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
                        {formData.room_id && availableBeds.map(bed => (
                          <option key={bed.id} value={bed.id}>
                            {bed.identifier || bed.bed_id} ({bed.bed_type}) - {bed.current_occupancy || 0}/{bed.capacity || 1} occupied
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
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
            )}

            {/* Surf Assessment Tab */}
            {activeTab === 'assessment' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Surf Assessment</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Answer the following questions to help determine your surf level. All questions are optional.
                </p>
                
                {assessmentQuestions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No assessment questions available.</p>
                    <p className="text-sm">Please create assessment questions in the Lessons module first.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {assessmentQuestions.map((question) => (
                      <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="mb-3">
                          <h4 className="font-medium text-gray-900">{question.question_text}</h4>
                          {question.is_required && (
                            <span className="text-red-500 text-sm">* Required</span>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <button
                              key={value}
                              onClick={() => setAssessmentAnswers(prev => ({
                                ...prev,
                                [question.id]: value
                              }))}
                              className={`px-3 py-2 text-sm border rounded-md transition-colors ${
                                assessmentAnswers[question.id] === value
                                  ? 'bg-blue-500 text-white border-blue-500'
                                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <div className="text-center">
                                <div className="font-medium">{value}</div>
                                <div className="text-xs opacity-75">
                                  {question.scale_labels?.[value] || `Option ${value}`}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                        
                        {assessmentAnswers[question.id] && (
                          <div className="mt-2 text-sm text-gray-600">
                            Selected: {assessmentAnswers[question.id]} - {question.scale_labels?.[assessmentAnswers[question.id]]}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

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