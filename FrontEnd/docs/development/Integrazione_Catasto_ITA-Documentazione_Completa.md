# Integrazione Catasto Italiano nella Web App "CO₂ e O₂: Il tuo terreno respira"

## 📋 Sommario della Discussione

**Data:** 26 Maggio 2025  
**Argomento:** Possibilità di integrare dati catastali italiani oltre alla funzione di disegno poligoni con Leaflet  
**Risultato:** ✅ Integrazione possibile e gratuita tramite servizio WMS dell'Agenzia delle Entrate

---

## 🎯 Domanda Iniziale

L'utente ha chiesto se fosse possibile introdurre, oltre alla funzione di disegnare i poligoni con Leaflet, anche la possibilità di collegarsi gratuitamente ai dati del catasto italiano.

**Riferimento del cliente:** Utilizza solitamente [Geoportale Cartografia Agenzia Entrate](https://geoportale.cartografia.agenziaentrate.gov.it/age-inspire/srv/ita/catalog.search#/home?pg=homegeopoimap) per prendere le particelle dei fogli catastali scegliendo:
- Regione
- Provincia catastale  
- Comune catastale
- Foglio del catasto terreni
- Particella della mappa

---

## ✅ Soluzione Identificata

### Servizio WMS Agenzia delle Entrate

**URL Ufficiale:** `https://wms.cartografia.agenziaentrate.gov.it/inspire/wms/ows01.php`

**Caratteristiche principali:**
- **Licenza:** CC-BY 4.0 (gratuita con citazione obbligatoria)
- **Copertura:** Intero territorio nazionale (escluse Province Autonome di Trento e Bolzano)
- **Dati:** Oltre 300.000 mappe, 85 milioni di particelle, 18 milioni di fabbricati
- **Aggiornamento:** Tempo reale tramite atti tecnici professionali
- **Utilizzo:** Oltre 16 milioni di richieste quotidiane

---

## 🛠️ Implementazione Tecnica

### Layer WMS Disponibili
- `particelle` - Confini delle particelle catastali
- `acque` - Corsi d'acqua e bacini
- `strade` - Viabilità
- `fabbricati` - Edifici e costruzioni
- `fiduciali` - Punti di riferimento

### Integrazione con Leaflet

```javascript
// Layer catastale WMS
<WMSTileLayer
  url="https://wms.cartografia.agenziaentrate.gov.it/inspire/wms/ows01.php"
  layers="particelle,acque,strade,fabbricati,fiduciali"
  format="image/png"
  transparent={true}
  attribution='&copy; Agenzia delle Entrate - CC BY 4.0'
  opacity={0.7}
/>
```

### Funzionalità Implementabili

1. **Visualizzazione Catasto**
   - Sovrapporre layer catastale alla mappa base
   - Controllo visibilità on/off
   - Regolazione opacità

2. **Ricerca Particelle**
   - Input per Comune, Foglio, Particella
   - Zoom automatico sulla particella trovata
   - Highlight della particella selezionata

3. **Interazione Click**
   - Click sulla mappa per ottenere info catastali
   - Popup con dettagli particella
   - Possibilità di selezionare particella per calcoli CO₂

4. **Integrazione con Disegno Manuale**
   - Mantenere funzionalità disegno poligoni
   - Sovrapporre disegni ai dati catastali
   - Calcolo area usando geometrie catastali precise

---

## 🔧 Vantaggi dell'Integrazione

### Per gli Utenti
- **Precisione:** Dati catastali ufficiali invece di disegni approssimativi
- **Facilità:** Selezione diretta di particelle esistenti
- **Affidabilità:** Informazioni sempre aggiornate
- **Professionalità:** Utilizzo di dati certificati

### Per l'Applicazione
- **Credibilità:** Uso di fonti istituzionali
- **Accuratezza Calcoli:** Aree precise per calcoli CO₂/O₂
- **Completezza:** Combinazione disegno manuale + dati catastali
- **Scalabilità:** Servizio robusto con alte prestazioni

---

## 📋 Considerazioni Legali

### Licenza CC-BY 4.0
- ✅ **Uso Gratuito:** Nessun costo per l'utilizzo
- ✅ **Uso Commerciale:** Permesso anche per applicazioni commerciali
- ✅ **Modifiche:** Possibili elaborazioni e trasformazioni
- ❗ **Obbligo Citazione:** Sempre indicare "© Agenzia delle Entrate"

### Limitazioni
- 🚫 Non disponibile per Province Autonome di Trento e Bolzano
- 🚫 Alcune mappe possono essere sottoposte a vincoli di riservatezza
- ⚠️ Limite richieste simultanee per garantire il servizio

---

## 🚀 Implementazione Consigliata

### Fase 1: Setup Base
```javascript
// Componente React con layer catastale
const MappaConCatasto = () => {
  const [showCatasto, setShowCatasto] = useState(true);
  
  return (
    <MapContainer center={[41.9028, 12.4964]} zoom={12}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      {showCatasto && (
        <WMSTileLayer
          url="https://wms.cartografia.agenziaentrate.gov.it/inspire/wms/ows01.php"
          layers="particelle,fabbricati"
          format="image/png"
          transparent={true}
          attribution='© Agenzia delle Entrate - CC BY 4.0'
        />
      )}
    </MapContainer>
  );
};
```

### Fase 2: Controlli Utente
- Toggle visibilità catasto
- Slider opacità layer
- Selezione layer specifici (particelle, fabbricati, etc.)

### Fase 3: Ricerca e Selezione
- Form ricerca per codici catastali
- Click sulla mappa per info particella
- Selezione multipla particelle per calcoli

### Fase 4: Integrazione Backend (Opzionale)
```python
# Esempio query GetFeatureInfo per info particella
async def get_parcel_info(lat: float, lon: float):
    wms_url = "https://wms.cartografia.agenziaentrate.gov.it/inspire/wms/ows01.php"
    params = {
        'SERVICE': 'WMS',
        'REQUEST': 'GetFeatureInfo',
        'LAYERS': 'particelle',
        'QUERY_LAYERS': 'particelle',
        'CRS': 'EPSG:4326',
        'BBOX': f'{lon-0.001},{lat-0.001},{lon+0.001},{lat+0.001}',
        'WIDTH': '100',
        'HEIGHT': '100',
        'I': '50',
        'J': '50',
        'INFO_FORMAT': 'text/plain'
    }
    response = requests.get(wms_url, params=params)
    return response.text
```

---

## 📊 Impatto sul Progetto CO₂

### Miglioramenti Previsti
1. **Accuratezza Calcoli:** Area terreni precisa al metro quadrato
2. **User Experience:** Selezione rapida invece di disegno manuale
3. **Credibilità:** Dati certificati dall'Agenzia delle Entrate
4. **Funzionalità Avanzate:** 
   - Ricerca per indirizzo
   - Storico particelle
   - Export dati catastali

### Integrazione con Calcoli Ambientali
- Utilizzo area catastale precisa per calcoli CO₂/O₂
- Classificazione automatica tipologia terreno
- Possibile integrazione con dati di produttività catastale
- Correlazione con dati meteo per zona specifica

---

## 🔍 Risorse e Collegamenti

### Documentazione Ufficiale
- [Servizio WMS Agenzia Entrate](https://www.agenziaentrate.gov.it/portale/schede/fabbricatiterreni/consultazione-cartografia-catastale/servizio-consultazione-cartografia)
- [API Catalog Italia](https://developers.italia.it/it/api/ade-cartografia-wms.html)
- [Geoportale Catastale](https://geoportale.cartografia.agenziaentrate.gov.it)

### Esempi Pratici
- [GitHub - Navigatore Catasto](https://github.com/enricofer/catasto)
- [Demo Online](https://enricofer.github.io/catasto/navigatore.html)
- [Tutorial QGIS con WMS Catasto](https://pigreco.github.io/workshop-estate-gis-2021/wms_catasto/)

### Specifiche Tecniche
- **Formato:** WMS 1.3.0
- **Proiezione:** ETRS89 (EPSG:6706) → Web Mercator (EPSG:3857)
- **Formati Output:** PNG, JPEG
- **Info Format:** text/plain, text/html

---

## ✅ Conclusioni

**L'integrazione è altamente raccomandabile** per questi motivi:

1. **Fattibilità Tecnica:** ✅ Completamente compatibile con Leaflet
2. **Costi:** ✅ Servizio gratuito con licenza permissiva
3. **Qualità Dati:** ✅ Fonte ufficiale e sempre aggiornata
4. **Valore Aggiunto:** ✅ Significativo miglioramento UX e accuratezza
5. **Complessità:** ✅ Implementazione relativamente semplice

**Prossimi Step:**
1. Test implementazione base con layer WMS
2. Sviluppo controlli utente (toggle, ricerca)
3. Integrazione con logica calcoli CO₂/O₂
4. Testing prestazioni e UX
5. Documentazione per utenti finali

---

*Documentazione generata il 26 Maggio 2025 - Progetto "CO₂ e O₂: Il tuo terreno respira"*