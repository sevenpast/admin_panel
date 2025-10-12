'use client'

import { useState, useEffect } from 'react'
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  UserIcon,
  DocumentArrowDownIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { databaseService, Staff as DbStaff } from '@/lib/database-service'

// Use database service interface
type Staff = DbStaff

interface StaffManagementProps {
  selectedDate: string
  onDateChange: (date: string) => void
}

export default function StaffManagementComponent({ selectedDate, onDateChange }: StaffManagementProps) {
  // Modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Selected items
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [editingStaff, setEditingStaff] = useState<Partial<Staff>>({})
  const [isEditMode, setIsEditMode] = useState(false)

  // Data states
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)

  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Load data from database
  useEffect(() => {
    loadStaff()
  }, [])

  const loadStaff = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/staff')
      if (response.ok) {
        const staffData = await response.json()
        setStaff(staffData)
      } else {
        console.error('Error loading staff:', response.statusText)
      }
    } catch (error) {
      console.error('Error loading staff:', error)
    } finally {
      setLoading(false)
    }
  }

  // Staff management functions
  const handleViewStaff = (staffMember: Staff) => {
    setSelectedStaff(staffMember)
    setIsViewModalOpen(true)
  }

  const handleEditStaff = (staffMember: Staff) => {
    setEditingStaff(staffMember)
    setIsEditMode(true)
    setIsEditModalOpen(true)
  }

  const handleCreateStaff = () => {
    setEditingStaff({
      name: '',
      email: '',
      phone: '',
      role: 'staff',
      is_active: true
    })
    setIsEditMode(false)
    setIsCreateModalOpen(true)
  }

  const handleSaveStaff = async () => {
    try {
      if (!editingStaff.name || !editingStaff.email) {
        alert('Please fill in all required fields')
        return
      }

      const staffData = {
        name: editingStaff.name,
        email: editingStaff.email,
        phone: editingStaff.phone || null,
        role: editingStaff.role || 'staff',
        is_active: editingStaff.is_active !== false
      }

      if (isEditMode && editingStaff.id) {
        const response = await fetch('/api/staff', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: editingStaff.id,
            ...staffData
          })
        })

        if (response.ok) {
          alert('Staff member updated successfully!')
          loadStaff()
        } else {
          const error = await response.json()
          alert(`Error updating staff: ${error.error}`)
        }
      } else {
        const response = await fetch('/api/staff', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(staffData)
        })

        if (response.ok) {
          alert('Staff member created successfully!')
          loadStaff()
        } else {
          const error = await response.json()
          alert(`Error creating staff: ${error.error}`)
        }
      }
    } catch (error) {
      console.error('Error saving staff:', error)
      alert('Error saving staff')
    }

    setIsEditModalOpen(false)
    setIsCreateModalOpen(false)
    setEditingStaff({})
    setIsEditMode(false)
  }

  const handleDeleteStaff = async (staffId: string) => {
    if (confirm('Are you sure you want to delete this staff member?')) {
      try {
        const response = await fetch(`/api/staff?id=${staffId}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          alert('Staff member deleted successfully!')
          loadStaff()
        } else {
          const error = await response.json()
          alert(`Error deleting staff: ${error.error}`)
        }
      } catch (error) {
        console.error('Error deleting staff:', error)
        alert('Error deleting staff')
      }
    }
  }

  // Filter and search functions
  const getFilteredStaff = () => {
    if (!Array.isArray(staff)) return []
    return staff.filter(staffMember => {
      const matchesSearch = searchTerm === '' || 
        staffMember.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staffMember.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole = roleFilter === '' || staffMember.role === roleFilter
      const matchesStatus = statusFilter === '' || 
        (statusFilter === 'active' && staffMember.is_active) ||
        (statusFilter === 'inactive' && !staffMember.is_active)
      
      return matchesSearch && matchesRole && matchesStatus
    })
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'manager': return 'bg-blue-100 text-blue-800'
      case 'instructor': return 'bg-green-100 text-green-800'
      case 'kitchen': return 'bg-yellow-100 text-yellow-800'
      case 'maintenance': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredStaff = getFilteredStaff()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Staff Management</h2>
          <p className="text-gray-600">Manage staff members and their information</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
            <UserIcon className="h-4 w-4" />
            <span className="text-sm font-medium">{filteredStaff.length}</span>
          </div>
          <button
            onClick={handleCreateStaff}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add Staff</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 pl-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="instructor">Instructor</option>
              <option value="kitchen">Kitchen</option>
              <option value="maintenance">Maintenance</option>
              <option value="staff">Staff</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Staff List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-6 text-center">
            <div className="text-lg">Loading staff...</div>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="p-6 text-center">
            <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No staff found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || roleFilter || statusFilter
                ? 'Try adjusting your search criteria.'
                : 'Get started by adding your first staff member.'
              }
            </p>
            {!searchTerm && !roleFilter && !statusFilter && (
              <button
                onClick={handleCreateStaff}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Add First Staff Member
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStaff.map((staffMember) => (
                  <tr key={staffMember.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{staffMember.name}</div>
                          <div className="text-sm text-gray-500">ID: {staffMember.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{staffMember.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{staffMember.phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(staffMember.role)}`}>
                        {staffMember.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        staffMember.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {staffMember.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewStaff(staffMember)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Staff"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditStaff(staffMember)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Edit Staff"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(staffMember.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Staff"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Staff View Modal */}
      {isViewModalOpen && selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{selectedStaff.name}</h3>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Personal Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Name:</strong> {selectedStaff.name}</p>
                    <p><strong>Email:</strong> {selectedStaff.email}</p>
                    <p><strong>Phone:</strong> {selectedStaff.phone || 'N/A'}</p>
                    <p><strong>ID:</strong> {selectedStaff.id}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Work Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Role:</strong> {selectedStaff.role}</p>
                    <p><strong>Status:</strong> {selectedStaff.is_active ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Staff Edit/Create Modal */}
      {(isEditModalOpen || isCreateModalOpen) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {isCreateModalOpen ? 'Add Staff Member' : 'Edit Staff Member'}
              </h3>
              <button
                onClick={() => {
                  setIsEditModalOpen(false)
                  setIsCreateModalOpen(false)
                  setEditingStaff({})
                  setIsEditMode(false)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={editingStaff.name || ''}
                  onChange={(e) => setEditingStaff({...editingStaff, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Enter full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={editingStaff.email || ''}
                  onChange={(e) => setEditingStaff({...editingStaff, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={editingStaff.phone || ''}
                  onChange={(e) => setEditingStaff({...editingStaff, phone: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Enter phone number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={editingStaff.role || 'staff'}
                  onChange={(e) => setEditingStaff({...editingStaff, role: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="staff">Staff</option>
                  <option value="instructor">Instructor</option>
                  <option value="kitchen">Kitchen</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editingStaff.is_active !== false}
                  onChange={(e) => setEditingStaff({...editingStaff, is_active: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                  Active (staff member can log in and work)
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setIsEditModalOpen(false)
                  setIsCreateModalOpen(false)
                  setEditingStaff({})
                  setIsEditMode(false)
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStaff}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {isCreateModalOpen ? 'Create' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
