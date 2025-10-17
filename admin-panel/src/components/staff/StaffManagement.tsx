'use client'

import { useState, useEffect } from 'react'
import { useToastContext } from '@/components/common/ToastProvider'
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  UserIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  AcademicCapIcon,
  SparklesIcon,
  WrenchScrewdriverIcon,
  PhoneIcon,
  CheckIcon,
  PhotoIcon,
  ClockIcon,
  CloudArrowUpIcon,
  DocumentIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'

// Staff interface according to specification
interface Staff {
  id: string
  staff_id: string
  camp_id: string
  name: string
  mobile_number?: string
  status: 'active' | 'inactive'
  image_url?: string
  description?: string
  labels: string[]
  color?: string
  created_at: string
  updated_at: string
}

// Available labels according to specification
const STAFF_LABELS = ['host', 'teacher', 'instructor', 'kitchen', 'maintenance', 'other'] as const
type StaffLabel = typeof STAFF_LABELS[number]

// German label translations
const LABEL_TRANSLATIONS: Record<StaffLabel, string> = {
  host: 'Host',
  teacher: 'Teacher',
  instructor: 'Instructor',
  kitchen: 'Kitchen',
  maintenance: 'Maintenance',
  other: 'Other'
}

// Label icons
const getLabelIcon = (label: StaffLabel) => {
  switch (label) {
    case 'host': return ShieldCheckIcon
    case 'teacher': return AcademicCapIcon
    case 'instructor': return UserGroupIcon
    case 'kitchen': return SparklesIcon
    case 'maintenance': return WrenchScrewdriverIcon
    default: return UserIcon
  }
}

// Label colors
const getLabelColor = (label: StaffLabel) => {
  switch (label) {
    case 'host': return 'bg-purple-100 text-purple-800'
    case 'teacher': return 'bg-blue-100 text-blue-800'
    case 'instructor': return 'bg-green-100 text-green-800'
    case 'kitchen': return 'bg-orange-100 text-orange-800'
    case 'maintenance': return 'bg-gray-100 text-gray-800'
    default: return 'bg-slate-100 text-slate-800'
  }
}

// Generate S-XXXXXXXXXX ID
const generateStaffId = (): string => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let result = 'S-'
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

interface StaffManagementProps {
  selectedDate: string
  onDateChange: (date: string) => void
}

export default function StaffManagementComponent({ selectedDate, onDateChange }: StaffManagementProps) {
  // State management
  const { success, error: showError } = useToastContext()
  const [staff, setstaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter states
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [labelFilter, setLabelFilter] = useState<StaffLabel | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [editingStaff, setEditingStaff] = useState<Partial<Staff>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load staff data
  const loadStaff = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/staff')
      if (!response.ok) throw new Error('Failed to load staff')
      const result = await response.json()
      setStaff(result.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load staff')
      showError('Error loading staff. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStaff()
  }, [])

  // Filter staff based on current filters
  const filteredStaff = staff.filter(member => {
    // Status filter
    if (statusFilter !== 'all' && member.status !== statusFilter) return false

    // Label filter
    if (labelFilter !== 'all' && !member.labels.includes(labelFilter)) return false

    // Search filter
    if (searchQuery && !member.name.toLowerCase().includes(searchQuery.toLowerCase())) return false

    return true
  })

  // Create new staff member
  const handleCreateStaff = async (staffData: Partial<Staff>) => {
    try {
      setIsSubmitting(true)

      // Validate required fields
      if (!staffData.name?.trim()) {
        showError('Name is required.')
        return
      }

      const newStaffData = {
        ...staffData,
        name: staffData.name.trim(),
        status: staffData.status || 'active',
        labels: staffData.labels || []
      }

      const response = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStaffData)
      })

      if (!response.ok) throw new Error('Failed to create staff')

      const result = await response.json()
      const createdStaff = result.data

      showError(`Staff created (ID: ${createdStaff.staff_id}).`)
      setIsCreateModalOpen(false)
      await loadStaff()
    } catch (err) {
      showError('Failed to create staff. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update staff member
  const handleUpdateStaff = async (staffData: Partial<Staff>) => {
    try {
      setIsSubmitting(true)

      // Validate required fields
      if (!staffData.name?.trim()) {
        showError('Name is required.')
        return
      }

      // Check for status change warnings
      if (selectedStaff && staffData.status !== selectedStaff.status) {
        if (staffData.status === 'inactive') {
          // TODO: Check for future assignments and warn
          if (confirm('This staff member is assigned to future items. They will become unavailable for new assignments. Continue?')) {
            // Continue with update
          } else {
            return
          }
        }
      }

      const updateData = {
        id: selectedStaff?.id,
        ...staffData,
        name: staffData.name.trim()
      }

      const response = await fetch('/api/staff', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) throw new Error('Failed to update staff')

      success('Staff updated.')
      setIsEditModalOpen(false)
      setSelectedStaff(null)
      await loadStaff()
    } catch (err) {
      showError('Update failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete staff member
  const handleDeleteStaff = async (staffMember: Staff) => {
    try {
      // TODO: Check for future assignments
      const hasAssignments = false // This would be a real check

      if (hasAssignments) {
        success('Cannot delete. Staff is assigned to future items.')
        return
      }

      if (!confirm(`Delete staff ${staffMember.staff_id}? This cannot be undone.`)) {
        return
      }

      const response = await fetch(`/api/staff?id=${staffMember.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete staff')

      success('Staff deleted.')
      await loadStaff()
    } catch (err) {
      showError('Delete failed. Please try again.')
    }
  }

  // Format timestamp for German timezone
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('de-DE', {
      timeZone: 'Europe/Berlin',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Upload image file
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('Failed to upload image')
    }

    const result = await response.json()
    return result.url
  }

  // Drag and drop image upload component
  const ImageUpload = ({
    value,
    onChange,
    className = ''
  }: {
    value?: string
    onChange: (url: string) => void
    className?: string
  }) => {
    const [isDragging, setIsDragging] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string>(value || '')

    useEffect(() => {
      setPreviewUrl(value || '')
    }, [value])

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
    }

    const handleDrop = async (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const files = Array.from(e.dataTransfer.files)
      const file = files[0]

      if (file && file.type.startsWith('image/')) {
        await handleFileUpload(file)
      } else {
        showError('Please upload an image file (JPG, PNG, GIF, WebP)')
      }
    }

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        await handleFileUpload(file)
      }
    }

    const handleFileUpload = async (file: File) => {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showError('File size must be less than 5MB')
        return
      }

      // Validate file type
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
        showError('Please upload an image file (JPG, PNG, GIF, WebP)')
        return
      }

      try {
        setIsUploading(true)

        // Create preview URL
        const preview = URL.createObjectURL(file)
        setPreviewUrl(preview)

        // Upload file
        const uploadedUrl = await uploadImage(file)
        onChange(uploadedUrl)

        // Clean up preview URL
        URL.revokeObjectURL(preview)
        setPreviewUrl(uploadedUrl)
      } catch (err) {
        showError('Failed to upload image. Please try again.')
        setPreviewUrl(value || '')
      } finally {
        setIsUploading(false)
      }
    }

    const removeImage = () => {
      setPreviewUrl('')
      onChange('')
    }

    return (
      <div className={`space-y-3 ${className}`}>
        {previewUrl ? (
          // Image preview
          <div className="relative">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-32 object-cover rounded-lg border"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
              disabled={isUploading}
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            )}
          </div>
        ) : (
          // Upload area
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {isUploading ? (
              <div className="space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-600">Uploading...</p>
              </div>
            ) : (
              <div className="space-y-2">
                <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-sm text-gray-600">
                    Drag and drop an image here, or{' '}
                    <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
                      browse files
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    JPG, PNG, GIF, WebP up to 5MB
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Staff form component
  const StaffForm = ({
    staff,
    onSave,
    onCancel,
    isEditing = false
  }: {
    staff: Partial<Staff>
    onSave: (data: Partial<Staff>) => void
    onCancel: () => void
    isEditing?: boolean
  }) => {
    const [formData, setFormData] = useState<Partial<Staff>>({
      name: '',
      mobile_number: '',
      status: 'active',
      image_url: '',
      description: '',
      labels: [],
      color: '#3B82F6',
      ...staff,
      // Ensure labels is set from roles if it exists (for editing)
      labels: staff.roles || staff.labels || []
    })

    // Update form data when staff prop changes (important for editing)
    useEffect(() => {
      setFormData({
        name: '',
        mobile_number: '',
        status: 'active',
        image_url: '',
        description: '',
        labels: [],
        ...staff,
        // Ensure labels is set from roles if it exists (for editing)
        labels: staff.roles || staff.labels || []
      })
    }, [staff])

    const toggleLabel = (label: StaffLabel) => {
      const currentLabels = formData.labels || []
      if (currentLabels.includes(label)) {
        setFormData({
          ...formData,
          labels: currentLabels.filter(l => l !== label)
        })
      } else {
        setFormData({
          ...formData,
          labels: [...currentLabels, label]
        })
      }
    }

    return (
      <div className="space-y-6">
        {/* Name - Required */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name *
          </label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter staff name"
            required
          />
        </div>

        {/* Mobile Number - Optional */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <PhoneIcon className="h-4 w-4 inline mr-1" />
            Mobile Number
          </label>
          <input
            type="tel"
            value={formData.mobile_number || ''}
            onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="+49 123 456 7890"
          />
        </div>

        {/* Status Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="status"
                value="active"
                checked={formData.status === 'active'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                className="mr-2"
              />
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Active
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="status"
                value="inactive"
                checked={formData.status === 'inactive'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                className="mr-2"
              />
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                Inactive
              </span>
            </label>
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <PhotoIcon className="h-4 w-4 inline mr-1" />
            Image
          </label>
          <ImageUpload
            value={formData.image_url}
            onChange={(url) => setFormData({ ...formData, image_url: url })}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Optional description..."
          />
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Staff Color
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={formData.color || '#3B82F6'}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
            />
            <div className="flex-1">
              <input
                type="text"
                value={formData.color || '#3B82F6'}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="#3B82F6"
              />
              <p className="text-xs text-gray-500 mt-1">
                This color will be used for shifts and calendar events
              </p>
            </div>
          </div>
        </div>

        {/* Labels */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Labels (Multiple Selection)
          </label>
          <div className="grid grid-cols-2 gap-3">
            {STAFF_LABELS.map(label => {
              const LabelIcon = getLabelIcon(label)
              const isSelected = formData.labels?.includes(label) || false
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggleLabel(label)}
                  className={`flex items-center justify-center p-3 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <LabelIcon className={`h-4 w-4 mr-2 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span className={`font-medium ${isSelected ? 'text-blue-600' : 'text-gray-700'}`}>
                    {LABEL_TRANSLATIONS[label]}
                  </span>
                  {isSelected && <CheckIcon className="h-4 w-4 ml-auto text-blue-600" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              // Ensure roles is set from labels for API compatibility
              const dataToSave = {
                ...formData,
                roles: formData.labels
              }
              onSave(dataToSave)
            }}
            disabled={isSubmitting || !formData.name?.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700"
          aria-label="Create new staff"
        >
          <PlusIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Staff</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Label Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Labels</label>
            <select
              value={labelFilter}
              onChange={(e) => setLabelFilter(e.target.value as StaffLabel | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Labels</option>
              {STAFF_LABELS.map(label => (
                <option key={label} value={label}>{LABEL_TRANSLATIONS[label]}</option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Staff Cards Grid */}
      {filteredStaff.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No staff found for current filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.map(member => (
            <div key={member.id} className="bg-white border rounded-lg p-6 space-y-4">
              {/* Header with image and name */}
              <div className="flex items-start space-x-3">
                {member.image_url ? (
                  <img
                    src={member.image_url}
                    alt={member.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: member.color || '#6B7280' }}
                  >
                    <UserIcon className="h-6 w-6 text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{member.name}</h3>
                  <p className="text-sm text-gray-500">{member.staff_id}</p>
                  {/* Color indicator */}
                  <div className="flex items-center space-x-2 mt-1">
                    <div
                      className="w-3 h-3 rounded-full border border-gray-300"
                      style={{ backgroundColor: member.color || '#6B7280' }}
                    ></div>
                    <span className="text-xs text-gray-400">
                      {member.color || '#6B7280'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  member.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {member.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Labels */}
              <div>
                {member.labels && member.labels.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {member.labels.map(label => {
                      const LabelIcon = getLabelIcon(label as StaffLabel)
                      return (
                        <span
                          key={label}
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getLabelColor(label as StaffLabel)}`}
                        >
                          <LabelIcon className="h-3 w-3 mr-1" />
                          {LABEL_TRANSLATIONS[label as StaffLabel]}
                        </span>
                      )
                    })}
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">No labels</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-2 border-t">
                <button
                  onClick={() => {
                    setSelectedStaff(member)
                    setIsViewModalOpen(true)
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600"
                  aria-label="View staff"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setSelectedStaff(member)
                    setEditingStaff(member)
                    setIsEditModalOpen(true)
                  }}
                  className="p-2 text-gray-400 hover:text-green-600"
                  aria-label="Edit staff"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteStaff(member)}
                  className="p-2 text-gray-400 hover:text-red-600"
                  aria-label="Delete staff"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Create Staff</h2>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <StaffForm
                staff={{}}
                onSave={handleCreateStaff}
                onCancel={() => setIsCreateModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">View Staff</h2>
                <button
                  onClick={() => {
                    setIsViewModalOpen(false)
                    setSelectedStaff(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Image and Basic Info */}
                <div className="flex items-start space-x-4">
                  {selectedStaff.image_url ? (
                    <img
                      src={selectedStaff.image_url}
                      alt={selectedStaff.name}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                      <UserIcon className="h-10 w-10 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedStaff.name}</h3>
                    <p className="text-lg text-gray-600">{selectedStaff.staff_id}</p>
                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full mt-2 ${
                      selectedStaff.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedStaff.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Labels */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Labels</h4>
                  {selectedStaff.labels && selectedStaff.labels.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedStaff.labels.map(label => {
                        const LabelIcon = getLabelIcon(label as StaffLabel)
                        return (
                          <span
                            key={label}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getLabelColor(label as StaffLabel)}`}
                          >
                            <LabelIcon className="h-4 w-4 mr-1" />
                            {LABEL_TRANSLATIONS[label as StaffLabel]}
                          </span>
                        )
                      })}
                    </div>
                  ) : (
                    <span className="text-gray-400">No labels assigned</span>
                  )}
                </div>

                {/* Contact Info */}
                {selectedStaff.mobile_number && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Contact</h4>
                    <div className="flex items-center text-gray-600">
                      <PhoneIcon className="h-4 w-4 mr-2" />
                      {selectedStaff.mobile_number}
                    </div>
                  </div>
                )}

                {/* Description */}
                {selectedStaff.description && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-600">{selectedStaff.description}</p>
                  </div>
                )}

                {/* Audit Info */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Audit Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        Created At
                      </div>
                      <div className="ml-5">{formatTimestamp(selectedStaff.created_at)}</div>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        Last Updated
                      </div>
                      <div className="ml-5">{formatTimestamp(selectedStaff.updated_at)}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t mt-6">
                <button
                  onClick={() => {
                    setIsViewModalOpen(false)
                    setSelectedStaff(null)
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Edit Staff</h2>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false)
                    setSelectedStaff(null)
                    setEditingStaff({})
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <StaffForm
                staff={editingStaff}
                onSave={handleUpdateStaff}
                onCancel={() => {
                  setIsEditModalOpen(false)
                  setSelectedStaff(null)
                  setEditingStaff({})
                }}
                isEditing={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}