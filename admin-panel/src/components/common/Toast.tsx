'use client'

import { useState, useEffect } from 'react'
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'

export interface ToastProps {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
  duration?: number
  onClose: (id: string) => void
}

export default function Toast({ id, type, message, duration = 4000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose(id), 300) // Wait for animation
    }, duration)

    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose(id), 300)
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      case 'info':
        return <CheckCircleIcon className="h-5 w-5 text-blue-500" />
      default:
        return <CheckCircleIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'info':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800'
      case 'error':
        return 'text-red-800'
      case 'info':
        return 'text-blue-800'
      default:
        return 'text-gray-800'
    }
  }

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`rounded-lg border p-4 shadow-lg ${getBackgroundColor()}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 flex-1">
            <p className={`text-sm font-medium ${getTextColor()}`}>
              {message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={handleClose}
              className={`inline-flex rounded-md p-1.5 hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                type === 'success' ? 'text-green-500 hover:bg-green-500 focus:ring-green-500' :
                type === 'error' ? 'text-red-500 hover:bg-red-500 focus:ring-red-500' :
                type === 'info' ? 'text-blue-500 hover:bg-blue-500 focus:ring-blue-500' :
                'text-gray-500 hover:bg-gray-500 focus:ring-gray-500'
              }`}
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Toast Manager Hook
export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const addToast = (type: 'success' | 'error' | 'info', message: string, duration?: number) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: ToastProps = {
      id,
      type,
      message,
      duration,
      onClose: removeToast
    }
    setToasts(prev => [...prev, newToast])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const success = (message: string, duration?: number) => addToast('success', message, duration)
  const error = (message: string, duration?: number) => addToast('error', message, duration)
  const info = (message: string, duration?: number) => addToast('info', message, duration)

  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  )

  return {
    success,
    error,
    info,
    ToastContainer
  }
}
