'use client'

import { useState, useEffect } from 'react'
import { useToastContext } from '@/components/common/ToastProvider'
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
  Cog6ToothIcon,
  DocumentTextIcon,
  BookmarkIcon,
  EyeSlashIcon,
  RectangleStackIcon
} from '@heroicons/react/24/outline'
import { databaseService, Guest as DbGuest, Staff as DbStaff, Lesson as DbLesson } from '@/lib/database-service'
import UnifiedCard from '@/components/common/UnifiedCard'

// Types based on database schema
type Guest = DbGuest & {
  surf_package?: boolean
}

type Staff = DbStaff & {
  roles?: string[]
}

type Lesson = DbLesson & {
  instructors: Staff[]
  guests: Guest[]
  guest_count: number
}

interface LessonManagementProps {
  selectedDate: string
  onDateChange: (date: string) => void
}

export default function LessonManagementComponent({ selectedDate, onDateChange }: LessonManagementProps) {
  // Modal states
  const { success, error } = useToastContext()
  const [isLessonModalOpen, setisLessonModalOpen] = useState(false)
  const [isLessonViewModalOpen, setIsLessonViewModalOpen] = useState(false)
  const [isAssignGuestsModalOpen, setIsAssignGuestsModalOpen] = useState(false)
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [isCreateFromTemplateModalOpen, setIsCreateFromTemplateModalOpen] = useState(false)

  // Selected items
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [editingLesson, setEditingLesson] = useState<Partial<Lesson>>({})
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedInstructorIds, setSelectedInstructorIds] = useState<string[]>([])
  // Multi-select state
  const [selectedLessonIds, setSelectedLessonIds] = useState<string[]>([])
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false)

  // Data states
  const [guests, setGuests] = useState<Guest[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [instructors, setInstructors] = useState<Staff[]>([])
  const [templates, setTemplates] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<Lesson | null>(null)

  // Filter states
  const [lessonFilter, setLessonFilter] = useState<{
    title: string
    category: string
    status: string
    instructor: string
  }>({ title: '', category: '', status: '', instructor: '' })

  const [lessonSort, setLessonSort] = useState<'time' | 'title' | 'category' | 'status'>('time')

  // Load data from database
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // Load guests with error handling
        const guestsResponse = await fetch('/api/guests').catch(() => null)
        if (guestsResponse?.ok) {
          const dbGuestsResponse = await guestsResponse.json()
          // Extract data from API response structure { success: true, data: [...] }
          const dbGuests = dbGuestsResponse.data || []
          setGuests(dbGuests)
        }

        // Lessons are loaded separately by date in the useEffect below

        // Load instructors with error handling
        const instructorsResponse = await fetch('/api/staff').catch(() => null)
        if (instructorsResponse?.ok) {
          const dbInstructorsResponse = await instructorsResponse.json()
          // Extract data from API response structure { success: true, data: [...] }
          const dbInstructors = dbInstructorsResponse.data || []
          setInstructors(dbInstructors)
        }

        // Load lesson templates with error handling
        const templatesResponse = await fetch('/api/lesson-templates').catch(() => null)
        if (templatesResponse?.ok) {
          const dbTemplatesResponse = await templatesResponse.json()
          // Extract data from API response structure { success: true, data: [...] }
          const dbTemplates = dbTemplatesResponse.data || []
          setTemplates(dbTemplates)
        }
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Load lessons when date changes
  useEffect(() => {
    if (!loading && selectedDate) {
      loadLessonsForDate(selectedDate)
    }
  }, [selectedDate, loading])

  const loadLessonsForDate = async (date: string) => {
    try {
      console.log('Loading lessons for date:', date) // Debug log
      if (!date) {
        console.error('No date provided to loadLessonsForDate')
        return
      }

      const response = await fetch(`/api/lessons?date=${date}`)
      console.log('Lessons API response status:', response.status) // Debug log

      if (response.ok) {
        const lessonsResponse = await response.json()
        console.log('Lessons API response:', lessonsResponse) // Debug log
        // Extract data from API response structure { success: true, data: [...] }
        const lessonsData = lessonsResponse.data || []

        // Transform lesson data to match frontend expectations
        const transformedLessons = lessonsData.map((lesson: any) => ({
          ...lesson,
          instructors: lesson.lesson_instructors?.map((li: any) => ({
            id: li.staff_id,
            name: li.staff?.name || 'Unknown',
            labels: li.staff?.labels || []
          })) || [],
          guests: lesson.lesson_assignments?.map((la: any) => ({
            id: la.guest_id,
            name: la.guest?.name || 'Unknown',
            guest_id: la.guest?.guest_id
          })) || [],
          guest_count: lesson.lesson_assignments?.length || 0
        }))

        setLessons(transformedLessons)
      } else {
        const errorData = await response.json()
        console.error('Lessons API error:', response.status, errorData)
      }
    } catch (err) {
      console.error('Error:', err)
    }
  }

  // Lesson management functions
  const handleCreateLesson = () => {
    setEditingLesson({
      title: '',
      description: '',
      category: 'lesson',
      status: 'draft',
      start_at: '09:00',
      end_at: '10:00',
      max_participants: 8,
      location: '',
      lesson_date: selectedDate,
      instructors: [],
      guests: []
    })
    setSelectedInstructorIds([])
    setIsEditMode(false)
    setIsLessonModalOpen(true)
  }

  const handleEditLesson = (lesson: Lesson) => {
    // Extract date from start_at timestamp for editing
    const lessonDate = lesson.start_at ? lesson.start_at.split('T')[0] : selectedDate

    setEditingLesson({
      ...lesson,
      lesson_date: lessonDate,
      start_at: lesson.start_at ? lesson.start_at.split('T')[1]?.split(':').slice(0, 2).join(':') : '',
      end_at: lesson.end_at ? lesson.end_at.split('T')[1]?.split(':').slice(0, 2).join(':') : ''
    })

    // Set selected instructors based on lesson data
    const instructorIds = lesson.instructors?.map(instructor => instructor.id) || []
    setSelectedInstructorIds(instructorIds)
    setIsEditMode(true)
    setIsLessonModalOpen(true)
  }

  const handleViewLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson)
    setIsLessonViewModalOpen(true)
  }

  const handlePublishLesson = async (lessonId: string) => {
    try {
      const response = await fetch('/api/lessons', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: lessonId,
          status: 'published'
        })
      })

      if (response.ok) {
        success('Lesson published successfully!')
        loadLessons()
      } else {
        const error = await response.json()
        error(`Error: ${err.error}`)
      }
    } catch (err) {
      console.error('Error:', err)
      error('Error publishing lesson')
    }
  }

  const handleUnpublishLesson = async (lessonId: string) => {
    try {
      const response = await fetch('/api/lessons', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: lessonId,
          status: 'draft'
        })
      })

      if (response.ok) {
        success('Lesson unpublished successfully!')
        loadLessons()
      } else {
        const error = await response.json()
        error(`Error: ${err.error}`)
      }
    } catch (err) {
      console.error('Error:', err)
      error('Error unpublishing lesson')
    }
  }

  const handleCopyLesson = async (lesson: Lesson) => {
    try {
      const response = await fetch('/api/lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: `${lesson.title} (Copy)`,
          description: lesson.description,
          category: lesson.category,
          location: lesson.location,
          start_at: lesson.start_at,
          end_at: lesson.end_at,
          max_participants: lesson.max_participants,
          skill_level: lesson.skill_level,
          status: 'draft'
        })
      })

      if (response.ok) {
        success('Lesson copied successfully!')
        loadLessons()
      } else {
        const error = await response.json()
        error(`Error: ${err.error}`)
      }
    } catch (err) {
      console.error('Error:', err)
      error('Error copying lesson')
    }
  }

  const handleAssignGuests = (lesson: Lesson) => {
    setSelectedLesson(lesson)
    setIsAssignGuestsModalOpen(true)
  }

  const handleSaveLesson = async () => {
    // Validate required fields
    if (!editingLesson.title?.trim()) {
      error('Lesson title is required')
      return
    }
    if (!editingLesson.lesson_date) {
      error('Lesson date is required')
      return
    }
    if (!editingLesson.start_at) {
      error('Start time is required')
      return
    }
    if (!editingLesson.end_at) {
      error('End time is required')
      return
    }

    try {
      if (isEditMode && editingLesson.id) {
        // Update existing lesson
        const updateData = {
          id: editingLesson.id,
          title: editingLesson.title.trim(),
          description: editingLesson.description?.trim() || '',
          category: editingLesson.category || 'lesson',
          status: editingLesson.status || 'draft',
          start_at: `${editingLesson.lesson_date}T${editingLesson.start_at}:00.000Z`,
          end_at: `${editingLesson.lesson_date}T${editingLesson.end_at}:00.000Z`,
          max_participants: Number(editingLesson.max_participants) || 8,
          location: editingLesson.location?.trim() || ''
        }

        const response = await fetch('/api/lessons', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error?.message || 'Failed to update lesson')
        }

        // Update instructor assignments
        try {
          if (selectedInstructorIds.length > 0) {
            await handleInstructorAssignment(editingLesson.id, selectedInstructorIds)
          }
          success('Lesson updated successfully!')
        } catch (instructorError) {
          success('Lesson updated, but failed to assign instructors. Please try assigning them manually.')
        }
      } else {
        // Create new lesson
        const newLessonData = {
          title: editingLesson.title.trim(),
          description: editingLesson.description?.trim() || '',
          category: editingLesson.category || 'lesson',
          status: editingLesson.status || 'draft',
          start_at: editingLesson.start_at,
          end_at: editingLesson.end_at,
          max_participants: Number(editingLesson.max_participants) || 8,
          location: editingLesson.location?.trim() || '',
          lesson_date: editingLesson.lesson_date
        }

        const response = await fetch('/api/lessons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newLessonData)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error?.message || 'Failed to create lesson')
        }

        const result = await response.json()
        const newLesson = result.data

        // Assign instructors to the new lesson
        try {
          if (selectedInstructorIds.length > 0 && newLesson?.id) {
            await handleInstructorAssignment(newLesson.id, selectedInstructorIds)
          }
          success('Lesson created successfully!')
        } catch (instructorError) {
          success('Lesson created, but failed to assign instructors. Please assign them manually.')
        }
      }

      // Reload lessons and close modal
      await loadLessonsForDate(editingLesson.lesson_date || selectedDate)
      setIsLessonModalOpen(false)
      setEditingLesson({})
      setSelectedInstructorIds([])
      setIsEditMode(false)

    } catch (err) {
      console.error('Error:', err)
      error(`Error saving lesson: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleDeleteLesson = async (lessonId: string) => {
    if (confirm('Are you sure you want to delete this lesson?')) {
      try {
        const response = await fetch(`/api/lessons?id=${lessonId}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          success('Lesson deleted successfully!')
          loadLessonsForDate(selectedDate)
        } else {
          const error = await response.json()
          const errorMessage = error.error?.message || error.error?.code || error.message || 'Failed to delete lesson'
          error(`Error deleting lesson: ${errorMessage}`)
        }
      } catch (err) {
        console.error('Error:', err)
        error('Error deleting lesson')
      }
    }
  }

  // Instructor assignment function
  const handleInstructorAssignment = async (lessonId: string, instructorIds: string[]) => {
    if (!lessonId || !Array.isArray(instructorIds) || instructorIds.length === 0) {
      return
    }

    try {
      const response = await fetch('/api/lesson-instructors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId,
          staffIds: instructorIds
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to assign instructors')
      }
    } catch (err) {
      console.error('Error:', err)
      throw error
    }
  }

  // Handle instructor selection
  const handleInstructorSelection = (instructorId: string) => {
    setSelectedInstructorIds(prev =>
      prev.includes(instructorId)
        ? prev.filter(id => id !== instructorId)
        : [...prev, instructorId]
    )
  }

  // Handle guest assignment toggle
  const handleGuestAssignment = (guestId: string) => {
    if (!selectedLesson) return

    const isCurrentlyAssigned = selectedLesson.guests?.some(g => g.id === guestId) || false

    // Update the selectedLesson state to reflect the change
    setSelectedLesson(prev => {
      if (!prev) return prev

      const updatedGuests = isCurrentlyAssigned
        ? prev.guests?.filter(g => g.id !== guestId) || []
        : [...(prev.guests || []), guests.find(g => g.id === guestId)!]

      return {
        ...prev,
        guests: updatedGuests,
        guest_count: updatedGuests.length
      }
    })
  }

  // Save guest assignments to API
  const handleSaveGuestAssignments = async (overrideConflicts = false) => {
    if (!selectedLesson) return

    try {
      const assignedGuestIds = selectedLesson.guests?.map(g => g.id) || []

      let response;

      if (overrideConflicts) {
        // Use PUT for override conflicts (batch operation for multiple guests)
        const promises = assignedGuestIds.map(guestId =>
          fetch('/api/lesson-assignments', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lesson_id: selectedLesson.id,
              guest_id: guestId,
              override_conflicts: true
            })
          })
        )

        const responses = await Promise.all(promises)
        response = responses[0] // Use first response for status check

        // Check if any failed
        const failed = responses.find(r => !r.ok)
        if (failed) {
          const errorData = await failed.json()
          throw new Error(errorData.error || 'Failed to override conflicts')
        }
      } else {
        // Normal POST for new assignments
        response = await fetch('/api/lesson-assignments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lesson_id: selectedLesson.id,
            guest_ids: assignedGuestIds
          })
        })
      }

      if (response.ok) {
        success('Guest assignments saved successfully!')
        setIsAssignGuestsModalOpen(false)
        await loadLessonsForDate(selectedDate)
      } else if (response.status === 409) {
        // Handle conflicts
        const conflictData = await response.json()

        let conflictMessage = 'Assignment conflicts detected:\n\n'
        conflictData.conflicts?.forEach((conflict: any, index: number) => {
          const guest = guests.find(g => g.id === conflict.guest_id)
          conflictMessage += `${index + 1}. ${guest?.name || 'Unknown guest'}: ${conflict.error}\n`
        })
        conflictMessage += '\nDo you want to override these conflicts and move the guests to this lesson?'

        if (confirm(conflictMessage)) {
          // Retry with override flag
          await handleSaveGuestAssignments(true)
        }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save guest assignments')
      }
    } catch (err) {
      console.error('Error:', err)
      error(`Error saving guest assignments: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Multi-select functions
  const handleSelectLesson = (lessonId: string) => {
    setSelectedLessonIds(prev => 
      prev.includes(lessonId) 
        ? prev.filter(id => id !== lessonId)
        : [...prev, lessonId]
    )
  }

  const handleSelectAllLessons = () => {
    if (selectedLessonIds.length === lessons.length) {
      setSelectedLessonIds([])
    } else {
      setSelectedLessonIds(lessons.map(lesson => lesson.id))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedLessonIds.length === 0) {
      error('Please select lessons to delete')
      return
    }

    try {
      const response = await fetch(`/api/lessons?bulk_ids=${JSON.stringify(selectedLessonIds)}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const result = await response.json()
        error(`${result.deletedCount} lessons deleted successfully!`)
        setSelectedLessonIds([])
        setIsBulkDeleteModalOpen(false)
        loadLessonsForDate(selectedDate)
      } else {
        const error = await response.json()
        const errorMessage = error.error?.message || error.error?.code || error.message || 'Failed to delete lessons'
        error(`Error deleting lessons: ${errorMessage}`)
      }
    } catch (err) {
      console.error('Error:', err)
      error('Error deleting lessons')
    }
  }

  // Template functions (simplified - using existing duplicate functionality)
  const handleSaveAsTemplate = async (lesson: Lesson, templateName?: string) => {
    // For now, just show a message that the lesson can be duplicated
    error(`"${lesson.title}" kann als Vorlage verwendet werden! Nutzen Sie den Duplicate-Button (⧉) um eine Kopie zu erstellen.`)
  }

  const handleCreateFromTemplate = async (template: Lesson, lessonDate: string, startTime: string, endTime: string) => {
    // Use existing lesson creation and pre-fill with template data
    setEditingLesson({
      title: template.title + ' (Kopie)',
      description: template.description,
      category: template.category,
      location: template.location,
      max_participants: template.max_participants,
      status: 'draft',
      lesson_date: lessonDate,
      start_time: startTime,
      end_time: endTime
    })

    // Pre-select instructors if available
    if (template.lesson_instructors) {
      const instructorIds = template.lesson_instructors.map(li => li.staff_id)
      setSelectedInstructorIds(instructorIds)
    }

    setIsCreateFromTemplateModalOpen(false)
    setSelectedTemplate(null)
    setIsEditMode(false)
    setIsLessonModalOpen(true)
  }

  const handleRemoveTemplate = async (templateId: string) => {
    error('Template-Entfernung noch nicht implementiert. Templates sind aktuell alle verfügbaren Lessons.')
  }

  // Filter and sort functions
  const getFilteredAndSortedLessons = () => {
    // Note: lessons are already filtered by date in the API call
    let filtered = lessons

    // Apply filters
    if (lessonFilter.title) {
      filtered = filtered.filter(lesson => 
        lesson.title.toLowerCase().includes(lessonFilter.title.toLowerCase())
      )
    }
    if (lessonFilter.category) {
      filtered = filtered.filter(lesson => lesson.category === lessonFilter.category)
    }
    if (lessonFilter.status) {
      filtered = filtered.filter(lesson => lesson.status === lessonFilter.status)
    }
    if (lessonFilter.instructor) {
      filtered = filtered.filter(lesson => 
        lesson.instructors.some(instructor => instructor.id === lessonFilter.instructor)
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (lessonSort) {
        case 'time':
          return a.start_at.localeCompare(b.start_at)
        case 'title':
          return a.title.localeCompare(b.title)
        case 'category':
          return a.category.localeCompare(b.category)
        case 'status':
          return a.status.localeCompare(b.status)
        default:
          return 0
      }
    })

    return filtered
  }

  // Date navigation functions
  const goToPreviousDay = () => {
    const currentDate = new Date(selectedDate)
    currentDate.setDate(currentDate.getDate() - 1)
    onDateChange(currentDate.toISOString().split('T')[0])
  }

  const goToNextDay = () => {
    const currentDate = new Date(selectedDate)
    currentDate.setDate(currentDate.getDate() + 1)
    onDateChange(currentDate.toISOString().split('T')[0])
  }

  const goToToday = () => {
    onDateChange(new Date().toISOString().split('T')[0])
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'published': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredLessons = getFilteredAndSortedLessons()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lesson Management</h2>
          <p className="text-gray-600">Manage surf lessons, schedules, and guest assignments</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Multi-select controls */}
          {selectedLessonIds.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedLessonIds.length} selected
              </span>
              <button
                onClick={() => setIsBulkDeleteModalOpen(true)}
                className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                title="Delete Selected"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setSelectedLessonIds([])}
                className="p-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                title="Clear Selection"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          )}
          
          <button
            onClick={handleCreateLesson}
            className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 flex items-center"
            title="Create New Lesson"
          >
            <PlusIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setIsCreateFromTemplateModalOpen(true)}
            className="bg-purple-600 text-white p-2 rounded-md hover:bg-purple-700 flex items-center"
            title="Create from Template"
          >
            <DocumentTextIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-4">
          {/* Select All Checkbox */}
          {lessons.length > 0 && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedLessonIds.length > 0 && selectedLessonIds.length === lessons.length}
                onChange={handleSelectAllLessons}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm text-gray-700">Select All</label>
            </div>
          )}
          <button
            onClick={goToPreviousDay}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
            title="Previous Day"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
            <button
              onClick={goToToday}
              className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
            >
              Today
            </button>
          </div>
          
          <button
            onClick={goToNextDay}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
            title="Next Day"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
        
        <div className="text-sm text-gray-600">
          {new Date(selectedDate).toLocaleDateString('de-DE', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              placeholder="Search lessons..."
              value={lessonFilter.title}
              onChange={(e) => setLessonFilter({...lessonFilter, title: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={lessonFilter.category}
              onChange={(e) => setLessonFilter({...lessonFilter, category: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              <option value="lesson">Lesson</option>
              <option value="theory">Theory</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={lessonFilter.status}
              onChange={(e) => setLessonFilter({...lessonFilter, status: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={lessonSort}
              onChange={(e) => setLessonSort(e.target.value as any)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="time">Time</option>
              <option value="title">Title</option>
              <option value="category">Category</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lessons List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading lessons...</div>
          </div>
        ) : filteredLessons.length === 0 ? (
          <div className="text-center py-12">
            <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No lessons found</h3>
            <p className="text-gray-500">
              {lessonFilter.title || lessonFilter.category || lessonFilter.status
                ? 'Try adjusting your filters to see more lessons.'
                : `No lessons scheduled for ${new Date(selectedDate).toLocaleDateString('de-DE', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}.`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredLessons.map((lesson) => (
              <div key={lesson.id} className="relative">
                {/* Selection Checkbox */}
                <div className="absolute top-2 left-2 z-10">
                  <input
                    type="checkbox"
                    checked={selectedLessonIds.includes(lesson.id)}
                    onChange={() => handleSelectLesson(lesson.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white shadow-sm"
                  />
                </div>

                <UnifiedCard
                  id={lesson.id}
                  title={lesson.title}
                  subtitle={lesson.location}
                  description={lesson.description}
                  status={lesson.status}
                  category={lesson.category}
                  date={selectedDate}
                  time={`${lesson.start_at} - ${lesson.end_at}`}
                  participants={`${lesson.guest_count || 0}/${lesson.max_participants}`}
                  color={lesson.category === 'surf' ? '#3B82F6' : 
                         lesson.category === 'yoga' ? '#10B981' :
                         lesson.category === 'fitness' ? '#F59E0B' : '#8B5CF6'}
                  onView={(id) => handleViewLesson(lesson)}
                  onEdit={(id) => handleEditLesson(lesson)}
                  onPublish={(id) => handlePublishLesson(lesson.id)}
                  onUnpublish={(id) => handleUnpublishLesson(lesson.id)}
                  onCopy={(id) => handleCopyLesson(lesson)}
                  onTemplate={(id) => handleSaveAsTemplate(lesson, lesson.title + ' Template')}
                  onDelete={(id) => handleDeleteLesson(lesson.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lesson Modal */}
      {isLessonModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {isEditMode ? 'Edit Lesson' : 'Create Lesson'}
              </h3>
              <button
                onClick={() => {
                  setIsLessonModalOpen(false)
                  setEditingLesson({})
                  setIsEditMode(false)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editingLesson.title || ''}
                  onChange={(e) => setEditingLesson({...editingLesson, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Enter lesson title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editingLesson.description || ''}
                  onChange={(e) => setEditingLesson({...editingLesson, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                  placeholder="Enter lesson description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={editingLesson.lesson_date || selectedDate}
                  onChange={(e) => setEditingLesson({...editingLesson, lesson_date: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={editingLesson.start_at || ''}
                    onChange={(e) => setEditingLesson({...editingLesson, start_at: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={editingLesson.end_at || ''}
                    onChange={(e) => setEditingLesson({...editingLesson, end_at: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={editingLesson.category || 'lesson'}
                    onChange={(e) => setEditingLesson({...editingLesson, category: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="lesson">Lesson</option>
                    <option value="theory">Theory</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={editingLesson.max_participants || 8}
                    onChange={(e) => setEditingLesson({...editingLesson, max_participants: parseInt(e.target.value)})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={editingLesson.location || ''}
                  onChange={(e) => setEditingLesson({...editingLesson, location: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Enter lesson location"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editingLesson.status || 'draft'}
                  onChange={(e) => setEditingLesson({...editingLesson, status: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              {/* Staff Assignment Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assign Instructors</label>
                <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
                  {!instructors || instructors.length === 0 ? (
                    <p className="text-gray-500 text-sm">No staff available</p>
                  ) : (
                    <div className="space-y-2">
                      {(instructors || [])
                        .filter(instructor =>
                          instructor.status === 'active' &&
                          instructor.labels?.includes('instructor')
                        )
                        .map(instructor => (
                          <label key={instructor.id} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input
                              type="checkbox"
                              checked={selectedInstructorIds.includes(instructor.id)}
                              onChange={() => handleInstructorSelection(instructor.id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900">{instructor.name}</span>
                                {instructor.labels && instructor.labels.length > 0 && (
                                  <div className="flex space-x-1">
                                    {instructor.labels.map(label => (
                                      <span key={label} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                        {label}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              {instructor.mobile_number && (
                                <span className="text-sm text-gray-500">{instructor.mobile_number}</span>
                              )}
                            </div>
                          </label>
                        ))
                      }
                    </div>
                  )}
                </div>
                {selectedInstructorIds.length > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedInstructorIds.length} instructor{selectedInstructorIds.length > 1 ? 's' : ''} selected
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setIsLessonModalOpen(false)
                  setEditingLesson({})
                  setSelectedInstructorIds([])
                  setIsEditMode(false)
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLesson}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {isEditMode ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lesson View Modal */}
      {isLessonViewModalOpen && selectedLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{selectedLesson.title}</h3>
              <button
                onClick={() => setIsLessonViewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Lesson Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Time:</strong> {selectedLesson.start_at} - {selectedLesson.end_at}</p>
                    <p><strong>Category:</strong> {selectedLesson.category}</p>
                    <p><strong>Status:</strong> {selectedLesson.status}</p>
                    <p><strong>Max Participants:</strong> {selectedLesson.max_participants}</p>
                    <p><strong>Current Participants:</strong> {selectedLesson.guest_count || 0}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Location & Description</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Location:</strong> {selectedLesson.location || 'Not specified'}</p>
                    <p><strong>Description:</strong> {selectedLesson.description || 'No description'}</p>
                  </div>
                </div>
              </div>
              
              {selectedLesson.instructors.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Instructors</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedLesson.instructors.map((instructor) => (
                      <span key={instructor.id} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {instructor.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedLesson.guests.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Assigned Guests</h4>
                  <div className="space-y-2">
                    {selectedLesson.guests.map((guest) => (
                      <div key={guest.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <span className="font-medium">{guest.name}</span>
                          <span className="text-sm text-gray-500 ml-2">({guest.surf_level || 'No level'})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Guest Assignment Modal */}
      {isAssignGuestsModalOpen && selectedLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                Assign Guests to: {selectedLesson.title}
              </h3>
              <button
                onClick={() => setIsAssignGuestsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Select guests to assign to this lesson. Only guests with surf packages are shown.
              </p>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {guests.filter(guest => guest.surf_package).map(guest => (
                <label key={guest.id} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={selectedLesson.guests?.some(g => g.id === guest.id) || false}
                    onChange={() => handleGuestAssignment(guest.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{guest.name}</span>
                      <span className="text-sm text-gray-500">({guest.guest_id})</span>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsAssignGuestsModalOpen(false)}
                className="p-2 text-gray-600 hover:text-gray-800 rounded-md hover:bg-gray-100"
                title="Cancel"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
              <button
                onClick={handleSaveGuestAssignments}
                className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                title="Save Assignments"
              >
                <CheckIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Delete Lessons</h3>
              <button
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                ✕
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600">
                Are you sure you want to delete <strong>{selectedLessonIds.length}</strong> selected lessons?
              </p>
              <p className="text-sm text-red-600 mt-2">
                This action cannot be undone.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="p-2 text-gray-600 hover:text-gray-800 rounded-md hover:bg-gray-100"
                title="Cancel"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
              <button
                onClick={handleBulkDelete}
                className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                title={`Delete ${selectedLessonIds.length} Lessons`}
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create from Template Modal */}
      {isCreateFromTemplateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Create Lesson from Template</h3>
              <button
                onClick={() => {
                  setIsCreateFromTemplateModalOpen(false)
                  setSelectedTemplate(null)
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Template Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Template
                </label>
                <select
                  value={selectedTemplate?.id || ''}
                  onChange={(e) => {
                    const template = templates.find(t => t.id === e.target.value)
                    setSelectedTemplate(template || null)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a template...</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.template_name || template.title} ({template.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Template Preview */}
              {selectedTemplate && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Template Preview:</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Title:</strong> {selectedTemplate.title}</p>
                    <p><strong>Category:</strong> {selectedTemplate.category}</p>
                    <p><strong>Location:</strong> {selectedTemplate.location}</p>
                    {selectedTemplate.description && (
                      <p><strong>Description:</strong> {selectedTemplate.description}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Date and Time */}
              {selectedTemplate && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lesson Date
                    </label>
                    <input
                      type="date"
                      id="template-lesson-date"
                      defaultValue={selectedDate}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Time
                      </label>
                      <input
                        type="time"
                        id="template-start-time"
                        defaultValue="09:00"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Time
                      </label>
                      <input
                        type="time"
                        id="template-end-time"
                        defaultValue="10:00"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setIsCreateFromTemplateModalOpen(false)
                  setSelectedTemplate(null)
                }}
                className="p-2 text-gray-600 hover:text-gray-800 rounded-md hover:bg-gray-100"
                title="Cancel"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => {
                  if (selectedTemplate) {
                    const lessonDate = (document.getElementById('template-lesson-date') as HTMLInputElement)?.value || selectedDate
                    const startTime = (document.getElementById('template-start-time') as HTMLInputElement)?.value || '09:00'
                    const endTime = (document.getElementById('template-end-time') as HTMLInputElement)?.value || '10:00'
                    handleCreateFromTemplate(selectedTemplate, lessonDate, startTime, endTime)
                  }
                }}
                disabled={!selectedTemplate}
                className="p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                title="Create Lesson"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
