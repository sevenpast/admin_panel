'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  UsersIcon,
  AcademicCapIcon,
  CakeIcon,
  CalendarIcon,
  UserGroupIcon,
  CubeIcon,
  BellIcon,
  DocumentChartBarIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  BuildingStorefrontIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

const navigationItems = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Guests', href: '/guests', icon: UsersIcon },
  { name: 'Lessons', href: '/lessons', icon: AcademicCapIcon },
  { name: 'Meals', href: '/meals', icon: CakeIcon },
  { name: 'Events', href: '/events', icon: CalendarIcon },
  { name: 'Staff', href: '/staff', icon: UserGroupIcon },
  { name: 'Rooms', href: '/inventory', icon: BuildingStorefrontIcon },
  { name: 'Alert Management', href: '/alerts', icon: BellIcon },
  { name: 'Calendar', href: '/calendar', icon: CalendarIcon },
  { name: 'Reports', href: '/reports', icon: DocumentChartBarIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setisCollapsed] = useState(false)

  return (
    <div className={`bg-gray-900 text-white transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex flex-col h-full">
        {/* Logo/Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
          {!isCollapsed && (
            <h1 className="text-xl font-bold">CampFlow Admin</h1>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-md hover:bg-gray-800 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRightIcon className="h-5 w-5" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 rotate-[-90deg]" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors group ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="ml-3 truncate">{item.name}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="px-4 py-4 border-t border-gray-800">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to logout?')) {
                // Implement logout logic
                error('Logout functionality will be implemented')
              }
            }}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-800 hover:text-white transition-colors"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && (
              <span className="ml-3 truncate">Logout</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}