# Gäste-Management User Stories

## 🏨 Check-In Prozess

### Story 1: Gast Check-In
**Als** Rezeptionist
**möchte ich** einen neuen Gast einchecken können
**damit** der Gast sein Zimmer beziehen und Camp-Services nutzen kann

**Akzeptanzkriterien:**
- [ ] Gast-Informationen können eingegeben werden (Name, Kontakt, Dokumente)
- [ ] Zimmer kann zugewiesen werden
- [ ] Check-In-Datum und -Zeit werden automatisch erfasst
- [ ] Bestätigungsmail wird an den Gast gesendet
- [ ] Zimmerstatus wird von "verfügbar" auf "belegt" geändert

**Priorität:** Hoch
**Aufwand:** M
**Status:** ✅ Fertig

### Story 2: Vorab-Reservierung Check-In
**Als** Rezeptionist
**möchte ich** einen Gast mit bestehender Reservierung einchecken
**damit** der Prozess schneller und effizienter abläuft

**Akzeptanzkriterien:**
- [ ] Reservierung kann über Buchungsnummer oder Namen gefunden werden
- [ ] Gast-Daten sind bereits vorhanden und können bestätigt werden
- [ ] Zimmer ist bereits reserviert und kann bestätigt werden
- [ ] Check-In-Prozess ist verkürzt gegenüber Walk-In-Gästen

**Priorität:** Hoch
**Aufwand:** S
**Status:** ✅ Fertig

## 🚪 Check-Out Prozess

### Story 3: Gast Check-Out
**Als** Rezeptionist
**möchte ich** einen Gast auschecken können
**damit** das Zimmer für neue Gäste verfügbar wird

**Akzeptanzkriterien:**
- [ ] Check-Out-Datum und -Zeit werden erfasst
- [ ] Finale Rechnung wird erstellt und angezeigt
- [ ] Zimmer wird zur Reinigung freigegeben
- [ ] Gast-Status wird auf "ausgecheckt" gesetzt
- [ ] Bestätigungsmail mit Rechnung wird gesendet

**Priorität:** Hoch
**Aufwand:** M
**Status:** ✅ Fertig

### Story 4: Express Check-Out
**Als** Gast
**möchte ich** express auschecken können
**damit** ich keine Zeit an der Rezeption verbringen muss

**Akzeptanzkriterien:**
- [ ] Self-Service Check-Out Terminal verfügbar
- [ ] Automatische Rechnungserstellung
- [ ] Digitale Rechnung per E-Mail
- [ ] Schlüssel-Rückgabe-Box verfügbar

**Priorität:** Mittel
**Aufwand:** L
**Status:** 📋 Geplant

## 🛏️ Zimmer-Management

### Story 5: Zimmer-Übersicht
**Als** Rezeptionist
**möchte ich** eine Übersicht aller Zimmer und deren Status sehen
**damit** ich schnell verfügbare Zimmer finden kann

**Akzeptanzkriterien:**
- [ ] Alle Zimmer werden mit Status angezeigt (verfügbar, belegt, reinigung, wartung)
- [ ] Filter nach Zimmerkategorie und Status möglich
- [ ] Zimmerdetails auf Klick anzeigbar
- [ ] Drag & Drop Zimmer-Zuordnung möglich

**Priorität:** Hoch
**Aufwand:** M
**Status:** ✅ Fertig

### Story 6: Zimmer-Zuordnung ändern
**Als** Camp Manager
**möchte ich** Gäste zwischen Zimmern verschieben können
**damit** ich auf besondere Anfragen oder Probleme reagieren kann

**Akzeptanzkriterien:**
- [ ] Gast kann zu anderem verfügbaren Zimmer verschoben werden
- [ ] Grund für Verschiebung wird dokumentiert
- [ ] Beide Zimmer werden entsprechend aktualisiert
- [ ] Gast wird über Änderung informiert

**Priorität:** Mittel
**Aufwand:** S
**Status:** ✅ Fertig

## 👤 Gäste-Profile

### Story 7: Gäste-Profil anlegen
**Als** Rezeptionist
**möchte ich** detaillierte Gäste-Profile erstellen
**damit** ich alle wichtigen Informationen griffbereit habe

**Akzeptanzkriterien:**
- [ ] Persönliche Daten (Name, Geburtsdatum, Kontakt)
- [ ] Dokumente (Ausweis, Visum)
- [ ] Präferenzen (Zimmerwünsche, Allergien)
- [ ] Notfallkontakte
- [ ] Foto-Upload möglich

**Priorität:** Hoch
**Aufwand:** M
**Status:** ✅ Fertig

### Story 8: Gäste-Historie
**Als** Camp Manager
**möchte ich** die Aufenthalts-Historie eines Gastes sehen
**damit** ich Stammgäste erkennen und entsprechend betreuen kann

**Akzeptanzkriterien:**
- [ ] Alle vorherigen Aufenthalte werden angezeigt
- [ ] Datum, Dauer und Zimmer der Aufenthalte sichtbar
- [ ] Besondere Vorfälle oder Notizen werden angezeigt
- [ ] Ausgaben und Buchungen der Aufenthalte sichtbar

**Priorität:** Mittel
**Aufwand:** S
**Status:** ✅ Fertig

## 🔍 Gäste-Suche

### Story 9: Erweiterte Gäste-Suche
**Als** Rezeptionist
**möchte ich** Gäste schnell finden können
**damit** ich bei Anfragen oder Problemen sofort reagieren kann

**Akzeptanzkriterien:**
- [ ] Suche nach Name, Zimmernummer, Telefon oder E-Mail
- [ ] Auto-Complete Funktionalität
- [ ] Filter nach Status (eingecheckt, ausgecheckt, reserviert)
- [ ] Suche nach Aufenthaltsdatum

**Priorität:** Hoch
**Aufwand:** S
**Status:** ✅ Fertig

### Story 10: Gäste-Liste exportieren
**Als** Camp Manager
**möchte ich** Gäste-Listen exportieren können
**damit** ich Berichte erstellen oder Daten weiterverarbeiten kann

**Akzeptanzkriterien:**
- [ ] Export als CSV oder Excel möglich
- [ ] Filter vor Export anwendbar
- [ ] Auswahl der zu exportierenden Felder
- [ ] Datenschutz-konforme Anonymisierung möglich

**Priorität:** Mittel
**Aufwand:** S
**Status:** 🧪 Test

## 🏷️ Gruppen-Management

### Story 11: Gruppen-Buchungen verwalten
**Als** Rezeptionist
**möchte ich** Gruppen-Buchungen als Einheit verwalten
**damit** zusammengehörige Gäste einfach organisiert werden können

**Akzeptanzkriterien:**
- [ ] Gruppen können erstellt und benannt werden
- [ ] Gäste können Gruppen zugeordnet werden
- [ ] Gruppen-Check-In und -Check-Out möglich
- [ ] Gruppen-Rabatte können angewendet werden
- [ ] Gruppenleiter kann definiert werden

**Priorität:** Mittel
**Aufwand:** L
**Status:** 📋 Geplant

### Story 12: Familien-Zimmer-Management
**Als** Rezeptionist
**möchte ich** Familien mit Kindern besondere Zimmer zuweisen
**damit** Familien angemessen untergebracht werden

**Akzeptanzkriterien:**
- [ ] Familien-Zimmer sind gekennzeichnet
- [ ] Kinder-Alter wird erfasst und berücksichtigt
- [ ] Zusatzbetten können verwaltet werden
- [ ] Kinder-spezifische Services können zugeordnet werden

**Priorität:** Mittel
**Aufwand:** M
**Status:** 📋 Geplant

## 💳 Zahlungs-Management

### Story 13: Gäste-Rechnung verwalten
**Als** Rezeptionist
**möchte ich** die laufende Rechnung eines Gastes einsehen und bearbeiten
**damit** ich jederzeit über offene Beträge informiert bin

**Akzeptanzkriterien:**
- [ ] Alle Buchungen und Gebühren werden angezeigt
- [ ] Einzelne Posten können hinzugefügt oder entfernt werden
- [ ] Zahlungen können erfasst werden
- [ ] Teilzahlungen sind möglich
- [ ] Rechnung kann jederzeit ausgedruckt werden

**Priorität:** Hoch
**Aufwand:** L
**Status:** 🚧 In Arbeit

### Story 14: Kautionen verwalten
**Als** Rezeptionist
**möchte ich** Kautionen von Gästen verwalten
**damit** Schäden oder zusätzliche Kosten abgedeckt sind

**Akzeptanzkriterien:**
- [ ] Kaution kann beim Check-In hinterlegt werden
- [ ] Kautions-Status wird verfolgt (hinterlegt, teilweise verwendet, zurückgegeben)
- [ ] Verwendung der Kaution wird dokumentiert
- [ ] Automatische Rückgabe beim Check-Out (wenn möglich)

**Priorität:** Mittel
**Aufwand:** M
**Status:** 📋 Geplant

## 📱 Kommunikation

### Story 15: Gäste-Nachrichten
**Als** Rezeptionist
**möchte ich** Gästen Nachrichten senden können
**damit** ich wichtige Informationen kommunizieren kann

**Akzeptanzkriterien:**
- [ ] SMS und E-Mail Versand möglich
- [ ] Nachrichten-Vorlagen verfügbar
- [ ] Gruppen-Nachrichten an mehrere Gäste
- [ ] Nachrichtenhistorie wird gespeichert
- [ ] Automatische Übersetzung für internationale Gäste

**Priorität:** Mittel
**Aufwand:** L
**Status:** 📋 Geplant

---

**Gesamt Stories:** 15
**Fertig:** 8
**In Arbeit:** 1
**Test:** 1
**Geplant:** 5

**Epic Status:** 🟢 Kern-Funktionalitäten implementiert, Erweiterungen in Planung