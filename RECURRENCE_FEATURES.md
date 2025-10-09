# CampFlow 2.0 - Wiederholungsfunktionen

## 📅 Übersicht

Das CampFlow-System wurde um umfassende Wiederholungs- und Copy-Funktionen erweitert, die es ermöglichen, Meals, Events und Surf Lessons effizient zu verwalten und zu wiederholen.

## ✨ Neue Features

### 🔄 Wiederholungssystem

**Unterstützte Wiederholungstypen:**
- **Täglich**: Jeden Tag, alle X Tage
- **Wöchentlich**: Bestimmte Wochentage (Mo, Di, Mi, etc.)
- **Monatlich**: Bestimmter Tag im Monat
- **Benutzerdefiniert**: Flexible Regeln

**Konfiguration:**
- Intervall-Einstellungen (z.B. alle 2 Wochen)
- Enddatum oder maximale Anzahl Wiederholungen
- Spezifische Wochentage für wöchentliche Wiederholung

### 📋 Draft/Publish Status System

**Status-Optionen:**
- **Draft**: Nicht für Gäste sichtbar, Planung möglich
- **Published**: Für Gäste sichtbar und buchbar
- **Archived**: Archiviert, nicht mehr aktiv

**Vorteile:**
- Vorab-Planung ohne Gäste-Sichtbarkeit
- Kontrolle über Veröffentlichungszeitpunkt
- Schutz vor versehentlichen Buchungen

### 📄 Copy-Funktion

**Schnelles Kopieren:**
- Ein-Klick-Kopie von bestehenden Einträgen
- Automatische Anpassung von Datum/Zeit
- Beibehaltung aller Eigenschaften
- Status wird automatisch auf "Draft" gesetzt

**Anwendungsfälle:**
- Rice Curry mit verschiedenen Varianten (Fleisch, Vegetarisch, Vegan)
- Wiederkehrende Events mit leichten Anpassungen
- Surf-Stunden für verschiedene Skill-Level

### 🎯 Template-System

**Template-Funktionen:**
- Speicherung als wiederverwendbare Vorlage
- Kategorisierung nach Typ
- Schnelle Erstellung basierend auf Templates

## 🏗️ Technische Implementierung

### Datenbank-Erweiterungen

**Neue Tabellen:**
```sql
-- Wiederholungsregeln
recurrence_rules (
  id, type, interval_count, days_of_week,
  day_of_month, end_date, max_occurrences
)

-- Template-Kategorien
template_categories (
  id, name, type, description, color
)
```

**Erweiterte Tabellen:**
- `meals`: status, is_template, parent_id, recurrence_rule_id
- `events`: status, is_template, parent_id, recurrence_rule_id
- `surf_lessons`: status, is_template, parent_id, recurrence_rule_id

### Backend-Services

**RecurrenceService (`/lib/recurrence-service.ts`):**
- `copyMeal()`, `copyEvent()`, `copySurfLesson()`
- `createRecurrenceRule()`
- `generateRecurringInstances()`
- `updateStatus()`
- `saveAsTemplate()`

### UI-Komponenten

**Neue Buttons und Modals:**
- Copy-Button mit Kopier-Modal
- Recurrence-Button mit Wiederholungs-Setup
- Template-Button zum Speichern als Vorlage
- Status-Filter und Status-Update-Buttons

## 🎮 Benutzerführung

### Meals verwalten

1. **Meal erstellen**: Standard-Erstellung mit Draft-Status
2. **Als Template speichern**: Für Wiederverwendung
3. **Kopieren**: Schnelle Varianten erstellen
4. **Wiederholung einrichten**:
   - Button "Setup Recurrence" klicken
   - Typ auswählen (täglich/wöchentlich/monatlich)
   - Parameter konfigurieren
   - Anzahl Instanzen festlegen
5. **Publizieren**: Von Draft zu Published wechseln

### Events verwalten

Identisches System wie Meals:
- Draft → Published → Archived Workflow
- Copy-Funktion für Event-Varianten
- Wiederholungs-Setup für regelmäßige Events
- Template-System für Standard-Events

### Surf Lessons verwalten

Gleiche Funktionalität:
- Wiederholende Stunden für verschiedene Skill-Level
- Copy für ähnliche Stunden
- Draft-System für Planung

## 📊 Beispiel-Anwendungsfälle

### Rice Curry Varianten
```
1. Original: "Rice Curry" (Template)
2. Kopie: "Rice Curry (Vegetarian)"
3. Kopie: "Rice Curry (Vegan)"
4. Alle publizieren wenn fertig geplant
```

### Wöchentliche Yoga-Stunden
```
1. "Sunrise Yoga" erstellen
2. Wiederholung: Wöchentlich, Mo+Mi+Fr
3. 4 Wochen, 12 Instanzen
4. Alle automatisch als Published
```

### Event-Serie
```
1. "Beach Volleyball" erstellen
2. Wiederholung: Täglich, 14 Tage
3. Automatische Generierung aller Instanzen
4. Individual anpassbar
```

## 🔧 Weitere Funktionen

### Status-Filter
- Filter nach Draft/Published/Archived
- Übersichtliche Darstellung des aktuellen Status
- Schneller Status-Wechsel

### Verknüpfungs-System
- Parent-Child-Beziehungen zwischen Original und Kopien
- Verfolgung von Wiederholungs-Serien
- Template-Zuordnung

### Validierung
- Pflichtfelder-Prüfung
- Datum/Zeit-Validierung
- Überschneidungs-Prüfung (optional)

## 🚀 Deployment

**Datenbank-Migration:**
```sql
-- 1. Neue Schema laden
\i database/recurrence-schema.sql

-- 2. Bestehende Daten migrieren (falls nötig)
UPDATE meals SET status = 'published' WHERE status IS NULL;
UPDATE events SET status = 'published' WHERE status IS NULL;
UPDATE surf_lessons SET status = 'published' WHERE status IS NULL;
```

**Frontend-Updates:**
- Neue UI-Komponenten sind bereits integriert
- RecurrenceService ist konfiguriert
- Erweiterte Modals sind implementiert

## 📈 Vorteile

**Für Camp-Manager:**
- Effiziente Planung wiederkehrender Aktivitäten
- Kontrolle über Gäste-Sichtbarkeit
- Schnelle Erstellung von Varianten

**Für Küchenpersonal:**
- Vorab-Planung ohne Gäste-Verwirrung
- Einfache Menü-Varianten
- Template-basierte Effizienz

**Für Gäste:**
- Nur finale, verfügbare Optionen sichtbar
- Keine Verwirrung durch Draft-Inhalte
- Verlässliche Verfügbarkeit

---

*Diese Funktionen bilden die Grundlage für eine professionelle Camp-Verwaltung mit flexibler Planung und effizienter Wiederverwendung.*