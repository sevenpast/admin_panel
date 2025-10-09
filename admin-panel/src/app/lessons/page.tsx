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

// Types based on database schema
interface Guest {
  id: string
  camp_id: string
  guest_id: string
  name: string
  is_active: boolean
  in_surf_package: boolean
  room_id?: string
  bed_id?: string
  surf_level?: 'beginner' | 'intermediate' | 'advanced'
}

interface Staff {
  id: string
  camp_id: string
  staff_id: string
  name: string
  roles: string[]
  is_active: boolean
}

interface Lesson {
  id: string
  camp_id: string
  title: string
  category: 'lesson' | 'theory' | 'other'
  location: string
  start_at: string
  end_at: string
  status: 'draft' | 'published'
  alert_time?: string
  alert_text?: string
  description?: string
  created_by: string
  instructors: Staff[]
  guests: Guest[]
  guest_count: number
}

interface AssessmentQuestion {
  id: string
  camp_id: string
  text: string
  scale_labels: { [key: string]: string }
  category?: string
  is_required: boolean
  is_active: boolean
}

interface AssessmentAnswer {
  guest_id: string
  question_id: string
  value: number | null
}

interface GearItem {
  id: string
  camp_id: string
  type: string
  size: string
  status: 'available' | 'assigned' | 'maintenance'
  assigned_to_guest_id?: string
}

// Mock data (will be replaced with database calls)
const mockGuests: Guest[] = [
  {
    id: '1',
    camp_id: 'camp1',
    guest_id: 'G-SURF001ABC',
    name: 'Max Mustermann',
    is_active: true,
    in_surf_package: true,
    surf_level: 'beginner'
  },
  {
    id: '2',
    camp_id: 'camp1',
    guest_id: 'G-SURF002DEF',
    name: 'Anna Schmidt',
    is_active: true,
    in_surf_package: true,
    surf_level: 'intermediate'
  },
  {
    id: '3',
    camp_id: 'camp1',
    guest_id: 'G-SURF003GHI',
    name: 'Tom Wilson',
    is_active: true,
    in_surf_package: true
  }
]

const mockStaff: Staff[] = [
  {
    id: '1',
    camp_id: 'camp1',
    staff_id: 'S-INST001',
    name: 'Carlos Rodriguez',
    roles: ['instructor'],
    is_active: true
  },
  {
    id: '2',
    camp_id: 'camp1',
    staff_id: 'S-INST002',
    name: 'Maria Santos',
    roles: ['instructor', 'host'],
    is_active: true
  }
]

const mockLessons: Lesson[] = [
  {
    id: '1',
    camp_id: 'camp1',
    title: 'Beginner Surf Basics',
    category: 'lesson',
    location: 'Beach A',
    start_at: new Date().toISOString().split('T')[0] + 'T09:00',
    end_at: new Date().toISOString().split('T')[0] + 'T10:30',
    status: 'published',
    description: 'Basic surf techniques for beginners',
    created_by: 'admin',
    instructors: [mockStaff[0]],
    guests: [mockGuests[0], mockGuests[2]],
    guest_count: 2
  },
  {
    id: '2',
    camp_id: 'camp1',
    title: 'Surf Theory: Safety & Ocean Awareness',
    category: 'theory',
    location: 'Classroom 1',
    start_at: new Date().toISOString().split('T')[0] + 'T14:00',
    end_at: new Date().toISOString().split('T')[0] + 'T15:00',
    status: 'draft',
    description: 'Ocean safety and awareness theory session',
    created_by: 'admin',
    instructors: [mockStaff[1]],
    guests: [],
    guest_count: 0
  }
]

const mockQuestions: AssessmentQuestion[] = [
  {
    id: '1',
    camp_id: 'camp1',
    text: 'How confident are you in swimming in ocean conditions?',
    scale_labels: {
      '1': 'Not confident at all',
      '2': 'Slightly confident',
      '3': 'Moderately confident',
      '4': 'Very confident',
      '5': 'Extremely confident'
    },
    category: 'safety',
    is_required: true,
    is_active: true
  },
  {
    id: '2',
    camp_id: 'camp1',
    text: 'How many years of surfing experience do you have?',
    scale_labels: {
      '1': 'No experience',
      '2': '1-2 years',
      '3': '3-5 years',
      '4': '6-10 years',
      '5': '10+ years'
    },
    category: 'experience',
    is_required: true,
    is_active: true
  }
]

const mockGearItems: GearItem[] = [
  {
    id: '1',
    camp_id: 'camp1',
    type: 'Surfboard',
    size: '9\'0"',
    status: 'available'
  },
  {
    id: '2',
    camp_id: 'camp1',
    type: 'Wetsuit',
    size: 'M',
    status: 'assigned',
    assigned_to_guest_id: '1'
  },
  {
    id: '3',
    camp_id: 'camp1',
    type: 'Surfboard',
    size: '8\'6"',
    status: 'assigned',
    assigned_to_guest_id: '1'
  },
  {
    id: '4',
    camp_id: 'camp1',
    type: 'Surfboard',
    size: '9\'6"',
    status: 'available'
  },
  {
    id: '5',
    camp_id: 'camp1',
    type: 'Wetsuit',
    size: 'L',
    status: 'available'
  },
  {
    id: '6',
    camp_id: 'camp1',
    type: 'Wetsuit',
    size: 'S',
    status: 'available'
  }
]

export default function SurfLessonsPage() {
  const [activeTab, setActiveTab] = useState<'guests' | 'lessons' | 'questions'>('guests')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  // Modal states
  const [isGuestViewModalOpen, setIsGuestViewModalOpen] = useState(false)
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false)
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false)
  const [isLessonViewModalOpen, setIsLessonViewModalOpen] = useState(false)
  const [isAssignGuestsModalOpen, setIsAssignGuestsModalOpen] = useState(false)
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false)

  // Selected items
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [selectedQuestion, setSelectedQuestion] = useState<AssessmentQuestion | null>(null)
  const [editingLesson, setEditingLesson] = useState<Partial<Lesson>>({})
  const [editingQuestion, setEditingQuestion] = useState<Partial<AssessmentQuestion>>({})
  const [isEditMode, setIsEditMode] = useState(false)
  const [isQuestionEditMode, setIsQuestionEditMode] = useState(false)

  // Data states
  const [guests, setGuests] = useState<Guest[]>(mockGuests)
  const [lessons, setLessons] = useState<Lesson[]>(mockLessons)
  const [questions, setQuestions] = useState<AssessmentQuestion[]>(mockQuestions)
  const [gearItems, setGearItems] = useState<GearItem[]>(mockGearItems)
  const [assessmentAnswers, setAssessmentAnswers] = useState<AssessmentAnswer[]>([])

  // Filter states
  const [guestFilter, setGuestFilter] = useState<{
    name: string
    level: string
    materialStatus: string
  }>({ name: '', level: '', materialStatus: '' })

  const [lessonFilter, setLessonFilter] = useState<{
    title: string
    category: string
    status: string
    instructor: string
  }>({ title: '', category: '', status: '', instructor: '' })

  const [lessonSort, setLessonSort] = useState<'time' | 'title' | 'category' | 'status'>('time')

  const tabs = [
    { id: 'guests', name: 'Package Guests', icon: UserGroupIcon },
    { id: 'lessons', name: 'Lesson Management', icon: AcademicCapIcon },
    { id: 'questions', name: 'Assessment Questions', icon: Cog6ToothIcon }
  ]

  // Get active surf package guests with filters
  const activePackageGuests = guests.filter(g => {
    if (!g.is_active || !g.in_surf_package) return false

    // Name filter
    if (guestFilter.name && !g.name.toLowerCase().includes(guestFilter.name.toLowerCase())) {
      return false
    }

    // Level filter
    if (guestFilter.level && guestFilter.level !== 'all') {
      if (guestFilter.level === 'unassigned' && g.surf_level) return false
      if (guestFilter.level !== 'unassigned' && g.surf_level !== guestFilter.level) return false
    }

    // Material status filter
    if (guestFilter.materialStatus && guestFilter.materialStatus !== 'all') {
      const hasAssignedMaterial = gearItems.some(item => item.assigned_to_guest_id === g.id)
      if (guestFilter.materialStatus === 'with-material' && !hasAssignedMaterial) return false
      if (guestFilter.materialStatus === 'without-material' && hasAssignedMaterial) return false
    }

    return true
  })

  // Get lessons for selected date with filters and sorting
  const dailyLessons = lessons
    .filter(lesson => {
      if (lesson.start_at.split('T')[0] !== selectedDate) return false

      // Title filter
      if (lessonFilter.title && !lesson.title.toLowerCase().includes(lessonFilter.title.toLowerCase())) {
        return false
      }

      // Category filter
      if (lessonFilter.category && lessonFilter.category !== 'all' && lesson.category !== lessonFilter.category) {
        return false
      }

      // Status filter
      if (lessonFilter.status && lessonFilter.status !== 'all' && lesson.status !== lessonFilter.status) {
        return false
      }

      // Instructor filter
      if (lessonFilter.instructor && lessonFilter.instructor !== 'all') {
        const hasInstructor = lesson.instructors.some(instructor => instructor.id === lessonFilter.instructor)
        if (!hasInstructor) return false
      }

      return true
    })
    .sort((a, b) => {
      switch (lessonSort) {
        case 'time':
          return new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
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

  // Get available instructors
  const availableInstructors = mockStaff.filter(s =>
    s.is_active && s.roles.includes('instructor')
  )

  // Date navigation
  const navigateDate = (direction: 'prev' | 'next') => {
    const current = new Date(selectedDate)
    const newDate = new Date(current)
    newDate.setDate(current.getDate() + (direction === 'next' ? 1 : -1))
    setSelectedDate(newDate.toISOString().split('T')[0])
  }

  // Lesson CRUD operations
  const handleCreateLesson = () => {
    setEditingLesson({
      title: '',
      category: 'lesson',
      location: '',
      start_at: selectedDate + 'T09:00',
      end_at: selectedDate + 'T10:30',
      status: 'draft',
      description: '',
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

  const handleDuplicateLesson = (lesson: Lesson) => {
    const duplicate = {
      ...lesson,
      id: undefined,
      title: lesson.title + ' (Kopie)',
      status: 'draft' as const,
      guests: [],
      guest_count: 0
    }
    setEditingLesson(duplicate)
    setIsEditMode(false)
    setIsLessonModalOpen(true)
  }

  const handlePublishToggle = (lesson: Lesson) => {
    const newStatus = lesson.status === 'published' ? 'draft' : 'published'
    setLessons(lessons.map(l =>
      l.id === lesson.id ? { ...l, status: newStatus } : l
    ))
  }

  const handleDeleteLesson = (lessonId: string) => {
    if (confirm('Sind Sie sicher, dass Sie diese Lesson löschen möchten?')) {
      setLessons(lessons.filter(l => l.id !== lessonId))
    }
  }

  const handleSaveLesson = () => {
    if (!editingLesson.title || !editingLesson.location || !editingLesson.start_at || !editingLesson.end_at) {
      alert('Bitte füllen Sie alle Pflichtfelder aus')
      return
    }

    if (isEditMode && selectedLesson) {
      setLessons(lessons.map(l =>
        l.id === selectedLesson.id ? { ...l, ...editingLesson } as Lesson : l
      ))
    } else {
      const newLesson: Lesson = {
        id: Date.now().toString(),
        camp_id: 'camp1',
        created_by: 'admin',
        instructors: editingLesson.instructors || [],
        guests: [],
        guest_count: 0,
        ...editingLesson
      } as Lesson
      setLessons([...lessons, newLesson])
    }

    setIsLessonModalOpen(false)
    setEditingLesson({})
  }

  // Guest level assignment
  const handleAssignLevel = (guestId: string, level: 'beginner' | 'intermediate' | 'advanced') => {
    setGuests(guests.map(g =>
      g.id === guestId ? { ...g, surf_level: level } : g
    ))
  }

  // Material assignment
  const handleAssignMaterial = (guestId: string, gearId: string) => {
    setGearItems(gearItems.map(item =>
      item.id === gearId
        ? { ...item, status: 'assigned' as const, assigned_to_guest_id: guestId }
        : item
    ))
  }

  const handleUnassignMaterial = (gearId: string) => {
    setGearItems(gearItems.map(item =>
      item.id === gearId
        ? { ...item, status: 'available' as const, assigned_to_guest_id: undefined }
        : item
    ))
  }

  // Assessment question management
  const handleCreateQuestion = () => {
    setEditingQuestion({
      text: '',
      scale_labels: { '1': '', '2': '', '3': '', '4': '', '5': '' },
      category: '',
      is_required: false,
      is_active: true
    })
    setIsQuestionEditMode(false)
    setIsQuestionModalOpen(true)
  }

  const handleEditQuestion = (question: AssessmentQuestion) => {
    setSelectedQuestion(question)
    setEditingQuestion(question)
    setIsQuestionEditMode(true)
    setIsQuestionModalOpen(true)
  }

  const handleDeleteQuestion = (questionId: string) => {
    if (confirm('Sind Sie sicher, dass Sie diese Frage löschen möchten?')) {
      setQuestions(questions.filter(q => q.id !== questionId))
    }
  }

  const handleSaveQuestion = () => {
    if (!editingQuestion.text) {
      alert('Bitte geben Sie eine Frage ein')
      return
    }

    if (isQuestionEditMode && selectedQuestion) {
      setQuestions(questions.map(q =>
        q.id === selectedQuestion.id ? { ...q, ...editingQuestion } as AssessmentQuestion : q
      ))
    } else {
      const newQuestion: AssessmentQuestion = {
        id: Date.now().toString(),
        camp_id: 'camp1',
        ...editingQuestion
      } as AssessmentQuestion
      setQuestions([...questions, newQuestion])
    }

    setIsQuestionModalOpen(false)
    setEditingQuestion({})
    setSelectedQuestion(null)
  }

  const formatTime = (datetime: string) => {
    return new Date(datetime).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getCategoryBadge = (category: string) => {
    const colors = {
      lesson: 'bg-blue-100 text-blue-800',
      theory: 'bg-green-100 text-green-800',
      other: 'bg-gray-100 text-gray-800'
    }
    const labels = {
      lesson: 'Lesson',
      theory: 'Theory',
      other: 'Other'
    }
    return { color: colors[category as keyof typeof colors], label: labels[category as keyof typeof labels] }
  }

  const getStatusBadge = (status: string) => {
    return status === 'published'
      ? 'bg-green-100 text-green-800'
      : 'bg-yellow-100 text-yellow-800'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Surf Lessons</h1>
            <p className="text-gray-600">Manage surf lessons, guests, and assessments</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                  {tab.id === 'guests' && (
                    <span className="ml-2 bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                      {activePackageGuests.length}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Package Guests Tab */}
        {activeTab === 'guests' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">
                      Active Surf Package Guests ({activePackageGuests.length})
                    </h2>
                    <p className="text-sm text-gray-600">Guests with active surf packages</p>
                  </div>
                  <div className="text-sm font-medium text-blue-600">
                    {activePackageGuests.length} Active Surf Package Guests
                  </div>
                </div>
              </div>

              {/* Filter Controls */}
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={guestFilter.name}
                      onChange={(e) => setGuestFilter({ ...guestFilter, name: e.target.value })}
                      placeholder="Search by name..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Surf Level</label>
                    <select
                      value={guestFilter.level}
                      onChange={(e) => setGuestFilter({ ...guestFilter, level: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="">All Levels</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="unassigned">Unassigned</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Material Status</label>
                    <select
                      value={guestFilter.materialStatus}
                      onChange={(e) => setGuestFilter({ ...guestFilter, materialStatus: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="">All</option>
                      <option value="with-material">With Material</option>
                      <option value="without-material">Without Material</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name + Guest ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Level
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Material
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activePackageGuests.map((guest) => {
                      const assignedGear = gearItems.filter(item => item.assigned_to_guest_id === guest.id)
                      return (
                        <tr key={guest.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{guest.name}</div>
                              <div className="text-sm text-gray-500">{guest.guest_id}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {guest.surf_level ? (
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                guest.surf_level === 'beginner' ? 'bg-yellow-100 text-yellow-800' :
                                guest.surf_level === 'intermediate' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {guest.surf_level.charAt(0).toUpperCase() + guest.surf_level.slice(1)}
                              </span>
                            ) : (
                              <span className="text-gray-400">Nicht zugewiesen</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {assignedGear.length > 0
                                ? assignedGear.map(item => `${item.type} (${item.size})`).join('; ')
                                : 'Kein Material zugewiesen'
                              }
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedGuest(guest)
                                  setIsGuestViewModalOpen(true)
                                }}
                                className="text-blue-600 hover:text-blue-900"
                                title="View Assessment"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedGuest(guest)
                                  setIsMaterialModalOpen(true)
                                }}
                                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded"
                                title="Material zuweisen"
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
            </div>
          </div>
        )}

        {/* Lesson Management Tab */}
        {activeTab === 'lessons' && (
          <div className="space-y-6">
            {/* Date Navigation */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => navigateDate('prev')}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  <div className="text-center">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {formatDate(selectedDate)}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {dailyLessons.length} Lesson(s) geplant
                    </p>
                  </div>
                  <button
                    onClick={() => navigateDate('next')}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </div>
                <button
                  onClick={handleCreateLesson}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Lesson
                </button>
              </div>
            </div>

            {/* Filter and Sort Controls */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search Title</label>
                  <input
                    type="text"
                    value={lessonFilter.title}
                    onChange={(e) => setLessonFilter({ ...lessonFilter, title: e.target.value })}
                    placeholder="Search lessons..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={lessonFilter.category}
                    onChange={(e) => setLessonFilter({ ...lessonFilter, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                    onChange={(e) => setLessonFilter({ ...lessonFilter, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
                  <select
                    value={lessonFilter.instructor}
                    onChange={(e) => setLessonFilter({ ...lessonFilter, instructor: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">All Instructors</option>
                    {availableInstructors.map((instructor) => (
                      <option key={instructor.id} value={instructor.id}>{instructor.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <select
                    value={lessonSort}
                    onChange={(e) => setLessonSort(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="time">Time</option>
                    <option value="title">Title</option>
                    <option value="category">Category</option>
                    <option value="status">Status</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Lessons Cards */}
            <div className="grid gap-6">
              {dailyLessons.map((lesson) => {
                const categoryBadge = getCategoryBadge(lesson.category)
                return (
                  <div key={lesson.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{lesson.title}</h3>
                            <div className="text-sm text-gray-500">
                              {formatTime(lesson.start_at)} - {formatTime(lesson.end_at)} • {lesson.location}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(lesson.status)}`}>
                              {lesson.status === 'published' ? 'Published' : 'Draft'}
                            </span>
                          </div>
                        </div>

                        {lesson.description && (
                          <p className="text-gray-600 mb-3">{lesson.description}</p>
                        )}

                        <div className="flex flex-wrap gap-2">
                          {/* Category Tag */}
                          <span className={`px-2 py-1 rounded text-xs font-medium ${categoryBadge.color}`}>
                            {categoryBadge.label}
                          </span>

                          {/* Instructors */}
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            👨‍🏫 {lesson.instructors.map(i => i.name).join(', ')}
                          </span>

                          {/* Guest Count */}
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                            👥 {lesson.guest_count} guest(s)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => {
                            setSelectedLesson(lesson)
                            setIsLessonViewModalOpen(true)
                          }}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="View"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicateLesson(lesson)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded"
                          title="Copy"
                        >
                          <DocumentDuplicateIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditLesson(lesson)}
                          className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded"
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedLesson(lesson)
                            setIsAssignGuestsModalOpen(true)
                          }}
                          className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded"
                          title="Assign Guests"
                        >
                          <UserPlusIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handlePublishToggle(lesson)}
                          className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                          title={lesson.status === 'published' ? 'Unpublish' : 'Publish'}
                        >
                          <GlobeAltIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLesson(lesson.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Assessment Questions Tab */}
        {activeTab === 'questions' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">Assessment Questions</h2>
                    <p className="text-sm text-gray-600">Manage surf assessment questions</p>
                  </div>
                  <button
                    onClick={handleCreateQuestion}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Question
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {questions.map((question) => (
                    <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-sm font-medium text-gray-900">{question.text}</h3>
                            {question.category && (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                {question.category}
                              </span>
                            )}
                            {question.is_required && (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                Required
                              </span>
                            )}
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              question.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {question.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            {Object.entries(question.scale_labels).map(([value, label]) => (
                              <div key={value} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                {value}: {label}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex space-x-1 ml-4">
                          <button
                            onClick={() => handleEditQuestion(question)}
                            className="p-2 text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50 rounded"
                            title="Edit Question"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                            title="Delete Question"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Guest Assessment Modal */}
        {isGuestViewModalOpen && selectedGuest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  Guest Assessment: {selectedGuest.name} ({selectedGuest.guest_id})
                </h2>
                <button
                  onClick={() => setIsGuestViewModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                {/* Assessment Questions */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Assessment Questions</h3>
                  <div className="space-y-4">
                    {questions.filter(q => q.is_active).map((question) => (
                      <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-gray-900">{question.text}</p>
                          <span className="text-xs text-gray-500">
                            {question.category || 'General'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Response:</span>
                          <span className="text-sm font-medium text-gray-900">
                            Not answered
                          </span>
                          <span className="inline-flex px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Level Assignment */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Assign Surf Level</h3>
                  <div className="flex space-x-3">
                    {['beginner', 'intermediate', 'advanced'].map((level) => (
                      <button
                        key={level}
                        onClick={() => handleAssignLevel(selectedGuest.id, level as any)}
                        className={`px-4 py-2 rounded-lg font-medium ${
                          selectedGuest.surf_level === level
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end p-6 border-t">
                <button
                  onClick={() => setIsGuestViewModalOpen(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Material Assignment Modal */}
        {isMaterialModalOpen && selectedGuest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  Material Management – {selectedGuest.name} ({selectedGuest.guest_id})
                </h2>
                <button
                  onClick={() => setIsMaterialModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                {/* Assigned Materials */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Zugewiesene Materialien</h3>
                  <div className="space-y-2">
                    {gearItems
                      .filter(item => item.assigned_to_guest_id === selectedGuest.id)
                      .map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <span className="font-medium">{item.type}</span>
                            <span className="text-gray-500 ml-2">({item.size})</span>
                          </div>
                          <button
                            onClick={() => handleUnassignMaterial(item.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Available Materials */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Verfügbare Materialien</h3>
                  <div className="space-y-2">
                    {gearItems
                      .filter(item => item.status === 'available')
                      .map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div>
                            <span className="font-medium">{item.type}</span>
                            <span className="text-gray-500 ml-2">({item.size})</span>
                          </div>
                          <button
                            onClick={() => handleAssignMaterial(selectedGuest.id, item.id)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Add
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 p-6 border-t">
                <button
                  onClick={() => setIsMaterialModalOpen(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Abbrechen
                </button>
                <button
                  onClick={() => setIsMaterialModalOpen(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <CheckIcon className="w-4 h-4 mr-1 inline" />
                  Speichern
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lesson View Modal */}
        {isLessonViewModalOpen && selectedLesson && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  Lesson Details: {selectedLesson.title}
                </h2>
                <button
                  onClick={() => setIsLessonViewModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Title</h3>
                      <p className="text-gray-900">{selectedLesson.title}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Category</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryBadge(selectedLesson.category).color}`}>
                        {getCategoryBadge(selectedLesson.category).label}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Location</h3>
                      <p className="text-gray-900">{selectedLesson.location}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Status</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(selectedLesson.status)}`}>
                        {selectedLesson.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Start Time</h3>
                      <p className="text-gray-900">{formatTime(selectedLesson.start_at)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">End Time</h3>
                      <p className="text-gray-900">{formatTime(selectedLesson.end_at)}</p>
                    </div>
                  </div>

                  {selectedLesson.description && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Description</h3>
                      <p className="text-gray-900">{selectedLesson.description}</p>
                    </div>
                  )}

                  {/* Instructors */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Instructors ({selectedLesson.instructors.length})</h3>
                    <div className="space-y-2">
                      {selectedLesson.instructors.map((instructor) => (
                        <div key={instructor.id} className="flex items-center p-3 bg-blue-50 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">{instructor.name}</div>
                            <div className="text-sm text-gray-500">{instructor.staff_id}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Assigned Guests */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Assigned Guests ({selectedLesson.guest_count})</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {selectedLesson.guests.map((guest) => (
                        <div key={guest.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">{guest.name}</div>
                            <div className="text-sm text-gray-500">{guest.guest_id}</div>
                          </div>
                          {guest.surf_level && (
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              guest.surf_level === 'beginner' ? 'bg-yellow-100 text-yellow-800' :
                              guest.surf_level === 'intermediate' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {guest.surf_level}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end p-6 border-t">
                <button
                  onClick={() => setIsLessonViewModalOpen(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Assign Guests Modal */}
        {isAssignGuestsModalOpen && selectedLesson && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  Assign Guests: {selectedLesson.title}
                </h2>
                <button
                  onClick={() => setIsAssignGuestsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Available Guests */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Available Guests</h3>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {activePackageGuests
                        .filter(guest => {
                          // Filter out guests already assigned to this lesson
                          const isAlreadyAssigned = selectedLesson.guests.some(g => g.id === guest.id)
                          if (isAlreadyAssigned) return false

                          // Check for same-day conflicts based on category
                          const hasConflict = lessons.some(lesson => {
                            // Same date
                            const sameDate = lesson.start_at.split('T')[0] === selectedLesson.start_at.split('T')[0]
                            // Same category
                            const sameCategory = lesson.category === selectedLesson.category
                            // Guest is assigned to this lesson
                            const guestAssigned = lesson.guests.some(g => g.id === guest.id)
                            // Not the current lesson
                            const differentLesson = lesson.id !== selectedLesson.id

                            return sameDate && sameCategory && guestAssigned && differentLesson
                          })

                          return !hasConflict
                        })
                        .map((guest) => (
                          <div key={guest.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                            <div>
                              <div className="font-medium text-gray-900">{guest.name}</div>
                              <div className="text-sm text-gray-500">{guest.guest_id}</div>
                              {guest.surf_level && (
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                                  guest.surf_level === 'beginner' ? 'bg-yellow-100 text-yellow-800' :
                                  guest.surf_level === 'intermediate' ? 'bg-blue-100 text-blue-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {guest.surf_level}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => {
                                // Check for conflicts with other categories
                                const conflictingLesson = lessons.find(lesson => {
                                  const sameDate = lesson.start_at.split('T')[0] === selectedLesson.start_at.split('T')[0]
                                  const differentCategory = lesson.category !== selectedLesson.category
                                  const guestAssigned = lesson.guests.some(g => g.id === guest.id)
                                  const differentLesson = lesson.id !== selectedLesson.id

                                  return sameDate && differentCategory && guestAssigned && differentLesson
                                })

                                if (conflictingLesson) {
                                  const confirmMove = confirm(
                                    `${guest.name} ist bereits in "${conflictingLesson.title}" (${conflictingLesson.category}) am ${conflictingLesson.start_at.split('T')[0]} zugewiesen. Möchten Sie den Gast verschieben?`
                                  )

                                  if (!confirmMove) return

                                  // Remove from conflicting lesson and add to current lesson
                                  setLessons(lessons.map(l => {
                                    if (l.id === conflictingLesson.id) {
                                      return {
                                        ...l,
                                        guests: l.guests.filter(g => g.id !== guest.id),
                                        guest_count: l.guests.filter(g => g.id !== guest.id).length
                                      }
                                    }
                                    if (l.id === selectedLesson.id) {
                                      return {
                                        ...l,
                                        guests: [...l.guests, guest],
                                        guest_count: l.guests.length + 1
                                      }
                                    }
                                    return l
                                  }))

                                  // Update selectedLesson
                                  setSelectedLesson({
                                    ...selectedLesson,
                                    guests: [...selectedLesson.guests, guest],
                                    guest_count: selectedLesson.guests.length + 1
                                  })
                                } else {
                                  // No conflict, just add
                                  setLessons(lessons.map(l =>
                                    l.id === selectedLesson.id
                                      ? {
                                          ...l,
                                          guests: [...l.guests, guest],
                                          guest_count: l.guests.length + 1
                                        }
                                      : l
                                  ))

                                  setSelectedLesson({
                                    ...selectedLesson,
                                    guests: [...selectedLesson.guests, guest],
                                    guest_count: selectedLesson.guests.length + 1
                                  })
                                }
                              }}
                              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                            >
                              Add
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Assigned Guests */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Assigned Guests ({selectedLesson.guest_count})</h3>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {selectedLesson.guests.map((guest) => (
                        <div key={guest.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">{guest.name}</div>
                            <div className="text-sm text-gray-500">{guest.guest_id}</div>
                            {guest.surf_level && (
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                                guest.surf_level === 'beginner' ? 'bg-yellow-100 text-yellow-800' :
                                guest.surf_level === 'intermediate' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {guest.surf_level}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              setLessons(lessons.map(l =>
                                l.id === selectedLesson.id
                                  ? {
                                      ...l,
                                      guests: l.guests.filter(g => g.id !== guest.id),
                                      guest_count: l.guests.filter(g => g.id !== guest.id).length
                                    }
                                  : l
                              ))

                              setSelectedLesson({
                                ...selectedLesson,
                                guests: selectedLesson.guests.filter(g => g.id !== guest.id),
                                guest_count: selectedLesson.guests.filter(g => g.id !== guest.id).length
                              })
                            }}
                            className="text-red-600 hover:text-red-800 font-medium text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Business Rules Info */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Business Rules:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Ein Gast darf pro Tag maximal 1 Lesson und 1 Theory haben</li>
                    <li>• Bei Konflikten wird eine Verschiebungs-Option angeboten</li>
                    <li>• Mehrere Instructors können einer Lesson zugewiesen werden</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-end p-6 border-t">
                <button
                  onClick={() => setIsAssignGuestsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lesson Create/Edit Modal */}
        {isLessonModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  {isEditMode ? 'Edit Lesson' : 'Create Lesson'}
                </h2>
                <button
                  onClick={() => setIsLessonModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      value={editingLesson.title || ''}
                      onChange={(e) => setEditingLesson({...editingLesson, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      value={editingLesson.category || 'lesson'}
                      onChange={(e) => setEditingLesson({...editingLesson, category: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="lesson">Lesson</option>
                      <option value="theory">Theory</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                    <input
                      type="text"
                      value={editingLesson.location || ''}
                      onChange={(e) => setEditingLesson({...editingLesson, location: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                      <input
                        type="datetime-local"
                        value={editingLesson.start_at || ''}
                        onChange={(e) => setEditingLesson({...editingLesson, start_at: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
                      <input
                        type="datetime-local"
                        value={editingLesson.end_at || ''}
                        onChange={(e) => setEditingLesson({...editingLesson, end_at: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instructors *</label>
                    <div className="space-y-2">
                      {availableInstructors.map((instructor) => (
                        <label key={instructor.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editingLesson.instructors?.some(i => i.id === instructor.id) || false}
                            onChange={(e) => {
                              const currentInstructors = editingLesson.instructors || []
                              if (e.target.checked) {
                                setEditingLesson({
                                  ...editingLesson,
                                  instructors: [...currentInstructors, instructor]
                                })
                              } else {
                                setEditingLesson({
                                  ...editingLesson,
                                  instructors: currentInstructors.filter(i => i.id !== instructor.id)
                                })
                              }
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm">{instructor.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>


                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={editingLesson.description || ''}
                      onChange={(e) => setEditingLesson({...editingLesson, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 p-6 border-t">
                <button
                  onClick={() => setIsLessonModalOpen(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleSaveLesson}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <CheckIcon className="w-4 h-4 mr-1 inline" />
                  Speichern
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Question Create/Edit Modal */}
        {isQuestionModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  {isQuestionEditMode ? 'Edit Assessment Question' : 'Create Assessment Question'}
                </h2>
                <button
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Question Text *</label>
                    <textarea
                      value={editingQuestion.text || ''}
                      onChange={(e) => setEditingQuestion({...editingQuestion, text: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Enter your assessment question..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input
                      type="text"
                      value={editingQuestion.category || ''}
                      onChange={(e) => setEditingQuestion({...editingQuestion, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., safety, experience, skills"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Scale Labels (1-5)</label>
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <div key={num} className="flex items-center space-x-2">
                          <span className="w-8 text-sm font-medium text-gray-700">{num}:</span>
                          <input
                            type="text"
                            value={editingQuestion.scale_labels?.[num.toString()] || ''}
                            onChange={(e) => setEditingQuestion({
                              ...editingQuestion,
                              scale_labels: {
                                ...editingQuestion.scale_labels,
                                [num.toString()]: e.target.value
                              }
                            })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder={`Label for ${num}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editingQuestion.is_required || false}
                        onChange={(e) => setEditingQuestion({...editingQuestion, is_required: e.target.checked})}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Required Question</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editingQuestion.is_active !== false}
                        onChange={(e) => setEditingQuestion({...editingQuestion, is_active: e.target.checked})}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Active</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 p-6 border-t">
                <button
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleSaveQuestion}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <CheckIcon className="w-4 h-4 mr-1 inline" />
                  Speichern
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}