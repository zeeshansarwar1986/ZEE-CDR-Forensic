/* ==========================================================================
   MODULE: GRAPHICAL ANALYTICS & ACTIVITY DISTRIBUTIONS
   ========================================================================== */

window.GraphicalModule = {
  charts: {},

  init: function() {
    this.renderDatePeaksChart();
    this.renderDurationChart();
    this.renderDOWChart();
    this.renderDayNightChart();
    this.renderActiveHeatmapGrid();
  },

  renderDatePeaksChart: function() {
    const records = window.CDRDataStore.cdrRecords;
    const dateCounts = {};

    records.forEach(r => {
      dateCounts[r.date] = (dateCounts[r.date] || 0) + 1;
    });

    const labels = Object.keys(dateCounts).sort();
    const data = labels.map(l => dateCounts[l]);

    const ctx = document.getElementById('chart-date-peaks');
    if (ctx) {
      if (this.charts.peaks) this.charts.peaks.destroy();
      this.charts.peaks = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Total Calls',
            data: data,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            fill: true,
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
            y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
          }
        }
      });
    }
  },

  renderDurationChart: function() {
    const records = window.CDRDataStore.cdrRecords;
    let incomingDuration = 0;
    let outgoingDuration = 0;

    records.forEach(r => {
      if (r.callType === 'Incoming') incomingDuration += r.duration;
      else if (r.callType === 'Outgoing') outgoingDuration += r.duration;
    });

    const ctx = document.getElementById('chart-duration-split');
    if (ctx) {
      if (this.charts.duration) this.charts.duration.destroy();
      this.charts.duration = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Incoming Duration (sec)', 'Outgoing Duration (sec)'],
          datasets: [{
            data: [incomingDuration, outgoingDuration],
            backgroundColor: ['#10b981', '#3b82f6'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } }
        }
      });
    }
  },

  renderDOWChart: function() {
    const records = window.CDRDataStore.cdrRecords;
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dowCounts = new Array(7).fill(0);

    records.forEach(r => {
      const d = new Date(r.timestamp).getDay();
      dowCounts[d]++;
    });

    const ctx = document.getElementById('chart-dow-analysis');
    if (ctx) {
      if (this.charts.dow) this.charts.dow.destroy();
      this.charts.dow = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: days,
          datasets: [{
            label: 'Calls Count',
            data: dowCounts,
            backgroundColor: 'rgba(245, 158, 11, 0.7)',
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
            y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
          }
        }
      });
    }
  },

  renderDayNightChart: function() {
    const records = window.CDRDataStore.cdrRecords;
    let dayCount = 0;
    let nightCount = 0;

    records.forEach(r => {
      const h = r.hour || 0;
      if (h >= 6 && h < 18) dayCount++;
      else nightCount++;
    });

    const ctx = document.getElementById('chart-day-night-split');
    if (ctx) {
      if (this.charts.dayNight) this.charts.dayNight.destroy();
      this.charts.dayNight = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['Day Calls (06:00 - 18:00)', 'Night Calls (18:00 - 06:00)'],
          datasets: [{
            data: [dayCount, nightCount],
            backgroundColor: ['#f59e0b', '#8b5cf6'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } }
        }
      });
    }
  },

  renderActiveHeatmapGrid: function() {
    const gridEl = document.getElementById('active-heatmap-grid');
    if (!gridEl) return;

    const records = window.CDRDataStore.cdrRecords;
    const matrix = Array.from({length: 24}, () => 0);

    records.forEach(r => {
      const h = r.hour || 0;
      matrix[h]++;
    });

    const maxVal = Math.max(...matrix, 1);

    gridEl.innerHTML = matrix.map((val, h) => {
      const alpha = (val / maxVal).toFixed(2);
      const bg = `rgba(6, 182, 212, ${Math.max(alpha, 0.1)})`;
      return `
        <div class="heatmap-cell" style="background:${bg};" title="Hour ${h}:00 - ${val} Calls">
          <span style="font-size:0.6rem; color:#fff; position:absolute; bottom:2px; left:2px;">${h}h</span>
        </div>
      `;
    }).join('');
  }
};
