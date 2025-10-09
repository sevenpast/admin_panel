Surf Lessons – Produkt-/Tech-Beschreibung
Ziel & Umfang

Surf-Lektionen für Camp-Gäste planen, veröffentlichen und auswerten.

Drei Bereiche:

Package Guests (alle aktiven Gäste im Surf-Package),

Lesson Management (Anlegen/Verwalten von Lessons & Theorie),

Assessment Questions (Fragenkatalog für das Skill-Assessment).

Läuft im Admin Panel (Desktop/iPad). Daten sind mandantenfähig pro camp_id.

Datenquellen & Verknüpfungen (keine Mockdaten!)

Guests: guests (id, camp_id, name, is_active, in_surf_package, room_id, bed_id, …).

Staff: staff (id, camp_id, name, roles[], is_active). Instructor = Rolle instructor.

Lessons: lessons (id, camp_id, title, category['lesson'|'theory'|'other'], location, start_at, end_at, status['draft'|'published'], alert_time (optional), alert_text (optional), created_by, …).

Lesson↔Instructor: lesson_instructors (lesson_id, staff_id).

Lesson↔Guest: lesson_guests (lesson_id, guest_id, assigned_at).

Constraint: Ein Gast darf pro Kalendertag max. eine lesson und max. eine theory haben (je 1). Nie zwei Lessons am selben Tag.

Assessments:

assessment_questions (id, camp_id, text, scale_labels json [1..5], category tag optional).

guest_assessment_answers (guest_id, question_id, value 1..5 | null).

guest_surf_level (guest_id, level['beginner'|'intermediate'|'advanced'], set_by, set_at).

Inventory (Material): z. B. gear_items (id, camp_id, type, size, status, assigned_to_guest_id | null).

Material-Zuordnung verlinkt zu Guests. Anzeige in Lessons zieht nur lesend aus Inventory.

Mandanten-Sicherheit: Jede Query strikt gefiltert auf camp_id.

Bereich 1 – Package Guests (Tab)

Zweck: Überblick & Pflege der surf-relevanten Daten pro Gast.

UI-Inhalte (Liste):

Spalten: Name + Guest-ID (Format: G-XXXXXXXXXX), Level (oder „Nicht zugewiesen“), Brett/Material (aus Inventory; mehrere Einträge mit „;“ getrennt), Actions: 👁️ View, 📦 Material zuweisen.

Oben rechts Button: „X Active Surf Package Guests“ (Zahl der aktiven Package-Gäste).

Aktionen:

View (Assessment Viewer & Level setzen – Modal)

Oben: „Guest Assessment: {Name} ({GuestID})“.

Tabelle aller Assessment Questions mit Status:

Response: 1..5 oder „Not answered“.

Status: Pending wenn null, sonst Answered.

Assign Surf Level: Buttons „Beginner“, „Intermediate“, „Advanced“.

Beim Klick: Level in guest_surf_level persistieren (Audit: set_by, set_at).

Controls: oben rechts X, unten rechts Close. Speichern erfolgt sofort beim Level-Klick.

Material zuweisen (Modal)

Kopf: „Material Management – {Name} ({GuestID})“.

Sektion A: Zugewiesene Materialien (live aus Inventory).

Sektion B: Verfügbare Materialien (gefiltert auf camp_id, free status). Auswahl per Add/Remove.

Persistenz: schreibt in Inventory (z. B. gear_items.assigned_to_guest_id = guest_id).

Controls: oben X, unten Speichern (Diskette) & Abbrechen.

Akzeptanzkriterien (Auszug):

Es erscheinen nur Gäste mit is_active = true und in_surf_package = true.

Level-Änderung im Modal ist sofort in der DB sichtbar und erscheint:

in der Tabellen-Spalte „Level“,

im Guest-Management (Assessment-Ansicht).

Materialliste entspricht exakt Inventory-Daten (keine Duplikate, richtige Größen/Typen).

Alle Queries gefiltert auf camp_id.

Bereich 2 – Lesson Management (Tab)

Zweck: Erstellen/Verwalten von Lessons & Theorie-Sessions. Navigation per Datum (Heute; Pfeile ±1 Tag).

Liste (tagesaktuell):

Spalten: Title, Category (Badge: Lesson/Theory/Other), Location, Time (Start–Ende, 24h), Instructors (kommasepariert), Status (Draft/Published), Guests (z. B. „6 guest(s)“), Actions.

Actions (Icons):

👁️ View: Detail modal (alle Felder, Instructors, Teilnehmer-Namen (read-only)).

✏️ Edit: Modal mit allen Feldern (s. unten).

🗐 Duplicate: Kopie erzeugen (Title „(Kopie)“ anhängen), Status = draft, gleiches Datum/Uhrzeit/Inhalte.

👤➕ Assign Guests: Modal zum Zuweisen/Entfernen (mit harten Regeln, s. unten).

🌍 Publish/Unpublish: Status toggeln; published = in der Gast-App sichtbar (unpublish = draft).

🗑️ Delete: Hard delete inkl. Beziehungen (lesson_instructors, lesson_guests).

Create/Edit – Modal (Pflichtfelder außer Alert):

Title*, Category* (lesson | theory | other),

Location*,

Start Time*, End Time* (24h, Datum + Uhrzeit),

Instructors*: 1..N aus staff mit Rolle instructor und is_active=true.

Alert Time (optional, 24h) & Alert Text (optional): Für Push-Hinweis (späteres System).

Description (mehrzeilig).

Controls: oben X, unten Speichern (Diskette) & Abbrechen.

Assign Guests – Modal

Links: Verfügbare Gäste = alle is_active = true AND in_surf_package = true, die am selben Tag noch keiner anderen Lesson/Theory der gleichen Kategorie zugewiesen sind.

Rechts: Zugewiesene Gäste (aktuelle Lesson).

Beim Zuweisen prüft das System:

Ein Gast darf am Tag genau 1 Lesson und genau 1 Theory haben (je Kategorie max. 1).

Bei Konflikt: Warnhinweis („{Name} ist bereits in {Lesson A} am {Datum}. Entfernen?“) mit Option:

„Verschieben“ ⇒ Gast wird aus alter Lesson entfernt und zur aktuellen hinzugefügt (transaktional).

„Abbrechen“ ⇒ keine Änderung.

Nach erfolgreicher Änderung: Gästezahl in der Liste aktualisiert.

Business-Regeln

Zeiten: end_at > start_at.

Status:

Draft = intern sichtbar.

Published = Gast-App sichtbar.

Instructoren dürfen mehrere Sessions pro Tag haben.

Gäste: siehe Ein-Lesson-Pro-Tag-Regel je Kategorie.

Akzeptanzkriterien (Auszug):

Create/Edit persistiert alle Felder in lessons und lesson_instructors.

Duplicate erstellt neuen Satz mit neuer ID, kopiert alle Relationen ohne lesson_guests.

Assign Guests erzwingt die Kategorie-Regel (Lesson vs. Theory). „Verschieben“ ist atomar (kein Zwischenzustand).

Publish schaltet status='published' – die Lesson ist via API/App sichtbar.

Delete entfernt Lesson + Relations (FK on delete cascade empfohlen).

Bereich 3 – Assessment Questions (Tab)

Assessment (Aktualisierte Beschreibung)

Funktion:
Das Surf Assessment ermöglicht es Admins, Fragen zu erstellen und zu verwalten, mit denen Gäste ihr Surf-Level anhand von Skalen beantworten. Die Antworten fließen direkt in die Datenbank und bilden die Grundlage für die spätere Level-Zuweisung (Beginner, Intermediate, Advanced).

Inhalt & Felder beim Erstellen einer Frage (Modal Window „Add Assessment Question“):

Question: Freitextfeld, Pflichtfeld.

Category (Dropdown): Auswahl der Frage-Kategorie, z. B.

Experience (Erfahrung)

Safety (Sicherheit)

Preferences (Präferenzen)

Goals (Ziele)

Required Question (Checkbox): Markiert, ob die Frage verpflichtend beantwortet werden muss. Standardmäßig aktiv.

Scale Labels (1–5):

Jede Zahl (1–5) erhält eine frei definierbare Beschriftung (z. B. „Gar nicht sicher“ bis „Sehr sicher“).

Darstellung im UI als horizontale Reihe mit klar erkennbaren Buttons.

Preview-Bereich: Zeigt die Frage mit den Labels so an, wie sie später im Assessment erscheinen wird.

Darstellung für Gäste/Instruktoren:

Gäste beantworten die Fragen über die Skala (1–5).

Instruktoren sehen die Antworten im „View“-Modal des jeweiligen Gastes → Antworten pro Frage inkl. Kategorie, Antwortwert (1–5), Label & Status (answered/pending).

Level-Zuweisung:

Basierend auf den Antworten können Instruktoren im „View“-Modal direkt ein Surf-Level (Beginner, Intermediate, Advanced) zuweisen.

Zuweisung wird in der Datenbank gespeichert (keine DOM-Aktion, keine Mockdaten).

Akzeptanzkriterien:

 Fragen lassen sich mit Kategorie, Pflichtstatus und Skalenlabels erstellen.

 Alle Fragen werden direkt in der Datenbank gespeichert und sind global für das Camp verfügbar.

 Gäste sehen nur die aktiven Fragen im Surf Assessment.

 Antworten werden persistent gespeichert und sind für Admins/Instruktoren jederzeit einsehbar.

 Level-Zuweisung ist nur durch Instruktoren möglich und überschreibt ggf. eine vorherige Zuweisung.

 Alle Daten (Fragen, Antworten, Level) werden dynamisch aus der Datenbank gezogen, keine Mockdaten.

Aktiv-Flag.

Änderungen wirken sofort:

In Package Guests → View erscheinen neue/angepasste Fragen.

Antworten der Gäste liegen in guest_assessment_answers.

Akzeptanzkriterien (Auszug):

Fragen sind camp-scoped (nur eigenes Camp sichtbar).

Deaktivierte Fragen werden in neuen Modals nicht angezeigt (bestehende Antworten bleiben erhalten).

Antwort-Updates eines Gastes überschreiben den vorherigen Wert (Audit optional).

Validierungen

Datums-/Zeitangaben: ISO + 24h UI, end_at > start_at.

Instructor-Auswahl nur aktive Staff mit Rolle instructor.

Beim Publish ist min. 1 Instructor Pflicht.

Bei Guest-Zuweisung: Kategorie-Konfliktprüfung zwingend.

Alle Queries streng nach camp_id gefiltert.

Berechtigungen

Admin: Vollzugriff auf alle Tabs & Aktionen.

Staff (Instructor/Host): Optional eingeschränkte Rechte (z. B. Assign Guests, View), konfigurierbar.

Guest: Sieht nur veröffentlichte Lessons in der App (nicht Teil dieses Admin-Prompts).

Telemetrie / Audit (empfohlen)

Logge: create/edit/publish/unpublish/assign/duplicate/delete (Wer? Wann? Was?).

Akzeptanztests (Gherkin – Auszug)

Package Guests – Level setzen

Given ein aktiver Gast im Surf-Package ohne Level
When ich im Package-Guests-Tab "View" öffne und "Intermediate" wähle
Then wird der Level in guest_surf_level gespeichert
And die Liste zeigt "Intermediate" ohne Reload


Package Guests – Material zuweisen

Given ein freies Board im Inventory
When ich im Material-Modal das Board zuweise und speichere
Then steht im Inventory assigned_to_guest_id = Gast-ID
And in der Tabelle erscheint das Board unter "Material"


Lesson erstellen

Given aktive Instructoren existieren
When ich eine Lesson mit Titel, Kategorie, Location, Start/Ende, 1 Instructor speichere
Then entsteht ein Datensatz in lessons + lesson_instructors
And Status ist "Draft"


Publish

Given eine Draft-Lesson mit allen Pflichtfeldern
When ich Publish klicke
Then status = 'published'
And die Lesson ist via API/App sichtbar


Assign Guests – Konfliktregel

Given Gast A ist bereits in einer Lesson am 2025-09-24
When ich Gast A einer zweiten Lesson am selben Tag zuordnen will
Then erhalte ich eine Warnung
And wähle ich "Verschieben", ist Gast A nur in der neuen Lesson


Duplicate

Given eine veröffentlichte Lesson
When ich Duplicate klicke
Then entsteht eine neue Draft-Lesson mit "(Kopie)" im Titel
And ohne übernommene Teilnehmer


Delete

Given eine Lesson mit zugewiesenen Gästen/Instruktoren
When ich sie lösche und bestätige
Then sind Lesson + Relationen entfernt (keine Orphans)

Nicht-Funktionales

Performance: Listen lazy-laden/paginiert; Modals nur relevante Daten nachladen.

Zeitformat: konsequent 24h.

Responsives Layout (Desktop/iPad).

Barrierefreiheit: Fokus-Management in Modals, Tastaturbedienung.

Wichtig: Bitte keine bestehenden, stabilen Seiten unbeabsichtigt verändern (z. B. „Meals“ Layout, wenn nicht in diesem Prompt erwähnt). Nur die oben beschriebenen Anpassungen umsetzen.