'use client'

import { useState, useEffect } from 'react'
import { performanceMonitor, reportPerformanceMetrics } from '@/lib/performance-monitor'
import {
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

interface PerformanceMetric {
  name: string
  startTime: number
  endTime?: number
  duration?: number
  metadata?: Record<string, any>
}

export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([])
  const [isMonitoring, setIsMonitoring] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(performanceMonitor.getAllMetrics())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const slowOperations = metrics.filter(m => (m.duration || 0) > 1000)
  const averageDuration = metrics.length > 0 
    ? metrics.reduce((sum, m) => sum + (m.duration || 0), 0) / metrics.length 
    : 0

  const getPerformanceColor = (duration: number) => {
    if (duration < 100) return 'text-green-600'
    if (duration < 500) return 'text-yellow-600'
    if (duration < 1000) return 'text-orange-600'
    return 'text-red-600'
  }

  const getPerformanceStatus = (duration: number) => {
    if (duration < 100) return { status: 'Excellent', color: 'bg-green-100 text-green-800' }
    if (duration < 500) return { status: 'Good', color: 'bg-yellow-100 text-yellow-800' }
    if (duration < 1000) return { status: 'Fair', color: 'bg-orange-100 text-orange-800' }
    return { status: 'Poor', color: 'bg-red-100 text-red-800' }
  }

  const clearMetrics = () => {
    performanceMonitor.clearMetrics()
    setMetrics([])
  }

  const generateReport = () => {
    reportPerformanceMetrics()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance Dashboard</h1>
          <p className="text-gray-600">Monitor application performance and identify bottlenecks</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={clearMetrics}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <ArrowPathIcon className="h-4 w-4" />
            <span>Clear Metrics</span>
          </button>
          <button
            onClick={generateReport}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <ChartBarIcon className="h-4 w-4" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Operations</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Duration</p>
              <p className="text-2xl font-bold text-gray-900">{averageDuration.toFixed(2)}ms</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Slow Operations</p>
              <p className="text-2xl font-bold text-gray-900">{slowOperations.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.length > 0 ? Math.round(((metrics.length - slowOperations.length) / metrics.length) * 100) : 100}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Operations</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Operation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Metadata
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {metrics.slice(-20).reverse().map((metric, index) => {
                const status = getPerformanceStatus(metric.duration || 0)
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{metric.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${getPerformanceColor(metric.duration || 0)}`}>
                        {metric.duration?.toFixed(2)}ms
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                        {status.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(metric.startTime).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {metric.metadata ? (
                        <div className="max-w-xs truncate">
                          {Object.entries(metric.metadata).map(([key, value]) => (
                            <div key={key} className="text-xs">
                              <span className="font-medium">{key}:</span> {String(value)}
                            </div>
                          ))}
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Performance Optimization Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">Database Optimization:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Use database indexes for frequently queried columns</li>
              <li>Implement query result caching</li>
              <li>Optimize JOIN operations</li>
              <li>Use pagination for large datasets</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Frontend Optimization:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Implement React Query for data caching</li>
              <li>Use React.memo for expensive components</li>
              <li>Optimize bundle size with code splitting</li>
              <li>Implement virtual scrolling for large lists</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
