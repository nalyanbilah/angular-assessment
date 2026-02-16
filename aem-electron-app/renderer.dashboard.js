const { ipcRenderer } = require('electron');

const loading = document.getElementById('loading');
const content = document.getElementById('content');
const logoutBtn = document.getElementById('logoutBtn');

// Load dashboard data
async function loadDashboard() {
  const token = localStorage.getItem('auth_token');

  if (!token) {
    alert('No authentication token found');
    ipcRenderer.send('logout');
    return;
  }

  try {
    const result = await ipcRenderer.invoke('get-dashboard-data', token);

    if (result.success) {
      displayDashboardData(result.data);
      loading.style.display = 'none';
      content.style.display = 'block';
    } else {
      alert('Failed to load dashboard data');
      loading.textContent = 'Failed to load dashboard data';
    }
  } catch (error) {
    console.error('Error loading dashboard:', error);
    loading.textContent = 'Error loading dashboard data';
  }
}

// Display dashboard data
function displayDashboardData(data) {
  // Donut Chart (Plotly)
  if (data.chartDonut && data.chartDonut.length > 0) {
    const labels = data.chartDonut.map(item => item.label || item.name);
    const values = data.chartDonut.map(item => item.value);

    Plotly.newPlot('donutChart', [{
      labels: labels,
      values: values,
      type: 'pie',
      hole: 0.4,
      marker: {
        colors: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
      }
    }], {
      showlegend: true,
      legend: { orientation: 'h', y: -0.2 },
      margin: { t: 30, b: 30, l: 30, r: 30 }
    }, {
      responsive: true,
      displayModeBar: false
    });
  }

  // Bar Chart (Plotly)
  if (data.chartbar && data.chartbar.length > 0) {
    const labels = data.chartbar.map(item => item.label || item.name);
    const values = data.chartbar.map(item => item.value);

    Plotly.newPlot('barChart', [{
      x: labels,
      y: values,
      type: 'bar',
      name: 'Values',
      marker: {
        color: '#007bff'
      }
    }], {
      showlegend: true,
      margin: { t: 30, b: 80, l: 50, r: 30 },
      xaxis: { tickangle: -45 }
    }, {
      responsive: true,
      displayModeBar: false
    });
  }

  // Users Table
  const tableContainer = document.getElementById('tableContainer');

  if (data.tableUsers && data.tableUsers.length > 0) {
    const table = document.createElement('table');
    const headers = Object.keys(data.tableUsers[0]);

    // Create header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headers.forEach(header => {
      const th = document.createElement('th');
      th.textContent = header;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create body
    const tbody = document.createElement('tbody');
    data.tableUsers.forEach(user => {
      const row = document.createElement('tr');
      headers.forEach(header => {
        const td = document.createElement('td');
        td.textContent = user[header];
        row.appendChild(td);
      });
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    tableContainer.appendChild(table);
  }
}

// Logout handler
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('username');
  ipcRenderer.send('logout');
});

// Load dashboard on page load
loadDashboard();
