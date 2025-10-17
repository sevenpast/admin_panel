'use client'

import { useState, useEffect } from 'react'
import { useToastContext } from '@/components/common/ToastProvider'
import { 
  PlusIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon, 
  XMarkIcon, 
  UserIcon, 
  UserPlusIcon,
  HomeIcon
} from '@heroicons/react/24/outline'

interface Room {
  id: string
  room_id: string
  name: string
  room_type: string
  description?: string
  max_capacity: number
  room_number?: string
  numbering_type?: 'numeric' | 'alphabetic'
  numbering_start?: string
  beds?: Bed[]
  created_at: string
}

interface Bed {
  id: string
  bed_id: string
  identifier: string
  bed_type: string
  capacity: number
  current_occupancy: number
  is_active: boolean
  notes?: string
  bed_assignments?: Array<{
    id: string
    bed_id: string
    guest_id: string
    status: string
    guests?: {
      id: string
      name: string
      guest_id: string
    }
  }>
  guests?: Array<{
    id: string
    name: string
    guest_id: string
  }>
  guest?: {
    id: string
    name: string
    guest_id: string
  }
}

interface Guest {
  id: string
  name: string
  guest_id: string
  is_active: boolean
}

const ROOM_TYPES = [
  { value: 'dormitory', label: 'Dormitory' },
  { value: 'private', label: 'Private' },
  { value: 'suite', label: 'Suite' }
]

const NUMBERING_TYPES = [
  { value: 'numeric', label: 'Numerisch (1, 2, 3...)' },
  { value: 'alphabetic', label: 'Alphabetisch (a, b, c...)' }
]

const BED_TYPES = [
  { value: 'single', label: 'Single', capacity: 1 },
  { value: 'double', label: 'Double', capacity: 2 },
  { value: 'bunk', label: 'Bunk', capacity: 2 },
  { value: 'queen', label: 'Queen', capacity: 2 },
  { value: 'king', label: 'King', capacity: 2 },
  { value: 'sofa', label: 'Sofa', capacity: 1 },
  { value: 'extra', label: 'Extra', capacity: 1 },
  { value: 'crib', label: 'Crib', capacity: 1 }
]

export default function BedInventory() {
  const { success, error } = useToastContext()
  const [rooms, setRooms] = useState<Room[]>([])
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)

  // Modals
  const [showRoomModal, setShowRoomModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showBedModal, setShowBedModal] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')

  // Form Data
  const [roomFormData, setRoomFormData] = useState({
    name: '',
    room_type: 'dormitory' as const,
    description: '',
    bed_number: '',
    numbering_type: 'numeric' as const,
    numbering_start: '1',
    bed_count: '',
    beds: [] as any[]
  })

  const [bedFormData, setBedFormData] = useState({
    name: '',
    bed_type: 'single' as const,
    notes: ''
  })

  const [selectedGuestId, setSelectedGuestId] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load real data from API
      const roomsResponse = await fetch('/api/rooms').catch(() => null)
      if (roomsResponse?.ok) {
        const roomsData = await roomsResponse.json()
        
        // Sync current_occupancy with actual assignments for each bed
        const syncedRooms = roomsData.map((room: any) => ({
          ...room,
          beds: room.beds?.map((bed: any) => {
            const activeAssignments = bed.bed_assignments?.filter((assignment: any) => assignment.status === 'active') || []
            return {
              ...bed,
              current_occupancy: activeAssignments.length
            }
          }) || []
        }))
        
        setRooms(syncedRooms)
      } else {
        setRooms([])
      }

      // Load guests from API
      const guestsResponse = await fetch('/api/guests').catch(() => null)
      if (guestsResponse?.ok) {
        const guestsData = await guestsResponse.json()
        setGuests((Array.isArray(guestsData) ? guestsData : []).filter((guest: any) => guest.is_active))
      } else {
        setGuests([])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSelectedRoomData = async () => {
    if (!selectedRoom) return
    
    try {
      const response = await fetch('/api/rooms').catch(() => null)
      if (response?.ok) {
        const roomsData = await response.json()
        
        // Sync current_occupancy with actual assignments for each bed
        const syncedRooms = roomsData.map((room: any) => ({
          ...room,
          beds: room.beds?.map((bed: any) => {
            const activeAssignments = bed.bed_assignments?.filter((assignment: any) => assignment.status === 'active') || []
            return {
              ...bed,
              current_occupancy: activeAssignments.length
            }
          }) || []
        }))
        
        const updatedRoom = syncedRooms.find((room: Room) => room.id === selectedRoom.id)
        if (updatedRoom) {
          setSelectedRoom(updatedRoom)
        }
        setRooms(syncedRooms)
      }
    } catch (error) {
      console.error('Error updating room data:', error)
    }
  }

  const getRoomTypeColor = (type: string) => {
    switch (type) {
      case 'dormitory':
        return 'bg-blue-100 text-blue-800'
      case 'private':
        return 'bg-green-100 text-green-800'
      case 'suite':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'assigned':
        return 'bg-blue-100 text-blue-800'
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleCreateRoom = () => {
    setRoomFormData({
      name: '',
      room_type: 'dormitory',
      description: '',
      bed_number: '',
      numbering_type: 'numeric',
      numbering_start: '1',
      bed_count: '',
      beds: []
    })
    setModalMode('create')
    setShowRoomModal(true)
  }

  const handleEditRoom = (room: Room) => {
    setRoomFormData({
      name: room.name,
      room_type: room.room_type as any,
      description: room.description || '',
      bed_number: room.room_number || '',
      numbering_type: 'numeric',
      numbering_start: '1',
      bed_count: room.beds?.length?.toString() || '',
      beds: room.beds?.map(bed => ({
        id: bed.id,
        identifier: bed.identifier,
        bed_type: bed.bed_type,
        capacity: bed.capacity
      })) || []
    })
    setModalMode('edit')
    setSelectedRoom(room)
    setShowRoomModal(true)
  }

  const handleViewRoom = (room: Room) => {
    setSelectedRoom(room)
    setShowViewModal(true)
  }

  const handleSaveRoom = async () => {
    try {
      // Validation for create mode
      if (modalMode === 'create') {
        if (!roomFormData.name || !roomFormData.bed_count || parseInt(roomFormData.bed_count) < 1) {
          error('Please fill in all required fields (Name and Number of Bed Items)')
          return
        }
      }

      if (modalMode === 'edit' && selectedRoom) {
        const response = await fetch(`/api/rooms?id=${selectedRoom.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: roomFormData.name,
            room_type: roomFormData.room_type,
            description: roomFormData.description,
            room_number: roomFormData.bed_number,
            base_name: roomFormData.name
          })
        }).catch(() => null)

        if (!response?.ok) {
          const err = await response.json()
          error(`Error updating room: ${err.error}`)
          return
        }

        await loadData()
      } else {
        const response = await fetch('/api/rooms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: roomFormData.name,
            room_type: roomFormData.room_type,
            description: roomFormData.description,
            room_number: roomFormData.bed_number,
            base_name: roomFormData.name,
            bed_count: parseInt(roomFormData.bed_count),
            numbering_type: roomFormData.numbering_type,
            numbering_start: roomFormData.numbering_start
          })
        }).catch(() => null)

        if (!response?.ok) {
          const err = await response.json()
          error(`Error creating room: ${err.error}`)
          return
        }

        await loadData()
      }

      setShowRoomModal(false)
      success(`Room ${modalMode === 'edit' ? 'updated' : 'created'} successfully`)
    } catch (err) {
      console.error('Error saving room:', err)
      error(`Error saving room: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const handleDeleteRoom = async (room: Room) => {
    if (!confirm(`Are you sure you want to delete ${room.name}?`)) return

    try {
      const response = await fetch(`/api/rooms?id=${room.id}`, {
        method: 'DELETE'
      }).catch(() => null)

        if (!response?.ok) {
          const err = await response.json()
          error(`Error deleting room: ${err.error}`)
          return
        }

        await loadData()
        success('Room deleted successfully')
    } catch (err) {
      console.error('Error deleting room:', err)
      error('Error deleting room')
    }
  }

  const handleAddBedToRoom = async (roomId: string) => {
    if (!roomId) {
      error('Room ID is required')
      return
    }

    try {
      const response = await fetch('/api/beds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          room_id: roomId,
          identifier: `Bed ${Date.now()}`,
          bed_type: 'single',
          capacity: 1,
          slot: 'single'
        })
      }).catch(() => null)

        if (!response?.ok) {
          const err = await response.json()
          error(`Error adding bed: ${err.error}`)
          return
        }

      await loadData()
      
      if (selectedRoom && selectedRoom.id === roomId) {
        const updatedRooms = await fetch('/api/rooms').catch(() => null).then(res => res?.json())
        const updatedRoom = updatedRooms.find((r: any) => r.id === roomId)
        if (updatedRoom) {
          setSelectedRoom(updatedRoom)
        }
      }
      
      success('Bed added successfully')
    } catch (err) {
      console.error('Error adding bed:', err)
      error('Error adding bed')
    }
  }

  const handleRemoveBedFromRoom = async (bedId: string) => {
    if (!confirm('Are you sure you want to delete this bed?')) return

    try {
      const response = await fetch(`/api/beds?id=${bedId}`, {
        method: 'DELETE'
      }).catch(() => null)

        if (!response?.ok) {
          const err = await response.json()
          error(`Error deleting bed: ${err.error}`)
          return
        }

        await loadData()
        success('Bed deleted successfully')
    } catch (err) {
      console.error('Error deleting bed:', err)
      error('Error deleting bed')
    }
  }

  const handleViewBed = (bed: Bed) => {
    setSelectedBed(bed)
    // You can add a view modal here if needed
    info(`Viewing bed: ${bed.identifier} (${bed.bed_type})`)
  }

  const handleEditBed = (bed: Bed) => {
    setSelectedBed(bed)
    setBedFormData({
      name: bed.identifier,
      bed_type: bed.bed_type as any,
      notes: bed.notes || ''
    })
    setModalMode('edit')
    setShowBedModal(true)
  }

  const handleSaveBed = async () => {
    if (!selectedBed) return

    // Get capacity based on bed type
    const bedTypeInfo = BED_TYPES.find(type => type.value === bedFormData.bed_type)
    const capacity = bedTypeInfo ? bedTypeInfo.capacity : 1

    try {
      const response = await fetch(`/api/beds?id=${selectedBed.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identifier: bedFormData.name,
          bed_type: bedFormData.bed_type,
          capacity: capacity,
          notes: bedFormData.notes
        })
      }).catch(() => null)

        if (!response?.ok) {
          const err = await response.json()
          error(`Error updating bed: ${err.error}`)
          return
        }

      await loadData()
      setShowBedModal(false)
      success('Bed updated successfully')
    } catch (err) {
      console.error('Error updating bed:', err)
      error('Error updating bed')
    }
  }

  const handleAssignBed = (bed: Bed) => {
    setSelectedBed(bed)
    setShowAssignModal(true)
  }

  const handleAssignBedToGuest = async () => {
    if (!selectedBed || !selectedGuestId) return

    // Check if bed is active
    if (!selectedBed.is_active) {
      error('Cannot assign guest to inactive bed')
      setShowAssignModal(false)
      await loadData()
      return
    }

    // Check if guest is already assigned to another bed
    const guest = guests.find(g => g.id === selectedGuestId)
    if (guest) {
      const existingAssignment = rooms
        .flatMap(room => room.beds || [])
        .flatMap(bed => bed.bed_assignments || [])
        .find(assignment => assignment.guest_id === selectedGuestId && assignment.status === 'active')

      if (existingAssignment) {
        const existingBed = rooms
          .flatMap(room => room.beds || [])
          .find(bed => bed.id === existingAssignment.bed_id)

        if (existingBed && existingBed.id !== selectedBed.id) {
          const confirmMove = confirm(
            `Guest ${guest.name} is already assigned to bed ${existingBed.identifier}. Do you want to move them to bed ${selectedBed.identifier}?\n\nNote: A guest can only be assigned to one bed at a time.`
          )
          if (!confirmMove) return
        } else if (existingBed && existingBed.id === selectedBed.id) {
          error(`Guest ${guest.name} is already assigned to this bed.`)
          return
        }
      }
    }

    try {
      const response = await fetch('/api/bed-assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bed_id: selectedBed.id,
          guest_id: selectedGuestId
        })
      }).catch(() => null)

      if (!response?.ok) {
        const err = await response.json()
        error(`Error assigning guest: ${err.error}`)
        return
      }

      await loadData()
      setShowAssignModal(false)
      setSelectedGuestId('')
      success('Guest assigned successfully')
    } catch (err) {
      console.error('Error assigning guest:', err)
      error('Error assigning guest')
    }
  }

  const handleRemoveGuest = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to remove this guest?')) return

    try {
      const response = await fetch(`/api/bed-assignments?id=${assignmentId}`, {
        method: 'DELETE'
      }).catch(() => null)

      if (!response?.ok) {
        const err = await response.json()
        error(`Error removing guest: ${err.error}`)
        return
      }

      await loadData()
      success('Guest removed successfully')
    } catch (err) {
      console.error('Error removing guest:', err)
      error('Error removing guest')
    }
  }

  const handleBedNameChange = async (bedId: string, newName: string) => {
    try {
      const response = await fetch(`/api/beds?id=${bedId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identifier: newName
        })
      }).catch(() => null)

      if (!response?.ok) {
        const error = await response.json()
        console.error(`Error updating bed name: ${error.error}`)
        return
      }

      // Update the selected room data without closing modal
      await updateSelectedRoomData()
    } catch (err) {
      console.error('Error updating bed name:', err)
      error('Error updating bed name')
    }
  }

  const handleBedTypeChange = async (bedId: string, newType: string) => {
    // Get capacity based on bed type
    const bedTypeInfo = BED_TYPES.find(type => type.value === newType)
    const capacity = bedTypeInfo ? bedTypeInfo.capacity : 1

    try {
      const response = await fetch(`/api/beds?id=${bedId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bed_type: newType,
          capacity: capacity
        })
      }).catch(() => null)

      if (!response?.ok) {
        const error = await response.json()
        console.error(`Error updating bed type: ${error.error}`)
        return
      }

      // Update the selected room data without closing modal
      await updateSelectedRoomData()
    } catch (err) {
      console.error('Error updating bed type:', err)
      error('Error updating bed type')
    }
  }

  const handleRoomNumberingTypeChange = async (newType: string) => {
    if (!selectedRoom) return
    
    try {
      const response = await fetch(`/api/rooms?id=${selectedRoom.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numbering_type: newType
        })
      }).catch(() => null)

      if (response?.ok) {
        await updateSelectedRoomData()
      } else {
        const error = await response.json()
        console.error(`Error updating room numbering: ${error.error}`)
      }
    } catch (err) {
      console.error('Error updating room numbering type:', err)
      error('Error updating room numbering type')
    }
  }

  const handleRoomNumberingStartChange = async (newStart: string) => {
    if (!selectedRoom) return
    
    try {
      const response = await fetch(`/api/rooms?id=${selectedRoom.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numbering_start: newStart
        })
      }).catch(() => null)

      if (response?.ok) {
        await updateSelectedRoomData()
      } else {
        const error = await response.json()
        console.error(`Error updating room numbering: ${error.error}`)
      }
    } catch (err) {
      console.error('Error updating room numbering start:', err)
      error('Error updating room numbering start')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading bed inventory...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bed Inventory</h1>
          <p className="text-gray-600">Manage rooms and bed assignments</p>
        </div>
        <button
          onClick={handleCreateRoom}
          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          title="Add Room"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Rooms List */}
      {rooms.length === 0 ? (
        <div className="text-center py-12">
          <HomeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No rooms</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new room.</p>
          <div className="mt-6">
            <button
              onClick={handleCreateRoom}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="Add First Room"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {rooms.map((room) => (
            <div key={room.id} className="bg-white rounded-lg shadow">
              {/* Room Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{room.name}</h3>
                    <p className="text-sm text-gray-600">
                      {room.room_type.charAt(0).toUpperCase() + room.room_type.slice(1)} - {room.beds?.length || 0} Betten
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getRoomTypeColor(room.room_type)}`}>
                      {room.room_type}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewRoom(room)}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-blue-50"
                        title="View Room"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditRoom(room)}
                        className="text-green-600 hover:text-green-800 p-2 rounded-md hover:bg-green-50"
                        title="Edit Room"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room)}
                        className="text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50"
                        title="Delete Room"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Beds Grid */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {room.beds?.map((bed) => {
                    const activeAssignments = bed.bed_assignments?.filter(assignment => assignment.status === 'active') || []
                    
                    // Status colors based on occupancy
                    let statusColor = ''
                    let statusText = ''
                    let cardBgColor = ''
                    let cardBorderColor = ''
                    
                    if (bed.current_occupancy === 0) {
                      // Green - Free
                      statusColor = 'bg-green-100 text-green-800 border-green-200'
                      statusText = 'Frei'
                      cardBgColor = 'bg-gradient-to-br from-green-50 to-emerald-50'
                      cardBorderColor = 'border-green-200'
                    } else if (bed.current_occupancy < bed.capacity) {
                      // Orange - Partially occupied
                      statusColor = 'bg-orange-100 text-orange-800 border-orange-200'
                      statusText = 'Teilweise belegt'
                      cardBgColor = 'bg-gradient-to-br from-orange-50 to-amber-50'
                      cardBorderColor = 'border-orange-200'
                    } else {
                      // Red - Fully occupied
                      statusColor = 'bg-red-100 text-red-800 border-red-200'
                      statusText = 'Besetzt'
                      cardBgColor = 'bg-gradient-to-br from-red-50 to-rose-50'
                      cardBorderColor = 'border-red-200'
                    }

                    return (
                      <div key={bed.id} className={`${cardBgColor} border ${cardBorderColor} rounded-lg p-4 hover:shadow-lg transition-all duration-200`}>
                        {/* Status Badge */}
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="text-lg font-bold text-gray-900">{bed.identifier}</h4>
                          </div>
                          <span className={`px-2 py-1 text-xs font-bold rounded-full border ${statusColor}`}>
                            {statusText}
                          </span>
                        </div>

                        {/* Bed Details */}
                        <div className="mb-3 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-600">Typ:</span>
                            <span className="text-sm font-semibold text-gray-900 capitalize">{bed.bed_type}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-600">Capacity:</span>
                            <span className="text-sm font-semibold text-gray-900">{bed.current_occupancy}/{bed.capacity}</span>
                          </div>
                        </div>

                        {/* Guest Names */}
                        {activeAssignments.length > 0 && (
                          <div className="mb-3">
                            <div className="text-xs font-medium text-gray-600 mb-1">Gäste:</div>
                            <div className="space-y-1">
                              {activeAssignments.map((assignment) => (
                                <div key={assignment.id} className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-gray-900">
                                    {assignment.guests?.name || 'Unknown Guest'}
                                  </span>
                                  <button
                                    onClick={() => handleRemoveGuest(assignment.id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                                    title="Remove Guest"
                                  >
                                    <XMarkIcon className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons - Centered Footer */}
                        <div className="flex justify-center space-x-2 pt-2 border-t border-gray-200">
                          <button
                            onClick={() => handleViewBed(bed)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="View Bed"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditBed(bed)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Edit Bed"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleAssignBed(bed)}
                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                            title="Assign Guest"
                          >
                            <UserPlusIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveBedFromRoom(bed.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete Bed"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Room Modal */}
      {showRoomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {modalMode === 'create' ? 'Create Room' : 'Edit Room'}
              </h2>
              <button
                onClick={() => setShowRoomModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Name *
                </label>
                <input
                  type="text"
                  value={roomFormData.name}
                  onChange={(e) => setRoomFormData({...roomFormData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Dormitory A, Private Room 1..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Type (Category) *
                </label>
                <select
                  value={roomFormData.room_type}
                  onChange={(e) => setRoomFormData({...roomFormData, room_type: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ROOM_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bed Number
                </label>
                <input
                  type="text"
                  value={roomFormData.bed_number}
                  onChange={(e) => setRoomFormData({...roomFormData, bed_number: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 1, 2, 3 or a, b, c..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={roomFormData.description}
                  onChange={(e) => setRoomFormData({...roomFormData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional description..."
                />
              </div>

              {modalMode === 'create' && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Anzahl Bed Items *
                </label>
                <input
                  type="text"
                  value={roomFormData.bed_count}
                  onChange={(e) => {
                    const value = e.target.value
                    // Only allow numbers and empty string
                    if (value === '' || /^\d+$/.test(value)) {
                      setRoomFormData({...roomFormData, bed_count: value})
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="z.B. 2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nummerierungs Art
                </label>
                <select
                  value={roomFormData.numbering_type}
                  onChange={(e) => setRoomFormData({...roomFormData, numbering_type: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {NUMBERING_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nummerierung ab
                </label>
                <input
                  type="text"
                  value={roomFormData.numbering_start}
                  onChange={(e) => setRoomFormData({...roomFormData, numbering_start: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1, 2, 3 or a, b, c..."
                />
              </div>
            </div>
            )}

            {modalMode === 'edit' && selectedRoom && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Room Nummerierung</h3>
                  <div className="flex items-center space-x-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nummerierungs Art
                      </label>
                      <select
                        value={selectedRoom.numbering_type || 'numeric'}
                        onChange={(e) => handleRoomNumberingTypeChange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {NUMBERING_TYPES.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nummerierung Start
                      </label>
                      <input
                        type="text"
                        value={selectedRoom.numbering_start || '1'}
                        onChange={(e) => handleRoomNumberingStartChange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="1, 2, 3 or a, b, c..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

              {modalMode === 'edit' && selectedRoom && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Beds in this Room</h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {selectedRoom.beds?.map((bed) => (
                      <div key={bed.id} className="p-3 border border-gray-200 rounded bg-gray-50">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex-1">
                            <input
                              type="text"
                              value={bed.identifier}
                              onChange={(e) => handleBedNameChange(bed.id, e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Bed Name"
                            />
                          </div>
                          <div className="w-24">
                            <select
                              value={bed.bed_type}
                              onChange={(e) => handleBedTypeChange(bed.id, e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              {BED_TYPES.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                              ))}
                            </select>
                          </div>
                          <button
                            onClick={() => handleRemoveBedFromRoom(bed.id)}
                            className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"
                            title="Delete Bed"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                        
                        {/* Guest Assignment Section */}
                        <div className="border-t border-gray-200 pt-2">
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                              {bed.bed_assignments && bed.bed_assignments.filter(assignment => assignment.status === 'active').length > 0 ? (
                                <div>
                                  <span className="font-medium">Assigned Guests:</span>
                                  {bed.bed_assignments
                                    .filter(assignment => assignment.status === 'active')
                                    .map((assignment, index) => (
                                    <div key={assignment.id} className="flex items-center space-x-2 mt-1">
                                      <span className="text-blue-600">
                                        {assignment.guests?.name || 'Unknown Guest'}
                                      </span>
                                      <button
                                        onClick={() => handleRemoveGuest(assignment.id)}
                                        className="text-red-500 hover:text-red-700 text-xs"
                                        title="Remove Guest"
                                      >
                                        <XMarkIcon className="h-3 w-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400">No guests assigned</span>
                              )}
                            </div>
                            <button
                              onClick={() => {
                                setSelectedBed(bed)
                                setShowAssignModal(true)
                              }}
                              className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 flex items-center"
                              title="Assign Guest"
                            >
                              <UserPlusIcon className="h-3 w-3 mr-1" />
                              Assign
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            <div className="flex justify-between items-center mt-6">
              <div>
                {modalMode === 'edit' && (
                  <button
                    onClick={() => selectedRoom && handleAddBedToRoom(selectedRoom.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Bed
                  </button>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleSaveRoom}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {modalMode === 'create' ? 'Create' : 'Update'}
                </button>
                <button
                  onClick={() => setShowRoomModal(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Room View Modal */}
      {showViewModal && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Room Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Room Info */}
              <div>
                <h3 className="text-lg font-semibold mb-2">{selectedRoom.name}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">Type:</span> {selectedRoom.room_type}</div>
                  <div><span className="font-medium">Room Number:</span> {selectedRoom.room_number || 'N/A'}</div>
                  <div><span className="font-medium">Beds:</span> {selectedRoom.beds?.length || 0}</div>
                  <div><span className="font-medium">Total Capacity:</span> {selectedRoom.beds?.reduce((sum, bed) => sum + bed.capacity, 0) || 0} people</div>
                </div>
                {selectedRoom.description && (
                  <div className="mt-2">
                    <span className="font-medium">Description:</span>
                    <p className="text-gray-600">{selectedRoom.description}</p>
                  </div>
                )}
              </div>

              {/* Bed Details */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Beds ({selectedRoom.beds?.length || 0})</h3>
                  <button
                    onClick={() => handleAddBedToRoom(selectedRoom.id)}
                    className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-sm"
                    title="Add Bed"
                  >
                    Add Bed
                  </button>
                </div>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {selectedRoom.beds?.map((bed) => (
                    <div key={bed.id} className="p-3 border border-gray-200 rounded-md">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{bed.identifier}</h4>
                          <p className="text-sm text-gray-500">{bed.bed_id}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                            {bed.bed_type} ({bed.capacity}p)
                          </span>
                        </div>
                      </div>

                      {/* Assigned Guests */}
                      {bed.bed_assignments && bed.bed_assignments.length > 0 && (
                        <div className="mt-2">
                          {bed.bed_assignments.map((assignment) => (
                            <div key={assignment.id} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                              <div className="flex items-center">
                                <UserIcon className="h-4 w-4 mr-2 text-blue-600" />
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {assignment.guests?.name || 'Unknown'}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {assignment.guests?.guest_id}
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemoveGuest(assignment.id)}
                                className="text-red-600 hover:text-red-800"
                                title="Remove Guest"
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bed Edit Modal */}
      {showBedModal && selectedBed && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Bed</h2>
              <button
                onClick={() => setShowBedModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bed Name *
                </label>
                <input
                  type="text"
                  value={bedFormData.name}
                  onChange={(e) => setBedFormData({...bedFormData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bed Type *
                </label>
                <select
                  value={bedFormData.bed_type}
                  onChange={(e) => setBedFormData({...bedFormData, bed_type: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {BED_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label} ({type.capacity} person{type.capacity > 1 ? 's' : ''})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={bedFormData.notes}
                  onChange={(e) => setBedFormData({...bedFormData, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional notes about this bed..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleSaveBed}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Bed
              </button>
              <button
                onClick={() => setShowBedModal(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Bed Modal */}
      {showAssignModal && selectedBed && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Assign Bed</h2>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Assign <strong>{selectedBed.identifier}</strong> to a guest:
              </p>
              <p className="text-xs text-gray-500 mb-3">
                Note: A guest can only be assigned to one bed at a time.
              </p>
              <select
                value={selectedGuestId}
                onChange={(e) => setSelectedGuestId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a guest</option>
                {guests.map(guest => {
                  // Check if guest is already assigned to a bed
                  const isAssigned = rooms
                    .flatMap(room => room.beds || [])
                    .flatMap(bed => bed.bed_assignments || [])
                    .some(assignment => assignment.guest_id === guest.id && assignment.status === 'active')
                  
                  return (
                    <option 
                      key={guest.id} 
                      value={guest.id}
                      disabled={isAssigned}
                      className={isAssigned ? 'text-gray-400' : ''}
                    >
                      {guest.name} ({guest.guest_id}) {isAssigned ? '- Already assigned' : ''}
                    </option>
                  )
                })}
              </select>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleAssignBedToGuest}
                disabled={!selectedGuestId}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                title="Assign"
              >
                <CheckIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                title="Cancel"
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