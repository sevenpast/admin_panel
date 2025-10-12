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
import { databaseService, AssessmentQuestion as DbAssessmentQuestion } from '@/lib/database-service'

// Types based on database schema
type AssessmentQuestion = DbAssessmentQuestion

interface AssessmentAnswer {
  guest_id: string
  question_id: string
  value: number | null
}

interface AssessmentQuestionsProps {
  selectedDate: string
  onDateChange: (date: string) => void
}

export default function AssessmentQuestionsComponent({ selectedDate, onDateChange }: AssessmentQuestionsProps) {
  // Modal states
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false)

  // Selected items
  const [selectedQuestion, setSelectedQuestion] = useState<AssessmentQuestion | null>(null)
  const [editingQuestion, setEditingQuestion] = useState<Partial<AssessmentQuestion>>({})
  const [isQuestionEditMode, setIsQuestionEditMode] = useState(false)

  // Data states
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([])
  const [assessmentAnswers, setAssessmentAnswers] = useState<AssessmentAnswer[]>([])
  const [loading, setLoading] = useState(true)

  // Load data from database
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // Load assessment questions
        const questionsResponse = await fetch('/api/assessment-questions')
        if (questionsResponse.ok) {
          const dbQuestions = await questionsResponse.json()
          setQuestions(dbQuestions.data || [])
        }
      } catch (error) {
        console.error('Error loading assessment questions:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Assessment question management functions
  const handleCreateQuestion = () => {
    setEditingQuestion({
      text: '',
      category: 'surf_skill',
      type: 'rating',
      options: [],
      is_active: true
    })
    setIsQuestionEditMode(false)
    setIsQuestionModalOpen(true)
  }

  const handleEditQuestion = (question: AssessmentQuestion) => {
    setEditingQuestion(question)
    setIsQuestionEditMode(true)
    setIsQuestionModalOpen(true)
  }

  const handleSaveQuestion = async () => {
    try {
      if (!editingQuestion.text) {
        alert('Please fill in the question text')
        return
      }

      const questionData = {
        text: editingQuestion.text,
        category: editingQuestion.category || 'surf_skill',
        type: editingQuestion.type || 'rating',
        options: editingQuestion.options || [],
        is_active: editingQuestion.is_active !== false
      }

      if (isQuestionEditMode && editingQuestion.id) {
        const response = await fetch('/api/assessment-questions', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: editingQuestion.id,
            ...questionData
          })
        })

        if (response.ok) {
                          alert('Assessment question updated successfully!')
                          // Reload questions
                          const questionsResponse = await fetch('/api/assessment-questions')
                          if (questionsResponse.ok) {
                            const dbQuestions = await questionsResponse.json()
                            setQuestions(dbQuestions.data || [])          }
        } else {
          const error = await response.json()
          alert(`Error updating question: ${error.error}`)
        }
      } else {
        const response = await fetch('/api/assessment-questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(questionData)
        })

        if (response.ok) {
          alert('Assessment question created successfully!')
          // Reload questions
          const questionsResponse = await fetch('/api/assessment-questions')
          if (questionsResponse.ok) {
            const dbQuestions = await questionsResponse.json()
            setQuestions(dbQuestions)
          }
        } else {
          const error = await response.json()
          alert(`Error creating question: ${error.error}`)
        }
      }
    } catch (error) {
      console.error('Error saving question:', error)
      alert('Error saving question')
    }

    setIsQuestionModalOpen(false)
    setEditingQuestion({})
    setIsQuestionEditMode(false)
  }

  const handleDeleteQuestion = async (questionId: string) => {
    if (confirm('Are you sure you want to delete this assessment question?')) {
      try {
        const response = await fetch(`/api/assessment-questions?id=${questionId}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          alert('Assessment question deleted successfully!')
          // Reload questions
          const questionsResponse = await fetch('/api/assessment-questions')
          if (questionsResponse.ok) {
            const dbQuestions = await questionsResponse.json()
            setQuestions(dbQuestions)
          }
        } else {
          const error = await response.json()
          alert(`Error deleting question: ${error.error}`)
        }
      } catch (error) {
        console.error('Error deleting question:', error)
        alert('Error deleting question')
      }
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'surf_skill': return 'bg-blue-100 text-blue-800'
      case 'safety': return 'bg-red-100 text-red-800'
      case 'theory': return 'bg-green-100 text-green-800'
      case 'equipment': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'rating': return 'bg-purple-100 text-purple-800'
      case 'multiple_choice': return 'bg-indigo-100 text-indigo-800'
      case 'text': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Assessment Questions</h2>
          <p className="text-gray-600">Manage assessment questions for guest evaluations</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
            <AcademicCapIcon className="h-4 w-4" />
            <span className="text-sm font-medium">{questions.length}</span>
          </div>
          <button
            onClick={handleCreateQuestion}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Create Question</span>
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading questions...</div>
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-12">
            <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assessment questions</h3>
            <p className="text-gray-500 mb-4">
              Create your first assessment question to start evaluating guests.
            </p>
            <button
              onClick={handleCreateQuestion}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Create First Question
            </button>
          </div>
        ) : (
          questions.map((question) => (
            <div key={question.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{question.text}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(question.category)}`}>
                      {question.category}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(question.type)}`}>
                      {question.type}
                    </span>
                    {!question.is_active && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                  </div>
                  
                  {question.options && question.options.length > 0 && (
                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-700">Options:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {question.options.map((option, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                            {option}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Type:</span> {question.type} | 
                    <span className="font-medium ml-2">Category:</span> {question.category} |
                    <span className="font-medium ml-2">Status:</span> {question.is_active ? 'Active' : 'Inactive'}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleEditQuestion(question)}
                    className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded"
                    title="Edit Question"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(question.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Delete Question"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Question Modal */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {isQuestionEditMode ? 'Edit Assessment Question' : 'Create Assessment Question'}
              </h3>
              <button
                onClick={() => {
                  setIsQuestionModalOpen(false)
                  setEditingQuestion({})
                  setIsQuestionEditMode(false)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                <textarea
                  value={editingQuestion.text || ''}
                  onChange={(e) => setEditingQuestion({...editingQuestion, text: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                  placeholder="Enter the assessment question..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={editingQuestion.category || 'surf_skill'}
                    onChange={(e) => setEditingQuestion({...editingQuestion, category: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="surf_skill">Surf Skill</option>
                    <option value="safety">Safety</option>
                    <option value="theory">Theory</option>
                    <option value="equipment">Equipment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={editingQuestion.type || 'rating'}
                    onChange={(e) => setEditingQuestion({...editingQuestion, type: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="rating">Rating (1-5)</option>
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="text">Text Answer</option>
                  </select>
                </div>
              </div>
              
              {editingQuestion.type === 'multiple_choice' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Options (one per line)</label>
                  <textarea
                    value={editingQuestion.options?.join('\n') || ''}
                    onChange={(e) => setEditingQuestion({
                      ...editingQuestion, 
                      options: e.target.value.split('\n').filter(option => option.trim() !== '')
                    })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    rows={4}
                    placeholder="Option 1&#10;Option 2&#10;Option 3"
                  />
                </div>
              )}
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editingQuestion.is_active !== false}
                  onChange={(e) => setEditingQuestion({...editingQuestion, is_active: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                  Active (question will be shown in assessments)
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setIsQuestionModalOpen(false)
                  setEditingQuestion({})
                  setIsQuestionEditMode(false)
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveQuestion}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {isQuestionEditMode ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
