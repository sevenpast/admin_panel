# CampFlow 2.0 - API Übersicht

## 🔗 API Architektur

CampFlow 2.0 verwendet Next.js 15 App Router mit Server Actions und Supabase als Backend-as-a-Service. Die API-Struktur folgt RESTful Prinzipien und unterstützt Echtzeit-Updates.

## 🛠️ Technologie-Stack

### Backend
- **Framework**: Next.js 15 App Router
- **Datenbank**: PostgreSQL via Supabase
- **ORM**: Supabase Client
- **Authentifizierung**: Supabase Auth
- **Echtzeit**: Supabase Realtime

### Frontend-Backend Integration
- **Server Actions**: Für Formulare und Mutationen
- **Route Handlers**: Für externe API-Zugriffe
- **Server Components**: Für Daten-Fetching
- **Client Components**: Für Interaktivität

## 📡 API Endpoints

### 🏠 System & Health
```typescript
GET /api/health
// System Health Check
Response: {
  status: 'healthy' | 'degraded' | 'down',
  timestamp: string,
  version: string,
  database: 'connected' | 'disconnected'
}
```

### 👥 Gäste-Management

#### Gäste abrufen
```typescript
GET /api/guests
Query Parameters:
  - status?: 'checked_in' | 'checked_out' | 'reserved'
  - room?: string
  - limit?: number
  - offset?: number

Response: {
  guests: Guest[],
  total: number,
  hasMore: boolean
}
```

#### Gast erstellen
```typescript
POST /api/guests
Body: {
  firstName: string,
  lastName: string,
  email: string,
  phone?: string,
  checkInDate: string,
  checkOutDate: string,
  roomNumber?: string
}

Response: {
  guest: Guest,
  message: string
}
```

#### Gast Check-In
```typescript
POST /api/guests/[id]/checkin
Body: {
  roomNumber: string,
  checkInNotes?: string
}

Response: {
  guest: Guest,
  room: Room,
  message: string
}
```

#### Gast Check-Out
```typescript
POST /api/guests/[id]/checkout
Body: {
  checkOutNotes?: string,
  finalAmount?: number
}

Response: {
  guest: Guest,
  invoice: Invoice,
  message: string
}
```

### 🏄‍♂️ Surf-Unterricht

#### Stunden abrufen
```typescript
GET /api/surf-lessons
Query Parameters:
  - date?: string (YYYY-MM-DD)
  - instructor?: string
  - skillLevel?: 'beginner' | 'intermediate' | 'advanced'

Response: {
  lessons: SurfLesson[],
  total: number
}
```

#### Stunde erstellen
```typescript
POST /api/surf-lessons
Body: {
  title: string,
  instructorId: string,
  startTime: string,
  endTime: string,
  maxParticipants: number,
  skillLevel: string,
  price: number
}

Response: {
  lesson: SurfLesson,
  message: string
}
```

#### Teilnehmer hinzufügen
```typescript
POST /api/surf-lessons/[id]/participants
Body: {
  guestId: string,
  notes?: string
}

Response: {
  participant: SurfParticipant,
  lesson: SurfLesson,
  message: string
}
```

### 🍽️ Mahlzeiten-Management

#### Mahlzeiten abrufen
```typescript
GET /api/meals
Query Parameters:
  - date?: string (YYYY-MM-DD)
  - mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  - status?: 'planned' | 'preparing' | 'ready' | 'served'

Response: {
  meals: Meal[],
  total: number
}
```

#### Mahlzeit erstellen
```typescript
POST /api/meals
Body: {
  name: string,
  description: string,
  mealType: string,
  servingDate: string,
  servingTime: string,
  maxPortions: number,
  price: number,
  ingredients: string[],
  allergens: string[]
}

Response: {
  meal: Meal,
  message: string
}
```

#### Mahlzeit buchen
```typescript
POST /api/meals/[id]/bookings
Body: {
  guestId: string,
  portions: number,
  specialRequests?: string
}

Response: {
  booking: MealBooking,
  meal: Meal,
  message: string
}
```

### 👨‍💼 Personal-Management

#### Mitarbeiter abrufen
```typescript
GET /api/staff
Query Parameters:
  - department?: string
  - status?: 'active' | 'inactive' | 'on_leave'
  - role?: string

Response: {
  staff: StaffMember[],
  total: number
}
```

#### Schichten abrufen
```typescript
GET /api/shifts
Query Parameters:
  - staffId?: string
  - date?: string (YYYY-MM-DD)
  - week?: string (YYYY-WW)

Response: {
  shifts: Shift[],
  total: number
}
```

#### Schicht erstellen
```typescript
POST /api/shifts
Body: {
  staffId: string,
  shiftDate: string,
  startTime: string,
  endTime: string,
  position: string,
  notes?: string
}

Response: {
  shift: Shift,
  message: string
}
```

### 📦 Inventar-Management

#### Inventar abrufen
```typescript
GET /api/inventory
Query Parameters:
  - category?: string
  - status?: 'available' | 'in_use' | 'maintenance' | 'retired'
  - location?: string

Response: {
  items: InventoryItem[],
  total: number
}
```

#### Ausrüstung ausleihen
```typescript
POST /api/inventory/[id]/rent
Body: {
  guestId: string,
  dueBack: string,
  depositAmount: number,
  rentalFee: number
}

Response: {
  rental: EquipmentRental,
  item: InventoryItem,
  message: string
}
```

### 📅 Events & Kalender

#### Events abrufen
```typescript
GET /api/events
Query Parameters:
  - startDate?: string
  - endDate?: string
  - eventType?: string
  - status?: 'planned' | 'active' | 'completed' | 'cancelled'

Response: {
  events: Event[],
  total: number
}
```

#### Kalender-Daten
```typescript
GET /api/calendar
Query Parameters:
  - month: string (YYYY-MM)
  - view?: 'month' | 'week' | 'day'

Response: {
  events: CalendarEvent[],
  lessons: CalendarLesson[],
  shifts: CalendarShift[],
  bookings: CalendarBooking[]
}
```

### 🚨 Benachrichtigungen

#### Alerts abrufen
```typescript
GET /api/alerts
Query Parameters:
  - unreadOnly?: boolean
  - priority?: 'low' | 'medium' | 'high' | 'critical'
  - type?: string

Response: {
  alerts: Alert[],
  unreadCount: number
}
```

#### Alert als gelesen markieren
```typescript
PUT /api/alerts/[id]/read

Response: {
  alert: Alert,
  message: string
}
```

### 📊 Reports & Analytics

#### Dashboard-Statistiken
```typescript
GET /api/dashboard/stats

Response: {
  guestStats: {
    checkedIn: number,
    checkingOutToday: number,
    totalReservations: number
  },
  lessonStats: {
    todayLessons: number,
    weeklyBookings: number,
    averageOccupancy: number
  },
  revenueStats: {
    todayRevenue: number,
    weeklyRevenue: number,
    monthlyRevenue: number
  }
}
```

#### Finanzberichte
```typescript
GET /api/reports/financial
Query Parameters:
  - startDate: string
  - endDate: string
  - groupBy?: 'day' | 'week' | 'month'

Response: {
  revenue: RevenueReport[],
  expenses: ExpenseReport[],
  summary: FinancialSummary
}
```

## 🔐 Authentifizierung & Autorisierung

### Auth Headers
```typescript
// Für alle geschützten Endpoints
Headers: {
  'Authorization': 'Bearer <supabase_jwt_token>',
  'Content-Type': 'application/json'
}
```

### Rollen-basierte Zugriffskontrolle
```typescript
// Rollen-Hierarchie
type UserRole =
  | 'super_admin'    // Vollzugriff
  | 'camp_manager'   // Management-Funktionen
  | 'receptionist'   // Gäste- und Buchungsmanagement
  | 'instructor'     // Surf-Stunden Management
  | 'kitchen_staff'  // Mahlzeiten Management
  | 'staff'          // Basis-Zugriff

// Endpoint-Permissions
const permissions = {
  '/api/guests': ['super_admin', 'camp_manager', 'receptionist'],
  '/api/staff': ['super_admin', 'camp_manager'],
  '/api/meals': ['super_admin', 'camp_manager', 'kitchen_staff'],
  '/api/surf-lessons': ['super_admin', 'camp_manager', 'instructor']
}
```

## 📡 Echtzeit-Updates

### Supabase Realtime Channels
```typescript
// Gäste-Updates abonnieren
const channel = supabase
  .channel('guests_changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'guests'
  }, (payload) => {
    // Handle real-time updates
    console.log('Guest updated:', payload)
  })
  .subscribe()

// Verfügbare Channels
const channels = [
  'guests_changes',
  'meals_changes',
  'surf_lessons_changes',
  'inventory_changes',
  'alerts_changes'
]
```

## 🔄 Server Actions

### Form Actions
```typescript
// app/guests/actions.ts
'use server'

export async function createGuest(formData: FormData) {
  const guest = {
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    email: formData.get('email') as string
  }

  const { data, error } = await supabase
    .from('guests')
    .insert(guest)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/guests')
  return { success: true, data }
}
```

## 🛡️ Fehlerbehandlung

### Standard Error Response
```typescript
type ApiError = {
  success: false,
  error: {
    code: string,
    message: string,
    details?: any
  },
  timestamp: string
}

// HTTP Status Codes
const statusCodes = {
  200: 'OK',
  201: 'Created',
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  500: 'Internal Server Error'
}
```

### Validation Errors
```typescript
// Zod Schema Validation
import { z } from 'zod'

const GuestSchema = z.object({
  firstName: z.string().min(1, 'Vorname ist erforderlich'),
  lastName: z.string().min(1, 'Nachname ist erforderlich'),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  phone: z.string().optional()
})

// Usage in API Route
try {
  const validatedData = GuestSchema.parse(requestBody)
} catch (error) {
  return NextResponse.json({
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Invalid input data',
      details: error.errors
    }
  }, { status: 400 })
}
```

## 📝 Rate Limiting

```typescript
// middleware.ts
import { rateLimit } from '@/lib/rate-limit'

export async function middleware(request: NextRequest) {
  const result = await rateLimit(request.ip)

  if (!result.success) {
    return NextResponse.json({
      error: 'Rate limit exceeded'
    }, { status: 429 })
  }

  return NextResponse.next()
}
```

## 🧪 Testing

### API Testing mit Jest
```typescript
// __tests__/api/guests.test.ts
import { POST } from '@/app/api/guests/route'

describe('/api/guests', () => {
  test('creates new guest', async () => {
    const request = new Request('http://localhost:3000/api/guests', {
      method: 'POST',
      body: JSON.stringify({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
  })
})
```

---

**API Version**: v1.0
**Letzte Aktualisierung**: 2025-01-27
**OpenAPI Spec**: [Verfügbar auf Anfrage]