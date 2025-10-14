'use client'

import { useState, useEffect } from 'react'
import { QrCodeIcon, DocumentDuplicateIcon, ArrowDownTrayIcon, CheckIcon } from '@heroicons/react/24/outline'

interface QRCodeDisplayProps {
  campId?: string
  campName?: string
  className?: string
}

interface QRCodeData {
  camp_id: string
  camp_name: string
  registration_url: string
  qr_code_data_url: string
  download_url: string
}

export default function QRCodeDisplay({ campId, campName, className = '' }: QRCodeDisplayProps) {
  const [qrData, setQrData] = useState<QRCodeData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Use demo camp ID if none provided
  const defaultCampId = '00000000-0000-0000-0000-000000000001'
  const activeCampId = campId || defaultCampId

  useEffect(() => {
    generateQRCode()
  }, [activeCampId])

  const generateQRCode = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/camps/qr-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          camp_id: activeCampId,
          size: 512,
          format: 'png'
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        const errorMessage = result.error?.message || result.error || 'Failed to generate QR code'
        throw new Error(errorMessage)
      }

      setQrData(result.data)
    } catch (err: any) {
      console.error('Error generating QR code:', err)
      setError(err.message || 'Failed to generate QR code')
    } finally {
      setLoading(false)
    }
  }

  const copyRegistrationUrl = async () => {
    if (!qrData?.registration_url) return

    try {
      await navigator.clipboard.writeText(qrData.registration_url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }

  const downloadQRCode = async (format: 'png' | 'svg' = 'png') => {
    if (!qrData?.camp_id) return

    try {
      const response = await fetch(`/api/camps/qr-code?camp_id=${qrData.camp_id}&format=${format}`)

      if (!response.ok) {
        throw new Error('Failed to download QR code')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `camp-${qrData.camp_id}-qr.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error downloading QR code:', err)
    }
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">QR-Code wird generiert...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg border border-red-200 p-6 ${className}`}>
        <div className="text-center">
          <QrCodeIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={generateQRCode}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    )
  }

  if (!qrData) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center">
          <QrCodeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Kein QR-Code verfügbar</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Camp Registrierungs QR-Code
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          {qrData.camp_name || campName || 'Demo Camp'}
        </p>

        {/* QR Code Image */}
        <div className="inline-block p-4 bg-white border border-gray-300 rounded-lg shadow-sm mb-6">
          <img
            src={qrData.qr_code_data_url}
            alt="Camp Registration QR Code"
            className="w-64 h-64 mx-auto"
          />
        </div>

        {/* Registration URL */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Registrierungs-URL
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={qrData.registration_url}
              readOnly
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-sm"
            />
            <button
              onClick={copyRegistrationUrl}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              title="URL kopieren"
            >
              {copied ? (
                <CheckIcon className="h-4 w-4 text-green-600" />
              ) : (
                <DocumentDuplicateIcon className="h-4 w-4" />
              )}
            </button>
          </div>
          {copied && (
            <p className="text-xs text-green-600 mt-1">URL erfolgreich kopiert!</p>
          )}
        </div>

        {/* Download Buttons */}
        <div className="flex justify-center space-x-3">
          <button
            onClick={() => downloadQRCode('png')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            PNG herunterladen
          </button>
          <button
            onClick={() => downloadQRCode('svg')}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm font-medium"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            SVG herunterladen
          </button>
        </div>

        {/* Usage Instructions */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Verwendung:</h4>
          <ul className="text-xs text-blue-700 space-y-1 text-left">
            <li>• Drucken Sie den QR-Code aus und platzieren Sie ihn am Camp-Eingang</li>
            <li>• Gäste können den Code mit ihrer Smartphone-Kamera scannen</li>
            <li>• Sie werden automatisch zur Registrierungsseite weitergeleitet</li>
            <li>• Nach der Registrierung erscheinen sie sofort in der Gästeliste</li>
          </ul>
        </div>
      </div>
    </div>
  )
}