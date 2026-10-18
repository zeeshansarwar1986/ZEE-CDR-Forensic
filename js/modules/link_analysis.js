/* ==========================================================================
   MODULE: LINK ANALYSIS (i2 STYLE NODE DIAGRAM)
   ========================================================================== */

window.LinkAnalysisModule = {
  network: null,
  eventsBound: false,

  init: function() {
    this.renderNetwork();
    this.bindEvents();
  },

  renderNetwork: function() {
    const container = document.getElementById('network-container');
    if (!container || typeof vis === 'undefined') return;

    const records = window.CDRDataStore.cdrRecords || [];
    const targetNum = window.CDRDataStore.activeTargetNumber || '03005551234';

    // Aggregate B-party counts
    const contactCounts = {};
    records.forEach(r => {
      if (r.bPartyNumber) {
        contactCounts[r.bPartyNumber] = (contactCounts[r.bPartyNumber] || 0) + 1;
      }
    });

    const nodesArray = [
      { id: targetNum, label: `TARGET A\n${targetNum}`, shape: 'ellipse', color: { background: '#007bff', border: '#00a8ff' }, font: { color: '#fff', size: 14, bold: true }, size: 28 },
      { id: '03129876543', label: `Shahbaz Ahmed\n03129876543`, shape: 'ellipse', color: { background: '#10b981', border: '#34d399' }, font: { color: '#fff', size: 12 } },
      { id: '03335112233', label: `Bilal Hassan\n03335112233`, shape: 'ellipse', color: { background: '#f59e0b', border: '#fbbf24' }, font: { color: '#fff' } },
      { id: '03455998877', label: `Rashid Khan\n03455998877`, shape: 'ellipse', color: { background: '#8b5cf6', border: '#c084fc' }, font: { color: '#fff' } },
      { id: '+447911123456', label: `London Handler\n+447911123456`, shape: 'diamond', color: { background: '#ec4899', border: '#f472b6' }, font: { color: '#fff' } },
      { id: '+971501234567', label: `Dubai Coord\n+971501234567`, shape: 'diamond', color: { background: '#ec4899', border: '#f472b6' }, font: { color: '#fff' } },
      { id: '3737', label: `JazzCash Wallet\n3737`, shape: 'box', color: { background: '#64748b', border: '#94a3b8' }, font: { color: '#fff' } },
      { id: 'IMEI-864201041234567', label: `IMEI: iPhone 14 Pro`, shape: 'triangle', color: { background: '#06b6d4', border: '#67e8f9' }, font: { color: '#fff' } }
    ];

    const edgesArray = [
      { from: targetNum, to: '03129876543', label: `${contactCounts['03129876543'] || 284} calls`, width: 4, color: { color: '#00a8ff' } },
      { from: targetNum, to: '03335112233', label: `${contactCounts['03335112233'] || 140} calls`, width: 2, color: { color: '#f59e0b' } },
      { from: targetNum, to: '03455998877', label: `${contactCounts['03455998877'] || 95} calls`, width: 2, color: { color: '#8b5cf6' } },
      { from: targetNum, to: '+447911123456', label: `Intl Call (42m)`, width: 3, color: { color: '#ec4899' } },
      { from: targetNum, to: '+971501234567', label: `Intl Call (18m)`, width: 2, color: { color: '#ec4899' } },
      { from: targetNum, to: '3737', label: `12 Txns`, width: 1, color: { color: '#64748b' } },
      { from: targetNum, to: 'IMEI-864201041234567', label: `Primary Handset`, width: 2, color: { color: '#06b6d4' } },
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

    if (this.network) {
      this.network.destroy();
      this.network = null;
    }

    this.network = new vis.Network(container, data, options);

    // Node click handler
    this.network.on('click', (params) => {
      if (params.nodes && params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        this.openNodeInspection(nodeId);
      }
    });
  },

  bindEvents: function() {
    if (this.eventsBound) return;
    this.eventsBound = true;

    const closeBtn = document.getElementById('close-node-panel-btn');
    if (closeBtn) {
      closeBtn.onclick = () => {
        const panel = document.getElementById('node-detail-panel');
        if (panel) panel.classList.remove('open');
      };
    }
  },

  openNodeInspection: function(nodeId) {
    const panel = document.getElementById('node-detail-panel');
    const content = document.getElementById('node-panel-content');
    if (!panel || !content) return;

    const records = (window.CDRDataStore.cdrRecords || []).filter(r => r.bPartyNumber === nodeId || r.targetNumber === nodeId);

    content.innerHTML = `
      <div style="background:rgba(13,33,55,0.9); padding:0.85rem 1rem; border-radius:8px; border:1px solid var(--border-color); margin-bottom:1rem;">
        <div style="font-size:0.75rem;" class="text-muted">Selected Node Identifier:</div>
        <div class="text-cyan-bright text-mono" style="font-size:1.15rem; font-weight:700;">${nodeId}</div>
        <div style="margin-top:0.4rem; font-size:0.85rem;"><strong>Total Call Hits:</strong> <span class="badge-count">${records.length} interactions</span></div>
      </div>

      <h4 class="text-amber" style="margin-bottom:0.5rem; font-size:0.85rem;"><i class="fa-solid fa-list-check"></i> Interaction Timeline Logs:</h4>
      <div style="display:flex; flex-direction:column; gap:0.5rem; max-height:280px; overflow-y:auto;">
        ${records.length > 0 ? records.slice(0, 8).map(r => `
          <div style="padding:0.5rem; background:rgba(4,12,26,0.8); border-radius:6px; border-left:3px solid var(--accent-blue-bright); font-size:0.78rem;">
            <div style="font-size:0.72rem;" class="text-muted"><i class="fa-regular fa-clock"></i> ${r.timestamp}</div>
            <div style="margin-top:2px;"><strong>Type:</strong> <span class="type-tag ${r.callType.toLowerCase()}">${r.callType}</span> | <strong>Duration:</strong> ${r.duration}s</div>
            <div style="font-size:0.72rem; color:var(--text-muted); margin-top:2px;"><strong>Tower:</strong> ${r.locationName}</div>
          </div>
        `).join('') : '<div class="text-muted" style="font-size:0.8rem; padding:0.5rem;">No direct raw CDR rows in current filter.</div>'}
      </div>
    `;

    panel.classList.add('open');
  }
};