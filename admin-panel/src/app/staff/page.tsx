'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { createClient } from '@/lib/supabase'

interface Staff {
  id: string
  staff_id: string
  name: string
  mobile_number?: string
  labels: string[]
  is_active: boolean
  image_url?: string
  description?: string
  created_at: string
  updated_at: string
}

const STAFF_LABELS = [
  { value: 'host', label: 'Host', color: 'bg-blue-100 text-blue-800' },
  { value: 'teacher', label: 'Teacher', color: 'bg-green-100 text-green-800' },
  { value: 'instructor', label: 'Instructor', color: 'bg-purple-100 text-purple-800' },
  { value: 'kitchen', label: 'Kitchen', color: 'bg-orange-100 text-orange-800' },
  { value: 'maintenance', label: 'Maintenance', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' }
]

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [labelFilter, setLabelFilter] = useState<string[]>([])

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)

  // Form Data
  const [formData, setFormData] = useState({
    name: '',
    mobile_number: '',
    is_active: true,
    image_url: '',
    description: '',
    labels: [] as string[]
  })

  // Image upload state
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadStaff()
  }, [])

  const loadStaff = async () => {
    setLoading(true)
    try {
      // Mock data since Supabase is not configured
      const mockStaff: Staff[] = [
        {
          id: '1',
          staff_id: 'S-A1B2C3D4E5',
          name: 'Max Mustermann',
          mobile_number: '+49123456789',
          labels: ['instructor', 'host'],
          is_active: true,
          image_url: undefined,
          description: 'Experienced surf instructor with 5+ years teaching beginners and intermediate surfers.',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          staff_id: 'S-F6G7H8I9J0',
          name: 'Anna Schmidt',
          mobile_number: '+49987654321',
          labels: ['kitchen'],
          is_active: true,
          image_url: undefined,
          description: 'Head chef specializing in healthy meals for active guests.',
          created_at: '2024-01-16T14:30:00Z',
          updated_at: '2024-01-16T14:30:00Z'
        },
        {
          id: '3',
          staff_id: 'S-K1L2M3N4O5',
          name: 'Tom Wilson',
          mobile_number: '+49555123456',
          labels: ['teacher', 'instructor'],
          is_active: true,
          image_url: undefined,
          description: 'Yoga teacher and surf instructor with expertise in mindfulness training.',
          created_at: '2024-01-17T09:15:00Z',
          updated_at: '2024-01-17T09:15:00Z'
        },
        {
          id: '4',
          staff_id: 'S-P6Q7R8S9T0',
          name: 'Lisa Rodriguez',
          mobile_number: '+49444567890',
          labels: ['maintenance', 'other'],
          is_active: false,
          image_url: undefined,
          description: 'Equipment maintenance and camp facility management.',
          created_at: '2024-01-18T16:45:00Z',
          updated_at: '2024-01-20T11:20:00Z'
        },
        {
          id: '5',
          staff_id: 'S-U1V2W3X4Y5',
          name: 'Carlos Martinez',
          mobile_number: '+49333445566',
          labels: ['host', 'other'],
          is_active: true,
          image_url: undefined,
          description: 'Camp host managing guest relations and activities coordination.',
          created_at: '2024-01-19T12:30:00Z',
          updated_at: '2024-01-19T12:30:00Z'
        },
        {
          id: '6',
          staff_id: 'S-Z6Y7X8W9V0',
          name: 'Sarah Connor',
          mobile_number: undefined,
          labels: ['teacher'],
          is_active: false,
          image_url: undefined,
          description: undefined,
          created_at: '2024-01-20T08:00:00Z',
          updated_at: '2024-01-22T15:10:00Z'
        }
      ]

      setStaff(mockStaff)
    } catch (error) {
      console.error('Error loading staff:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtered staff based on search and filters
  const filteredStaff = useMemo(() => {
    return staff.filter((member) => {
      // Search filter
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase())

      // Status filter
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && member.is_active) ||
        (statusFilter === 'inactive' && !member.is_active)

      // Label filter (OR logic - at least one label must match)
      const matchesLabels =
        labelFilter.length === 0 ||
        labelFilter.some(label => member.labels.includes(label))

      return matchesSearch && matchesStatus && matchesLabels
    })
  }, [staff, searchTerm, statusFilter, labelFilter])

  const getLabelColor = (label: string) => {
    return STAFF_LABELS.find(l => l.value === label)?.color || 'bg-gray-100 text-gray-800'
  }

  const handleCreateStaff = () => {
    setFormData({
      name: '',
      mobile_number: '',
      is_active: true,
      image_url: '',
      description: '',
      labels: []
    })
    setImagePreview(null)
    setShowCreateModal(true)
  }

  const handleViewStaff = (member: Staff) => {
    setSelectedStaff(member)
    setShowViewModal(true)
  }

  const handleEditStaff = (member: Staff) => {
    setSelectedStaff(member)
    setFormData({
      name: member.name,
      mobile_number: member.mobile_number || '',
      is_active: member.is_active,
      image_url: member.image_url || '',
      description: member.description || '',
      labels: member.labels
    })
    setImagePreview(member.image_url || null)
    setShowEditModal(true)
  }

  const handleDeleteStaff = async (member: Staff) => {
    if (confirm(`Delete staff ${member.staff_id}? This cannot be undone.`)) {
      setStaff(staff.filter(s => s.id !== member.id))
      alert('Staff deleted.')
    }
  }

  const handleSaveStaff = async () => {
    try {
      if (!formData.name.trim()) {
        alert('Name is required.')
        return
      }

      if (selectedStaff) {
        // Edit existing staff
        const updatedStaff = {
          ...selectedStaff,
          name: formData.name.trim(),
          mobile_number: formData.mobile_number.trim() || undefined,
          is_active: formData.is_active,
          image_url: formData.image_url.trim() || undefined,
          description: formData.description.trim() || undefined,
          labels: formData.labels,
          updated_at: new Date().toISOString()
        }

        setStaff(staff.map(s => s.id === selectedStaff.id ? updatedStaff : s))
        setShowEditModal(false)
        alert('Staff updated.')
      } else {
        // Create new staff
        const newStaff: Staff = {
          id: Date.now().toString(),
          staff_id: `S-${Math.random().toString(36).substr(2, 10).toUpperCase()}`,
          name: formData.name.trim(),
          mobile_number: formData.mobile_number.trim() || undefined,
          is_active: formData.is_active,
          image_url: formData.image_url.trim() || undefined,
          description: formData.description.trim() || undefined,
          labels: formData.labels,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        setStaff([newStaff, ...staff])
        setShowCreateModal(false)
        alert(`Staff created (ID: ${newStaff.staff_id}).`)
      }
    } catch (error) {
      console.error('Error saving staff:', error)
      alert('Save failed. Please try again.')
    }
  }

  const toggleLabelFilter = (label: string) => {
    setLabelFilter(prev =>
      prev.includes(label)
        ? prev.filter(l => l !== label)
        : [...prev, label]
    )
  }

  // Image upload handlers
  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.')
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Image size must be less than 5MB.')
      return
    }

    try {
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string
        setImagePreview(imageDataUrl)
        setFormData({...formData, image_url: imageDataUrl})
      }
      reader.readAsDataURL(file)

      // In real app, you would upload to Supabase Storage:
      // const { data, error } = await supabase.storage
      //   .from('staff-images')
      //   .upload(`${Date.now()}-${file.name}`, file)
      // if (!error) {
      //   const publicUrl = supabase.storage.from('staff-images').getPublicUrl(data.path)
      //   setFormData({...formData, image_url: publicUrl.data.publicUrl})
      // }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Error uploading image. Please try again.')
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleImageUpload(files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const removeImage = () => {
    setImagePreview(null)
    setFormData({...formData, image_url: ''})
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading staff...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
        <button
          onClick={handleCreateStaff}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
          title="Add Staff"
        >
          <PlusIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 space-y-4">
        {/* Search */}
        <div className="flex items-center space-x-2">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search staff by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Staff</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Label Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Labels</label>
            <div className="flex flex-wrap gap-2">
              {STAFF_LABELS.map(label => (
                <button
                  key={label.value}
                  onClick={() => toggleLabelFilter(label.value)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    labelFilter.includes(label.value)
                      ? label.color + ' ring-2 ring-blue-500'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {label.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active Filters Summary */}
        {(statusFilter !== 'all' || labelFilter.length > 0 || searchTerm) && (
          <div className="text-sm text-gray-600">
            Showing {filteredStaff.length} of {staff.length} staff members
          </div>
        )}
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStaff.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No staff found for current filters.
          </div>
        ) : (
          filteredStaff.map((member) => (
            <div key={member.id} className="bg-white rounded-lg shadow p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    {member.image_url ? (
                      <img
                        src={member.image_url}
                        alt={member.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-6 w-6 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-500">{member.staff_id}</p>
                  </div>
                </div>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    member.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {member.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Labels */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {member.labels.map((label) => (
                    <span
                      key={label}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLabelColor(label)}`}
                    >
                      {STAFF_LABELS.find(l => l.value === label)?.label || label}
                    </span>
                  ))}
                  {member.labels.length === 0 && (
                    <span className="text-xs text-gray-500 italic">No labels assigned</span>
                  )}
                </div>
              </div>

              {/* Mobile Number */}
              {member.mobile_number && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">{member.mobile_number}</p>
                </div>
              )}

              {/* Description Preview */}
              {member.description && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {member.description}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleViewStaff(member)}
                  className="text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-blue-50"
                  title="View Staff"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleEditStaff(member)}
                  className="text-green-600 hover:text-green-800 p-2 rounded-md hover:bg-green-50"
                  title="Edit Staff"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteStaff(member)}
                  className="text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50"
                  title="Delete Staff"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {selectedStaff ? 'Edit Staff' : 'Create Staff'}
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

            <div className="space-y-4">
              {/* Name */}
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

              {/* Mobile Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={formData.mobile_number}
                  onChange={(e) => setFormData({...formData, mobile_number: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+49123456789"
                />
              </div>

              {/* Status Toggle */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Image
                </label>
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Profile preview"
                      className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                      title="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
                      isDragOver
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    <div className="text-center">
                      <UserIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-1">
                        Drag & drop image here
                      </p>
                      <p className="text-xs text-gray-500">
                        or click to browse (max 5MB)
                      </p>
                    </div>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              {/* Labels */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Labels
                </label>
                <div className="flex flex-wrap gap-2">
                  {STAFF_LABELS.map(label => (
                    <button
                      key={label.value}
                      type="button"
                      onClick={() => {
                        const newLabels = formData.labels.includes(label.value)
                          ? formData.labels.filter(l => l !== label.value)
                          : [...formData.labels, label.value]
                        setFormData({...formData, labels: newLabels})
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        formData.labels.includes(label.value)
                          ? label.color + ' ring-2 ring-blue-500'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {label.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>

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
                onClick={handleSaveStaff}
                disabled={!formData.name.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                💾 Save Staff
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Staff Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Header with Image */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  {selectedStaff.image_url ? (
                    <img
                      src={selectedStaff.image_url}
                      alt={selectedStaff.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-8 w-8 text-gray-500" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedStaff.name}</h3>
                  <p className="text-sm text-gray-500">{selectedStaff.staff_id}</p>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                      selectedStaff.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {selectedStaff.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Labels */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Labels</label>
                <div className="flex flex-wrap gap-1">
                  {selectedStaff.labels.map((label) => (
                    <span
                      key={label}
                      className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getLabelColor(label)}`}
                    >
                      {STAFF_LABELS.find(l => l.value === label)?.label || label}
                    </span>
                  ))}
                  {selectedStaff.labels.length === 0 && (
                    <span className="text-sm text-gray-500 italic">No labels assigned</span>
                  )}
                </div>
              </div>

              {/* Mobile Number */}
              {selectedStaff.mobile_number && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedStaff.mobile_number}</p>
                </div>
              )}

              {/* Description */}
              {selectedStaff.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedStaff.description}</p>
                </div>
              )}

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created At</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedStaff.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedStaff.updated_at).toLocaleString()}
                  </p>
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