window.addEventListener('DOMContentLoaded', () => {
  const ctxLine = document.getElementById('lineChart')?.getContext('2d');
  const ctxBar = document.getElementById('barChart')?.getContext('2d');
  const ctxPie = document.getElementById('pieChart')?.getContext('2d');

  const initialLabels = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

  const weekLabels = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
  const pieLabels = [
    'Quercia', 'Pino', 'Faggio', 'Betulla', 'Castagno', 'Acero', 'Olmo', 'Pioppo',
    'Cipresso', 'Larice', 'Abete rosso', 'Abete bianco', 'Salice', 'Eucalipto',
    'Tiglio', 'Frassino', 'Nocciolo', 'Ciliegio', 'Ulivo', 'Mais', 'Grano', 'Riso',
    'Soia', 'Girasole', 'Barbabietola', 'Patata', 'Pomodoro', 'Lattuga', 'Cavolo',
    'Zucchina', 'Melanzana', 'Peperone', 'Fagiolo', 'Pisello', 'Cetriolo',
    'Anguria', 'Melone', 'Fragola', 'Erba medica'
  ];
  const co2Data = [6200, 6150, 6100, 6050, 6000, 5950, 5900, 5850, 5800, 6000, 6200, 6400,
                 6600, 6500, 6400, 6300, 6200, 6100, 6000, 6100, 6200, 6300, 6400, 6500];

  const o2Data = [4100, 4120, 4140, 4160, 4180, 4200, 4220, 4240, 4260, 4280, 4300, 4320,
                4340, 4360, 4380, 4400, 4420, 4440, 4460, 4480, 4500, 4480, 4460, 4440];


  const rainData = [12, 8, 10, 15, 9, 6, 7];
  const rainDaysData = [3, 2, 4, 5, 2, 1, 3];
  const sunData = [4, 5, 3, 2, 5, 6, 4];
  const cloudsData = [2, 3, 2, 3, 1, 0, 2];

  const pieValues = [
  21.5, 17.2, 19.0, 18.1, 22.3, 16.5, 14.2, 23.8,
  15.6, 20.0, 18.8, 19.5, 12.7, 25.0,
  17.4, 16.8, 13.6, 14.4, 11.5, 2.4, 1.7, 2.1,
  2.0, 2.2, 2.8, 1.9, 1.6, 0.8, 1.3,
  1.5, 1.4, 1.4, 1.2, 1.0, 1.3,
  2.5, 2.3, 0.9, 3.0
  ]; // valori arbitrari, modificabili
  const pieColors = pieLabels.map((_, i) =>
  `hsl(${i * 9 % 360}, 70%, 60%)`
  );
  window.lineChart = new Chart(ctxLine, {
  type: 'line',
  data: {
    labels: [...initialLabels],
    datasets: [
      {
        label: 'CO₂ (kg)',
        data: [...co2Data],
        borderColor: '#dc3545',
        backgroundColor: 'rgba(220, 53, 69, 0.2)',
        tension: 0.2,
        fill: true
      },
      {
        label: 'O₂ (kg)',
        data: [...o2Data],
        borderColor: '#198754',
        backgroundColor: 'rgba(25, 135, 84, 0.2)',
        tension: 0.2,
        fill: true
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: false }
    }
  }
  

});

  document.getElementById('co2Display').textContent = `CO₂: ${co2Data[co2Data.length - 1]} kg`;
  document.getElementById('o2Display').textContent = `O₂: ${o2Data[o2Data.length - 1]} kg`;

  const filterLineChart = (start, end) => {
    const startIndex = initialLabels.indexOf(start);
    const endIndex = initialLabels.indexOf(end);
    if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) return;

    lineChart.data.labels = initialLabels.slice(startIndex, endIndex + 1);
    lineChart.data.datasets[0].data = co2Data.slice(startIndex, endIndex + 1);
    lineChart.data.datasets[1].data = o2Data.slice(startIndex, endIndex + 1);
    lineChart.update();
  };

  document.getElementById('filterChart')?.addEventListener('click', () => {
    const start = document.getElementById('startTime')?.value;
    const end = document.getElementById('endTime')?.value;
    if (start && end) filterLineChart(start, end);
  });

  const barChart = new Chart(ctxBar, {
    type: 'bar',
    data: {
      labels: [...weekLabels],
      datasets: [
        { label: '🌧️Precipitazioni (mm)', data: [...rainData], backgroundColor: 'rgba(54, 162, 235, 0.6)', borderColor: 'rgba(54, 162, 235, 1)', borderWidth: 1 },
        { label: '🌡️Temperatura (°C)', data: [...rainDaysData], backgroundColor: 'rgba(75, 192, 192, 0.6)', borderColor: 'rgba(75, 192, 192, 1)', borderWidth: 1 },
        { label: '☀️Soleggiato', data: [...sunData], backgroundColor: 'rgba(255, 205, 86, 0.6)', borderColor: 'rgba(255, 205, 86, 1)', borderWidth: 1 },
        { label: '💧Umidità', data: [...cloudsData], backgroundColor: 'rgba(201, 203, 207, 0.6)', borderColor: 'rgba(201, 203, 207, 1)', borderWidth: 1 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true } }
    }
  });

  document.getElementById('filterBarChart')?.addEventListener('click', () => {
    const start = weekLabels.indexOf(document.getElementById('startDay').value);
    const end = weekLabels.indexOf(document.getElementById('endDay').value);
    if (start === -1 || end === -1 || start > end) return;

    barChart.data.labels = weekLabels.slice(start, end + 1);
    barChart.data.datasets[0].data = rainData.slice(start, end + 1);
    barChart.data.datasets[1].data = rainDaysData.slice(start, end + 1);
    barChart.data.datasets[2].data = sunData.slice(start, end + 1);
    barChart.data.datasets[3].data = cloudsData.slice(start, end + 1);
    barChart.update();
  });

  const pieChart = new Chart(ctxPie, {
    type: 'pie',
    data: {
      labels: [...pieLabels],
      datasets: [{
        data: [...pieValues],
        backgroundColor: [...pieColors]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });

  const plantFilterForm = document.getElementById('plantFilterForm');
  pieLabels.forEach((label, i) => {
    const div = document.createElement('div');
    div.className = 'form-check';

    const input = document.createElement('input');
    input.className = 'form-check-input';
    input.type = 'checkbox';
    input.name = 'plantFilter';
    input.value = label;
    input.id = `plant-${i}`;
    input.checked = true;

    const lbl = document.createElement('label');
    lbl.className = 'form-check-label';
    lbl.htmlFor = input.id;
    lbl.textContent = label;

    div.appendChild(input);
    div.appendChild(lbl);
    plantFilterForm.appendChild(div);
  });



  const updatePieChart = () => {
    const selected = Array.from(plantFilterForm.querySelectorAll('input[name="plantFilter"]'))

      .filter(input => input.checked)
      .map(input => input.value);

    const newLabels = [];
    const newData = [];
    const newColors = [];

    pieLabels.forEach((label, index) => {
      if (selected.includes(label)) {
        newLabels.push(label);
        newData.push(pieValues[index]);
        newColors.push(pieColors[index]);
      }
    });

    pieChart.data.labels = newLabels;
    pieChart.data.datasets[0].data = newData;
    pieChart.data.datasets[0].backgroundColor = newColors;
    pieChart.update();
    updateLineChartByPlants();

  };
  const updateLineChartByPlants = () => {
  const selected = Array.from(plantFilterForm.querySelectorAll('input[name="plantFilter"]'))

    .filter(input => input.checked)
    .map(input => input.value);

  let totalSelected = 0;
  let totalAll = pieValues.reduce((a, b) => a + b, 0);

  pieLabels.forEach((label, i) => {
    if (selected.includes(label)) {
      totalSelected += pieValues[i];
    }
  });

  const scale = totalSelected / totalAll;

  const newCO2 = co2Data.map(v => Math.round(v * scale));
  const newO2 = o2Data.map(v => Math.round(v * scale));

  lineChart.data.datasets[0].data = newCO2;
  lineChart.data.datasets[1].data = newO2;
  lineChart.update();

  document.getElementById('co2Display').textContent = `CO₂: ${newCO2[newCO2.length - 1]} kg`;
  document.getElementById('o2Display').textContent = `O₂: ${newO2[newO2.length - 1]} kg`;
};


  plantFilterForm?.addEventListener('change', updatePieChart);

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Cerca piante...';
  searchInput.className = 'form-control form-control-sm mb-2';
  
  const controls = document.createElement('div');
  controls.classList.add('d-flex', 'gap-2', 'mb-2');

  const selectAllBtn = document.createElement('button');
  selectAllBtn.textContent = 'Seleziona Tutti';
  selectAllBtn.className = 'btn btn-sm btn-outline-success';
  selectAllBtn.type = 'button';
  selectAllBtn.addEventListener('click', () => {
    plantFilterForm.querySelectorAll('input[name="plantFilter"]').forEach(cb => cb.checked = true);
    updatePieChart();
  });

  const deselectAllBtn = document.createElement('button');
  deselectAllBtn.textContent = 'Deseleziona Tutti';
  deselectAllBtn.className = 'btn btn-sm btn-outline-danger';
  deselectAllBtn.type = 'button';
  deselectAllBtn.addEventListener('click', () => {
    plantFilterForm.querySelectorAll('input[name="plantFilter"]').forEach(cb => cb.checked = false);
    updatePieChart();
  });

  controls.appendChild(selectAllBtn);
  controls.appendChild(deselectAllBtn);
  plantFilterForm.prepend(controls);

plantFilterForm.prepend(searchInput);

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    Array.from(plantFilterForm.querySelectorAll('input[name="plantFilter"]')).forEach(input => {
      const match = input.value.toLowerCase().includes(query);
      input.parentElement.style.display = match ? '' : 'none';
    });
  });

  

  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;

  const applyTheme = (theme) => {
    body.classList.toggle('dark-theme', theme === 'dark');
    if (themeToggle) themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  };

  const savedTheme = localStorage.getItem('theme') || 'light';
  applyTheme(savedTheme);

  themeToggle?.addEventListener('click', () => {
    const newTheme = body.classList.contains('dark-theme') ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  });

  const chatBubble = document.getElementById('chatBubble');
  const chatBox = document.getElementById('chatBox');

  chatBubble?.addEventListener('click', () => {
    const isVisible = chatBox.style.display === 'flex';
    chatBox.style.display = isVisible ? 'none' : 'flex';
  });


    const updateBarChartWithTerrain = (dataset) => {
    const rainData = dataset.map(d => parseFloat(d[0]));       // Precipitazione: FLOAT
    const temperatureData = dataset.map(d => parseFloat(d[1])); // Temperatura: FLOAT
    const sunData = dataset.map(d => parseFloat(d[2]));         // Soleggiato: FLOAT
    const humidityData = dataset.map(d => Math.round(d[3]));    // Umidità: INTEGER
    barChart.data.datasets[0].data = rainData;
    barChart.data.datasets[1].data = temperatureData;
    barChart.data.datasets[2].data = sunData;
    barChart.data.datasets[3].data = humidityData;
    barChart.update();
    

    };

    document.querySelectorAll('#terrainButtons button').forEach(button => {
    button.addEventListener('click', () => {
        const selected = button.getAttribute('data-terreno');
        if (terrainData[selected]) {
        updateBarChartWithTerrain(terrainData[selected].meteo);
        }
    });
    });


  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('mainContent');
  const toggleSidebarBtn = document.getElementById('toggleSidebar');

  toggleSidebarBtn?.addEventListener('click', () => {
    const isCollapsed = sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('collapsed', isCollapsed);
    toggleSidebarBtn.textContent = isCollapsed ? '➡️' : '☰';
  });

});


// Funzione per supportare esportazione grafici ad alta risoluzione (opzionale)
window.captureChartCanvas = async (canvasElement) => {
  return await html2canvas(canvasElement, {
    scale: 2,
    useCORS: true
  });
};
//pezzo che era in html
  window.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('exportLinePDF');
    

exportBtn?.addEventListener('click', async () => {
  const jsPDF = window.jspdf.jsPDF;
  const doc = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = doc.internal.pageSize.getWidth() - 20;
  doc.setFont("helvetica", "normal");

  // === Pagina 1: Dati Meteo + Grafico a LINEE ===
  let yOffset = 10;
  doc.setFontSize(18);
  doc.text('1. Dati Meteo Settimanali', 10, yOffset);
  yOffset += 10;

  const lineChart = document.querySelectorAll('.chart-canvas')[0];
  if (lineChart) {
    const image = await html2canvas(lineChart, { scale: 2, useCORS: true });
    const imgData = image.toDataURL('image/png');
    doc.addImage(imgData, 'PNG', 10, yOffset, pdfWidth, 100);
  }

  // === Pagina 2: Dati CO2/O2 + Grafico a BARRE ===
  doc.addPage();
  let coY = 10;
  doc.setFontSize(18);
  doc.text('2. Dati Finali CO₂ e O₂', 10, coY);
  coY += 10;

  const co2Text = document.getElementById('co2Display')?.textContent || 'CO₂: -- kg';
  const o2Text = document.getElementById('o2Display')?.textContent || 'O₂: -- kg';
  doc.setFontSize(12);
  doc.text(`Assorbimento CO₂ finale: ${co2Text.replace('CO₂: ', '')}`, 10, coY);
  coY += 6;
  doc.text(`Emissione O₂ finale: ${o2Text.replace('O₂: ', '')}`, 10, coY);

  const barChart = document.querySelectorAll('.chart-canvas')[1];
  if (barChart) {
    const image = await html2canvas(barChart, { scale: 2, useCORS: true });
    const imgData = image.toDataURL('image/png');
    doc.addImage(imgData, 'PNG', 10, 30, pdfWidth, 100);
  }

  // === Pagina 3: Dati Piante + Grafico Torta ===
  doc.addPage();
  let pieY = 10;
  doc.setFontSize(18);
  doc.text('3. Specie Selezionate', 10, pieY);
  pieY += 10;

  const pieLabels = Array.from(document.querySelectorAll('#plantFilterForm input[type="checkbox"]:checked'))
    .map(cb => cb.value);
  const pieChart = Chart.getChart("pieChart");
  const pieData = pieChart?.data || { labels: [], datasets: [{ data: [] }] };

  const selectedSpecies = pieLabels.map(label => {
    const index = pieData.labels.indexOf(label);
    const value = index !== -1 ? pieData.datasets[0].data[index] : '--';
    return `${label}: ${value}`;
  });

  doc.setFontSize(12);
  doc.text(`Numero totale di specie selezionate: ${selectedSpecies.length}`, 10, pieY);
  pieY += 6;

  const speciesText = doc.splitTextToSize(selectedSpecies.join(', '), 180);
  doc.setFontSize(10);
  doc.text(speciesText, 10, pieY);
  pieY += speciesText.length * 5 + 5;

  const pieCanvas = document.querySelectorAll('.chart-canvas')[2];
  if (pieCanvas) {
    const image = await html2canvas(pieCanvas, { scale: 2, useCORS: true });
    const imgData = image.toDataURL('image/png');
    doc.addImage(imgData, 'PNG', 10, pieY, pdfWidth, 100);
  }

  doc.save('report_CO2_O2.pdf');
});


  });
//fine pezzo che era in html









// window.inserisciTerreno = async function() {
//     console.log("Bottone cliccato");
//     console.log("USER_DATA:", window.USER_DATA);

//     if (!window.USER_DATA) {
//       alert("Dati utente mancanti");
//       return;
//     }

//     try {
//       const response = await fetch("/inserisciterreno", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           id: window.USER_DATA.id,
//           email: window.USER_DATA.email,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error(`Errore HTTP: ${response.status}`);
//       }

//       const html = await response.text();
//       document.documentElement.innerHTML = html;

//     } catch (error) {
//       console.error("Errore durante la richiesta:", error);
//       alert("Errore nella comunicazione col server.");
//     }
//   };


