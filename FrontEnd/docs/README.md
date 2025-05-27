# Frontend Documentation 📚

Documentazione completa per lo sviluppo frontend della web app **CO₂ e O₂: Il tuo terreno respira**.

## 🚀 Quick Start

### 🆕 Prima volta con il progetto?
1. **[📋 Setup Ambiente](./setup/environment-setup.md)** - **INIZIA DA QUI** ⭐
2. [⚙️ Configurazione VS Code](./setup/ide-configuration.md)
3. [🧪 Test Ambiente](./setup/testing-environment.md)
4. [🔧 Troubleshooting](./setup/troubleshooting.md)

### 👨‍💻 Sviluppatore esperto?
```bash
cd FrontEnd
npm install
npm run dev
# Apri http://localhost:5173
```

---

## 📖 Guide di Sviluppo

### 🛠️ Setup e Configurazione
| Guida | Descrizione | Tempo |
|-------|-------------|-------|
| **[📋 Environment Setup](./setup/environment-setup.md)** | Installazione completa Node.js, React, librerie | 30 min |
| [⚙️ IDE Configuration](./setup/ide-configuration.md) | VS Code, estensioni, snippets | 10 min |
| [🧪 Testing Environment](./setup/testing-environment.md) | Setup Jest, testing components | 15 min |
| [🔧 Troubleshooting](./setup/troubleshooting.md) | Problemi comuni Windows/PowerShell | - |

### 🏗️ Sviluppo Componenti
| Componente | Guida | Tecnologia |
|------------|-------|------------|
| [🗺️ Mappe Interattive](./development/leaflet-integration.md) | Leaflet.js, disegno terreni | Leaflet + React |
| [📊 Grafici Dinamici](./development/chart-js-guide.md) | Chart.js, visualizzazioni CO₂/O₂ | Chart.js + React |
| [🌱 Database Vegetazione](./development/vegetation-database.md) | Specie vegetali, calcoli assorbimento | JSON + TypeScript |
| [🧮 Engine Calcoli](./development/calculation-engine.md) | Formule CO₂/O₂, fattori meteo | TypeScript + Turf.js |
| [🎨 UI Components](./development/ui-components.md) | Design system, Tailwind CSS | React + Tailwind |

### 🌐 API e Servizi
| Servizio | Guida | Provider |
|----------|-------|----------|
| [🌤️ API Meteo](./development/weather-api.md) | Integrazione Open-Meteo | Open-Meteo.com |
| [📍 Geocoding](./development/geocoding-api.md) | Conversione coordinate | Nominatim |
| [💾 Storage Locale](./development/local-storage.md) | Persistenza dati utente | localStorage |

### 🚀 Deploy e Produzione
| Fase | Guida | Strumenti |
|------|-------|-----------|
| [📦 Build Produzione](./deployment/production-build.md) | Ottimizzazione, bundling | Vite |
| [🔄 CI/CD Pipeline](./deployment/ci-cd.md) | Automazione deploy | GitHub Actions |
| [🌍 Hosting](./deployment/hosting.md) | Deploy su Vercel/Netlify | Vercel |

---

## 🛠️ Tech Stack

### ⚛️ Core Framework
- **React 19** - UI Library
- **TypeScript** - Type Safety
- **Vite** - Build Tool & Dev Server

### 🗺️ Mappe e Geolocalizzazione
- **Leaflet.js** - Libreria mappe interattive
- **React-Leaflet** - Integrazione React
- **Leaflet-Draw** - Strumenti disegno
- **Turf.js** - Calcoli geografici

### 📊 Grafici e Visualizzazioni
- **Chart.js** - Libreria grafici
- **React-ChartJS-2** - Integrazione React

### 🎨 Styling e UI
- **Tailwind CSS** - Utility-first CSS framework
- **Headless UI** - Componenti accessibili (opzionale)

### 🌐 API e HTTP
- **Axios** - HTTP client
- **Open-Meteo API** - Dati meteorologici
- **Nominatim API** - Geocoding

### 🔧 Utility e Tools
- **date-fns** - Manipolazione date
- **react-hook-form** - Gestione form
- **react-select** - Dropdown avanzati

---

## 🎯 Funzionalità Implementate

### ✅ Fase 1 - Setup Base
- [x] Configurazione ambiente di sviluppo
- [x] Struttura progetto professionale
- [x] Integrazione Tailwind CSS
- [x] Setup Git e workflow

### 🚧 Fase 2 - Componenti Core (In Sviluppo)
- [ ] Mappa interattiva con Leaflet
- [ ] Sistema disegno terreni
- [ ] Database specie vegetali
- [ ] Calcolatore CO₂/O₂

### 📋 Fase 3 - Funzionalità Avanzate (Pianificate)
- [ ] Dashboard con grafici dinamici
- [ ] Integrazione API meteo
- [ ] Sistema esportazione dati
- [ ] Ottimizzazioni performance

### 🚀 Fase 4 - Produzione (Futuro)
- [ ] Testing completo
- [ ] CI/CD pipeline
- [ ] Deploy automatico
- [ ] Monitoraggio errori

---

## 📋 Convenzioni di Sviluppo

### 📂 Struttura File
```
src/
├── components/          # Componenti React
│   ├── ui/             # Componenti base (Button, Input)
│   ├── map/            # Componenti mappa
│   ├── vegetation/     # Gestione vegetazione
│   ├── dashboard/      # Dashboard e metriche
│   ├── charts/         # Grafici specifici
│   └── layout/         # Layout (Header, Footer)
├── hooks/              # Custom React hooks
├── services/           # API calls e servizi
├── utils/              # Funzioni utility
├── types/              # TypeScript definitions
├── data/               # Dati statici
└── pages/              # Pagine principali
```

### 🏷️ Naming Conventions
- **Componenti**: `PascalCase` (es. `MapContainer.tsx`)
- **Hooks**: `camelCase` iniziando con `use` (es. `useWeather.ts`)
- **Utility**: `camelCase` (es. `calculateCO2.ts`)
- **Tipi**: `PascalCase` con suffisso `Type` (es. `VegetationType`)

### 📝 Git Commit Messages
```bash
# Esempi di commit ben formattati:
feat(map): add interactive terrain drawing
fix(calc): correct CO₂ absorption formula
docs(setup): update installation guide
style(ui): improve button hover states
```

---

## 🧪 Testing Strategy

### 🔬 Tipi di Test
- **Unit Tests** - Singole funzioni e componenti
- **Integration Tests** - Flussi completi utente
- **E2E Tests** - Scenari end-to-end (opzionale)

### 🛠️ Tools di Testing
- **Vitest** - Test runner veloce
- **React Testing Library** - Testing componenti
- **MSW** - Mock API calls

---

## 🆘 Supporto e Troubleshooting

### 🔍 Prima di chiedere aiuto:
1. 📖 Controlla [Troubleshooting Guide](./setup/troubleshooting.md)
2. 🔍 Cerca negli [Issues GitHub](../../../issues)
3. 📚 Consulta la documentazione delle librerie

### 💬 Come ottenere supporto:
1. **Issues GitHub** - Per bug e feature request
2. **Team Frontend** - Per domande di sviluppo
3. **Code Review** - Per feedback su implementazioni

### 📊 Metriche di Qualità
- **TypeScript Coverage** - >90%
- **Test Coverage** - >80%
- **Performance Score** - >90 (Lighthouse)
- **Accessibility** - WCAG 2.1 AA

---

## 🤝 Contributing

### 📝 Come Contribuire
1. 📥 Fork del repository
2. 🌿 Crea branch feature (`git checkout -b feature/amazing-feature`)
3. 💻 Sviluppa la tua feature
4. ✅ Aggiungi test se necessario
5. 📝 Committa le modifiche (`git commit -m 'feat: add amazing feature'`)
6. 🚀 Push del branch (`git push origin feature/amazing-feature`)
7. 🔄 Apri Pull Request

### 🎯 Code Review Checklist
- [ ] Codice TypeScript senza errori
- [ ] Componenti testati
- [ ] Documentazione aggiornata
- [ ] Performance ottimizzate
- [ ] Accessibilità verificata

---

## 📞 Contatti Team Frontend

### 👥 Team Members
- **Lead Frontend Developer**: #######
- **UI/UX Designer**: TBD
- **Frontend Contributor**: Aperte posizioni

### 📧 Comunicazione
- **Slack Channel**: `#frontend-dev`
- **Email Team**: frontend@co2-project.dev
- **Weekly Standup**: Lunedì 9:00 AM

---

**🌱 Sviluppato con ❤️ per un futuro più sostenibile 🌍**

---

*Ultima modifica: $(date)*
*Versione documentazione: 1.0.0*