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
    const records = window.CDRDataStore.cdrRecords || [];
    const dateCounts = {};

    records.forEach(r => {
      if (r.date) {
        dateCounts[r.date] = (dateCounts[r.date] || 0) + 1;
      }
    });

    const labels = Object.keys(dateCounts).sort();
    const data = labels.length > 0 ? labels.map(l => dateCounts[l]) : [0];

    const ctx = document.getElementById('chart-date-peaks');
    if (!ctx || typeof Chart === 'undefined') return;

    if (this.charts.peaks) {
      this.charts.peaks.destroy();
      this.charts.peaks = null;
    }

    this.charts.peaks = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels.length > 0 ? labels : ['No Data'],
        datasets: [{
          label: 'Total Calls',
          data: data,
          borderColor: '#00a8ff',
          backgroundColor: 'rgba(0, 168, 255, 0.15)',
          fill: true,
          tension: 0.3,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#00a8ff',
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `Calls: ${context.parsed.y} events`
            }
          }
        },
        scales: {
          x: { ticks: { color: '#94a3b8', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
        }
      }
    });
  },

  renderDurationChart: function() {
    const records = window.CDRDataStore.cdrRecords || [];
    let incomingDuration = 0;
    let outgoingDuration = 0;

    records.forEach(r => {
      const dur = r.duration || 0;
      if (r.callType === 'Incoming') incomingDuration += dur;
      else if (r.callType === 'Outgoing') outgoingDuration += dur;
    });

    const ctx = document.getElementById('chart-duration-split');
    if (!ctx || typeof Chart === 'undefined') return;

    if (this.charts.duration) {
      this.charts.duration.destroy();
      this.charts.duration = null;
    }

    this.charts.duration = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Incoming Duration (sec)', 'Outgoing Duration (sec)'],
        datasets: [{
          data: (incomingDuration === 0 && outgoingDuration === 0) ? [1, 1] : [incomingDuration, outgoingDuration],
          backgroundColor: ['#10b981', '#007bff'],
          borderWidth: 0,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#94a3b8', font: { size: 10, family: 'Inter' }, padding: 12, usePointStyle: true }
          }
        }
      }
    });
  },

  renderDOWChart: function() {
    const records = window.CDRDataStore.cdrRecords || [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dowCounts = new Array(7).fill(0);

    records.forEach(r => {
      if (r.timestamp) {
        const d = new Date(r.timestamp).getDay();
        if (!isNaN(d)) dowCounts[d]++;
      }
    });

    const ctx = document.getElementById('chart-dow-analysis');
    if (!ctx || typeof Chart === 'undefined') return;

    if (this.charts.dow) {
      this.charts.dow.destroy();
      this.charts.dow = null;
    }

    this.charts.dow = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: days,
        datasets: [{
          label: 'Calls Count',
          data: dowCounts,
          backgroundColor: 'rgba(245, 158, 11, 0.75)',
          hoverBackgroundColor: '#fbbf24',
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
  },

  renderDayNightChart: function() {
    const records = window.CDRDataStore.cdrRecords || [];
    let dayCount = 0;
    let nightCount = 0;

    records.forEach(r => {
      const h = typeof r.hour === 'number' ? r.hour : 0;
      if (h >= 6 && h < 18) dayCount++;
      else nightCount++;
    });

    const ctx = document.getElementById('chart-day-night-split');
    if (!ctx || typeof Chart === 'undefined') return;

    if (this.charts.dayNight) {
      this.charts.dayNight.destroy();
      this.charts.dayNight = null;
    }

    this.charts.dayNight = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Day Calls (06:00 - 18:00)', 'Night Calls (18:00 - 06:00)'],
        datasets: [{
          data: (dayCount === 0 && nightCount === 0) ? [1, 1] : [dayCount, nightCount],
          backgroundColor: ['#f59e0b', '#9333ea'],
          borderWidth: 0,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#94a3b8', font: { size: 10, family: 'Inter' }, padding: 12, usePointStyle: true }
          }
        }
      }
    });
  },

  renderActiveHeatmapGrid: function() {
    const gridEl = document.getElementById('active-heatmap-grid');
    if (!gridEl) return;

    const records = window.CDRDataStore.cdrRecords || [];
    const matrix = Array.from({ length: 24 }, () => 0);

    records.forEach(r => {
      const h = typeof r.hour === 'number' ? r.hour : 0;
      if (h >= 0 && h < 24) matrix[h]++;
    });

    const maxVal = Math.max(...matrix, 1);

    gridEl.innerHTML = matrix.map((val, h) => {
      const alpha = (val / maxVal).toFixed(2);
      const bg = `rgba(0, 168, 255, ${Math.max(parseFloat(alpha), 0.12)})`;
      return `
        <div class="heatmap-cell" style="background:${bg};" title="Hour ${h}:00 - ${val} Calls">
          <span style="font-size:0.6rem; color:#fff; position:absolute; bottom:2px; left:2px;">${h}h</span>
        </div>
      `;
    }).join('');
  }
};