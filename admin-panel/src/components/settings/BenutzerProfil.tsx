'use client'

import { useState, useEffect } from 'react'
import { useToastContext } from '@/components/common/ToastProvider'
import {
  CogIcon,
  GlobeAltIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  UserCircleIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'

interface CampSettings {
  name: string
  description: string
  image_url: string
  timezone: string
}

interface LogoUpload {
  file: File | null
  preview: string | null
}

interface BenutzerProfilProps {
  selectedDate: string
  onDateChange: (date: string) => void
}

export default function BenutzerProfilComponent({ selectedDate, onDateChange }: BenutzerProfilProps) {
  const { success, error } = useToastContext()
  const [campSettings, setCampSettings] = useState<CampSettings>({
    name: '',
    description: '',
    image_url: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  })

  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [logoUpload, setLogoUpload] = useState<LogoUpload>({
    file: null,
    preview: null
  })

  // Load settings on component mount
  useEffect(() => {
    loadCampSettings()
  }, [])

  const loadCampSettings = async () => {
    try {
      setLoading(true)
      // In a real app, this would fetch from an API
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

  const handleInputChange = (field: keyof CampSettings, value: string) => {
    setCampSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        error('Please select an image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        error('File size must be less than 5MB')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoUpload({
          file,
          preview: e.target?.result as string
        })
        setCampSettings(prev => ({
          ...prev,
          image_url: e.target?.result as string
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removeLogo = () => {
    setLogoUpload({
      file: null,
      preview: null
    })
    setCampSettings(prev => ({
      ...prev,
      image_url: ''
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Camp Information</h2>
          <p className="text-gray-600">Manage your camp details and settings</p>
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
            <CloudArrowUpIcon className="h-5 w-5" />
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Camp Logo</label>
              
              {/* Logo Preview */}
              {logoUpload.preview && (
                <div className="mb-4">
                  <div className="relative inline-block">
                    <img
                      src={logoUpload.preview}
                      alt="Camp Logo Preview"
                      className="h-20 w-20 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      onClick={removeLogo}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      title="Remove logo"
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
              
              {/* Upload Button */}
              <div className="flex items-center space-x-4">
                <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2">
                  <PhotoIcon className="h-4 w-4" />
                  <span>{logoUpload.preview ? 'Change Logo' : 'Upload Logo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
                {!logoUpload.preview && (
                  <span className="text-sm text-gray-500">JPG, PNG up to 5MB</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Timezone Settings */}
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
    </div>
  )
}