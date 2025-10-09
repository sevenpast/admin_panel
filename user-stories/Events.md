Hier habe ich deine Beschreibung zu **Events** so angepasst und ausgearbeitet, dass sie konsistent mit den vorherigen (Meals, Surf Lessons, Guests) ist und die Bilder als Inspiration berücksichtigt:

---

# Event Management

Das **Event Management** ermöglicht die Verwaltung von allen Aktivitäten, Kursen und Veranstaltungen innerhalb eines Camps. Die Oberfläche ist in **Karten** organisiert, die nach Kategorien gruppiert werden.

## Kategorien

Events sind in vordefinierte Kategorien unterteilt:

* **Day Activity**
* **Night Activity**
* **Sport Activity**
* **Teaching**

Jede Karte zeigt:

* **Event Name**
* **Datum & Zeit**
* **Kategorie**
* **Teilnehmende** (z. B. 3 / 10, mit Minimum und Maximum)
* **Status** (Draft oder Published)
* **Actions** (siehe unten)

## Actions (Symbole)

* **Auge (View)**:
  Öffnet ein Modal Window mit allen Eventdetails:

  * Event-Name, Beschreibung, Datum, Start- und Endzeit, Ort, Kategorie
  * Status (Draft oder Published)
  * Zuweisungen: Staff (welche Mitarbeiter)
  * Teilnehmende Gäste (inkl. Liste der registrierten Gäste mit Name und ID)
  * Teilnehmerzahlen (aktuell, Minimum, Maximum)

* **Stift (Edit)**:
  Öffnet ein Modal Window mit allen Details.
  Alle Felder sind bearbeitbar: Name, Kategorie, Beschreibung, Datum, Zeiten, Location, Min-/Max-Teilnehmende, zugewiesene Staff.
  Änderungen werden nur in der Datenbank gespeichert, wenn die Diskette (Save) geklickt wird.

* **Duplizieren**:
  Erstellt eine Kopie des Events mit denselben Daten und hängt „(Kopie)“ an den Titel an.

* **Globus (Publish/Unpublish)**:

  * **Published** = sichtbar in der Gäste-App.
  * **Draft** = nicht sichtbar.
    Status wird in der Datenbank gespeichert.

* **Abfall (Delete)**:
  Öffnet ein Bestätigungsfenster.
  Bei Bestätigung wird das Event **dauerhaft** aus der Datenbank gelöscht (inkl. Teilnehmer- und Staff-Zuweisungen).

## Neues Event erstellen (+ Button)

Ein Klick auf **+** öffnet ein Modal Window „Create Event“ mit folgenden Feldern:

* Event Name (Pflichtfeld)
* Kategorie (Dropdown: Day Activity, Night Activity, Sport Activity, Teaching)
* Beschreibung (optional)
* Datum
* Startzeit
* Endzeit
* Location (Textfeld)
* Alert Time (optional)
* Alert Message (optional)
* Repetition (Dropdown: keine, täglich, wöchentlich, monatlich)
* Mindestanzahl Teilnehmende
* Maximalanzahl Teilnehmende
* Staff zuweisen (Liste mit Checkboxen aller aktiven Staff)

## Modal Windows – Verhalten

* **X oben rechts** oder **X unten rechts** = schließen ohne Speichern
* **Diskette unten rechts** = speichern in der Datenbank
* Alle Änderungen gelten für echte Daten – keine DOM-only oder Mockdaten

## Akzeptanzkriterien

* Events werden dynamisch aus der Datenbank geladen, keine Mockdaten.
* Änderungen (Erstellen, Bearbeiten, Duplizieren, Löschen) wirken sich direkt auf die Datenbank aus.
* Gäste sehen nur **Published Events** in ihrer App.
* Staff kann in Events direkt zugewiesen werden.
* Teilnehmerlisten zeigen die realen Gastdaten (Name + ID).
* Events sind immer nach Kategorien sortiert und in Karten-Design angezeigt.

---

👉 Soll ich dir das jetzt wie bei **Meals** auch als **eigenständiges Dokument Events.md** ausformulieren?
