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

interface UserSettings {
  name: string
  email: string
  current_password: string
  new_password: string
  confirm_password: string
  staff_password: string
  confirm_staff_password: string
}

interface BenutzerProfilProps {
  selectedDate: string
  onDateChange: (date: string) => void
}

export default function BenutzerProfilComponent({ selectedDate, onDateChange }: BenutzerProfilProps) {
  const [userSettings, setUserSettings] = useState<UserSettings>({
    name: '',
    email: '',
    current_password: '',
    new_password: '',
    confirm_password: '',
    staff_password: '',
    confirm_staff_password: ''
  })

  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
    staff: false,
    staffConfirm: false
  })

  // Load user settings on component mount
  useEffect(() => {
    loadUserSettings()
  }, [])

  const loadUserSettings = async () => {
    try {
      setLoading(true)
      // In a real app, this would fetch from an API
      const saved = localStorage.getItem('user-settings')
      if (saved) {
        const parsed = JSON.parse(saved)
        setUserSettings(prev => ({
          ...prev,
          name: parsed.name || '',
          email: parsed.email || ''
        }))
      }
    } catch (error) {
      console.error('Error loading user settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      setLoading(true)
      // In a real app, this would save to an API
      localStorage.setItem('user-settings', JSON.stringify({
        name: userSettings.name,
        email: userSettings.email
      }))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error saving user settings:', error)
      alert('Error saving settings')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (userSettings.new_password !== userSettings.confirm_password) {
      alert('New passwords do not match')
      return
    }

    try {
      setLoading(true)
      // In a real app, this would change the password via API
      alert('Password changed successfully!')
      setUserSettings(prev => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_password: ''
      }))
    } catch (error) {
      console.error('Error changing password:', error)
      alert('Error changing password')
    } finally {
      setLoading(false)
    }
  }

  const handleChangeStaffPassword = async () => {
    if (userSettings.staff_password !== userSettings.confirm_staff_password) {
      alert('Staff passwords do not match')
      return
    }

    try {
      setLoading(true)
      // In a real app, this would change the staff password via API
      alert('Staff password changed successfully!')
      setUserSettings(prev => ({
        ...prev,
        staff_password: '',
        confirm_staff_password: ''
      }))
    } catch (error) {
      console.error('Error changing staff password:', error)
      alert('Error changing staff password')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof UserSettings, value: string) => {
    setUserSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Benutzer Profil</h2>
          <p className="text-gray-600">Verwalten Sie Ihr persönliches Profil und Passwörter</p>
        </div>
        <div className="flex items-center space-x-4">
          {saved && (
            <div className="flex items-center text-green-600">
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">Gespeichert!</span>
            </div>
          )}
          <button
            onClick={handleSaveProfile}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            {loading ? (
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
            ) : (
              <CloudArrowUpIcon className="h-4 w-4" />
            )}
            <span>Profil Speichern</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <UserCircleIcon className="h-6 w-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Persönliche Informationen</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vollständiger Name *</label>
              <input
                type="text"
                value={userSettings.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ihr vollständiger Name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail Adresse *</label>
              <input
                type="email"
                value={userSettings.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="ihre.email@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profilbild</label>
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <PhotoIcon className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 text-sm">
                    Bild hochladen
                  </button>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG bis 2MB</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Security */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <ShieldCheckIcon className="h-6 w-6 text-green-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Kontosicherheit</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Aktuelles Passwort</label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={userSettings.current_password}
                  onChange={(e) => handleInputChange('current_password', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Aktuelles Passwort"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPasswords.current ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Neues Passwort</label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={userSettings.new_password}
                  onChange={(e) => handleInputChange('new_password', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Neues Passwort"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPasswords.new ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Passwort bestätigen</label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={userSettings.confirm_password}
                  onChange={(e) => handleInputChange('confirm_password', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Passwort bestätigen"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPasswords.confirm ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            
            <button
              onClick={handleChangePassword}
              disabled={loading || !userSettings.current_password || !userSettings.new_password || !userSettings.confirm_password}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <KeyIcon className="h-4 w-4" />
              <span>Passwort ändern</span>
            </button>
          </div>
        </div>

        {/* Staff Access */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <UsersIcon className="h-6 w-6 text-purple-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Staff-Zugang</h3>
          </div>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <ShieldCheckIcon className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Staff-Passwort</p>
                  <p>Dieses Passwort wird für den Staff-Zugang zu bestimmten Funktionen verwendet.</p>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Neues Staff-Passwort</label>
              <div className="relative">
                <input
                  type={showPasswords.staff ? 'text' : 'password'}
                  value={userSettings.staff_password}
                  onChange={(e) => handleInputChange('staff_password', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Neues Staff-Passwort"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('staff')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPasswords.staff ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Staff-Passwort bestätigen</label>
              <div className="relative">
                <input
                  type={showPasswords.staffConfirm ? 'text' : 'password'}
                  value={userSettings.confirm_staff_password}
                  onChange={(e) => handleInputChange('confirm_staff_password', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Staff-Passwort bestätigen"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('staffConfirm')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPasswords.staffConfirm ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            
            <button
              onClick={handleChangeStaffPassword}
              disabled={loading || !userSettings.staff_password || !userSettings.confirm_staff_password}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <UsersIcon className="h-4 w-4" />
              <span>Staff-Passwort ändern</span>
            </button>
          </div>
        </div>

        {/* Account Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Kontostatus</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-900">Konto aktiv</p>
                  <p className="text-xs text-green-700">Ihr Konto ist vollständig aktiviert</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <ShieldCheckIcon className="h-6 w-6 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Zwei-Faktor-Authentifizierung</p>
                  <p className="text-xs text-blue-700">Nicht aktiviert</p>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Aktivieren
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <ClockIcon className="h-6 w-6 text-gray-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Letzte Anmeldung</p>
                  <p className="text-xs text-gray-700">Heute, 14:30</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
