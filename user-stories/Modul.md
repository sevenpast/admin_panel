Das Meals-Modul besteht aus drei klar getrennten Bereichen:

Meal Management → Erstellung und Verwaltung von Meals

Staff Overview → Übersicht und manuelle Anpassung der Bestellungen

Kitchen Overview → Read-Only Ansicht für das Küchenpersonal

Alle Daten stammen direkt aus der Datenbank (Meals, Guests, Lessons). Keine Mockdaten.

1. Meal Management

Darstellung:

Meals sind tagesbasiert organisiert.

Unterteilung in drei Kategorien: Breakfast, Lunch, Dinner.

Jede Kategorie ist optisch in einer Box mit weißer Umrandung dargestellt.

Meal Cards (pro Meal):

ID: M-XXXXXXXXXX (0–9, A–Z)

Category (Breakfast, Lunch, Dinner)

Title

Description (optional)

Date (optional)

Startzeit & Endzeit

Option: Meat, Animal Products, Vegetarian, Vegan, Others

Icons:

Oben rechts: Publish / Unpublish

Footer: Auge (View), Stift (Edit), Abfall (Delete)

Meal erstellen (+ Button) → Modal Window mit:

Title

Category (Breakfast, Lunch, Dinner)

Description (optional)

Image Upload (optional)

Date

Startzeit & Endzeit

Repetition: täglich, wöchentlich (mit Auswahl Wochentage), monatlich

Cutoff Time (optional)

Meal Option: Meat, Animal Products, Vegetarian, Vegan, Others

Zusatzoption: Freitextfeld für “Option Description” (z. B. Glutenfrei)

Alert Time (optional, 24h-Modus)

Alert Message (optional, Text für Push-Benachrichtigung)

Steuerung im Modal:

Oben rechts: X (Abbrechen)

Unten rechts: Diskette (Speichern)

Unten rechts: X (Abbrechen)

2. Staff Overview

Zielgruppe: Admins & Staff

Darstellung:

Tagesübersicht der Gästeabstimmungen.

Immer sichtbar: 5 Optionen → Meat, Animal Products, Vegetarian, Vegan, Others.

Startwert = 0, wenn keine Bestellungen vorliegen.

Funktion:

Staff kann mit + / – Buttons die Anzahl manuell anpassen.

Änderungen werden direkt in der Datenbank gespeichert.

Verbindung:

Werte basieren auf echten Gästeabstimmungen.

Änderungen synchronisieren sich automatisch mit Kitchen Overview.

3. Kitchen Overview

Zielgruppe: Küchenpersonal

Darstellung:

Unterteilung in Breakfast, Lunch, Dinner.

Anzeige nach Zeit, Option und Anzahl.

Funktion:

Read-Only (keine Bearbeitung möglich).

Zahlen werden dynamisch aus Staff Overview übernommen.

Detailansicht (View Button):

Öffnet ein Modal Window:

Gastname

Bestellte Option (z. B. Vegan – Bowl)

Zeitpunkt der Bestellung

4. Dynamische Zeitberechnung

Standardzeit: Wird beim Erstellen des Meals definiert.

Individuelle Zeit pro Gast:

Gäste wählen: vor der Lesson oder nach der Lesson.

Automatische Berechnung:

Vor Lesson = Startzeit der Lesson – X Minuten

Nach Lesson = Endzeit der Lesson + X Minuten

X ist ein globaler Wert (Standard: 30 Minuten, anpassbar).

Beispiel:

Gast A hat Lesson 1 von 08:00–09:00 → Frühstück vor der Lesson = 07:30.

Gast B hat Lesson 1 von 08:00–09:00 → Frühstück nach der Lesson = 09:30.

5. Daten & Systemanforderungen

Verbindungen:

Meals-DB → Meal Items, Optionen, Zeiten

Guests-DB → Bestellungen, Allergien, Package-Zugehörigkeit

Lessons-DB → Zeitberechnung für Before/After Lesson

Synchronisierung:

Staff Overview = Quelle für Kitchen Overview

Kitchen Overview = 1:1 Abbild, Read-Only

Keine Mockdaten: Alle Daten werden live aus der DB gezogen.

✅ Akzeptanzkriterien

Meals sind tagesweise in Breakfast, Lunch, Dinner organisiert.

Jede Meal Card hat eine ID im Format M-XXXXXXXXXX.

Alle Änderungen (Erstellen, Editieren, Löschen, Publish) speichern direkt in die DB.

Staff Overview zeigt immer alle 5 Optionen mit Startwert 0.

Staff kann Werte mit +/– anpassen → Änderungen sind sofort in DB gespeichert.

Kitchen Overview zeigt immer die exakten Werte aus Staff Overview (synchron).

View in Kitchen Overview zeigt Gastname + Option + Zeit.

Zeitberechnung für Before/After Lesson