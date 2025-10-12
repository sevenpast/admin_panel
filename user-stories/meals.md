🍽️ Meals Management — User Stories
📋 Allgemein
Story 1: Meal anlegen

Als Camp-Admin
möchte ich ein neues Meal erstellen können
damit Gäste und Staff die Mahlzeit für den jeweiligen Tag sehen und verwalten können

Akzeptanzkriterien:

 Neues Meal kann mit Titel, Kategorie (Breakfast, Lunch, Dinner) und Beschreibung erstellt werden

 Optional kann ein Bild hochgeladen werden

 Startzeit, Endzeit und Datum sind Pflichtfelder

 Meal-Optionen (Meat, Animal Products, Vegetarian, Vegan, Others) müssen wählbar sein

 System generiert automatisch eine eindeutige Meal-ID (M-XXXXXXXXXX)

 Status ist initial auf draft gesetzt

Priorität: Hoch
Aufwand: M
Status: 🚧 In Arbeit

Story 2: Meal veröffentlichen

Als Camp-Admin
möchte ich ein Meal veröffentlichen können
damit es für Gäste und Staff sichtbar und auswählbar ist

Akzeptanzkriterien:

 Nur Meals im Status draft können veröffentlicht werden

 Veröffentlichtes Meal erhält Status published

 Gäste sehen veröffentlichte Meals in ihrer App

 Staff Overview und Kitchen Overview werden automatisch aktualisiert

 Erfolgs- oder Fehlermeldungen werden als JavaScript Alerts angezeigt (keine DOM-Meldungen)

Priorität: Hoch
Aufwand: S
Status: ✅ Fertig

Story 3: Meal kopieren

Als Camp-Admin
möchte ich ein bestehendes Meal duplizieren können
damit ich schnell wiederkehrende Mahlzeiten anlegen kann, ohne alle Daten neu einzugeben

Akzeptanzkriterien:

 Über die Action Copy wird ein neues Meal erstellt

 Alle Felder (Titel, Beschreibung, Kategorie, Zeiten, Optionen) werden übernommen

 Neue Meal-ID (M-XXXXXXXXXX) wird automatisch generiert

 Status des kopierten Meals ist standardmäßig draft

 Optional kann der Titel automatisch mit “(Kopie)” ergänzt werden

 System zeigt nach erfolgreicher Kopie einen JavaScript Alert „Meal erfolgreich kopiert“

Priorität: Mittel
Aufwand: S
Status: ✅ Fertig

Story 4: Meal bearbeiten

Als Camp-Admin
möchte ich bestehende Meals bearbeiten können
damit ich Änderungen an Zeiten, Beschreibungen oder Optionen vornehmen kann

Akzeptanzkriterien:

 Bearbeitung ist über das ✏️-Symbol möglich

 Alle Felder (Titel, Beschreibung, Datum, Start-/Endzeit, Optionen) sind editierbar

 Änderungen werden nach Klick auf die Diskette gespeichert

 Erfolgreiches Speichern wird mit JavaScript Alert bestätigt

 Nur Meals im Status draft können bearbeitet werden

 Änderungen werden sofort in der Datenbank gespeichert (keine Mockdaten)

Priorität: Hoch
Aufwand: M
Status: 🚧 In Arbeit

Story 5: Meal löschen

Als Camp-Admin
möchte ich ein Meal löschen können
damit veraltete oder fehlerhafte Einträge entfernt werden

Akzeptanzkriterien:

 Über das 🗑️-Symbol kann ein Meal gelöscht werden

 Löschung muss über einen JavaScript-Alert bestätigt werden

 Nach Bestätigung wird das Meal dauerhaft aus der Datenbank entfernt

 Gelöschte Meals werden aus allen Übersichten entfernt (Staff/Kitchen)

 Kein Zugriff mehr auf die Meal-ID nach Löschung möglich

Priorität: Mittel
Aufwand: S
Status: ✅ Fertig

Story 6: Meal-Übersicht anzeigen

Als Camp-Admin
möchte ich alle Meals eines Tages in einer Übersicht sehen
damit ich schnell prüfen kann, was geplant ist

Akzeptanzkriterien:

 Übersicht ist in Kategorien unterteilt (Breakfast, Lunch, Dinner)

 Jedes Meal wird als Card angezeigt

 Card zeigt: Kategorie, Titel, Datum, Startzeit, Endzeit, Status

 Actions auf jeder Card: 👁️ View, ✏️ Edit, 📄 Copy, 🗑️ Delete, 🌍 Publish/Unpublish

 Nur echte Daten aus der Datenbank, keine Mockdaten

 Meals sind nach Datum und Kategorie sortiert

Priorität: Hoch
Aufwand: M
Status: ✅ Fertig

👥 Staff Overview
Story 7: Meal-Auswahlen einsehen und anpassen

Als Staff-Mitglied
möchte ich sehen, was Gäste gewählt haben, und bei Bedarf Mengen manuell anpassen
damit ich die Küchenplanung unterstützen kann

Akzeptanzkriterien:

 Ansicht zeigt täglich alle Meals (Breakfast, Lunch, Dinner)

 Pro Option (Meat, Animal Products, Vegetarian, Vegan, Others) wird die Anzahl angezeigt

 Wenn keine Votes vorhanden → Zahl = 0

 Staff kann per + / – die Zahl manuell ändern

 Änderungen werden live in der Datenbank gespeichert (keine Mockdaten)

 Totals zeigen Summe aller Optionen pro Meal

 Änderungen werden automatisch in der Kitchen Overview übernommen

Priorität: Hoch
Aufwand: M
Status: 🚧 In Arbeit

👨‍🍳 Kitchen Overview
Story 8: Küchenansicht der Meals

Als Küchenmitarbeiter
möchte ich eine Übersicht über alle bestellten Mahlzeiten haben
damit ich genau weiß, wie viel von jeder Option zubereitet werden muss

Akzeptanzkriterien:

 Ansicht zeigt alle Meals des aktuellen Tages

 Meals sind nach Kategorien gruppiert (Breakfast, Lunch, Dinner)

 Pro Option (Meat, Animal Products, Vegetarian, Vegan, Others) wird die Gesamtmenge angezeigt

 Zahlen stammen aus Staff Overview (dynamisch verbunden)

 Seite ist read-only

 Klick auf „View“ zeigt Liste der Gäste mit Name + gewählter Option

 Nur echte Daten aus der Datenbank

 Kein manuelles Bearbeiten möglich

Priorität: Hoch
Aufwand: M
Status: 🚧 In Arbeit

🔄 Synchronisierung & Datenfluss
Story 9: Echtzeit-Datenfluss zwischen Staff & Kitchen Overview

Als Camp-Admin
möchte ich, dass Änderungen der Staff Overview automatisch in der Kitchen Overview sichtbar sind
damit keine manuelle Aktualisierung notwendig ist

Akzeptanzkriterien:

 Änderungen in Staff Overview (+ / –) werden sofort in Kitchen Overview gespiegelt

 Kitchen Overview zeigt immer die aktuelle Zahl aus der Datenbank

 Verbindung basiert auf Echtzeitdaten (z. B. via WebSocket oder Polling)

 Keine Mockdaten

 Änderungen werden geloggt (Audit Trail)

Priorität: Hoch
Aufwand: L
Status: 📋 Geplant

📊 Statusverwaltung
Story 10: Meal-Status anzeigen und verwalten

Als Camp-Admin
möchte ich jederzeit sehen, ob ein Meal veröffentlicht oder noch im Entwurf ist
damit ich den Überblick über aktive Angebote behalte

Akzeptanzkriterien:

 Jeder Meal-Eintrag hat einen Status-Badge: Draft oder Published

 Status kann durch Klick auf 🌍-Icon geändert werden

 Änderungen werden sofort in der Datenbank gespeichert

 System zeigt JavaScript-Alert bei Erfolg oder Fehler

 Kitchen & Staff Overview zeigen nur Meals mit Status Published

Priorität: Mittel
Aufwand: S
Status: ✅ Fertig

✅ Zusammenfassung
Bereich	Stories	Status
Meal Management	1–6	✅ Kernfunktionen fertig
Staff Overview	7	🚧 In Arbeit
Kitchen Overview	8	🚧 In Arbeit
Synchronisierung & Status	9–10	📋 Geplant / ✅ Teilweise fertig2