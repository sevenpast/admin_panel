Programmziel & Systemkontext
1) Vision

Das Programm soll eine Multi-Camp-Plattform sein, die Camps eine vollständige digitale Verwaltung ermöglicht:

Admins richten ihre Camps, Gäste, Staff, Meals, Surf Lessons, Events und Inventar im Admin Panel (Web/Desktop/iPad) ein.

Gäste greifen mobil (iOS/Android) auf ihre Buchungen, Meals, Events und Surf Lessons zu.

Staff arbeitet ebenfalls mobil, mit rollenspezifischen Ansichten (z. B. Küche sieht Bestellungen, Instructor sieht Zuweisungen).

Langfristig sind mehrstufige Erweiterungen vorgesehen:

Phase 1 (jetzt): Dummy-Camp erstellen, Email-Login, Admin-Panel für Hauptadmin mit Setup aller Funktionen.

Phase 2: Events können zwischen Camps geteilt werden (nur Events, keine Gäste- oder Staff-Daten).

Phase 3: Gäste können sich in mehreren Camps bewegen und dort dieselbe App nutzen, ohne erneut ein Onboarding durchlaufen zu müssen.

Zukunft: Ein Superhost hat Zugriff auf alle Camps (Multi-Tenant-Verwaltung). Dafür muss die Datenbank schon jetzt vorbereitet werden.

2) Rollen & Nutzergruppen

Admin (Camp-spezifisch):
– Hauptadmin eines Camps, hat Zugriff auf alle Funktionen im Admin Panel.
– Erstellt & verwaltet Gäste, Staff, Meals, Surf Lessons, Events, Inventory.

Guest (mobil):
– Sieht seine Buchungen, wählt Meals, nimmt an Events und Surf Lessons teil.

Staff (mobil):
– Zugriff beschränkt nach Rolle:

Host → Gästebetreuung, Check-In

Teacher → Aktivitäten/Unterricht

Instructor → Surf Lessons

Kitchen → Kitchen Overview / Meals

Cleaning → Zimmerstatus

Superhost (global, später):
– Kann sich in alle Camps einloggen, Übersicht über sämtliche Daten.

3) Multi-Camp-Architektur

Standardmodus:
Jedes Camp ist strikt isoliert (Tenant-Prinzip). Ein Admin oder Staff sieht ausschließlich Daten des eigenen Camps.

Event-Sharing (Phase 2):
Camps können Events „öffentlich“ setzen → andere Camps können sie übernehmen.

Multi-Camp-Guests (Phase 3):
Gäste können sich in mehreren Camps einloggen → die App funktioniert für sie gleich, Daten werden jedoch camp-spezifisch gespeichert.

Superhost (Zukunft):
Ein globaler Account mit Zugriff auf mehrere Tenants.

4) Plattformen

Admin Panel: Web/Desktop, optimiert auch für iPad.

Guest App: iOS & Android, mobil-first.

Staff App: iOS & Android, mobil-first, mit stark reduzierten Views pro Rolle.

5) Datenbank-Vorbereitung

Tenant-Struktur: Jede Entität (Guest, Staff, Meal, Event, Lesson, Room, Bed …) muss mit camp_id verknüpft sein.

User Management:
– Email-Login (erste Phase)
– Rollen & Rechte (Admin, Staff mit Labeln, Guest)
– Multi-Tenant-Fähigkeit vorbereitet (Superhost).

Events-Sharing: Datenmodell so bauen, dass Events camp-intern oder global geteilt werden können.

Scalability: Alle Operationen strikt auf Camp-Ebene gefiltert, um Datenlecks zwischen Camps zu verhindern.

6) Akzeptanzkriterien (Phase 1 – Dummy Camp & Admin Panel)

Given ein Admin meldet sich per Email an, When er das Admin Panel öffnet, Then sieht er ausschließlich Daten seines Dummy-Camps.

Given ein Staff-User loggt sich ein, When er die App öffnet, Then sieht er nur Funktionen seiner Rolle (Kitchen sieht Meals, Instructor sieht Surf Lessons etc.).

Given ein Guest loggt sich ein, When er die App öffnet, Then sieht er nur Daten aus „seinem“ Camp (Meals, Events, Lessons, Zimmer).

Given ein Superhost-Account existiert (Datenbank vorbereitet), When er sich einloggt, Then kann er später mehrere Camps gleichzeitig verwalten.