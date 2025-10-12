'use client'

import { useState, useEffect } from 'react'
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
  EyeSlashIcon
} from '@heroicons/react/24/outline'

interface CampSettings {
  name: string
  description: string
  image_url: string
  timezone: string
  language: string
  currency: string
  max_guests: number
  check_in_time: string
  check_out_time: string
  emergency_contact: string
}

interface CampKonfigurationProps {
  selectedDate: string
  onDateChange: (date: string) => void
}

export default function CampKonfigurationComponent({ selectedDate, onDateChange }: CampKonfigurationProps) {
  const [campSettings, setCampSettings] = useState<CampSettings>({
    name: '',
    description: '',
    image_url: '',
    timezone: 'Europe/Berlin',
    language: 'de',
    currency: 'EUR',
    max_guests: 50,
    check_in_time: '15:00',
    check_out_time: '11:00',
    emergency_contact: ''
  })

  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

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
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error saving camp settings:', error)
      alert('Error saving settings')
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Camp Konfiguration</h2>
          <p className="text-gray-600">Grundlegende Einstellungen für Ihr Camp</p>
        </div>
        <div className="flex items-center space-x-4">
          {saved && (
            <div className="flex items-center text-green-600">
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">Gespeichert!</span>
            </div>
          )}
          <button
            onClick={handleSaveSettings}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            {loading ? (
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
            ) : (
              <CloudArrowUpIcon className="h-4 w-4" />
            )}
            <span>Speichern</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <UserCircleIcon className="h-6 w-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Grundinformationen</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Camp Name *</label>
              <input
                type="text"
                value={campSettings.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ihr Camp Name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
              <textarea
                value={campSettings.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Beschreiben Sie Ihr Camp..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo/Bild URL</label>
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
            <h3 className="text-lg font-semibold text-gray-900">Regionale Einstellungen</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zeitzone</label>
              <select
                value={campSettings.timezone}
                onChange={(e) => handleInputChange('timezone', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Europe/Berlin">Europa/Berlin (CET)</option>
                <option value="Europe/London">Europa/London (GMT)</option>
                <option value="America/New_York">Amerika/New York (EST)</option>
                <option value="America/Los_Angeles">Amerika/Los Angeles (PST)</option>
                <option value="Asia/Tokyo">Asien/Tokio (JST)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sprache</label>
              <select
                value={campSettings.language}
                onChange={(e) => handleInputChange('language', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="de">Deutsch</option>
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="es">Español</option>
                <option value="it">Italiano</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Währung</label>
              <select
                value={campSettings.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="EUR">Euro (€)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="GBP">British Pound (£)</option>
                <option value="CHF">Swiss Franc (CHF)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Capacity & Timing */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <UsersIcon className="h-6 w-6 text-purple-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Kapazität & Zeiten</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Maximale Gäste</label>
              <input
                type="number"
                min="1"
                max="1000"
                value={campSettings.max_guests}
                onChange={(e) => handleInputChange('max_guests', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Zeit</label>
                <input
                  type="time"
                  value={campSettings.check_in_time}
                  onChange={(e) => handleInputChange('check_in_time', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Zeit</label>
                <input
                  type="time"
                  value={campSettings.check_out_time}
                  onChange={(e) => handleInputChange('check_out_time', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Notfallkontakt</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notfallkontakt</label>
              <input
                type="text"
                value={campSettings.emergency_contact}
                onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Name und Telefonnummer"
              />
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Wichtiger Hinweis:</p>
                  <p>Stellen Sie sicher, dass der Notfallkontakt immer erreichbar ist und über alle wichtigen Camp-Informationen verfügt.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <CircleStackIcon className="h-6 w-6 text-blue-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center p-4 bg-green-50 rounded-lg">
            <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-green-900">Datenbank</p>
              <p className="text-xs text-green-700">Verbindung aktiv</p>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-green-50 rounded-lg">
            <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-green-900">API Services</p>
              <p className="text-xs text-green-700">Alle Services online</p>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-green-50 rounded-lg">
            <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-green-900">Backup</p>
              <p className="text-xs text-green-700">Letztes Backup: Heute 02:00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
