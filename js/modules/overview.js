/* ==========================================================================
   MODULE: COMMAND CENTER OVERVIEW DASHBOARD
   Matches Exact Reference Screenshots (Image 1 & Image 2)
   ========================================================================== */

window.OverviewModule = {
  charts: {},

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
    setInterval(() => {
      const now = new Date();
      const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
      clockEl.innerText = `${now.toLocaleDateString('en-US', options)} PKT`;
    }, 1000);
  },

  renderMetrics: function() {
    // 8 Metric Values matching Image 2
    document.getElementById('m8-total-cases').innerText = '8';
    document.getElementById('m8-pending-cases').innerText = '6';
    document.getElementById('m8-completed-cases').innerText = '1';
    document.getElementById('m8-active-investigations').innerText = '1';
    document.getElementById('m8-total-cdrs').innerText = '21';
    document.getElementById('m8-analyzed-numbers').innerText = '8,855';
    document.getElementById('m8-common-numbers').innerText = '4,155';
    document.getElementById('m8-locations-tracked').innerText = '1,759';
  },

  // Chart 1: Investigation Progress (Donut Chart - Image 1)
  renderChartProgress: function() {
    const ctx = document.getElementById('chart-investigation-progress');
    if (!ctx) return;
    if (this.charts.progress) this.charts.progress.destroy();

    this.charts.progress = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Pending 75.0%', 'Active 12.5%', 'Completed 12.5%'],
        datasets: [{
          data: [75, 12.5, 12.5],
          backgroundColor: ['#2563eb', '#22c55e', '#f59e0b'],
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

  // Chart 2: Most Active Cases (Bar Chart - Image 1)
  renderChartMostActive: function() {
    const ctx = document.getElementById('chart-most-active-cases');
    if (!ctx) return;
    if (this.charts.mostActive) this.charts.mostActive.destroy();

    this.charts.mostActive = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Final (001)', 'CR-8841', 'CR-4412', 'CR-1090'],
        datasets: [{
          label: 'CDR Events',
          data: [13484, 8500, 4200, 2100],
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

  // Chart 3: Frequent Locations (Green Bar Chart - Image 1)
  renderChartFrequentLocations: function() {
    const ctx = document.getElementById('chart-frequent-locations');
    if (!ctx) return;
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

  // Chart 4: Software Usage Daily (Line with Dot Points - Image 1)
  renderChartSoftwareUsageDaily: function() {
    const ctx = document.getElementById('chart-software-usage-daily');
    if (!ctx) return;
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

  // Chart 5: Software Open Times Hourly (Purple Smooth Wave - Image 1)
  renderChartSoftwareOpenHourly: function() {
    const ctx = document.getElementById('chart-software-open-hourly');
    if (!ctx) return;
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
    if (!mapEl || this.previewMap) return;

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
