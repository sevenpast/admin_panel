Shifts — technische Beschreibung (ohne Code)
Ziel

Ein Wochen-Scheduler (7-Tage-Raster, 24h) für Camp-Schichten, basierend auf calendar.js. Nur aktive Staff-Mitglieder können verplant werden. Erstellen, Drag-&-Drop, Bearbeiten, Löschen, Wiederholungen. Alle Systemmeldungen als JavaScript alert(), keine DOM-Toasts.

Navigation & Sichtbarkeit

Eigene Seite: Shifts (Kalender-Icon „clock“).

Kalender (Global) zeigt keine Shifts (Shifts sind dort explizit ausgeblendet).

Oben: Prev / Today / Now / Next, Wochenbereich (Montag–Sonntag), 24-Stunden-Raster.

IDs & Entitäten

Staff: S-XXXXXXXXXX (0–9, A–Z).

Shift: H-XXXXXXXXXX (neuer Prefix für “Hours/Shift”, oder wie von dir vorgegeben – wenn du bei S bleibst, dann zusätzlich shift_id intern).

Jede Entität hat created_at, updated_at, created_by, camp_id.

Datenmodell (Kernfelder)

Shift

shift_id (ID-Schema wie oben)

camp_id (Mandantentrennung)

staff_id (muss auf aktiven Staff zeigen)

role_label (eine der Staff-Labels zum Zeitpunkt der Zuweisung: host|teacher|instructor|kitchen|maintenance|other)

start_at, end_at (ISO 8601, inkl. Zeitzone des Camps)

color (Hex oder vordef. Token; Standard aus Staff-Farbe)

recurrence_rule (optional; RFC-5545-artig: FREQ=WEEKLY;BYDAY=MO,WE;COUNT=8 oder null)

recurrence_parent_id (optional; für Serienzugehörigkeit)

notes (optional, kurz)

is_active (Logik-Flag für Serien-Ausnahmen)

Staff (relevant)

staff_id, name, active:boolean, labels:string[], phone?, image_url?, color?

Berechtigungen & Quellen

Nur Admin/Manager darf Shifts anlegen/bearbeiten/löschen.

Staff-Liste: nur aktive Staff aus der Staff-Datenbank (keine Mockdaten).

Alle Lese/Schreibvorgänge direkt gegen DB/API des Camps (Mandantenscope per camp_id).

UI/UX-Anforderungen
Kalender (calendar.js)

Week view, 24h, feste Slot-Höhe, aktuelle Uhrzeit als Linie.

Events = Shifts:

Titel: Staff-Name

Untertitel/Badge: role_label

Farbbalken: color des Staff (oder der Shift-Override).

Drag & Drop:

Verschieben: updated start_at/end_at.

Resize: ändert end_at.

Konfliktprüfung (siehe Validierungen): bei Konflikt Abbruch + JS alert().

Toolbar

+ (oben rechts): „Create Shift“ (Modal).

Week navigation / Today / Now (springt zur roten Linie).

„Create Shift“ Modal

Pflicht: Staff Member (Dropdown mit Suche, nur aktive), Role (aus Labels des Staff; Auswahl aus Systemlabels), Start Time, End Time, Date.

Optional: Frequency (None, Daily, Weekly, Custom), BYDAY (bei Weekly), Count/Until, Notes, Color (wenn Override gewünscht).

Bedienung:

Staff lässt sich zusätzlich per Drag-&-Drop aus einer (einblendbaren) seitlichen Staff-Liste in ein Timeslot ziehen → öffnet Modal mit vorausgefüllten Feldern.

Close: X (oben & unten rechts).

Save: Diskette → bei Erfolg alert('Shift erstellt: H-XXXXXXXXXX').

„Edit Shift“ Modal

Öffnet per Klick auf Shift oder Kontextmenü.

Felder wie Create; zusätzlich:

Serienverhalten, wenn recurrence_rule gesetzt:

„Nur dieses Vorkommen ändern“ | „Dieser und alle folgenden“ | „Gesamte Serie“

Löschen (mit gleicher Serienwahl).

Aktionen:

Speichern → alert('Shift aktualisiert')

Löschen → JS-Bestätigung, dann alert('Shift gelöscht')

Validierungen & Regeln

Aktiver Staff: staff.active === true, sonst alert('Staff ist inaktiv und kann nicht verplant werden').

Zeitlogik:

end_at > start_at.

Nur tagesweise Schichten (kein Über-Nacht) – wenn doch, alert('Shifts dürfen nicht über Mitternacht gehen').

Konflikte:

Kein Doppelbooking derselben Person: Prüfe Überschneidung mit existierenden Shifts (staff_id, time overlaps). Bei Konflikt alert('Konflikt: Überschneidung mit bestehender Schicht') und Aktion verwerfen.

Rollen & Labels:

role_label muss in staff.labels enthalten sein; wenn nicht, alert('Mitarbeiter hat dieses Label nicht') oder erlauben mit Warnung – bitte Präferenz nennen.

Recurrence:

Serien erzeugen N Vorkommen (oder bis UNTIL) serverseitig oder als Parent + Exceptions – aber persistiert, keine „virtuellen“ Mock-Instanzen.

Beim Bearbeiten/Löschen Serien-Entscheid zwingend abfragen.

Mandanten-Scope:

Jede Operation prüft camp_id und verhindert Cross-Camp-Zugriffe.

Farbe:

Wenn Staff-Farbe fehlt, generiere deterministisch (Hash aus staff_id).

API/DB – Beispielhafte Endpunkte (ohne Implementierung)

GET /api/shifts?camp_id=&from=&to= → alle Shifts für die sichtbare Woche.

POST /api/shifts → Create (gibt shift_id zurück).

PATCH /api/shifts/{shift_id} → Update (inkl. Serien-Modus in Payload).

DELETE /api/shifts/{shift_id} → Delete (Body: Serien-Modus).

GET /api/staff?camp_id=&active=true → Quelle für Staff-Dropdown/Sidebar.

Wichtig: Alle Antworten/Mutationen arbeiten mit echten DB-Daten (keine Hardcodes). Nach Erfolg: Kalender live neu laden/aktualisieren.

Performance & UX

Laden „lazy“: nur sichtbare Woche (from/to).

Debounce bei Drag/Resize (z. B. 300 ms) und optimistic UI nur nach Server-OK finalisieren.

Schnelle Suche im Staff-Dropdown (Client-Filter nach erstem Fetch oder Server-Query).

Sicherheit & Audit

Auth: nur eingeloggte Admin-Rolle.

Jede Mutation protokolliert created_by/updated_by + Timestamp.

Serverseitige Validierungen spiegeln alle Client-Checks (keine Logik nur im Frontend).

Akzeptanzkriterien (Tests)

Wochenansicht zeigt 24h-Raster, „Now“-Linie sichtbar.

+ öffnet Create-Modal; Speichern erzeugt shift_id nach Schema, alert() mit Erfolg, Shift erscheint farbig im Kalender.

Drag/Resize aktualisiert Zeiten; bei Konflikt Abbruch + alert(); bei Erfolg persistiert + alert().

Nur aktive Staff sind auswählbar; inaktive verursachen alert().

Rollenprüfung greift (Label mismatch → alert() oder gewünschtes Verhalten).

Serien: Anlegen Weekly → alle Vorkommen sind in DB; Edit/Delete fragt „Nur dieses / Folgende / Ganze Serie“ und wirkt korrekt.

Keine Overnight-Shifts möglich (Validierung).

Klick auf Shift öffnet Edit-Modal; Änderungen werden gespeichert und sofort angezeigt.

Löschen entfernt den Shift (bzw. Serien-Variante) aus DB und UI; alert('Shift gelöscht').

Kalender-Seite (global) enthält keine Shifts; Shifts-Seite enthält nur Shifts.

Shifts — finale Spezifikation (mit deinen Defaults)
IDs & Entitäten

Shift-ID: H-XXXXXXXXXX (0–9, A–Z).

Weitere IDs wie zuvor (S-/G-/M-/L-/E-/U-…).

Datenmodell (relevant)

Shift

shift_id (H-…)

camp_id

staff_id (nur aktive Staff wählbar)

role_label (z. B. host/teacher/instructor/kitchen/maintenance/other)

start_at, end_at (ISO 8601, Camp-TZ)

color (Standard = Staff-Farbe, pro Shift überschreibbar)

recurrence_rule (optional; dient nur zur Nachverfolgung der Serie)

recurrence_parent_id (zeigt auf das erste Vorkommen der Serie)

notes?

is_active (für evtl. Soft-Deaktivierung einzelner Occurrences)

Audit: created_at/updated_at/created_by

Serie = echte Child-Instanzen

Beim Anlegen einer Wiederholung werden alle Occurrences als einzelne Shifts in der DB erzeugt (eigene H-… IDs).

recurrence_parent_id verknüpft alle Child-Shifts mit dem Parent.

Regeln & Validierung

Aktiver Staff erforderlich; inaktive werden im UI ausgeblendet (Auswahl) und serverseitig abgewiesen.

Zeitlogik: end_at > start_at, keine Overnight-Schichten (Mitternacht-Grenze).

Konflikte: Kein Doppelbooking desselben staff_id mit Zeitüberlappung → alert('Konflikt: Überschneidung …') und Aktion abbrechen.

Rollen-Mismatch: erlaubt, aber mit Warn-Alert:
alert('Hinweis: Staff hat das Label „X“ nicht. Trotzdem zuweisen?')
→ OK = fortfahren und speichern; Cancel = Abbruch.

Mandanten-Scope: Alle Operationen scopen auf camp_id.

UI/UX

calendar.js, Week view (7 Tage), 24h Raster, „Now“-Linie.

Shifts als farbige Blocks:

Titel: Staff-Name

Badge/Untertitel: role_label

Farbe: Staff-Farbe oder Shift-Override

Toolbar: Prev / Today / Now / Next, + (Create Shift).

Drag & Drop: Move/Resize mit Live-Konfliktprüfung (Alert bei Konflikt, Revert).

Create Modal (X oben & unten, Diskette speichern):

Staff (nur aktive, Such-Dropdown + optional DnD aus Staff-Liste)

Role (Label-Auswahl)

Date, Start, End

Recurrence: None | Daily | Weekly | Custom (BYDAY, COUNT/UNTIL)

Notes?, Color?

Speichern → echte Child-Shifts werden erzeugt → alert('Shift erstellt: H-XXXXXXXXXX …')

Edit Modal (Klick auf Shift):

Felder wie Create

Bei Serien: „Nur dieses Vorkommen“ | „Dieser & folgende“ | „Gesamte Serie“ (wirken auf Child-Instanzen; „& folgende“ = finde Kinder mit Start ≥ aktuellem Start).

Löschen (gleiche Serien-Optionen), Bestätigen via JS confirm() → alert('Shift gelöscht').

API (ohne Code)

GET /api/shifts?camp_id&from&to

POST /api/shifts → erzeugt 1..N Child-Shifts

PATCH /api/shifts/{shift_id} (+ Serien-Scope im Body)

DELETE /api/shifts/{shift_id} (+ Serien-Scope)

GET /api/staff?camp_id&active=true

Alle Operationen lesen/schreiben echte DB-Daten. Nach Erfolg wird der Kalender aktualisiert. Alle Meldungen sind JS alert()/confirm() (keine DOM-Toasts).

Akzeptanzkriterien (Update)

H-XXXXXXXXXX wird für jeden neuen Shift (und alle Serien-Kinder) generiert.

Rollen-Mismatch zeigt Warn-Alert, Zuweisung ist möglich.

Serien erzeugen persistierte einzelne Shifts; Edit/Delete können „nur dieses/folgende/alle“ korrekt anwenden.

Drag/Resize verhindert Doppelbookings (Alert + Revert).

Inaktive Staff sind nicht auswählbar; Server lehnt sie ebenfalls ab.

Alle Alerts sind JS-Alerts (Erfolg & Warnungen).

Globaler Kalender zeigt keine Shifts; Shifts-Seite zeigt nur Shifts der Woche.

Alle Daten stammen aus der DB (keine Mockdaten) und sind mandantensicher (camp_id).