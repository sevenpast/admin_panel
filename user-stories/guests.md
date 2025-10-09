Ziel & Geltungsbereich

Verwalten von Camp-Gästen (anlegen, ansehen, bearbeiten, löschen) im Admin-Panel. Jeder Admin sieht ausschließlich Daten seines Camps (Mandanten-Trennung). Änderungen wirken systemweit (Meals, Surf Lessons, Inventory, Alerts).

Navigation & Zugriff

Link in der linken Nav: Guests (Icon vor Text).

Rechts oben in der Header-Leiste der Seite: Plus-Icon (ohne Text) zum Erstellen eines Gastes.

Rollenberechtigung: Nur Admin (Camp-Admin) darf CRUD; Staff hat i. d. R. Read-only (falls später erlaubt).

Listenansicht (Guest Management)
Kopfzeile

Suchfeld: „Search by name…“ (debounced; Groß/Kleinschreibung ignorieren).

Filter (Dropdowns):

Packages: All / In Surf Package / Not in Surf Package

Rooms: All Rooms + einzelne Zimmer

Status: All Status / Active / Inactive

Spalten

Name + ID

Name (Vollname)

ID im Format G-XXXXXXXXXX (10 Zeichen, Großbuchstaben A–Z + Ziffern 0–9; systemgeneriert, eindeutig).

Active (Badge: Active / Inactive)

Bedeutet „im Haus“ und stimm-/teilnahmeberechtigt. Default beim Erstellen: aktiv.

Surf Package (Badge: Ja / Nein). Default beim Erstellen: Ja.

Room (Zimmernummer) – klickbar, führt zu der Zimmer-Detailseite (später).

Bed – Bettkennung (z. B. A1, B2).

Actions (nur Icons, kein Text):

👁️ View

✏️ Edit

🗑️ Delete

Datenquelle

Alle Einträge kommen direkt aus der Datenbank (Mandanten-gefiltert). Keine Mockdaten.

Akzeptanzkriterien – Liste

 Suchfeld filtert live nach Name (Vor-/Nachname, Teiltreffer).

 Alle Filter können kombiniert werden; „Clear all“ setzt zurück.

 Spalten zeigen Daten 1:1 aus DB (Room/Bed aus Inventory-Relation).

 Paginierung/Infinite Scroll bei >50 Gästen (Performance).

 Keine Gäste anderer Camps sichtbar (RLS).

Gast erstellen (Modal, 2 Tabs)

Öffnen: Plus-Icon (rechts oben) → Modal „Create Guest“.

Tab 1: Personal Information

Felder:

Name (Pflicht)

Mobile Number (optional)

Instagram (optional; plain text/handle)

Room (Dropdown) – listet nur Zimmer des Camps

Bed (Dropdown) – listet nur aktuell freie Betten des gewählten Zimmers (Single/Double-Logik aus Inventory respektieren)

Checkboxes (standardmäßig aktiv):

Included in surf package

Active

Allergies (vordefinierte Badges zum Aktivieren/Deaktivieren: Nuts, Dairy, Gluten, Shellfish, Eggs, Soy, Fish, Sesame)

Other Allergies (Freitext)

Tab 2: Surf Assessment

„Fragen“ sind nicht hier definiert, sondern kommen später aus „Lessons“ (Asssessment-Katalog).

Darstellung: alle aktiven Fragen (1–5 Skala Buttons). Standard: „nicht beantwortet“.

Optional; kann leer bleiben.

Buttons im Modal

Oben rechts: X (Abbrechen)

Unten rechts: Diskette (Speichern) und X (Abbrechen)

Validierung & Logik beim Speichern

Name ist Pflicht; Room/Bed optional – wenn Room gewählt → Bed Pflicht.

Bed-Dropdown zeigt ausschließlich freie Betten (aus Inventory, Echtzeit).

Beim Speichern:

ID generieren: G-XXXXXXXXXX (kollisionsfrei).

Belegt-Status setzen: Wird ein Bed ausgewählt, markiere dieses Bett als occupied (für Single-Bed: 1/1; Double-Bed: 1/2 bzw. 2/2).

Gast-Datensatz speichern inkl. Allergien, Surf Package, Active.

Assessment-Antworten (falls vorhanden) in eigener Tabelle (guest_assessments) relational speichern (guest_id, question_id, value).

Nach Erfolg: Liste aktualisieren; neuer Gast sichtbar.

Akzeptanzkriterien – Create

 Freie Betten werden korrekt aus Inventory ermittelt (keine belegten).

 Speichern belegt Bett konsistent (inkl. Double-Bed-Kapazität).

 Gast-ID erfüllt Format & Eindeutigkeit.

 Assessment (falls beantwortet) wird relational gespeichert.

 Defaults: Active = true, Surf Package = true.

View (👁️)

Öffnen: Icon „View“ in der Liste → Modal „Guest Details“.

Inhalt – Tab „Information“

Name, Mobile, Instagram

Guest ID

Surf Package (Ja/Nein) & Status (Active/Inactive)

Allergies & Other Allergies

Room + Bed (aktuelle Zuordnung)

QR-Code (einzigartig, read-only) mit folgendem Payload (JSON-Schema als Textbeschreibung):

guest_id, name, camp_id, room_id, bed_id, surf_package, active, generated_at
(zwecks Check-In/Scan-Flows später)

Inhalt – Tab „Surf Assessment“

Liste aller Fragen & konkrete Antworten (1–5) des Gastes; keine Level-Labels.

Akzeptanzkriterien – View

 QR enthält die beschriebenen Felder; prüfbar durch Scan.

 Assessment zeigt exakt gespeicherte Antworten.

 Room/Bed spiegeln DB-Belegung wider (live).

Edit (✏️)

Öffnen: Icon „Edit“ → Modal „Edit Guest“ mit denselben zwei Tabs.

Änderungen erlaubt

Personal Data: Name, Mobile, Instagram, Allergien/Other

Room/Bed: Wechsel nur auf freie Kapazitäten (Inventory-Prüfung in Echtzeit).

Flags: Surf Package, Active

Assessment-Antworten (1–5) editierbar

Logik bei Room/Bed-Wechsel

Altes Bett freigeben (Belegung −1), neues Bett belegen (Belegung +1), konsistent zur Single/Double-Logik.

Logik bei „Active“ → Inactive

Sofortige Entkopplung von:

Bed (Bett freigeben)

Meal-Counts (Teilnahmeberechtigung entziehen, aber Historie behalten)

Surf Lessons (aus zukünftigen Zuweisungen entfernen; Historie behalten)

Events (aus zukünftigen Anmeldungen entfernen; Historie behalten)

Hinweisdialog vor dem Speichern (Konsequenzen).

Akzeptanzkriterien – Edit

 Bettwechsel setzt Inventar-Belegung korrekt um (alt frei, neu belegt).

 Inaktiv-Schaltung entfernt zukünftige Zuweisungen (keine Geister-Counts).

 Änderungen sind sofort in Liste/Dashboards sichtbar (kein Cache-Stall).

Delete (🗑️)

Ablauf: Klick → Bestätigungsdialog (Warnung: „Vorgang löscht Gast permanent inklusive aller Zuweisungen“).

Konsequenzen

Hard Delete des Guest-Datensatzes.

Bett freigeben (Belegung −1).

Zukünftige Meal/Events/Lessons-Zuweisungen entfernen.

Historische Auswertungen dürfen anonymisiert bestehen bleiben (optional: soft-delete-Felder, falls gewünschte Historie).

Akzeptanzkriterien – Delete

 Nach Bestätigung ist Gast nicht mehr auffindbar.

 Inventar-Belegung ist korrekt aktualisiert.

 Zukünftige Bezüge sind entfernt; keine Inkonsistenzen in Counts.

Datenmodell (Vorschlag ohne Code)

guests: id (uuid), guest_code (G-…); camp_id; name; mobile; instagram; active (bool); surf_package (bool); created_at/updated_at.

guest_allergies: guest_id, allergy_key, other_text (nullable).

rooms, beds (Inventory, bestehend): bed has fields capacity, occupied_count, room_id, camp_id.

guest_bed_assignments: guest_id, bed_id, assigned_at, released_at (nullable).

guest_assessments: guest_id, question_id, value (1–5), answered_at.

rls/tenancy: alle Tabellen camp_id-scoped.

Integrationen & Seiteneffekte

Inventory: Bettbelegung muss atomar konsistent sein (Transaktion).

Meals/Events/Surf Lessons:

Active=false → Teilnahmeberechtigung entziehen für Zukunft.

Surf Package steuert Sichtbarkeit in „Surf Lessons → Overview“.

QR: Wird für Check-In/Scan-Flows genutzt (später).

Validierung & Fehlerfälle

Bed darf nicht doppelt belegt werden (Race Conditions absichern).

Wechsel auf ein bereits belegtes Bed blocken mit klarer Fehlermeldung.

Pflichtfelder prüfen; verständliche Inline-Fehler.

Netzfehler: keine UI-Desyncs (optimistische Updates nur nach Erfolg).

Nicht-funktionale Anforderungen

Keine Mockdaten: Alle Zahlen/Karten/Listen kommen aus der DB.

Performance: Indizes auf (camp_id, name), (camp_id, active), (camp_id, room_id/bed_id).

Sicherheit: RLS/Scopes strikt; nur Camp-Daten sichtbar.

Audit (optional): Änderungen an Guest/Assignments in Audit-Tabelle protokollieren.

Barrierefreiheit: Icons mit Tooltips, Fokus-Reihenfolge, ESC schließt Modals.

Sprache: UI-Texte englisch; Prompts/Specs können deutsch sein.

Abnahme-Checkliste (Kurz)

 Liste zeigt echte DB-Daten, Filter/Suche funktionieren kombiniert.

 Create erzeugt Gast + (optional) Bettzuweisung; ID-Format korrekt.

 Edit kann Bettwechsel + Flags; Inventory-Belegung konsistent.

 Inaktiv setzt zukünftige Zuweisungen zurück.

 Delete entfernt Gast & Bezüge, gibt Bed frei.

 View zeigt QR + alle Daten; Assessment korrekt.

 Keine Daten anderer Camps sichtbar.

Wichtig: Bitte keine stabilen Seiten unbeabsichtigt verändern. Nur obige Spezifikation umsetzen und strikt echte DB-Daten verwenden.