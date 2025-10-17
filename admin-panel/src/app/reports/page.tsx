'use client'

import Link from 'next/link'
import {
  ChartBarIcon,
  ArrowDownTrayIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline'
import Analytics from '@/components/reports/Analytics'

const reportModules = [
  {
    title: 'Analytics',
    description: 'View comprehensive analytics and performance metrics',
    href: '/reports',
    icon: ChartBarIcon,
    color: 'bg-blue-500'
  },
  {
    title: 'Export Data',
    description: 'Export camp data and generate custom reports',
    href: '/reports/export-data',
    icon: ArrowDownTrayIcon,
    color: 'bg-purple-500'
  },
  {
    title: 'Performance',
    description: 'Monitor application performance and identify bottlenecks',
    href: '/reports/performance',
    icon: CpuChipIcon,
    color: 'bg-green-500'
  }
]

export default function ReportsMainPage() {
  const currentModule = reportModules[0] // Analytics

  return (
    <div className="space-y-6">
      {/* Main Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
      </div>

      {/* Description */}
      <div>
        <p className="text-gray-600">Generate insights and reports on camp operations and performance</p>
      </div>

      {/* Navigation Links */}
      <div className="flex space-x-1 border-b border-gray-200">
        <div className="bg-blue-100 text-blue-700 px-4 py-2 text-sm font-medium rounded-t-md flex items-center space-x-2">
          <ChartBarIcon className="h-4 w-4" />
          <span>Analytics</span>
        </div>
        {reportModules.slice(1).map((module) => {
          const Icon = module.icon
          return (
            <Link
              key={module.href}
              href={module.href}
              className="text-gray-500 hover:text-gray-700 px-4 py-2 text-sm font-medium rounded-t-md hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <Icon className="h-4 w-4" />
              <span>{module.title}</span>
            </Link>
          )
        })}
      </div>

      {/* Page Content */}
      <Analytics />
    </div>
  )
}