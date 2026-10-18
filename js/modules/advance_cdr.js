/* ==========================================================================
   MODULE: ADVANCE CDR ANALYSIS & WATCHLIST TELEMETRY
   ========================================================================== */

window.AdvanceCDRModule = {
  chart: null,

  init: function() {
    this.renderTelemetry();
    this.renderHourlyChart();
  },

  renderTelemetry: function() {
    const records = window.CDRDataStore.cdrRecords || [];
    const targetNum = window.CDRDataStore.activeTargetNumber || 'N/A';
    const caseId = window.CDRDataStore.currentCaseId || 'CR-2026-8841';

    const setEl = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.innerText = val;
    };

    setEl('adv-case-id', caseId);
    setEl('adv-target-num', targetNum);

    if (records.length === 0) {
      setEl('adv-active-days', '0 Days');
      setEl('adv-total-calls', '0 Total');
      setEl('adv-unique-contacts', '0 Contacts');
      setEl('adv-unique-imeis', '0 IMEIs / 0 IMSIs');
      return;
    }

    // Calculate metrics
    const totalCount = records.length;
    let callsCount = 0;
    let smsCount = 0;
    const bParties = new Set();
    const imeis = new Set();
    const imsis = new Set();
    const dates = new Set();

    records.forEach(r => {
      if (r.callType === 'SMS') smsCount++; else callsCount++;
      if (r.bPartyNumber) bParties.add(r.bPartyNumber);
      if (r.imei) imeis.add(r.imei);
      if (r.imsi) imsis.add(r.imsi);
      if (r.date) dates.add(r.date);
    });

    setEl('adv-active-days', ${dates.size} Days);
    setEl('adv-total-calls', ${totalCount.toLocaleString()} Total);
    setEl('adv-unique-contacts', ${bParties.size} Contacts);
    setEl('adv-unique-imeis', ${imeis.size} IMEIs /  IMSIs);
  },

  renderHourlyChart: function() {
    const records = window.CDRDataStore.cdrRecords || [];
    const hourlyCounts = new Array(24).fill(0);

    records.forEach(r => {
      const h = typeof r.hour === 'number' ? r.hour : 0;
      if (h >= 0 && h < 24) hourlyCounts[h]++;
    });

    const ctx = document.getElementById('chart-hourly-distribution');
    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Array.from({ length: 24 }, (_, i) => ${i.toString().padStart(2, '0')}:00),
        datasets: [{
          label: 'Call Volume',
          data: hourlyCounts,
          backgroundColor: 'rgba(6, 186, 212, 0.6)',
          borderColor: '#06b6d4',
          borderWidth: 1,
          borderRadius: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => Call Volume:  events
            }
          }
        },
        scales: {
          x: { ticks: { color: '#94a3b8', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
        }
      }
    });
  }
};