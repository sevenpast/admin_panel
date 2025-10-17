'use client'

import { useState } from 'react'
import {
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  TableCellsIcon,
  DocumentTextIcon,
  CalendarIcon,
  UsersIcon
} from '@heroicons/react/24/outline'

interface ExportOption {
  id: string
  name: string
  description: string
  format: 'csv' | 'pdf' | 'excel'
  category: 'guests' | 'events' | 'lessons' | 'financial'
  icon: React.ReactNode
  fields: string[]
}

export default function ExportData() {
  const { success, error } = useToastContext()
  const [selectedOptions, setselectedOptions] = useState<string[]>([])
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [isExporting, setIsExporting] = useState(false)

  const exportOptions: ExportOption[] = [
    {
      id: 'guests-csv',
      name: 'Guest Data (CSV)',
      description: 'Export guest information including contact details and preferences',
      format: 'csv',
      category: 'guests',
      icon: <UsersIcon className="h-6 w-6" />,
      fields: ['Name', 'Email', 'Phone', 'Check-in Date', 'Room Assignment', 'Packages']
    },
    {
      id: 'events-pdf',
      name: 'Events Report (PDF)',
      description: 'Comprehensive events report with attendance and performance metrics',
      format: 'pdf',
      category: 'events',
      icon: <CalendarIcon className="h-6 w-6" />,
      fields: ['Event Name', 'Date', 'Participants', 'Revenue', 'Instructor', 'Location']
    },
    {
      id: 'lessons-excel',
      name: 'Lessons Overview (Excel)',
      description: 'Detailed lessons data with instructor assignments and equipment',
      format: 'excel',
      category: 'lessons',
      icon: <DocumentTextIcon className="h-6 w-6" />,
      fields: ['Lesson Type', 'Instructor', 'Schedule', 'Participants', 'Equipment Used', 'Assessment Scores']
    },
    {
      id: 'financial-csv',
      name: 'Financial Summary (CSV)',
      description: 'Revenue breakdown by services and payment status',
      format: 'csv',
      category: 'financial',
      icon: <TableCellsIcon className="h-6 w-6" />,
      fields: ['Date', 'Service Type', 'Amount', 'Payment Method', 'Status', 'Guest ID']
    }
  ]

  const handleOptionToggle = (optionId: string) => {
    setSelectedOptions(prev =>
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    )
  }

  const handleExport = async () => {
    if (selectedOptions.length === 0) {
      error('Please select at least one export option')
      return
    }

    setIsExporting(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))

      for (const optionId of selectedOptions) {
        const option = exportOptions.find(opt => opt.id === optionId)
        if (option) {
          console.log(`Exporting ${option.name}...`)
        }
      }

      error(`Successfully exported ${selectedOptions.length} report(s)`)
      setSelectedOptions([])
    } catch (err) {
      console.error('Export failed:', error)
      error('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'csv':
        return <TableCellsIcon className="h-4 w-4" />
      case 'pdf':
        return <DocumentArrowDownIcon className="h-4 w-4" />
      case 'excel':
        return <DocumentTextIcon className="h-4 w-4" />
      default:
        return <ArrowDownTrayIcon className="h-4 w-4" />
    }
  }

  const getFormatColor = (format: string) => {
    switch (format) {
      case 'csv':
        return 'bg-green-100 text-green-800'
      case 'pdf':
        return 'bg-red-100 text-red-800'
      case 'excel':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Export Data</h1>
          <p className="mt-1 text-sm text-gray-500">
            Export your camp data in various formats for reporting and analysis
          </p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Date Range
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Export Options
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exportOptions.map((option) => (
              <div
                key={option.id}
                className={`relative rounded-lg border p-4 cursor-pointer hover:bg-gray-50 ${
                  selectedOptions.includes(option.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300'
                }`}
                onClick={() => handleOptionToggle(option.id)}
              >
                <div className="flex items-start">
                  <div className="flex h-5 items-center">
                    <input
                      type="checkbox"
                      checked={selectedOptions.includes(option.id)}
                      onChange={() => handleOptionToggle(option.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="text-gray-400">
                          {option.icon}
                        </div>
                        <span className="text-base font-medium text-gray-900">
                          {option.name}
                        </span>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getFormatColor(option.format)}`}>
                        {getFormatIcon(option.format)}
                        <span className="ml-1">{option.format.toUpperCase()}</span>
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {option.description}
                    </p>
                    <div className="mt-2">
                      <span className="text-xs font-medium text-gray-700">Includes:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {option.fields.slice(0, 3).map((field, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {field}
                          </span>
                        ))}
                        {option.fields.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                            +{option.fields.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedOptions.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Export Summary
            </h3>
            <div className="space-y-2">
              {selectedOptions.map(optionId => {
                const option = exportOptions.find(opt => opt.id === optionId)
                return option ? (
                  <div key={optionId} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
                    <div className="flex items-center space-x-2">
                      <div className="text-gray-400">
                        {option.icon}
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {option.name}
                      </span>
                    </div>
                    <button
                      onClick={() => handleOptionToggle(optionId)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ) : null
              })}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin -ml-1 mr-3 h-5 w-5 text-white">
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <ArrowDownTrayIcon className="-ml-1 mr-2 h-5 w-5" />
                    Export Selected ({selectedOptions.length})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}