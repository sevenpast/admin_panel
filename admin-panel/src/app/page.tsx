'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  UsersIcon,
  AcademicCapIcon,
  CakeIcon,
  CalendarIcon,
  UserGroupIcon,
  CubeIcon,
  ClockIcon,
  BellIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline'
import { databaseService } from '@/lib/database-service'

interface DashboardStats {
  guests: {
    total: number
    inHouse: number
    surfPackage: number
    surfPackagePercentage: number
  }
  lessons: {
    today: number
    beginnerCount: number
    intermediateCount: number
    advancedCount: number
  }
  meals: {
    ordersToday: number
    meatCount: number
    vegetarianCount: number
    veganCount: number
    otherCount: number
  }
  events: {
    today: number
    totalAttendance: number
  }
  staff: {
    active: number
  }
  inventory: {
    bedsOccupied: number
    bedsTotal: number
    occupancyPercentage: number
    roomsCount: number
  }
  shifts: {
    today: number
  }
}

const dashboardCards = [
  {
    title: 'Guests',
    href: '/guests',
    icon: UsersIcon,
    color: 'bg-blue-500',
    getData: (stats: DashboardStats) => [
      `${stats.guests.inHouse} in house`,
      `${stats.guests.surfPackage} surf package`,
      `${stats.guests.surfPackagePercentage}% with surf package`
    ]
  },
  {
    title: 'Lessons',
    href: '/lessons',
    icon: AcademicCapIcon,
    color: 'bg-green-500',
    getData: (stats: DashboardStats) => [
      `${stats.lessons.today} lessons today`,
      `Beginner: ${stats.lessons.beginnerCount}`,
      `Intermediate: ${stats.lessons.intermediateCount}`,
      `Advanced: ${stats.lessons.advancedCount}`
    ]
  },
  {
    title: 'Meals',
    href: '/meals',
    icon: CakeIcon,
    color: 'bg-orange-500',
    getData: (stats: DashboardStats) => [
      `${stats.meals.ordersToday} orders today`,
      `Meat: ${stats.meals.meatCount}`,
      `Vegetarian: ${stats.meals.vegetarianCount}`,
      `Vegan: ${stats.meals.veganCount}`
    ]
  },
  {
    title: 'Events',
    href: '/events',
    icon: CalendarIcon,
    color: 'bg-purple-500',
    getData: (stats: DashboardStats) => [
      `${stats.events.today} activities today`,
      `${stats.events.totalAttendance} total attendance`
    ]
  },
  {
    title: 'Staff',
    href: '/staff',
    icon: UserGroupIcon,
    color: 'bg-indigo-500',
    getData: (stats: DashboardStats) => [
      `${stats.staff.active} active staff`
    ]
  },
  {
    title: 'Inventory',
    href: '/inventory',
    icon: CubeIcon,
    color: 'bg-pink-500',
    getData: (stats: DashboardStats) => [
      `${stats.inventory.bedsOccupied}/${stats.inventory.bedsTotal} beds occupied`,
      `${stats.inventory.roomsCount} rooms`,
      `${stats.inventory.occupancyPercentage}% occupancy`
    ]
  },
  {
    title: 'Shifts',
    href: '/shifts',
    icon: ClockIcon,
    color: 'bg-yellow-500',
    getData: (stats: DashboardStats) => [
      `${stats.shifts.today} shifts today`
    ]
  },
  {
    title: 'Alert Management',
    href: '/alerts',
    icon: BellIcon,
    color: 'bg-red-500',
    getData: () => [
      'Configuration info',
      'Automation rules'
    ]
  },
  {
    title: 'Calendar',
    href: '/calendar',
    icon: DocumentChartBarIcon,
    color: 'bg-teal-500',
    getData: () => [
      'Overview info',
      'Weekly activities'
    ]
  }
]

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    guests: { total: 0, inHouse: 0, surfPackage: 0, surfPackagePercentage: 0 },
    lessons: { today: 0, beginnerCount: 0, intermediateCount: 0, advancedCount: 0 },
    meals: { ordersToday: 0, meatCount: 0, vegetarianCount: 0, veganCount: 0, otherCount: 0 },
    events: { today: 0, totalAttendance: 0 },
    staff: { active: 0 },
    inventory: { bedsOccupied: 0, bedsTotal: 0, occupancyPercentage: 0, roomsCount: 0 },
    shifts: { today: 0 }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    try {
      const realStats = await databaseService.getDashboardStats()
      setStats(realStats)
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
      // Fallback to empty stats if database fails
      setStats({
        guests: { total: 0, inHouse: 0, surfPackage: 0, surfPackagePercentage: 0 },
        lessons: { today: 0, beginnerCount: 0, intermediateCount: 0, advancedCount: 0 },
        meals: { ordersToday: 0, meatCount: 0, vegetarianCount: 0, veganCount: 0, otherCount: 0 },
        events: { today: 0, totalAttendance: 0 },
        staff: { active: 0 },
        inventory: { bedsOccupied: 0, bedsTotal: 0, occupancyPercentage: 0, roomsCount: 0 },
        shifts: { today: 0 }
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to CampFlow Admin Panel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardCards.map((card) => {
          const CardIcon = card.icon
          const cardData = card.getData(stats)

          return (
            <Link
              key={card.title}
              href={card.href}
              className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className={`${card.color} p-3 rounded-lg`}>
                    <CardIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {card.title}
                    </h3>
                  </div>
                </div>

                <div className="mt-4 space-y-1">
                  {cardData.map((data, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      {data}
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}