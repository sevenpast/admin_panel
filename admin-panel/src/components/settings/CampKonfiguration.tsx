'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useToastContext } from '@/components/common/ToastProvider'
import {
  CogIcon,
  UsersIcon,
  ShieldCheckIcon,
  BellIcon,
  ClockIcon,
  GlobeAltIcon,
  CircleStackIcon,
  ArrowPathIcon,
  CloudArrowUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserCircleIcon,
  PhotoIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  QrCodeIcon,
  LinkIcon,
  ClipboardDocumentIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

interface CampSettings {
  name: string
  description: string
  image_url: string
  timezone: string
}

interface CampKonfigurationProps {
  selectedDate: string
  onDateChange: (date: string) => void
}

export default function CampKonfigurationComponent({ selectedDate, onDateChange }: CampKonfigurationProps) {
  const { success, error } = useToastContext()
  const [campSettings, setCampSettings] = useState<CampSettings>({
    name: '',
    description: '',
    image_url: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  })

  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)

  // Generate camp URL based on camp name
  const campUrl = campSettings.name ?
    `https://campflow.app/join/${campSettings.name.toLowerCase().replace(/\s+/g, '-')}` :
    'https://campflow.app/join/your-camp-name'

  // Load settings on component mount
  useEffect(() => {
    loadCampSettings()
  }, [])

  const loadCampSettings = async () => {
    try {
      setLoading(true)
      // In a real app, this would fetch from an API
      // For now, we'll use localStorage or default values
      const saved = localStorage.getItem('camp-settings')
      if (saved) {
        setCampSettings(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Error loading camp settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    try {
      setLoading(true)
      // In a real app, this would save to an API
      localStorage.setItem('camp-settings', JSON.stringify(campSettings))
      setSaved(true)
      success('Camp settings saved successfully!')
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Error saving camp settings:', err)
      error('Error saving settings')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof CampSettings, value: string | number) => {
    setCampSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(campUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Error copying URL:', err)
      error('Error copying URL')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Camp Configuration</h2>
          <p className="text-gray-600">QR Code and guest registration settings</p>
        </div>
        <div className="flex items-center space-x-4">
          {saved && (
            <div className="flex items-center text-green-600">
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">Saved!</span>
            </div>
          )}
          <button
            onClick={handleSaveSettings}
            disabled={loading}
            className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            title="Save settings"
          >
            {loading ? (
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
            ) : (
              <CloudArrowUpIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <UserCircleIcon className="h-6 w-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Camp Name *</label>
              <input
                type="text"
                value={campSettings.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Your Camp Name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={campSettings.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Describe your camp..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo/Image URL</label>
              <input
                type="url"
                value={campSettings.image_url}
                onChange={(e) => handleInputChange('image_url', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>
        </div>

        {/* Regional Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <GlobeAltIcon className="h-6 w-6 text-green-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Timezone Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
              <select
                value={campSettings.timezone}
                onChange={(e) => handleInputChange('timezone', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="America/New_York">America/New_York (EST/EDT)</option>
                <option value="America/Chicago">America/Chicago (CST/CDT)</option>
                <option value="America/Denver">America/Denver (MST/MDT)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
                <option value="America/Anchorage">America/Anchorage (AKST/AKDT)</option>
                <option value="Pacific/Honolulu">Pacific/Honolulu (HST)</option>
                <option value="Europe/London">Europe/London (GMT/BST)</option>
                <option value="Europe/Paris">Europe/Paris (CET/CEST)</option>
                <option value="Europe/Berlin">Europe/Berlin (CET/CEST)</option>
                <option value="Europe/Rome">Europe/Rome (CET/CEST)</option>
                <option value="Europe/Madrid">Europe/Madrid (CET/CEST)</option>
                <option value="Europe/Amsterdam">Europe/Amsterdam (CET/CEST)</option>
                <option value="Europe/Stockholm">Europe/Stockholm (CET/CEST)</option>
                <option value="Europe/Oslo">Europe/Oslo (CET/CEST)</option>
                <option value="Europe/Copenhagen">Europe/Copenhagen (CET/CEST)</option>
                <option value="Europe/Vienna">Europe/Vienna (CET/CEST)</option>
                <option value="Europe/Zurich">Europe/Zurich (CET/CEST)</option>
                <option value="Europe/Prague">Europe/Prague (CET/CEST)</option>
                <option value="Europe/Warsaw">Europe/Warsaw (CET/CEST)</option>
                <option value="Europe/Athens">Europe/Athens (EET/EEST)</option>
                <option value="Europe/Helsinki">Europe/Helsinki (EET/EEST)</option>
                <option value="Europe/Moscow">Europe/Moscow (MSK)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                <option value="Asia/Shanghai">Asia/Shanghai (CST)</option>
                <option value="Asia/Hong_Kong">Asia/Hong_Kong (HKT)</option>
                <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                <option value="Asia/Seoul">Asia/Seoul (KST)</option>
                <option value="Asia/Bangkok">Asia/Bangkok (ICT)</option>
                <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                <option value="Asia/Manila">Asia/Manila (PHT)</option>
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                <option value="Asia/Tehran">Asia/Tehran (IRST)</option>
                <option value="Asia/Jerusalem">Asia/Jerusalem (IST/IDT)</option>
                <option value="Africa/Cairo">Africa/Cairo (EET/EEST)</option>
                <option value="Africa/Johannesburg">Africa/Johannesburg (SAST)</option>
                <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                <option value="Africa/Casablanca">Africa/Casablanca (WET/WEST)</option>
                <option value="Australia/Sydney">Australia/Sydney (AEST/AEDT)</option>
                <option value="Australia/Melbourne">Australia/Melbourne (AEST/AEDT)</option>
                <option value="Australia/Perth">Australia/Perth (AWST)</option>
                <option value="Australia/Adelaide">Australia/Adelaide (ACST/ACDT)</option>
                <option value="Australia/Brisbane">Australia/Brisbane (AEST)</option>
                <option value="Pacific/Auckland">Pacific/Auckland (NZST/NZDT)</option>
                <option value="Pacific/Fiji">Pacific/Fiji (FJT)</option>
                <option value="Pacific/Tahiti">Pacific/Tahiti (TAHT)</option>
              </select>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <GlobeAltIcon className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Auto-detected timezone:</p>
                  <p className="text-xs mt-1">
                    Your timezone has been automatically detected as <strong>{Intl.DateTimeFormat().resolvedOptions().timeZone}</strong>. 
                    You can change it above if needed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>


      </div>


      {/* Guest Registration QR Code */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <QrCodeIcon className="h-6 w-6 text-purple-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">Guest Registration</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* QR Code Display */}
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 border-2 border-gray-300 rounded-lg mb-4">
              <div className="w-48 h-48 bg-gray-100 flex items-center justify-center rounded">
                <img 
                  src="/api/camps/qr-code?camp_id=00000000-0000-0000-0000-000000000001&format=png" 
                  alt="QR Code for Guest Registration"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling.style.display = 'block';
                  }}
                />
                <div className="text-center hidden">
                  <QrCodeIcon className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">QR Code for</p>
                  <p className="text-xs text-gray-400 break-all">{campUrl}</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 text-center">
              Guests can scan this QR code to register directly for your camp
            </p>
          </div>

          {/* Registration Link */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Guest Registration Link
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={campUrl}
                  readOnly
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-600"
                />
                <button
                  onClick={handleCopyUrl}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
                >
                  {copied ? (
                    <CheckCircleIcon className="h-4 w-4" />
                  ) : (
                    <ClipboardDocumentIcon className="h-4 w-4" />
                  )}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <LinkIcon className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">How it works:</p>
                  <ul className="mt-2 space-y-1 text-xs">
                    <li>• Guests scan the QR code or visit the link</li>
                    <li>• They will be taken directly to your camp's registration page</li>
                    <li>• After registration, they can get started immediately</li>
                    <li>• All registrations automatically appear in your guest list</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Note:</p>
                  <p className="text-xs mt-1">
                    The QR code and link are automatically updated when you change the camp name.
                    Make sure to inform your guests about any changes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
