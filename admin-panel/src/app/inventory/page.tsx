'use client'

import { useState, useEffect } from 'react'
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  UserIcon,
  HomeIcon,
  CubeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { createClient } from '@/lib/supabase'

interface Room {
  id: string
  room_id: string
  name: string
  room_type: 'dormitory' | 'private' | 'suite'
  description?: string
  max_capacity: number
  room_number?: string
  beds: Bed[]
  current_occupancy: number
  created_at: string
}

interface Bed {
  id: string
  bed_id: string
  identifier: string
  bed_type: 'single' | 'double' | 'bunk' | 'queen' | 'king' | 'sofa' | 'extra' | 'crib'
  capacity: number
  current_occupancy: number
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

interface Equipment {
  id: string
  equipment_id: string
  name: string
  category: 'surfboards' | 'wetsuits' | 'safety' | 'cleaning'
  type: string
  size?: string
  brand?: string
  condition: 'excellent' | 'good' | 'fair' | 'poor'
  status: 'available' | 'assigned' | 'maintenance' | 'retired'
  assigned_to?: {
    id: string
    name: string
    guest_id: string
  }
  number?: number // For numbering items within category
  letter?: string // For alphabetic numbering (A, B, C, etc.)
  numbering_type?: 'numeric' | 'alphabetic' // How this item should be numbered
}

const ROOM_TYPES = [
  { value: 'dormitory', label: 'Dormitory' },
  { value: 'private', label: 'Private' },
  { value: 'suite', label: 'Suite' }
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

const EQUIPMENT_CATEGORIES = [
  { value: 'surfboards', label: 'Surfboards' },
  { value: 'wetsuits', label: 'Wetsuits' },
  { value: 'safety', label: 'Safety Equipment' },
  { value: 'cleaning', label: 'Cleaning Supplies' }
]

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<'beds' | 'equipment' | 'analytics'>('beds')
  const [rooms, setRooms] = useState<Room[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)

  // Modals
  const [showRoomModal, setShowRoomModal] = useState(false)
  const [showEquipmentModal, setShowEquipmentModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEquipmentViewModal, setShowEquipmentViewModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')

  // Form Data
  const [roomFormData, setRoomFormData] = useState({
    name: '',
    room_type: 'dormitory' as const,
    description: '',
    room_number: '',
    max_capacity: 4,
    beds: [] as Array<{
      identifier: string
      bed_type: 'single' | 'double' | 'bunk' | 'queen' | 'king' | 'sofa' | 'extra' | 'crib'
    }>
  })

  const [equipmentFormData, setEquipmentFormData] = useState({
    name: '',
    category: 'surfboards' as const,
    type: '',
    size: '',
    brand: '',
    condition: 'excellent' as const,
    quantity: 1,
    numberingMethod: 'numeric' as 'numeric' | 'alphabetic',
    startFrom: 1,
    startFromLetter: 'A'
  })

  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Mock data since Supabase is not configured
      const mockRooms: Room[] = [
        {
          id: '1',
          room_id: 'R-A1B2C3D4E5',
          name: 'Dormitory A',
          room_type: 'dormitory',
          description: '8-bed shared dormitory with lockers',
          max_capacity: 8,
          room_number: 'A1',
          current_occupancy: 6,
          beds: [
            { id: '1', bed_id: 'B-A1B2C3D4E5', identifier: 'Bed 1', bed_type: 'single', capacity: 1, current_occupancy: 1, guest: { id: '1', name: 'John Doe', guest_id: 'G-A1B2C3D4E5' } },
            { id: '2', bed_id: 'B-F6G7H8I9J0', identifier: 'Bed 2', bed_type: 'single', capacity: 1, current_occupancy: 1, guest: { id: '2', name: 'Maria Garcia', guest_id: 'G-F6G7H8I9J0' } },
            { id: '3', bed_id: 'B-K1L2M3N4O5', identifier: 'Bed 3', bed_type: 'single', capacity: 1, current_occupancy: 0 },
            { id: '4', bed_id: 'B-P6Q7R8S9T0', identifier: 'Bed 4', bed_type: 'single', capacity: 1, current_occupancy: 1, guest: { id: '4', name: 'Sarah Connor', guest_id: 'G-P6Q7R8S9T0' } },
            { id: '5', bed_id: 'B-U1V2W3X4Y5', identifier: 'Bed 5', bed_type: 'bunk', capacity: 2, current_occupancy: 2, guests: [
              { id: '5a', name: 'Alex Johnson', guest_id: 'G-U1V2W3X4Y5' },
              { id: '5b', name: 'Jamie Smith', guest_id: 'G-J5K6L7M8N9' }
            ]},
            { id: '6', bed_id: 'B-Z6Y7X8W9V0', identifier: 'Bed 6', bed_type: 'bunk', capacity: 2, current_occupancy: 1, guest: { id: '6', name: 'Mike Wilson', guest_id: 'G-Z6Y7X8W9V0' } }
          ],
          created_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          room_id: 'R-F6G7H8I9J0',
          name: 'Dormitory B',
          room_type: 'dormitory',
          description: '6-bed shared dormitory with ocean view',
          max_capacity: 6,
          room_number: 'A2',
          current_occupancy: 4,
          beds: [
            { id: '7', bed_id: 'B-A7B8C9D0E1', identifier: 'Bed A', bed_type: 'single', capacity: 1, current_occupancy: 1, guest: { id: '7', name: 'Emma Brown', guest_id: 'G-A7B8C9D0E1' } },
            { id: '8', bed_id: 'B-F2G3H4I5J6', identifier: 'Bed B', bed_type: 'single', capacity: 1, current_occupancy: 1, guest: { id: '8', name: 'David Lee', guest_id: 'G-F2G3H4I5J6' } },
            { id: '9', bed_id: 'B-K7L8M9N0O1', identifier: 'Bed C', bed_type: 'double', capacity: 2, current_occupancy: 2, guests: [
              { id: '9a', name: 'Lisa Martinez', guest_id: 'G-K7L8M9N0O1' },
              { id: '9b', name: 'Tom Wilson', guest_id: 'G-P2Q3R4S5T6' }
            ]},
            { id: '10', bed_id: 'B-P2Q3R4S5T6', identifier: 'Bed D', bed_type: 'single', capacity: 1, current_occupancy: 0 }
          ],
          created_at: '2024-01-16T14:30:00Z'
        },
        {
          id: '3',
          room_id: 'R-K1L2M3N4O5',
          name: 'Private Room 1',
          room_type: 'private',
          description: 'Double bed private room',
          max_capacity: 2,
          room_number: 'B1',
          current_occupancy: 0,
          beds: [
            { id: '11', bed_id: 'B-U7V8W9X0Y1', identifier: 'Double Bed', bed_type: 'double', capacity: 2, current_occupancy: 0 }
          ],
          created_at: '2024-01-17T09:15:00Z'
        },
        {
          id: '4',
          room_id: 'R-P6Q7R8S9T0',
          name: 'Suite Deluxe',
          room_type: 'suite',
          description: 'Suite with king bed and sofa bed',
          max_capacity: 3,
          room_number: 'C1',
          current_occupancy: 2,
          beds: [
            { id: '12', bed_id: 'B-Z2A3B4C5D6', identifier: 'King Bed', bed_type: 'king', capacity: 2, current_occupancy: 2, guests: [
              { id: '12a', name: 'Robert Williams', guest_id: 'G-Z2A3B4C5D6' },
              { id: '12b', name: 'Jennifer Williams', guest_id: 'G-A8B9C0D1E2' }
            ]},
            { id: '13', bed_id: 'B-E7F8G9H0I1', identifier: 'Sofa Bed', bed_type: 'sofa', capacity: 1, current_occupancy: 0 }
          ],
          created_at: '2024-01-18T16:45:00Z'
        }
      ]

      const mockEquipment: Equipment[] = [
        // Surfboards - Individual items with numbering
        {
          id: '1',
          equipment_id: 'U-A1B2C3D4E5',
          name: "Beginner Board",
          category: 'surfboards',
          type: 'Soft Top',
          size: "8'0\"",
          brand: 'Wavestorm',
          condition: 'good',
          status: 'assigned',
          number: 1,
          numbering_type: 'numeric',
          assigned_to: { id: '1', name: 'John Doe', guest_id: 'G-A1B2C3D4E5' }
        },
        {
          id: '2',
          equipment_id: 'U-F6G7H8I9J0',
          name: "Beginner Board",
          category: 'surfboards',
          type: 'Soft Top',
          size: "8'0\"",
          brand: 'Wavestorm',
          condition: 'excellent',
          status: 'available',
          number: 2,
          numbering_type: 'numeric'
        },
        {
          id: '3',
          equipment_id: 'U-K1L2M3N4O5',
          name: "Beginner Board",
          category: 'surfboards',
          type: 'Soft Top',
          size: "8'0\"",
          brand: 'Wavestorm',
          condition: 'good',
          status: 'available',
          number: 3,
          numbering_type: 'numeric'
        },
        {
          id: '4',
          equipment_id: 'U-P6Q7R8S9T0',
          name: "Beginner Board",
          category: 'surfboards',
          type: 'Soft Top',
          size: "8'0\"",
          brand: 'Wavestorm',
          condition: 'fair',
          status: 'available',
          number: 4,
          numbering_type: 'numeric'
        },
        {
          id: '5',
          equipment_id: 'U-U1V2W3X4Y5',
          name: "Beginner Board",
          category: 'surfboards',
          type: 'Soft Top',
          size: "8'0\"",
          brand: 'Wavestorm',
          condition: 'good',
          status: 'maintenance',
          number: 5,
          numbering_type: 'numeric'
        },
        {
          id: '6',
          equipment_id: 'U-Z6Y7X8W9V0',
          name: "Intermediate Board",
          category: 'surfboards',
          type: 'Epoxy',
          size: "7'6\"",
          brand: 'Lost',
          condition: 'excellent',
          status: 'assigned',
          number: 1,
          numbering_type: 'numeric',
          assigned_to: { id: '2', name: 'Maria Garcia', guest_id: 'G-F6G7H8I9J0' }
        },
        {
          id: '7',
          equipment_id: 'U-A7B8C9D0E1',
          name: "Intermediate Board",
          category: 'surfboards',
          type: 'Epoxy',
          size: "7'6\"",
          brand: 'Lost',
          condition: 'good',
          status: 'available',
          number: 2,
          numbering_type: 'numeric'
        },
        {
          id: '8',
          equipment_id: 'U-F2G3H4I5J6',
          name: "Advanced Board",
          category: 'surfboards',
          type: 'Carbon Fiber',
          size: "6'2\"",
          brand: 'Al Byrne',
          condition: 'excellent',
          status: 'available',
          number: 1,
          numbering_type: 'numeric'
        },
        // Wetsuits - Individual items
        {
          id: '9',
          equipment_id: 'U-K7L8M9N0O1',
          name: 'Wetsuit 3/2mm',
          category: 'wetsuits',
          type: 'Full Suit',
          size: 'S',
          brand: 'Rip Curl',
          condition: 'good',
          status: 'available',
          letter: 'A',
          numbering_type: 'alphabetic'
        },
        {
          id: '10',
          equipment_id: 'U-P2Q3R4S5T6',
          name: 'Wetsuit 3/2mm',
          category: 'wetsuits',
          type: 'Full Suit',
          size: 'M',
          brand: 'Rip Curl',
          condition: 'good',
          status: 'assigned',
          letter: 'B',
          numbering_type: 'alphabetic',
          assigned_to: { id: '3', name: 'Sarah Connor', guest_id: 'G-P6Q7R8S9T0' }
        },
        {
          id: '11',
          equipment_id: 'U-U7V8W9X0Y1',
          name: 'Wetsuit 3/2mm',
          category: 'wetsuits',
          type: 'Full Suit',
          size: 'L',
          brand: 'Rip Curl',
          condition: 'excellent',
          status: 'available',
          letter: 'C',
          numbering_type: 'alphabetic'
        },
        {
          id: '12',
          equipment_id: 'U-Z2A3B4C5D6',
          name: 'Wetsuit 5mm',
          category: 'wetsuits',
          type: 'Full Suit',
          size: 'XL',
          brand: 'O\'Neill',
          condition: 'good',
          status: 'available',
          number: 1
        },
        {
          id: '13',
          equipment_id: 'U-E7F8G9H0I1',
          name: 'Wetsuit 5mm',
          category: 'wetsuits',
          type: 'Full Suit',
          size: 'L',
          brand: 'O\'Neill',
          condition: 'fair',
          status: 'maintenance',
          number: 2
        },
        // Safety Equipment - Individual items
        {
          id: '14',
          equipment_id: 'U-J4K5L6M7N8',
          name: 'Safety Helmet',
          category: 'safety',
          type: 'Impact Helmet',
          size: 'M',
          brand: 'Pro-Tec',
          condition: 'excellent',
          status: 'available',
          number: 1
        },
        {
          id: '15',
          equipment_id: 'U-O9P0Q1R2S3',
          name: 'Safety Helmet',
          category: 'safety',
          type: 'Impact Helmet',
          size: 'L',
          brand: 'Pro-Tec',
          condition: 'good',
          status: 'assigned',
          number: 2,
          assigned_to: { id: '4', name: 'Alex Johnson', guest_id: 'G-U1V2W3X4Y5' }
        },
        {
          id: '16',
          equipment_id: 'U-T4U5V6W7X8',
          name: 'Life Vest',
          category: 'safety',
          type: 'PFD',
          size: 'M',
          brand: 'Stohlquist',
          condition: 'excellent',
          status: 'available',
          number: 1
        },
        {
          id: '17',
          equipment_id: 'U-Y9Z0A1B2C3',
          name: 'Life Vest',
          category: 'safety',
          type: 'PFD',
          size: 'L',
          brand: 'Stohlquist',
          condition: 'good',
          status: 'available',
          number: 2
        },
        // Cleaning Supplies
        {
          id: '18',
          equipment_id: 'U-D4E5F6G7H8',
          name: 'Vacuum Cleaner',
          category: 'cleaning',
          type: 'Electric Vacuum',
          brand: 'Dyson',
          condition: 'good',
          status: 'available',
          number: 1
        },
        {
          id: '19',
          equipment_id: 'U-I9J0K1L2M3',
          name: 'Mop & Bucket',
          category: 'cleaning',
          type: 'Cleaning Set',
          brand: 'Generic',
          condition: 'fair',
          status: 'available',
          number: 1
        }
      ]

      setRooms(mockRooms)
      setEquipment(mockEquipment)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
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
      case 'retired':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleCreateRoom = () => {
    setRoomFormData({
      name: '',
      room_type: 'dormitory',
      description: '',
      room_number: '',
      max_capacity: 4,
      beds: []
    })
    setModalMode('create')
    setShowRoomModal(true)
  }

  const handleViewRoom = (room: Room) => {
    setSelectedRoom(room)
    setModalMode('view')
    setShowViewModal(true)
  }

  const handleEditRoom = (room: Room) => {
    setSelectedRoom(room)
    setRoomFormData({
      name: room.name,
      room_type: room.room_type,
      description: room.description || '',
      room_number: room.room_number || '',
      max_capacity: room.max_capacity,
      beds: room.beds.map(bed => ({
        identifier: bed.identifier,
        bed_type: bed.bed_type
      }))
    })
    setModalMode('edit')
    setShowRoomModal(true)
  }

  const handleDeleteRoom = async (room: Room) => {
    if (confirm(`Are you sure you want to delete ${room.name}? This action cannot be undone.`)) {
      setRooms(rooms.filter(r => r.id !== room.id))
      alert('Room deleted successfully')
    }
  }

  const handleSaveRoom = async () => {
    try {
      // Mock save - in real app would call Supabase
      const newRoom: Room = {
        id: Date.now().toString(),
        room_id: `R-${Math.random().toString(36).substr(2, 10).toUpperCase()}`,
        name: roomFormData.name,
        room_type: roomFormData.room_type,
        description: roomFormData.description,
        room_number: roomFormData.room_number,
        max_capacity: roomFormData.max_capacity,
        current_occupancy: 0,
        beds: roomFormData.beds.map((bed, index) => ({
          id: (Date.now() + index).toString(),
          bed_id: `B-${Math.random().toString(36).substr(2, 10).toUpperCase()}`,
          identifier: bed.identifier,
          bed_type: bed.bed_type,
          capacity: BED_TYPES.find(bt => bt.value === bed.bed_type)?.capacity || 1,
          current_occupancy: 0
        })),
        created_at: new Date().toISOString()
      }

      if (modalMode === 'edit' && selectedRoom) {
        setRooms(rooms.map(r => r.id === selectedRoom.id ? { ...r, ...newRoom, id: selectedRoom.id, room_id: selectedRoom.room_id, created_at: selectedRoom.created_at } : r))
      } else {
        setRooms([newRoom, ...rooms])
      }

      setShowRoomModal(false)
      alert('Room saved successfully')
    } catch (error) {
      console.error('Error saving room:', error)
      alert('Error saving room')
    }
  }

  const addBedToForm = () => {
    setRoomFormData({
      ...roomFormData,
      beds: [...roomFormData.beds, {
        identifier: `Bed ${roomFormData.beds.length + 1}`,
        bed_type: 'single'
      }]
    })
  }

  const removeBedFromForm = (index: number) => {
    setRoomFormData({
      ...roomFormData,
      beds: roomFormData.beds.filter((_, i) => i !== index)
    })
  }

  // Equipment handlers
  const handleCreateEquipment = (category?: string) => {
    setEquipmentFormData({
      name: '',
      category: category as any || 'surfboards',
      type: '',
      size: '',
      brand: '',
      condition: 'excellent',
      quantity: 1,
      numberingMethod: 'numeric',
      startFrom: 1,
      startFromLetter: 'A'
    })
    setModalMode('create')
    setShowEquipmentModal(true)
  }

  const handleRenumberCategory = (category: string, name: string, type: string) => {
    const categoryItems = equipment.filter(item =>
      item.category === category && item.name === name && item.type === type
    )

    if (categoryItems.length === 0) return

    const startNumber = prompt(`Nummerieren ab welcher Nummer? (aktuell: ${categoryItems.length} Items)`, '1')
    if (!startNumber) return

    const startFrom = parseInt(startNumber)
    if (isNaN(startFrom) || startFrom < 1) {
      alert('Bitte geben Sie eine gültige Zahl >= 1 ein.')
      return
    }

    const updatedEquipment = equipment.map(item => {
      if (item.category === category && item.name === name && item.type === type) {
        const index = categoryItems.findIndex(ci => ci.id === item.id)
        return { ...item, number: startFrom + index }
      }
      return item
    })

    setEquipment(updatedEquipment)
    alert(`${categoryItems.length} Items wurden neu nummeriert (ab ${startFrom}).`)
  }

  // Helper function to generate numbering preview
  const generateNumbering = (index: number, method: 'numeric' | 'alphabetic', startNum: number, startLetter: string) => {
    if (method === 'numeric') {
      return `#${startNum + index}`
    } else {
      const startCharCode = startLetter.charCodeAt(0)
      const newCharCode = startCharCode + index
      if (newCharCode > 90) { // Beyond Z
        return `${String.fromCharCode(65 + Math.floor((newCharCode - 65) / 26) - 1)}${String.fromCharCode(65 + ((newCharCode - 65) % 26))}`
      }
      return String.fromCharCode(newCharCode)
    }
  }

  const handleViewEquipment = (item: Equipment) => {
    setSelectedEquipment(item)
    setShowEquipmentViewModal(true)
  }

  const handleEditEquipment = (item: Equipment) => {
    setSelectedEquipment(item)
    setEquipmentFormData({
      name: item.name,
      category: item.category,
      type: item.type,
      size: item.size || '',
      brand: item.brand || '',
      condition: item.condition,
      quantity: 1,
      numberingMethod: item.numbering_type || 'numeric',
      startFrom: item.number || 1,
      startFromLetter: item.letter || 'A'
    })
    setModalMode('edit')
    setShowEquipmentModal(true)
  }

  const handleDeleteEquipment = async (item: Equipment) => {
    if (confirm(`Are you sure you want to delete ${item.name}? This action cannot be undone.`)) {
      setEquipment(equipment.filter(e => e.id !== item.id))
      alert('Equipment deleted successfully')
    }
  }

  const handleAssignEquipment = (item: Equipment) => {
    if (item.status !== 'available') {
      alert('This equipment is not available for assignment')
      return
    }
    setSelectedEquipment(item)
    setShowAssignModal(true)
  }


  const handleSaveEquipment = async () => {
    try {
      if (modalMode === 'edit' && selectedEquipment) {
        // Edit existing item
        const updatedItem: Equipment = {
          ...selectedEquipment,
          name: equipmentFormData.name,
          category: equipmentFormData.category,
          type: equipmentFormData.type,
          size: equipmentFormData.size || undefined,
          brand: equipmentFormData.brand || undefined,
          condition: equipmentFormData.condition
        }
        setEquipment(equipment.map(e => e.id === selectedEquipment.id ? updatedItem : e))
      } else {
        // Create new items
        const newItems: Equipment[] = []
        for (let i = 0; i < equipmentFormData.quantity; i++) {
          const numbering = generateNumbering(i, equipmentFormData.numberingMethod, equipmentFormData.startFrom, equipmentFormData.startFromLetter)
            .replace('#', '')

          const newItem: Equipment = {
            id: (Date.now() + i).toString(),
            equipment_id: `U-${Math.random().toString(36).substr(2, 10).toUpperCase()}`,
            name: equipmentFormData.quantity > 1
              ? `${equipmentFormData.name} ${numbering}`
              : equipmentFormData.name,
            category: equipmentFormData.category,
            type: equipmentFormData.type,
            size: equipmentFormData.size || undefined,
            brand: equipmentFormData.brand || undefined,
            condition: equipmentFormData.condition,
            status: 'available'
          }
          newItems.push(newItem)
        }
        setEquipment([...newItems, ...equipment])
      }

      setShowEquipmentModal(false)
      alert(`Equipment ${modalMode === 'edit' ? 'updated' : 'created'} successfully`)
    } catch (error) {
      console.error('Error saving equipment:', error)
      alert('Error saving equipment')
    }
  }

  const handleAssignToGuest = (guestId: string, guestName: string) => {
    if (!selectedEquipment) return

    setEquipment(equipment.map(e =>
      e.id === selectedEquipment.id
        ? { ...e, status: 'assigned', assigned_to: { id: guestId, name: guestName, guest_id: guestId } }
        : e
    ))
    setShowAssignModal(false)
    alert(`${selectedEquipment.name} assigned to ${guestName}`)
  }

  // Mock guests for assignment
  const availableGuests = [
    { id: 'G-A1B2C3D4E5', name: 'John Doe' },
    { id: 'G-F6G7H8I9J0', name: 'Maria Garcia' },
    { id: 'G-P6Q7R8S9T0', name: 'Sarah Connor' },
    { id: 'G-U1V2W3X4Y5', name: 'Alex Johnson' },
    { id: 'G-Z6Y7X8W9V0', name: 'Mike Wilson' }
  ]

  const getTotalOccupancy = () => {
    return rooms.reduce((total, room) => total + room.current_occupancy, 0)
  }

  const getTotalCapacity = () => {
    return rooms.reduce((total, room) => total + room.max_capacity, 0)
  }

  const getOccupancyRate = () => {
    const capacity = getTotalCapacity()
    return capacity > 0 ? Math.round((getTotalOccupancy() / capacity) * 100) : 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading inventory...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
        <button
          onClick={activeTab === 'beds' ? handleCreateRoom : handleCreateEquipment}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
          title={activeTab === 'beds' ? 'Create Room' : 'Add Equipment'}
        >
          <PlusIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
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
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ChartBarIcon className="h-5 w-5 inline mr-2" />
              Analytics
            </button>
          </nav>
        </div>
      </div>

      {/* Bed Inventory Tab */}
      {activeTab === 'beds' && (
        <div className="space-y-8">
          {rooms.map((room) => (
            <div key={room.id} className="bg-white rounded-lg shadow">
              {/* Room Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{room.name}</h3>
                    <p className="text-sm text-gray-600">
                      {room.room_type.charAt(0).toUpperCase() + room.room_type.slice(1)} - {room.beds.length} Betten
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

              {/* Bed Items Grid */}
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {room.beds.map((bed) => {
                    const isFullyOccupied = bed.current_occupancy === bed.capacity
                    const isAvailable = bed.current_occupancy === 0

                    return (
                      <div
                        key={bed.id}
                        className={`p-4 rounded-lg border-2 ${
                          isFullyOccupied
                            ? 'border-red-200 bg-red-50'
                            : 'border-green-200 bg-green-50'
                        }`}
                      >
                        {/* Bed Label */}
                        <div className="text-center mb-3">
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {bed.identifier}
                          </h4>
                          <p className={`text-xs ${isFullyOccupied ? 'text-red-600' : 'text-green-600'}`}>
                            {bed.bed_type.charAt(0).toUpperCase() + bed.bed_type.slice(1)} ({bed.current_occupancy}/{bed.capacity})
                          </p>
                        </div>

                        {/* Guest Info */}
                        <div className="text-center">
                          {bed.guests && bed.guests.length > 0 ? (
                            <div className="space-y-2">
                              {bed.guests.map((guest, index) => (
                                <div key={guest.id} className="space-y-1">
                                  <p className="text-xs font-medium text-gray-900">
                                    {guest.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {guest.guest_id}
                                  </p>
                                  {index < bed.guests!.length - 1 && (
                                    <hr className="border-gray-300" />
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : bed.guest ? (
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-gray-900">
                                {bed.guest.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {bed.guest.guest_id}
                              </p>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500 italic">
                              Empty
                            </p>
                          )}
                        </div>

                        {/* Status Indicator */}
                        <div className="mt-3 flex justify-center">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              isFullyOccupied
                                ? 'bg-red-500'
                                : isAvailable
                                ? 'bg-green-500'
                                : 'bg-yellow-500'
                            }`}
                          />
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

      {/* Equipment Inventory Tab */}
      {activeTab === 'equipment' && (
        <div className="space-y-8">
          {EQUIPMENT_CATEGORIES.map(category => {
            const categoryItems = equipment.filter(item => item.category === category.value)
            if (categoryItems.length === 0) return null

            // Group by name and type for proper numbering display
            const groupedItems = categoryItems.reduce((acc, item) => {
              const key = `${item.name}-${item.type}`
              if (!acc[key]) {
                acc[key] = []
              }
              acc[key].push(item)
              return acc
            }, {} as Record<string, Equipment[]>)

            return (
              <div key={category.value} className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    {category.label}
                    <span className="ml-2 bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded-full">
                      {categoryItems.length}
                    </span>
                  </h2>
                  <button
                    onClick={() => handleCreateEquipment(category.value)}
                    className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center"
                  >
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Add {category.label}
                  </button>
                </div>

                <div className="space-y-6">
                  {Object.entries(groupedItems).map(([groupKey, items]) => {
                    // Sort items based on their numbering type
                    const sortedItems = items.sort((a, b) => {
                      if (a.numbering_type === 'alphabetic' && b.numbering_type === 'alphabetic') {
                        return (a.letter || '').localeCompare(b.letter || '')
                      } else if (a.numbering_type === 'numeric' && b.numbering_type === 'numeric') {
                        return (a.number || 0) - (b.number || 0)
                      } else {
                        // Mixed types: numeric first, then alphabetic
                        if (a.numbering_type === 'numeric') return -1
                        return 1
                      }
                    })
                    const firstItem = sortedItems[0]

                    return (
                      <div key={groupKey} className="border border-gray-100 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-medium text-gray-900">
                            {firstItem.name} ({firstItem.type})
                            {firstItem.size && <span className="text-sm text-gray-500 ml-2">- Size {firstItem.size}</span>}
                            {firstItem.brand && <span className="text-sm text-gray-500 ml-2">- {firstItem.brand}</span>}
                          </h3>
                          <div className="text-sm text-gray-500">
                            {items.length} item{items.length !== 1 ? 's' : ''}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                          {sortedItems.map((item) => (
                            <div key={item.id} className="bg-gray-50 rounded p-3">
                              <div className="flex justify-between items-start mb-2">
                                <div className="font-medium text-sm">
                                  {item.numbering_type === 'alphabetic'
                                    ? (item.letter || 'N/A')
                                    : `#${item.number || 'N/A'}`
                                  }
                                </div>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                                  {item.status}
                                </span>
                              </div>

                              <p className="text-xs text-gray-500 mb-2">{item.equipment_id}</p>

                              <div className="text-xs text-gray-600 mb-2">
                                Condition: <span className={`font-medium ${
                                  item.condition === 'excellent' ? 'text-green-600' :
                                  item.condition === 'good' ? 'text-blue-600' :
                                  item.condition === 'fair' ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  {item.condition}
                                </span>
                              </div>

                              {item.assigned_to && (
                                <div className="mb-2 text-xs text-gray-600">
                                  <div className="flex items-center">
                                    <UserIcon className="h-3 w-3 mr-1" />
                                    {item.assigned_to.name}
                                  </div>
                                  <div className="text-xs text-gray-500 pl-4">{item.assigned_to.guest_id}</div>
                                </div>
                              )}

                              <div className="flex justify-end space-x-1 pt-2">
                                <button
                                  onClick={() => handleViewEquipment(item)}
                                  className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="View"
                                >
                                  <EyeIcon className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => handleEditEquipment(item)}
                                  className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                  title="Edit"
                                >
                                  <PencilIcon className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteEquipment(item)}
                                  className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Delete"
                                >
                                  <TrashIcon className="h-3 w-3" />
                                </button>
                                {item.status === 'available' && (
                                  <button
                                    onClick={() => handleAssignEquipment(item)}
                                    className="p-1.5 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                                    title="Assign"
                                  >
                                    <UserIcon className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <button
                            onClick={() => handleRenumberCategory(category.value, firstItem.name, firstItem.type)}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Nummerieren ab...
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Occupancy Rate */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-blue-500 p-3 rounded-lg">
                <HomeIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Occupancy Rate</h3>
                <p className="text-2xl font-bold text-blue-600">{getOccupancyRate()}%</p>
                <p className="text-sm text-gray-500">{getTotalOccupancy()} / {getTotalCapacity()} beds</p>
              </div>
            </div>
          </div>

          {/* Total Rooms */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-green-500 p-3 rounded-lg">
                <HomeIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Total Rooms</h3>
                <p className="text-2xl font-bold text-green-600">{rooms.length}</p>
                <p className="text-sm text-gray-500">Active rooms</p>
              </div>
            </div>
          </div>

          {/* Equipment Utilization */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-purple-500 p-3 rounded-lg">
                <CubeIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Equipment Usage</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {equipment.filter(e => e.status === 'assigned').length}/{equipment.length}
                </p>
                <p className="text-sm text-gray-500">Items in use</p>
              </div>
            </div>
          </div>

          {/* Room Types Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-yellow-500 p-3 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Room Types</h3>
                <div className="space-y-1">
                  <div className="text-sm">
                    <span className="font-medium">Dormitory:</span> {rooms.filter(r => r.room_type === 'dormitory').length}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Private:</span> {rooms.filter(r => r.room_type === 'private').length}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Suite:</span> {rooms.filter(r => r.room_type === 'suite').length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Room Create/Edit Modal */}
      {showRoomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Room Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Room Details</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room Name *
                  </label>
                  <input
                    type="text"
                    value={roomFormData.name}
                    onChange={(e) => setRoomFormData({...roomFormData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room Type *
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
                    Room Number
                  </label>
                  <input
                    type="text"
                    value={roomFormData.room_number}
                    onChange={(e) => setRoomFormData({...roomFormData, room_number: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={roomFormData.max_capacity}
                    onChange={(e) => setRoomFormData({...roomFormData, max_capacity: parseInt(e.target.value) || 1})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={roomFormData.description}
                    onChange={(e) => setRoomFormData({...roomFormData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
              </div>

              {/* Bed Configuration */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Bed Configuration</h3>
                  <button
                    type="button"
                    onClick={addBedToForm}
                    className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-sm"
                  >
                    Add Bed
                  </button>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {roomFormData.beds.map((bed, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-md">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={bed.identifier}
                          onChange={(e) => {
                            const newBeds = [...roomFormData.beds]
                            newBeds[index].identifier = e.target.value
                            setRoomFormData({...roomFormData, beds: newBeds})
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Bed identifier"
                        />
                      </div>
                      <div className="flex-1">
                        <select
                          value={bed.bed_type}
                          onChange={(e) => {
                            const newBeds = [...roomFormData.beds]
                            newBeds[index].bed_type = e.target.value as any
                            setRoomFormData({...roomFormData, beds: newBeds})
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          {BED_TYPES.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label} ({type.capacity}p)
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeBedFromForm(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {roomFormData.beds.length === 0 && (
                    <div className="text-sm text-gray-500 text-center py-4">
                      No beds configured. Click "Add Bed" to start.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowRoomModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRoom}
                disabled={!roomFormData.name}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Room
              </button>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Room Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Room Name</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRoom.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Room ID</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRoom.room_id}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoomTypeColor(selectedRoom.room_type)}`}>
                    {selectedRoom.room_type}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Room Number</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRoom.room_number || 'Not assigned'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Capacity</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRoom.current_occupancy} / {selectedRoom.max_capacity}</p>
                </div>

                {selectedRoom.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRoom.description}</p>
                  </div>
                )}
              </div>

              {/* Bed Details */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Beds ({selectedRoom.beds.length})</h3>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {selectedRoom.beds.map((bed) => (
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
                          <div className="text-xs text-gray-500 mt-1">
                            {bed.current_occupancy}/{bed.capacity}
                          </div>
                        </div>
                      </div>

                      {bed.guest ? (
                        <div className="flex items-center text-sm text-gray-700 bg-blue-50 p-2 rounded">
                          <UserIcon className="h-4 w-4 mr-2 text-blue-600" />
                          <div>
                            <div className="font-medium">{bed.guest.name}</div>
                            <div className="text-xs text-gray-500">{bed.guest.guest_id}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded text-center">
                          Available
                        </div>
                      )}
                    </div>
                  ))}
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

      {/* Equipment Create/Edit Modal */}
      {showEquipmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {modalMode === 'create' ? 'Add Equipment' : 'Edit Equipment'}
              </h2>
              <button
                onClick={() => setShowEquipmentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipment Name *
                </label>
                <input
                  type="text"
                  value={equipmentFormData.name}
                  onChange={(e) => setEquipmentFormData({...equipmentFormData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={equipmentFormData.category}
                    onChange={(e) => setEquipmentFormData({...equipmentFormData, category: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {EQUIPMENT_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <input
                    type="text"
                    value={equipmentFormData.type}
                    onChange={(e) => setEquipmentFormData({...equipmentFormData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Size
                  </label>
                  <input
                    type="text"
                    value={equipmentFormData.size}
                    onChange={(e) => setEquipmentFormData({...equipmentFormData, size: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={equipmentFormData.brand}
                    onChange={(e) => setEquipmentFormData({...equipmentFormData, brand: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Condition *
                  </label>
                  <select
                    value={equipmentFormData.condition}
                    onChange={(e) => setEquipmentFormData({...equipmentFormData, condition: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>

                {modalMode === 'create' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={equipmentFormData.quantity}
                      onChange={(e) => setEquipmentFormData({...equipmentFormData, quantity: parseInt(e.target.value) || 1})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>

              {/* Numbering Configuration - Always visible */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  {modalMode === 'create' ? 'Numbering Configuration' : 'Update Numbering'}
                </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Numbering Method
                      </label>
                      <select
                        value={equipmentFormData.numberingMethod}
                        onChange={(e) => setEquipmentFormData({...equipmentFormData, numberingMethod: e.target.value as 'numeric' | 'alphabetic'})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="numeric">Numeric (1, 2, 3...)</option>
                        <option value="alphabetic">Alphabetic (A, B, C...)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start From
                      </label>
                      {equipmentFormData.numberingMethod === 'numeric' ? (
                        <input
                          type="number"
                          min="1"
                          max="999"
                          value={equipmentFormData.startFrom}
                          onChange={(e) => setEquipmentFormData({...equipmentFormData, startFrom: parseInt(e.target.value) || 1})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <select
                          value={equipmentFormData.startFromLetter}
                          onChange={(e) => setEquipmentFormData({...equipmentFormData, startFromLetter: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {Array.from({length: 26}, (_, i) => String.fromCharCode(65 + i)).map(letter => (
                            <option key={letter} value={letter}>{letter}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Preview of numbering */}
                  {modalMode === 'create' && equipmentFormData.quantity > 1 && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-600 mb-2">Preview:</p>
                      <div className="text-xs text-gray-700 space-y-1">
                        {Array.from({length: Math.min(5, equipmentFormData.quantity)}, (_, i) => (
                          <div key={i}>
                            {equipmentFormData.name} {generateNumbering(i, equipmentFormData.numberingMethod, equipmentFormData.startFrom, equipmentFormData.startFromLetter)}
                          </div>
                        ))}
                        {equipmentFormData.quantity > 5 && (
                          <div className="text-gray-500">... and {equipmentFormData.quantity - 5} more</div>
                        )}
                      </div>
                    </div>
                  )}
                  {modalMode === 'edit' && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-md">
                      <p className="text-sm text-blue-800 mb-2">Current:</p>
                      <div className="text-sm text-blue-900 font-medium">
                        {equipmentFormData.name} {generateNumbering(0, equipmentFormData.numberingMethod, equipmentFormData.startFrom, equipmentFormData.startFromLetter)}
                      </div>
                    </div>
                  )}
                </div>

            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEquipmentModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEquipment}
                disabled={!equipmentFormData.name || !equipmentFormData.type}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Equipment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Equipment View Modal */}
      {showEquipmentViewModal && selectedEquipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Equipment Details</h2>
              <button
                onClick={() => setShowEquipmentViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Equipment Name</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedEquipment.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Equipment ID</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedEquipment.equipment_id}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {selectedEquipment.category}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedEquipment.type}</p>
                </div>

                {selectedEquipment.size && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Size</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedEquipment.size}</p>
                  </div>
                )}

                {selectedEquipment.brand && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Brand</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedEquipment.brand}</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedEquipment.status)}`}>
                    {selectedEquipment.status}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Condition</label>
                  <p className="mt-1 text-sm text-gray-900 capitalize">{selectedEquipment.condition}</p>
                </div>

                {selectedEquipment.assigned_to && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Assigned To</label>
                    <div className="mt-1 text-sm text-gray-900 bg-blue-50 p-3 rounded">
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 mr-2 text-blue-600" />
                        <div>
                          <div className="font-medium">{selectedEquipment.assigned_to.name}</div>
                          <div className="text-xs text-gray-500">{selectedEquipment.assigned_to.guest_id}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedEquipment.status === 'available' && (
                  <div className="pt-4">
                    <button
                      onClick={() => {
                        setShowEquipmentViewModal(false)
                        handleAssignEquipment(selectedEquipment)
                      }}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    >
                      Assign to Guest
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowEquipmentViewModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignModal && selectedEquipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Assign Equipment</h2>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Assigning:</p>
              <p className="font-medium">{selectedEquipment.name}</p>
              <p className="text-xs text-gray-500">{selectedEquipment.equipment_id}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Guest
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availableGuests.map((guest) => (
                  <button
                    key={guest.id}
                    onClick={() => handleAssignToGuest(guest.id, guest.name)}
                    className="w-full text-left px-3 py-2 border border-gray-200 rounded-md hover:bg-blue-50 hover:border-blue-300"
                  >
                    <div className="font-medium">{guest.name}</div>
                    <div className="text-xs text-gray-500">{guest.id}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}