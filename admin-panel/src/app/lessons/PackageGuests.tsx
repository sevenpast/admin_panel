'use client'

import { useState, useEffect } from 'react'
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  GlobeAltIcon,
  PlusIcon,
  XMarkIcon,
  CheckIcon,
  UserGroupIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserPlusIcon,
  AcademicCapIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import { databaseService, Guest as DbGuest, GearItem } from '@/lib/database-service'

// Types based on database schema
type Guest = DbGuest & {
  surf_package?: boolean
  equipment_assignments?: any[]
}

interface PackageGuestsProps {
  selectedDate: string
  onDateChange: (date: string) => void
}

export default function PackageGuestsComponent({ selectedDate, onDateChange }: PackageGuestsProps) {
  // Modal states
  const [isGuestViewModalOpen, setIsGuestViewModalOpen] = useState(false)
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false)

  // Selected items
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)

  // Data states
  const [guests, setGuests] = useState<Guest[]>([])
  const [gearItems, setGearItems] = useState<GearItem[]>([])
  const [equipmentAssignments, setEquipmentAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Filter states
  const [guestFilter, setGuestFilter] = useState<{
    name: string
    level: string
    materialStatus: string
  }>({ name: '', level: '', materialStatus: '' })

  // Load data from database
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // Load guests with surf package
        const guestsResponse = await fetch('/api/guests')
        if (guestsResponse.ok) {
          const result = await guestsResponse.json()
          const dbGuests = result.success ? result.data : result
          // Filter for guests with surf packages (assuming all guests have surf packages for now)
          const packageGuests = Array.isArray(dbGuests) ? dbGuests.filter((guest: any) => guest.surf_package !== false) : []
          setGuests(packageGuests)
        }

        // Load assessment questions
        const questionsResponse = await fetch('/api/assessment-questions')
        if (questionsResponse.ok) {
          const result = await questionsResponse.json()
          const dbQuestions = result.success ? result.data : result
          // setQuestions(dbQuestions) - not needed in this component
        }

        // Load gear items
        const dbGearItems = await databaseService.getGearItems()
        setGearItems(dbGearItems)

        // Load equipment assignments
        const assignmentsResponse = await fetch('/api/equipment-assignments')
        if (assignmentsResponse.ok) {
          const result = await assignmentsResponse.json()
          const assignmentsData = result.success ? result.data : result
          setEquipmentAssignments(assignmentsData)
        }
      } catch (error) {
        console.error('Error loading lessons data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Guest management functions
  const handleViewGuest = (guest: Guest) => {
    setSelectedGuest(guest)
    setIsGuestViewModalOpen(true)
  }

  const handleManageMaterials = (guest: Guest) => {
    setSelectedGuest(guest)
    setIsMaterialModalOpen(true)
  }

  const handleUpdateGuestSurfLevel = async (guestId: string, newLevel: string) => {
    try {
      const response = await fetch('/api/guests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: guestId,
          surf_level: newLevel
        })
      })

      if (response.ok) {
        // Update local state
        setGuests(prev => prev.map(guest => 
          guest.id === guestId ? { ...guest, surf_level: newLevel } : guest
        ))
        alert('Surf level updated successfully!')
      } else {
        alert('Error updating surf level')
      }
    } catch (error) {
      console.error('Error updating guest surf level:', error)
      alert('Error updating surf level')
    }
  }

  // Material assignment
  const handleAssignMaterial = async (guestId: string, equipmentId: string) => {
    try {
      const response = await fetch('/api/equipment-assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          equipment_id: equipmentId,
          guest_id: guestId
        })
      })

      if (response.ok) {
        const newAssignment = await response.json()
        setEquipmentAssignments(prev => [...prev, newAssignment])
        alert('Material erfolgreich zugewiesen')
      } else {
        const error = await response.json()
        alert(`Fehler beim Zuweisen des Materials: ${error.error}`)
      }
    } catch (error) {
      console.error('Error assigning material:', error)
      alert('Fehler beim Zuweisen des Materials')
    }
  }

  const handleUnassignMaterial = async (assignmentId: string) => {
    try {
      const response = await fetch(`/api/equipment-assignments?id=${assignmentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setEquipmentAssignments(prev => prev.filter(assignment => assignment.id !== assignmentId))
        alert('Material erfolgreich entfernt')
      } else {
        const error = await response.json()
        alert(`Fehler beim Entfernen des Materials: ${error.error}`)
      }
    } catch (error) {
      console.error('Error unassigning material:', error)
      alert('Fehler beim Entfernen des Materials')
    }
  }

  // Filter and search functions
  const getFilteredGuests = () => {
    return guests.filter(guest => {
      const matchesName = guestFilter.name === '' || 
        guest.name.toLowerCase().includes(guestFilter.name.toLowerCase())
      const matchesLevel = guestFilter.level === '' || 
        guest.surf_level === guestFilter.level
      const matchesMaterial = guestFilter.materialStatus === '' || 
        (guestFilter.materialStatus === 'assigned' && 
         equipmentAssignments.some(assignment => assignment.guest_id === guest.id && assignment.status === 'active')) ||
        (guestFilter.materialStatus === 'not_assigned' && 
         !equipmentAssignments.some(assignment => assignment.guest_id === guest.id && assignment.status === 'active'))
      
      return matchesName && matchesLevel && matchesMaterial
    })
  }

  const activePackageGuests = getFilteredGuests()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Package Guests</h2>
          <p className="text-gray-600">Manage surf package guests and their equipment assignments</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
            <UserGroupIcon className="h-4 w-4" />
            <span className="text-sm font-medium">{activePackageGuests.length}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              placeholder="Search by name..."
              value={guestFilter.name}
              onChange={(e) => setGuestFilter({...guestFilter, name: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Surf Level</label>
            <select
              value={guestFilter.level}
              onChange={(e) => setGuestFilter({...guestFilter, level: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Material Status</label>
            <select
              value={guestFilter.materialStatus}
              onChange={(e) => setGuestFilter({...guestFilter, materialStatus: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All</option>
              <option value="assigned">Material Assigned</option>
              <option value="not_assigned">No Material</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Surf Package Guests */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Active Surf Package Guests ({activePackageGuests.length})</h3>
              <p className="text-sm text-gray-600">Guests with active surf packages</p>
            </div>
            <div className="text-sm text-blue-600 font-medium">
              {activePackageGuests.length} Active Surf Package Guests
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="text-lg">Loading guests...</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NAME + GUEST ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    LEVEL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MATERIAL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activePackageGuests.map((guest) => {
                  const assignedGear = equipmentAssignments.filter(assignment => 
                    assignment.guest_id === guest.id && assignment.status === 'active'
                  )
                  return (
                    <tr key={guest.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{guest.name}</div>
                          <div className="text-sm text-gray-500">{guest.id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {guest.surf_level ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {guest.surf_level}
                          </span>
                        ) : (
                          <span className="text-gray-400">Nicht zugewiesen</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {assignedGear.length > 0
                            ? assignedGear.map(assignment => assignment.equipment?.name || 'Unknown Equipment').join('; ')
                            : 'Kein Material zugewiesen'
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewGuest(guest)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Guest"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleManageMaterials(guest)}
                            className="text-green-600 hover:text-green-900"
                            title="Manage Materials"
                          >
                            <Cog6ToothIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Guest View Modal */}
      {isGuestViewModalOpen && selectedGuest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{selectedGuest.name}</h3>
              <button
                onClick={() => setIsGuestViewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Guest Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>ID:</strong> {selectedGuest.id}</p>
                    <p><strong>Name:</strong> {selectedGuest.name}</p>
                    <p><strong>Email:</strong> {selectedGuest.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> {selectedGuest.phone || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Surf Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Surf Level:</strong> {selectedGuest.surf_level || 'Not assigned'}</p>
                    <p><strong>Surf Package:</strong> {selectedGuest.surf_package ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Update Surf Level</h4>
                <div className="flex space-x-2">
                  <select
                    value={selectedGuest.surf_level || ''}
                    onChange={(e) => handleUpdateGuestSurfLevel(selectedGuest.id, e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Select Level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Material Assignment Modal */}
      {isMaterialModalOpen && selectedGuest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Manage Materials for {selectedGuest.name}</h3>
              <button
                onClick={() => setIsMaterialModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Section A: Assigned Materials */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Zugewiesene Materialien</h3>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {equipmentAssignments
                      .filter(assignment => assignment.guest_id === selectedGuest.id && assignment.status === 'active')
                      .map((assignment) => (
                        <div key={assignment.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">{assignment.equipment?.name || 'Unknown Equipment'}</div>
                            <div className="text-sm text-gray-500">Category: {assignment.equipment?.category}</div>
                          </div>
                          <button
                            onClick={() => handleUnassignMaterial(assignment.id)}
                            className="text-red-600 hover:text-red-800 font-medium text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    {equipmentAssignments.filter(assignment => assignment.guest_id === selectedGuest.id && assignment.status === 'active').length === 0 && (
                      <p className="text-gray-500 italic">Kein Material zugewiesen</p>
                    )}
                  </div>
                </div>

                {/* Section B: Available Materials */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Verfügbare Materialien</h3>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {gearItems
                      .filter(item => {
                        // Check if item is not assigned to any guest
                        const isAssigned = equipmentAssignments.some(assignment => 
                          assignment.equipment_id === item.id && assignment.status === 'active'
                        )
                        return !isAssigned
                      })
                      .map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500">Category: {item.category}</div>
                          </div>
                          <button
                            onClick={() => handleAssignMaterial(selectedGuest.id, item.id)}
                            className="text-green-600 hover:text-green-800 font-medium text-sm"
                          >
                            Add
                          </button>
                        </div>
                      ))}
                    {gearItems.filter(item => {
                      const isAssigned = equipmentAssignments.some(assignment => 
                        assignment.equipment_id === item.id && assignment.status === 'active'
                      )
                      return !isAssigned
                    }).length === 0 && (
                      <p className="text-gray-500 italic">Keine verfügbaren Materialien</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
