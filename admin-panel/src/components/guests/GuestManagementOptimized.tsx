'use client'

import { useState, useMemo, useCallback } from 'react'
import { useToastContext } from '@/components/common/ToastProvider'
import { useGuests, useAssessmentQuestions, useCreateGuest, useUpdateGuest, useDeleteGuest } from '@/hooks/useApi'
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

interface GuestManagementOptimizedProps {
  initialGuests?: Guest[]
  initialAssessmentQuestions?: AssessmentQuestion[]
}

export default function GuestManagementOptimized({ 
  initialGuests = [], 
  initialAssessmentQuestions = [] 
}: GuestManagementOptimizedProps) {
  const { success, error } = useToastContext()
  
  // React Query hooks for data fetching
  const { data: guests = initialGuests, isLoading: guestsLoading, error: guestsError } = useGuests()
  const { data: assessmentQuestions = initialAssessmentQuestions, isLoading: questionsLoading } = useAssessmentQuestions()
  
  // Mutation hooks
  const createGuestMutation = useCreateGuest()
  const updateGuestMutation = useUpdateGuest()
  const deleteGuestMutation = useDeleteGuest()

  // Local state - minimized to only what's necessary
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view')
  const [activeTab, setActiveTab] = useState<'details' | 'assessment'>('details')

  // Memoized filtered guests for better performance
  const filteredGuests = useMemo(() => {
    if (!searchTerm.trim()) return guests
    
    const term = searchTerm.toLowerCase()
    return guests.filter(guest => 
      guest.name.toLowerCase().includes(term) ||
      guest.mobile_number?.toLowerCase().includes(term) ||
      guest.instagram?.toLowerCase().includes(term) ||
      guest.guest_id.toLowerCase().includes(term)
    )
  }, [guests, searchTerm])

  // Memoized guest form data
  const [guestFormData, setGuestFormData] = useState({
    name: '',
    mobile_number: '',
    instagram: '',
    surf_package: false,
    allergies: {} as Record<string, boolean>,
    other_allergies: '',
    assessment_answers: {} as Record<string, number>
  })

  // Memoized assessment questions by category
  const questionsByCategory = useMemo(() => {
    const categories = ['experience', 'safety', 'preferences', 'goals']
    return categories.reduce((acc, category) => {
      acc[category] = assessmentQuestions
        .filter(q => q.category === category && q.is_active)
        .sort((a, b) => a.sort_order - b.sort_order)
      return acc
    }, {} as Record<string, AssessmentQuestion[]>)
  }, [assessmentQuestions])

  // Optimized handlers with useCallback
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }, [])

  const handleOpenModal = useCallback((guest: Guest | null, mode: 'view' | 'edit' | 'create') => {
    setSelectedGuest(guest)
    setModalMode(mode)
    setIsModalOpen(true)
    setActiveTab('details')
    
    if (guest && mode !== 'create') {
      setGuestFormData({
        name: guest.name,
        mobile_number: guest.mobile_number || '',
        instagram: guest.instagram || '',
        surf_package: guest.surf_package,
        allergies: guest.allergies || {},
        other_allergies: guest.other_allergies || '',
        assessment_answers: guest.assessment_answers || {}
      })
    } else if (mode === 'create') {
      setGuestFormData({
        name: '',
        mobile_number: '',
        instagram: '',
        surf_package: false,
        allergies: {},
        other_allergies: '',
        assessment_answers: {}
      })
    }
  }, [])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setSelectedGuest(null)
    setModalMode('view')
    setActiveTab('details')
  }, [])

  const handleInputChange = useCallback((field: string, value: any) => {
    setGuestFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  const handleAllergyChange = useCallback((allergy: string, checked: boolean) => {
    setGuestFormData(prev => ({
      ...prev,
      allergies: {
        ...prev.allergies,
        [allergy]: checked
      }
    }))
  }, [])

  const handleAssessmentAnswer = useCallback((questionId: string, answer: number) => {
    setGuestFormData(prev => ({
      ...prev,
      assessment_answers: {
        ...prev.assessment_answers,
        [questionId]: answer
      }
    }))
  }, [])

  const handleSaveGuest = useCallback(async () => {
    try {
      if (!guestFormData.name.trim()) {
        error('Guest name is required')
        return
      }

      if (modalMode === 'create') {
        await createGuestMutation.mutateAsync(guestFormData)
        success('Guest created successfully!')
      } else if (selectedGuest) {
        await updateGuestMutation.mutateAsync({
          id: selectedGuest.id,
          ...guestFormData
        })
        success('Guest updated successfully!')
      }
      
      handleCloseModal()
    } catch (err) {
      console.error('Error saving guest:', err)
      error('Failed to save guest')
    }
  }, [guestFormData, modalMode, selectedGuest, createGuestMutation, updateGuestMutation, success, error, handleCloseModal])

  const handleDeleteGuest = useCallback(async (guest: Guest) => {
    if (!confirm(`Are you sure you want to delete ${guest.name}?`)) return

    try {
      await deleteGuestMutation.mutateAsync(guest.id)
      success('Guest deleted successfully!')
    } catch (err) {
      console.error('Error deleting guest:', err)
      error('Failed to delete guest')
    }
  }, [deleteGuestMutation, success, error])

  // Loading and error states
  if (guestsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading guests...</div>
      </div>
    )
  }

  if (guestsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Error loading guests: {guestsError.message}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Guest Management</h1>
          <p className="text-gray-600">Manage guest information and surf assessments</p>
        </div>
        <button
          onClick={() => handleOpenModal(null, 'create')}
          className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors"
          title="Add new guest"
        >
          <PlusIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search guests by name, phone, or ID..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Guest List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGuests.map((guest) => (
          <div key={guest.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-900 truncate">{guest.name}</h3>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleOpenModal(guest, 'view')}
                  className="text-blue-600 hover:text-blue-800 p-1"
                  title="View guest"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleOpenModal(guest, 'edit')}
                  className="text-green-600 hover:text-green-800 p-1"
                  title="Edit guest"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteGuest(guest)}
                  className="text-red-600 hover:text-red-800 p-1"
                  title="Delete guest"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-1 text-sm text-gray-600">
              {guest.mobile_number && (
                <div className="flex items-center">
                  <PhoneIcon className="h-4 w-4 mr-2" />
                  {guest.mobile_number}
                </div>
              )}
              {guest.room_assignment && (
                <div className="flex items-center">
                  <HomeIcon className="h-4 w-4 mr-2" />
                  Room {guest.room_assignment.room_number} - {guest.room_assignment.bed_name}
                </div>
              )}
              {guest.surf_package && (
                <div className="flex items-center text-green-600">
                  <CheckIcon className="h-4 w-4 mr-2" />
                  Surf Package
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {modalMode === 'create' ? 'Add New Guest' : 
                 modalMode === 'edit' ? 'Edit Guest' : 'Guest Details'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Tabs */}
              <div className="flex space-x-1 border-b border-gray-200 mb-6">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`px-4 py-2 text-sm font-medium rounded-t-md ${
                    activeTab === 'details'
                      ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Guest Details
                </button>
                <button
                  onClick={() => setActiveTab('assessment')}
                  className={`px-4 py-2 text-sm font-medium rounded-t-md ${
                    activeTab === 'assessment'
                      ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Surf Assessment
                </button>
              </div>

              {activeTab === 'details' ? (
                <div className="space-y-4">
                  {/* Guest Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                      <input
                        type="text"
                        value={guestFormData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={modalMode === 'view'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                      <input
                        type="tel"
                        value={guestFormData.mobile_number}
                        onChange={(e) => handleInputChange('mobile_number', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={modalMode === 'view'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                      <input
                        type="text"
                        value={guestFormData.instagram}
                        onChange={(e) => handleInputChange('instagram', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={modalMode === 'view'}
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="surf_package"
                        checked={guestFormData.surf_package}
                        onChange={(e) => handleInputChange('surf_package', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        disabled={modalMode === 'view'}
                      />
                      <label htmlFor="surf_package" className="ml-2 text-sm font-medium text-gray-700">
                        Surf Package
                      </label>
                    </div>
                  </div>

                  {/* Allergies */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {['nuts', 'dairy', 'gluten', 'seafood', 'eggs', 'soy'].map((allergy) => (
                        <label key={allergy} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={guestFormData.allergies[allergy] || false}
                            onChange={(e) => handleAllergyChange(allergy, e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            disabled={modalMode === 'view'}
                          />
                          <span className="ml-2 text-sm text-gray-700 capitalize">{allergy}</span>
                        </label>
                      ))}
                    </div>
                    <textarea
                      placeholder="Other allergies..."
                      value={guestFormData.other_allergies}
                      onChange={(e) => handleInputChange('other_allergies', e.target.value)}
                      className="w-full mt-2 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={2}
                      disabled={modalMode === 'view'}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(questionsByCategory).map(([category, questions]) => (
                    questions.length > 0 && (
                      <div key={category} className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
                          {category} Questions
                        </h3>
                        <div className="space-y-4">
                          {questions.map((question) => (
                            <div key={question.id} className="bg-white rounded-md p-4">
                              <p className="text-sm font-medium text-gray-900 mb-3">
                                {question.question_text}
                                {question.is_required && <span className="text-red-500 ml-1">*</span>}
                              </p>
                              <div className="flex space-x-2">
                                {Object.entries(question.scale_labels).map(([value, label]) => (
                                  <button
                                    key={value}
                                    onClick={() => handleAssessmentAnswer(question.id, parseInt(value))}
                                    className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                                      guestFormData.assessment_answers[question.id] === parseInt(value)
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                                    disabled={modalMode === 'view'}
                                  >
                                    {label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {modalMode !== 'view' && (
              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveGuest}
                  disabled={createGuestMutation.isPending || updateGuestMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {createGuestMutation.isPending || updateGuestMutation.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
