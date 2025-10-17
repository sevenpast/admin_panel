'use client'

import { useState, useEffect } from 'react'
import { useToastContext } from '@/components/common/ToastProvider'
import {
  BellIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  SpeakerWaveIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline'

interface NotificationSettings {
  email_notifications: boolean
  push_notifications: boolean
  sms_notifications: boolean
  alert_sound: boolean
  email_frequency: 'immediate' | 'daily' | 'weekly'
  push_frequency: 'immediate' | 'daily' | 'weekly'
  sms_frequency: 'immediate' | 'daily' | 'weekly'
  notification_types: {
    guest_checkin: boolean
    guest_checkout: boolean
    meal_orders: boolean
    equipment_issues: boolean
    staff_schedule: boolean
    maintenance_alerts: boolean
    system_updates: boolean
  }
}

interface BenachrichtigungProps {
  selectedDate: string
  onDateChange: (date: string) => void
}

export default function BenachrichtigungComponent({ selectedDate, onDateChange }: BenachrichtigungProps) {
  const { success, error } = useToastContext()
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false,
    alert_sound: true,
    email_frequency: 'immediate',
    push_frequency: 'immediate',
    sms_frequency: 'daily',
    notification_types: {
      guest_checkin: true,
      guest_checkout: true,
      meal_orders: true,
      equipment_issues: true,
      staff_schedule: false,
      maintenance_alerts: true,
      system_updates: false
    }
  })

  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  // Load notification settings on component mount
  useEffect(() => {
    loadNotificationSettings()
  }, [])

  const loadNotificationSettings = async () => {
    try {
      setLoading(true)
      // In a real app, this would fetch from an API
      const saved = localStorage.getItem('notification-settings')
      if (saved) {
        setNotificationSettings(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Error loading notification settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    try {
      setLoading(true)
      // In a real app, this would save to an API
      localStorage.setItem('notification-settings', JSON.stringify(notificationSettings))
      setSaved(true)
      success('Notification settings saved successfully!')
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Error saving notification settings:', err)
      error('Error saving settings')
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = (field: keyof NotificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handleNotificationTypeToggle = (type: keyof NotificationSettings['notification_types']) => {
    setNotificationSettings(prev => ({
      ...prev,
      notification_types: {
        ...prev.notification_types,
        [type]: !prev.notification_types[type]
      }
    }))
  }

  const handleFrequencyChange = (field: 'email_frequency' | 'push_frequency' | 'sms_frequency', value: 'immediate' | 'daily' | 'weekly') => {
    setNotificationSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Benachrichtigungen</h2>
          <p className="text-gray-600">Konfigurieren Sie Ihre Benachrichtigungseinstellungen</p>
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
        {/* Notification Channels */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <BellIcon className="h-6 w-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Benachrichtigungskanäle</h3>
          </div>
          
          <div className="space-y-6">
            {/* Email Notifications */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <EnvelopeIcon className="h-6 w-6 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">E-Mail Benachrichtigungen</p>
                  <p className="text-xs text-gray-500">Erhalten Sie Benachrichtigungen per E-Mail</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.email_notifications}
                  onChange={() => handleToggle('email_notifications')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {notificationSettings.email_notifications && (
              <div className="ml-9">
                <label className="block text-sm font-medium text-gray-700 mb-2">E-Mail Häufigkeit</label>
                <select
                  value={notificationSettings.email_frequency}
                  onChange={(e) => handleFrequencyChange('email_frequency', e.target.value as any)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="immediate">Sofort</option>
                  <option value="daily">Täglich</option>
                  <option value="weekly">Wöchentlich</option>
                </select>
              </div>
            )}

            {/* Push Notifications */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <DevicePhoneMobileIcon className="h-6 w-6 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Push Benachrichtigungen</p>
                  <p className="text-xs text-gray-500">Erhalten Sie Push-Benachrichtigungen auf Ihrem Gerät</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.push_notifications}
                  onChange={() => handleToggle('push_notifications')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {notificationSettings.push_notifications && (
              <div className="ml-9">
                <label className="block text-sm font-medium text-gray-700 mb-2">Push Häufigkeit</label>
                <select
                  value={notificationSettings.push_frequency}
                  onChange={(e) => handleFrequencyChange('push_frequency', e.target.value as any)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="immediate">Sofort</option>
                  <option value="daily">Täglich</option>
                  <option value="weekly">Wöchentlich</option>
                </select>
              </div>
            )}

            {/* SMS Notifications */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <DevicePhoneMobileIcon className="h-6 w-6 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">SMS Benachrichtigungen</p>
                  <p className="text-xs text-gray-500">Erhalten Sie wichtige Benachrichtigungen per SMS</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.sms_notifications}
                  onChange={() => handleToggle('sms_notifications')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {notificationSettings.sms_notifications && (
              <div className="ml-9">
                <label className="block text-sm font-medium text-gray-700 mb-2">SMS Häufigkeit</label>
                <select
                  value={notificationSettings.sms_frequency}
                  onChange={(e) => handleFrequencyChange('sms_frequency', e.target.value as any)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="immediate">Sofort</option>
                  <option value="daily">Täglich</option>
                  <option value="weekly">Wöchentlich</option>
                </select>
              </div>
            )}

            {/* Alert Sound */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <SpeakerWaveIcon className="h-6 w-6 text-orange-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Benachrichtigungston</p>
                  <p className="text-xs text-gray-500">Spielen Sie einen Ton bei neuen Benachrichtigungen</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.alert_sound}
                  onChange={() => handleToggle('alert_sound')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Notification Types */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <BellIcon className="h-6 w-6 text-green-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Benachrichtigungstypen</h3>
          </div>
          
          <div className="space-y-4">
            {Object.entries(notificationSettings.notification_types).map(([key, value]) => {
              const labels: Record<string, { title: string; description: string }> = {
                guest_checkin: { title: 'Gast Check-in', description: 'Benachrichtigung bei Gästeanmeldung' },
                guest_checkout: { title: 'Gast Check-out', description: 'Benachrichtigung bei Gästeabreise' },
                meal_orders: { title: 'Mahlzeitenbestellungen', description: 'Benachrichtigung bei neuen Bestellungen' },
                equipment_issues: { title: 'Ausrüstungsprobleme', description: 'Benachrichtigung bei Ausrüstungsproblemen' },
                staff_schedule: { title: 'Personalplanung', description: 'Benachrichtigung bei Schichtänderungen' },
                maintenance_alerts: { title: 'Wartungsalarme', description: 'Benachrichtigung bei Wartungsbedarf' },
                system_updates: { title: 'System-Updates', description: 'Benachrichtigung bei Systemaktualisierungen' }
              }

              return (
                <div key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{labels[key]?.title}</p>
                    <p className="text-xs text-gray-500">{labels[key]?.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() => handleNotificationTypeToggle(key as keyof NotificationSettings['notification_types'])}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Test Notifications */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <BellIcon className="h-6 w-6 text-orange-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">Test Benachrichtigungen</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <EnvelopeIcon className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium">Test E-Mail</span>
          </button>
          
          <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <DevicePhoneMobileIcon className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-sm font-medium">Test Push</span>
          </button>
          
          <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <SpeakerWaveIcon className="h-5 w-5 text-orange-600 mr-2" />
            <span className="text-sm font-medium">Test Ton</span>
          </button>
        </div>
      </div>
    </div>
  )
}
