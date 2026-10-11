/* ==========================================================================
   MODULE: LINK ANALYSIS (i2 STYLE NODE DIAGRAM)
   ========================================================================== */

window.LinkAnalysisModule = {
  network: null,

  init: function() {
    this.renderNetwork();
    this.bindEvents();
  },

  renderNetwork: function() {
    const container = document.getElementById('network-container');
    if (!container) return;

    const records = window.CDRDataStore.cdrRecords;
    const targetNum = window.CDRDataStore.activeTargetNumber;

    // Aggregate B-party counts
    const contactCounts = {};
    records.forEach(r => {
      contactCounts[r.bPartyNumber] = (contactCounts[r.bPartyNumber] || 0) + 1;
    });

    const nodesArray = [
      { id: targetNum, label: `TARGET A\n${targetNum}`, shape: 'ellipse', color: { background: '#3b82f6', border: '#60a5fa' }, font: { color: '#fff', size: 14, bold: true }, size: 25 },
      { id: '03129876543', label: `Shahbaz Ahmed\n03129876543`, shape: 'ellipse', color: { background: '#10b981', border: '#34d399' }, font: { color: '#fff', size: 12 } },
      { id: '03335112233', label: `Bilal Hassan\n03335112233`, shape: 'ellipse', color: { background: '#f59e0b', border: '#fbbf24' }, font: { color: '#fff' } },
      { id: '03455998877', label: `Rashid Khan\n03455998877`, shape: 'ellipse', color: { background: '#8b5cf6', border: '#c084fc' }, font: { color: '#fff' } },
      { id: '+447911123456', label: `London Handler\n+447911123456`, shape: 'diamond', color: { background: '#ec4899', border: '#f472b6' }, font: { color: '#fff' } },
      { id: '+971501234567', label: `Dubai Coord\n+971501234567`, shape: 'diamond', color: { background: '#ec4899', border: '#f472b6' }, font: { color: '#fff' } },
      { id: '3737', label: `JazzCash Wallet\n3737`, shape: 'box', color: { background: '#64748b', border: '#94a3b8' }, font: { color: '#fff' } },
      { id: 'IMEI-864201041234567', label: `IMEI: iPhone 14`, shape: 'triangle', color: { background: '#06b6d4', border: '#67e8f9' }, font: { color: '#fff' } }
    ];

    const edgesArray = [
      { from: targetNum, to: '03129876543', label: `${contactCounts['03129876543'] || 284} calls`, width: 4, color: { color: '#3b82f6' } },
      { from: targetNum, to: '03335112233', label: `${contactCounts['03335112233'] || 140} calls`, width: 2, color: { color: '#f59e0b' } },
      { from: targetNum, to: '03455998877', label: `${contactCounts['03455998877'] || 95} calls`, width: 2, color: { color: '#8b5cf6' } },
      { from: targetNum, to: '+447911123456', label: `Intl Call (42m)`, width: 3, color: { color: '#ec4899' } },
      { from: targetNum, to: '+971501234567', label: `Intl Call (18m)`, width: 2, color: { color: '#ec4899' } },
      { from: targetNum, to: '3737', label: `12 Txns`, width: 1, color: { color: '#64748b' } },
      { from: targetNum, to: 'IMEI-864201041234567', label: `Primary SIM Device`, width: 2, color: { color: '#06b6d4' } },
      { from: '03129876543', to: '03335112233', label: `Shared (18 calls)`, width: 1, color: { color: '#10b981' }, dashes: true }
    ];

    const data = {
      nodes: new vis.DataSet(nodesArray),
      edges: new vis.DataSet(edgesArray)
    };

    const options = {
      physics: {
        stabilization: true,
        barnesHut: { gravitationalConstant: -3000, springLength: 120 }
      },
      nodes: {
        borderWidth: 2,
        shadow: true
      },
      edges: {
        smooth: { type: 'continuous' }
      }
    };

    this.network = new vis.Network(container, data, options);

    // Node click handler
    this.network.on('click', (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        this.openNodeInspection(nodeId);
      }
    });
  },

  bindEvents: function() {
    const closeBtn = document.getElementById('close-node-panel-btn');
    if (closeBtn) {
      closeBtn.onclick = () => {
        document.getElementById('node-detail-panel').classList.remove('open');
      };
    }
  },

  openNodeInspection: function(nodeId) {
    const panel = document.getElementById('node-detail-panel');
    const content = document.getElementById('node-panel-content');
    if (!panel || !content) return;

    const records = window.CDRDataStore.cdrRecords.filter(r => r.bPartyNumber === nodeId || r.targetNumber === nodeId);

    content.innerHTML = `
      <div style="background:rgba(30,41,59,0.8); padding:1rem; border-radius:8px; border:1px solid var(--border-color); margin-bottom:1rem;">
        <div style="font-size:0.75rem;" class="text-muted">Selected Identifier:</div>
        <div class="text-cyan text-mono" style="font-size:1.15rem; font-weight:700;">${nodeId}</div>
        <div style="margin-top:0.4rem;"><strong>Total Call Hits:</strong> ${records.length} interactions</div>
      </div>

      <h4 class="text-amber" style="margin-bottom:0.5rem;">Recent Interaction Log:</h4>
      <div style="display:flex; flex-direction:column; gap:0.5rem; max-height:300px; overflow-y:auto;">
        ${records.slice(0, 8).map(r => `
          <div style="padding:0.5rem; background:rgba(15,23,42,0.8); border-radius:4px; border-left:3px solid var(--accent-blue);">
            <div style="font-size:0.75rem;" class="text-muted">${r.timestamp}</div>
            <div><strong>Type:</strong> ${r.callType} | <strong>Duration:</strong> ${r.duration}s</div>
            <div style="font-size:0.75rem;"><strong>Location:</strong> ${r.locationName}</div>
          </div>
        `).join('')}
      </div>
    `;

    panel.classList.add('open');
  }
};
