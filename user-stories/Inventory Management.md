📦 Inventory Management — Detaillierte Technische Beschreibung
🎯 Ziel

Das Inventory Management Modul dient der zentralen Verwaltung von Zimmern, Betten und Material (Equipment) in einem Camp.
Es bietet eine vollständige Übersicht über Belegung, Verfügbarkeit, Auslastung und Zuweisungen.
Dabei wird strikt mit Echt­daten aus der Datenbank gearbeitet (keine Mockdaten).
Nur aktive Gäste können zugewiesen werden, alle Änderungen werden protokolliert.

🖥️ UI & UX
Navigationspunkt: Inventory

Im Admin Panel sichtbar (linkes Menü).

Tabs:

Bed Inventory → Verwaltung von Zimmern & Betten

Material Inventory → Verwaltung von Surfboards, Wetsuits, Zubehör

Analytics → Statistiken, Auslastung, Trends

Layout:

Rechts oben: + Button → öffnet je nach Tab „Create Room“ oder „Add Material“ Modal

Cards:

Zimmer-Cards: zeigen Zimmername, Typ, Anzahl Betten, Belegung, Aktionen

Equipment-Cards: zeigen Name, Kategorie, Status, Zuweisung, Aktionen

Aktionen (immer als Icon):

👁️ View → Detail-Modal

✏️ Edit → Edit-Modal

🗑️ Delete → endgültiges Löschen mit Warn-Alert

👤 Assign → Zuweisung an Gäste oder Staff

🛏️ Rooms & Beds
Zimmer-Übersicht

Cards pro Zimmer mit:

Zimmername („Dormitory A“, „Private Room 1“)

Zimmer-Typ (Dormitory | Private | Suite)

Kapazität (z. B. „6/8 belegt“)

Kurzanzeige: welche Gäste aktuell in diesem Zimmer liegen

Actions: View | Edit | Delete

Room Details (Modal)

Basisdaten: Name, Typ, Beschreibung

Bettliste:

Alle Betten mit Status (frei / belegt)

Gast-ID & Name pro Bett (z. B. G-8DH29XQJ4K – John Doe)

Zuweisung:

Dropdown → nur aktive Gäste auswählbar

Drag & Drop → Gäste zwischen Betten verschieben

Kapazitätsprüfung → Warnung bei Überbelegung (JS-Alert)

Room Creation / Edit (Modal)

Pflichtfelder: Name, Typ

Optional: Beschreibung

Bett-Konfiguration:

Anzahl Betten (1–20)

Bett-Typen:

Single (1 Person)

Double (2 Personen)

Bunk (Etagenbett → Slots: Upper/Lower)

Queen / King (2 Personen, komfort)

Sofa / Extra / Crib (1 Person, Zusatz)

Automatische Generierung von Bed-IDs (B-XXXXXXXXXX)

Aktionen im Modal:

X (oben & unten rechts) = schließen

💾 Diskette = speichern

🏄 Material & Equipment
Kategorien

Surfboards → Beginner, Intermediate, Advanced

Wetsuits → XS–XXL, 2mm–5mm

Safety Equipment → Helme, Westen

Cleaning Supplies → Putzmaterial, Wartungs-Tools

Erweiterbar durch Admin

Equipment Cards

Equipment-Name (z. B. „Beginner Board 8’0“)

Kategorie-Badge (Surfboard, Wetsuit …)

Status:

Available

Assigned (mit Gastname)

Maintenance

Retired

Actions: 👁️ | ✏️ | 🗑️ | 👤

Equipment Assignment

Modal: Dropdown mit aktiven Gästen

Filter nach: Kategorie, Größe, Zustand

Historie: Wer hatte wann welches Equipment

Validierung:

Ein Gast darf nicht mehrere Boards gleichzeitig haben

Defektes/Wartendes Equipment nicht zuweisbar

Equipment Creation (Modal)

Name

Kategorie (Dropdown)

Typ (frei definierbar)

Status (Available | Maintenance | Retired)

Quantity (z. B. 5 Boards gleichzeitig anlegen)

Startnummerierung (z. B. 1 → Board #1, #2, #3 …)

📊 Analytics
Metriken (als Cards):

Belegungsrate Zimmer: z. B. 85%

Equipment-Auslastung: z. B. 12/15 Boards vergeben

Verteilung Zimmertypen: Dormitory vs. Private vs. Suite

Gäste-Statistiken: Ø Aufenthaltsdauer

Charts:

Belegung über Zeit: Wochen- & Monats-Trends

Beliebte Zimmertypen

Meistgenutzte Equipment-Arten

Auslastung nach Wochentagen

🗂️ Datenmodell
IDs

Rooms: R-XXXXXXXXXX

Beds: B-XXXXXXXXXX

Equipment: U-XXXXXXXXXX

Guests: G-XXXXXXXXXX

Staff: S-XXXXXXXXXX

Tabellen

rooms

id, camp_id, name, type, description, max_capacity, is_active

beds

id, room_id, identifier („Bed 1“)

type (single | double | bunk | queen | king | sofa | extra | crib)

capacity (1 oder 2)

group_id (für Bunk) + slot (upper/lower)

bed_assignments

id, bed_id, guest_id, assigned_at, assigned_by, status (active | checked_out)

equipment

id, camp_id, name, category, type, size, brand, condition, status

equipment_assignments

id, equipment_id, guest_id, assigned_at, return_date, status

⚙️ Regeln & Validierungen

Nur aktive Gäste können zugewiesen werden

Betten-Kapazität darf nicht überschritten werden (Warnung erlaubt Override)

Equipment in „Maintenance/Retired“ kann nicht zugewiesen werden

Zuweisungen werden sofort in DB gespeichert

Überbelegung → JS-Alert („Kapazität überschritten. Trotzdem zuweisen?“)

🔄 Datenflüsse
Zimmer-Erstellung

Admin klickt + → Create Room Modal

Betten werden automatisch generiert

Zimmer wird in DB gespeichert

Anzeige im Bed Inventory

Gast-Check-in

Gast aktiv gesetzt

Dropdown zeigt ihn als verfügbar

Zuweisung an Bett speichert Assignment in DB

Equipment-Zuweisung

Staff klickt „Assign“

Wählt aktiven Gast

Status Equipment → „Assigned“

Historie-Eintrag gespeichert

Gast-Check-out

Status Gast → inaktiv

Alle Zuweisungen (Bett/Equipment) → automatisch beendet

Ressourcen werden frei

⚠️ Fehlerfälle & Edge Cases

Überbelegung eines Dormitory-Bettes → Warnung, Staff kann bestätigen

Zwei Staff weisen gleichzeitig dasselbe Board zu → DB-Constraint verhindert Doppelbuchung

Gast wird inaktiv → alle Zuweisungen werden automatisch entfernt

Equipment geht kaputt → Status auf „Maintenance“ sperrt es automatisch

✅ Akzeptanzkriterien

 Admin kann Zimmer, Betten & Equipment CRUD-verwalten

 Automatische ID-Generierung (R-, B-, U- Prefix)

 Gäste können nur zugewiesen werden, wenn aktiv

 Belegung & Auslastung sind live aus der DB

 Historie speichert jede Zuweisung mit Zeit & Staff-ID

 Analytics berechnet korrekte Trends

 Alle Alerts (z. B. Überbelegung) sind JS-Alerts, keine DOM-Meldungen