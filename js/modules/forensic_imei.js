/* ==========================================================================
   MODULE: IMEI & IMSI FORENSIC INTELLIGENCE
   ========================================================================== */

window.ForensicIMEIModule = {
  init: function() {
    this.bindEvents();
    this.inspectIMEI('864201041234568'); // Trigger initial inspection with check-digit error
  },

  bindEvents: function() {
    const btn = document.getElementById('btn-fix-imei');
    if (btn) {
      btn.onclick = () => {
        const val = document.getElementById('imei-fixer-input').value.trim();
        this.inspectIMEI(val);
      };
    }
  },

  inspectIMEI: function(rawIMEI) {
    const resultBox = document.getElementById('imei-fix-result');
    if (!resultBox) return;

    const res = window.CDRDataStore.fixIMEI(rawIMEI);
    const statusClass = res.isValid ? 'valid' : 'invalid';
    const statusLabel = res.isValid ? '<i class="fa-solid fa-check"></i> Valid Luhn Check Digit' : '<i class="fa-solid fa-triangle-exclamation"></i> Check-Digit Mismatch Error (Fixed)';

    resultBox.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <span class="text-muted" style="font-size:0.75rem;">Original Input IMEI:</span>
          <div class="text-mono" style="font-size:1.1rem;">${res.originalIMEI}</div>
        </div>
        <span class="luhn-status ${statusClass}">${statusLabel}</span>
      </div>

      <div style="background:rgba(15,23,42,0.9); padding:0.8rem; border-radius:6px; border:1px solid var(--border-color);">
        <div style="font-size:0.8rem; color:var(--text-muted);">Luhn Auto-Corrected 15-Digit IMEI:</div>
        <div class="text-mono text-cyan" style="font-size:1.2rem; font-weight:700;">${res.fixedIMEI}</div>
      </div>

      <div class="grid-2" style="font-size:0.85rem;">
        <div><strong>TAC Allocation Code (First 8):</strong> <span class="text-mono text-amber">${res.tac}</span></div>
        <div><strong>Identified Device Brand:</strong> <strong class="text-green">${res.brand}</strong></div>
        <div style="grid-column: span 2;"><strong>Identified Model Name:</strong> <strong style="font-size:1rem; color:#fff;">${res.model}</strong></div>
      </div>
    `;

    window.App.showToast(`IMEI Forensic Analysis Complete for ${res.fixedIMEI}`, 'success');
  }
};
