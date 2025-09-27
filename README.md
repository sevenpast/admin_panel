# CampFlow 2.0 🏕️

Ein umfassendes Camp-Management-System zur Verwaltung von Gästen, Personal, Surfstunden, Mahlzeiten, Events und Inventar.

## 📋 Überblick

CampFlow 2.0 ist eine moderne Webanwendung, die speziell für die Verwaltung von Surf- und Freizeitcamps entwickelt wurde. Das System bietet eine intuitive Benutzeroberfläche für die Administration aller wichtigen Camp-Bereiche.

## ✨ Features

### 🏠 Dashboard
- Übersichtliche Anzeige aller wichtigen Kennzahlen
- Schnellzugriff auf häufig verwendete Funktionen
- Echtzeit-Updates zu Camp-Aktivitäten

### 👥 Gäste-Management
- Gästeverwaltung mit detaillierten Profilen
- Check-in/Check-out Funktionalität
- Zimmerzuteilung und Belegungsübersicht

### 🏄‍♂️ Surf-Unterricht
- Stundenplanung und -verwaltung
- Lehrer-Zuordnung
- Teilnehmerverwaltung und Skill-Level-Tracking

### 🍽️ Mahlzeiten-Management
- Menüplanung und Rezeptverwaltung
- Diätetische Einschränkungen und Allergien
- Portionsplanung und Kalorienverfolgung
- Küchen-Übersicht mit Echtzeit-Status

### 📅 Event-Management
- Event-Planung und -organisation
- Teilnehmerverwaltung
- Ressourcenplanung

### 👨‍💼 Personal-Management
- Mitarbeiterverwaltung und Schichtplanung
- Qualifikationen und Zertifikate
- Arbeitszeiten und Urlaubsplanung

### 📦 Inventar-Management
- Ausrüstungsverwaltung
- Wartungszyklen und Reparaturen
- Verfügbarkeitsprüfung

### 🚨 Benachrichtigungen
- Wichtige Alerts und Erinnerungen
- Systembenachrichtigungen
- Automatische Berichte

### 📊 Reports & Analytics
- Detaillierte Berichte zu allen Bereichen
- Datenvisualisierung
- Export-Funktionen

## 🛠️ Technische Spezifikationen

### Frontend
- **Framework**: Next.js 15.5.4
- **UI-Bibliothek**: React 19.1.0
- **Styling**: Tailwind CSS 4
- **Icons**: Heroicons, Lucide React
- **Komponenten**: Headless UI

### Backend & Datenbank
- **Backend**: Supabase
- **Authentifizierung**: Supabase Auth
- **Datenbank**: PostgreSQL (über Supabase)
- **Echtzeit**: Supabase Realtime

### Deployment
- **Hosting**: Vercel
- **Build**: Next.js Build System
- **CDN**: Vercel Edge Network

## 🚀 Installation & Setup

### Voraussetzungen
- Node.js (Version 18 oder höher)
- npm oder yarn
- Supabase Account

### 1. Repository klonen
```bash
git clone https://github.com/sevenpast/CampFlow.git
cd CampFlow/admin-panel
```

### 2. Dependencies installieren
```bash
npm install
```

### 3. Umgebungsvariablen konfigurieren
Kopiere `.env.example` zu `.env.local` und fülle die Werte aus:

```bash
cp .env.example .env.local
```

Erforderliche Umgebungsvariablen:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Datenbank Setup
Führe die SQL-Skripte in der richtigen Reihenfolge aus:
```bash
# Grundlegende Datenbankstruktur
psql -f database/database-schema.sql

# Meal Control Setup (falls benötigt)
psql -f database/setup-meal-control.sql
```

### 5. Entwicklungsserver starten
```bash
npm run dev
```

Die Anwendung ist nun unter `http://localhost:3000` verfügbar.

## 📁 Projektstruktur

```
CampFlow/
├── admin-panel/          # Next.js Admin-Anwendung
│   ├── src/
│   │   ├── app/         # Next.js App Router
│   │   ├── components/  # React-Komponenten
│   │   └── lib/         # Utilities und Konfiguration
├── documentation/        # Projektdokumentation
├── database/            # SQL-Schemas und Migrationen
├── user-stories/        # User Stories und Requirements
├── assets/              # Bilder, Icons und andere Assets
└── deployment/          # Deployment-Konfigurationen
```

## 🔧 Verfügbare Scripts

```bash
# Entwicklungsserver mit Turbopack
npm run dev

# Produktions-Build
npm run build

# Produktionsserver starten
npm start

# Code-Linting
npm run lint
```

## 🌐 Deployment

### Vercel (Empfohlen)
1. Repository mit Vercel verbinden
2. Umgebungsvariablen in Vercel Dashboard konfigurieren
3. Automatisches Deployment bei Git-Push

### Manuelles Deployment
```bash
npm run build
npm start
```

## 📚 Dokumentation

Detaillierte Dokumentation findest du in den folgenden Bereichen:
- [User Stories](user-stories/) - Anforderungen und Funktionsbeschreibungen
- [Datenbank-Schema](database/) - Datenbankstruktur und Migrationen
- [API-Dokumentation](documentation/api/) - Backend-Endpunkte
- [Komponentendokumentation](documentation/components/) - UI-Komponenten

## 🤝 Mitwirken

1. Fork das Repository
2. Erstelle einen Feature-Branch (`git checkout -b feature/AmazingFeature`)
3. Committe deine Änderungen (`git commit -m 'Add some AmazingFeature'`)
4. Push zum Branch (`git push origin feature/AmazingFeature`)
5. Öffne einen Pull Request

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert - siehe [LICENSE](LICENSE) für Details.

## 🛟 Support

Bei Fragen oder Problemen:
- Erstelle ein [Issue](https://github.com/sevenpast/CampFlow/issues)
- Kontaktiere das Entwicklungsteam

## 🔄 Changelog

### Version 2.0
- ✅ Vollständige Neuentwicklung mit Next.js 15
- ✅ Moderne UI mit Tailwind CSS
- ✅ Supabase-Integration
- ✅ Echtzeit-Updates
- ✅ Responsive Design
- ✅ Vercel-Deployment

---

**CampFlow 2.0** - Entwickelt für moderne Camp-Verwaltung 🏕️✨