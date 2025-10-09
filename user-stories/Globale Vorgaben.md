Globale Vorgaben
1) Einheitliches ID-Schema (alle Entitäten)

Geltung: Meals, Lessons, Events, Staff, Guests, Equipments.

Format:
<Prefix>-<Randteil>

Prefix (1 Buchstabe):

Meals: M

Lessons: L

Events: E

Staff: S

Guests: G

Equipments: U (für “Equipment / Utilities”)

Randteil: genau 10 Zeichen, Zeichenvorrat A–Z, 0–9 (uppercase), keine Sonderzeichen.

Beispiele:

M-8K0F2Z9Q1T (Meal)

L-1A4B9Z6K7P (Lesson)

E-0Z2X9C7V5B (Event)

S-7Q2W9E1R6T (Staff)

G-3N8M4K2L1J (Guest)

U-9H7G6F5D3S (Equipment)

Erzeugung (implizite Logik, kein UI):

Randteil kryptografisch zufällig erzeugen.

Kollisionsprüfung gegen Datenbank (transaktional). Bei Kollision neue ID generieren.

IDs sind unveränderlich (Write-Once), werden bei Create vergeben, nie recycelt.

Case-insensitive Speicherung, aber kanonische Ausgabe in UPPERCASE.

Validierung (Server-Side):

Muss exakt Regex entsprechen: ^[MLESGU]-[A-Z0-9]{10}$.

400 bei ungültigem Format in Requests.

409 bei Kollision (nur falls Client IDs liefert; Standard ist Server-Generierung).

Datenbank/Indexing:

Pro Tabelle eindeutiger Index auf der ID-Spalte.

Für Abfragen via ID immer Index nutzen (Primary Key oder Unique Key).

Rückwärtskompatibilität / Migration:

Legacy-Datensätze ohne ID bekommen beim Migrationsskript nachträglich eine gültige ID (prefix gemäß Entität), audit-geloggt.

APIs liefern ID künftig immer in Responses, Requests akzeptieren sowohl interne DB-PKs (falls vorhanden) als auch die neue Public ID, bevorzugt Public ID.

Akzeptanzkriterien (stichprobenartig):

Beim Erstellen eines Meals wird M-XXXXXXXXXX generiert, bleibt stabil, ist in UI-Cards sichtbar und per GET abrufbar.

Ein Versuch, eine falsche ID zu POSTen (z. B. M-xyz) wird abgelehnt (400).

100.000 Test-Erstellungen erzeugen 0 Kollisionen; Kollision-Pfad triggert Neugenerierung und führt zu einem gültigen Insert.

2) Alerts-Policy (systemweit)

Grundsatz:
Alle Laufzeit-Benachrichtigungen im Admin-/Staff-Frontend sind strict JavaScript alert()—keine DOM-Banner, keine Toaster, keine modalen HTML-Dialoge für Status-Meldungen.

Gilt für:

Erfolgsfeedback (z. B. „Meal gespeichert“).

Warnungen (z. B. „Gast bereits einer Lesson zugewiesen – wird verschoben?“).

Fehler (z. B. Validierungsfehler, Netzwerkfehler, 4xx/5xx).

Systemhinweise (z. B. „Keine Änderungen vorgenommen“).

Gestaltung:

Text ist kurz, eindeutig, aktionsbezogen.

Kein HTML, reiner Text.

Enthält bei Bedarf konkrete IDs zur Nachvollziehbarkeit (z. B. E-0Z2X9C7V5B).

Mehrschrittige Bestätigungen (z. B. „Verschieben?“) erfolgen via confirm(); reine Hinweise via alert().

Wann kein Alert:

Formulareingaben (z. B. Pflichtfeld leer) werden serverseitig validiert und als Fehler-Alert zurückgemeldet; rein visuelle Inline-Hinweise ohne Alert sind nicht erlaubt (Policy).

Hintergrund-Events (automatische Repeats, CRON) erzeugen keine Alerts im Frontend; sie werden geloggt.

Akzeptanzkriterien:

Nach „Create Event“ (erfolgreich): sofortiger JS-alert("Event E-XXXXXXXXXX erstellt.").

Bei Doppelzuweisung eines Guests: confirm("Gast G-XXXXXXXXXX ist bereits zu Lesson L-XXXXXXXXXX zugeordnet. Jetzt verschieben?").

Bei API-Fehler 422: alert("Fehler: Ungültige Eingabe – Cutoff Time fehlt.").

Keine DOM-Toasts oder Banner sichtbar; QA prüft den Codepfad auf ausschließlich alert()/confirm().

3) Auswirkungen auf Module (kurz)

Meals / Lessons / Events / Guests / Staff / Equipments:

Erstellen: ID wird vergeben, in UI-Listen & Detail-Modals angezeigt.

Kopieren/Duplizieren: erhält neue ID mit passendem Prefix.

Publish/Unpublish/Delete/Assign: nach erfolgreichem Server-Commit erfolgt JS-Alert mit Aktion + betroffener ID.

Verknüpfungen (z. B. Kitchen Overview ↔ Staff Overview, Lesson ↔ Guests, Inventory ↔ Equipments) referenzieren Entitäten immer über deren Public ID.

Suche/Filter im UI:

Eingabe einer ID (z. B. G-…) springt direkt zum Datensatz.

Freitextsuche kann ID-Pattern erkennen und bevorzugt behandeln.

Logging/Audit:

Jede Änderung (Create/Update/Delete/Assign/Publish) speichert die Public ID in Audit-Trails.

Alerts müssen nicht geloggt werden; die zugrunde liegenden Server-Events schon.

4) Testfälle (repräsentativ)

ID-Erzeugung pro Entität

Create 1x Meal/ Lesson/ Event/ Staff/ Guest/ Equipment → jeweils korrektes Prefix + 10 Zeichen A–Z0–9.

Validierung / Ablehnung

POST mit M-123 → 400 + Fehler-Alert.

Kollision

Simulierte ID-Kollision → Server generiert neue ID, Insert erfolgreich, JS-Alert meldet finale ID.

Alert-Durchgängigkeit

Erfolgreiches Update → „Gespeichert“-Alert.

Delete → Confirm-Dialog, nach Erfolg „Gelöscht“-Alert mit ID.

Zuweisung Gast↔Lesson (führt zu Konflikt) → Confirm („verschieben?“) + Erfolg/Abbruch-Alert.

Verknüpfungen via ID

Kitchen Overview zeigt Bestelllisten; Detail-View öffnet Guests per G-…; Klick navigiert konsistent.