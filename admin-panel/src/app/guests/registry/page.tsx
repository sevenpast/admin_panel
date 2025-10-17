import GuestManagement from '@/components/guests/GuestManagement'

export default function GuestRegistryPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Guest Registry</h1>
        <p className="text-gray-600 mt-1">View all registered guests and their information</p>
      </div>
      <GuestManagement />
    </div>
  )
}
