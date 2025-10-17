'use client'

import { useState, useEffect } from 'react'
import { ChartBarIcon, DocumentChartBarIcon, CalendarIcon, UsersIcon } from '@heroicons/react/24/outline'

interface AnalyticsData {
  id: string
  metric: string
  value: number
  change: number
  period: string
  category: 'guests' | 'lessons' | 'events' | 'revenue'
}

interface ChartData {
  label: string
  value: number
  color: string
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([])
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [dateRange, setDateRange] = useState('7d')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange, selectedCategory])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))

      const mockAnalytics: AnalyticsData[] = [
        {
          id: '1',
          metric: 'Total Guests',
          value: 245,
          change: 12.5,
          period: 'vs last week',
          category: 'guests'
        },
        {
          id: '2',
          metric: 'Active Lessons',
          value: 32,
          change: -5.2,
          period: 'vs last week',
          category: 'lessons'
        },
        {
          id: '3',
          metric: 'Events This Week',
          value: 18,
          change: 8.1,
          period: 'vs last week',
          category: 'events'
        },
        {
          id: '4',
          metric: 'Weekly Revenue',
          value: 15420,
          change: 15.3,
          period: 'vs last week',
          category: 'revenue'
        }
      ]

      const mockChartData: ChartData[] = [
        { label: 'Monday', value: 35, color: '#3B82F6' },
        { label: 'Tuesday', value: 42, color: '#10B981' },
        { label: 'Wednesday', value: 38, color: '#F59E0B' },
        { label: 'Thursday', value: 45, color: '#EF4444' },
        { label: 'Friday', value: 52, color: '#8B5CF6' },
        { label: 'Saturday', value: 48, color: '#06B6D4' },
        { label: 'Sunday', value: 40, color: '#84CC16' }
      ]

      setAnalytics(mockAnalytics)
      setChartData(mockChartData)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'guests':
        return <UsersIcon className="h-6 w-6" />
      case 'lessons':
        return <DocumentChartBarIcon className="h-6 w-6" />
      case 'events':
        return <CalendarIcon className="h-6 w-6" />
      default:
        return <ChartBarIcon className="h-6 w-6" />
    }
  }

  const filteredAnalytics = selectedCategory === 'all'
    ? analytics
    : analytics.filter(item => item.category === selectedCategory)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Performance metrics and insights for your camp
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="guests">Guests</option>
            <option value="lessons">Lessons</option>
            <option value="events">Events</option>
            <option value="revenue">Revenue</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredAnalytics.map((metric) => (
          <div key={metric.id} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 text-gray-400">
                  {getCategoryIcon(metric.category)}
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {metric.metric}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {typeof metric.value === 'number' && metric.category === 'revenue'
                          ? `$${metric.value.toLocaleString()}`
                          : metric.value.toLocaleString()
                        }
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        metric.change > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {metric.change > 0 ? '+' : ''}{metric.change}%
                        <span className="text-gray-500 font-normal ml-1">
                          {metric.period}
                        </span>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Weekly Activity
          </h3>
          <div className="flex items-end space-x-4 h-64">
            {chartData.map((item, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className="relative w-full">
                  <div
                    className="w-full rounded-t-md"
                    style={{
                      backgroundColor: item.color,
                      height: `${(item.value / Math.max(...chartData.map(d => d.value))) * 200}px`
                    }}
                  />
                </div>
                <div className="mt-2 text-xs text-gray-500 text-center">
                  {item.label}
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Top Performing Events
            </h3>
            <div className="space-y-3">
              {['Surf Lesson Advanced', 'Yoga Morning', 'Beach Volleyball', 'Cooking Class'].map((event, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium text-gray-900">{event}</span>
                  <span className="text-sm text-gray-500">{Math.floor(Math.random() * 50) + 10} participants</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Insights
            </h3>
            <div className="space-y-3">
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-sm text-gray-600">
                  Guest satisfaction increased by 15% this week
                </p>
              </div>
              <div className="border-l-4 border-green-400 pl-4">
                <p className="text-sm text-gray-600">
                  Surf lessons are fully booked for the next 3 days
                </p>
              </div>
              <div className="border-l-4 border-yellow-400 pl-4">
                <p className="text-sm text-gray-600">
                  Equipment utilization is at 85% capacity
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}