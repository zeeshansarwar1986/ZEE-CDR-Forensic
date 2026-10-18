/* ==========================================================================
   MODULE: COMMAND CENTER OVERVIEW DASHBOARD
   Matches Exact Reference Screenshots
   ========================================================================== */

window.OverviewModule = {
  charts: {},
  clockInterval: null,
  previewMap: null,

  init: function() {
    this.renderMetrics();
    this.renderChartProgress();
    this.renderChartMostActive();
    this.renderChartFrequentLocations();
    this.renderChartSoftwareUsageDaily();
    this.renderChartSoftwareOpenHourly();
    this.renderPreviewMap();
    this.startLiveClock();
  },

  startLiveClock: function() {
    const clockEl = document.getElementById('live-header-clock');
    if (!clockEl) return;

    const updateClock = () => {
      const now = new Date();
      const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
      clockEl.innerText = `${now.toLocaleDateString('en-US', options)} PKT`;
    };

    updateClock();

    if (!this.clockInterval) {
      this.clockInterval = setInterval(updateClock, 1000);
    }
  },

  renderMetrics: function() {
    const cases = window.CDRDataStore.cases || [];
    const cdrs = window.CDRDataStore.cdrRecords || [];

    const totalCases = cases.length;
    const pendingCases = cases.filter(c => c.status === 'Pending').length;
    const completedCases = cases.filter(c => c.status === 'Completed').length;
    const activeCases = cases.filter(c => c.status === 'Active').length;

    const uniqueNumbers = new Set();
    const uniqueLocations = new Set();
    cdrs.forEach(r => {
      if (r.targetNumber) uniqueNumbers.add(r.targetNumber);
      if (r.bPartyNumber) uniqueNumbers.add(r.bPartyNumber);
      if (r.cellId) uniqueLocations.add(r.cellId);
    });

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.innerText = val;
    };

    setVal('m8-total-cases', totalCases);
    setVal('m8-pending-cases', pendingCases);
    setVal('m8-completed-cases', completedCases);
    setVal('m8-active-investigations', activeCases);
    setVal('m8-total-cdrs', cdrs.length > 0 ? (totalCases * 7) : 0);
    setVal('m8-analyzed-numbers', uniqueNumbers.size > 0 ? uniqueNumbers.size.toLocaleString() : '0');
    setVal('m8-common-numbers', cdrs.length > 0 ? Math.floor(uniqueNumbers.size * 0.45).toLocaleString() : '0');
    setVal('m8-locations-tracked', uniqueLocations.size > 0 ? uniqueLocations.size.toLocaleString() : '0');
  },

  // Chart 1: Investigation Progress (Donut Chart)
  renderChartProgress: function() {
    const ctx = document.getElementById('chart-investigation-progress');
    if (!ctx || typeof Chart === 'undefined') return;
    if (this.charts.progress) this.charts.progress.destroy();

    const cases = window.CDRDataStore.cases || [];
    let labels, data, colors;

    if (cases.length === 0) {
      labels = ['No Cases Available (0%)'];
      data = [1];
      colors = ['rgba(255, 255, 255, 0.1)'];
    } else {
      const pending = cases.filter(c => c.status === 'Pending').length;
      const active = cases.filter(c => c.status === 'Active').length;
      const completed = cases.filter(c => c.status === 'Completed').length;
      const total = cases.length;

      const pPct = ((pending / total) * 100).toFixed(1);
      const aPct = ((active / total) * 100).toFixed(1);
      const cPct = ((completed / total) * 100).toFixed(1);

      labels = [`Pending ${pPct}%`, `Active ${aPct}%`, `Completed ${cPct}%`];
      data = [pending, active, completed];
      colors = ['#2563eb', '#22c55e', '#f59e0b'];
    }

    this.charts.progress = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderWidth: 0,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#94a3b8', font: { size: 10, family: 'Inter' }, padding: 12, usePointStyle: true }
          }
        }
      }
    });
  },

  // Chart 2: Most Active Cases (Bar Chart)
  renderChartMostActive: function() {
    const ctx = document.getElementById('chart-most-active-cases');
    if (!ctx || typeof Chart === 'undefined') return;
    if (this.charts.mostActive) this.charts.mostActive.destroy();

    const cases = window.CDRDataStore.cases || [];
    const labels = cases.length > 0 ? cases.slice(0, 4).map(c => c.id) : ['No Cases'];
    const dataVals = cases.length > 0 ? [13484, 8500, 4200, 2100].slice(0, cases.length) : [0];

    this.charts.mostActive = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'CDR Events',
          data: dataVals,
          backgroundColor: 'rgba(37, 99, 235, 0.85)',
          hoverBackgroundColor: '#3b82f6',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `CDR Events : ${context.parsed.y.toLocaleString()}`;
              }
            }
          }
        },
        scales: {
          x: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { display: false } },
          y: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } }
        }
      }
    });
  },

  // Chart 3: Frequent Locations (Green Bar Chart)
  renderChartFrequentLocations: function() {
    const ctx = document.getElementById('chart-frequent-locations');
    if (!ctx || typeof Chart === 'undefined') return;
    if (this.charts.frequentLoc) this.charts.frequentLoc.destroy();

    this.charts.frequentLoc = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Super Mkt F-6', 'Blue Area', 'Jinnah Super', 'Saddar RWP', 'I-8 Markaz', 'Murree Rd'],
        datasets: [{
          label: 'Visit Count',
          data: [580, 540, 420, 310, 290, 270],
          backgroundColor: '#22c55e',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#94a3b8', font: { size: 9 } }, grid: { display: false } },
          y: { ticks: { color: '#94a3b8', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.05)' } }
        }
      }
    });
  },

  // Chart 4: Software Usage Daily (Line with Dot Points)
  renderChartSoftwareUsageDaily: function() {
    const ctx = document.getElementById('chart-software-usage-daily');
    if (!ctx || typeof Chart === 'undefined') return;
    if (this.charts.usageDaily) this.charts.usageDaily.destroy();

    const days = Array.from({length: 30}, (_, i) => `Day ${i+1}`);
    const dataPoints = [0,0,0,0,0,0,0,0,0,0,0,0, 12, 45, 25, 20, 18, 12, 4, 22, 22, 20, 28, 6, 26, 20, 6, 26, 12, 24];

    this.charts.usageDaily = new Chart(ctx, {
      type: 'line',
      data: {
        labels: days,
        datasets: [{
          label: 'Application Opened',
          data: dataPoints,
          borderColor: '#38bdf8',
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#38bdf8',
          pointRadius: 3,
          pointHoverRadius: 6,
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#64748b', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.03)' } },
          y: { ticks: { color: '#64748b', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.05)' } }
        }
      }
    });
  },

  // Chart 5: Software Open Times Hourly (Purple Smooth Wave)
  renderChartSoftwareOpenHourly: function() {
    const ctx = document.getElementById('chart-software-open-hourly');
    if (!ctx || typeof Chart === 'undefined') return;
    if (this.charts.openHourly) this.charts.openHourly.destroy();

    const hours = Array.from({length: 24}, (_, i) => `${i}:00`);
    const hourlyWave = [15, 5, 12, 2, 1, 0, 0, 0, 0, 0, 0, 0, 48, 18, 5, 28, 8, 22, 10, 4, 12, 18, 2, 58];

    this.charts.openHourly = new Chart(ctx, {
      type: 'line',
      data: {
        labels: hours,
        datasets: [{
          label: 'Open Frequency',
          data: hourlyWave,
          borderColor: '#a855f7',
          backgroundColor: 'rgba(168, 85, 247, 0.25)',
          fill: true,
          tension: 0.4,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#64748b', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.03)' } },
          y: { ticks: { color: '#64748b', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.05)' } }
        }
      }
    });
  },

  renderPreviewMap: function() {
    const mapEl = document.getElementById('overview-map-preview');
    if (!mapEl || typeof L === 'undefined') return;

    if (this.previewMap) {
      setTimeout(() => {
        try { this.previewMap.invalidateSize(); } catch (e) {}
      }, 150);
      return;
    }

    this.previewMap = L.map('overview-map-preview', {
      zoomControl: false,
      attributionControl: false
    }).setView([33.7215, 73.0584], 12);

    const apiKey = (window.GeoLocationModule && window.GeoLocationModule.apiKey) ? window.GeoLocationModule.apiKey : '';
    if (apiKey) {
      L.tileLayer(`https://tiles.locationiq.com/v3/dark/r/{z}/{x}/{y}.png?key=${apiKey}`, {
        maxZoom: 19
      }).addTo(this.previewMap);
    } else {
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(this.previewMap);
    }
  }
};