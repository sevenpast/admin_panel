'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  UserCircleIcon,
  CogIcon,
  BellIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

const settingsModules = [
  {
    title: 'Camp Information',
    description: 'Manage your camp details and settings',
    href: '/settings',
    icon: UserCircleIcon,
    color: 'bg-blue-500'
  },
  {
    title: 'Camp Configuration',
    description: 'Configure camp settings, timezone, and general preferences',
    href: '/settings/camp-configuration',
    icon: CogIcon,
    color: 'bg-green-500'
  },
  {
    title: 'Notifications',
    description: 'Configure notification preferences and alert settings',
    href: '/settings/notifications',
    icon: BellIcon,
    color: 'bg-orange-500'
  }
]

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      {/* Main Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
      </div>

      {/* Description */}
      <div>
        <p className="text-gray-600">Manage system settings, user preferences, and configuration</p>
      </div>

      {/* Navigation Links */}
      <div className="flex space-x-1 border-b border-gray-200">
        {settingsModules.map((module, index) => {
          const Icon = module.icon
          const isActive = module.href === '/settings/notifications'
          
          if (isActive) {
            return (
              <div key={module.href} className="bg-orange-100 text-orange-700 px-4 py-2 text-sm font-medium rounded-t-md flex items-center space-x-2">
                <Icon className="h-4 w-4" />
                <span>{module.title}</span>
              </div>
            )
          } else {
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
          }
        })}
      </div>

      {/* Page Content */}
      <div className="mb-6">
        <div className="flex items-center space-x-3">
          <BellIcon className="h-8 w-8 text-orange-500" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Notification Settings</h2>
            <p className="text-gray-600 mt-1">Configure how you receive notifications and system alerts</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Difference Explanation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <CogIcon className="h-6 w-6 text-blue-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Notification Settings vs Alert Management</h3>
              <div className="space-y-3 text-sm text-blue-800">
                <div>
                  <p className="font-medium">📱 Notification Settings (This Page):</p>
                  <p>Configure how YOU receive notifications - email preferences, push notifications, frequency settings, etc.</p>
                </div>
                <div>
                  <p className="font-medium">⚙️ Alert Management (Separate Section):</p>
                  <p>Configure automated alerts for your camp - meal reminders, event notifications, cutoff rules, etc.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <BellIcon className="h-6 w-6 text-orange-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive notifications via email</p>
              </div>
              <input type="checkbox" className="h-4 w-4 text-blue-600" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-600">Receive browser push notifications</p>
              </div>
              <input type="checkbox" className="h-4 w-4 text-blue-600" />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">SMS Notifications</p>
                <p className="text-sm text-gray-600">Receive critical alerts via SMS</p>
              </div>
              <input type="checkbox" className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Alert Management Link */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Alert Management</h3>
                <p className="text-sm text-gray-600">Configure automated alerts for your camp operations</p>
              </div>
            </div>
            <a 
              href="/alerts/alert-management" 
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Manage Alerts
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}