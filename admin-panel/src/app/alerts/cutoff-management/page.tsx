import { ClockIcon } from '@heroicons/react/24/outline'

export default function CutoffManagementPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center space-x-3">
          <ClockIcon className="h-8 w-8 text-orange-500" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cutoff Management</h1>
            <p className="text-gray-600 mt-1">Manage booking cutoffs and time-based restrictions</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Cutoff Management</h3>
          <p className="text-gray-500">This feature is coming soon. You'll be able to manage booking cutoffs and time-based restrictions here.</p>
        </div>
      </div>
    </div>
  )
}