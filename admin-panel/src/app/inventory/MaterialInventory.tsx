'use client'

import { useState, useEffect } from 'react'
import { 
  PlusIcon, 
  EyeIcon,
  PencilIcon, 
  TrashIcon, 
  XMarkIcon, 
  UserIcon, 
  UserPlusIcon,
  CubeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon as XMarkIconSolid
} from '@heroicons/react/24/outline'

interface Equipment {
  id: string
  equipment_id: string
  name: string
  base_name: string
  category: 'surfboard' | 'wetsuit' | 'safety' | 'cleaning' | 'other'
  type?: string
  size?: string
  brand?: string
  condition: 'excellent' | 'good' | 'fair' | 'poor'
  status: 'available' | 'assigned' | 'maintenance'
  is_active: boolean
  equipment_assignments?: Array<{
    id: string
    status: string
    guests?: {
      id: string
      name: string
      guest_id: string
    }
  }>
  created_at: string
}

interface Guest {
  id: string
  name: string
  guest_id: string
  is_active: boolean
}

const EQUIPMENT_CATEGORIES = [
  { value: 'surfboard', label: 'Surfboards' },
  { value: 'wetsuit', label: 'Wetsuits' },
  { value: 'safety', label: 'Safety Equipment' },
  { value: 'cleaning', label: 'Cleaning Supplies' },
  { value: 'other', label: 'Other Equipment' }
]

const EQUIPMENT_CONDITIONS = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' }
]

export default function MaterialInventory() {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedCondition, setSelectedCondition] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Modals
  const [showEquipmentModal, setShowEquipmentModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showAddUnitModal, setShowAddUnitModal] = useState(false) // Add unit modal
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)
  const [selectedEquipmentGroup, setSelectedEquipmentGroup] = useState<Equipment[] | null>(null) // For group operations
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')

  // Form Data
  const [equipmentFormData, setEquipmentFormData] = useState({
    name: '',
    category: 'surfboard' as const,
    type: '',
    size: '',
    brand: '',
    condition: 'excellent' as const,
    items: '',
    numbering_type: 'numeric' as const,
    numbering_start: '1'
  })

  const [selectedGuestId, setSelectedGuestId] = useState('')

  // Add Unit Form Data
  const [addUnitFormData, setAddUnitFormData] = useState({
    count: 1,
    numbering_type: 'numeric' as const,
    numbering_start: '1'
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load equipment from API
      const equipmentResponse = await fetch('/api/equipment')
      if (equipmentResponse.ok) {
        const equipmentData = await equipmentResponse.json()
        setEquipment(equipmentData)
      } else {
        setEquipment([])
      }

      // Load guests from API
      const guestsResponse = await fetch('/api/guests')
      if (guestsResponse.ok) {
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

  const updateSelectedEquipmentData = async () => {
    if (!selectedEquipment) return
    
    try {
      const response = await fetch('/api/equipment')
      if (response.ok) {
        const equipmentData = await response.json()
        const updatedEquipment = equipmentData.find((equipment: Equipment) => equipment.id === selectedEquipment.id)
        if (updatedEquipment) {
          setSelectedEquipment(updatedEquipment)
        }
        setEquipment(equipmentData)
      }
    } catch (error) {
      console.error('Error updating equipment data:', error)
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'surfboard':
        return 'bg-blue-100 text-blue-800'
      case 'wetsuit':
        return 'bg-purple-100 text-purple-800'
      case 'safety':
        return 'bg-red-100 text-red-800'
      case 'cleaning':
        return 'bg-green-100 text-green-800'
      case 'other':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent':
        return 'text-green-600'
      case 'good':
        return 'text-blue-600'
      case 'fair':
        return 'text-yellow-600'
      case 'poor':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const handleCreateEquipment = () => {
    setEquipmentFormData({
      name: '',
      category: 'surfboard',
      type: '',
      size: '',
      brand: '',
      condition: 'excellent',
      items: '',
      numbering_type: 'numeric',
      numbering_start: '1'
    })
    setModalMode('create')
    setShowEquipmentModal(true)
  }

  const handleViewEquipment = (equipment: Equipment) => {
    setSelectedEquipment(equipment)
    setModalMode('view')
    setShowViewModal(true)
  }

  const handleEditEquipment = (equipment: Equipment) => {
    setEquipmentFormData({
      name: equipment.base_name || equipment.name, // Use base_name for editing
      category: equipment.category || 'surfboard',
      type: equipment.type || '',
      size: equipment.size || '',
      brand: equipment.brand || '',
      condition: equipment.condition || 'excellent',
      items: '',
      numbering_type: 'numeric',
      numbering_start: '1'
    })
    setModalMode('edit')
    setSelectedEquipment(equipment)
    setShowEquipmentModal(true)
  }

  const handleSaveEquipment = async () => {
    try {
      // Validation for create mode
      if (modalMode === 'create') {
        if (!equipmentFormData.name || !equipmentFormData.items || parseInt(equipmentFormData.items) < 1) {
          alert('Bitte füllen Sie alle Pflichtfelder aus (Name und Anzahl Items)')
          return
        }
      }

      if (modalMode === 'edit' && selectedEquipment) {
        // Find all items with the same base_name
        const baseName = selectedEquipment.base_name || selectedEquipment.name
        const itemsToUpdate = equipment.filter(eq => (eq.base_name || eq.name) === baseName)
        
        // Update all items in the group
        const updatePromises = itemsToUpdate.map(eq => 
          fetch(`/api/equipment?id=${eq.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: equipmentFormData.name,
              base_name: equipmentFormData.name, // Update base_name as well
              category: equipmentFormData.category,
              type: equipmentFormData.type,
              size: equipmentFormData.size,
              brand: equipmentFormData.brand,
              condition: equipmentFormData.condition
            })
          })
        )
        
        const responses = await Promise.all(updatePromises)
        
        // Check if any update failed
        const failedUpdates = responses.filter(response => !response.ok)
        if (failedUpdates.length > 0) {
          alert(`Error updating some equipment items`)
          return
        }

        await loadData()
      } else {
        const response = await fetch('/api/equipment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: equipmentFormData.name,
            category: equipmentFormData.category,
            type: equipmentFormData.type,
            size: equipmentFormData.size,
            brand: equipmentFormData.brand,
            condition: equipmentFormData.condition,
            items: parseInt(equipmentFormData.items),
            numbering_type: equipmentFormData.numbering_type,
            numbering_start: equipmentFormData.numbering_start
          })
        })

        if (!response.ok) {
          const error = await response.json()
          console.error('API Error:', error)
          alert(`Error creating equipment: ${error.error || 'Unknown error'}`)
          return
        }

        await loadData()
      }

      setShowEquipmentModal(false)
    } catch (error) {
      console.error('Error saving equipment:', error)
      alert(`Error saving equipment: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleDeleteEquipment = async (equipmentItem: Equipment) => {
    const baseName = equipmentItem.base_name || equipmentItem.name
    if (!confirm(`Are you sure you want to delete all items of "${baseName}"?`)) return

    try {
      // Find all items with the same base_name
      const itemsToDelete = equipment.filter(eq => (eq.base_name || eq.name) === baseName)
      
      // Delete all items in the group
      const deletePromises = itemsToDelete.map(eq => 
        fetch(`/api/equipment?id=${eq.id}`, { method: 'DELETE' })
      )
      
      const responses = await Promise.all(deletePromises)
      
      // Check if any deletion failed
      const failedDeletions = responses.filter(response => !response.ok)
      if (failedDeletions.length > 0) {
        alert(`Error deleting some equipment items`)
        return
      }

      await loadData()
      alert(`All ${itemsToDelete.length} items of "${baseName}" deleted successfully`)
    } catch (error) {
      console.error('Error deleting equipment:', error)
      alert('Error deleting equipment')
    }
  }

  const handleAssignEquipment = (equipment: Equipment) => {
    setSelectedEquipment(equipment)
    setShowAssignModal(true)
  }

  const handleAddUnit = (equipmentGroup: Equipment[]) => {
    setSelectedEquipmentGroup(equipmentGroup)
    setAddUnitFormData({
      count: 1,
      numbering_type: 'numeric',
      numbering_start: (equipmentGroup.length + 1).toString()
    })
    setShowAddUnitModal(true)
  }

  const handleSaveAddUnit = async () => {
    if (!selectedEquipmentGroup || selectedEquipmentGroup.length === 0) return

    try {
      const baseEquipment = selectedEquipmentGroup[0]
      const baseName = baseEquipment.base_name || baseEquipment.name
      const category = baseEquipment.category
      const type = baseEquipment.type
      const size = baseEquipment.size
      const brand = baseEquipment.brand
      const condition = baseEquipment.condition

      // Create new equipment items
      const newItems = []
      for (let i = 0; i < addUnitFormData.count; i++) {
        // Generate identifier based on numbering type and start
        let identifier = ''
        if (addUnitFormData.numbering_type === 'alphabetic') {
          const startValue = parseInt(addUnitFormData.numbering_start)
          identifier = String.fromCharCode(97 + (startValue - 1 + i)) // a, b, c...
        } else {
          const startValue = parseInt(addUnitFormData.numbering_start)
          identifier = (startValue + i).toString() // 1, 2, 3...
        }

        const itemName = `${baseName} ${identifier}`
        newItems.push({
          name: itemName,
          base_name: baseName,
          category,
          type,
          size,
          brand,
          condition
        })
      }

      // Create equipment items
      const response = await fetch('/api/equipment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: baseName,
          category,
          type,
          size,
          brand,
          condition,
          items: addUnitFormData.count,
          numbering_type: addUnitFormData.numbering_type,
          numbering_start: parseInt(addUnitFormData.numbering_start)
        })
      })

      if (!response.ok) {
        const error = await response.json()
        alert(`Error adding units: ${error.error || 'Unknown error'}`)
        return
      }

      await loadData()
      setShowAddUnitModal(false)
      alert(`Successfully added ${addUnitFormData.count} units to ${baseName}`)
    } catch (error) {
      console.error('Error adding units:', error)
      alert('Error adding units')
    }
  }

  const handleDeleteUnit = async (equipment: Equipment) => {
    if (!confirm(`Are you sure you want to delete ${equipment.name}?`)) return

    try {
      const response = await fetch(`/api/equipment?id=${equipment.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        alert(`Error deleting equipment: ${error.error}`)
        return
      }

      await loadData()
      alert('Equipment unit deleted successfully')
    } catch (error) {
      console.error('Error deleting equipment:', error)
      alert('Error deleting equipment')
    }
  }

  const handleAssignEquipmentToGuest = async () => {
    if (!selectedEquipment || !selectedGuestId) return

    // Check if equipment is active
    if (!selectedEquipment.is_active) {
      alert('Cannot assign guest to inactive equipment')
      setShowAssignModal(false)
      await loadData()
      return
    }

    // Check if guest is already assigned to equipment of the same category
    const guest = guests.find(g => g.id === selectedGuestId)
    if (guest) {
      const existingAssignment = equipment
        .flatMap(eq => eq.equipment_assignments || [])
        .find(assignment => assignment.guests?.id === selectedGuestId && assignment.status === 'active')

      if (existingAssignment) {
        const existingEquipment = equipment.find(eq => 
          eq.equipment_assignments?.some(ass => ass.id === existingAssignment.id)
        )

        if (existingEquipment && existingEquipment.category === selectedEquipment.category) {
          alert(`Guest ${guest.name} already has ${selectedEquipment.category} assigned. A guest can only have one item per category.`)
          return
        }
      }
    }

    try {
      const response = await fetch('/api/equipment-assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          equipment_id: selectedEquipment.id,
          guest_id: selectedGuestId
        })
      })

      if (!response.ok) {
        const error = await response.json()
        alert(`Error assigning equipment: ${error.error}`)
        return
      }

      await loadData()
      setShowAssignModal(false)
      setSelectedGuestId('')
      alert('Equipment assigned successfully')
    } catch (error) {
      console.error('Error assigning equipment:', error)
      alert('Error assigning equipment')
    }
  }

  const handleRemoveEquipmentAssignment = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to remove this assignment?')) return

    try {
      const response = await fetch(`/api/equipment-assignments?id=${assignmentId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        alert(`Error removing assignment: ${error.error}`)
        return
      }

      await loadData()
      alert('Assignment removed successfully')
    } catch (error) {
      console.error('Error removing assignment:', error)
      alert('Error removing assignment')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading material inventory...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Material Equipment</h1>
          <p className="text-gray-600">Manage equipment and assignments</p>
        </div>
        <button
          onClick={handleCreateEquipment}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          title="Add new equipment"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Equipment
        </button>
      </div>


      {/* Equipment by Base Name */}
      {equipment.length === 0 ? (
        <div className="text-center py-12">
          <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No equipment</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating new equipment.</p>
          <div className="mt-6">
            <button
              onClick={handleCreateEquipment}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              title="Add first equipment"
            >
              Add First Equipment
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {(() => {
            // Group equipment by base_name
            const groupedEquipment = equipment.reduce((acc, item) => {
              const baseName = item.base_name || item.name
              if (!acc[baseName]) {
                acc[baseName] = []
              }
              acc[baseName].push(item)
              return acc
            }, {} as Record<string, Equipment[]>)

            return Object.entries(groupedEquipment).map(([baseName, items]) => (
              <div key={baseName} className="bg-white rounded-lg shadow">
                {/* Equipment Group Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{baseName}</h3>
                      <p className="text-sm text-gray-600">
                        {items[0].category.charAt(0).toUpperCase() + items[0].category.slice(1)} - {items.length} items
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getCategoryColor(items[0].category)}`}>
                        {items[0].category}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewEquipment(items[0])}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-blue-50"
                          title="View Equipment"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditEquipment(items[0])}
                          className="text-green-600 hover:text-green-800 p-2 rounded-md hover:bg-green-50"
                          title="Edit Equipment"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleAddUnit(items)}
                          className="text-purple-600 hover:text-purple-800 p-2 rounded-md hover:bg-purple-50"
                          title="Add Unit"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEquipment(items[0])}
                          className="text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50"
                          title="Delete Equipment"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Equipment Items Grid */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {items.map((item) => {
                      const assignedGuests = item.equipment_assignments?.filter(assignment => assignment.status === 'active') || []
                      
                      return (
                        <div key={item.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          {/* Status Badge */}
                          <div className="flex justify-between items-center mb-3">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                              {item.status}
                            </span>
                          </div>

                          {/* Equipment Info */}
                          <div className="mb-3">
                            <h4 className="text-lg font-bold text-gray-900 mb-2">{item.name}</h4>
                            
                            <div className="space-y-1 text-sm text-gray-600 mb-3">
                              {item.type && <div><span className="font-medium">Type:</span> {item.type}</div>}
                              {item.size && <div><span className="font-medium">Size:</span> {item.size}</div>}
                              {item.brand && <div><span className="font-medium">Brand:</span> {item.brand}</div>}
                              <div>
                                <span className="font-medium">Condition:</span>
                                <span className={`ml-1 font-medium ${getConditionColor(item.condition)}`}>
                                  {item.condition}
                                </span>
                              </div>
                            </div>

                            {/* Assigned Guests */}
                            {assignedGuests.length > 0 && (
                              <div className="mb-3 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                                <div className="text-xs font-medium text-blue-800 mb-1">Assigned to:</div>
                                {assignedGuests.map((assignment, index) => (
                                  <div key={assignment.id} className="flex items-center justify-between">
                                    <span className="text-sm text-blue-700">
                                      {assignment.guests?.name || 'Unknown Guest'}
                                    </span>
                                    <button
                                      onClick={() => handleRemoveEquipmentAssignment(assignment.id)}
                                      className="text-red-500 hover:text-red-700 text-xs"
                                      title="Remove Assignment"
                                    >
                                      <XMarkIcon className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Action Icons */}
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => handleViewEquipment(item)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditEquipment(item)}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleAssignEquipment(item)}
                              className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Assign"
                            >
                              <UserPlusIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUnit(item)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Unit"
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
            ))
          })()}
        </div>
      )}

      {/* Equipment Modal */}
      {showEquipmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {modalMode === 'create' ? 'Create Equipment' : 'Edit Equipment'}
              </h2>
              <button
                onClick={() => setShowEquipmentModal(false)}
                className="text-gray-400 hover:text-gray-600"
                title="Close modal"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name (Base Name) *
                      </label>
                      <input
                        type="text"
                        value={equipmentFormData.name}
                        onChange={(e) => setEquipmentFormData({...equipmentFormData, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter equipment base name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <select
                        value={equipmentFormData.category}
                        onChange={(e) => setEquipmentFormData({...equipmentFormData, category: e.target.value as any})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title="Select equipment category"
                        required
                      >
                        {EQUIPMENT_CATEGORIES.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                    </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <input
                    type="text"
                    value={equipmentFormData.type}
                    onChange={(e) => setEquipmentFormData({...equipmentFormData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter equipment type"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Size
                  </label>
                  <input
                    type="text"
                    value={equipmentFormData.size}
                    onChange={(e) => setEquipmentFormData({...equipmentFormData, size: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter equipment size"
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
                    placeholder="Enter equipment brand"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Condition
                  </label>
                  <select
                    value={equipmentFormData.condition}
                    onChange={(e) => setEquipmentFormData({...equipmentFormData, condition: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Select equipment condition"
                  >
                    {EQUIPMENT_CONDITIONS.map(condition => (
                      <option key={condition.value} value={condition.value}>{condition.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {modalMode === 'create' && (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Anzahl Items *
                    </label>
                    <input
                      type="text"
                      value={equipmentFormData.items}
                      onChange={(e) => {
                        const value = e.target.value
                        // Only allow numbers and empty string
                        if (value === '' || /^\d+$/.test(value)) {
                          setEquipmentFormData({...equipmentFormData, items: value})
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
                      value={equipmentFormData.numbering_type}
                      onChange={(e) => setEquipmentFormData({...equipmentFormData, numbering_type: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title="Select numbering type"
                    >
                      <option value="numeric">Numeric (1, 2, 3...)</option>
                      <option value="alphabetic">Alphabetic (A, B, C...)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nummerierung ab
                    </label>
                    <input
                      type="text"
                      value={equipmentFormData.numbering_start}
                      onChange={(e) => setEquipmentFormData({...equipmentFormData, numbering_start: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1, 2, 3 or a, b, c..."
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={handleSaveEquipment}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    title={modalMode === 'create' ? 'Create Equipment' : 'Update Equipment'}
                  >
                    {modalMode === 'create' ? 'Create' : 'Update'}
                  </button>
              <button
                onClick={() => setShowEquipmentModal(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                title="Cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Equipment Modal */}
      {showViewModal && selectedEquipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Equipment Group Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
                title="Close modal"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Group Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">{selectedEquipment.base_name || selectedEquipment.name}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <div className="px-3 py-2 bg-white border border-gray-200 rounded-md">
                      {selectedEquipment.category}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Items</label>
                    <div className="px-3 py-2 bg-white border border-gray-200 rounded-md">
                      {equipment.filter(eq => (eq.base_name || eq.name) === (selectedEquipment.base_name || selectedEquipment.name)).length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Individual Items */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Individual Items</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {equipment
                    .filter(eq => (eq.base_name || eq.name) === (selectedEquipment.base_name || selectedEquipment.name))
                    .map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{item.name}</h4>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          {item.type && <div><span className="font-medium">Type:</span> {item.type}</div>}
                          {item.size && <div><span className="font-medium">Size:</span> {item.size}</div>}
                          {item.brand && <div><span className="font-medium">Brand:</span> {item.brand}</div>}
                          <div>
                            <span className="font-medium">Condition:</span>
                            <span className={`ml-1 font-medium ${getConditionColor(item.condition)}`}>
                              {item.condition}
                            </span>
                          </div>
                        </div>
                        {item.equipment_assignments && item.equipment_assignments.filter(a => a.status === 'active').length > 0 && (
                          <div className="mt-2 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                            <div className="text-xs font-medium text-blue-800 mb-1">Assigned to:</div>
                            {item.equipment_assignments.filter(a => a.status === 'active').map(assignment => (
                              <div key={assignment.id} className="text-sm text-blue-700">
                                {assignment.guests?.name} ({assignment.guests?.guest_id})
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowViewModal(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                title="Close"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Unit Modal */}
      {showAddUnitModal && selectedEquipmentGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add Units</h2>
              <button
                onClick={() => setShowAddUnitModal(false)}
                className="text-gray-400 hover:text-gray-600"
                title="Close modal"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Add new units to <strong>{selectedEquipmentGroup[0].base_name || selectedEquipmentGroup[0].name}</strong>:
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Anzahl Units *
                  </label>
                  <input
                    type="text"
                    value={addUnitFormData.count}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value === '' || /^\d+$/.test(value)) {
                        setAddUnitFormData({...addUnitFormData, count: parseInt(value) || 1})
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
                    value={addUnitFormData.numbering_type}
                    onChange={(e) => setAddUnitFormData({...addUnitFormData, numbering_type: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Select numbering type"
                  >
                    <option value="numeric">Numeric (1, 2, 3...)</option>
                    <option value="alphabetic">Alphabetic (A, B, C...)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nummerierung ab
                  </label>
                  <input
                    type="text"
                    value={addUnitFormData.numbering_start}
                    onChange={(e) => setAddUnitFormData({...addUnitFormData, numbering_start: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1, 2, 3 or a, b, c..."
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleSaveAddUnit}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                title="Add Units"
              >
                Add Units
              </button>
              <button
                onClick={() => setShowAddUnitModal(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                title="Cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Equipment Modal */}
      {showAssignModal && selectedEquipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Assign Equipment</h2>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-400 hover:text-gray-600"
                title="Close modal"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Assign <strong>{selectedEquipment.name}</strong> to a guest:
              </p>
              <select
                value={selectedGuestId}
                onChange={(e) => setSelectedGuestId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Select guest to assign equipment"
              >
                <option value="">Select a guest</option>
                {guests.map(guest => {
                  // Check if guest already has equipment of the same category
                  const hasSameCategory = equipment
                    .flatMap(eq => eq.equipment_assignments || [])
                    .some(assignment => 
                      assignment.guests?.id === guest.id && 
                      assignment.status === 'active' &&
                      equipment.find(eq => eq.equipment_assignments?.some(ass => ass.id === assignment.id))?.category === selectedEquipment.category
                    )

                  return (
                    <option 
                      key={guest.id} 
                      value={guest.id}
                      disabled={hasSameCategory}
                      className={hasSameCategory ? 'text-gray-400' : ''}
                    >
                      {guest.name} ({guest.guest_id}){hasSameCategory ? ' - Already assigned' : ''}
                    </option>
                  )
                })}
              </select>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleAssignEquipmentToGuest}
                disabled={!selectedGuestId}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                title="Assign equipment to guest"
              >
                Assign
              </button>
              <button
                onClick={() => setShowAssignModal(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
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