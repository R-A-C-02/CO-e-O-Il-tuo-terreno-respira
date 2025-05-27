// Variabili globali per la mappa
let mainMap = null;
let mainDrawnItems = new L.FeatureGroup();
let drawControl = null;

const stilePoligono = {
    color: "#2e7d32",
    weight: 3,
    opacity: 1,
    fillColor: "#81c784",
    fillOpacity: 0.5
};

const selectedStilePoligono = {
    color: "#007bff",
    weight: 4,
    opacity: 1,
    fillColor: "#66b3ff",
    fillOpacity: 0.7
};

let terreni = [];
let selectedTerrenoId = null;
let markerIndirizzo = null;
let co2Chart;

const ALL_SPECIES_NAMES = [
    "Abete bianco", "Abete rosso", "Acero", "Anguria", "Barbabietola", "Betulla",
    "Castagno", "Cavolo", "Cetriolo", "Ciliegio", "Cipresso", "Erba medica",
    "Eucalipto", "Fagiolo", "Faggio", "Fragola", "Frassino", "Girasole", "Grano",
    "Larice", "Lattuga", "Mais", "Melanzana", "Melone", "Nocciolo", "Olmo",
    "Patata", "Peperone", "Pino", "Pisello", "Pioppo", "Pomodoro", "Quercia",
    "Riso", "Salice", "Soia", "Tiglio", "Ulivo", "Zucchina"
];


function initializeMainMap() {
    if (mainMap) {
        mainMap.remove();
    }
    mainMap = L.map('main-map-container').setView([42.5, 12.5], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data © OpenStreetMap contributors'
    }).addTo(mainMap);

    mainDrawnItems = new L.FeatureGroup();
    mainMap.addLayer(mainDrawnItems);

    drawControl = new L.Control.Draw({
        draw: {
            polygon: {
                allowIntersection: false,
                showArea: true,
                shapeOptions: stilePoligono
            },
            polyline: false,
            rectangle: false,
            circle: false,
            marker: false,
            circlemarker: false
        },
        edit: {featureGroup: mainDrawnItems}
    });
    mainMap.addControl(drawControl);

    mainMap.on(L.Draw.Event.CREATED, onMapPolygonCreated);
    mainMap.on(L.Draw.Event.EDITED, onMapLayerEdited);
    mainMap.on(L.Draw.Event.DELETED, onMapLayerDeleted);
}

function calcolaArea(poligono) {
    const area = L.GeometryUtil.geodesicArea(poligono.getLatLngs()[0]);
    return (area / 10000).toFixed(2);
}

function calcolaPerimetro(poligono) {
    let perimetro = 0;
    const latlngs = poligono.getLatLngs()[0];
    for (let i = 0; i < latlngs.length; i++) {
        if (i === 0) continue;
        perimetro += latlngs[i].distanceTo(latlngs[i - 1]);
    }
    perimetro += latlngs[latlngs.length - 1].distanceTo(latlngs[0]);
    return perimetro.toFixed(2);
}

const co2Rates = {
    quercia: 21,
    pino: 18,
    abete: 16,
    faggio: 16,
    default: 15
};

function stimaCO2(speciesArray, area_ha) {
    let totalCo2 = 0;
    const defaultRate = co2Rates.default;

    speciesArray.forEach(s => {
        const specieKey = s.name.toLowerCase();
        const rate = co2Rates[specieKey] || defaultRate;
        const valueMatch = s.quantity.match(/(\d+(\.\d+)?)/);
        const value = valueMatch ? parseFloat(valueMatch[1]) : 0;

        if (s.quantity.toLowerCase().includes('alberi') || s.quantity.toLowerCase().includes('piante') || s.quantity.toLowerCase().includes('unità')) {
            totalCo2 += rate * value;
        } else if (s.quantity.toLowerCase().includes('m²')) {
            totalCo2 += rate * value * 0.01;
        } else if (s.quantity.toLowerCase().includes('ha')) {
            totalCo2 += rate * value * 100;
        } else if (s.quantity.trim() === '') {
            totalCo2 += rate * area_ha * 100;
        } else {
            if (!isNaN(value)) {
                totalCo2 += rate * value;
            }
        }
    });
    return totalCo2.toFixed(2);
}

function onMapPolygonCreated(e) {
    if (!selectedTerrenoId) {
        showCustomAlert("Seleziona o aggiungi un terreno dalla lista 'I miei terreni' prima di disegnare sulla mappa.");
        mainDrawnItems.removeLayer(e.layer);
        return;
    }

    const selectedTerreno = terreni.find(t => t.id === selectedTerrenoId);
    if (selectedTerreno) {
        if (selectedTerreno.leafletLayer) {
            mainDrawnItems.removeLayer(selectedTerreno.leafletLayer);
        }
        selectedTerreno.leafletLayer = e.layer;
        selectedTerreno.leafletLayer.setStyle(selectedStilePoligono);
        mainDrawnItems.addLayer(selectedTerreno.leafletLayer);

        selectedTerreno.coordinate = selectedTerreno.leafletLayer.getLatLngs()[0].map(latlng => ({
            lat: latlng.lat,
            lng: latlng.lng
        }));

        selectedTerreno.area_ha = parseFloat(calcolaArea(selectedTerreno.leafletLayer));
        selectedTerreno.perimetro_m = parseFloat(calcolaPerimetro(selectedTerreno.leafletLayer));

        document.getElementById("area").value = `${selectedTerreno.area_ha} ha`;
        document.getElementById("perimetro").value = `${selectedTerreno.perimetro_m} m`;

        selectedTerreno.leafletLayer.bindPopup(`Area: ${selectedTerreno.area_ha} ha<br>Perimetro: ${selectedTerreno.perimetro_m} m`).openPopup();
        showCustomAlert(`Poligono disegnato per "${selectedTerreno.name}". Clicca 'Salva dati terreno' per aggiornare.`);
        document.getElementById('coordinates-section').style.display = 'flex';
        document.getElementById('polygon-vertices-section').style.display = 'block';

        updateAddressAndCoordinates();
        displayPolygonVertices(selectedTerreno.coordinate);
        updateDashboard();
    }
}

function onMapLayerEdited(e) {
    e.layers.eachLayer(layer => {
        const terreno = terreni.find(t => t.leafletLayer && L.Util.stamp(t.leafletLayer) === L.Util.stamp(layer));
        if (terreno) {
            terreno.coordinate = layer.getLatLngs()[0].map(latlng => ({
                lat: latlng.lat,
                lng: latlng.lng
            }));

            terreno.area_ha = parseFloat(calcolaArea(layer));
            terreno.perimetro_m = parseFloat(calcolaPerimetro(layer));

            if (selectedTerrenoId === terreno.id) {
                document.getElementById("area").value = `${terreno.area_ha} ha`;
                document.getElementById("perimetro").value = `${terreno.perimetro_m} m`;
            }

            layer.bindPopup(`Area: ${terreno.area_ha} ha<br>Perimetro: ${terreno.perimetro_m} m`).openPopup();
            showCustomAlert(`Poligono per "${terreno.name}" modificato. Clicca 'Salva dati terreno' per aggiornare.`);
            updateAddressAndCoordinates();
            displayPolygonVertices(terreno.coordinate);
            updateDashboard();
        }
    });
}

function onMapLayerDeleted(e) {
    e.layers.eachLayer(layer => {
        const terreno = terreni.find(t => t.leafletLayer && L.Util.stamp(t.leafletLayer) === L.Util.stamp(layer));
        if (terreno) {
            terreno.leafletLayer = null;
            terreno.coordinate = [];
            terreno.area_ha = 0;
            terreno.perimetro_m = 0;

            if (selectedTerrenoId === terreno.id) {
                document.getElementById("area").value = "Disegna sulla mappa";
                document.getElementById("perimetro").value = "Disegna sulla mappa";
            }
            showCustomAlert(`Poligono per "${terreno.name}" eliminato. Clicca 'Salva dati terreno' per aggiornare.`);
            document.getElementById("centroid-display").textContent = "Centroide: N/A";
            document.getElementById("vertices-display").innerHTML = "Nessun poligono selezionato o disegnato.";
            document.getElementById('polygon-vertices-section').style.display = 'none';
            updateDashboard();
        }
    });
}

function displayPolygonVertices(coordinates) {
    const verticesDisplay = document.getElementById('vertices-display');
    verticesDisplay.innerHTML = '';

    if (!coordinates || coordinates.length === 0) {
        verticesDisplay.innerHTML = 'Nessun poligono selezionato o disegnato.';
        return;
    }

    const ul = document.createElement('ul');
    ul.style.listStyle = 'none';
    ul.style.padding = '0';
    ul.style.maxHeight = '200px';
    ul.style.overflowY = 'auto';

    coordinates.forEach((coord, index) => {
        const li = document.createElement('li');
        li.textContent = `Vertice ${index + 1}: Latitudine ${coord.lat.toFixed(6)}, Longitudine ${coord.lng.toFixed(6)}`;
        li.style.marginBottom = '5px';
        ul.appendChild(li);
    });
    verticesDisplay.appendChild(ul);
}


function renderTerreniList() {
    const terrenoListUl = document.getElementById('terreno-list');
    terrenoListUl.innerHTML = '';

    if (terreni.length === 0) {
        terrenoListUl.innerHTML = '<li style="text-align: center; color: var(--text-color); opacity: 0.7;">Nessun terreno aggiunto.</li>';
        document.getElementById('selected-terrain-details').style.display = 'none';
        document.getElementById('coordinates-section').style.display = 'none';
        document.getElementById('polygon-vertices-section').style.display = 'none';
        mainDrawnItems.clearLayers();
        return;
    }

    terreni.forEach(t => {
        const li = document.createElement('li');
        li.id = `terreno-item-${t.id}`;
        li.classList.add('terreno-item');
        if (t.id === selectedTerrenoId) {
            li.classList.add('selected');
        }

        const terrainNameSpan = document.createElement('span');
        terrainNameSpan.classList.add('terreno-name');
        terrainNameSpan.textContent = t.name;

        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('terreno-actions');

        const editButton = document.createElement('button');
        editButton.innerHTML = '<i class="fas fa-edit"></i>';
        editButton.title = 'Modifica Nome';
        editButton.onclick = (e) => {
            e.stopPropagation();
            editTerrenoName(t.id);
        };
        actionsDiv.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.title = 'Elimina Terreno';
        deleteButton.onclick = (e) => {
            e.stopPropagation();
            deleteTerreno(t.id);
        };

        actionsDiv.appendChild(deleteButton);
        li.appendChild(terrainNameSpan);
        li.appendChild(actionsDiv);

        li.onclick = () => selectTerreno(t.id);

        terrenoListUl.appendChild(li);
    });
    document.getElementById('selected-terrain-details').style.display = 'flex';
    document.getElementById('coordinates-section').style.display = 'flex';
    const selectedTerreno = terreni.find(t => t.id === selectedTerrenoId);
    if (selectedTerreno && selectedTerreno.leafletLayer) {
        document.getElementById('polygon-vertices-section').style.display = 'block';
    } else {
        document.getElementById('polygon-vertices-section').style.display = 'none';
    }
}

function addTerreno() {
    const input = document.getElementById('terreno-name-input');
    let newName = input.value.trim();

    if (!newName) {
        showCustomAlert('Inserisci un nome per il nuovo terreno.');
        return;
    }

    let counter = 1;
    let originalName = newName;
    while (terreni.some(t => t.name === newName)) {
        newName = `${originalName} (${counter})`;
        counter++;
    }

    const newTerreno = {
        id: Date.now(),
        name: newName,
        species: [],
        area_ha: 0,
        perimetro_m: 0,
        co2_kg_annuo: 0,
        coordinate: [],
        leafletLayer: null
    };

    terreni.push(newTerreno);
    input.value = ``;
    renderTerreniList();
    selectTerreno(newTerreno.id);
    clearAddressMarker();
    showCustomAlert(`Terreno "${newName}" aggiunto. Ora puoi disegnarlo sulla mappa e aggiungere le specie.`);
}

function selectTerreno(id) {
    if (selectedTerrenoId) {
        const prevSelectedTerreno = terreni.find(t => t.id === selectedTerrenoId);
        if (prevSelectedTerreno && prevSelectedTerreno.leafletLayer) {
            prevSelectedTerreno.leafletLayer.setStyle(stilePoligono);
        }
        const prevSelectedLi = document.getElementById(`terreno-item-${selectedTerrenoId}`);
        if (prevSelectedLi) {
            prevSelectedLi.classList.remove('selected');
        }
    }

    selectedTerrenoId = id;

    const newSelectedLi = document.getElementById(`terreno-item-${selectedTerrenoId}`);
    if (newSelectedLi) {
        newSelectedLi.classList.add('selected');
    }

    clearAddressMarker();

    const terreno = terreni.find(t => t.id === id);
    if (terreno) {
        document.getElementById("current-terrain-name").textContent = terreno.name;
        document.getElementById("area").value = terreno.area_ha > 0 ? `${terreno.area_ha} ha` : 'Disegna sulla mappa';
        document.getElementById("perimetro").value = terreno.perimetro_m > 0 ? `${terreno.perimetro_m} m` : 'Disegna sulla mappa';

        renderSpeciesListForSelectedTerrain();
        document.getElementById("new-species-name-input").value = "";
        document.getElementById("new-species-quantity-input").value = "";

        document.getElementById('selected-terrain-details').style.display = 'flex';
        document.getElementById('coordinates-section').style.display = 'flex';

        if (terreno.leafletLayer) {
            terreno.leafletLayer.setStyle(selectedStilePoligono);
            mainMap.fitBounds(terreno.leafletLayer.getBounds(), { padding: [20, 20], maxZoom: 16 });
            updateAddressAndCoordinates();
            displayPolygonVertices(terreno.coordinate);
            document.getElementById('polygon-vertices-section').style.display = 'block';
        } else {
            document.getElementById("centroid-display").textContent = "Centroide: N/A";
            document.getElementById("vertices-display").innerHTML = "Nessun poligono selezionato o disegnato.";
            document.getElementById('polygon-vertices-section').style.display = 'none';
        }
        mainMap.invalidateSize();
        updateDashboard();
    }
}

function editTerrenoName(id) {
    const terreno = terreni.find(t => t.id === id);
    if (!terreno) return;

    showCustomPrompt(`Modifica nome per "${terreno.name}":`, terreno.name, (newName) => {
        if (newName !== null && newName.trim() !== '' && newName.trim() !== terreno.name) {
            terreno.name = newName.trim();
            renderTerreniList();
            if (selectedTerrenoId === id) {
                document.getElementById("current-terrain-name").textContent = terreno.name;
            }
            updateTerreniTable();
            updateAllLayerPopups();
        }
    });
}

function deleteTerreno(id) {
    showCustomConfirm('Sei sicuro di voler eliminare questo terreno?', (confirmed) => {
        if (!confirmed) {
            return;
        }

        const index = terreni.findIndex(t => t.id === id);
        if (index > -1) {
            const terrainToDelete = terreni[index];
            if (terrainToDelete.leafletLayer) {
                mainDrawnItems.removeLayer(terrainToDelete.leafletLayer);
            }
            terreni.splice(index, 1);

            if (selectedTerrenoId === id) {
                selectedTerrenoId = null;
                if (terreni.length > 0) {
                    selectTerreno(terreni[0].id);
                } else {
                    document.getElementById('selected-terrain-details').style.display = 'none';
                    document.getElementById('coordinates-section').style.display = 'none';
                    document.getElementById('polygon-vertices-section').style.display = 'none';
                    document.getElementById("current-terrain-name").textContent = "";
                    document.getElementById("area").value = "Disegna sulla mappa";
                    document.getElementById("perimetro").value = "Disegna sulla mappa";
                    document.getElementById("vertices-display").innerHTML = "Nessun poligono selezionato o disegnato.";
                    renderSpeciesListForSelectedTerrain();
                    mainDrawnItems.clearLayers();
                }
            }
            renderTerreniList();
            updateDashboard();

            if (terreni.length === 0 || selectedTerrenoId === null) {
                clearAddressMarkerAndInput();
            }
        }
    });
}

function renderSpeciesListForSelectedTerrain() {
    const speciesListUl = document.getElementById('species-list-for-selected-terrain');
    speciesListUl.innerHTML = '';
    const selectedTerreno = terreni.find(t => t.id === selectedTerrenoId);

    if (!selectedTerreno || selectedTerreno.species.length === 0) {
        speciesListUl.innerHTML = '<li style="text-align: center; color: var(--text-color); opacity: 0.7;">Nessuna specie aggiunta.</li>';
        return;
    }

    selectedTerreno.species.forEach((s, index) => {
        const li = document.createElement('li');
        li.classList.add('species-item');
        li.innerHTML = `
            <span>${s.name} (${s.quantity})</span>
            <div class="species-item-actions">
                <button onclick="editSpeciesInSelectedTerrain(${index})"><i class="fas fa-edit"></i></button>
                <button onclick="deleteSpeciesFromSelectedTerrain(${index})"><i class="fas fa-trash"></i></button>
            </div>
        `;
        speciesListUl.appendChild(li);
    });
}

// --- MODIFICATA QUESTA FUNZIONE ---
function addSpeciesToSelectedTerrain() {
    const newSpeciesNameInput = document.getElementById('new-species-name-input');
    const newSpeciesQuantityInput = document.getElementById('new-species-quantity-input');

    const enteredName = newSpeciesNameInput.value.trim(); // Nome inserito dall'utente
    const quantity = newSpeciesQuantityInput.value.trim();

    if (!enteredName) {
        showCustomAlert("Inserisci il nome della specie.");
        return;
    }

    // Validazione: controlla se il nome inserito (ignorando maiuscole/minuscole) è presente in ALL_SPECIES_NAMES
    // e ottieni il nome con la formattazione corretta.
    const correctlyCasedName = ALL_SPECIES_NAMES.find(
        validName => validName.toLowerCase() === enteredName.toLowerCase()
    );

    if (!correctlyCasedName) {
        // Se il nome non è trovato nella lista dei nomi validi
        showCustomAlert("Nome specie non valido. Assicurati che il nome inserito sia presente nell'elenco dei suggerimenti.");
        newSpeciesNameInput.focus(); // Rimetti il focus sull'input per la correzione
        return; // Interrompi l'esecuzione
    }

    // Se il nome è valido (correctlyCasedName non è undefined), procedi

    if (!selectedTerrenoId) {
        showCustomAlert("Seleziona un terreno prima di aggiungere specie.");
        return;
    }

    const selectedTerreno = terreni.find(t => t.id === selectedTerrenoId);
    if (selectedTerreno) {
        // Usa il nome con la formattazione corretta dalla lista ALL_SPECIES_NAMES
        selectedTerreno.species.push({ name: correctlyCasedName, quantity });

        newSpeciesNameInput.value = '';
        newSpeciesQuantityInput.value = '';
        const suggestionsContainer = document.getElementById('species-suggestions-dropdown');
        if(suggestionsContainer) {
            suggestionsContainer.style.display = 'none';
            suggestionsContainer.innerHTML = '';
        }
        renderSpeciesListForSelectedTerrain();
        showCustomAlert(`Specie "${correctlyCasedName}" aggiunta al terreno "${selectedTerreno.name}". Ricorda di cliccare 'Salva dati terreno' per salvare le modifiche.`);
    }
}
// --- FINE MODIFICA ---

function editSpeciesInSelectedTerrain(index) {
    const selectedTerreno = terreni.find(t => t.id === selectedTerrenoId);
    if (!selectedTerreno || !selectedTerreno.species[index]) return;

    const currentSpecies = selectedTerreno.species[index];

    showCustomPrompt(`Modifica nome specie per "${selectedTerreno.name}":`, currentSpecies.name, (newName) => {
        if (newName === null) return;

        // Validazione anche qui se si desidera che la modifica sia ristretta alla lista
        const newCorrectlyCasedName = ALL_SPECIES_NAMES.find(
            validName => validName.toLowerCase() === newName.trim().toLowerCase()
        );

        if (!newCorrectlyCasedName && newName.trim() !== '') {
             showCustomAlert("Nome specie non valido per la modifica. Assicurati che il nome inserito sia presente nell'elenco dei suggerimenti.");
             return;
        }
        const nameToUse = newCorrectlyCasedName || currentSpecies.name; // Usa il validato o mantieni l'originale se l'input era vuoto e si annulla

        showCustomPrompt(`Modifica quantità/densità per "${nameToUse}":`, currentSpecies.quantity, (newQuantity) => {
            if (newQuantity === null) return;

            if (nameToUse.trim() !== '') { // Qui nameToUse è già validato o è l'originale se input nome era vuoto
                selectedTerreno.species[index] = { name: nameToUse.trim(), quantity: newQuantity.trim() };
                renderSpeciesListForSelectedTerrain();
                showCustomAlert(`Specie modificata per "${selectedTerreno.name}". Ricorda di cliccare 'Salva dati terreno'.`);
            } else {
                showCustomAlert("Il nome della specie non può essere vuoto.");
            }
        });
    });
}

function deleteSpeciesFromSelectedTerrain(index) {
    showCustomConfirm('Sei sicuro di voler eliminare questa specie?', (confirmed) => {
        if (!confirmed) return;

        const selectedTerreno = terreni.find(t => t.id === selectedTerrenoId);
        if (selectedTerreno && selectedTerreno.species[index]) {
            selectedTerreno.species.splice(index, 1);
            renderSpeciesListForSelectedTerrain();
            showCustomAlert(`Specie eliminata dal terreno "${selectedTerreno.name}". Ricorda di cliccare 'Salva dati terreno'.`);
        }
    });
}

async function saveData() {
    if (!selectedTerrenoId) {
        showCustomAlert("Nessun terreno selezionato per il salvataggio dei dati. Aggiungi o seleziona un terreno.");
        return;
    }

    const terreno = terreni.find(t => t.id === selectedTerrenoId);
    if (!terreno) {
        showCustomAlert("Errore: Terreno selezionato non trovato.");
        return;
    }

    const areaVal = document.getElementById("area").value.replace(' ha', '');
    const perimetroVal = document.getElementById("perimetro").value.replace(' m', '');

    terreno.area_ha = parseFloat(areaVal) || 0;
    terreno.perimetro_m = parseFloat(perimetroVal) || 0;

    terreno.co2_kg_annuo = stimaCO2(terreno.species, terreno.area_ha);

    if (terreno.leafletLayer) {
        const popupContent = `<strong>Nome:</strong> ${terreno.name}<br>` +
                             `<strong>Specie:</strong> ${terreno.species.map(s => `${s.name} (${s.quantity})`).join(', ') || 'N/A'}<br>` +
                             `<strong>Area:</strong> ${terreno.area_ha} ha<br>` +
                             `<strong>Perimetro:</strong> ${terreno.perimetro_m} m<br>` +
                             `<strong>Stima CO₂:</strong> ${terreno.co2_kg_annuo} kg/anno`;
        terreno.leafletLayer.bindPopup(popupContent);
    }

    updateDashboard();
    showCustomAlert(`Dati per "${terreno.name}" salvati!`);

    const backendUrl = 'http://localhost:3001/save-coordinates';
    let centroidCoords = null;
    const centroidDisplay = document.getElementById("centroid-display").textContent;
    const centroidMatch = centroidDisplay.match(/Lat ([\d.]+), Lon ([\d.]+)/);
    if (centroidMatch) {
        centroidCoords = {
            lat: parseFloat(centroidMatch[1]),
            lng: parseFloat(centroidMatch[2])
        };
    }

    const polygonVertices = terreno.coordinate;

    try {
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                centroid: centroidCoords,
                vertices: polygonVertices
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Errore salvataggio dati backend: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('Dati inviati al backend con successo:', result);
        showCustomAlert('Dati terreno inviati al backend con successo!');

    } catch (error) {
        console.error('Errore durante l\'invio dei dati al backend:', error);
        showCustomAlert('Errore durante il salvataggio dei dati nel backend. Controlla la console per i dettagli.');
    }
}

function clearAddressMarker() {
    if (markerIndirizzo) {
        mainMap.removeLayer(markerIndirizzo);
        markerIndirizzo = null;
    }
}

function clearAddressMarkerAndInput() {
    clearAddressMarker();
    document.getElementById('indirizzo_search_sidebar').value = '';
}

function goToLocationSidebar() {
    const indirizzo = document.getElementById("indirizzo_search_sidebar").value.trim();
    if (!indirizzo) {
        showCustomAlert("Inserisci un indirizzo valido.");
        return;
    }

    clearAddressMarker();

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(indirizzo)}`)
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                showCustomAlert("Indirizzo non trovato.");
                return;
            }
            const lat = data[0].lat;
            const lon = data[0].lon;

            mainMap.setView([lat, lon], 16);

            markerIndirizzo = L.marker([lat, lon]).addTo(mainMap)
                .bindPopup("Indirizzo trovato: " + indirizzo)
                .openPopup();
        })
        .catch(error => {
            showCustomAlert("Errore nella ricerca dell'indirizzo.");
            console.error(error);
            clearAddressMarker();
        });
}

function calculateAndDisplayCentroid(polygonLayer) {
    if (typeof turf === 'undefined') {
        console.error("Errore calculateAndDisplayCentroid: La libreria Turf.js non è caricata.");
        document.getElementById("centroid-display").textContent = "Centroide: Errore (Turf.js non caricato).";
        return;
    }

    if (!polygonLayer || !polygonLayer.getLatLngs) {
        console.warn("calculateAndDisplayCentroid: Nessun layer poligono valido fornito.");
        document.getElementById("centroid-display").textContent = "Centroide: N/A";
        return;
    }

    const latlngsOuterRing = polygonLayer.getLatLngs()[0];
    if (!Array.isArray(latlngsOuterRing) || latlngsOuterRing.length < 3) {
         console.warn("calculateAndDisplayCentroid: Coordinate del poligono insufficienti.");
         document.getElementById("centroid-display").textContent = "Centroide: N/A (poligono non valido).";
         return;
    }

    let geoJsonCoords = latlngsOuterRing.map(l => [l.lng, l.lat]);
    if (!latlngsOuterRing[0].equals(latlngsOuterRing[latlngsOuterRing.length - 1])) {
        geoJsonCoords.push(geoJsonCoords[0]);
    }

    if (geoJsonCoords.length < 4) {
        console.warn("calculateAndDisplayCentroid: Poligono non valido anche dopo il tentativo di chiusura.");
        document.getElementById("centroid-display").textContent = "Centroide: N/A (poligono troppo piccolo).";
        return;
    }

    try {
        const turfPolygon = turf.polygon([geoJsonCoords]);
        const centroid = turf.centroid(turfPolygon);
        const centroidCoords = centroid.geometry.coordinates;
        const centroidLat = centroidCoords[1].toFixed(6);
        const centroidLon = centroidCoords[0].toFixed(6);
        document.getElementById("centroid-display").textContent = `Centroide: Lat ${centroidLat}, Lon ${centroidLon}`;
    } catch (error) {
        console.error("calculateAndDisplayCentroid: Errore critico nel calcolo del centroide:", error);
        document.getElementById("centroid-display").textContent = "Centroide: Errore nel calcolo (vedi console).";
    }
}

function updateAddressAndCoordinates() {
    const terreno = terreni.find(t => t.id === selectedTerrenoId);
    if (terreno && terreno.leafletLayer) {
        const polygon = terreno.leafletLayer;
        calculateAndDisplayCentroid(polygon);

        if (typeof turf !== 'undefined' && polygon.getLatLngs().length > 0 && polygon.getLatLngs()[0].length >= 3) {
            const latlngsForAddress = polygon.getLatLngs()[0];
            let geoJsonCoordsForAddress = latlngsForAddress.map(l => [l.lng, l.lat]);
            if (!latlngsForAddress[0].equals(latlngsForAddress[latlngsForAddress.length - 1])) {
                geoJsonCoordsForAddress.push(geoJsonCoordsForAddress[0]);
            }

            if (geoJsonCoordsForAddress.length >= 4) {
                try {
                    const turfPolygonForAddress = turf.polygon([geoJsonCoordsForAddress]);
                    const centroidForAddress = turf.centroid(turfPolygonForAddress);
                    const centroidCoordsForAddress = centroidForAddress.geometry.coordinates;

                    reverseGeocode(centroidCoordsForAddress[1], centroidCoordsForAddress[0])
                        .then(address => { /* non c'è più address-display */ })
                        .catch(error => { console.error("Errore di geocodifica inversa:", error); });
                } catch (e) {
                    console.error("Errore nel calcolo del centroide per la geocodifica indirizzo:", e);
                }
            }
        } else {
            console.warn("Turf.js non disponibile o poligono non valido per geocodifica inversa.");
        }
    } else {
        document.getElementById("centroid-display").textContent = "Centroide: N/A";
    }
}

async function reverseGeocode(lat, lng) {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=it`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.display_name || "Indirizzo non trovato.";
}


function updateAllMapLayers() {
    mainDrawnItems.clearLayers();
    terreni.forEach(t => {
        if (t.leafletLayer) {
            t.leafletLayer.setStyle(t.id === selectedTerrenoId ? selectedStilePoligono : stilePoligono);
            mainDrawnItems.addLayer(t.leafletLayer);
            const popupContent = `<strong>Nome:</strong> ${t.name}<br>` +
                                 `<strong>Specie:</strong> ${t.species.map(s => `${s.name} (${s.quantity})`).join(', ') || 'N/A'}<br>` +
                                 `<strong>Area:</strong> ${t.area_ha} ha<br>` +
                                 `<strong>Perimetro:</strong> ${t.perimetro_m} m<br>` +
                                 `<strong>Stima CO₂:</strong> ${t.co2_kg_annuo} kg/anno`;
            t.leafletLayer.bindPopup(popupContent);
        }
    });

    if (mainDrawnItems.getLayers().length > 0) {
        if (selectedTerrenoId && terreni.find(t => t.id === selectedTerrenoId && t.leafletLayer)) {
            mainMap.fitBounds(terreni.find(t => t.id === selectedTerrenoId).leafletLayer.getBounds(), { padding: [20, 20], maxZoom: 16 });
        } else {
            mainMap.fitBounds(mainDrawnItems.getBounds(), { padding: [20, 20] });
        }
    }
}

function updateAllLayerPopups() {
    terreni.forEach(t => {
        if (t.leafletLayer) {
            const popupContent = `<strong>Nome:</strong> ${t.name}<br>` +
                                 `<strong>Specie:</strong> ${t.species.map(s => `${s.name} (${s.quantity})`).join(', ') || 'N/A'}<br>` +
                                 `<strong>Area:</strong> ${t.area_ha} ha<br>` +
                                 `<strong>CO₂:</strong> ${t.co2_kg_annuo} kg/anno`;
            t.leafletLayer.bindPopup(popupContent);
        }
    });
}

function esportaDati() {
    if (terreni.length === 0) {
        showCustomAlert("Nessun terreno salvato.");
        return;
    }
    const dati = terreni.map(t => ({
        nome: t.name,
        specie_dettagli: t.species,
        area_ha: t.area_ha,
        perimetro_m: t.perimetro_m,
        assorbimento_CO2_annuo_kg: t.co2_kg_annuo,
        coordinate: t.coordinate || []
    }));
    const blob = new Blob([JSON.stringify(dati, null, 2)], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "terreni_CO2.json";
    a.click();
    URL.revokeObjectURL(url);
}

function applicaFiltro() {
    const filtro = document.getElementById("filtro-specie").value.trim().toLowerCase();
    if (!filtro) {
        showCustomAlert("Inserisci una specie per filtrare.");
        return;
    }
    mainDrawnItems.eachLayer(layer => {
        const terreno = terreni.find(t => t.leafletLayer && L.Util.stamp(t.leafletLayer) === L.Util.stamp(layer));
        if (terreno && terreno.species.some(s => s.name.toLowerCase().includes(filtro))) {
            layer.setStyle({fillOpacity: 0.5, opacity: 1});
        } else {
            layer.setStyle({fillOpacity: 0, opacity: 0});
        }
    });
}

function resetFiltro() {
    mainDrawnItems.eachLayer(layer => {
        layer.setStyle({fillOpacity: 0.5, opacity: 1});
    });
    document.getElementById("filtro-specie").value = "";
    if (selectedTerrenoId) {
        const selectedTerreno = terreni.find(t => t.id === selectedTerrenoId);
        if (selectedTerreno && selectedTerreno.leafletLayer) {
            selectedTerreno.leafletLayer.setStyle(selectedStilePoligono);
        }
    }
}

function updateDashboard() {
    const totalTerreni = terreni.length;
    const totalCO2 = terreni.reduce((sum, t) => sum + parseFloat(t.co2_kg_annuo || 0), 0).toFixed(2);
    const selectedTerreno = terreni.find(t => t.id === selectedTerrenoId);
    const areaForDisplay = selectedTerreno ? parseFloat(selectedTerreno.area_ha || 0).toFixed(2) : '0.00';
    const co2ForDisplay = selectedTerreno ? parseFloat(selectedTerreno.co2_kg_annuo || 0).toFixed(2) : '0.00';

    document.getElementById("total-area").textContent = areaForDisplay;
    document.getElementById("total-co2").textContent = co2ForDisplay;

    updateTerreniTable();
    updateCO2Chart();
    updateAllMapLayers();
}

function updateTerreniTable() {
    const tableBody = document.querySelector("#terreni-table tbody");
    tableBody.innerHTML = '';
    terreni.forEach(t => {
        const row = tableBody.insertRow();
        const cell1 = row.insertCell();
        cell1.textContent = t.name;
        cell1.setAttribute('data-label', 'Nome Terreno');
        const cell2 = row.insertCell();
        cell2.textContent = t.species.map(s => `${s.name} (${s.quantity})`).join(', ') || 'N/A';
        cell2.setAttribute('data-label', 'Specie');
        const cell3 = row.insertCell();
        cell3.textContent = t.area_ha || '0.00';
        cell3.setAttribute('data-label', 'Area (ha)');
        const cell4 = row.insertCell();
        cell4.textContent = t.co2_kg_annuo || '0.00';
        cell4.setAttribute('data-label', 'CO₂ Assorbita (kg/anno)');
    });
}

function updateCO2Chart() {
    const speciesData = {};
    terreni.forEach(t => {
        t.species.forEach(s => {
            const specieName = s.name.toLowerCase();
            if (!specieName) return;
            if (!speciesData[specieName]) {
                speciesData[specieName] = 0;
            }
            const valueMatch = s.quantity.match(/(\d+(\.\d+)?)/);
            const value = valueMatch ? parseFloat(valueMatch[1]) : 0;
            const rate = co2Rates[specieName] || co2Rates.default;
            if (s.quantity.toLowerCase().includes('ha')) {
                speciesData[specieName] += rate * value * 100;
            } else if (s.quantity.toLowerCase().includes('m²')) {
                speciesData[specieName] += rate * value * 0.01;
            } else {
                speciesData[specieName] += rate * value;
            }
        });
    });

    const labels = Object.keys(speciesData);
    const data = Object.values(speciesData);

    if (co2Chart) {
        co2Chart.destroy();
    }

    const ctx = document.getElementById('co2Chart').getContext('2d');
    co2Chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'CO₂ Assorbita (kg/anno)',
                data: data,
                backgroundColor: [
                    'rgba(40, 167, 69, 0.7)', 'rgba(0, 123, 255, 0.7)',
                    'rgba(255, 193, 7, 0.7)', 'rgba(220, 53, 69, 0.7)',
                    'rgba(108, 117, 125, 0.7)'
                ],
                borderColor: [
                    'rgba(40, 167, 69, 1)', 'rgba(0, 123, 255, 1)',
                    'rgba(255, 193, 7, 1)', 'rgba(220, 53, 69, 1)',
                    'rgba(108, 117, 125, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'CO₂ Assorbita (kg/anno)'}},
                x: { title: { display: true, text: 'Specie Vegetale' }}
            },
            plugins: { legend: { display: false }, title: { display: true, text: 'Assorbimento di CO₂ per Specie' }}
        }
    });
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('hidden');
    setTimeout(() => {
        if (mainMap) { mainMap.invalidateSize(); }
        updateCO2Chart();
    }, 300);
}

function useCadastralData() {
    showCustomAlert("Funzione 'Utilizza dati catastali' ancora da implementare.");
}

function createModal(type, message, defaultValue = '', callback = null) {
    const existingModal = document.getElementById('custom-modal');
    if (existingModal) { existingModal.remove(); }

    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'custom-modal';
    modalOverlay.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.6); display: flex; justify-content: center; align-items: center; z-index: 10000;`;
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `background-color: white; padding: 25px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3); max-width: 400px; width: 90%; text-align: center; font-family: 'Roboto', sans-serif; color: var(--text-color); position: relative;`;
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';
    closeButton.style.cssText = `position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 1.5em; cursor: pointer; color: #aaa; width: 30px; height: 30px; padding: 0; line-height: 1;`;
    closeButton.onclick = () => {
        document.body.removeChild(modalOverlay);
        if (callback && type === 'prompt') { callback(null); }
    };
    modalContent.appendChild(closeButton);
    const messagePara = document.createElement('p');
    messagePara.textContent = message;
    messagePara.style.cssText = `margin-bottom: 20px; font-size: 1.1em; line-height: 1.4; padding-top: 10px;`;
    modalContent.appendChild(messagePara);

    if (type === 'prompt') {
        const input = document.createElement('input');
        input.type = 'text'; input.value = defaultValue;
        input.style.cssText = `width: calc(100% - 20px); padding: 10px; margin-bottom: 15px; border: 1px solid var(--border-color); border-radius: 5px; font-size: 1em;`;
        modalContent.appendChild(input);
        const confirmBtn = document.createElement('button'); confirmBtn.textContent = 'OK';
        confirmBtn.style.cssText = `background-color: var(--primary-blue); color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-size: 1em; margin-right: 10px; width: auto;`;
        confirmBtn.onclick = () => { document.body.removeChild(modalOverlay); if (callback) callback(input.value); };
        modalContent.appendChild(confirmBtn);
        const cancelBtn = document.createElement('button'); cancelBtn.textContent = 'Annulla';
        cancelBtn.style.cssText = `background-color: #ccc; color: var(--text-color); padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-size: 1em; width: auto;`;
        cancelBtn.onclick = () => { document.body.removeChild(modalOverlay); if (callback) callback(null); };
        modalContent.appendChild(cancelBtn);
        input.focus();
    } else if (type === 'confirm') {
        const confirmBtn = document.createElement('button'); confirmBtn.textContent = 'Sì';
        confirmBtn.style.cssText = `background-color: var(--primary-green); color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-size: 1em; margin-right: 10px; width: auto;`;
        confirmBtn.onclick = () => { document.body.removeChild(modalOverlay); if (callback) callback(true); };
        modalContent.appendChild(confirmBtn);
        const cancelBtn = document.createElement('button'); cancelBtn.textContent = 'No';
        cancelBtn.style.cssText = `background-color: #ccc; color: var(--text-color); padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-size: 1em; width: auto;`;
        cancelBtn.onclick = () => { document.body.removeChild(modalOverlay); if (callback) callback(false); };
        modalContent.appendChild(cancelBtn);
    } else {
        const okBtn = document.createElement('button'); okBtn.textContent = 'OK';
        okBtn.style.cssText = `background-color: var(--primary-blue); color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-size: 1em; width: auto;`;
        okBtn.onclick = () => { document.body.removeChild(modalOverlay); if (callback) callback(); };
        modalContent.appendChild(okBtn);
    }
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
}

function showCustomAlert(message, callback = null) { createModal('alert', message, '', callback); }
function showCustomConfirm(message, callback) { createModal('confirm', message, '', callback); }
function showCustomPrompt(message, defaultValue, callback) { createModal('prompt', message, defaultValue, callback); }

function initializeSpeciesAutosuggest() {
    const speciesInput = document.getElementById('new-species-name-input');
    const suggestionsContainer = document.getElementById('species-suggestions-dropdown');

    if (!speciesInput || !suggestionsContainer) {
        console.error("Elementi per l'autosuggest delle specie non trovati nel DOM.");
        return;
    }

    function displaySuggestions(filterText = '') {
        suggestionsContainer.innerHTML = ''; // Pulisci i suggerimenti precedenti
        const lowerFilterText = filterText.toLowerCase().trim();

        // Se il testo del filtro è vuoto, mostra tutte le specie, altrimenti filtra
        const speciesToShow = lowerFilterText === '' ?
            ALL_SPECIES_NAMES :
            ALL_SPECIES_NAMES.filter(species => species.toLowerCase().includes(lowerFilterText));

        if (speciesToShow.length > 0) {
            speciesToShow.forEach(species => {
                const suggestionItem = document.createElement('div');
                suggestionItem.classList.add('suggestion-item');
                suggestionItem.textContent = species;
                // Usare mousedown assicura che l'evento si attivi prima del blur dell'input
                suggestionItem.addEventListener('mousedown', function(event) {
                    event.preventDefault(); // Impedisce che l'input perda il focus prima che il valore sia impostato
                    speciesInput.value = species; // Imposta il valore dell'input
                    suggestionsContainer.style.display = 'none'; // Nasconde il contenitore dei suggerimenti
                    suggestionsContainer.innerHTML = ''; // Pulisce per sicurezza
                });
                suggestionsContainer.appendChild(suggestionItem);
            });
            suggestionsContainer.style.display = 'block'; // Mostra il contenitore dei suggerimenti
        } else {
            suggestionsContainer.style.display = 'none'; // Nasconde se non ci sono suggerimenti
        }
    }

    speciesInput.addEventListener('input', function() {
        displaySuggestions(this.value);
    });

    speciesInput.addEventListener('focus', function() {
        // Mostra i suggerimenti quando l'input riceve il focus,
        // filtrati dal valore corrente (mostra tutti se l'input è vuoto)
        displaySuggestions(this.value);
    });

    speciesInput.addEventListener('blur', function() {
        // Ritarda la chiusura del dropdown per permettere al click (mousedown) sulla suggestion di registrarsi
        setTimeout(() => {
            // Controlla se il mouse è ancora sopra il contenitore dei suggerimenti.
            // Se un elemento è stato cliccato, il mousedown handler lo avrà già nascosto.
            if (!suggestionsContainer.matches(':hover')) {
                 suggestionsContainer.style.display = 'none';
            }
        }, 150); // Un breve ritardo
    });
}


document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initializeMainMap();
        renderTerreniList();
        updateDashboard();

        document.getElementById('selected-terrain-details').style.display = 'none';
        document.getElementById('coordinates-section').style.display = 'none';
        document.getElementById('polygon-vertices-section').style.display = 'none';

        if (terreni.length > 0) {
            selectTerreno(terreni[0].id);
        }

        const indirizzoSearchInput = document.getElementById('indirizzo_search_sidebar');
        if (indirizzoSearchInput) {
            indirizzoSearchInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    goToLocationSidebar();
                }
            });
        }
        
        initializeSpeciesAutosuggest();

    }, 1000);
});