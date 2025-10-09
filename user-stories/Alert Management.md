Alert Management — technische Spezifikation (ohne Code)

Ziel
Zentrales Modul zum Verwalten von automatischen Alerts (Push-Nachrichten) und Cutoffs (Anmelde-/Bestellfristen) für Meals, Events und Surf Lessons. Alle Regeln sind camp-lokal, arbeiten ausschließlich mit Echt­daten aus der Datenbank (keine Mockdaten) und respektieren Rollen/Status (nur aktive Gäste können benachrichtigt werden).

1) UI & UX
Navigationspunkt: Alert Management

Drei Sektionen (Accordion/Boxen):

Meal Automations (Breakfast, Lunch, Dinner)

Event Automations

Surf Lesson Automations

Rechts oben: “+” (Neuregel-Modal).

Jede Regel als Card mit:

Rule Name

Target (Meals/Events/Lessons) + ggf. Meal Type

Alert: Days before + Time + Message

Cutoff (optional): Days before + Time

Recurrence-Badge (z. B. Daily/Weekly/Custom)

Toggle aktiv/inaktiv

Actions (Icons): View, Edit, Delete

Wichtig: Alle Erfolg-/Warnhinweise im Admin-Panel sind JavaScript alert()—keine DOM-Toasts.

Modal: Create / Edit Automation Rule

Felder:

Rule Name (Pflicht)

Target (Meals | Events | Surf Lessons) (Pflicht)

Wenn Meals: Meal Type (Breakfast | Lunch | Dinner) (Pflicht)

Alert:

Days Before Event (integer, ≥0)

Time (24-h)

Message (Pflicht, Textarea)

Checkbox Send alert automatically (Default: an)

Cutoff (optional): enable + Days Before Event + Time

Schedule:

Recurring (Checkbox)

Repetition: Daily | Weekly (Mo–So Auswahl) | Monthly | Custom (Cron-ähnlich vereinfacht)

Preview-Button: zeigt Beispiel für ein konkretes Datum (read-only).

Footer: X (oben & unten rechts) zum Schließen, Diskette zum Speichern.

Card-Interaktionen

Toggle (aktiv/inaktiv): Sofortige Persistierung; JS-Alert „Aktiviert/Deaktiviert“.

View: Read-only Summary inkl. nächster geplanter Ausführung.

Edit: Öffnet Bearbeiten-Modal mit aktuellen Werten.

Delete: Sicherheits-JS-Alert, danach harte Löschung inkl. geplanter Jobs der Regel.

2) Funktionsumfang
2.1 Alerting (Push)

Unterstützte Ziele:

Meals: Frühstück (19:00), Lunch (10:00), Dinner (15:00) als Beispiele/Defaults.

Events: z. B. Yoga Di/Do; Beach-Volleyball.

Surf Lessons: z. B. Mo/Mi/Fr.

Saisonale Overrides möglich (z. B. Sommer 20:00, Winter 19:00) per eigener Season-Konfiguration (optional).

Besondere Termine (Weihnachten, Silvester, Geburtstage) via speziellen Rules (Target=Events/Special).

Versandkanal: Mobile Push (Gast-App).
– Speicherung von delivery logs (attempted/sent/opened) für Auswertung.

2.2 Cutoffs

Aktivierbar pro Regel (z. B. Breakfast cutoff 07:00 „same day“).

Wirkung: Nach Cutoff sind Gästeeingaben gesperrt.
– Wenn ein Gast trotzdem versucht zu bestellen/anzumelden: Push-Nachricht:
„Cutoff überschritten. Bitte wende dich an ein Staff-Mitglied.“
– Im Admin UI wird keine Sperre umgangen; Änderungen durch Staff sind weiterhin möglich.

2.3 Recurrence & Planung

Regeln können einmalig oder wiederkehrend sein (daily/weekly/monthly/custom).

Scheduler generiert konkrete Ausführungsjobs (Queue/Jobs-Tabelle).

Zeitzone pro Camp (Camp-Settings) – alle Zeiten 24-h, TZ-konform.

2.4 Stats (optional, später aktivierbar)

Übersichts-Karten: Versand-, Zustell-, Öffnungsraten pro Regel/Ziel.

Filter: Zeitraum, Target, Category.

3) Datenmodell (Vorschlag)

Alle Entitäten haben eine ID mit Präfix‐Format:
Meals M-XXXXXXXXXX, Lessons L-XXXXXXXXXX, Events E-XXXXXXXXXX, Staff S-XXXXXXXXXX, Guests G-XXXXXXXXXX, Equipments U-XXXXXXXXXX.
Alerts/Rules erhalten analog: A-XXXXXXXXXX.

Tables (Kernauszug):

automation_rules

id (A-XXXXXXXXXX)

camp_id (Mandantentrennung)

target (enum: meals | events | surf_lesson)

meal_type (enum: breakfast | lunch | dinner | null)

name (string)

alert_days_before (int ≥0)

alert_time (time)

alert_message (text)

send_automatically (bool)

cutoff_enabled (bool)

cutoff_days_before (int ≥0, null)

cutoff_time (time, null)

recurring (bool)

recurrence_type (enum: none | daily | weekly | monthly | custom)

recurrence_payload (json – z. B. Wochentage, Cron-like)

season_override (json, optional)

special_dates (json[], optional)

is_active (bool, default true)

created_at, updated_at, created_by (S-…), updated_by (S-…)

automation_jobs

id (uuid)

rule_id (A-…)

camp_id

target_ref_id (z. B. M-… / E-… / L-… falls an Objekt gebunden)

execute_at (datetime tz)

job_type (enum: alert | cutoff)

payload (json – aufbereiteter Text, Empfängerliste o. ä.)

status (pending | completed | failed | skipped)

result_meta (json)

created_at, updated_at

automation_deliveries

id (uuid), job_id, guest_id (G-…), device_token,
sent_at, opened_at, status (queued | sent | opened | failed), failure_reason

Integrationen:
– Meals (meals, meal_options), Events (events), Lessons (lessons) liefern Kalender-Daten und Empfängermengen (aktive Gäste / Teilnehmer im Camp).

4) Regeln & Validierungen

Camp-Scope: Admin sieht/bearbeitet nur Regeln seines Camps.

Meal-Regeln erfordern meal_type.

Zeitangaben immer 24-h; TZ = Camp-TZ.

Cutoff nur wirksam, wenn cutoff_enabled = true.

Konflikte:

Mehrere Regeln dürfen denselben Slot belegen; System führt alle aus (kein „striktes Verbot“).

Bei Überschneidungen JS-Alert beim Speichern: „Achtung, zeitliche Überschneidung mit Regel X.“

Löschen:

Regellöschung entfernt zukünftige pending Jobs (nicht rückwirkend).

Sicherheit:

Nur Rollen mit can_manage_alerts (Admin/Manager) dürfen CRUD.

Auditfelder werden gepflegt.

5) Datenflüsse (hoch-level)

Regel anlegen/bearbeiten ⇒ Speichern in automation_rules ⇒ JS-Alert „Regel gespeichert“.

Scheduler (minütlich):

Erzeugt/aktualisiert automation_jobs für „nächste fällige Zeitpunkte“ je aktiver Regel.

Job-Runner:

job_type=alert: baut Empfängerliste (aktive Gäste; nach Target gefiltert), verschickt Push, schreibt automation_deliveries.

job_type=cutoff: markiert in Zielmodulen Bestell-/Anmeldesperren für betroffene Sessions; spätere Gast-Versuche lösen Push-Warnung aus („Bitte wende dich an Staff“).

Kitchen/Staff Overview:

Anzeige basiert auf realen Aggregaten (Orders/Registrations ± Staff-Manual-Adjustments). Cutoffs sperren weitere Gast-Änderungen, Admin-Korrekturen bleiben möglich.

6) Akzeptanzkriterien (Auszug)

A. CRUD & Aktivierung

 Admin kann pro Target Regeln anlegen/bearbeiten/löschen.

 Toggle „aktiv“ setzt is_active und beeinflusst die Job-Generierung sofort.

 Beim Speichern inkl. Recurrence werden konkrete pending Jobs erstellt/aktualisiert.

B. Alert-Versand

 Zum geplanten Zeitpunkt erhalten nur aktive Gäste des Camps/Targets eine Push-Nachricht mit genau der im Rule-Text hinterlegten Message.

 Versand wird in automation_deliveries protokolliert (Status, sent/opened).

C. Cutoff-Durchsetzung

 Nach Cutoff verhindert die App weitere Gästewahlen/-anmeldungen; User erhält Push:
„Cutoff überschritten. Bitte wende dich an ein Staff-Mitglied.“

 Staff-Anpassungen sind weiterhin möglich (manuelle Korrektur in Staff/Kitchen Overview).

D. Recurrence

 Daily/Weekly/Monthly/Custom erzeugen korrekte Folgejobs in der Camp-TZ.

 Saison-Overrides ersetzen Zeiten in definierter Saison.

E. Integrationen

 Meal-Regeln berücksichtigen meal_type korrekt.

 Event-Regeln hängen an konkreten Events oder Event-Kategorien.

 Surf-Lesson-Regeln berücksichtigen veröffentlichte Lessons.

F. UI/UX

 Alle Erfolg/Fehler/Bestätigungen erscheinen als JavaScript alert().

 View-Modal zeigt nächste Ausführung(en) und letzte Versandstatistik.

 Delete zeigt Sicherheits-Alert; nach Bestätigung sind Regel und zukünftige Jobs entfernt.

7) Beispiel-Defaults (optional, beim ersten Setup)

Meals

Breakfast Default: Alert „same day 19:00“, Cutoff „same day 07:00“, Daily.

Lunch Default: Alert 10:00, Cutoff 09:00, Daily.

Dinner Default: Alert 15:00, Cutoff 14:00, Daily.

Surf Lessons

Alert 08:00, Mo/Mi/Fr; Message anpassbar.

Events

Keine Defaults; Regeln beim Event-Erstellen optional automatisch generieren.

8) Fehlerfälle & Edge Cases

Keine aktiven Gäste: Job wird als completed mit result_meta.no_recipients=true markiert.

Push-Gateway Fehler: automation_deliveries.status=failed, retry-Policy (z. B. 3 Versuche).

Geänderte Camp-TZ: künftige Jobs werden beim Speichern der TZ neu berechnet.

Gelöschtes Ziel (z. B. Event): zugehörige pending Jobs werden auf skipped gesetzt.

9) Rechte & Protokollierung

Berechtigung: nur Rollen mit can_manage_alerts.

Audit: created_by / updated_by (Staff-IDs S-XXXXXXXXXX), Timestamps.

Jeder Toggle/Save/Delete → JS-Alert + Audit.

10) Nicht-Ziele (v1)

Kein E-Mail-Versand (nur Mobile Push).

Keine frei konfigurierbaren Vorlagenvariablen außer einfache Platzhalter (z. B. {mealType}, {date}) – optional, wenn vorhanden.

Keine komplexe A/B-Statistik; nur Basis-KPIs.

Zusammenfassung

Dieses Alert-Management liefert ein robustes, mandantenfähiges Regelwerk für Benachrichtigungen und Cutoffs, integriert sich sauber in Meals, Events, Surf Lessons, arbeitet ausschließlich mit Echt­daten, nutzt JavaScript Alerts für alle Admin-Bestätigungen und sorgt durch Recurrence-Jobs & Delivery-Logs für nachvollziehbare, skalierbare Prozesse.