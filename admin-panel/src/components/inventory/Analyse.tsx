'use client'

import { useState, useEffect } from 'react'
import {
  ChartBarIcon,
  CubeIcon,
  HomeIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon
} from '@heroicons/react/24/outline'

interface InventoryStats {
  totalRooms: number
  totalBeds: number
  occupiedBeds: number
  availableBeds: number
  totalEquipment: number
  availableEquipment: number
  assignedEquipment: number
  maintenanceEquipment: number
  occupancyRate: number
  equipmentUtilization: number
}

interface TrendData {
  date: string
  occupancy: number
  equipmentUsage: number
}

interface AnalyseProps {
  selectedDate: string
  onDateChange: (date: string) => void
}

export default function AnalyseComponent({ selectedDate, onDateChange }: AnalyseProps) {
  const [stats, setStats] = useState<InventoryStats>({
    totalRooms: 0,
    totalBeds: 0,
    occupiedBeds: 0,
    availableBeds: 0,
    totalEquipment: 0,
    availableEquipment: 0,
    assignedEquipment: 0,
    maintenanceEquipment: 0,
    occupancyRate: 0,
    equipmentUtilization: 0
  })

  const [trendData, setTrendData] = useState<TrendData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    loadAnalyticsData()
  }, [selectedDate, selectedPeriod])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      
      // Load bed and room data
      const [bedsResponse, roomsResponse, equipmentResponse] = await Promise.all([
        fetch('/api/beds'),
        fetch('/api/rooms'),
        fetch('/api/equipment')
      ])

      const beds = (await bedsResponse.json()).data || []
      const rooms = (await roomsResponse.json()).data || []
      const equipment = (await equipmentResponse.json()).data || []

      // Calculate statistics
      const totalBeds = beds.filter((bed: any) => bed.is_active).length
      const occupiedBeds = beds.filter((bed: any) => bed.is_active && bed.current_occupancy > 0).length
      const availableBeds = totalBeds - occupiedBeds
      const totalRooms = rooms.filter((room: any) => room.is_active).length

      const totalEquipment = equipment.filter((item: any) => item.is_active).length
      const availableEquipment = equipment.filter((item: any) => item.is_active && item.status === 'available').length
      const assignedEquipment = equipment.filter((item: any) => item.is_active && item.status === 'assigned').length
      const maintenanceEquipment = equipment.filter((item: any) => item.is_active && item.status === 'maintenance').length

      const occupancyRate = totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0
      const equipmentUtilization = totalEquipment > 0 ? (assignedEquipment / totalEquipment) * 100 : 0

      setStats({
        totalRooms,
        totalBeds,
        occupiedBeds,
        availableBeds,
        totalEquipment,
        availableEquipment,
        assignedEquipment,
        maintenanceEquipment,
        occupancyRate,
        equipmentUtilization
      })

      // Generate mock trend data
      generateTrendData()

    } catch (error) {
      console.error('Error loading analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateTrendData = () => {
    const days = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90
    const data: TrendData[] = []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      data.push({
        date: date.toISOString().split('T')[0],
        occupancy: Math.random() * 100,
        equipmentUsage: Math.random() * 100
      })
    }
    
    setTrendData(data)
  }

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
    if (current < previous) return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
    return <MinusIcon className="h-4 w-4 text-gray-500" />
  }

  const getStatusColor = (rate: number) => {
    if (rate >= 80) return 'text-red-600 bg-red-100'
    if (rate >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-green-600 bg-green-100'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory Analyse</h2>
          <p className="text-gray-600">Übersicht und Trends Ihrer Inventar-Nutzung</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">Letzte 7 Tage</option>
            <option value="30d">Letzte 30 Tage</option>
            <option value="90d">Letzte 90 Tage</option>
          </select>
          
          <button
            onClick={loadAnalyticsData}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <ChartBarIcon className="h-4 w-4" />
            <span>Aktualisieren</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Occupancy Rate */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Auslastung</p>
              <p className="text-2xl font-bold text-gray-900">{stats.occupancyRate.toFixed(1)}%</p>
            </div>
            <div className={`p-3 rounded-full ${getStatusColor(stats.occupancyRate)}`}>
              <HomeIcon className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {getTrendIcon(stats.occupancyRate, 75)}
            <span className="text-sm text-gray-500 ml-2">vs. letzte Woche</span>
          </div>
        </div>

        {/* Equipment Utilization */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Equipment Nutzung</p>
              <p className="text-2xl font-bold text-gray-900">{stats.equipmentUtilization.toFixed(1)}%</p>
            </div>
            <div className={`p-3 rounded-full ${getStatusColor(stats.equipmentUtilization)}`}>
              <CubeIcon className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {getTrendIcon(stats.equipmentUtilization, 60)}
            <span className="text-sm text-gray-500 ml-2">vs. letzte Woche</span>
          </div>
        </div>

        {/* Total Beds */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Betten</p>
              <p className="text-2xl font-bold text-gray-900">{stats.occupiedBeds}/{stats.totalBeds}</p>
              <p className="text-xs text-gray-500">belegt/gesamt</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <UserGroupIcon className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${stats.occupancyRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Equipment Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Equipment</p>
              <p className="text-2xl font-bold text-gray-900">{stats.assignedEquipment}/{stats.totalEquipment}</p>
              <p className="text-xs text-gray-500">zugewiesen/gesamt</p>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <CheckCircleIcon className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${stats.equipmentUtilization}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bed Statistics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <HomeIcon className="h-6 w-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Betten Übersicht</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-900">Verfügbar</span>
              </div>
              <span className="text-lg font-bold text-green-600">{stats.availableBeds}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <UserGroupIcon className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-900">Belegt</span>
              </div>
              <span className="text-lg font-bold text-blue-600">{stats.occupiedBeds}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <HomeIcon className="h-5 w-5 text-gray-600 mr-2" />
                <span className="text-sm font-medium text-gray-900">Gesamt</span>
              </div>
              <span className="text-lg font-bold text-gray-600">{stats.totalBeds}</span>
            </div>
          </div>
        </div>

        {/* Equipment Statistics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <CubeIcon className="h-6 w-6 text-green-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Equipment Übersicht</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-900">Verfügbar</span>
              </div>
              <span className="text-lg font-bold text-green-600">{stats.availableEquipment}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <UserGroupIcon className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-900">Zugewiesen</span>
              </div>
              <span className="text-lg font-bold text-blue-600">{stats.assignedEquipment}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="text-sm font-medium text-yellow-900">Wartung</span>
              </div>
              <span className="text-lg font-bold text-yellow-600">{stats.maintenanceEquipment}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <CubeIcon className="h-5 w-5 text-gray-600 mr-2" />
                <span className="text-sm font-medium text-gray-900">Gesamt</span>
              </div>
              <span className="text-lg font-bold text-gray-600">{stats.totalEquipment}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trends Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <ChartBarIcon className="h-6 w-6 text-purple-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">Trends ({selectedPeriod})</h3>
        </div>
        
        <div className="h-64 flex items-end justify-between space-x-2">
          {trendData.map((data, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="w-full flex flex-col items-center space-y-1">
                <div 
                  className="w-full bg-blue-500 rounded-t"
                  style={{ height: `${(data.occupancy / 100) * 200}px` }}
                  title={`Auslastung: ${data.occupancy.toFixed(1)}%`}
                ></div>
                <div 
                  className="w-full bg-green-500 rounded-b"
                  style={{ height: `${(data.equipmentUsage / 100) * 200}px` }}
                  title={`Equipment: ${data.equipmentUsage.toFixed(1)}%`}
                ></div>
              </div>
              <span className="text-xs text-gray-500 mt-2">
                {new Date(data.date).toLocaleDateString('de-DE', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center space-x-6 mt-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Auslastung</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Equipment Nutzung</span>
          </div>
        </div>
      </div>

      {/* Alerts and Recommendations */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <ExclamationTriangleIcon className="h-6 w-6 text-orange-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">Empfehlungen</h3>
        </div>
        
        <div className="space-y-3">
          {stats.occupancyRate > 90 && (
            <div className="flex items-start p-3 bg-red-50 border border-red-200 rounded-lg">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">Hohe Auslastung</p>
                <p className="text-xs text-red-700">Die Bettenauslastung liegt bei {stats.occupancyRate.toFixed(1)}%. Erwägen Sie zusätzliche Betten.</p>
              </div>
            </div>
          )}
          
          {stats.equipmentUtilization < 30 && (
            <div className="flex items-start p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <ClockIcon className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-900">Niedrige Equipment Nutzung</p>
                <p className="text-xs text-yellow-700">Die Equipment-Nutzung liegt bei {stats.equipmentUtilization.toFixed(1)}%. Überprüfen Sie die Verfügbarkeit.</p>
              </div>
            </div>
          )}
          
          {stats.maintenanceEquipment > 0 && (
            <div className="flex items-start p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <ExclamationTriangleIcon className="h-5 w-5 text-orange-600 mr-2 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-900">Wartungsbedarf</p>
                <p className="text-xs text-orange-700">{stats.maintenanceEquipment} Equipment-Items benötigen Wartung.</p>
              </div>
            </div>
          )}
          
          {stats.occupancyRate <= 90 && stats.equipmentUtilization >= 30 && stats.maintenanceEquipment === 0 && (
            <div className="flex items-start p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900">Alles im grünen Bereich</p>
                <p className="text-xs text-green-700">Ihr Inventar ist optimal ausgelastet und alle Items sind einsatzbereit.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
