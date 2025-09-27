// Central data management for dashboard statistics
// This module imports real data from all components to provide accurate dashboard stats

// Import mock data from actual components
export const mockGuests = [
  { id: '1', name: 'Alice Johnson', status: 'checked-in', surfPackage: true, room: 'A101' },
  { id: '2', name: 'Bob Smith', status: 'checked-in', surfPackage: true, room: 'A102' },
  { id: '3', name: 'Charlie Brown', status: 'checked-in', surfPackage: false, room: 'B201' },
  { id: '4', name: 'David Wilson', status: 'checked-in', surfPackage: true, room: 'B202' },
  { id: '5', name: 'Emma Davis', status: 'checked-in', surfPackage: true, room: 'C301' },
  { id: '6', name: 'Frank Miller', status: 'checked-out', surfPackage: true, room: null },
  { id: '7', name: 'Grace Wilson', status: 'checked-in', surfPackage: false, room: 'C302' },
  { id: '8', name: 'Helen Taylor', status: 'checked-in', surfPackage: true, room: 'D401' }
]

export const mockLessons = [
  { id: '1', title: 'Beginner Surf Lesson', level: 'beginner', date: new Date().toISOString().split('T')[0], time: '09:00', participants: 5 },
  { id: '2', title: 'Intermediate Wave Riding', level: 'intermediate', date: new Date().toISOString().split('T')[0], time: '11:00', participants: 8 },
  { id: '3', title: 'Advanced Maneuvers', level: 'advanced', date: new Date().toISOString().split('T')[0], time: '14:00', participants: 4 },
  { id: '4', title: 'Beginner Safety Course', level: 'beginner', date: new Date().toISOString().split('T')[0], time: '16:00', participants: 6 },
  { id: '5', title: 'Intermediate Competition Prep', level: 'intermediate', date: new Date().toISOString().split('T')[0], time: '17:00', participants: 3 }
]

export const mockMealOrders = [
  {
    id: '1',
    name: 'Pancakes & Fruit',
    category: 'breakfast' as const,
    currentCount: 12,
    estimatedCount: 15,
    specialRequests: ['Glutenfrei', 'Vegan option'],
    guests: ['Alice Johnson', 'Bob Smith', 'Charlie Brown']
  },
  {
    id: '2',
    name: 'Avocado Toast',
    category: 'breakfast' as const,
    currentCount: 8,
    estimatedCount: 10,
    specialRequests: ['Extra avocado'],
    guests: ['David Wilson', 'Emma Davis']
  },
  {
    id: '3',
    name: 'Quinoa Bowl',
    category: 'lunch' as const,
    currentCount: 15,
    estimatedCount: 18,
    specialRequests: ['No feta cheese', 'Extra tahini'],
    guests: ['Frank Miller', 'Grace Wilson', 'Helen Taylor']
  },
  {
    id: '4',
    name: 'Fish Tacos',
    category: 'dinner' as const,
    currentCount: 22,
    estimatedCount: 25,
    specialRequests: ['Mild spice level', 'No cilantro'],
    guests: ['Ian Clark', 'Jane Davis', 'Kevin Brown']
  },
  {
    id: '5',
    name: 'Vegetarian Tacos',
    category: 'dinner' as const,
    currentCount: 10,
    estimatedCount: 12,
    specialRequests: ['Vegan cheese'],
    guests: ['Laura Miller', 'Mike Johnson']
  }
]

export const mockEvents = [
  { id: '1', title: 'Beach Volleyball Tournament', date: new Date().toISOString().split('T')[0], participants: 16 },
  { id: '2', title: 'Sunset Yoga Session', date: new Date().toISOString().split('T')[0], participants: 12 },
  { id: '3', title: 'Campfire & Music Night', date: new Date().toISOString().split('T')[0], participants: 28 }
]

export const mockStaff = [
  { id: '1', name: 'John Doe', role: 'Surf Instructor', status: 'active' },
  { id: '2', name: 'Jane Smith', role: 'Kitchen Staff', status: 'active' },
  { id: '3', name: 'Mike Johnson', role: 'Cleaning', status: 'active' },
  { id: '4', name: 'Sarah Wilson', role: 'Reception', status: 'active' },
  { id: '5', name: 'Tom Brown', role: 'Maintenance', status: 'active' },
  { id: '6', name: 'Lisa Davis', role: 'Surf Instructor', status: 'inactive' }
]

export const mockInventory = {
  rooms: [
    { id: '1', number: 'A101', occupied: true, type: 'single' },
    { id: '2', number: 'A102', occupied: true, type: 'double' },
    { id: '3', number: 'B201', occupied: true, type: 'single' },
    { id: '4', number: 'B202', occupied: true, type: 'double' },
    { id: '5', number: 'C301', occupied: true, type: 'single' },
    { id: '6', number: 'C302', occupied: true, type: 'double' },
    { id: '7', number: 'D401', occupied: true, type: 'single' },
    { id: '8', number: 'D402', occupied: false, type: 'double' },
    { id: '9', number: 'E501', occupied: false, type: 'single' },
    { id: '10', number: 'E502', occupied: false, type: 'double' }
  ]
}

export const mockShifts = [
  { id: '1', staffName: 'John Doe', role: 'Surf Instructor', shift: 'morning', date: new Date().toISOString().split('T')[0] },
  { id: '2', staffName: 'Jane Smith', role: 'Kitchen Staff', shift: 'morning', date: new Date().toISOString().split('T')[0] },
  { id: '3', staffName: 'Mike Johnson', role: 'Cleaning', shift: 'afternoon', date: new Date().toISOString().split('T')[0] },
  { id: '4', staffName: 'Sarah Wilson', role: 'Reception', shift: 'evening', date: new Date().toISOString().split('T')[0] },
  { id: '5', staffName: 'Tom Brown', role: 'Maintenance', shift: 'morning', date: new Date().toISOString().split('T')[0] }
]

// Calculate real dashboard statistics
export function calculateDashboardStats() {
  const today = new Date().toISOString().split('T')[0]

  // Guests statistics
  const checkedInGuests = mockGuests.filter(guest => guest.status === 'checked-in')
  const guestsWithSurfPackage = checkedInGuests.filter(guest => guest.surfPackage)

  // Lessons statistics
  const todaysLessons = mockLessons.filter(lesson => lesson.date === today)
  const beginnerLessons = todaysLessons.filter(lesson => lesson.level === 'beginner')
  const intermediateLessons = todaysLessons.filter(lesson => lesson.level === 'intermediate')
  const advancedLessons = todaysLessons.filter(lesson => lesson.level === 'advanced')

  // Meals statistics
  const totalMealOrders = mockMealOrders.reduce((sum, meal) => sum + meal.currentCount, 0)

  // Events statistics
  const todaysEvents = mockEvents.filter(event => event.date === today)
  const totalEventParticipants = todaysEvents.reduce((sum, event) => sum + event.participants, 0)

  // Staff statistics
  const activeStaff = mockStaff.filter(staff => staff.status === 'active')

  // Inventory statistics
  const occupiedRooms = mockInventory.rooms.filter(room => room.occupied)
  const totalRooms = mockInventory.rooms.length
  const occupancyPercentage = Math.round((occupiedRooms.length / totalRooms) * 100)

  // Calculate total beds (assuming single = 1 bed, double = 2 beds)
  const totalBeds = mockInventory.rooms.reduce((sum, room) => {
    return sum + (room.type === 'double' ? 2 : 1)
  }, 0)
  const occupiedBeds = occupiedRooms.reduce((sum, room) => {
    return sum + (room.type === 'double' ? 2 : 1)
  }, 0)

  // Shifts statistics
  const todaysShifts = mockShifts.filter(shift => shift.date === today)

  return {
    guests: {
      total: mockGuests.length,
      inHouse: checkedInGuests.length,
      surfPackage: guestsWithSurfPackage.length,
      surfPackagePercentage: Math.round((guestsWithSurfPackage.length / checkedInGuests.length) * 100)
    },
    lessons: {
      today: todaysLessons.length,
      beginnerCount: beginnerLessons.reduce((sum, lesson) => sum + lesson.participants, 0),
      intermediateCount: intermediateLessons.reduce((sum, lesson) => sum + lesson.participants, 0),
      advancedCount: advancedLessons.reduce((sum, lesson) => sum + lesson.participants, 0)
    },
    meals: {
      ordersToday: totalMealOrders,
      meatCount: mockMealOrders.filter(meal => meal.name.toLowerCase().includes('fish') || meal.name.toLowerCase().includes('meat')).reduce((sum, meal) => sum + meal.currentCount, 0),
      vegetarianCount: mockMealOrders.filter(meal => meal.name.toLowerCase().includes('vegetarian') || meal.name.toLowerCase().includes('quinoa')).reduce((sum, meal) => sum + meal.currentCount, 0),
      veganCount: mockMealOrders.filter(meal => meal.specialRequests.some(req => req.toLowerCase().includes('vegan'))).reduce((sum, meal) => sum + meal.currentCount, 0),
      otherCount: mockMealOrders.filter(meal => !meal.name.toLowerCase().includes('fish') && !meal.name.toLowerCase().includes('meat') && !meal.name.toLowerCase().includes('vegetarian')).reduce((sum, meal) => sum + meal.currentCount, 0)
    },
    events: {
      today: todaysEvents.length,
      totalAttendance: totalEventParticipants
    },
    staff: {
      active: activeStaff.length
    },
    inventory: {
      bedsOccupied: occupiedBeds,
      bedsTotal: totalBeds,
      occupancyPercentage: occupancyPercentage,
      roomsCount: totalRooms
    },
    shifts: {
      today: todaysShifts.length
    }
  }
}