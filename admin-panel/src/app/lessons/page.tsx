'use client'

import { useState } from 'react'
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
  ClockIcon,
  MapPinIcon,
  UserIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  AcademicCapIcon,
  BeakerIcon,
  PlayIcon,
  Cog6ToothIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline'

// Types based on database schema
interface Staff {
  id: string
  staff_id: string
  name: string
  labels: string[]
}

interface Guest {
  id: string
  guest_id: string
  name: string
  surf_package: boolean
  surf_level: 'beginner' | 'intermediate' | 'advanced' | null
  is_active: boolean
}

interface Equipment {
  id: string
  equipment_id: string
  name: string
  category: 'surfboard' | 'wetsuit' | 'safety' | 'cleaning' | 'other'
  status: 'available' | 'assigned' | 'maintenance' | 'retired'
  currently_assigned_to?: string
}

interface Lesson {
  id: string
  lesson_id: string
  title: string
  category: 'lesson' | 'theory' | 'other'
  location: string
  start_at: string
  end_at: string
  description?: string
  status: 'draft' | 'published'
  max_participants?: number
  instructors: Staff[]
  assigned_guests: Guest[]
  alert_time?: string
  alert_text?: string
  created_by: string
  created_at: string
}

interface AssessmentQuestion {
  id: string
  category: 'experience' | 'safety' | 'preferences' | 'goals'
  question_text: string
  scale_labels: {
    '1': string
    '2': string
    '3': string
    '4': string
    '5': string
  }
  is_required: boolean
  is_active: boolean
  sort_order: number
}

interface GuestAssessment {
  guest_id: string
  question_id: string
  response: number | null
  answered_at?: string
}

// Mock Data
const mockStaff: Staff[] = [
  {
    id: '1',
    staff_id: 'S-INSTRUCTOR01',
    name: 'Jake Harrison',
    labels: ['instructor', 'senior']
  },
  {
    id: '2',
    staff_id: 'S-INSTRUCTOR02',
    name: 'Maria Santos',
    labels: ['instructor']
  },
  {
    id: '3',
    staff_id: 'S-INSTRUCTOR03',
    name: 'Tom Wilson',
    labels: ['instructor', 'safety']
  }
]

const mockGuests: Guest[] = [
  {
    id: '1',
    guest_id: 'G-SURF001',
    name: 'John Doe',
    surf_package: true,
    surf_level: 'beginner',
    is_active: true
  },
  {
    id: '2',
    guest_id: 'G-SURF002',
    name: 'Maria Garcia',
    surf_package: true,
    surf_level: 'intermediate',
    is_active: true
  },
  {
    id: '3',
    guest_id: 'G-SURF003',
    name: 'Sarah Connor',
    surf_package: true,
    surf_level: null,
    is_active: true
  },
  {
    id: '4',
    guest_id: 'G-SURF004',
    name: 'Mike Johnson',
    surf_package: true,
    surf_level: 'advanced',
    is_active: true
  }
]

const mockLessons: Lesson[] = [
  {
    id: '1',
    lesson_id: 'L-MORNING01',
    title: 'Morning Beginner Surf Session',
    category: 'lesson',
    location: 'Main Beach',
    start_at: new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0] + 'T08:00',
    end_at: new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0] + 'T10:00',
    description: 'Introduction to surfing for beginners',
    status: 'published',
    max_participants: 8,
    instructors: [mockStaff[0], mockStaff[1]],
    assigned_guests: [mockGuests[0], mockGuests[2]],
    created_by: '1',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    lesson_id: 'L-THEORY01',
    title: 'Ocean Safety & Surf Theory',
    category: 'theory',
    location: 'Classroom A',
    start_at: new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0] + 'T14:00',
    end_at: new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0] + 'T15:30',
    description: 'Essential theory about ocean conditions and safety',
    status: 'published',
    max_participants: 15,
    instructors: [mockStaff[2]],
    assigned_guests: [mockGuests[0], mockGuests[1], mockGuests[2]],
    created_by: '1',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    lesson_id: 'L-ADVANCED01',
    title: 'Advanced Wave Riding',
    category: 'lesson',
    location: 'North Point',
    start_at: new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0] + 'T16:00',
    end_at: new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0] + 'T18:00',
    description: 'Advanced techniques for experienced surfers',
    status: 'draft',
    max_participants: 6,
    instructors: [mockStaff[0]],
    assigned_guests: [mockGuests[3]],
    created_by: '1',
    created_at: new Date().toISOString()
  }
]

const mockAssessmentQuestions: AssessmentQuestion[] = [
  {
    id: '1',
    category: 'experience',
    question_text: 'How would you rate your current surfing experience?',
    scale_labels: {
      '1': 'Complete beginner',
      '2': 'Some experience',
      '3': 'Moderate experience',
      '4': 'Advanced',
      '5': 'Expert level'
    },
    is_required: true,
    is_active: true,
    sort_order: 1
  },
  {
    id: '2',
    category: 'safety',
    question_text: 'How comfortable are you in deep water?',
    scale_labels: {
      '1': 'Not comfortable',
      '2': 'Slightly comfortable',
      '3': 'Moderately comfortable',
      '4': 'Very comfortable',
      '5': 'Extremely comfortable'
    },
    is_required: true,
    is_active: true,
    sort_order: 2
  },
  {
    id: '3',
    category: 'goals',
    question_text: 'What is your main goal for surf lessons?',
    scale_labels: {
      '1': 'Just try it out',
      '2': 'Learn basics',
      '3': 'Improve technique',
      '4': 'Advanced skills',
      '5': 'Competition level'
    },
    is_required: false,
    is_active: true,
    sort_order: 3
  }
]

export default function SurfLessonsPage() {
  const [activeTab, setActiveTab] = useState<'guests' | 'lessons' | 'questions'>('lessons')
  const [selectedDate, setSelectedDate] = useState(new Date(Date.now() + 24*60*60*1000)) // Tomorrow
  const [lessons, setLessons] = useState<Lesson[]>(mockLessons)
  const [guests, setGuests] = useState<Guest[]>(mockGuests.filter(g => g.surf_package && g.is_active))
  const [questions, setQuestions] = useState<AssessmentQuestion[]>(mockAssessmentQuestions)
  const [guestFilter, setGuestFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced' | 'unassessed'>('all')
  const [guestSort, setGuestSort] = useState<'name' | 'level' | 'id'>('name')

  // Modal states
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [selectedQuestion, setSelectedQuestion] = useState<AssessmentQuestion | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [isGuestAssessmentModalOpen, setIsGuestAssessmentModalOpen] = useState(false)
  const [isAssignMaterialModalOpen, setIsAssignMaterialModalOpen] = useState(false)
  const [isAssignStudentsModalOpen, setIsAssignStudentsModalOpen] = useState(false)
  const [isViewQuestionModalOpen, setIsViewQuestionModalOpen] = useState(false)
  const [isEditQuestionModalOpen, setIsEditQuestionModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [newSurfLevel, setNewSurfLevel] = useState<Guest['surf_level']>(null)

  // Form data
  const [formData, setFormData] = useState<Partial<Lesson>>({
    title: '',
    category: 'lesson',
    location: '',
    start_at: '',
    end_at: '',
    description: '',
    max_participants: undefined,
    alert_time: '',
    alert_text: ''
  })

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getCategoryIcon = (category: Lesson['category']) => {
    switch (category) {
      case 'lesson':
        return <PlayIcon className="w-4 h-4" />
      case 'theory':
        return <AcademicCapIcon className="w-4 h-4" />
      case 'other':
        return <BeakerIcon className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: Lesson['category']) => {
    switch (category) {
      case 'lesson':
        return 'bg-blue-100 text-blue-800'
      case 'theory':
        return 'bg-purple-100 text-purple-800'
      case 'other':
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getSurfLevelColor = (level: Guest['surf_level']) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800'
      case 'advanced':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + days)
    setSelectedDate(newDate)
  }

  const handleViewLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson)
    setIsViewModalOpen(true)
  }

  const handleViewGuest = (guest: Guest) => {
    setSelectedGuest(guest)
    setIsGuestAssessmentModalOpen(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      category: 'lesson',
      location: '',
      start_at: '',
      end_at: '',
      description: '',
      max_participants: undefined,
      alert_time: '',
      alert_text: ''
    })
  }

  const filteredLessonsByDate = lessons.filter(lesson => {
    const lessonDate = new Date(lesson.start_at).toDateString()
    return lessonDate === selectedDate.toDateString()
  })

  const filteredAndSortedGuests = guests
    .filter(guest => {
      if (guestFilter === 'all') return true
      if (guestFilter === 'unassessed') return !guest.surf_level
      return guest.surf_level === guestFilter
    })
    .sort((a, b) => {
      switch (guestSort) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'level':
          if (!a.surf_level && !b.surf_level) return 0
          if (!a.surf_level) return 1
          if (!b.surf_level) return -1
          const levelOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 }
          return levelOrder[a.surf_level] - levelOrder[b.surf_level]
        case 'id':
          return a.guest_id.localeCompare(b.guest_id)
        default:
          return 0
      }
    })

  // Check if guest can be assigned to lesson (business rule: max 1 lesson per category per day)
  const canAssignGuestToLesson = (guest: Guest, lesson: Lesson): { canAssign: boolean, reason?: string } => {
    const lessonDate = new Date(lesson.start_at).toDateString()

    // Find all lessons for this guest on the same date with same category
    const existingLessonsOnDate = lessons.filter(l => {
      const lDate = new Date(l.start_at).toDateString()
      return lDate === lessonDate &&
             l.category === lesson.category &&
             l.assigned_guests.some(ag => ag.id === guest.id)
    })

    if (existingLessonsOnDate.length > 0) {
      const conflictLesson = existingLessonsOnDate[0]
      return {
        canAssign: false,
        reason: `Guest already assigned to ${conflictLesson.title} (${lesson.category}) on this date`
      }
    }

    return { canAssign: true }
  }

  // Get available guests for a lesson (excluding conflicts)
  const getAvailableGuestsForLesson = (lesson: Lesson) => {
    return guests.filter(guest => {
      // Not already assigned to this lesson
      const isAlreadyAssigned = lesson.assigned_guests.find(ag => ag.id === guest.id)
      if (isAlreadyAssigned) return false

      // Check business rules
      const { canAssign } = canAssignGuestToLesson(guest, lesson)
      return canAssign
    })
  }

  const handleSaveLesson = () => {
    if (modalMode === 'edit' && selectedLesson) {
      // Edit existing lesson
      const updatedLesson: Lesson = {
        ...selectedLesson,
        title: formData.title || '',
        category: formData.category || 'lesson',
        location: formData.location || '',
        start_at: formData.start_at || '',
        end_at: formData.end_at || '',
        description: formData.description,
        max_participants: formData.max_participants,
        alert_time: formData.alert_time,
        alert_text: formData.alert_text
      }
      setLessons(lessons.map(l => l.id === selectedLesson.id ? updatedLesson : l))
      setIsEditModalOpen(false)
    } else {
      // Create new lesson
      const newLesson: Lesson = {
        id: Date.now().toString(),
        lesson_id: `L-${Math.random().toString(36).substr(2, 10).toUpperCase()}`,
        title: formData.title || '',
        category: formData.category || 'lesson',
        location: formData.location || '',
        start_at: formData.start_at || '',
        end_at: formData.end_at || '',
        description: formData.description,
        status: 'draft',
        max_participants: formData.max_participants,
        instructors: [],
        assigned_guests: [],
        alert_time: formData.alert_time,
        alert_text: formData.alert_text,
        created_by: '1',
        created_at: new Date().toISOString()
      }
      setLessons([...lessons, newLesson])
      setIsCreateModalOpen(false)
    }
    resetForm()
  }

  const handleDeleteLesson = () => {
    if (selectedLesson) {
      setLessons(lessons.filter(l => l.id !== selectedLesson.id))
      setIsDeleteModalOpen(false)
      setSelectedLesson(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Surf Lessons</h1>
        <p className="mt-2 text-gray-600">Manage surf lessons, guests, and assessments</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('lessons')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'lessons'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <PlayIcon className="w-5 h-5 inline mr-2" />
            Lesson Management
          </button>
          <button
            onClick={() => setActiveTab('guests')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'guests'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <UserGroupIcon className="w-5 h-5 inline mr-2" />
            Package Guests
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'questions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <AcademicCapIcon className="w-5 h-5 inline mr-2" />
            Assessment Questions
          </button>
        </nav>
      </div>

      {/* Lesson Management Tab */}
      {activeTab === 'lessons' && (
        <div className="space-y-6">
          {/* Date Navigation */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => changeDate(-1)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-semibold text-gray-900">
                  {formatDate(selectedDate)}
                </h2>
                <button
                  onClick={() => changeDate(1)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSelectedDate(new Date())}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                >
                  Today
                </button>
              </div>
              <button
                onClick={() => {
                  resetForm()
                  setModalMode('create')
                  setIsCreateModalOpen(true)
                }}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                title="Create Lesson"
              >
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lessons List */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Lessons for {formatDate(selectedDate)} ({filteredLessonsByDate.length})
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredLessonsByDate.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No lessons scheduled for this date
                </div>
              ) : (
                filteredLessonsByDate.map((lesson) => (
                  <div key={lesson.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(lesson.category)}`}>
                            {getCategoryIcon(lesson.category)}
                            <span className="ml-1 capitalize">{lesson.category}</span>
                          </span>
                          <h4 className="text-lg font-medium text-gray-900">{lesson.title}</h4>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            lesson.status === 'published'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {lesson.status === 'published' ? (
                              <>
                                <GlobeAltIcon className="w-3 h-3 mr-1" />
                                Published
                              </>
                            ) : (
                              <>
                                <PencilIcon className="w-3 h-3 mr-1" />
                                Draft
                              </>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <div className="flex items-center">
                            <ClockIcon className="w-4 h-4 mr-1" />
                            {formatTime(lesson.start_at)} - {formatTime(lesson.end_at)}
                          </div>
                          <div className="flex items-center">
                            <MapPinIcon className="w-4 h-4 mr-1" />
                            {lesson.location}
                          </div>
                          <div className="flex items-center">
                            <UserIcon className="w-4 h-4 mr-1" />
                            {lesson.instructors.map(i => i.name).join(', ')}
                          </div>
                          <div className="flex items-center">
                            <UserGroupIcon className="w-4 h-4 mr-1" />
                            {lesson.assigned_guests.length} / {lesson.max_participants || '∞'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewLesson(lesson)}
                          className="p-2 text-gray-400 hover:text-blue-600"
                          title="View"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedLesson(lesson)
                            setFormData({
                              title: lesson.title,
                              category: lesson.category,
                              location: lesson.location,
                              start_at: lesson.start_at,
                              end_at: lesson.end_at,
                              description: lesson.description || '',
                              max_participants: lesson.max_participants,
                              alert_time: lesson.alert_time || '',
                              alert_text: lesson.alert_text || ''
                            })
                            setModalMode('edit')
                            setIsEditModalOpen(true)
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600"
                          title="Edit"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            const duplicated: Lesson = {
                              ...lesson,
                              id: (Date.now() + Math.random()).toString(),
                              lesson_id: `L-${Math.random().toString(36).substr(2, 10).toUpperCase()}`,
                              title: `${lesson.title} (Copy)`,
                              status: 'draft',
                              assigned_guests: [],
                              created_at: new Date().toISOString()
                            }
                            setLessons([...lessons, duplicated])
                          }}
                          className="p-2 text-gray-400 hover:text-green-600"
                          title="Duplicate"
                        >
                          <DocumentDuplicateIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setLessons(lessons.map(l =>
                              l.id === lesson.id
                                ? { ...l, status: l.status === 'published' ? 'draft' : 'published' }
                                : l
                            ))
                          }}
                          className={`p-2 hover:text-green-600 ${
                            lesson.status === 'published' ? 'text-green-600' : 'text-gray-400'
                          }`}
                          title={lesson.status === 'published' ? 'Unpublish' : 'Publish'}
                        >
                          <GlobeAltIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedLesson(lesson)
                            setIsAssignStudentsModalOpen(true)
                          }}
                          className="p-2 text-gray-400 hover:text-purple-600"
                          title="Assign Students"
                        >
                          <UserPlusIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedLesson(lesson)
                            setIsDeleteModalOpen(true)
                          }}
                          className="p-2 text-gray-400 hover:text-red-600"
                          title="Delete"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Package Guests Tab */}
      {activeTab === 'guests' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Surf Package Guests ({filteredAndSortedGuests.length})
                  </h3>
                  <p className="text-sm text-gray-600">Guests with active surf packages</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <FunnelIcon className="w-4 h-4 text-gray-500" />
                    <select
                      value={guestFilter}
                      onChange={(e) => setGuestFilter(e.target.value as typeof guestFilter)}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="all">All Levels</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="unassessed">Unassessed</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ArrowsUpDownIcon className="w-4 h-4 text-gray-500" />
                    <select
                      value={guestSort}
                      onChange={(e) => setGuestSort(e.target.value as typeof guestSort)}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="name">Sort by Name</option>
                      <option value="level">Sort by Level</option>
                      <option value="id">Sort by ID</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredAndSortedGuests.map((guest) => (
                <div key={guest.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">{guest.name}</h4>
                        <span className="text-sm text-gray-500">{guest.guest_id}</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSurfLevelColor(guest.surf_level)}`}>
                          {guest.surf_level || 'Not assessed'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewGuest(guest)}
                        className="p-2 text-gray-400 hover:text-blue-600"
                        title="View Assessment"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedGuest(guest)
                          setIsAssignMaterialModalOpen(true)
                        }}
                        className="p-2 text-gray-400 hover:text-green-600"
                        title="Assign Material"
                      >
                        <Cog6ToothIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Assessment Questions Tab */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Assessment Questions</h3>
            <button
              onClick={() => {
                setSelectedQuestion(null)
                alert('Create Question modal would open here')
              }}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              title="Add Question"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Group by category */}
          {['experience', 'safety', 'preferences', 'goals'].map((category) => {
            const categoryQuestions = questions.filter(q => q.category === category)
            if (categoryQuestions.length === 0) return null

            return (
              <div key={category} className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h4 className="text-md font-medium text-gray-900 capitalize">
                    {category} ({categoryQuestions.length})
                  </h4>
                </div>
                <div className="divide-y divide-gray-200">
                  {categoryQuestions.map((question) => (
                    <div key={question.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-gray-900 mb-2">{question.question_text}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              question.is_required ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {question.is_required ? 'Required' : 'Optional'}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              question.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {question.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedQuestion(question)
                              setIsViewQuestionModalOpen(true)
                            }}
                            className="p-2 text-gray-400 hover:text-blue-600"
                            title="View Question"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedQuestion(question)
                              setIsEditQuestionModalOpen(true)
                            }}
                            className="p-2 text-gray-400 hover:text-blue-600"
                            title="Edit Question"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this question?')) {
                                setQuestions(questions.filter(q => q.id !== question.id))
                              }
                            }}
                            className="p-2 text-gray-400 hover:text-red-600"
                            title="Delete Question"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* View Lesson Modal */}
      {isViewModalOpen && selectedLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Lesson Details</h3>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Title</p>
                  <p className="font-medium text-gray-900">{selectedLesson.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(selectedLesson.category)}`}>
                    {getCategoryIcon(selectedLesson.category)}
                    <span className="ml-1 capitalize">{selectedLesson.category}</span>
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Time</p>
                  <p className="font-medium text-gray-900">
                    {formatTime(selectedLesson.start_at)} - {formatTime(selectedLesson.end_at)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium text-gray-900">{selectedLesson.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    selectedLesson.status === 'published'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedLesson.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Participants</p>
                  <p className="font-medium text-gray-900">
                    {selectedLesson.assigned_guests.length} / {selectedLesson.max_participants || '∞'}
                  </p>
                </div>
              </div>

              {selectedLesson.description && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Description</p>
                  <p className="text-gray-900">{selectedLesson.description}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600 mb-2">Instructors</p>
                <div className="space-y-1">
                  {selectedLesson.instructors.map((instructor) => (
                    <p key={instructor.id} className="text-gray-900">
                      {instructor.name} ({instructor.staff_id})
                    </p>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Assigned Guests</p>
                <div className="space-y-1">
                  {selectedLesson.assigned_guests.map((guest) => (
                    <div key={guest.id} className="flex items-center justify-between">
                      <p className="text-gray-900">{guest.name} ({guest.guest_id})</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSurfLevelColor(guest.surf_level)}`}>
                        {guest.surf_level || 'Not assessed'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Lesson Modal */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {modalMode === 'edit' ? 'Edit Lesson' : 'Create Lesson'}
              </h3>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false)
                  setIsEditModalOpen(false)
                  resetForm()
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Lesson title"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category || 'lesson'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Lesson['category'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="lesson">Lesson</option>
                    <option value="theory">Theory</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Location"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="datetime-local"
                    value={formData.start_at || ''}
                    onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="datetime-local"
                    value={formData.end_at || ''}
                    onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants</label>
                <input
                  type="number"
                  value={formData.max_participants || ''}
                  onChange={(e) => setFormData({ ...formData, max_participants: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Leave empty for unlimited"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Lesson description"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setIsCreateModalOpen(false)
                  setIsEditModalOpen(false)
                  resetForm()
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLesson}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {modalMode === 'edit' ? 'Save Changes' : 'Create Lesson'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Lesson Modal */}
      {isDeleteModalOpen && selectedLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Delete Lesson</h3>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{selectedLesson.title}"? This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteLesson}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guest Assessment Modal */}
      {isGuestAssessmentModalOpen && selectedGuest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Guest Assessment</h3>
              <button
                onClick={() => setIsGuestAssessmentModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h4 className="text-lg font-medium text-gray-900">{selectedGuest.name}</h4>
                <p className="text-sm text-gray-600">{selectedGuest.guest_id}</p>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSurfLevelColor(selectedGuest.surf_level)}`}>
                    Current Level: {selectedGuest.surf_level || 'Not assessed'}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {questions.map((question) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                    <p className="font-medium text-gray-900 mb-2">{question.question_text}</p>
                    <div className="grid grid-cols-5 gap-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <div key={value} className="text-center">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600 mb-1">
                            {value}
                          </div>
                          <p className="text-xs text-gray-500">{question.scale_labels[value.toString() as keyof typeof question.scale_labels]}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Response: Not answered {/* This would come from guest_assessments */}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3">
                <select
                  value={newSurfLevel || ''}
                  onChange={(e) => setNewSurfLevel(e.target.value as Guest['surf_level'] || null)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Set Surf Level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                <button
                  onClick={() => {
                    if (selectedGuest && newSurfLevel) {
                      setGuests(guests.map(g =>
                        g.id === selectedGuest.id
                          ? { ...g, surf_level: newSurfLevel }
                          : g
                      ))
                      setSelectedGuest({ ...selectedGuest, surf_level: newSurfLevel })
                      alert(`Surf level updated to ${newSurfLevel} for ${selectedGuest.name}`)
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update Level
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Students Modal */}
      {isAssignStudentsModalOpen && selectedLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Assign Students</h3>
              <button
                onClick={() => setIsAssignStudentsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h4 className="text-lg font-medium text-gray-900">{selectedLesson.title}</h4>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(selectedLesson.category)}`}>
                    {getCategoryIcon(selectedLesson.category)}
                    <span className="ml-1 capitalize">{selectedLesson.category}</span>
                  </span>
                  <span>{formatTime(selectedLesson.start_at)} - {formatTime(selectedLesson.end_at)}</span>
                  <span>{selectedLesson.location}</span>
                  <span>Current: {selectedLesson.assigned_guests.length} / {selectedLesson.max_participants || '∞'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Available Students ({getAvailableGuestsForLesson(selectedLesson).length})</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {getAvailableGuestsForLesson(selectedLesson).map((guest) => (
                        <div key={guest.id} className="p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{guest.name}</p>
                              <p className="text-sm text-gray-600">{guest.guest_id}</p>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSurfLevelColor(guest.surf_level)}`}>
                                {guest.surf_level || 'Not assessed'}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                const { canAssign, reason } = canAssignGuestToLesson(guest, selectedLesson)
                                if (!canAssign && reason) {
                                  alert(reason)
                                  return
                                }

                                const updatedLesson = {
                                  ...selectedLesson,
                                  assigned_guests: [...selectedLesson.assigned_guests, guest]
                                }
                                setLessons(lessons.map(l => l.id === selectedLesson.id ? updatedLesson : l))
                                setSelectedLesson(updatedLesson)
                              }}
                              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                            >
                              Assign
                            </button>
                          </div>
                        </div>
                      ))}
                    {getAvailableGuestsForLesson(selectedLesson).length === 0 && (
                      <div className="p-4 text-center text-gray-500">
                        <p>No available students for this lesson.</p>
                        <p className="text-xs mt-1">Students can only have 1 lesson per category per day.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Assigned Students ({selectedLesson.assigned_guests.length})</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {selectedLesson.assigned_guests.map((guest) => (
                      <div key={guest.id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{guest.name}</p>
                            <p className="text-sm text-gray-600">{guest.guest_id}</p>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSurfLevelColor(guest.surf_level)}`}>
                              {guest.surf_level || 'Not assessed'}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              const updatedLesson = {
                                ...selectedLesson,
                                assigned_guests: selectedLesson.assigned_guests.filter(ag => ag.id !== guest.id)
                              }
                              setLessons(lessons.map(l => l.id === selectedLesson.id ? updatedLesson : l))
                              setSelectedLesson(updatedLesson)
                            }}
                            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setIsAssignStudentsModalOpen(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Question Modal */}
      {isViewQuestionModalOpen && selectedQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">View Assessment Question</h3>
              <button
                onClick={() => setIsViewQuestionModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-medium text-gray-900 capitalize">{selectedQuestion.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Sort Order</p>
                  <p className="font-medium text-gray-900">{selectedQuestion.sort_order}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Required</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    selectedQuestion.is_required ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedQuestion.is_required ? 'Required' : 'Optional'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    selectedQuestion.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedQuestion.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Question</p>
                <p className="text-gray-900 font-medium">{selectedQuestion.question_text}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-3">Scale Labels (1-5)</p>
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <div key={value} className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                        {value}
                      </div>
                      <p className="text-gray-900">{selectedQuestion.scale_labels[value.toString() as keyof typeof selectedQuestion.scale_labels]}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsViewQuestionModalOpen(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Question Modal */}
      {isEditQuestionModalOpen && selectedQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Edit Assessment Question</h3>
              <button
                onClick={() => setIsEditQuestionModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                <textarea
                  defaultValue={selectedQuestion.question_text}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter question text"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    defaultValue={selectedQuestion.category}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="experience">Experience</option>
                    <option value="safety">Safety</option>
                    <option value="preferences">Preferences</option>
                    <option value="goals">Goals</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                  <input
                    type="number"
                    defaultValue={selectedQuestion.sort_order}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked={selectedQuestion.is_required}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">Required</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked={selectedQuestion.is_active}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">Active</label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Scale Labels (1-5)</label>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <div key={value} className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                        {value}
                      </div>
                      <input
                        type="text"
                        defaultValue={selectedQuestion.scale_labels[value.toString() as keyof typeof selectedQuestion.scale_labels]}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Label for value ${value}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsEditQuestionModalOpen(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Question would be updated here')
                  setIsEditQuestionModalOpen(false)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Material Modal */}
      {isAssignMaterialModalOpen && selectedGuest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Assign Material</h3>
              <button
                onClick={() => setIsAssignMaterialModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h4 className="text-lg font-medium text-gray-900">{selectedGuest.name}</h4>
                <p className="text-sm text-gray-600">{selectedGuest.guest_id}</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSurfLevelColor(selectedGuest.surf_level)}`}>
                  {selectedGuest.surf_level || 'Not assessed'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Available Equipment</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    <div className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Surfboard #1</p>
                          <p className="text-sm text-gray-600">9'0" Longboard</p>
                        </div>
                        <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                          Assign
                        </button>
                      </div>
                    </div>
                    <div className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Wetsuit #3</p>
                          <p className="text-sm text-gray-600">Size M, 3/2mm</p>
                        </div>
                        <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                          Assign
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Currently Assigned</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Surfboard #5</p>
                          <p className="text-sm text-gray-600">8'6" Funboard</p>
                        </div>
                        <button className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setIsAssignMaterialModalOpen(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}