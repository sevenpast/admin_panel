Calendar (View-only) – Technische Spezifikation

Ziel: Ein read-only Wochenkalender auf Basis von calendar.js (oder äquivalenter Library), 24-Stunden-Raster, mit laufender „Jetzt“-Linie. Es werden Surf Lessons und Events angezeigt. Shifts werden nicht angezeigt.
Keine Mockdaten – alle Einträge stammen aus der Datenbank der jeweiligen Module. IDs gem. globalem Schema (L-/E-…).

1) Scope & Darstellung

Zeitraum: Standardansicht = Woche (Mo–So) des aktuell ausgewählten Datums.

Zeitformat: 24 h (00:00–24:00), stündliche Rasterlinien, 15-Min-Subgrid optional.

Now-Indikator: persistente horizontale „Jetzt“-Linie mit Uhrzeit-Badge; bewegt sich automatisch.

Header-Kacheln (KPIs):

Events this week, Surf Lessons this week, Meals this week, Total Activities.
Zähler basieren auf tatsächlich gerenderten DB-Einträgen (Shifts ausgeschlossen).

Navigation: Heute, Jetzt, Vor/Zurück (eine Woche); Datumsbereich oberhalb („22 September – 28 September 2025“).

Interaktion: View-only. Keine Drag-&-Drop- oder Resize-Aktionen.

2) Datenquellen & Mapping

Lade Einträge für die dargestellte Woche (camp-scoped):

Surf Lessons (Tabelle „lessons“)

Pflichtfelder: lesson_id (L-XXXXXXXXXX), title, category (Lesson/Theory/Other), location, start_at, end_at, status (draft/published), instructors[], participants_count.

Render-Regel: Nur status = published anzeigen.

Events (Tabelle „events“)

Pflichtfelder: event_id (E-XXXXXXXXXX), name, category (Day/Night/Sport/Teaching), location, start_at, end_at, status (draft/published), min_participants, max_participants, assigned_staff[].

Render-Regel: Nur status = published anzeigen.

Meals (optional, falls im Kalender erwünscht wie auf dem Screenshot):

Pflichtfelder: meal_id (M-XXXXXXXXXX), title, category (Breakfast/Lunch/Dinner), start_at, end_at, published.

Render-Regel: Nur published = true.

Shifts: nicht laden/anzeigen.

Timezone: Alle Timestamps werden serverseitig normalisiert (Camp-Zeitzone). Kalender zeigt lokale Camp-Zeit an.

Wiederholungen: Serverseitig expandieren (z. B. iCal-RRULE-ähnlich) in konkrete Vorkommen innerhalb der sichtbaren Woche. Der Kalender erhält konkrete Start/End-Instanzen, keine RRULEs.

3) Rendering-Regeln

Farbcodierung (konsequent):

Surf Lessons: grün (z. B. #22C55E)

Events: violett (#8B5CF6)

Meals (falls aktiv): orange (#F59E0B)

Karteninhalt (Kurzform im Slot):

Surf Lesson: title • location • participants_count

Event: name • category • min/max (z. B. „3/10“)

Meal: category • title

Tooltip/Popover (on hover/click – weiterhin read-only):

Zeige Name/Titel, ID (L-/E-/M-…), Zeit (Start–Ende 24 h), Ort, Status (= Published), Kurzinfo (z. B. Instructor-Namen bei Lesson bzw. zugewiesene Staff bei Event).

Buttons/Links: keine Bearbeitung; optional „Open in module“ (führt zur Detailansicht im jeweiligen Modul, nicht zum Edit).

Kollisionen/Überlagerungen: Parallelblöcke werden nebeneinander gerendert (library-standard „stacking“).

4) Filter & Sichtbarkeit

Globaler Typ-Filter (optional in Header): Events | Lessons | Meals toggelbar – alle an, wenn nicht gesetzt.

Status-Filter: implizit (nur Published). Drafts erscheinen nicht.

Camp-Scope: Nur Daten mit camp_id des eingeloggten Admins.

5) Performance & Paging

Lazy-Load/Range-Fetch nach Navigationswechsel (nur sichtbare Woche).

Debounce beim schnellen Blättern.

Serverseitige Aggregation für KPI-Kacheln.

6) Barrierefreiheit & UX

Kontraste der Farben auf dunklem Hintergrund sicherstellen.

ARIA-Labels für Events (z. B. „Surf Lesson Beginner – 09:00 bis 11:00 – Main Beach – 8 Teilnehmer“).

Tastatur-Navi: Pfeile blättern Woche; T = Today, N = Now.

7) Fehler-/Leere-Zustände

Keine Einträge: „No activities for this week.“

Fehler beim Laden: JS-Alert „Failed to load calendar data.“ (gemäß globaler Alert-Policy).

Now-Linie wird auch ohne Einträge angezeigt.

8) Akzeptanzkriterien (Auszug)

24 h-Anzeige & Now-Linie

Die Kalenderzeitskala ist 00:00–24:00.

Eine rote (o. ä.) Now-Linie mit Uhrzeit-Badge bewegt sich kontinuierlich.

Datenquellen & Status

Es werden nur published Surf Lessons, Events (und Meals, falls aktiviert) gerendert.

Shifts erscheinen nicht.

Korrekte Zeiten & Zeitzone

Start/Ende der Blöcke entsprechen der Camp-Zeitzone und den DB-Werten.

Wiederholte Elemente sind innerhalb der Woche korrekt expandiert.

Kategorien-Farben & Tooltips

Lessons/Events/Meals sind farblich unterscheidbar.

Tooltip zeigt ID, Zeit (24 h), Ort und Kerndetails; keine Edit-Aktionen.

Navigation & KPIs

Heute, Jetzt, Vor/Zurück funktionieren; KPIs zählen die in der Woche sichtbaren Items je Typ.

Mandantentrennung

Es werden ausschließlich Einträge des aktuellen Camps dargestellt.

Keine Bearbeitung

Drag/Resize/Erstellen im Kalender sind deaktiviert (View-only).

Optionaler Link „Open in module“ führt in die jeweilige View-Seite, nicht in Edit.

Alerts (JS)

Lade-/Fehler-/Berechtigungsprobleme werden nur mit JavaScript-Alerts gemeldet (keine DOM-Banner).

9) Technische Hinweise (Integration)

Adapter-Schicht je Modul (Lessons/Events/Meals) liefert normalisierte Items:

{ id, type: 'lesson'|'event'|'meal', title, start_at, end_at, location, meta:{…}, color }


IDs aus DB 1:1 übernehmen (L-/E-/M- gemäß globalem Schema).

Security: API-Calls mit Camp-Scope & Role-Check (nur Admin).

Time Source: Serverseitig synchronisierte Zeit (für Now-Linie optional) oder Client-Zeit, aber konsistent anzeigen.