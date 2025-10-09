Alles klar—hier ist die **präzise, umsetzbare Spezifikation (ohne Code)** für die erste Funktion: **Admin-Dashboard mit Cards**. Ich orientiere mich am Screenshot (nur als Inspiration) und beschreibe Datenquellen, Logik, Navigation, Darstellungen und Akzeptanzkriterien so, dass Cursor das direkt 1:1 umsetzen kann.

---

# Ticket: Admin Dashboard (Cards + Navigation)

## Ziel

Ein zentrales Admin-Dashboard, das alle wichtigen Kennzahlen **des heutigen Tages** aus der **echten Datenbank** (keine Mockdaten) anzeigt. Multi-Tenant-sicher (camp\_id-scoped), zeitzonenrichtig (Camp-TZ), performant und klickbar zu den jeweiligen Detailbereichen.

---

## Navigation (linke Sidebar)

**Reihenfolge & Bezeichnungen:**

1. Dashboard
2. Guests
3. Lessons
4. Meals
5. Events
6. Staff
7. Inventory
8. Alert Management
9. Shifts
10. Calendar
11. Reports
12. Settings
13. Logout

* Vor jedem Eintrag ein passendes Icon (statisch, UX-Konsistenz).
* Aktiver Eintrag visuell hervorgehoben.
* Klick führt **server-/clientseitig** auf die jeweilige Seite (keine Platzhalter).

---

## Header (rechts oben)

* Camp-Avatar/Logo (falls vorhanden), **Camp Name**.
* Angemeldeter Benutzer (Optional: Avatar/Name, kein Pflichtbestandteil in Phase 1).

---

## Begrüßung

Oben im Content-Bereich:
“**Welcome back! Here’s a quick overview for today, {DD.MM.YYYY}.**”

* Datum basiert auf Camp-Zeitzone (`camps.tz`).
* Wenn TZ fehlt → Fallback UTC, zusätzlich Log-Warnung.

---

## Cards (Inhalt & Datenquellen)

Alle Kennzahlen sind **live** und **camp\_id-gefiltert**. Heute = `date_trunc('day', now() at time zone camp.tz)`.

### 1) Guests (Card)

**Anzeigen:**

* **In house:** Anzahl aktuell eingecheckter Gäste im Camp.
* **Surf package:** Anzahl der Gäste mit Surf-Paket.
* **% Anteil Surf package:** `surf_package_count / in_house_count * 100` (auf ganze Prozent runden; Division durch 0 → “—”).

**Datenquellen (Beispieltabellen) & Filter:**

* `guests` (camp\_id, status|in\_house, surf\_package\:boolean, room\_bed\_id, level, …)
* Optional: `stays`/`checkins` (falls Aufenthalte separat abgebildet sind)
* Filter: `camp_id = current_camp` UND “heute im Haus” (Status/Checkin-Logik wie im Projekt definiert).

**Click-Through:** öffnet **Guests**-Liste.

---

### 2) Lessons (Card)

**Anzeigen (heute):**

* **Total lessons today** (geplant + publiziert; Drafts optional ausblenden wenn im Produkt gewünscht)
* **Verteilung Teilnehmer nach Level:** `Beginner X · Inter Y · Adv Z` (Summe = heutige Teilnehmer in allen Lektionen)
* **%-Anteile** je Level (= count / Summe \* 100; bei Summe 0 → “—”).

**Datenquellen & Filter:**

* `lessons` (camp\_id, start\_time, end\_time, location, status/published)
* `lesson_assignments` (guest\_id, lesson\_id, role = guest|instructor)
* `guests.level` für Level-Clustering
* Filter: `camp_id` und `start_time::date = today(Camp TZ)`.

**Click-Through:** öffnet **Lessons**-Übersicht.

---

### 3) Meals (Card)

**Anzeigen (heute):**

* **Orders today:** Summe aller heute bestätigten Meal-Bestellungen.
* **Verteilung Optionen:** `Meat A · Veg B · Vgn C · Oth D`
* **%-Anteile** je Option (bei Summe 0 → “—”).

**Datenquellen & Filter:**

* `meals` (camp\_id, category: breakfast/lunch/dinner, start/end, cutoff, published)
* `meal_orders` (guest\_id, meal\_id, option: meat/vegetarian/vegan/other, status: confirmed)
* Filter: `camp_id` und `meals.start::date = today(Camp TZ)`; `meal_orders.status in (‘confirmed’)`.

**Click-Through:** öffnet **Meals** → **Staff Overview** (oder Management; bitte eine konsistente Zielseite wählen).

---

### 4) Events (Card)

**Anzeigen (heute):**

* **Activities today:** Anzahl Events heute
* **(attending N):** Anzahl Zusagen/Aktive Anmeldungen

**Datenquellen & Filter:**

* `events` (camp\_id, start\_time, type, published)
* `event_attendees` (guest\_id, status: attending)
* Filter: `camp_id` und `events.start_time::date = today(Camp TZ)`; Teilnahme `status = attending`.

**Click-Through:** öffnet **Events**-Übersicht.

---

### 5) Staff (Card)

**Anzeigen:**

* **Active staff:** Anzahl aktiver Staff-Accounts (rollenunabhängig).

**Datenquellen & Filter:**

* `staff` (camp\_id, is\_active\:boolean, roles: \[host, teacher, instructor, kitchen, cleaning])
* Filter: `camp_id`, `is_active = true`.

**Click-Through:** öffnet **Staff**-Liste.

---

### 6) Inventory (Card)

**Anzeigen:**

* **Beds:** `occupied / total`
* **Rooms:** Anzahl Rooms
* **Auslastung %:** `occupied / total * 100` (runden; Division durch 0 → “—”).

**Datenquellen & Filter:**

* `rooms` (camp\_id, room\_number, …)
* `beds` (camp\_id, room\_id, type: single/double, capacity, occupancy: 0/1/2)
* Belegung wird **nicht** über Mock gesetzt, sondern über reale Verknüpfung `guests.room_bed_id` bzw. `assignments`.
* Filter: `camp_id`.

**Click-Through:** öffnet **Inventory**.

---

### 7) Alert Management (Card)

**Anzeigen:**

* Kurze Beschreibung, **keine Zahlen** notwendig (Phase 1).
  Beispiel: “Configure cutoff, alerts & push rules per category/type.”

**Click-Through:** öffnet **Alert Management**.

---

### 8) Shifts (Card)

**Anzeigen (heute):**

* “Shifts scheduled today: N” (Anzahl Schichten heute).

**Datenquellen & Filter:**

* `shifts` (camp\_id, starts\_at, ends\_at, staff\_id, timesheet\_eligible)
* Filter: `camp_id`, Datum der Schicht in Camp-TZ == heute.

**Click-Through:** öffnet **Shifts** (Wochenansicht).

---

### 9) Calendar (Card)

**Anzeigen:**

* Kurzer Hinweis: “View weekly overview of events, lessons, and meals.” (keine Zahlen).
  **Click-Through:** öffnet **Calendar** (Wochen-Kalender, gefiltert auf Camp).

---

### 10) Reports (Card)

**Anzeigen:**

* Kurzer Hinweis: “View analytics and exports.”
  **Click-Through:** öffnet **Reports**.

---

## Darstellung & UX (Kernpunkte)

* **Kartenlayout** in 2–3 Spalten (responsive), konsistente Höhe, Icon + Titel links oben.
* Kleine Unterzeile mit Kennzahlen; Prozentwerte kurz und inline.
* Karten sind **klickbar** (Hover), führen zur jeweiligen Seite.
* **Keine** statischen Hardcodings/Placebozahlen.
* Leere Zustände: Bei 0-Werten trotzdem plausible Anzeige (z. B. “Orders today: 0 · Meat 0 · Veg 0 · Vgn 0 · Oth 0 · —%”).

---

## Daten & Sicherheit

* **Kein Mock**: Alle Zahlen ausschließlich aus der produktiven Datenbank.
* **camp\_id-Scoping** überall verpflichtend (RLS/Query-Filter).
* **Zeitzone** aus `camps.tz` anwenden (heutiger Tag, Grenzen 00:00–23:59 lokal).
* **Performance**:

  * Aggregationen in einer Query pro Card (oder serverseitigem Endpunkt) bündeln.
  * Caching (kurz, z. B. 30–60 Sek) erlaubt, mit “Refresh” Button.
* **Fehlerfälle**:

  * DB down → Card zeigt Non-blocking “Data unavailable” + Retry, Log an Backend.
  * Fehlende TZ → Fallback UTC + Log-Warnung.

---

## Akzeptanzkriterien (Tests)

**Allgemein**

* Given ein Admin ist eingeloggt, When er “Dashboard” öffnet, Then sieht er **Begrüßung** + **Cards** in oben definierter Reihenfolge (optisch) & **Navigation** links (mit Icons) in der vorgegebenen Reihenfolge.
* Given mehrere Camps existieren, When ein Admin des Camps A das Dashboard öffnet, Then zeigen alle Cards ausschließlich Daten mit `camp_id = A`.

**Guests**

* Given heute 12 Gäste im Haus, 8 davon mit Surf-Package, When das Dashboard lädt, Then zeigt die Card “In house: 12 · Surf package: 8 · 67%”.

**Lessons**

* Given heute 10 Lektionen mit gesamt 20 Teilnehmern (10 Beg, 6 Int, 4 Adv), Then zeigt die Card “Lessons today: 10 · Beginner 10 · Inter 6 · Adv 4 · 50% · 30% · 20%”.
* Given keine Lektionen heute, Then zeigt die Card 0 und “—%” für Quoten.

**Meals**

* Given heute 15 bestätigte Orders (Meat 8, Veg 4, Vgn 2, Oth 1), Then zeigt die Card genau diese Zahlen und korrekte %-Verteilung.

**Events**

* Given 2 Events heute mit insgesamt 8 “attending”, Then zeigt die Card “Activities today: 2 (attending 8)”.

**Inventory**

* Given 12 Betten total, 8 belegt, 6 Rooms, Then zeigt die Card “Beds: 8/12 · Rooms: 6 · 67%”.

**Staff**

* Given 5 aktive Staff, Then zeigt die Card “Active staff: 5”.

**Shifts**

* Given heute 4 Schichten existieren, Then zeigt die Card “Shifts scheduled today: 4”.

**Click-Through**

* Click auf jede Card öffnet die zutreffende Zielseite (Guests, Lessons, Meals, …). Keine Sackgassen.

**Keine Mockdaten**

* Bei manueller DB-Änderung (z. B. neue Meal-Order) und Reload zeigt die Card die aktualisierte Zahl.

---

## Barrierefreiheit & Responsiveness

* Tastatur-Fokus States auf Cards & Navigation.
* ARIA-Labels für Titel/Icons.
* Layout bricht responsiv in 1/2/3 Spalten, keine Überläufe.

---

## Nicht-Ziele (dieses Tickets)

* Kein Editieren aus Cards.
* Keine Drill-Down-Charts im Dashboard.
* Kein globales Suchen.

---

## Hinweise zur Umsetzung

* Einheitliche **Card-Komponente** (Titel, Icon, Subtext, onClick).
* **Daten-Adapter** pro Card, die heute-basierte Aggregation serverseitig liefert.
* **Zeitliche Filter** stets in Camp-TZ (Start/End des Tages).
* **RLS prüfen**: Alle APIs/Queries müssen `camp_id` erzwingen.

---

**Wichtig:** Bitte keine bestehenden, stabilen Seiten unbeabsichtigt verändern. Nur die oben beschriebenen Anpassungen umsetzen.
