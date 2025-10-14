'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  UserPlusIcon,
  QrCodeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'

interface CampInfo {
  id: string
  name: string
  is_active: boolean
  timezone: string
  current_guests: number
}

interface RegistrationData {
  camp_id: string
  name: string
  mobile_number: string
  instagram: string
  surf_package: boolean
  surf_level: 'beginner' | 'intermediate' | 'advanced'
  allergies: string[]
  other_allergies: string
  notes: string
}

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const campId = searchParams.get('camp_id')

  const [campInfo, setCampInfo] = useState<CampInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<RegistrationData>({
    camp_id: campId || '',
    name: '',
    mobile_number: '',
    instagram: '',
    surf_package: false,
    surf_level: 'beginner',
    allergies: [],
    other_allergies: '',
    notes: '',
  })

  const allergyOptions = [
    { value: 'vegetarian', label: 'Vegetarisch' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'gluten_free', label: 'Glutenfrei' },
    { value: 'lactose_free', label: 'Laktosefrei' },
    { value: 'nut_free', label: 'Nussfrei' },
    { value: 'halal', label: 'Halal' },
    { value: 'kosher', label: 'Koscher' }
  ]

  useEffect(() => {
    if (campId) {
      loadCampInfo(campId)
    }
  }, [campId])

  const loadCampInfo = async (campId: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/camps/register?camp_id=${campId}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load camp info')
      }

      setCampInfo(result.data.camp)
      setFormData(prev => ({ ...prev, camp_id: campId }))
    } catch (err: any) {
      console.error('Error loading camp info:', err)
      setError(err.message || 'Failed to load camp information')
    } finally {
      setLoading(false)
    }
  }

  const toggleAllergy = (allergy: string) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.includes(allergy)
        ? prev.allergies.filter(a => a !== allergy)
        : [...prev.allergies, allergy]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      setError('Bitte geben Sie Ihren Namen ein.')
      return
    }

    if (!formData.camp_id) {
      setError('Keine Camp-ID gefunden.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/camps/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed')
      }

      setSuccess(true)
    } catch (err: any) {
      console.error('Registration error:', err)
      setError(err.message || 'Registrierung fehlgeschlagen')
    } finally {
      setSubmitting(false)
    }
  }

  if (!campId) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <QrCodeIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Ungültiger Link
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Dieser Registrierungslink ist ungültig. Bitte scannen Sie den QR-Code am Camp-Eingang.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <ArrowPathIcon className="mx-auto h-12 w-12 text-blue-600 animate-spin" />
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Lädt...
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Camp-Informationen werden geladen...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <CheckCircleIcon className="mx-auto h-12 w-12 text-green-600" />
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Registrierung erfolgreich! 🎉
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Willkommen im {campInfo?.name}! Ihre Registrierung war erfolgreich.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => window.close()}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Fenster schließen
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error && !campInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-600" />
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Fehler
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                {error}
              </p>
              <div className="mt-6">
                <button
                  onClick={() => loadCampInfo(campId)}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Erneut versuchen
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <UserPlusIcon className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Camp Registrierung
          </h2>
          {campInfo && (
            <p className="mt-2 text-center text-sm text-gray-600">
              {campInfo.name} • {campInfo.current_guests} Gäste
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 p-4 border border-red-200 rounded-md bg-red-50">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Fehler</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name *
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Ihr vollständiger Name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
                Telefonnummer
              </label>
              <div className="mt-1">
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  value={formData.mobile_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, mobile_number: e.target.value }))}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="+49 123 456 7890"
                />
              </div>
            </div>

            <div>
              <label htmlFor="instagram" className="block text-sm font-medium text-gray-700">
                Instagram
              </label>
              <div className="mt-1">
                <input
                  id="instagram"
                  name="instagram"
                  type="text"
                  value={formData.instagram}
                  onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="@username"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center">
                <input
                  id="surf-package"
                  name="surf-package"
                  type="checkbox"
                  checked={formData.surf_package}
                  onChange={(e) => setFormData(prev => ({ ...prev, surf_package: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="surf-package" className="ml-2 block text-sm text-gray-900">
                  Ich möchte das Surf-Paket buchen
                </label>
              </div>
            </div>

            {formData.surf_package && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Surf-Level
                </label>
                <div className="mt-2 space-y-2">
                  {[
                    { value: 'beginner', label: 'Anfänger' },
                    { value: 'intermediate', label: 'Fortgeschritten' },
                    { value: 'advanced', label: 'Profi' }
                  ].map(({ value, label }) => (
                    <div key={value} className="flex items-center">
                      <input
                        id={`surf-level-${value}`}
                        name="surf-level"
                        type="radio"
                        value={value}
                        checked={formData.surf_level === value}
                        onChange={(e) => setFormData(prev => ({ ...prev, surf_level: e.target.value as any }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label htmlFor={`surf-level-${value}`} className="ml-2 block text-sm text-gray-900">
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Allergien & Diät
              </label>
              <div className="grid grid-cols-2 gap-2">
                {allergyOptions.map(({ value, label }) => (
                  <div key={value} className="flex items-center">
                    <input
                      id={`allergy-${value}`}
                      type="checkbox"
                      checked={formData.allergies.includes(value)}
                      onChange={() => toggleAllergy(value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`allergy-${value}`} className="ml-2 text-sm text-gray-900">
                      {label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="other-allergies" className="block text-sm font-medium text-gray-700">
                Weitere Allergien
              </label>
              <div className="mt-1">
                <input
                  id="other-allergies"
                  name="other-allergies"
                  type="text"
                  value={formData.other_allergies}
                  onChange={(e) => setFormData(prev => ({ ...prev, other_allergies: e.target.value }))}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Weitere Allergien oder Unverträglichkeiten"
                />
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notizen
              </label>
              <div className="mt-1">
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Besondere Wünsche oder Anmerkungen"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                    Registrierung...
                  </>
                ) : (
                  'Registrierung abschließen'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}