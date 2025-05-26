# 🚀 Setup Ambiente di Sviluppo - Web App CO₂ e O₂

## ✅ Prerequisiti (Già installati)
- Windows 11 ✅
- Visual Studio Code ✅
- Python 3.13 ✅

---

## 📦 STEP 1: Installazione Node.js

### Perché Node.js?
Node.js è necessario per:
- Eseguire JavaScript lato server
- Gestire pacchetti npm (librerie)
- Strumenti di build per React

### Download e Installazione
1. **Vai su**: https://nodejs.org/
2. **Scarica**: "LTS" version (Long Term Support - versione stabile)
3. **Installa**: Segui il wizard, mantieni tutte le opzioni predefinite
4. **Verifica installazione**:
   ```bash
   # Apri CMD o PowerShell e digita:
   node --version
   # Deve mostrare: v20.x.x o superiore
   
   npm --version
   # Deve mostrare: 10.x.x o superiore
   ```

---

## 🛠️ STEP 2: Configurazione Visual Studio Code

### Estensioni Essenziali da Installare

Apri VS Code → Vai su Extensions (Ctrl+Shift+X) e installa:

#### React e JavaScript
- **ES7+ React/Redux/React-Native snippets** - `dsznajder.es7-react-js-snippets`
- **JavaScript (ES6) code snippets** - `xabikos.JavaScriptSnippets`
- **Auto Rename Tag** - `formulahendry.auto-rename-tag`

#### TypeScript
- **TypeScript Hero** - `rbbit.typescript-hero`
- **TypeScript and JavaScript Language Features** (già incluso)

#### CSS e Styling
- **Tailwind CSS IntelliSense** - `bradlc.vscode-tailwindcss`
- **CSS Peek** - `pranaygp.vscode-css-peek`

#### Sviluppo Web
- **Live Server** - `ritwickdey.LiveServer`
- **Prettier - Code formatter** - `esbenp.prettier-vscode`
- **ESLint** - `dbaeumer.vscode-eslint`

#### Git
- **GitLens** - `eamodio.gitlens`

---

## 🎯 STEP 3: Creazione Progetto React

### 3.1 Creazione con Vite (Raccomandato)

```bash
# Apri CMD/PowerShell e naviga dove vuoi creare il progetto
cd Desktop
# oppure cd Documents

# Crea il progetto
npm create vite@latest co2-terreno-app -- --template react-ts
```

**⚠️ IMPORTANTE - Selezioni in Sequenza:**

**PRIMA SELEZIONE - Framework:**
```
◇  Select a framework:
│  ● React          ← SCEGLI QUESTA!
│  ○ Vue
│  ○ Preact
│  ○ Lit
│  ○ Svelte
│  ○ Solid
│  ○ Qwik
│  ○ Angular
│  ○ Others
```
**✅ Seleziona: "React"** (dovrebbe essere già selezionato di default)

**SECONDA SELEZIONE - Variante React:**
```
◆  Select a variant:
│  ○ TypeScript
│  ● TypeScript + SWC     ← SCEGLI QUESTA!
│  ○ JavaScript
│  ○ JavaScript + SWC
│  ○ React Router v7 ↗
│  ○ TanStack Router ↗
│  ○ RedwoodSDK ↗
```
**✅ Seleziona: "TypeScript + SWC"**

**Perché TypeScript + SWC?**
- **TypeScript**: Controllo tipi, meno errori, miglior IntelliSense
- **SWC**: Compilatore ultra-veloce (scritto in Rust), build più rapide
- **Performance**: Hot-reload istantaneo durante sviluppo
- **Moderno**: Configurazione più aggiornata e performante

```bash
# Dopo la selezione, continua con:
cd co2-terreno-app

# Installa le dipendenze
npm install

# Avvia il server di sviluppo
npm run dev
```

### 3.2 Verifica Setup Base - DETTAGLIATA

**Nel terminale dovresti vedere:**
```
> co2-terreno-app@0.0.0 dev
> vite
  VITE v6.3.5  ready in 1031 ms
  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**✅ PASSAGGIO CRITICO - Verifica nel Browser:**

1. **Apri il browser** e naviga su: `http://localhost:5173/`

2. **Dovresti vedere ESATTAMENTE questo:**
   - **Header**: "Vite + React" 
   - **Loghi animati**: Logo Vite (con gradiente viola/blu) e logo React (che ruota)
   - **Contatore interattivo**: Pulsante "count is 0" che aumenta al click
   - **Testo**: "Edit src/App.tsx and save to test HMR"
   - **Link**: "Click on the Vite and React logos to learn more"

3. **Test di funzionamento:**
   - ✅ Clicca il pulsante contatore → il numero deve aumentare
   - ✅ I loghi devono essere animati (Vite con gradiente, React che ruota)
   - ✅ La pagina deve caricarsi senza errori nella console browser

**🚨 Se NON vedi questa pagina o ci sono errori:**
- Verifica che il terminale non mostri errori rossi
- Controlla che l'URL sia esattamente `http://localhost:5173/`
- Prova a refreshare la pagina (F5)

**✅ Se vedi tutto correttamente → Il setup React è PERFETTO!** 🎉

**⚠️ IMPORTANTE**: Lascia questo terminale aperto durante tutto lo sviluppo - è il tuo server di sviluppo!

---

## 📋 STEP 4: Installazione Librerie Specifiche del Progetto

### **🚨 PREREQUISITI IMPORTANTI:**
- **Mantieni APERTO** il primo terminale con `npm run dev` (server Vite)
- **Apri un NUOVO terminale/PowerShell** per i comandi di installazione
- Il browser deve rimanere aperto su `localhost:5173`
- **Naviga nella cartella del progetto** nel nuovo terminale:
```bash
cd "PERCORSO_COMPLETO_DELLA_TUA_CARTELLA\co2-terreno-app"
# Esempio: cd "C:\Users\tuoNome\Desktop\co2-terreno-app"

# Verifica di essere nella cartella giusta
dir
# Deve mostrare: package.json, src/, node_modules/, etc.
```

---

### **4.1 Librerie per Mappe (Leaflet)**
```bash
# Installa Leaflet per le mappe interattive
npm install leaflet react-leaflet leaflet-draw

# Installa i tipi TypeScript per Leaflet
npm install -D @types/leaflet
```

**✅ Risultato atteso:**
- `added 4 packages` (primo comando)
- `added 2 packages` (secondo comando)
- `found 0 vulnerabilities`
- Tempo: ~5-10 secondi

---

### **4.2 Librerie per Grafici (Chart.js)**
```bash
# Installa Chart.js per i grafici dinamici
npm install chart.js react-chartjs-2
```

**✅ Risultato atteso:**
- `added 3 packages`
- `found 0 vulnerabilities`
- Tempo: ~3-5 secondi

---

### **4.3 Librerie per Styling (Tailwind CSS)**
```bash
# Installa Tailwind CSS e dipendenze
npm install -D tailwindcss postcss autoprefixer

# Inizializza la configurazione Tailwind
npx tailwindcss init -p
```

**⚠️ PROBLEMA COMUNE su Windows:**
Il comando `npx tailwindcss init -p` potrebbe fallire con:
```
npm error could not determine executable to run
```

**🔧 SOLUZIONE - Creazione Manuale dei File:**

**STEP A: Verifica se i file esistono**
```bash
dir *.config.js
# Dovresti vedere solo: eslint.config.js
```

**STEP B: Crea i file di configurazione manualmente**

**Crea `tailwind.config.js`:**
1. **Apri VS Code** nella cartella del progetto (`co2-terreno-app`)
2. **Crea nuovo file** nella **ROOT del progetto** (stesso livello di `package.json`)
3. **Nome file**: `tailwind.config.js`
4. **Incolla questo contenuto**:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'co2-green': '#22C55E',
        'oxygen-blue': '#3B82F6',
        'earth-brown': '#A3794A'
      }
    },
  },
  plugins: [],
}
```

**Crea `postcss.config.js`:**
1. **Sempre in VS Code** nella cartella del progetto
2. **Crea nuovo file** nella **ROOT del progetto** (accanto a `tailwind.config.js`)
3. **Nome file**: `postcss.config.js`
4. **Incolla questo contenuto**:
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**STEP C: Verifica creazione**
```bash
dir *.config.js
# Ora dovresti vedere: eslint.config.js, tailwind.config.js, postcss.config.js
```

**STEP D: Configura CSS**
**Modifica `src/index.css`** sostituendo TUTTO il contenuto con:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Import Leaflet CSS */
@import 'leaflet/dist/leaflet.css';
@import 'leaflet-draw/dist/leaflet.draw.css';

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}
```

**🚨 NOTA IMPORTANTE:** Dopo aver modificato `index.css`, l'aspetto della pagina React cambierà (diventerà più "semplice"). **QUESTO È NORMALE!** Tailwind resetta gli stili di default per darti controllo completo.

**✅ Risultato atteso:**
- `added 11 packages`
- File `tailwind.config.js` e `postcss.config.js` creati
- Pagina browser cambia aspetto ma funziona ancora

---

### **4.4 Librerie Utility**
```bash
# Installa librerie di supporto
npm install axios date-fns react-hook-form react-select @turf/turf
```

**Cosa installano:**
- **axios**: API calls per dati meteo
- **date-fns**: Gestione avanzata delle date
- **react-hook-form**: Form complessi per inserimento vegetazione
- **react-select**: Dropdown avanzati per selezione specie
- **@turf/turf**: Calcoli geografici (area terreni, coordinate)

**✅ Risultato atteso:**
- `added ~230 packages` (molte dipendenze)
- `found 0 vulnerabilities`
- Tempo: ~1-2 minuti

---

### **4.5 Verifica Finale Installazione**
```bash
# Controlla tutte le librerie installate
npm list --depth=0
```

**✅ Dovresti vedere queste librerie chiave:**
```
├── leaflet@1.9.4                 # Mappe base
├── react-leaflet@5.0.0           # Mappe + React
├── leaflet-draw@1.0.4             # Disegno terreni
├── @types/leaflet@1.9.18          # TypeScript types
├── chart.js@4.4.9                # Grafici base
├── react-chartjs-2@5.3.0         # Grafici + React
├── tailwindcss@4.1.7             # CSS framework
├── axios@1.9.0                   # API calls
├── @turf/turf@7.2.0              # Calcoli geografici
├── date-fns@4.1.0                # Gestione date
├── react-hook-form@7.56.4        # Form avanzati
├── react-select@5.10.1           # Dropdown avanzati
└── ... (altre dipendenze)
```

---

### **🚨 Risoluzione Errori Comuni**

#### **Errore: "npm error could not determine executable to run"**
**Soluzione**: Segui la procedura di creazione manuale file Tailwind (Sezione 4.3)

#### **Errore: "Cannot find module 'leaflet'"**
**Soluzione**: 
```bash
npm install leaflet react-leaflet --force
```

#### **Avvertimenti normali da IGNORARE:**
- `peer dependency warnings` → Normali
- `deprecated packages` → Comuni nelle librerie
- `vulnerability found` (BASSA severità) → Non critici per sviluppo

#### **Errori che richiedono attenzione:**
- `ERESOLVE unable to resolve dependency tree` → Conflitto dipendenze
- `npm ERR! code E404` → Pacchetto non trovato
- `EACCES permission denied` → Problemi permessi

#### **Se la pagina React smette di funzionare:**
1. Controlla il terminale del server dev per errori
2. Riavvia il server: `Ctrl+C` poi `npm run dev`
3. Pulisci cache: `npm cache clean --force`

---

### **⏱️ Tempo Totale Stimato: 5-10 minuti**

### **🎉 Status Finale**
Se tutto è andato bene, hai ora **TUTTE** le librerie necessarie per sviluppare la web app CO₂ e O₂!

---

## ⚙️ STEP 5: Configurazione Tailwind CSS

### 5.1 Modifica `tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'co2-green': '#22C55E',
        'oxygen-blue': '#3B82F6',
        'earth-brown': '#A3794A'
      }
    },
  },
  plugins: [],
}
```

### 5.2 Modifica `src/index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Import Leaflet CSS */
@import 'leaflet/dist/leaflet.css';
@import 'leaflet-draw/dist/leaflet.draw.css';

/* Stili personalizzati per la nostra app */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.map-container {
  height: 400px;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
```

---

## 📁 STEP 6: Struttura Directory del Progetto

### **🎯 Obiettivo**
Creare un'organizzazione professionale del codice per facilitare lo sviluppo e la manutenzione della web app.

### **📋 Gestione Terminali**
- ✅ **USA LO STESSO terminale** delle librerie (dove hai fatto le installazioni)
- ✅ **MANTIENI APERTO** il terminale con `npm run dev` (server Vite)
- ❌ **NON serve** aprire nuovi terminali

### **🔍 Verifica Posizione**
```bash
# Assicurati di essere nella cartella del progetto
cd
# Dovresti vedere il percorso che finisce con: \co2-terreno-app
```

---

### **📁 Creazione Struttura - Comandi Testati per PowerShell**

**Crea le cartelle dei componenti:**
```bash
mkdir "src\components\ui"
mkdir "src\components\map"
mkdir "src\components\vegetation"
mkdir "src\components\dashboard"
mkdir "src\components\charts"
mkdir "src\components\layout"
```

**Crea le cartelle di supporto:**
```bash
mkdir "src\hooks"
mkdir "src\services"
mkdir "src\utils"
mkdir "src\types"
mkdir "src\data"
mkdir "src\pages"
```

---

### **📂 Descrizione delle Cartelle Create**

#### **🧩 `src/components/` - Componenti React**
- **`ui/`** - Componenti base riutilizzabili (Button, Input, Modal, Card)
- **`map/`** - Componenti per la mappa interattiva (MapContainer, DrawingTools, TerrainPolygon)
- **`vegetation/`** - Gestione delle specie vegetali (SpeciesSelector, VegetationForm, VegetationList)
- **`dashboard/`** - Dashboard principale e metriche (MetricsCards, SummaryTable)
- **`charts/`** - Grafici specifici (CO2Chart, O2Chart, ComparisonChart)
- **`layout/`** - Struttura dell'app (Header, Footer, Navigation, Sidebar)

#### **🔧 `src/hooks/` - Custom Hooks React**
Logica riutilizzabile per:
- `useMap.ts` - Gestione stato mappa
- `useVegetation.ts` - Gestione specie vegetali
- `useWeather.ts` - Chiamate API meteo
- `useCalculations.ts` - Calcoli CO₂ e O₂

#### **🌐 `src/services/` - API e Servizi Esterni**
Comunicazione con servizi esterni:
- `weatherAPI.ts` - Integrazione Open-Meteo
- `geocodingAPI.ts` - Conversione coordinate
- `storageService.ts` - Salvataggio dati locali

#### **🛠️ `src/utils/` - Funzioni Utility**
Funzioni di supporto e calcoli:
- `calculations/` - Formule CO₂ e O₂
- `formatters.ts` - Formattazione dati
- `validators.ts` - Validazione input
- `constants.ts` - Costanti dell'app

#### **📝 `src/types/` - Definizioni TypeScript**
Tipi per sicurezza del codice:
- `map.types.ts` - Tipi per mappe e coordinate
- `vegetation.types.ts` - Tipi per specie vegetali
- `weather.types.ts` - Tipi per dati meteo
- `calculation.types.ts` - Tipi per risultati calcoli

#### **📊 `src/data/` - Dati Statici**
Database locale dell'applicazione:
- `species.json` - Database specie vegetali
- `formulas.json` - Formule scientifiche
- `regions.json` - Dati geografici

#### **📄 `src/pages/` - Pagine Principali**
Pagine dell'applicazione:
- `HomePage.tsx` - Pagina iniziale
- `MapPage.tsx` - Pagina mappa interattiva
- `DashboardPage.tsx` - Pagina risultati
- `AboutPage.tsx` - Informazioni sul progetto

---

### **✅ Verifica Creazione**
```bash
# Controlla le cartelle dei componenti
dir "src\components"

# Controlla le cartelle di supporto
dir src

# Verifica che tutte le cartelle esistano
dir "src\hooks"
dir "src\services"
dir "src\utils"
dir "src\types"
dir "src\data"
dir "src\pages"
```

### **🎯 Struttura Finale**
```
src/
├── components/          ← Componenti React UI
│   ├── ui/             ← Componenti base
│   ├── map/            ← Gestione mappa
│   ├── vegetation/     ← Specie vegetali
│   ├── dashboard/      ← Dashboard e metriche
│   ├── charts/         ← Grafici dinamici
│   └── layout/         ← Layout dell'app
├── hooks/              ← Custom React hooks
├── services/           ← API e servizi esterni
├── utils/              ← Funzioni utility
├── types/              ← TypeScript definitions
├── data/               ← Dati statici
├── pages/              ← Pagine principali
├── App.tsx             ← (già esistente)
├── main.tsx            ← (già esistente)
└── index.css           ← (già modificato con Tailwind)
```

### **🚨 Note Importanti**
- **PowerShell**: I comandi multipli `mkdir` non funzionano, usa sempre comandi singoli
- **Virgolette**: Sempre necessarie per i percorsi con backslash
- **Comando tree**: Non disponibile in PowerShell standard

### **✅ Status**
Se tutte le cartelle sono state create senza errori, la struttura del progetto è pronta per lo sviluppo! 🎉

---

## 🧪 STEP 7: Test dell'Ambiente

### Crea un componente di test per verificare che tutto funzioni:

**File: `src/components/TestComponent.tsx`**
```typescript
import React, { useState } from 'react';

const TestComponent: React.FC = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-co2-green mb-4">
        🌱 Test Ambiente CO₂ App
      </h2>
      <p className="text-gray-600 mb-4">
        Se vedi questo componente stilizzato, l'ambiente è configurato correttamente!
      </p>
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setCount(count - 1)}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          -
        </button>
        <span className="text-xl font-semibold">{count}</span>
        <button 
          onClick={() => setCount(count + 1)}
          className="px-4 py-2 bg-co2-green text-white rounded hover:bg-green-600"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default TestComponent;
```

**Modifica `src/App.tsx`:**
```typescript
import TestComponent from './components/TestComponent'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <TestComponent />
    </div>
  )
}

export default App
```

### Esegui il test:
```bash
npm run dev
```

Se vedi il componente con stili Tailwind funzionanti, **OTTIMO!** ✅

---

## 🔧 STEP 8: Configurazione Git (Raccomandato)

### **📋 Gestione Terminali**
- ✅ **USA LO STESSO terminale** dove hai creato le cartelle
- ✅ **MANTIENI APERTO** il terminale con `npm run dev`

### **🔍 Verifica Installazione Git**
```bash
git --version
```
**✅ Se vedi una versione (es. `git version 2.x.x`) → Git è installato**
**❌ Se vedi errore → Installa Git da https://git-scm.com/**

---

### **⚙️ FASE 1: Configurazione Git Globale**
```bash
# Configura il tuo nome (sostituisci con i tuoi dati reali)
git config --global user.name "Il Tuo Nome Cognome"

# Configura la tua email (sostituisci con la tua email)
git config --global user.email "tua.email@gmail.com"

# Verifica configurazione
git config --global user.name
git config --global user.email
```

**✅ Risultato atteso:**
```
Il Tuo Nome Cognome
tua.email@gmail.com
```

---

### **📁 FASE 2: Inizializzazione Repository**
```bash
# Assicurati di essere nella cartella del progetto
cd
# Deve finire con: \co2-terreno-app

# Inizializza repository Git
git init
```

**✅ Risultato atteso:**
```
Initialized empty Git repository in C:\...\co2-terreno-app\.git\
```

---

### **📝 FASE 3: Verifica .gitignore**
```bash
# Controlla contenuto .gitignore (creato automaticamente da Vite)
type .gitignore
```

**✅ Il file dovrebbe contenere:**
```
# Logs
logs
*.log
npm-debug.log*
node_modules
dist
dist-ssr
*.local
# Editor directories and files
.vscode/*
.idea
.DS_Store
```

**💡 Opzionale - Miglioramento .gitignore:**
Puoi aprire `.gitignore` in VS Code e aggiungere:
```
# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# OS generated files
Thumbs.db

# Temporary files
*.tmp
*.temp
```

---

### **📊 FASE 4: Primo Commit**
```bash
# Vedi lo stato del repository
git status

# Aggiungi tutti i file al staging
git add .

# Verifica cosa hai aggiunto
git status

# Crea il primo commit
git commit -m "Initial setup: React + TypeScript + Tailwind + Leaflet + Chart.js

- Configurazione base con Vite + React + TypeScript + SWC
- Installazione e configurazione Tailwind CSS
- Installazione Leaflet per mappe interattive
- Installazione Chart.js per grafici dinamici
- Struttura cartelle professionale creata
- Librerie utility per API meteo e calcoli geografici
- Documentazione progetto iniziale"
```

**✅ Risultato atteso:**
- `24 files changed, 7531 insertions(+)`
- Commit hash generato (es. `12ccb98`)

**⚠️ Warning normali da IGNORARE:**
```
warning: LF will be replaced by CRLF
```
Questi warning sono **normali su Windows** - Git gestisce automaticamente i fine riga.

---

### **🔍 FASE 5: Verifica Repository**
```bash
# Vedi la cronologia dei commit
git log --oneline

# Vedi lo stato attuale
git status
```

**✅ Risultato atteso:**
- Un commit nella cronologia
- `working tree clean` (nessun file modificato)

---

### **🌟 FASE 6: Configurazione Branch Principale**
```bash
# Rinomina il branch da 'master' a 'main' (standard moderno)
git branch -M main

# Verifica il nome del branch
git branch

# Controlla stato finale
git status
```

**✅ Risultato atteso:**
```
* main
On branch main
nothing to commit, working tree clean
```

---

## 🌐 Caricamento su GitHub

### **👨‍💻 Per l'AUTORE del Progetto:**

#### **STEP A: Crea Repository su GitHub**
1. Vai su **https://github.com**
2. Click **"New repository"** (pulsante verde)
3. **Nome repository**: `co2-terreno-app` o `co2-oxygen-webapp`
4. **Descrizione**: `Web app interattiva per calcolare assorbimento CO₂ e produzione O₂ di terreni agricoli e boschivi`
5. ✅ **Public** (se vuoi condividere) o **Private**
6. ❌ **NON selezionare** "Add README" (già lo hai)
7. ❌ **NON selezionare** ".gitignore" (già lo hai)
8. Click **"Create repository"**

#### **STEP B: Collega Repository Locale a GitHub**
```bash
# Aggiungi remote origin (sostituisci USERNAME con il tuo username GitHub)
git remote add origin https://github.com/USERNAME/co2-terreno-app.git

# Verifica remote
git remote -v

# Carica il codice su GitHub
git push -u origin main
```

#### **STEP C: Verifica Upload**
- Ricarica la pagina GitHub
- Dovresti vedere tutti i file del progetto
- La documentazione sarà visibile nella cartella `documentation/`

---

### **👥 Per i COLLABORATORI:**

#### **STEP 1: Clone del Repository**
```bash
# Naviga dove vuoi scaricare il progetto
cd Desktop
# o cd "C:\Path\To\Your\Projects"

# Clona il repository (sostituisci URL con quello reale)
git clone https://github.com/USERNAME/co2-terreno-app.git

# Entra nella cartella
cd co2-terreno-app
```

#### **STEP 2: Setup Ambiente di Sviluppo**
```bash
# Installa le dipendenze
npm install

# Avvia il server di sviluppo
npm run dev
```

#### **STEP 3: Workflow Collaborazione**
```bash
# Prima di iniziare a lavorare, scarica le ultime modifiche
git pull origin main

# Crea un branch per la tua feature
git checkout -b feature/nome-della-tua-feature

# Lavora sui tuoi cambiamenti...
# Quando hai finito:

# Aggiungi le modifiche
git add .

# Committa con messaggio descrittivo
git commit -m "Add: descrizione della tua modifica"

# Carica il branch su GitHub
git push origin feature/nome-della-tua-feature

# Su GitHub: crea una Pull Request per revisione
```

#### **STEP 4: Aggiornamento Continuo**
```bash
# Torna al branch main
git checkout main

# Scarica le ultime modifiche
git pull origin main

# Se necessario, aggiorna dipendenze
npm install
```

---

## 🎯 Best Practices Git per il Progetto

### **📝 Commit Messages Standard:**
```bash
# Esempi di commit ben strutturati:
git commit -m "Add: componente mappa interattiva con Leaflet"
git commit -m "Fix: calcolo area terreno con coordinate errate"
git commit -m "Update: migliorata interfaccia dashboard CO₂"
git commit -m "Docs: aggiunta guida installazione API meteo"
```

### **🌿 Branch Strategy:**
- **`main`**: Codice stabile e testato
- **`develop`**: Sviluppo attivo
- **`feature/nome-feature`**: Nuove funzionalità
- **`fix/nome-bug`**: Correzioni bug
- **`docs/nome-doc`**: Aggiornamenti documentazione

### **🔍 Comandi Utili:**
```bash
# Vedi differenze prima di committare
git diff

# Vedi cronologia dettagliata
git log --graph --oneline --all

# Annulla ultima modifica (prima del commit)
git checkout -- filename.txt

# Vedi chi ha modificato ogni riga di un file
git blame filename.txt
```

---

## ✅ Checklist Git

### **✅ Repository Locale:**
- [ ] Git configurato con nome ed email
- [ ] Repository inizializzato
- [ ] Primo commit creato
- [ ] Branch rinominato in `main`
- [ ] Working tree pulito

### **✅ GitHub (Opzionale):**
- [ ] Repository creato su GitHub
- [ ] Codice caricato con `git push`
- [ ] README.md visibile su GitHub
- [ ] Collaboratori aggiunti (se necessario)

### **✅ Collaborazione:**
- [ ] Clone funzionante per collaboratori
- [ ] `npm install` funziona
- [ ] Server dev si avvia correttamente
- [ ] Workflow branch/PR stabilito

**🎉 Git è ora configurato professionalmente per lo sviluppo collaborativo!**

---

## 🎯 CHECKLIST FINALE

### ✅ Verifica che tutto sia installato:
- [ ] Node.js (v18+) e npm funzionanti
- [ ] Progetto React creato con Vite
- [ ] Estensioni VS Code installate
- [ ] Leaflet installato
- [ ] Chart.js installato
- [ ] Tailwind CSS configurato
- [ ] Struttura cartelle creata
- [ ] Componente di test funzionante

### 🚀 Prossimi Passi
1. **Familiarizzare con React** - Crea alcuni componenti semplici
2. **Integrare Leaflet** - Mappa base con marker
3. **Aggiungere Chart.js** - Primo grafico di prova
4. **Sviluppare la logica business** - Calcoli CO₂ e O₂

---

## 🆘 Risoluzione Problemi Comuni

### Errore: "npm non riconosciuto"
**Soluzione**: Riavvia il terminale dopo l'installazione di Node.js

### Errore: Leaflet mappa non visualizzata
**Soluzione**: Verifica che il CSS sia importato in `index.css`

### Errore: Tailwind non funziona
**Soluzione**: Controlla che `tailwind.config.js` abbia i path corretti

### Performance lenta
**Soluzione**: Usa `npm run build` per versione ottimizzata

---

## 📞 Supporto
Se incontri problemi durante il setup, condividi:
1. Messaggio di errore completo
2. Comandi eseguiti
3. Versione Node.js (`node --version`)

Buon sviluppo! 🌱💚