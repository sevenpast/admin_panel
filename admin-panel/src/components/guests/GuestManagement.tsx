'use client'

import { useState, useEffect } from 'react'
import { useToastContext } from '@/components/common/ToastProvider'
import {
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  PhoneIcon,
  HomeIcon,
  DocumentChartBarIcon,
  CheckIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UsersIcon,
  BeakerIcon,
  CakeIcon
} from '@heroicons/react/24/outline'

interface Guest {
  id: string
  guest_id: string
  name: string
  mobile_number?: string
  instagram?: string
  surf_package: boolean
  is_active: boolean
  allergies?: Record<string, boolean>
  other_allergies?: string
  room_assignment?: {
    room_number: string
    bed_name: string
  }
  created_at: string
  // Assessment Answers
  assessment_answers?: Record<string, number>
}

interface AssessmentQuestion {
  id: string
  question_text: string
  category: string
  scale_labels: Record<string, string>
  is_required: boolean
  is_active: boolean
  sort_order: number
}

interface GuestManagementProps {
  initialGuests?: Guest[]
  initialAssessmentQuestions?: AssessmentQuestion[]
}

export default function GuestManagement({ initialGuests = [], initialAssessmentQuestions = [] }: GuestManagementProps) {
  const { success, error } = useToastContext()
  const [guests, setguests] = useState<Guest[]>(initialGuests)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [packageFilter, setPackageFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [selectedGuestForActivity, setSelectedGuestForActivity] = useState<Guest | null>(null)
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [assessmentQuestions, setAssessmentQuestions] = useState<AssessmentQuestion[]>(initialAssessmentQuestions)
  const [activeTab, setActiveTab] = useState<'personal' | 'assessment'>('personal')
  const [viewActiveTab, setViewActiveTab] = useState<'personal' | 'assessment'>('personal')
  const [viewEditMode, setViewEditMode] = useState(false)
  const [viewFormData, setViewFormData] = useState<Record<string, number>>({})

  // Room and bed assignment states
  const [availableRooms, setAvailableRooms] = useState<any[]>([])
  const [availableBeds, setAvailableBeds] = useState<any[]>([])
  const [loadingRooms, setLoadingRooms] = useState(false)
  const [loadingBeds, setLoadingBeds] = useState(false)

  // Activity report states
  const [guestActivities, setGuestActivities] = useState<any>(null)
  const [loadingActivities, setLoadingActivities] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    mobile_number: '',
    instagram: '',
    surf_package: true,
    is_active: true,
    allergies: {} as Record<string, boolean>,
    other_allergies: '',
    // Room and bed assignment
    assigned_room_id: '',
    assigned_bed_id: '',
    // Assessment Answers
    assessment_answers: {} as Record<string, number>
  })

  const ALLERGY_OPTIONS = [
    'nuts', 'dairy', 'gluten', 'shellfish', 'eggs', 'soy', 'fish', 'sesame'
  ]

  useEffect(() => {
    // Only load guests if no initial data provided
    if (initialGuests.length === 0 && typeof window !== 'undefined') {
      loadGuests()
    }
  }, [initialGuests.length])

  // Assessment questions are loaded via SSR, no need for client-side loading

  const loadGuests = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/guests').catch(() => null)
      if (response?.ok) {
        const result = await response.json()
        const guestsData = result.success ? result.data : result
        setGuests(guestsData || [])
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableRooms = async () => {
    setLoadingRooms(true)
    try {
      const response = await fetch('/api/rooms').catch(() => null)
      if (response?.ok) {
        const rooms = await response.json()
        // Calculate available bed capacity for each room
        const roomsWithAvailableBeds = rooms.map((room: any) => {
          let totalCapacity = 0
          let occupiedCapacity = 0
          let availableBeds = 0

          room.beds?.forEach((bed: any) => {
            const bedCapacity = bed.capacity || 1
            totalCapacity += bedCapacity

            const activeAssignments = bed.bed_assignments?.filter(
              (assignment: any) => assignment.status === 'active'
            ).length || 0

            occupiedCapacity += activeAssignments

            // Check if this bed has available capacity
            if (activeAssignments < bedCapacity) {
              availableBeds++
            }
          })

          return {
            ...room,
            total_beds: room.beds?.length || 0,
            total_capacity: totalCapacity,
            occupied_capacity: occupiedCapacity,
            available_beds: availableBeds,
            available_capacity: totalCapacity - occupiedCapacity
          }
        })
        setAvailableRooms(roomsWithAvailableBeds || [])
        console.log('Rooms with bed counts:', roomsWithAvailableBeds)
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoadingRooms(false)
    }
  }

  const loadAvailableBeds = async (roomId?: string) => {
    setLoadingBeds(true)
    try {
      const url = roomId ? `/api/available-beds?room_id=${roomId}` : '/api/available-beds'
      const response = await fetch(url).catch(() => null)
      if (response?.ok) {
        const beds = await response.json()
        setAvailableBeds(beds || [])
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoadingBeds(false)
    }
  }

  const loadGuestActivities = async (guestId: string) => {
    setLoadingActivities(true)
    try {
      const response = await fetch(`/api/guests/${guestId}/activities`).catch(() => null)
      if (response?.ok) {
        const activities = await response.json()
        setGuestActivities(activities)
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoadingActivities(false)
    }
  }

  const loadGuestAssessments = async (guestId: string) => {
    try {
      const response = await fetch(`/api/guest-assessments?guest_id=${guestId}`).catch(() => null)
      if (response?.ok) {
        const assessments = await response.json()
        // Convert assessments array to key-value pairs for viewFormData
        const assessmentAnswers: Record<string, number> = {}
        if (Array.isArray(assessments)) {
          assessments.forEach((assessment: any) => {
            assessmentAnswers[assessment.question_id] = assessment.answer_value
          })
        }
        setViewFormData(assessmentAnswers)
      } else {
        // If no assessments found, set empty object
        setViewFormData({})
      }
    } catch (err) {
      console.error('Error:', err)
      setViewFormData({})
    }
  }

  const handleSaveGuest = async () => {
    try {
      console.log('Saving guest with data:', formData)

      const url = selectedGuest ? `/api/guests/${selectedGuest.id}` : '/api/guests'
      const method = selectedGuest ? 'PUT' : 'POST'

      // Remove assessment_answers, assigned_room_id, and assigned_bed_id from guest data - these are handled separately
      const { assessment_answers, assigned_room_id, assigned_bed_id, ...guestData } = formData

      console.log('Making request to:', url, 'with method:', method)
      console.log('Guest data (without assessments):', guestData)

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(guestData),
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (response.ok) {
        const result = await response.json()
        console.log('Save successful:', result)

        // If a bed was selected, assign the bed (works for both create and edit)
        const guestId = selectedGuest ? selectedGuest.id : result.id
        if (assigned_bed_id && guestId) {
          try {
            const bedAssignmentResponse = await fetch('/api/bed-assignments', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                bed_id: assigned_bed_id,
                guest_id: guestId
              }),
            })

            if (!bedAssignmentResponse.ok) {
              const errorData = await bedAssignmentResponse.json()
              console.error('Failed to assign bed:', errorData)
              error(`Guest saved but bed assignment failed: ${errorData.error}`)
            } else {
              console.log('Bed assignment successful')
            }
          } catch (bedError) {
            console.error('Error assigning bed:', bedError)
            success('Guest saved but bed assignment failed')
          }
        }

        setShowCreateModal(false)
        setShowEditModal(false)
        setSelectedGuest(null)
        loadGuests()
      } else {
        const errorText = await response.text()
        console.error('Save failed:', response.status, errorText)
        error(`Failed to save guest: ${errorText}`)
      }
    } catch (err) {
      console.error('Error:', err)
      error(`Error: ${err.message}`)
    }
  }

  const handleDeleteGuest = async (guestId: string) => {
    if (confirm('Are you sure you want to delete this guest?')) {
      try {
        const response = await fetch(`/api/guests/${guestId}`, {
          method: 'DELETE',
        }).catch(() => null)

        if (response?.ok) {
          loadGuests()
        }
      } catch (err) {
        console.error('Error:', err)
      }
    }
  }

  const filteredGuests = guests.filter(guest => {
    if (searchQuery && !guest.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (packageFilter === 'surf_package' && !guest.surf_package) return false
    if (packageFilter === 'no_surf_package' && guest.surf_package) return false
    if (statusFilter === 'active' && !guest.is_active) return false
    if (statusFilter === 'inactive' && guest.is_active) return false
    return true
  })

  const handleCreateGuest = () => {
    setFormData({
      name: '',
      mobile_number: '',
      instagram: '',
      surf_package: true,
      is_active: true,
      allergies: {},
      other_allergies: '',
      assigned_room_id: '',
      assigned_bed_id: '',
      // Assessment Answers
      assessment_answers: {}
    })
    setActiveTab('personal')
    setShowCreateModal(true)
    // Load available rooms and beds when creating a new guest
    loadAvailableRooms()
    loadAvailableBeds()
  }

  const handleEditGuest = (guest: Guest) => {
    setSelectedGuest(guest)
    setFormData({
      name: guest.name,
      mobile_number: guest.mobile_number || '',
      instagram: guest.instagram || '',
      surf_package: guest.surf_package,
      is_active: guest.is_active,
      allergies: guest.allergies || {},
      other_allergies: guest.other_allergies || '',
      assigned_room_id: '',
      assigned_bed_id: '',
      // Assessment Answers
      assessment_answers: guest.assessment_answers || {}
    })
    setActiveTab('personal')
    setShowEditModal(true)
    // Load rooms and beds for editing
    loadAvailableRooms()
    loadAvailableBeds()
  }

  const handleViewGuest = async (guest: Guest) => {
    setSelectedGuest(guest)
    setViewActiveTab('personal')
    setViewEditMode(true)
    setShowViewModal(true)
    // Load fresh assessment data from the database
    await loadGuestAssessments(guest.id)
  }

  const handleViewActivity = (guest: Guest) => {
    setSelectedGuestForActivity(guest)
    setGuestActivities(null) // Reset previous data
    setShowActivityModal(true)
    loadGuestActivities(guest.id)
    // Also load assessment answers for the activity view
    loadGuestAssessments(guest.id)
  }

  const handleSaveAssessment = async () => {
    if (!selectedGuest) return

    try {
      // Convert viewFormData to the format expected by guest_assessments API
      const answers = Object.entries(viewFormData).map(([questionId, answerValue]) => ({
        question_id: questionId,
        answer_value: parseInt(answerValue as string)
      }))

      const response = await fetch('/api/guest-assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guest_id: selectedGuest.id,
          answers: answers
        }),
      }).catch(() => null)

      if (response?.ok) {
        // Update the selected guest with new assessment answers
        setSelectedGuest({
          ...selectedGuest,
          assessment_answers: viewFormData
        })
        setViewEditMode(false)
        // Refresh the guest list
        loadGuests()
        // Reload assessment data to ensure consistency
        loadGuestAssessments(selectedGuest.id)
        success('Assessment answers saved successfully!')
      } else {
        const errorData = await response?.text()
        console.error('Failed to save assessment answers:', response?.status, errorData)
        error('Failed to save assessment answers. Please try again.')
      }
    } catch (err) {
      console.error('Error:', err)
      error('Error saving assessment answers. Please check your connection and try again.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Guest Management</h1>
          <p className="text-gray-600 mt-1">Manage guest profiles and information</p>
        </div>
        <button
          onClick={handleCreateGuest}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md"
        >
          <PlusIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <select
            value={packageFilter}
            onChange={(e) => setPackageFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Packages</option>
            <option value="surf_package">Surf Package</option>
            <option value="no_surf_package">No Surf Package</option>
          </select>
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
      </div>

      {/* Guest Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Surf Package</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Loading guests...</td>
              </tr>
            ) : filteredGuests.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No guests found</td>
              </tr>
            ) : (
              filteredGuests.map((guest) => (
                <tr key={guest.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {guest.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{guest.name}</div>
                        <div className="text-sm text-gray-500">{guest.guest_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {guest.mobile_number && (
                        <div className="flex items-center">
                          <PhoneIcon className="h-4 w-4 mr-1 text-gray-400" />
                          {guest.mobile_number}
                        </div>
                      )}
                      {guest.instagram && (
                        <div className="text-sm text-gray-500">@{guest.instagram}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      guest.surf_package ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {guest.surf_package ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {guest.room_assignment ? (
                      <div className="flex items-center">
                        <HomeIcon className="h-4 w-4 mr-1 text-gray-400" />
                        <div>
                          <div>{guest.room_assignment.room_number}</div>
                          <div className="text-xs text-gray-500">{guest.room_assignment.bed_name}</div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">No assignment</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      guest.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {guest.is_active ? 'Active' : 'Inactive'}
                    </span>
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
                      onClick={() => handleViewActivity(guest)}
                      className="text-purple-600 hover:text-purple-800"
                      title="Activity Report"
                    >
                      <DocumentChartBarIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditGuest(guest)}
                      className="text-green-600 hover:text-green-800"
                      title="Edit"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteGuest(guest.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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

            {/* Tabs */}
            <div className="flex space-x-1 mb-6">
              <button
                onClick={() => setActiveTab('personal')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'personal'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Personal Information
              </button>
              <button
                onClick={() => setActiveTab('assessment')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'assessment'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Surf Assessment
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'personal' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
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
                        Instagram Handle
                      </label>
                      <input
                        type="text"
                        value={formData.instagram}
                        onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="@username"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Room (Optional)
                      </label>
                      <select
                        value={formData.assigned_room_id}
                        onChange={(e) => {
                          const roomId = e.target.value
                          setFormData({
                            ...formData,
                            assigned_room_id: roomId,
                            assigned_bed_id: '' // Reset bed selection when room changes
                          })
                          if (roomId) {
                            loadAvailableBeds(roomId)
                          } else {
                            setAvailableBeds([])
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loadingRooms}
                      >
                        <option value="">No room assignment</option>
                        {loadingRooms ? (
                          <option disabled>Loading rooms...</option>
                        ) : (
                          availableRooms.map((room) => (
                            <option key={room.id} value={room.id}>
                              {room.name} ({room.room_type || room.type}) - {room.available_capacity}/{room.total_capacity} spots available
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    {formData.assigned_room_id && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Select Bed (Optional)
                        </label>
                        <select
                          value={formData.assigned_bed_id}
                          onChange={(e) => setFormData({...formData, assigned_bed_id: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={loadingBeds}
                        >
                          <option value="">No bed assignment</option>
                          {loadingBeds ? (
                            <option disabled>Loading beds...</option>
                          ) : (
                            availableBeds.map((bed) => (
                              <option key={bed.id} value={bed.id}>
                                {bed.bed_name} ({bed.bed_type}) - {bed.available_spots}/{bed.capacity} spots available
                              </option>
                            ))
                          )}
                        </select>
                        {availableBeds.length === 0 && !loadingBeds && (
                          <p className="text-sm text-gray-500 mt-1">No available beds in this room</p>
                        )}
                      </div>
                    )}

                  </div>

                  <div className="space-y-2 mt-4">
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
                      <span className="text-sm">Active guest</span>
                    </label>
                  </div>

                  <div className="mt-6">
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

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Other Allergies
                    </label>
                    <textarea
                      value={formData.other_allergies}
                      onChange={(e) => setFormData({...formData, other_allergies: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Describe any other allergies or dietary restrictions..."
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'assessment' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Surf Assessment</h3>
                  {assessmentQuestions.length > 0 ? (
                    <div className="space-y-6">
                      {assessmentQuestions.map((question) => (
                        <div key={question.id} className="w-full">
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            {question.question_text}
                          </label>
                          <div className="flex justify-center space-x-4">
                            {Object.entries(question.scale_labels).map(([value, label]) => (
                              <div key={value} className="flex flex-col items-center">
                                <button
                                  type="button"
                                  onClick={() => setFormData({
                                    ...formData,
                                    assessment_answers: {
                                      ...formData.assessment_answers,
                                      [question.id]: parseInt(value)
                                    }
                                  })}
                                  className={`w-12 h-12 rounded-full text-sm font-medium transition-colors ${
                                    formData.assessment_answers[question.id] === parseInt(value)
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                  }`}
                                >
                                  {value}
                                </button>
                                <span className="mt-2 text-xs text-gray-500 text-center max-w-16">
                                  {label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No assessment questions available. Please add questions in the Lessons section.</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setShowEditModal(false)
                }}
                className="p-2 text-gray-600 hover:text-gray-800 rounded-md hover:bg-gray-100"
                title="Cancel"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
              <button
                onClick={handleSaveGuest}
                disabled={!formData.name}
                className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Save Guest"
              >
                <CheckIcon className="h-5 w-5" />
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
                className="text-gray-400 hover:text-gray-600 p-1"
                title="Close"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 mb-6">
              <button
                onClick={() => setViewActiveTab('personal')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  viewActiveTab === 'personal'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Personal Information
              </button>
              <button
                onClick={() => setViewActiveTab('assessment')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  viewActiveTab === 'assessment'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Surf Assessment
              </button>
            </div>

            {/* Tab Content */}
            {viewActiveTab === 'personal' && (
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
                    <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedGuest.mobile_number || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Instagram</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedGuest.instagram || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Surf Package</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedGuest.surf_package ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedGuest.is_active ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>

                {selectedGuest.room_assignment && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Room Assignment</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedGuest.room_assignment.room_number} - {selectedGuest.room_assignment.bed_name}
                    </p>
                  </div>
                )}

                {Object.keys(selectedGuest.allergies || {}).length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Allergies</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {Object.entries(selectedGuest.allergies || {}).map(([allergy, hasAllergy]) => (
                        hasAllergy && (
                          <span key={allergy} className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            {allergy}
                          </span>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {selectedGuest.other_allergies && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Other Allergies</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedGuest.other_allergies}</p>
                  </div>
                )}
              </div>
            )}

            {viewActiveTab === 'assessment' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Surf Assessment</h3>
                {assessmentQuestions.length > 0 ? (
                  <div className="space-y-6">
                    {assessmentQuestions.map((question) => {
                      const answer = viewFormData[question.id]
                      return (
                        <div key={question.id} className="w-full">
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            {question.question_text}
                          </label>
                          <div className="flex justify-center space-x-4">
                            {Object.entries(question.scale_labels).map(([value, label]) => (
                              <div key={value} className="flex flex-col items-center">
                                <button
                                  type="button"
                                  onClick={() => setViewFormData({
                                    ...viewFormData,
                                    [question.id]: parseInt(value)
                                  })}
                                  className={`w-12 h-12 rounded-full text-sm font-medium transition-colors ${
                                    answer === parseInt(value)
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300 cursor-pointer'
                                  }`}
                                >
                                  {value}
                                </button>
                                <span className="mt-2 text-xs text-gray-500 text-center max-w-16">
                                  {label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500">No assessment questions available. Please add questions in the Lessons section.</p>
                )}
              </div>
            )}

            <div className="flex justify-end items-center mt-6 space-x-2">
              {viewActiveTab === 'assessment' && (
                <button
                  onClick={handleSaveAssessment}
                  className="text-green-600 hover:text-green-700 p-2"
                  title="Save Changes"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V7l-4-4H7z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v4h6V3" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 13h8" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17h6" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2"
                title="Close"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Report Modal */}
      {showActivityModal && selectedGuestForActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Activity Report - {selectedGuestForActivity.name}</h2>
              <button
                onClick={() => setShowActivityModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {loadingActivities ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-lg text-gray-600">Loading activities...</div>
                </div>
              ) : guestActivities ? (
                <>
                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                      <BeakerIcon className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                      <div className="text-lg font-semibold text-blue-900">{guestActivities.lessons?.length || 0}</div>
                      <div className="text-xs text-blue-600">Lessons</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg text-center">
                      <CakeIcon className="h-6 w-6 text-green-600 mx-auto mb-1" />
                      <div className="text-lg font-semibold text-green-900">{guestActivities.meals?.length || 0}</div>
                      <div className="text-xs text-green-600">Meals</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg text-center">
                      <CalendarIcon className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                      <div className="text-lg font-semibold text-purple-900">{guestActivities.events?.length || 0}</div>
                      <div className="text-xs text-purple-600">Events</div>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg text-center">
                      <UsersIcon className="h-6 w-6 text-orange-600 mx-auto mb-1" />
                      <div className="text-lg font-semibold text-orange-900">{guestActivities.equipment?.length || 0}</div>
                      <div className="text-xs text-orange-600">Equipment</div>
                    </div>
                  </div>

                  {/* Current Room Assignment */}
                  {selectedGuestForActivity.room_assignment && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                        <HomeIcon className="h-4 w-4 mr-2" />
                        Current Room Assignment
                      </h3>
                      <p className="text-sm text-gray-600">
                        {selectedGuestForActivity.room_assignment.room_number} - {selectedGuestForActivity.room_assignment.bed_name}
                      </p>
                    </div>
                  )}

                  {/* Upcoming Lessons */}
                  {guestActivities.lessons && guestActivities.lessons.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                        <BeakerIcon className="h-4 w-4 mr-2" />
                        Surf Lessons
                      </h3>
                      <div className="space-y-3">
                        {guestActivities.lessons.map((lesson: any, index: number) => (
                          <div key={index} className="border border-gray-200 p-3 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                                <div className="flex items-center text-sm text-gray-600 mt-1">
                                  <CalendarIcon className="h-4 w-4 mr-1" />
                                  {new Date(lesson.start_at).toLocaleDateString()}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <ClockIcon className="h-4 w-4 mr-1" />
                                  {new Date(lesson.start_at).toLocaleTimeString()} - {new Date(lesson.end_at).toLocaleTimeString()}
                                </div>
                                {lesson.location && (
                                  <div className="flex items-center text-sm text-gray-600">
                                    <MapPinIcon className="h-4 w-4 mr-1" />
                                    {lesson.location}
                                  </div>
                                )}
                              </div>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                lesson.status === 'published'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {lesson.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Assigned Equipment */}
                  {guestActivities.equipment && guestActivities.equipment.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                        <UsersIcon className="h-4 w-4 mr-2" />
                        Assigned Equipment
                      </h3>
                      <div className="space-y-2">
                        {guestActivities.equipment.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                            <div>
                              <span className="font-medium text-gray-900">{item.name}</span>
                              <span className="text-sm text-gray-600 ml-2">({item.category})</span>
                            </div>
                            <span className="text-xs text-gray-500">
                              Since {new Date(item.assigned_at).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Meals */}
                  {guestActivities.meals && guestActivities.meals.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                        <CakeIcon className="h-4 w-4 mr-2" />
                        Recent Meals
                      </h3>
                      <div className="space-y-2">
                        {guestActivities.meals.slice(0, 5).map((meal: any, index: number) => (
                          <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                            <div>
                              <span className="font-medium text-gray-900">{meal.title}</span>
                              <span className="text-sm text-gray-600 ml-2">({meal.meal_type})</span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(meal.delivery_at).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upcoming Events */}
                  {guestActivities.events && guestActivities.events.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Upcoming Events
                      </h3>
                      <div className="space-y-3">
                        {guestActivities.events.map((event: any, index: number) => (
                          <div key={index} className="border border-gray-200 p-3 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-gray-900">{event.title}</h4>
                                <div className="flex items-center text-sm text-gray-600 mt-1">
                                  <CalendarIcon className="h-4 w-4 mr-1" />
                                  {new Date(event.start_at).toLocaleDateString()}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <ClockIcon className="h-4 w-4 mr-1" />
                                  {new Date(event.start_at).toLocaleTimeString()}
                                </div>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                event.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {event.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty State for each section */}
                  {(!guestActivities.lessons || guestActivities.lessons.length === 0) &&
                   (!guestActivities.meals || guestActivities.meals.length === 0) &&
                   (!guestActivities.events || guestActivities.events.length === 0) &&
                   (!guestActivities.equipment || guestActivities.equipment.length === 0) && (
                    <div className="text-center py-8">
                      <DocumentChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Activities Found</h3>
                      <p className="text-gray-500">This guest has no current activities or assignments.</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-lg text-red-600">Failed to load activities</div>
                  <p className="text-sm text-gray-500 mt-2">Please try again later.</p>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowActivityModal(false)}
                className="p-2 text-gray-600 hover:text-gray-800 rounded-md hover:bg-gray-100"
                title="Close"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}