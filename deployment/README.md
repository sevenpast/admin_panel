# CampFlow 2.0 - Deployment Guide

## 🚀 Deployment-Optionen

CampFlow 2.0 kann auf verschiedene Plattformen deployed werden. Hier sind die empfohlenen Optionen:

## 1. 🟢 Vercel (Empfohlen)

### Warum Vercel?
- ✅ Optimiert für Next.js Anwendungen
- ✅ Automatische Deployments via Git
- ✅ Edge Functions und CDN
- ✅ Kostenlose Tier für kleine Teams
- ✅ Einfache Umgebungsvariablen-Verwaltung

### Setup
1. **Repository verbinden**
   ```bash
   # Repository zu Vercel hinzufügen
   vercel login
   vercel --prod
   ```

2. **Umgebungsvariablen konfigurieren**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL`

3. **Build-Einstellungen**
   ```
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   Development Command: npm run dev
   ```

### Automatisches Deployment
```yaml
# .github/workflows/deploy-vercel.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 2. 🔵 Netlify

### Setup
```bash
# Netlify CLI installieren
npm install -g netlify-cli

# Projekt initialisieren
netlify init

# Build-Konfiguration
netlify.toml erstellen
```

### netlify.toml
```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 3. 🟣 Railway

### Setup
```bash
# Railway CLI installieren
npm install -g @railway/cli

# Projekt deployen
railway login
railway init
railway up
```

### railway.json
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health"
  }
}
```

## 4. 🔶 Self-Hosted (VPS)

### Systemanforderungen
- **RAM**: Minimum 2GB, empfohlen 4GB
- **CPU**: 2 Cores minimum
- **Storage**: 20GB SSD
- **OS**: Ubuntu 20.04+ oder ähnlich

### Installation auf Ubuntu

#### 1. Systemvorbereitung
```bash
# System aktualisieren
sudo apt update && sudo apt upgrade -y

# Node.js installieren
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# PM2 Process Manager
sudo npm install -g pm2

# Nginx Reverse Proxy
sudo apt install -y nginx
```

#### 2. Anwendung installieren
```bash
# Repository klonen
git clone https://github.com/sevenpast/CampFlow.git
cd CampFlow/admin-panel

# Dependencies installieren
npm install

# Umgebungsvariablen konfigurieren
cp .env.example .env.local
# .env.local editieren

# Build erstellen
npm run build
```

#### 3. PM2 Konfiguration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'campflow-admin',
    script: 'npm',
    args: 'start',
    cwd: '/path/to/CampFlow/admin-panel',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

```bash
# PM2 starten
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 4. Nginx Konfiguration
```nginx
# /etc/nginx/sites-available/campflow
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Nginx konfigurieren
sudo ln -s /etc/nginx/sites-available/campflow /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. SSL mit Let's Encrypt
```bash
# Certbot installieren
sudo apt install certbot python3-certbot-nginx

# SSL Zertifikat erstellen
sudo certbot --nginx -d your-domain.com

# Auto-Renewal testen
sudo certbot renew --dry-run
```

## 📊 Health Checks & Monitoring

### Health Check Endpoint
```typescript
// src/app/api/health/route.ts
export async function GET() {
  return Response.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  })
}
```

### Monitoring mit Uptime Robot
```bash
# Health Check URL
https://your-domain.com/api/health

# Alert-Konfiguration
- Email bei Downtime
- SMS bei kritischen Fehlern
- Slack-Integration für Team
```

## 🔐 Sicherheit

### HTTPS erzwingen
```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          }
        ]
      }
    ]
  }
}
```

### Umgebungsvariablen sichern
```bash
# Nie in Git committen
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore

# Sichere Passwort-Generierung
openssl rand -base64 32
```

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run build

  deploy-staging:
    if: github.ref == 'refs/heads/staging'
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Staging
        run: |
          # Staging Deployment Logic

  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Production
        run: |
          # Production Deployment Logic
```

## 📈 Performance Optimierung

### Build Optimierungen
```typescript
// next.config.ts
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  generateEtags: false,

  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    }
    return config
  }
}
```

### Caching Strategien
```bash
# Vercel Edge Caching
# Automatisch für statische Assets

# CDN Konfiguration
# Images, CSS, JS werden automatisch cached

# API Route Caching
# Cache-Control Headers in API Routes
```

## 🔍 Troubleshooting

### Häufige Probleme

#### Build Failures
```bash
# Node.js Version prüfen
node --version  # Sollte 18+ sein

# Dependencies neu installieren
rm -rf node_modules package-lock.json
npm install

# TypeScript Fehler ignorieren (temporär)
npm run build -- --no-lint
```

#### Umgebungsvariablen
```bash
# Alle Variablen prüfen
env | grep NEXT_PUBLIC

# Supabase Verbindung testen
curl -H "apikey: YOUR_ANON_KEY" \
     "YOUR_SUPABASE_URL/rest/v1/"
```

#### Performance Probleme
```bash
# Bundle Analyse
npm install -g @next/bundle-analyzer
ANALYZE=true npm run build

# Memory Usage überwachen
pm2 monit  # Für Self-Hosted
```

---

**Deployment Status**: ✅ Production-Ready
**Letzte Aktualisierung**: 2025-01-27
**Unterstützte Plattformen**: Vercel, Netlify, Railway, Self-Hosted