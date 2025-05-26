window.addEventListener('DOMContentLoaded', () => {
  const ctxLine = document.getElementById('lineChart')?.getContext('2d');
  const ctxBar = document.getElementById('barChart')?.getContext('2d');
  const ctxPie = document.getElementById('pieChart')?.getContext('2d');

  const initialLabels = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

  const weekLabels = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
  const pieLabels = ['Quercia', 'Pino', 'Faggio', 'Abete'];

  const co2Data = [6200, 6150, 6100, 6050, 6000, 5950, 5900, 5850, 5800, 6000, 6200, 6400,
                 6600, 6500, 6400, 6300, 6200, 6100, 6000, 6100, 6200, 6300, 6400, 6500];

  const o2Data = [4100, 4120, 4140, 4160, 4180, 4200, 4220, 4240, 4260, 4280, 4300, 4320,
                4340, 4360, 4380, 4400, 4420, 4440, 4460, 4480, 4500, 4480, 4460, 4440];


  const rainData = [12, 8, 10, 15, 9, 6, 7];
  const rainDaysData = [3, 2, 4, 5, 2, 1, 3];
  const sunData = [4, 5, 3, 2, 5, 6, 4];
  const cloudsData = [2, 3, 2, 3, 1, 0, 2];

  const pieValues = [100, 80, 90, 63];
  const pieColors = ['#007bff', '#17a2b8', '#28a745', '#ffc107'];

  const lineChart = new Chart(ctxLine, {
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
        { label: 'Precipitazioni (mm)', data: [...rainData], backgroundColor: 'rgba(54, 162, 235, 0.6)', borderColor: 'rgba(54, 162, 235, 1)', borderWidth: 1 },
        { label: 'Giorni di Pioggia', data: [...rainDaysData], backgroundColor: 'rgba(75, 192, 192, 0.6)', borderColor: 'rgba(75, 192, 192, 1)', borderWidth: 1 },
        { label: 'Soleggiato', data: [...sunData], backgroundColor: 'rgba(255, 205, 86, 0.6)', borderColor: 'rgba(255, 205, 86, 1)', borderWidth: 1 },
        { label: 'Nuvoloso', data: [...cloudsData], backgroundColor: 'rgba(201, 203, 207, 0.6)', borderColor: 'rgba(201, 203, 207, 1)', borderWidth: 1 }
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

  const updatePieChart = () => {
    const selected = Array.from(plantFilterForm.elements['plantFilter'])
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
  };

  plantFilterForm?.addEventListener('change', updatePieChart);

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Cerca piante...';
  searchInput.className = 'form-control form-control-sm mb-2';
  plantFilterForm.prepend(searchInput);

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    Array.from(plantFilterForm.elements['plantFilter']).forEach(input => {
      const match = input.value.toLowerCase().includes(query);
      input.parentElement.style.display = match ? '' : 'none';
    });
  });

  const controls = document.createElement('div');
  controls.classList.add('d-flex', 'gap-2', 'mt-2');

  const selectAllBtn = document.createElement('button');
  selectAllBtn.textContent = 'Seleziona Tutti';
  selectAllBtn.className = 'btn btn-sm btn-outline-success';
  selectAllBtn.type = 'button';
  selectAllBtn.addEventListener('click', () => {
    Array.from(plantFilterForm.elements['plantFilter']).forEach(cb => cb.checked = true);
    updatePieChart();
  });

  const deselectAllBtn = document.createElement('button');
  deselectAllBtn.textContent = 'Deseleziona Tutti';
  deselectAllBtn.className = 'btn btn-sm btn-outline-danger';
  deselectAllBtn.type = 'button';
  deselectAllBtn.addEventListener('click', () => {
    Array.from(plantFilterForm.elements['plantFilter']).forEach(cb => cb.checked = false);
    updatePieChart();
  });
    const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('mainContent');
  const toggleSidebarBtn = document.getElementById('toggleSidebar');

  toggleSidebarBtn?.addEventListener('click', () => {
    const isCollapsed = sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('collapsed', isCollapsed);
    toggleSidebarBtn.textContent = isCollapsed ? '➡️' : '☰';
  });

  controls.appendChild(selectAllBtn);
  controls.appendChild(deselectAllBtn);
  plantFilterForm.appendChild(controls);

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

  const exportBtn = document.getElementById('exportLineCSV');
  exportBtn?.addEventListener('click', () => {
    const labels = lineChart.data.labels;
    const co2 = lineChart.data.datasets[0].data;
    const o2 = lineChart.data.datasets[1].data;

    let csv = 'Ora,CO2 (kg),O2 (kg)\n';
    labels.forEach((label, i) => {
      csv += `${label},${co2[i]},${o2[i]}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'co2_o2_dati.csv';
    a.click();
    URL.revokeObjectURL(url);
  });
});
