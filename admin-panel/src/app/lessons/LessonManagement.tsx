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
import { databaseService, Guest as DbGuest, Staff as DbStaff, Lesson as DbLesson } from '@/lib/database-service'

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
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false)
  const [isLessonViewModalOpen, setIsLessonViewModalOpen] = useState(false)
  const [isAssignGuestsModalOpen, setIsAssignGuestsModalOpen] = useState(false)

  // Selected items
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [editingLesson, setEditingLesson] = useState<Partial<Lesson>>({})
  const [isEditMode, setIsEditMode] = useState(false)
  // Multi-select state
  const [selectedLessonIds, setSelectedLessonIds] = useState<string[]>([])
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false)

  // Data states
  const [guests, setGuests] = useState<Guest[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [instructors, setInstructors] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)

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
        // Load guests
        const guestsResponse = await fetch('/api/guests')
        if (guestsResponse.ok) {
          const dbGuests = await guestsResponse.json()
          setGuests(dbGuests)
        }

        // Load lessons
        const lessonsResponse = await fetch('/api/lessons')
        if (lessonsResponse.ok) {
          const dbLessons = await lessonsResponse.json()
          setLessons(dbLessons)
        }

        // Load instructors
        const instructorsResponse = await fetch('/api/staff')
        if (instructorsResponse.ok) {
          const dbInstructors = await instructorsResponse.json()
          setInstructors(dbInstructors)
        }
      } catch (error) {
        console.error('Error loading lesson data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Load lessons when date changes
  useEffect(() => {
    if (!loading) {
      loadLessonsForDate(selectedDate)
    }
  }, [selectedDate])

  const loadLessonsForDate = async (date: string) => {
    try {
      const response = await fetch(`/api/lessons?date=${date}`)
      if (response.ok) {
        const lessonsData = await response.json()
        setLessons(lessonsData)
      }
    } catch (error) {
      console.error('Error loading lessons for date:', error)
    }
  }

  // Lesson management functions
  const handleCreateLesson = () => {
    setEditingLesson({
      title: '',
      description: '',
      category: 'surf_lesson',
      status: 'scheduled',
      start_time: '09:00',
      end_time: '10:00',
      max_participants: 8,
      location: '',
      lesson_date: selectedDate,
      instructors: [],
      guests: []
    })
    setIsEditMode(false)
    setIsLessonModalOpen(true)
  }

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson)
    setIsEditMode(true)
    setIsLessonModalOpen(true)
  }

  const handleViewLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson)
    setIsLessonViewModalOpen(true)
  }

  const handleAssignGuests = (lesson: Lesson) => {
    setSelectedLesson(lesson)
    setIsAssignGuestsModalOpen(true)
  }

  const handleSaveLesson = async () => {
    try {
      if (!editingLesson.title || !editingLesson.lesson_date) {
        alert('Please fill in all required fields')
        return
      }

      const lessonData = {
        title: editingLesson.title,
        description: editingLesson.description || null,
        category: editingLesson.category || 'surf_lesson',
        status: editingLesson.status || 'scheduled',
        start_time: editingLesson.start_time,
        end_time: editingLesson.end_time,
        max_participants: editingLesson.max_participants || 8,
        location: editingLesson.location || null,
        lesson_date: editingLesson.lesson_date
      }

      if (isEditMode && editingLesson.id) {
        const response = await fetch('/api/lessons', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: editingLesson.id,
            ...lessonData
          })
        })

        if (response.ok) {
          alert('Lesson updated successfully!')
          loadLessonsForDate(selectedDate)
        } else {
          const error = await response.json()
          alert(`Error updating lesson: ${error.error}`)
        }
      } else {
        const response = await fetch('/api/lessons', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(lessonData)
        })

        if (response.ok) {
          alert('Lesson created successfully!')
          loadLessonsForDate(selectedDate)
        } else {
          const error = await response.json()
          alert(`Error creating lesson: ${error.error}`)
        }
      }
    } catch (error) {
      console.error('Error saving lesson:', error)
      alert('Error saving lesson')
    }

    setIsLessonModalOpen(false)
    setEditingLesson({})
    setIsEditMode(false)
  }

  const handleDeleteLesson = async (lessonId: string) => {
    if (confirm('Are you sure you want to delete this lesson?')) {
      try {
        const response = await fetch(`/api/lessons?id=${lessonId}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          alert('Lesson deleted successfully!')
          loadLessonsForDate(selectedDate)
        } else {
          const error = await response.json()
          alert(`Error deleting lesson: ${error.error}`)
        }
      } catch (error) {
        console.error('Error deleting lesson:', error)
        alert('Error deleting lesson')
      }
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
      alert('Please select lessons to delete')
      return
    }

    try {
      const response = await fetch(`/api/lessons?bulk_ids=${JSON.stringify(selectedLessonIds)}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const result = await response.json()
        alert(`${result.deletedCount} lessons deleted successfully!`)
        setSelectedLessonIds([])
        setIsBulkDeleteModalOpen(false)
        loadLessonsForDate(selectedDate)
      } else {
        const error = await response.json()
        alert(`Error deleting lessons: ${error.error}`)
      }
    } catch (error) {
      console.error('Error bulk deleting lessons:', error)
      alert('Error deleting lessons')
    }
  }

  // Filter and sort functions
  const getFilteredAndSortedLessons = () => {
    let filtered = lessons.filter(lesson => lesson.lesson_date === selectedDate)

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
          return a.start_time.localeCompare(b.start_time)
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
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
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
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 flex items-center space-x-1"
              >
                <TrashIcon className="h-4 w-4" />
                <span>Delete</span>
              </button>
              <button
                onClick={() => setSelectedLessonIds([])}
                className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
              >
                Clear
              </button>
            </div>
          )}
          
          <button
            onClick={handleCreateLesson}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Create Lesson</span>
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
              <option value="surf_lesson">Surf Lesson</option>
              <option value="theory">Theory</option>
              <option value="safety">Safety</option>
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
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
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
          filteredLessons.map((lesson) => (
            <div key={lesson.id} className={`bg-white border rounded-lg p-6 ${
              selectedLessonIds.includes(lesson.id) 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200'
            }`}>
              {/* Checkbox for multi-select */}
              <div className="flex items-start justify-between mb-2">
                <input
                  type="checkbox"
                  checked={selectedLessonIds.includes(lesson.id)}
                  onChange={() => handleSelectLesson(lesson.id)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{lesson.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lesson.status)}`}>
                      {lesson.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Time:</span> {lesson.start_time} - {lesson.end_time}
                    </div>
                    <div>
                      <span className="font-medium">Category:</span> {lesson.category}
                    </div>
                    <div>
                      <span className="font-medium">Participants:</span> {lesson.guest_count || 0}/{lesson.max_participants}
                    </div>
                  </div>
                  
                  {lesson.description && (
                    <p className="text-sm text-gray-600 mt-2">{lesson.description}</p>
                  )}
                  
                  {lesson.location && (
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Location:</span> {lesson.location}
                    </p>
                  )}
                  
                  {lesson.instructors.length > 0 && (
                    <div className="mt-2">
                      <span className="text-sm font-medium text-gray-700">Instructors:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {lesson.instructors.map((instructor) => (
                          <span key={instructor.id} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {instructor.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleViewLesson(lesson)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                    title="View Lesson"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEditLesson(lesson)}
                    className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded"
                    title="Edit Lesson"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleAssignGuests(lesson)}
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded"
                    title="Assign Guests"
                  >
                    <UserPlusIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteLesson(lesson.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Delete Lesson"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
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
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={editingLesson.start_time || ''}
                    onChange={(e) => setEditingLesson({...editingLesson, start_time: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={editingLesson.end_time || ''}
                    onChange={(e) => setEditingLesson({...editingLesson, end_time: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={editingLesson.category || 'surf_lesson'}
                    onChange={(e) => setEditingLesson({...editingLesson, category: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="surf_lesson">Surf Lesson</option>
                    <option value="theory">Theory</option>
                    <option value="safety">Safety</option>
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
                  value={editingLesson.status || 'scheduled'}
                  onChange={(e) => setEditingLesson({...editingLesson, status: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setIsLessonModalOpen(false)
                  setEditingLesson({})
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
                    <p><strong>Time:</strong> {selectedLesson.start_time} - {selectedLesson.end_time}</p>
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
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete {selectedLessonIds.length} Lessons
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
