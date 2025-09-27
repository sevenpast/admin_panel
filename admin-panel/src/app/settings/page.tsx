'use client'

import { useState } from 'react'
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

interface UserSettings {
  name: string
  email: string
  current_password: string
  new_password: string
  confirm_password: string
  staff_password: string
  confirm_staff_password: string
}

interface NotificationSettings {
  email_notifications: boolean
  push_notifications: boolean
  sms_notifications: boolean
  alert_sound: boolean
  daily_summary: boolean
  weekly_reports: boolean
}

interface IntegrationSettings {
  supabase_url: string
  supabase_anon_key: string
  firebase_config: string
  email_provider: string
  sms_provider: string
}

const mockCampSettings: CampSettings = {
  name: 'Demo Camp',
  description: 'Ein wunderschönes Surfcamp an der Atlantikküste mit modernen Einrichtungen und professionellen Surflehrern. Wir bieten unvergessliche Erlebnisse für Anfänger und Fortgeschrittene.',
  image_url: '',
  timezone: 'Europe/Berlin',
  language: 'de',
  currency: 'EUR',
  max_guests: 50,
  check_in_time: '14:00',
  check_out_time: '11:00',
  emergency_contact: '+49 123 456 7890'
}

const mockUserSettings: UserSettings = {
  name: 'Admin User',
  email: 'admin@demo-camp.com',
  current_password: '',
  new_password: '',
  confirm_password: '',
  staff_password: '',
  confirm_staff_password: ''
}

const mockNotificationSettings: NotificationSettings = {
  email_notifications: true,
  push_notifications: true,
  sms_notifications: false,
  alert_sound: true,
  daily_summary: true,
  weekly_reports: false
}

const mockIntegrationSettings: IntegrationSettings = {
  supabase_url: 'https://your-project.supabase.co',
  supabase_anon_key: 'eyJhbGci...',
  firebase_config: '{"apiKey": "...", "authDomain": "..."}',
  email_provider: 'sendgrid',
  sms_provider: 'twilio'
}

const timezones = [
  { value: 'Europe/Berlin', label: 'Europe/Berlin (CET/CEST)' },
  { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
  { value: 'America/New_York', label: 'America/New_York (EST/EDT)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST/PDT)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST/AEDT)' }
]

const languages = [
  { value: 'de', label: 'Deutsch' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' }
]

const currencies = [
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'GBP', label: 'British Pound (£)' },
  { value: 'CHF', label: 'Swiss Franc (CHF)' }
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'camp' | 'user' | 'notifications' | 'users' | 'integrations' | 'maintenance'>('camp')
  const [campSettings, setCampSettings] = useState<CampSettings>(mockCampSettings)
  const [userSettings, setUserSettings] = useState<UserSettings>(mockUserSettings)
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(mockNotificationSettings)
  const [integrationSettings, setIntegrationSettings] = useState<IntegrationSettings>(mockIntegrationSettings)
  const [isSaving, setIsSaving] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showStaffPassword, setShowStaffPassword] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)

  const handleSaveCampSettings = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      alert('Camp-Einstellungen erfolgreich gespeichert!')
    }, 1000)
  }

  const handleSaveNotificationSettings = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      alert('Benachrichtigungs-Einstellungen erfolgreich gespeichert!')
    }, 1000)
  }

  const handleSaveUserSettings = () => {
    if (userSettings.new_password && userSettings.new_password !== userSettings.confirm_password) {
      alert('Die neuen Passwörter stimmen nicht überein!')
      return
    }
    if (userSettings.staff_password && userSettings.staff_password !== userSettings.confirm_staff_password) {
      alert('Die Staff-Passwörter stimmen nicht überein!')
      return
    }
    if (userSettings.new_password && userSettings.new_password.length < 8) {
      alert('Das neue Passwort muss mindestens 8 Zeichen lang sein!')
      return
    }

    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      alert('Benutzer-Einstellungen erfolgreich gespeichert!')
      setUserSettings({
        ...userSettings,
        current_password: '',
        new_password: '',
        confirm_password: '',
        staff_password: '',
        confirm_staff_password: ''
      })
    }, 1000)
  }

  const handleSaveIntegrationSettings = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      alert('Integrations-Einstellungen erfolgreich gespeichert!')
    }, 1000)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Die Datei ist zu groß. Maximale Größe: 5MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        alert('Bitte wählen Sie eine gültige Bilddatei.')
        return
      }
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setCampSettings({
          ...campSettings,
          image_url: e.target?.result as string
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleBackupDatabase = () => {
    alert('Datenbank-Backup wurde gestartet. Sie erhalten eine E-Mail wenn das Backup abgeschlossen ist.')
  }

  const handleCleanupData = () => {
    if (confirm('Sind Sie sicher, dass Sie alte Daten bereinigen möchten? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      alert('Datenbereinigung wurde gestartet. Abgeschlossene Jobs und Deliveries älter als 30 Tage werden entfernt.')
    }
  }

  const tabs = [
    { id: 'camp', label: 'Camp Konfiguration', icon: CogIcon },
    { id: 'user', label: 'Benutzer-Profil', icon: UserCircleIcon },
    { id: 'notifications', label: 'Benachrichtigungen', icon: BellIcon },
    { id: 'users', label: 'Benutzer & Rechte', icon: UsersIcon },
    { id: 'integrations', label: 'Integrationen', icon: GlobeAltIcon },
    { id: 'maintenance', label: 'Wartung', icon: CircleStackIcon }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Einstellungen</h1>
        <p className="text-gray-600 mt-1">Camp-Konfiguration und Systemeinstellungen</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const IconComponent = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <IconComponent className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Camp Configuration */}
        {activeTab === 'camp' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Camp Konfiguration</h3>
              <button
                onClick={handleSaveCampSettings}
                disabled={isSaving}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {isSaving ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <CheckCircleIcon className="h-4 w-4" />}
                <span>{isSaving ? 'Speichern...' : 'Speichern'}</span>
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Camp Name
                  </label>
                  <input
                    type="text"
                    value={campSettings.name}
                    onChange={(e) => setCampSettings({...campSettings, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zeitzone
                  </label>
                  <select
                    value={campSettings.timezone}
                    onChange={(e) => setCampSettings({...campSettings, timezone: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {timezones.map(tz => (
                      <option key={tz.value} value={tz.value}>{tz.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Camp Beschreibung
                </label>
                <textarea
                  value={campSettings.description}
                  onChange={(e) => setCampSettings({...campSettings, description: e.target.value})}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Beschreiben Sie Ihr Camp, die Aktivitäten und besonderen Eigenschaften..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Camp Bild
                </label>
                <div className="flex items-center space-x-4">
                  {campSettings.image_url && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-300">
                      <img
                        src={campSettings.image_url}
                        alt="Camp"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="camp-image-upload"
                    />
                    <label
                      htmlFor="camp-image-upload"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      <PhotoIcon className="h-5 w-5 mr-2" />
                      Bild hochladen
                    </label>
                    <p className="text-xs text-gray-500 mt-1">Max. 5MB, JPG/PNG</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sprache
                  </label>
                  <select
                    value={campSettings.language}
                    onChange={(e) => setCampSettings({...campSettings, language: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {languages.map(lang => (
                      <option key={lang.value} value={lang.value}>{lang.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Währung
                  </label>
                  <select
                    value={campSettings.currency}
                    onChange={(e) => setCampSettings({...campSettings, currency: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {currencies.map(curr => (
                      <option key={curr.value} value={curr.value}>{curr.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximale Gästeanzahl
                  </label>
                  <input
                    type="number"
                    value={campSettings.max_guests}
                    onChange={(e) => setCampSettings({...campSettings, max_guests: parseInt(e.target.value)})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-in Zeit
                  </label>
                  <input
                    type="time"
                    value={campSettings.check_in_time}
                    onChange={(e) => setCampSettings({...campSettings, check_in_time: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-out Zeit
                  </label>
                  <input
                    type="time"
                    value={campSettings.check_out_time}
                    onChange={(e) => setCampSettings({...campSettings, check_out_time: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notfall-Kontakt
                  </label>
                  <input
                    type="tel"
                    value={campSettings.emergency_contact}
                    onChange={(e) => setCampSettings({...campSettings, emergency_contact: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Settings */}
        {activeTab === 'user' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Benutzer-Profil</h3>
              <button
                onClick={handleSaveUserSettings}
                disabled={isSaving}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {isSaving ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <CheckCircleIcon className="h-4 w-4" />}
                <span>{isSaving ? 'Speichern...' : 'Speichern'}</span>
              </button>
            </div>

            <div className="space-y-6">
              {/* Profile Information */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Profil Informationen</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={userSettings.name}
                      onChange={(e) => setUserSettings({...userSettings, name: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      E-Mail Adresse
                    </label>
                    <input
                      type="email"
                      value={userSettings.email}
                      onChange={(e) => setUserSettings({...userSettings, email: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Password Change */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Passwort ändern</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aktuelles Passwort
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={userSettings.current_password}
                        onChange={(e) => setUserSettings({...userSettings, current_password: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Geben Sie Ihr aktuelles Passwort ein"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showCurrentPassword ? <EyeSlashIcon className="h-5 w-5 text-gray-400" /> : <EyeIcon className="h-5 w-5 text-gray-400" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Neues Passwort
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={userSettings.new_password}
                          onChange={(e) => setUserSettings({...userSettings, new_password: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Mindestens 8 Zeichen"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showNewPassword ? <EyeSlashIcon className="h-5 w-5 text-gray-400" /> : <EyeIcon className="h-5 w-5 text-gray-400" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Neues Passwort bestätigen
                      </label>
                      <input
                        type="password"
                        value={userSettings.confirm_password}
                        onChange={(e) => setUserSettings({...userSettings, confirm_password: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Passwort wiederholen"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Staff Password */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Staff Passwort festlegen</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Legen Sie ein separates Passwort für Staff-Mitglieder fest, um Zugang zu bestimmten Funktionen zu gewähren.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Staff Passwort
                    </label>
                    <div className="relative">
                      <input
                        type={showStaffPassword ? "text" : "password"}
                        value={userSettings.staff_password}
                        onChange={(e) => setUserSettings({...userSettings, staff_password: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Mindestens 8 Zeichen"
                      />
                      <button
                        type="button"
                        onClick={() => setShowStaffPassword(!showStaffPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showStaffPassword ? <EyeSlashIcon className="h-5 w-5 text-gray-400" /> : <EyeIcon className="h-5 w-5 text-gray-400" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Staff Passwort bestätigen
                    </label>
                    <input
                      type="password"
                      value={userSettings.confirm_staff_password}
                      onChange={(e) => setUserSettings({...userSettings, confirm_staff_password: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Staff Passwort wiederholen"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Benachrichtigungseinstellungen</h3>
              <button
                onClick={handleSaveNotificationSettings}
                disabled={isSaving}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {isSaving ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <CheckCircleIcon className="h-4 w-4" />}
                <span>{isSaving ? 'Speichern...' : 'Speichern'}</span>
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">Benachrichtigungskanäle</h4>

                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900">E-Mail Benachrichtigungen</p>
                    <p className="text-sm text-gray-600">Erhalten Sie E-Mails für wichtige Ereignisse</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.email_notifications}
                      onChange={(e) => setNotificationSettings({...notificationSettings, email_notifications: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900">Push Benachrichtigungen</p>
                    <p className="text-sm text-gray-600">Browser-Benachrichtigungen für sofortige Updates</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.push_notifications}
                      onChange={(e) => setNotificationSettings({...notificationSettings, push_notifications: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900">SMS Benachrichtigungen</p>
                    <p className="text-sm text-gray-600">Textnachrichten für kritische Alarme</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.sms_notifications}
                      onChange={(e) => setNotificationSettings({...notificationSettings, sms_notifications: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900">Alarm-Töne</p>
                    <p className="text-sm text-gray-600">Akustische Signale für neue Benachrichtigungen</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.alert_sound}
                      onChange={(e) => setNotificationSettings({...notificationSettings, alert_sound: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">Berichte</h4>

                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900">Tägliche Zusammenfassung</p>
                    <p className="text-sm text-gray-600">Täglicher Bericht über Camp-Aktivitäten</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.daily_summary}
                      onChange={(e) => setNotificationSettings({...notificationSettings, daily_summary: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-900">Wöchentliche Berichte</p>
                    <p className="text-sm text-gray-600">Detaillierte wöchentliche Analytics und Trends</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.weekly_reports}
                      onChange={(e) => setNotificationSettings({...notificationSettings, weekly_reports: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Management */}
        {activeTab === 'users' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Benutzer & Rechte</h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2">
                <UsersIcon className="h-4 w-4" />
                <span>Benutzer hinzufügen</span>
              </button>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Benutzerverwaltung wird implementiert
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Die vollständige Benutzerverwaltung mit Rollen und Berechtigungen wird in einer zukünftigen Version verfügbar sein.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">AD</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Admin User</p>
                      <p className="text-sm text-gray-600">admin@demo-camp.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Administrator
                    </span>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      Aktiv
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">ST</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Staff Member</p>
                      <p className="text-sm text-gray-600">staff@demo-camp.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                      Staff
                    </span>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      Aktiv
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Integration Settings */}
        {activeTab === 'integrations' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Integrationseinstellungen</h3>
              <button
                onClick={handleSaveIntegrationSettings}
                disabled={isSaving}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {isSaving ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <CheckCircleIcon className="h-4 w-4" />}
                <span>{isSaving ? 'Speichern...' : 'Speichern'}</span>
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Supabase Konfiguration</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Supabase URL
                    </label>
                    <input
                      type="url"
                      value={integrationSettings.supabase_url}
                      onChange={(e) => setIntegrationSettings({...integrationSettings, supabase_url: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://your-project.supabase.co"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Supabase Anon Key
                    </label>
                    <input
                      type="password"
                      value={integrationSettings.supabase_anon_key}
                      onChange={(e) => setIntegrationSettings({...integrationSettings, supabase_anon_key: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="eyJhbGci..."
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Firebase Konfiguration</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Firebase Config JSON
                  </label>
                  <textarea
                    value={integrationSettings.firebase_config}
                    onChange={(e) => setIntegrationSettings({...integrationSettings, firebase_config: e.target.value})}
                    rows={6}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder='{"apiKey": "...", "authDomain": "...", "projectId": "..."}'
                  />
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Benachrichtigungsanbieter</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      E-Mail Anbieter
                    </label>
                    <select
                      value={integrationSettings.email_provider}
                      onChange={(e) => setIntegrationSettings({...integrationSettings, email_provider: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="sendgrid">SendGrid</option>
                      <option value="mailgun">Mailgun</option>
                      <option value="ses">Amazon SES</option>
                      <option value="smtp">SMTP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMS Anbieter
                    </label>
                    <select
                      value={integrationSettings.sms_provider}
                      onChange={(e) => setIntegrationSettings({...integrationSettings, sms_provider: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="twilio">Twilio</option>
                      <option value="vonage">Vonage</option>
                      <option value="aws-sns">AWS SNS</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Maintenance */}
        {activeTab === 'maintenance' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Wartung & Tools</h3>

            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-md font-medium text-gray-900">Datenbank Backup</h4>
                    <p className="text-sm text-gray-600 mt-1">Erstellen Sie ein vollständiges Backup aller Camp-Daten</p>
                  </div>
                  <button
                    onClick={handleBackupDatabase}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2"
                  >
                    <CloudArrowUpIcon className="h-4 w-4" />
                    <span>Backup starten</span>
                  </button>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-md font-medium text-gray-900">Datenbereinigung</h4>
                    <p className="text-sm text-gray-600 mt-1">Entfernen Sie alte Automation Jobs und Deliveries (älter als 30 Tage)</p>
                  </div>
                  <button
                    onClick={handleCleanupData}
                    className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 flex items-center space-x-2"
                  >
                    <ArrowPathIcon className="h-4 w-4" />
                    <span>Bereinigung starten</span>
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">System Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Version:</span>
                    <span className="ml-2 text-gray-600">CampFlow 2.0.0</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Letzte Aktualisierung:</span>
                    <span className="ml-2 text-gray-600">27.09.2025</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Datenbank:</span>
                    <span className="ml-2 text-gray-600">PostgreSQL 15</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Framework:</span>
                    <span className="ml-2 text-gray-600">Next.js 15.5.4</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}