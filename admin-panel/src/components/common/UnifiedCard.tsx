'use client'

import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  RectangleStackIcon,
  GlobeAltIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'

interface UnifiedCardProps {
  id: string
  title: string
  subtitle?: string
  description?: string
  status: 'draft' | 'published'
  category?: string
  date?: string
  time?: string
  participants?: string
  color?: string
  onView: (id: string) => void
  onEdit: (id: string) => void
  onPublish: (id: string) => void
  onUnpublish: (id: string) => void
  onCopy: (id: string) => void
  onTemplate: (id: string) => void
  onDelete: (id: string) => void
}

export default function UnifiedCard({
  id,
  title,
  subtitle,
  description,
  status,
  category,
  date,
  time,
  participants,
  color = '#3B82F6',
  onView,
  onEdit,
  onPublish,
  onUnpublish,
  onCopy,
  onTemplate,
  onDelete
}: UnifiedCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="mb-1">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {title}
              </h3>
            </div>
            {subtitle && (
              <p className="text-xs text-gray-600 truncate">{subtitle}</p>
            )}
          </div>
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            status === 'published' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {description}
          </p>
        )}

        {/* Details */}
        <div className="space-y-2 text-xs text-gray-500">
          {category && (
            <div className="flex items-center space-x-1">
              <span className="font-medium">Category:</span>
              <span className="capitalize">{category}</span>
            </div>
          )}
          {date && (
            <div className="flex items-center space-x-1">
              <span className="font-medium">Date:</span>
              <span>{date}</span>
            </div>
          )}
          {time && (
            <div className="flex items-center space-x-1">
              <span className="font-medium">Time:</span>
              <span>{time}</span>
            </div>
          )}
          {participants && (
            <div className="flex items-center space-x-1">
              <span className="font-medium">Participants:</span>
              <span>{participants}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {/* View */}
            <button
              onClick={() => onView(id)}
              className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="View"
            >
              <EyeIcon className="h-4 w-4" />
            </button>

            {/* Edit */}
            <button
              onClick={() => onEdit(id)}
              className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
              title="Edit"
            >
              <PencilIcon className="h-4 w-4" />
            </button>

            {/* Publish/Unpublish */}
            {status === 'published' ? (
              <button
                onClick={() => onUnpublish(id)}
                className="p-1.5 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors"
                title="Unpublish"
              >
                <EyeSlashIcon className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => onPublish(id)}
                className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                title="Publish"
              >
                <GlobeAltIcon className="h-4 w-4" />
              </button>
            )}

            {/* Copy */}
            <button
              onClick={() => onCopy(id)}
              className="p-1.5 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
              title="Copy"
            >
              <DocumentDuplicateIcon className="h-4 w-4" />
            </button>

            {/* Template */}
            <button
              onClick={() => onTemplate(id)}
              className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
              title="Save as Template"
            >
              <RectangleStackIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Delete */}
          <button
            onClick={() => onDelete(id)}
            className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
