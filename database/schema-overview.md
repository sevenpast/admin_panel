# CampFlow 2.0 - Datenbank Schema

## 📊 Übersicht

Das CampFlow 2.0 System verwendet PostgreSQL als Hauptdatenbank über Supabase. Die Datenbankstruktur ist modular aufgebaut und unterstützt alle Kern-Funktionalitäten des Camp-Management-Systems.

## 🏗️ Haupt-Tabellen

### 👥 Gäste-Management
```sql
-- Gäste Haupttabelle
guests (
  id UUID PRIMARY KEY,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50),
  date_of_birth DATE,
  nationality VARCHAR(100),
  passport_number VARCHAR(50),
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(50),
  allergies TEXT,
  dietary_restrictions TEXT,
  check_in_date TIMESTAMP,
  check_out_date TIMESTAMP,
  room_number VARCHAR(10),
  status VARCHAR(20), -- 'checked_in', 'checked_out', 'reserved'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Zimmer-Management
rooms (
  id UUID PRIMARY KEY,
  room_number VARCHAR(10) UNIQUE,
  room_type VARCHAR(50), -- 'single', 'double', 'family', 'dorm'
  capacity INTEGER,
  price_per_night DECIMAL(10,2),
  amenities TEXT[],
  status VARCHAR(20), -- 'available', 'occupied', 'maintenance', 'cleaning'
  floor INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 🏄‍♂️ Surf-Unterricht
```sql
-- Surfstunden
surf_lessons (
  id UUID PRIMARY KEY,
  title VARCHAR(200),
  instructor_id UUID REFERENCES staff(id),
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  max_participants INTEGER,
  skill_level VARCHAR(20), -- 'beginner', 'intermediate', 'advanced'
  location VARCHAR(100),
  price DECIMAL(10,2),
  status VARCHAR(20), -- 'scheduled', 'completed', 'cancelled'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Surf-Teilnehmer
surf_participants (
  id UUID PRIMARY KEY,
  lesson_id UUID REFERENCES surf_lessons(id),
  guest_id UUID REFERENCES guests(id),
  booked_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) -- 'registered', 'attended', 'no_show'
);
```

### 🍽️ Mahlzeiten-Management
```sql
-- Mahlzeiten
meals (
  id UUID PRIMARY KEY,
  name VARCHAR(200),
  description TEXT,
  meal_type VARCHAR(20), -- 'breakfast', 'lunch', 'dinner', 'snack'
  serving_date DATE,
  serving_time TIME,
  price DECIMAL(10,2),
  max_portions INTEGER,
  available_portions INTEGER,
  ingredients TEXT[],
  allergens TEXT[],
  calories_per_portion INTEGER,
  status VARCHAR(20), -- 'planned', 'preparing', 'ready', 'served'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Mahlzeiten-Buchungen
meal_bookings (
  id UUID PRIMARY KEY,
  meal_id UUID REFERENCES meals(id),
  guest_id UUID REFERENCES guests(id),
  portions INTEGER DEFAULT 1,
  special_requests TEXT,
  booked_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) -- 'booked', 'served', 'cancelled'
);
```

### 👨‍💼 Personal-Management
```sql
-- Mitarbeiter
staff (
  id UUID PRIMARY KEY,
  employee_id VARCHAR(50) UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50),
  role VARCHAR(50), -- 'manager', 'receptionist', 'instructor', 'kitchen', 'housekeeping'
  department VARCHAR(50),
  hire_date DATE,
  hourly_rate DECIMAL(10,2),
  skills TEXT[],
  certifications TEXT[],
  status VARCHAR(20), -- 'active', 'inactive', 'on_leave'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Schichten
shifts (
  id UUID PRIMARY KEY,
  staff_id UUID REFERENCES staff(id),
  shift_date DATE,
  start_time TIME,
  end_time TIME,
  break_duration INTEGER, -- in minutes
  position VARCHAR(100),
  status VARCHAR(20), -- 'scheduled', 'completed', 'cancelled'
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 📦 Inventar-Management
```sql
-- Inventar
inventory (
  id UUID PRIMARY KEY,
  item_name VARCHAR(200),
  category VARCHAR(100), -- 'surfboards', 'wetsuits', 'kitchen', 'cleaning', 'maintenance'
  brand VARCHAR(100),
  model VARCHAR(100),
  serial_number VARCHAR(100),
  purchase_date DATE,
  purchase_price DECIMAL(10,2),
  current_value DECIMAL(10,2),
  condition VARCHAR(20), -- 'excellent', 'good', 'fair', 'poor', 'damaged'
  location VARCHAR(100),
  status VARCHAR(20), -- 'available', 'in_use', 'maintenance', 'retired'
  last_maintenance DATE,
  next_maintenance DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ausrüstung-Ausleihen
equipment_rentals (
  id UUID PRIMARY KEY,
  item_id UUID REFERENCES inventory(id),
  guest_id UUID REFERENCES guests(id),
  rented_at TIMESTAMP,
  due_back TIMESTAMP,
  returned_at TIMESTAMP,
  condition_out VARCHAR(20),
  condition_in VARCHAR(20),
  deposit_amount DECIMAL(10,2),
  rental_fee DECIMAL(10,2),
  status VARCHAR(20) -- 'active', 'returned', 'overdue', 'damaged'
);
```

### 📅 Events & Kalender
```sql
-- Events
events (
  id UUID PRIMARY KEY,
  title VARCHAR(200),
  description TEXT,
  event_type VARCHAR(50), -- 'party', 'excursion', 'workshop', 'competition'
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  location VARCHAR(100),
  max_participants INTEGER,
  price DECIMAL(10,2),
  organizer_id UUID REFERENCES staff(id),
  status VARCHAR(20), -- 'planned', 'active', 'completed', 'cancelled'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Event-Teilnehmer
event_participants (
  id UUID PRIMARY KEY,
  event_id UUID REFERENCES events(id),
  guest_id UUID REFERENCES guests(id),
  registered_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) -- 'registered', 'attended', 'no_show'
);
```

## 🔄 Hilfstabellen

### Benachrichtigungen
```sql
alerts (
  id UUID PRIMARY KEY,
  title VARCHAR(200),
  message TEXT,
  alert_type VARCHAR(50), -- 'info', 'warning', 'error', 'success'
  priority VARCHAR(20), -- 'low', 'medium', 'high', 'critical'
  target_role VARCHAR(50), -- NULL für alle
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);
```

### Finanzen
```sql
financial_transactions (
  id UUID PRIMARY KEY,
  guest_id UUID REFERENCES guests(id),
  staff_id UUID REFERENCES staff(id),
  transaction_type VARCHAR(50), -- 'charge', 'payment', 'refund', 'deposit'
  amount DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'EUR',
  description TEXT,
  payment_method VARCHAR(50), -- 'cash', 'card', 'transfer', 'online'
  reference_id UUID, -- Verweis auf meal_booking, surf_lesson, etc.
  reference_type VARCHAR(50),
  processed_at TIMESTAMP DEFAULT NOW()
);
```

## 🔐 Sicherheit & Zugriff

### Row Level Security (RLS)
Supabase RLS Policies sind für alle Tabellen aktiviert:

```sql
-- Beispiel: Nur eigene Gäste-Daten für Rezeptionisten
CREATE POLICY "staff_access_guests" ON guests
  FOR ALL USING (
    auth.jwt() ->> 'role' IN ('manager', 'receptionist')
  );

-- Beispiel: Mitarbeiter können nur eigene Schichten sehen
CREATE POLICY "staff_own_shifts" ON shifts
  FOR SELECT USING (
    staff_id = (auth.jwt() ->> 'sub')::uuid
  );
```

## 📈 Indizes & Performance

### Wichtige Indizes
```sql
-- Gäste-Suche optimieren
CREATE INDEX idx_guests_email ON guests(email);
CREATE INDEX idx_guests_room ON guests(room_number);
CREATE INDEX idx_guests_status ON guests(status);
CREATE INDEX idx_guests_dates ON guests(check_in_date, check_out_date);

-- Buchungen optimieren
CREATE INDEX idx_meal_bookings_date ON meal_bookings(meal_id, guest_id);
CREATE INDEX idx_surf_participants_lesson ON surf_participants(lesson_id);

-- Schichten-Suche
CREATE INDEX idx_shifts_staff_date ON shifts(staff_id, shift_date);
```

## 🔧 Migrations

Migrations werden über Supabase SQL Editor oder CLI verwaltet:

```bash
# Neue Migration erstellen
supabase migration new add_new_feature

# Migrations anwenden
supabase db push

# Reset (nur Development)
supabase db reset
```

## 📊 Views & Funktionen

### Nützliche Views
```sql
-- Aktuelle Gäste-Übersicht
CREATE VIEW current_guests AS
SELECT
  g.*,
  r.room_type,
  r.capacity
FROM guests g
JOIN rooms r ON g.room_number = r.room_number
WHERE g.status = 'checked_in';

-- Tages-Umsatz
CREATE VIEW daily_revenue AS
SELECT
  DATE(processed_at) as date,
  SUM(amount) as total_revenue,
  COUNT(*) as transaction_count
FROM financial_transactions
WHERE transaction_type = 'payment'
GROUP BY DATE(processed_at);
```

## 🔄 Backup & Recovery

- **Automatische Backups**: Täglich über Supabase
- **Point-in-Time Recovery**: 7 Tage Historie
- **Export/Import**: SQL Dumps für Migration

---

*Diese Datenbankstruktur unterstützt alle CampFlow 2.0 Funktionalitäten und ist skalierbar für zukünftige Erweiterungen.*