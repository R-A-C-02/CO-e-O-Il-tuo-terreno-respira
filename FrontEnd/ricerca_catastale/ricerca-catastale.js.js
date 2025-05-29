// === VARIABILI GLOBALI ===
let map = null;
let cadastralLayer = null;
let selectedParcels = [];
let currentLevel = 'italia';
let currentSelection = {
    regione: null,
    provincia: null,
    comune: null,
    foglio: null
};

// Dati amministrativi (simulati basati sulla struttura del file comuni.json)
let comuniData = [];
let regioniData = [];
let provinceData = [];

// Zoom levels configurati
const ZOOM_LEVELS = {
    italia: 6,
    regione: 8,
    provincia: 10,
    comune: 13,
    foglio: 16
};

// Layer catastale WMS
const WMS_CONFIG = {
    url: 'https://wms.cartografia.agenziaentrate.gov.it/inspire/wms/ows01.php',
    layers: 'particelle,fabbricati,acque,strade,fiduciali',
    format: 'image/png',
    transparent: true,
    attribution: '© Agenzia delle Entrate - CC BY 4.0'
};

// Cache locale per richieste frequenti
const cache = {
    wmsRequests: new Map(),
    geometries: new Map()
};

// === INIZIALIZZAZIONE ===
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initializeMap();
        await loadAdministrativeData();
        initializeEventListeners();
        loadRegioni();
        showToast('Sistema di ricerca catastale inizializzato', 'success');
    } catch (error) {
        console.error('Errore inizializzazione:', error);
        showToast('Errore nell\'inizializzazione del sistema', 'error');
    }
});

// === INIZIALIZZAZIONE MAPPA ===
async function initializeMap() {
    // Inizializza mappa centrata sull'Italia
    map = L.map('map-container').setView([41.9028, 12.4964], ZOOM_LEVELS.italia);
    
    // Layer base OpenStreetMap
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    });
    
    // Layer satellitare (opzionale)
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri'
    });
    
    // Aggiungi layer base
    osmLayer.addTo(map);
    
    // Inizializza layer catastale WMS
    initializeCadastralLayer();
    
    // Eventi mappa
    map.on('click', onMapClick);
    map.on('zoomend', updateZoomDisplay);
    map.on('mousemove', updateCoordinatesDisplay);
    
    // Controlli layer
    const baseLayers = {
        "OpenStreetMap": osmLayer,
        "Satellitare": satelliteLayer
    };
    
    L.control.layers(baseLayers).addTo(map);
    
    updateZoomDisplay();
}

function initializeCadastralLayer() {
    cadastralLayer = L.tileLayer.wms(WMS_CONFIG.url, {
        layers: WMS_CONFIG.layers,
        format: WMS_CONFIG.format,
        transparent: WMS_CONFIG.transparent,
        attribution: WMS_CONFIG.attribution,
        opacity: 0.7,
        maxZoom: 19
    });
    
    // Aggiungi layer catastale di default
    cadastralLayer.addTo(map);
}

// === CARICAMENTO DATI AMMINISTRATIVI ===
async function loadAdministrativeData() {
    try {
        // Simula il caricamento del file comuni.json
        // In produzione, sostituire con: const response = await fetch('comuni.json');
        comuniData = generateMockComuniData();
        
        // Elabora dati per creare liste di regioni e province
        processAdministrativeData();
        
    } catch (error) {
        console.error('Errore caricamento dati amministrativi:', error);
        throw error;
    }
}

function generateMockComuniData() {
    // Simula la struttura del file comuni.json basata sull'analisi fornita
    const regioni = [
        { nome: 'Lombardia', codice: '03' },
        { nome: 'Lazio', codice: '12' },
        { nome: 'Campania', codice: '15' },
        { nome: 'Sicilia', codice: '19' },
        { nome: 'Veneto', codice: '05' },
        { nome: 'Emilia-Romagna', codice: '08' },
        { nome: 'Piemonte', codice: '01' },
        { nome: 'Puglia', codice: '16' },
        { nome: 'Toscana', codice: '09' },
        { nome: 'Calabria', codice: '18' }
    ];
    
    const mockData = [];
    
    regioni.forEach(regione => {
        // Province per regione (esempio Lombardia)
        const province = regione.nome === 'Lombardia' ? [
            { nome: 'Como', codice: 'CO', sigla: 'CO' },
            { nome: 'Milano', codice: 'MI', sigla: 'MI' },
            { nome: 'Bergamo', codice: 'BG', sigla: 'BG' },
            { nome: 'Brescia', codice: 'BS', sigla: 'BS' }
        ] : [
            { nome: `Provincia ${regione.nome} 1`, codice: `${regione.codice}1`, sigla: `${regione.codice}1` },
            { nome: `Provincia ${regione.nome} 2`, codice: `${regione.codice}2`, sigla: `${regione.codice}2` }
        ];
        
        province.forEach(provincia => {
            // Comuni per provincia (esempio Como)
            const comuni = provincia.nome === 'Como' ? [
                'Tavernerio', 'Como', 'Cantù', 'Mariano Comense', 'Erba', 'Olgiate Comasco'
            ] : [`${provincia.nome} Centro`, `${provincia.nome} Nord`, `${provincia.nome} Sud`];
            
            comuni.forEach((comuneNome, index) => {
                mockData.push({
                    nome: comuneNome,
                    codice: `${provincia.codice}${String(index + 1).padStart(3, '0')}`,
                    zona: {
                        codice: '1',
                        nome: 'Zona 1'
                    },
                    regione: {
                        codice: regione.codice,
                        nome: regione.nome
                    },
                    provincia: {
                        codice: provincia.codice,
                        nome: provincia.nome,
                        sigla: provincia.sigla
                    },
                    sigla: provincia.sigla,
                    codiceCatastale: `${provincia.sigla}${String(index + 1000).substr(-3)}`,
                    cap: [`${20000 + parseInt(regione.codice) * 1000 + index * 10}`],
                    popolazione: Math.floor(Math.random() * 50000) + 1000
                });
            });
        });
    });
    
    return mockData;
}

function processAdministrativeData() {
    // Estrai regioni uniche
    const regioniMap = new Map();
    const provinceMap = new Map();
    
    comuniData.forEach(comune => {
        // Regioni
        if (!regioniMap.has(comune.regione.codice)) {
            regioniMap.set(comune.regione.codice, {
                codice: comune.regione.codice,
                nome: comune.regione.nome,
                coordinate: getRegioneCoordinates(comune.regione.nome)
            });
        }
        
        // Province
        const provinciaKey = `${comune.regione.codice}-${comune.provincia.codice}`;
        if (!provinceMap.has(provinciaKey)) {
            provinceMap.set(provinciaKey, {
                codice: comune.provincia.codice,
                nome: comune.provincia.nome,
                sigla: comune.provincia.sigla,
                regione: comune.regione.codice,
                coordinate: getProvinciaCoordinates(comune.provincia.nome)
            });
        }
    });
    
    regioniData = Array.from(regioniMap.values());
    provinceData = Array.from(provinceMap.values());
}

// === COORDINATE GEOGRAFICHE (MOCK) ===
function getRegioneCoordinates(nomeRegione) {
    const coordinates = {
        'Lombardia': [45.6496, 9.6750],
        'Lazio': [41.8955, 12.4823],
        'Campania': [40.8500, 14.2500],
        'Sicilia': [37.5985, 14.0154],
        'Veneto': [45.4380, 12.3320],
        'Emilia-Romagna': [44.4950, 11.3450],
        'Piemonte': [45.0700, 7.6860],
        'Puglia': [40.6440, 17.9333],
        'Toscana': [43.4637, 11.8796],
        'Calabria': [38.9000, 16.6000]
    };
    return coordinates[nomeRegione] || [41.9028, 12.4964];
}

function getProvinciaCoordinates(nomeProvincia) {
    const coordinates = {
        'Como': [45.8083, 9.0852],
        'Milano': [45.4654, 9.1859],
        'Bergamo': [45.6983, 9.6773],
        'Brescia': [45.5416, 10.2118]
    };
    return coordinates[nomeProvincia] || [41.9028, 12.4964];
}

// === EVENT LISTENERS ===
function initializeEventListeners() {
    // Ricerca regioni
    document.getElementById('regioni-search').addEventListener('input', filterRegioni);
    
    // Ricerca province
    document.getElementById('province-search').addEventListener('input', filterProvince);
    
    // Ricerca comuni
    document.getElementById('comuni-search').addEventListener('input', filterComuni);
    
    // Ricerca fogli
    document.getElementById('fogli-search').addEventListener('input', filterFogli);
    
    // Ricerca particelle
    document.getElementById('particelle-search').addEventListener('input', filterParticelle);
    
    // Controlli mappa
    document.getElementById('zoom-italy-btn').addEventListener('click', zoomToItaly);
    document.getElementById('toggle-satellite-btn').addEventListener('click', toggleSatelliteView);
    document.getElementById('toggle-cadastral-btn').addEventListener('click', toggleCadastralLayer);
    
    // Pulsanti azioni
    document.getElementById('save-selection-btn').addEventListener('click', saveSelectedParcels);
    document.getElementById('clear-selection-btn').addEventListener('click', clearSelectedParcels);
    document.getElementById('export-selection-btn').addEventListener('click', exportSelectedParcels);
}

// === CARICAMENTO LISTE ===
function loadRegioni() {
    const container = document.getElementById('regioni-list');
    container.innerHTML = '';
    
    regioniData.forEach(regione => {
        const item = createSelectionItem(
            regione.nome,
            `Codice: ${regione.codice}`,
            () => selectRegione(regione)
        );
        container.appendChild(item);
    });
    
    updateCurrentInfo('italia', 'Nessuna');
}

function loadProvince(regioneCodice) {
    const container = document.getElementById('province-list');
    container.innerHTML = '';
    
    const provinceFiltered = provinceData.filter(p => p.regione === regioneCodice);
    
    provinceFiltered.forEach(provincia => {
        const item = createSelectionItem(
            provincia.nome,
            `${provincia.sigla} - Codice: ${provincia.codice}`,
            () => selectProvincia(provincia)
        );
        container.appendChild(item);
    });
    
    showSection('province-section');
}

function loadComuni(provinciaCodice, regioneCodice) {
    const container = document.getElementById('comuni-list');
    container.innerHTML = '';
    
    const comuniFiltered = comuniData.filter(c => 
        c.provincia.codice === provinciaCodice && c.regione.codice === regioneCodice
    );
    
    comuniFiltered.forEach(comune => {
        const item = createSelectionItem(
            comune.nome,
            `${comune.codiceCatastale} - Pop: ${comune.popolazione.toLocaleString()}`,
            () => selectComune(comune)
        );
        container.appendChild(item);
    });
    
    showSection('comuni-section');
}

function loadFogli(comune) {
    const container = document.getElementById('fogli-list');
    container.innerHTML = '';
    
    // Simula fogli catastali per il comune selezionato
    const fogli = generateMockFogli(comune);
    
    fogli.forEach(foglio => {
        const item = createSelectionItem(
            `Foglio ${foglio.numero}`,
            `Particelle: ${foglio.numeroParticelle}`,
            () => selectFoglio(foglio, comune)
        );
        container.appendChild(item);
    });
    
    showSection('fogli-section');
}

function loadParticelle(foglio, comune) {
    const container = document.getElementById('particelle-list');
    container.innerHTML = '';
    
    // Simula particelle per il foglio selezionato
    const particelle = generateMockParticelle(foglio, comune);
    
    particelle.forEach(particella => {
        const item = createSelectionItem(
            `Particella ${particella.numero}`,
            `${particella.superficie} m² - ${particella.qualita}`,
            () => selectParticella(particella, foglio, comune),
            true // Mostra checkbox per selezione multipla
        );
        container.appendChild(item);
    });
    
    showSection('particelle-section');
}

// === GENERAZIONE DATI MOCK ===
function generateMockFogli(comune) {
    const numeroFogli = Math.floor(Math.random() * 10) + 5; // 5-15 fogli
    const fogli = [];
    
    for (let i = 1; i <= numeroFogli; i++) {
        fogli.push({
            numero: i,
            numeroParticelle: Math.floor(Math.random() * 50) + 10,
            comune: comune.nome,
            coordinate: [
                comune.nome === 'Tavernerio' ? 
                    45.8358 + (Math.random() - 0.5) * 0.01 : 
                    getProvinciaCoordinates(comune.provincia.nome)[0] + (Math.random() - 0.5) * 0.02,
                comune.nome === 'Tavernerio' ? 
                    9.0911 + (Math.random() - 0.5) * 0.01 : 
                    getProvinciaCoordinates(comune.provincia.nome)[1] + (Math.random() - 0.5) * 0.02
            ]
        });
    }
    
    return fogli;
}

function generateMockParticelle(foglio, comune) {
    const particelle = [];
    const qualita = ['SEMINATIVO', 'BOSCO_CEDUO', 'PRATO', 'VIGNETO', 'OLIVETO', 'FABBRICATO'];
    
    for (let i = 1; i <= foglio.numeroParticelle; i++) {
        particelle.push({
            numero: i,
            foglio: foglio.numero,
            superficie: Math.floor(Math.random() * 5000) + 100,
            qualita: qualita[Math.floor(Math.random() * qualita.length)],
            classe: Math.floor(Math.random() * 5) + 1,
            redditoDominiale: (Math.random() * 100).toFixed(2),
            redditoAgrario: (Math.random() * 50).toFixed(2),
            comune: comune.nome,
            provincia: comune.provincia.nome,
            codiceCatastale: comune.codiceCatastale,
            coordinate: [
                foglio.coordinate[0] + (Math.random() - 0.5) * 0.005,
                foglio.coordinate[1] + (Math.random() - 0.5) * 0.005
            ]
        });
    }
    
    return particelle;
}

// === SELEZIONI ===
function selectRegione(regione) {
    currentSelection.regione = regione;
    currentLevel = 'regione';
    
    // Zoom sulla regione
    map.setView(regione.coordinate, ZOOM_LEVELS.regione);
    
    // Carica province
    loadProvince(regione.codice);
    
    // Aggiorna breadcrumb e info
    updateBreadcrumb(['Italia', regione.nome]);
    updateCurrentInfo('regione', regione.nome);
    
    showToast(`Regione ${regione.nome} selezionata`, 'success');
}

function selectProvincia(provincia) {
    currentSelection.provincia = provincia;
    currentLevel = 'provincia';
    
    // Zoom sulla provincia
    map.setView(provincia.coordinate, ZOOM_LEVELS.provincia);
    
    // Carica comuni
    loadComuni(provincia.codice, currentSelection.regione.codice);
    
    // Aggiorna breadcrumb e info
    updateBreadcrumb(['Italia', currentSelection.regione.nome, provincia.nome]);
    updateCurrentInfo('provincia', provincia.nome);
    
    showToast(`Provincia di ${provincia.nome} selezionata`, 'success');
}

function selectComune(comune) {
    currentSelection.comune = comune;
    currentLevel = 'comune';
    
    // Zoom sul comune
    const comuneCoord = comune.nome === 'Tavernerio' ? 
        [45.8358, 9.0911] : 
        getProvinciaCoordinates(comune.provincia.nome);
    
    map.setView(comuneCoord, ZOOM_LEVELS.comune);
    
    // Carica fogli
    loadFogli(comune);
    
    // Aggiorna breadcrumb e info
    updateBreadcrumb(['Italia', currentSelection.regione.nome, currentSelection.provincia.nome, comune.nome]);
    updateCurrentInfo('comune', comune.nome);
    
    showToast(`Comune di ${comune.nome} selezionato`, 'success');
}

function selectFoglio(foglio, comune) {
    currentSelection.foglio = foglio;
    currentLevel = 'foglio';
    
    // Zoom sul foglio
    map.setView(foglio.coordinate, ZOOM_LEVELS.foglio);
    
    // Carica particelle
    loadParticelle(foglio, comune);
    
    // Aggiorna breadcrumb e info
    updateBreadcrumb(['Italia', currentSelection.regione.nome, currentSelection.provincia.nome, comune.nome, `Foglio ${foglio.numero}`]);
    updateCurrentInfo('foglio', `Foglio ${foglio.numero}`);
    
    showToast(`Foglio ${foglio.numero} selezionato`, 'success');
}

function selectParticella(particella, foglio, comune) {
    // Verifica se già selezionata
    const exists = selectedParcels.some(p => 
        p.numero === particella.numero && 
        p.foglio === particella.foglio &&
        p.comune === particella.comune
    );
    
    if (exists) {
        showToast('Particella già selezionata', 'warning');
        return;
    }
    
    // Aggiungi alle particelle selezionate
    selectedParcels.push({
        ...particella,
        selezionata: new Date().toISOString()
    });
    
    // Aggiungi marker sulla mappa
    addParcelMarker(particella);
    
    // Aggiorna UI
    updateSelectedParcelsDisplay();
    updateCurrentInfo('particella', `${selectedParcels.length} particelle selezionate`);
    
    showToast(`Particella ${particella.numero} aggiunta alla selezione`, 'success');
}

// === INTERFACCIA UTENTE ===
function createSelectionItem(title, subtitle, onClick, showCheckbox = false) {
    const item = document.createElement('div');
    item.className = 'selection-item';
    
    const info = document.createElement('div');
    info.className = 'selection-item-info';
    
    const name = document.createElement('div');
    name.className = 'selection-item-name';
    name.textContent = title;
    
    const code = document.createElement('div');
    code.className = 'selection-item-code';
    code.textContent = subtitle;
    
    info.appendChild(name);
    info.appendChild(code);
    item.appendChild(info);
    
    if (showCheckbox) {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.addEventListener('change', onClick);
        item.appendChild(checkbox);
    }
    
    item.addEventListener('click', onClick);
    
    return item;
}

function updateBreadcrumb(path) {
    const breadcrumb = document.getElementById('breadcrumb');
    breadcrumb.innerHTML = '';
    
    path.forEach((item, index) => {
        const span = document.createElement('span');
        span.className = 'breadcrumb-item';
        span.textContent = item;
        
        if (index === path.length - 1) {
            span.classList.add('active');
        } else {
            span.addEventListener('click', () => navigateToBreadcrumbLevel(index));
        }
        
        breadcrumb.appendChild(span);
    });
}

function updateCurrentInfo(level, selection) {
    document.getElementById('current-level').textContent = level.charAt(0).toUpperCase() + level.slice(1);
    document.getElementById('current-selection').textContent = selection;
    document.getElementById('total-parcels').textContent = selectedParcels.length;
}

function showSection(sectionId) {
    document.getElementById(sectionId).style.display = 'block';
}

function updateSelectedParcelsDisplay() {
    const container = document.getElementById('selected-parcels-container');
    const actions = ['save-selection-btn', 'clear-selection-btn', 'export-selection-btn'];
    
    if (selectedParcels.length === 0) {
        container.innerHTML = '<p class="no-selection">Nessuna particella selezionata</p>';
        actions.forEach(id => document.getElementById(id).disabled = true);
        return;
    }
    
    // Abilita pulsanti
    actions.forEach(id => document.getElementById(id).disabled = false);
    
    container.innerHTML = '';
    
    selectedParcels.forEach((parcel, index) => {
        const item = document.createElement('div');
        item.className = 'selected-parcel-item';
        
        item.innerHTML = `
            <button class="remove-selected-parcel" onclick="removeSelectedParcel(${index})">&times;</button>
            <div class="selected-parcel-header">
                ${parcel.comune} - F.${parcel.foglio} P.${parcel.numero}
            </div>
            <div class="selected-parcel-details">
                Superficie: ${parcel.superficie} m² | Qualità: ${parcel.qualita} | Classe: ${parcel.classe}
            </div>
        `;
        
        container.appendChild(item);
    });
}

// === CONTROLLI MAPPA ===
function onMapClick(e) {
    if (currentLevel === 'foglio') {
        // Simula GetFeatureInfo per ottenere info particella
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        
        getParcelInfoFromCoordinates(lat, lng)
            .then(parcelInfo => {
                if (parcelInfo) {
                    showParcelDetailModal(parcelInfo);
                }
            })
            .catch(error => {
                console.error('Errore GetFeatureInfo:', error);
            });
    }
}

async function getParcelInfoFromCoordinates(lat, lng) {
    // Simula chiamata GetFeatureInfo WMS
    // In produzione sostituire con vera chiamata al servizio
    
    const cacheKey = `${lat.toFixed(6)}_${lng.toFixed(6)}`;
    
    if (cache.wmsRequests.has(cacheKey)) {
        return cache.wmsRequests.get(cacheKey);
    }
    
    // Simula risposta
    const mockResponse = {
        comune: currentSelection.comune?.nome || 'Tavernerio',
        provincia: currentSelection.provincia?.nome || 'Como',
        foglio: currentSelection.foglio?.numero || Math.floor(Math.random() * 20) + 1,
        particella: Math.floor(Math.random() * 500) + 1,
        superficie: Math.floor(Math.random() * 5000) + 500,
        qualita: ['SEMINATIVO', 'BOSCO_CEDUO', 'PRATO'][Math.floor(Math.random() * 3)],
        classe: Math.floor(Math.random() * 5) + 1,
        redditoDominiale: (Math.random() * 100).toFixed(2),
        redditoAgrario: (Math.random() * 50).toFixed(2),
        coordinates: [lat, lng]
    };
    
    cache.wmsRequests.set(cacheKey, mockResponse);
    return mockResponse;
}

function addParcelMarker(particella) {
    const marker = L.marker(particella.coordinate, {
        icon: L.divIcon({
            className: 'cadastral-marker',
            html: `<div style="background-color: #28a745; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px; font-weight: bold;">
                    F.${particella.foglio} P.${particella.numero}
                   </div>`,
            iconSize: [60, 20],
            iconAnchor: [30, 10]
        })
    }).addTo(map);
    
    marker.bindPopup(`
        <strong>Particella ${particella.numero}</strong><br>
        Foglio: ${particella.foglio}<br>
        Comune: ${particella.comune}<br>
        Superficie: ${particella.superficie} m²<br>
        Qualità: ${particella.qualita}
    `);
    
    particella.marker = marker;
}

// === UTILITÀ ===
function updateZoomDisplay() {
    document.getElementById('current-zoom').textContent = map.getZoom();
}

function updateCoordinatesDisplay(e) {
    const coords = document.getElementById('mouse-coords');
    coords.textContent = `Lat: ${e.latlng.lat.toFixed(6)}, Lng: ${e.latlng.lng.toFixed(6)}`;
}

function zoomToItaly() {
    map.setView([41.9028, 12.4964], ZOOM_LEVELS.italia);
    showToast('Zoom su Italia', 'info');
}

function toggleCadastralLayer() {
    const btn = document.getElementById('toggle-cadastral-btn');
    
    if (map.hasLayer(cadastralLayer)) {
        map.removeLayer(cadastralLayer);
        btn.classList.remove('active');
        showToast('Layer catastale disattivato', 'info');
    } else {
        cadastralLayer.addTo(map);
        btn.classList.add('active');
        showToast('Layer catastale attivato', 'success');
    }
}

function toggleSatelliteView() {
    // Implementazione toggle vista satellitare
    showToast('Funzione vista satellitare in sviluppo', 'info');
}

// === AZIONI PRINCIPALI ===
async function saveSelectedParcels() {
    if (selectedParcels.length === 0) {
        showToast('Nessuna particella da salvare', 'warning');
        return;
    }
    
    try {
        // Simula invio a backend
        const dataToSave = {
            timestamp: new Date().toISOString(),
            selezione: currentSelection,
            particelle: selectedParcels,
            totaleParticelle: selectedParcels.length,
            superficieTotale: selectedParcels.reduce((sum, p) => sum + p.superficie, 0)
        };
        
        // In produzione: await fetch('/api/save-parcels', { method: 'POST', body: JSON.stringify(dataToSave) });
        console.log('Dati salvati:', dataToSave);
        
        // Salva anche in localStorage come backup
        localStorage.setItem('selectedParcels', JSON.stringify(dataToSave));
        
        showToast(`${selectedParcels.length} particelle salvate con successo`, 'success');
        
    } catch (error) {
        console.error('Errore salvataggio:', error);
        showToast('Errore nel salvataggio', 'error');
    }
}

function exportSelectedParcels() {
    if (selectedParcels.length === 0) {
        showToast('Nessuna particella da esportare', 'warning');
        return;
    }
    
    const exportData = {
        data_esportazione: new Date().toISOString(),
        selezione_corrente: currentSelection,
        particelle_selezionate: selectedParcels.map(p => ({
            comune: p.comune,
            provincia: p.provincia,
            foglio: p.foglio,
            particella: p.numero,
            superficie_mq: p.superficie,
            qualita: p.qualita,
            classe: p.classe,
            reddito_dominiale: p.redditoDominiale,
            reddito_agrario: p.redditoAgrario,
            codice_catastale: p.codiceCatastale,
            coordinate_lat: p.coordinate[0],
            coordinate_lng: p.coordinate[1]
        })),
        riepilogo: {
            totale_particelle: selectedParcels.length,
            superficie_totale_mq: selectedParcels.reduce((sum, p) => sum + p.superficie, 0),
            superficie_totale_ha: (selectedParcels.reduce((sum, p) => sum + p.superficie, 0) / 10000).toFixed(4),
            comuni_coinvolti: [...new Set(selectedParcels.map(p => p.comune))],
            qualita_prevalenti: [...new Set(selectedParcels.map(p => p.qualita))]
        }
    };
    
    // Esporta come JSON
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `particelle_catastali_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast(`Esportate ${selectedParcels.length} particelle in formato JSON`, 'success');
}

function clearSelectedParcels() {
    if (selectedParcels.length === 0) return;
    
    if (!confirm(`Sei sicuro di voler cancellare tutte le ${selectedParcels.length} particelle selezionate?`)) {
        return;
    }
    
    // Rimuovi marker dalla mappa
    selectedParcels.forEach(parcel => {
        if (parcel.marker) {
            map.removeLayer(parcel.marker);
        }
    });
    
    // Svuota array
    selectedParcels = [];
    
    // Aggiorna UI
    updateSelectedParcelsDisplay();
    updateCurrentInfo(currentLevel, currentSelection[currentLevel]?.nome || 'Nessuna');
    
    showToast('Tutte le particelle sono state rimosse', 'info');
}

function removeSelectedParcel(index) {
    if (index >= 0 && index < selectedParcels.length) {
        const parcel = selectedParcels[index];
        
        // Rimuovi marker dalla mappa
        if (parcel.marker) {
            map.removeLayer(parcel.marker);
        }
        
        // Rimuovi dall'array
        selectedParcels.splice(index, 1);
        
        // Aggiorna UI
        updateSelectedParcelsDisplay();
        updateCurrentInfo(currentLevel, currentSelection[currentLevel]?.nome || 'Nessuna');
        
        showToast(`Particella F.${parcel.foglio} P.${parcel.numero} rimossa`, 'info');
    }
}

// === FILTRI DI RICERCA ===
function filterRegioni() {
    const searchTerm = document.getElementById('regioni-search').value.toLowerCase();
    const container = document.getElementById('regioni-list');
    
    container.innerHTML = '';
    
    const filtered = regioniData.filter(regione => 
        regione.nome.toLowerCase().includes(searchTerm)
    );
    
    filtered.forEach(regione => {
        const item = createSelectionItem(
            regione.nome,
            `Codice: ${regione.codice}`,
            () => selectRegione(regione)
        );
        container.appendChild(item);
    });
    
    if (filtered.length === 0) {
        container.innerHTML = '<p class="no-selection">Nessuna regione trovata</p>';
    }
}

function filterProvince() {
    const searchTerm = document.getElementById('province-search').value.toLowerCase();
    const container = document.getElementById('province-list');
    
    if (!currentSelection.regione) return;
    
    container.innerHTML = '';
    
    const provinceFiltered = provinceData
        .filter(p => p.regione === currentSelection.regione.codice)
        .filter(p => p.nome.toLowerCase().includes(searchTerm));
    
    provinceFiltered.forEach(provincia => {
        const item = createSelectionItem(
            provincia.nome,
            `${provincia.sigla} - Codice: ${provincia.codice}`,
            () => selectProvincia(provincia)
        );
        container.appendChild(item);
    });
    
    if (provinceFiltered.length === 0) {
        container.innerHTML = '<p class="no-selection">Nessuna provincia trovata</p>';
    }
}

function filterComuni() {
    const searchTerm = document.getElementById('comuni-search').value.toLowerCase();
    const container = document.getElementById('comuni-list');
    
    if (!currentSelection.provincia || !currentSelection.regione) return;
    
    container.innerHTML = '';
    
    const comuniFiltered = comuniData
        .filter(c => c.provincia.codice === currentSelection.provincia.codice && 
                    c.regione.codice === currentSelection.regione.codice)
        .filter(c => c.nome.toLowerCase().includes(searchTerm));
    
    comuniFiltered.forEach(comune => {
        const item = createSelectionItem(
            comune.nome,
            `${comune.codiceCatastale} - Pop: ${comune.popolazione.toLocaleString()}`,
            () => selectComune(comune)
        );
        container.appendChild(item);
    });
    
    if (comuniFiltered.length === 0) {
        container.innerHTML = '<p class="no-selection">Nessun comune trovato</p>';
    }
}

function filterFogli() {
    const searchTerm = document.getElementById('fogli-search').value.toLowerCase();
    const container = document.getElementById('fogli-list');
    
    if (!currentSelection.comune) return;
    
    // Rigenera lista filtrata
    const fogli = generateMockFogli(currentSelection.comune);
    const fogliFiltered = fogli.filter(f => 
        f.numero.toString().includes(searchTerm)
    );
    
    container.innerHTML = '';
    
    fogliFiltered.forEach(foglio => {
        const item = createSelectionItem(
            `Foglio ${foglio.numero}`,
            `Particelle: ${foglio.numeroParticelle}`,
            () => selectFoglio(foglio, currentSelection.comune)
        );
        container.appendChild(item);
    });
    
    if (fogliFiltered.length === 0) {
        container.innerHTML = '<p class="no-selection">Nessun foglio trovato</p>';
    }
}

function filterParticelle() {
    const searchTerm = document.getElementById('particelle-search').value.toLowerCase();
    const container = document.getElementById('particelle-list');
    
    if (!currentSelection.foglio || !currentSelection.comune) return;
    
    const particelle = generateMockParticelle(currentSelection.foglio, currentSelection.comune);
    const particelleFiltered = particelle.filter(p => 
        p.numero.toString().includes(searchTerm) ||
        p.qualita.toLowerCase().includes(searchTerm)
    );
    
    container.innerHTML = '';
    
    particelleFiltered.forEach(particella => {
        const item = createSelectionItem(
            `Particella ${particella.numero}`,
            `${particella.superficie} m² - ${particella.qualita}`,
            () => selectParticella(particella, currentSelection.foglio, currentSelection.comune),
            true
        );
        container.appendChild(item);
    });
    
    if (particelleFiltered.length === 0) {
        container.innerHTML = '<p class="no-selection">Nessuna particella trovata</p>';
    }
}

// === FUNZIONI DI CLEAR SEARCH ===
function clearRegionSearch() {
    document.getElementById('regioni-search').value = '';
    filterRegioni();
}

function clearProvinceSearch() {
    document.getElementById('province-search').value = '';
    filterProvince();
}

function clearComuniSearch() {
    document.getElementById('comuni-search').value = '';
    filterComuni();
}

function clearFogliSearch() {
    document.getElementById('fogli-search').value = '';
    filterFogli();
}

function clearParticelleSearch() {
    document.getElementById('particelle-search').value = '';
    filterParticelle();
}

// === NAVIGAZIONE BREADCRUMB ===
function navigateToBreadcrumbLevel(level) {
    switch(level) {
        case 0: // Italia
            resetSearch();
            break;
        case 1: // Regione
            if (currentSelection.regione) {
                selectRegione(currentSelection.regione);
            }
            break;
        case 2: // Provincia
            if (currentSelection.provincia) {
                selectProvincia(currentSelection.provincia);
            }
            break;
        case 3: // Comune
            if (currentSelection.comune) {
                selectComune(currentSelection.comune);
            }
            break;
        case 4: // Foglio
            if (currentSelection.foglio) {
                selectFoglio(currentSelection.foglio, currentSelection.comune);
            }
            break;
    }
}

// === RESET E UTILITY ===
function resetSearch() {
    // Reset selezioni
    currentSelection = {
        regione: null,
        provincia: null,
        comune: null,
        foglio: null
    };
    currentLevel = 'italia';
    
    // Nascondi sezioni
    ['province-section', 'comuni-section', 'fogli-section', 'particelle-section'].forEach(id => {
        document.getElementById(id).style.display = 'none';
    });
    
    // Reset input search
    ['regioni-search', 'province-search', 'comuni-search', 'fogli-search', 'particelle-search'].forEach(id => {
        document.getElementById(id).value = '';
    });
    
    // Ricarica regioni
    loadRegioni();
    
    // Reset mappa
    map.setView([41.9028, 12.4964], ZOOM_LEVELS.italia);
    
    // Reset breadcrumb
    updateBreadcrumb(['Italia']);
    
    showToast('Ricerca reimpostata', 'info');
}

function toggleSearchPanel() {
    const panel = document.getElementById('search-panel');
    panel.classList.toggle('hidden');
    
    // Invalida dimensioni mappa dopo animazione
    setTimeout(() => {
        map.invalidateSize();
    }, 300);
}

// === MODAL DETTAGLI PARTICELLA ===
function showParcelDetailModal(parcelInfo) {
    const modal = document.getElementById('parcel-detail-modal');
    const content = document.getElementById('parcel-detail-content');
    
    content.innerHTML = `
        <div class="parcel-info-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <p><strong>Comune:</strong> ${parcelInfo.comune}</p>
            <p><strong>Provincia:</strong> ${parcelInfo.provincia}</p>
            <p><strong>Foglio:</strong> ${parcelInfo.foglio}</p>
            <p><strong>Particella:</strong> ${parcelInfo.particella}</p>
            <p><strong>Superficie:</strong> ${parcelInfo.superficie} m²</p>
            <p><strong>Qualità:</strong> ${parcelInfo.qualita}</p>
            <p><strong>Classe:</strong> ${parcelInfo.classe}</p>
            <p><strong>Reddito Dominiale:</strong> €${parcelInfo.redditoDominiale}</p>
            <p><strong>Reddito Agrario:</strong> €${parcelInfo.redditoAgrario}</p>
            <p><strong>Coordinate:</strong> ${parcelInfo.coordinates[0].toFixed(6)}, ${parcelInfo.coordinates[1].toFixed(6)}</p>
        </div>
    `;
    
    // Configura pulsante aggiungi
    const addBtn = document.getElementById('add-parcel-modal-btn');
    addBtn.onclick = () => addParcelFromModal(parcelInfo);
    
    modal.style.display = 'flex';
}

function closeParcelDetailModal() {
    document.getElementById('parcel-detail-modal').style.display = 'none';
}

function addParcelFromModal() {
    // Implementa logica per aggiungere particella dal modal
    closeParcelDetailModal();
    showToast('Particella aggiunta dalla mappa', 'success');
}

// === TOAST NOTIFICATIONS ===
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = getToastIcon(type);
    
    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
        <button class="toast-close" onclick="closeToast(this)">&times;</button>
    `;
    
    container.appendChild(toast);
    
    // Mostra toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Auto-remove dopo 5 secondi
    setTimeout(() => {
        closeToast(toast.querySelector('.toast-close'));
    }, 5000);
}

function getToastIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
}

function closeToast(button) {
    const toast = button.parentElement;
    toast.classList.remove('show');
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

// === FUNZIONI GLOBALI PER WINDOW ===
window.removeSelectedParcel = removeSelectedParcel;
window.closeParcelDetailModal = closeParcelDetailModal;
window.addParcelFromModal = addParcelFromModal;
window.closeToast = closeToast;
window.toggleSearchPanel = toggleSearchPanel;
window.resetSearch = resetSearch;
window.clearRegionSearch = clearRegionSearch;
window.clearProvinceSearch = clearProvinceSearch;
window.clearComuniSearch = clearComuniSearch;
window.clearFogliSearch = clearFogliSearch;
window.clearParticelleSearch = clearParticelleSearch;