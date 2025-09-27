'use client'

import { useState } from 'react'
import {
  ChartBarIcon,
  UsersIcon,
  CubeIcon,
  CalendarIcon,
  BellIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

// Analytics interfaces
interface KPIMetric {
  title: string
  value: string | number
  change: number
  changeType: 'increase' | 'decrease' | 'neutral'
  icon: React.ComponentType<{ className?: string }>
  color: string
}

interface ChartData {
  label: string
  value: number
  color?: string
}

interface ActivityMetric {
  name: string
  count: number
  percentage: number
  color: string
}

// Mock analytics data
const mockKPIs: KPIMetric[] = [
  {
    title: 'Total Guests',
    value: 47,
    change: 8.2,
    changeType: 'increase',
    icon: UsersIcon,
    color: 'blue'
  },
  {
    title: 'Occupancy Rate',
    value: '78%',
    change: 5.4,
    changeType: 'increase',
    icon: CalendarIcon,
    color: 'green'
  },
  {
    title: 'Equipment Utilization',
    value: '65%',
    change: -2.1,
    changeType: 'decrease',
    icon: CubeIcon,
    color: 'yellow'
  },
  {
    title: 'Alert Response Rate',
    value: '94%',
    change: 1.8,
    changeType: 'increase',
    icon: BellIcon,
    color: 'purple'
  }
]

const occupancyData: ChartData[] = [
  { label: 'Mo', value: 85 },
  { label: 'Di', value: 92 },
  { label: 'Mi', value: 78 },
  { label: 'Do', value: 88 },
  { label: 'Fr', value: 95 },
  { label: 'Sa', value: 100 },
  { label: 'So', value: 87 }
]

const activityBreakdown: ActivityMetric[] = [
  { name: 'Surf Lessons', count: 28, percentage: 45, color: '#22C55E' },
  { name: 'Events', count: 15, percentage: 24, color: '#8B5CF6' },
  { name: 'Meals', count: 12, percentage: 19, color: '#F59E0B' },
  { name: 'Equipment', count: 7, percentage: 12, color: '#3B82F6' }
]

const alertStats = {
  total_sent: 156,
  delivered: 147,
  opened: 132,
  failed: 9,
  delivery_rate: 94.2,
  open_rate: 89.8
}

const recentActivities = [
  { type: 'guest', action: 'New guest registration', details: 'John Doe checked in', time: '2 min ago', color: 'blue' },
  { type: 'alert', action: 'Meal alert sent', details: 'Dinner notification to 23 guests', time: '15 min ago', color: 'green' },
  { type: 'lesson', action: 'Surf lesson completed', details: 'Beginner lesson with 8 participants', time: '1 hour ago', color: 'purple' },
  { type: 'equipment', action: 'Equipment assigned', details: '5 surfboards assigned to guests', time: '2 hours ago', color: 'yellow' }
]

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d')
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)

  const getChangeColor = (changeType: 'increase' | 'decrease' | 'neutral') => {
    switch (changeType) {
      case 'increase': return 'text-green-600'
      case 'decrease': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getChangeIcon = (changeType: 'increase' | 'decrease' | 'neutral') => {
    switch (changeType) {
      case 'increase': return <ArrowTrendingUpIcon className="h-4 w-4" />
      case 'decrease': return <ArrowTrendingDownIcon className="h-4 w-4" />
      default: return null
    }
  }

  const getKPIColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200',
      green: 'bg-green-50 border-green-200',
      yellow: 'bg-yellow-50 border-yellow-200',
      purple: 'bg-purple-50 border-purple-200',
      red: 'bg-red-50 border-red-200'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  const getIconColor = (color: string) => {
    const colors = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      yellow: 'text-yellow-600',
      purple: 'text-purple-600',
      red: 'text-red-600'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600 mt-1">Camp performance insights and activity metrics</p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockKPIs.map((kpi, index) => {
          const IconComponent = kpi.icon
          return (
            <div
              key={index}
              className={`p-6 rounded-lg border ${getKPIColor(kpi.color)} hover:shadow-md transition-shadow cursor-pointer`}
              onClick={() => setSelectedMetric(selectedMetric === kpi.title ? null : kpi.title)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{kpi.value}</p>
                  <div className={`flex items-center mt-2 ${getChangeColor(kpi.changeType)}`}>
                    {getChangeIcon(kpi.changeType)}
                    <span className="text-sm font-medium ml-1">
                      {Math.abs(kpi.change)}% vs last period
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${getKPIColor(kpi.color)}`}>
                  <IconComponent className={`h-8 w-8 ${getIconColor(kpi.color)}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occupancy Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Weekly Occupancy Rate</h3>
            <button className="text-blue-600 hover:text-blue-800 text-sm">
              <EyeIcon className="h-4 w-4 inline mr-1" />
              Details
            </button>
          </div>

          <div className="space-y-3">
            {occupancyData.map((day, index) => (
              <div key={index} className="flex items-center">
                <div className="w-8 text-sm text-gray-600">{day.label}</div>
                <div className="flex-1 mx-3">
                  <div className="bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${day.value}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-12 text-sm font-medium text-gray-900">{day.value}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Breakdown */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Activity Breakdown</h3>
            <button className="text-blue-600 hover:text-blue-800 text-sm">
              <EyeIcon className="h-4 w-4 inline mr-1" />
              Details
            </button>
          </div>

          <div className="space-y-4">
            {activityBreakdown.map((activity, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: activity.color }}
                  ></div>
                  <span className="text-sm font-medium text-gray-900">{activity.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">{activity.count}</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${activity.percentage}%`,
                        backgroundColor: activity.color
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-10">{activity.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alert Analytics */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Alert Performance</h3>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{alertStats.total_sent}</div>
            <div className="text-sm text-gray-600">Total Sent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{alertStats.delivered}</div>
            <div className="text-sm text-gray-600">Delivered</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{alertStats.opened}</div>
            <div className="text-sm text-gray-600">Opened</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{alertStats.failed}</div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{alertStats.delivery_rate}%</div>
            <div className="text-sm text-gray-600">Delivery Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{alertStats.open_rate}%</div>
            <div className="text-sm text-gray-600">Open Rate</div>
          </div>
        </div>

        {/* Alert Performance Bars */}
        <div className="space-y-3">
          <div className="flex items-center">
            <span className="w-20 text-sm text-gray-600">Delivered</span>
            <div className="flex-1 mx-3">
              <div className="bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${alertStats.delivery_rate}%` }}></div>
              </div>
            </div>
            <span className="text-sm font-medium">{alertStats.delivery_rate}%</span>
          </div>
          <div className="flex items-center">
            <span className="w-20 text-sm text-gray-600">Opened</span>
            <div className="flex-1 mx-3">
              <div className="bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${alertStats.open_rate}%` }}></div>
              </div>
            </div>
            <span className="text-sm font-medium">{alertStats.open_rate}%</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>

        <div className="space-y-4">
          {recentActivities.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className={`w-2 h-2 rounded-full mt-2 bg-${activity.color}-500`}></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">{activity.action}</h4>
                  <span className="text-sm text-gray-500">{activity.time}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{activity.details}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center">
          <button className="text-blue-600 hover:text-blue-800 text-sm">
            View All Activities
          </button>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Reports</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <ChartBarIcon className="h-8 w-8 text-gray-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-gray-900">Occupancy Report</div>
            <div className="text-xs text-gray-600 mt-1">Weekly room utilization</div>
          </button>

          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <UsersIcon className="h-8 w-8 text-gray-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-gray-900">Guest Report</div>
            <div className="text-xs text-gray-600 mt-1">Check-ins and activities</div>
          </button>

          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <BellIcon className="h-8 w-8 text-gray-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-gray-900">Alert Report</div>
            <div className="text-xs text-gray-600 mt-1">Notification performance</div>
          </button>
        </div>
      </div>
    </div>
  )
}