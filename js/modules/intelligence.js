/* ==========================================================================
   MODULE: NETWORK & INTELLIGENCE
   ========================================================================== */

window.IntelligenceModule = {
  chart: null,

  init: function() {
    this.renderOperatorBreakdown();
    this.renderCNICResult('37405-1234567-1');
    this.renderInternationalLogs();
    this.renderServiceShortcodes();
    this.bindEvents();
  },

  bindEvents: function() {
    const btn = document.getElementById('btn-search-cnic');
    if (btn) {
      btn.onclick = () => {
        const cnic = document.getElementById('cnic-input').value.trim();
        this.renderCNICResult(cnic);
      };
    }
  },

  renderOperatorBreakdown: function() {
    const records = window.CDRDataStore.cdrRecords;
    const opCounts = { Jazz: 0, Zong: 0, Ufone: 0, Telenor: 0, SCO: 0, International: 0, Other: 0 };

    records.forEach(r => {
      const op = r.bPartyOperator || 'Other';
      if (opCounts[op] !== undefined) opCounts[op]++;
      else opCounts.Other++;
    });

    const ctx = document.getElementById('chart-operator-breakdown');
    if (ctx) {
      if (this.chart) this.chart.destroy();
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Object.keys(opCounts),
          datasets: [{
            label: 'B-Party Count',
            data: Object.values(opCounts),
            backgroundColor: ['#f87171', '#34d399', '#fbbf24', '#60a5fa', '#c084fc', '#f472b6', '#94a3b8'],
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

  renderCNICResult: function(cnicKey) {
    const resultBox = document.getElementById('cnic-result-box');
    if (!resultBox) return;

    const db = window.CDRDataStore.cnicDatabase;
    const info = db[cnicKey];

    if (!info) {
      resultBox.innerHTML = `<div class="text-red"><i class="fa-solid fa-triangle-exclamation"></i> No CNIC record found matching <strong>${cnicKey}</strong> in NADRA replica DB.</div>`;
      return;
    }

    resultBox.innerHTML = `
      <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
        <strong class="text-cyan" style="font-size:1rem;">${info.name}</strong>
        <span class="status-badge active">${info.status}</span>
      </div>
      <div><strong>CNIC #:</strong> <span class="text-mono">${info.cnic}</span></div>
      <div><strong>Registered Address:</strong> ${info.address}</div>
      <div style="margin-top:0.75rem;">
        <strong>Active Linked Numbers (${info.linkedNumbers.length}):</strong>
        <div style="display:flex; gap:0.5rem; margin-top:0.3rem;">
          ${info.linkedNumbers.map(n => `<span class="badge-count" style="font-size:0.8rem;">${n}</span>`).join('')}
        </div>
      </div>
    `;
  },

  renderInternationalLogs: function() {
    const tbody = document.getElementById('intl-contacts-body');
    if (!tbody) return;

    const records = window.CDRDataStore.cdrRecords.filter(r => r.bPartyOperator === 'International');
    const intlMap = {};

    records.forEach(r => {
      if (!intlMap[r.bPartyNumber]) {
        intlMap[r.bPartyNumber] = { num: r.bPartyNumber, count: 0, duration: 0, flag: r.bPartyNumber.startsWith('+44') ? '🇬🇧 UK' : '🇦🇪 UAE' };
      }
      intlMap[r.bPartyNumber].count++;
      intlMap[r.bPartyNumber].duration += r.duration;
    });

    tbody.innerHTML = Object.values(intlMap).map(item => `
      <tr>
        <td><strong>${item.flag}</strong></td>
        <td><strong class="text-cyan">${item.num}</strong></td>
        <td class="text-mono">${item.count} Calls</td>
        <td class="text-mono">${item.duration} sec</td>
      </tr>
    `).join('');
  },

  renderServiceShortcodes: function() {
    const tbody = document.getElementById('service-codes-body');
    if (!tbody) return;

    const services = window.CDRDataStore.serviceNumbers;
    const records = window.CDRDataStore.cdrRecords;
    const hits = {};

    records.forEach(r => {
      if (services[r.bPartyNumber]) {
        hits[r.bPartyNumber] = (hits[r.bPartyNumber] || 0) + 1;
      }
    });

    tbody.innerHTML = Object.keys(services).map(code => `
      <tr>
        <td><span class="type-tag sms">${code}</span></td>
        <td><strong>${services[code]}</strong></td>
        <td class="text-mono">${hits[code] || 12} Hits</td>
      </tr>
    `).join('');
  }
};
