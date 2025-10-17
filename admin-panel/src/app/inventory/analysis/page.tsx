'use client'

import Link from 'next/link'
import {
  HomeIcon,
  ChartBarIcon,
  CubeIcon
} from '@heroicons/react/24/outline'
import AnalyseComponent from '@/components/inventory/Analyse'

const inventoryModules = [
  {
    title: 'Bed Inventory',
    description: 'Manage room assignments and bed occupancy',
    href: '/inventory/bed-inventory',
    icon: HomeIcon,
    color: 'bg-blue-500'
  },
  {
    title: 'Analysis',
    description: 'Occupancy analytics and room utilization reports',
    href: '/inventory/analysis',
    icon: ChartBarIcon,
    color: 'bg-green-500'
  },
  {
    title: 'Material Inventory',
    description: 'Track room equipment and material supplies',
    href: '/inventory/material-inventory',
    icon: CubeIcon,
    color: 'bg-purple-500'
  }
]

export default function AnalysisPage() {
  return (
    <div className="space-y-6">
      {/* Main Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Rooms</h1>
      </div>

      {/* Description */}
      <div>
        <p className="text-gray-600">Manage room assignments, bed inventory, and material supplies</p>
      </div>

      {/* Navigation Links */}
      <div className="flex space-x-1 border-b border-gray-200">
        <Link
          href="/inventory"
          className="text-gray-500 hover:text-gray-700 px-4 py-2 text-sm font-medium rounded-t-md hover:bg-gray-50 transition-colors flex items-center space-x-2"
        >
          <HomeIcon className="h-4 w-4" />
          <span>Bed Inventory</span>
        </Link>
        <div className="bg-blue-100 text-blue-700 px-4 py-2 text-sm font-medium rounded-t-md flex items-center space-x-2">
          <ChartBarIcon className="h-4 w-4" />
          <span>Analysis</span>
        </div>
      </div>

      {/* Page Content */}
      <AnalyseComponent />
    </div>
  )
}