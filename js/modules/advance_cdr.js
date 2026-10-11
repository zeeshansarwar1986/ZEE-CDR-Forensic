/* ==========================================================================
   MODULE: ADVANCE CDR ANALYSIS
   ========================================================================== */

window.AdvanceCDRModule = {
  chart: null,

  init: function() {
    this.renderTelemetry();
    this.renderHourlyChart();
  },

  renderTelemetry: function() {
    const records = window.CDRDataStore.cdrRecords;
    if (!records || records.length === 0) return;

    const targetNum = window.CDRDataStore.activeTargetNumber;
    const targetOp = window.CDRDataStore.getOperator(targetNum);

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
      bParties.add(r.bPartyNumber);
      imeis.add(r.imei);
      imsis.add(r.imsi);
      dates.add(r.date);
    });

    document.getElementById('adv-target-num').innerText = targetNum;
    document.getElementById('adv-active-days').innerText = `${dates.size} Days`;
    document.getElementById('adv-total-calls').innerText = `${totalCount.toLocaleString()} Total`;
    document.getElementById('adv-unique-contacts').innerText = `${bParties.size} Contacts`;
    document.getElementById('adv-unique-imeis').innerText = `${imeis.size} IMEIs / ${imsis.size} IMSIs`;
  },

  renderHourlyChart: function() {
    const records = window.CDRDataStore.cdrRecords;
    const hourlyCounts = new Array(24).fill(0);

    records.forEach(r => {
      const h = r.hour || 0;
      hourlyCounts[h]++;
    });

    const ctx = document.getElementById('chart-hourly-distribution');
    if (ctx) {
      if (this.chart) this.chart.destroy();
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Array.from({length: 24}, (_, i) => `${i.toString().padStart(2, '0')}:00`),
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
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: '#94a3b8', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
            y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
          }
        }
      });
    }
  }
};
