Staff Management – Technische Spezifikation (ohne Code)

Nutze die Screens im Anhang als Inspiration für Look & Feel. Inhalte, Datenflüsse und Regeln sind hier maßgeblich.
Keine Mockdaten – alle Werte kommen aus der Datenbank. IDs nach globalem Schema (siehe unten). Alerts ausschließlich als JavaScript-Alerts (Erfolg/Warnung/Fehler), keine DOM-Banner.

1) Ziel & Scope

Das Staff-Modul ermöglicht dem Admin:

Mitarbeitende anzulegen, zu sehen, zu filtern, zu bearbeiten und zu löschen.

Labels/Rollen zu pflegen (Host, Teacher, Instructor, Kitchen, Maintenance, Other).

Aktiv/Inaktiv zu steuern (Inaktiv = nicht zuweisbar in Events/Lessons/Shifts).

Stammdaten konsistent für alle verbundenen Bereiche bereitzustellen (Events, Surf Lessons, Shifts).

2) Navigation & Seitenaufbau

Eintrag “Staff” in der linken Nav (Icon + Text).

Rechts oben: runder “+”-Button (ohne Text) zum Erstellen.

Filterzeile oberhalb der Karten:

Status Filter: All Staff, Active, Inactive.

Label Filter (Multi oder Single): All Labels, Host, Teacher, Instructor, Kitchen, Maintenance, Other.

Suche (optional, sinnvoll): Live-Search nach Name.

Kartenraster (2–3 Spalten, responsive):

Name

Badge Active/Inactive

Label-Chips (mehrere möglich)

Actions (Icons): View (Auge), Edit (Stift), Delete (Papierkorb)

Datenquelle: ausschließlich DB (kein Seed, keine Platzhalter). Filter/Suche serverseitig oder korrekt synchronisiert, sodass Karten immer reale Ergebnisse anzeigen.

3) Datenmodell & IDs

Staff

staff_id: S-XXXXXXXXXX (1 Buchstabe + 10 Zeichen, 0–9/A–Z)

camp_id: Mandantentrennung; Staff ist immer genau einem Camp zugeordnet

name (Pflicht)

mobile_number (optional)

status: active | inactive
→ Inactive bedeutet: nicht auswählbar in Events, Surf Lessons (Instructor), Shifts

image_url (optional)

description (optional, Langtext)

labels: Menge aus {host, teacher, instructor, kitchen, maintenance, other} (≥0, mehrfach möglich)

created_at, updated_at (Audit)

Referenzen / Nutzung in anderen Modulen

Surf Lessons: Nur Staff mit Label instructor und status = active können als Instructor zugewiesen werden.

Events: Jede/r status = active kann zugewiesen werden (Labels sind informativ).

Shifts: Nur status = active.

4) Erstellen (Modal)

Trigger: “+” oben rechts.

Layout: 1-seitiges Modal (schließt via X oben rechts oder unten rechts, Diskette speichert).

Felder

Name (Pflicht)

Mobile Number (optional)

Status (Toggle; Default = Active)

Falls Inactive beim Anlegen: unmittelbar nicht in Zuweisungs-Dialogen verfügbar.

Image (optional Upload oder URL)

Description (optional)

Labels (Mehrfachauswahl): Host, Teacher, Instructor, Kitchen, Maintenance, Other

IDs & Speicherung

Beim Speichern generiere S-XXXXXXXXXX einmalig und speichere dauerhaft.

Alert (JS) bei Erfolg: “Staff created (ID: S-XXXXXXXXXX).”

Alert (JS) bei Validierungsfehlern: z. B. “Name is required.”

Nach Erfolg: Modal schließen, Karte erscheint sofort in der Liste gemäß Filtern.

Akzeptanzkriterien

Pflichtfelder werden serverseitig validiert; ohne Name kein Speichern.

Default Active ist gesetzt.

Labels mehrfach wählbar.

Neuer Staff erscheint in Events/Surf-Lessons/Shifts-Zuweisungen, sofern active und passende Label-Regel (Instructor) erfüllt sind.

Keine Zwischenspeicherung im DOM; alle Daten liegen in DB.

5) Anzeigen (View – Modal)

Trigger: Icon Auge.

Inhalt (read-only)

Name, Staff-ID (S-…)

Status (Badge)

Labels (Chips)

Mobile Number (falls vorhanden)

Image (falls vorhanden)

Description (falls vorhanden)

Audit: Created At, Last Updated

Interaktion

Schließen via X (oben/unten).

Keine Bearbeitung, kein Speichern.

Akzeptanzkriterien

Alle Felder spiegeln exakt den DB-Stand wider.

Timestamps im Camp-Timezone-Format.

6) Bearbeiten (Edit – Modal)

Trigger: Icon Stift.

Inhalt/Logik

Zeigt alle aktuellen Werte.

Bearbeitbar: Name, Mobile Number, Status, Image, Description, Labels.

Speichern: Diskette

Alert (JS) Erfolg: “Staff updated.”

Alert (JS) Fehler: konsistente Meldung, z. B. “Update failed. Please try again.”

Regeln bei Status-Wechsel

Active → Inactive:

Soft-Prüfung: Falls in zukünftigen Events/Surf-Lessons/Shifts zugewiesen:
→ JS-Warn-Alert: “This staff member is assigned to future items. They will become unavailable for new assignments.”
(Bestehende Zuweisungen bleiben bestehen – keine automatische Entfernung, außer du definierst explizit anderes Verhalten.)

Inactive → Active: Ab sofort in Zuweisungen auswählbar (Instructor-Regel beachten).

Akzeptanzkriterien

Änderungen werden dauerhaft in der DB gespeichert.

Kartenliste aktualisiert sich sofort (Status/Labels sichtbar).

Verknüpfungen in anderen Modulen berücksichtigen den neuen Zustand.

7) Löschen (Delete – Modal/Flow)

Trigger: Icon Papierkorb.

Ablauf

JS-Warn-Alert (Bestätigung): “Delete staff S-XXXXXXXXXX? This cannot be undone.”

Nach Bestätigung:

DB-Löschung (hard delete).

Einträge/Referenzen:

Für zukünftige Zuweisungen in Events/Surf Lessons/Shifts:
→ Transparente Regel definieren (hier Vorschlag): Blocken des Löschens, wenn zukünftige Zuweisungen existieren, mit JS-Alert:
“Cannot delete. Staff is assigned to future items.”
(Alternative: Automatisches Entfernen aus Zuweisungen ist heikel; besser explizit lösen und erst dann löschen.)

JS-Erfolgs-Alert: “Staff deleted.”

Karte verschwindet aus der Liste.

Akzeptanzkriterien

Kein Staff-Ghosting: Nach Löschen nirgendwo mehr auswählbar/angezeigt.

Einheitliche Fehlerbehandlung (z. B. bei DB-Constraint-Fehlern).

8) Listen-/Filter-Verhalten

Status-Filter wirkt serverseitig (oder sauber synchronisiert), „Active“ zeigt nur aktive, „Inactive“ nur inaktive.

Label-Filter zeigt nur Staff mit mindestens einem ausgewählten Label (ODER-Logik) – oder Single-Select (UX-Entscheidung), aber konsistent.

Suche findet Teilstrings in name (case-insensitive).

Pagination/Virtualization (ab ~50+ Einträge) zur Performance.

Leere Zustände: „No staff found for current filters.“

9) Verbindungen & Konsistenz

Surf Lessons

Instructor-Picker lädt nur status = active und labels enthält instructor.

Bei Deaktivierung eines Instructors werden bestehende Zuweisungen nicht entfernt, aber Person ist nicht mehr neu zuweisbar (sofern nicht anders festgelegt).

Events

Staff-Picker lädt alle status = active (Labels informativ).

Shifts

Drag-and-Drop/Picker nutzt nur status = active.

Alle Picker zeigen Name + S-ID (eindeutig bei Namensduplikaten).

10) IDs & Alerts (Global)

ID-Schema verpflichtend:

Meals M-XXXXXXXXXX, Lessons L-XXXXXXXXXX, Events E-XXXXXXXXXX, Staff S-XXXXXXXXXX, Guests G-XXXXXXXXXX, Equipment U-XXXXXXXXXX.

Alerts: strikt JavaScript-Alerts (Browser-Dialoge) für Erfolg, Warnungen, Fehler.
Keine Banner/Toasts/DOM-Hinweise.

11) Validierung & Regeln

Name: Pflicht, Trim, Länge (z. B. ≤ 120).

Mobile Number: Optional, vereinheitlichtes Format (z. B. E.164) – validieren.

Labels: Menge aus der vordefinierten Liste; kein freier Text.

Image: Optional, aber gültige URL/Upload.

Status: Umschaltbar; Auswirkungen auf Zuweisungen s. o.

12) Sicherheit & Rechte

Nur Admin des Camps sieht/bearbeitet Staff des eigenen camp_id.
Superhost (zukünftig) sieht camp-übergreifend – heute vorbereiten in Schema (Feld camp_id überall vorhanden, Abfragen scopen).

Serverseitige Validierung bei jeder Create/Update/Delete-Operation.

Audit created_at/updated_at.

13) Performance & UX

Debounced Search.

Serverseitige Filter/Pagination.

Optimistische UI nur, wenn Speichervorgang sicher ist – sonst „harte“ Refreshes nach Erfolg.

14) Barrierefreiheit

Icons mit ARIA-Labels: “View staff”, “Edit staff”, “Delete staff”.

Fokusfallen im Modal vermeiden; Esc schließt Modal.

Kontraste für Active/Inactive-Badge und Label-Chips beachten.

15) Akzeptanztests (Auszug)

Anlegen

Wenn ich im Staff-Modul auf “+” klicke, das Formular mit Name ausfülle und speichere,
dann wird S-ID generiert, der Eintrag in der Liste gezeigt und ein JS-Alert bestätigt den Erfolg.

Filtern

Wenn ich Status=Active und Label=Instructor setze,
dann sehe ich ausschließlich aktive Instructoren.

Bearbeiten – Deaktivieren

Wenn ich einen aktiven Instructor auf Inactive stelle,
dann zeigt das System einen JS-Warn-Alert über künftige Zuweisungen,
und diese Person ist nicht mehr neu zuweisbar (bestehende bleiben erhalten).

Löschen blockiert

Wenn Staff für zukünftige Events/Lessons/Shifts zugewiesen ist und ich lösche,
dann erhalte ich einen JS-Alert “Cannot delete … assigned to future items.”

Löschen erlaubt

Wenn Staff nicht mehr zugewiesen ist, lösche ich,
dann verschwindet die Karte, und ein JS-Alert bestätigt “Staff deleted.”

Konsistenz

Wenn ich Labels ändere (z. B. füge Instructor hinzu),
dann ist der Staff sofort im Instructor-Picker verfügbar (bei status = active).

16) Offene Optionen (falls gewünscht)

Label-Management (Admin kann Label-Liste erweitern) – aktuell fest definiert.

Soft Delete statt Hard Delete (mit Restore) – aktuell Hard Delete spezifiziert.

Massenimport (CSV) – später.