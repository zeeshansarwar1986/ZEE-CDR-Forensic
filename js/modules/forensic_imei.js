/* ==========================================================================
   MODULE: IMEI & IMSI FORENSIC INTELLIGENCE
   ========================================================================== */

window.ForensicIMEIModule = {
  eventsBound: false,

  init: function() {
    this.bindEvents();
    this.inspectIMEI('864201041234568', false); // Initial inspection without popup toast
  },

  bindEvents: function() {
    if (this.eventsBound) return;
    this.eventsBound = true;

    const btn = document.getElementById('btn-fix-imei');
    const input = document.getElementById('imei-fixer-input');

    if (btn && input) {
      btn.onclick = () => {
        const val = input.value.trim();
        this.inspectIMEI(val, true);
      };

      input.onkeypress = (e) => {
        if (e.key === 'Enter') {
          const val = input.value.trim();
          this.inspectIMEI(val, true);
        }
      };
    }
  },

  inspectIMEI: function(rawIMEI, showUserToast = true) {
    const resultBox = document.getElementById('imei-fix-result');
    if (!resultBox) return;

    const res = window.CDRDataStore.fixIMEI(rawIMEI);
    const statusClass = res.isValid ? 'valid' : 'invalid';
    const statusLabel = res.isValid ? '<i class="fa-solid fa-check"></i> Valid Luhn Check Digit' : '<i class="fa-solid fa-triangle-exclamation"></i> Check-Digit Mismatch Error (Fixed)';

    resultBox.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
        <div>
          <span class="text-muted" style="font-size:0.75rem;">Original Input IMEI:</span>
          <div class="text-mono" style="font-size:1.1rem; color:#fff;">${res.originalIMEI}</div>
        </div>
        <span class="luhn-status ${statusClass}">${statusLabel}</span>
      </div>

      <div style="background:rgba(13,33,55,0.9); padding:0.85rem 1rem; border-radius:6px; border:1px solid var(--border-color); margin-bottom:1rem;">
        <div style="font-size:0.8rem; color:var(--text-muted);">Luhn Auto-Corrected 15-Digit IMEI:</div>
        <div class="text-mono text-cyan-bright" style="font-size:1.25rem; font-weight:700;">${res.fixedIMEI}</div>
      </div>

      <div class="metrics-8-grid" style="grid-template-columns: 1fr 1fr 2fr; gap:0.75rem; font-size:0.85rem;">
        <div style="background:rgba(4,12,26,0.6); padding:0.75rem; border-radius:6px; border:1px solid rgba(255,255,255,0.05);">
          <div class="text-muted" style="font-size:0.75rem;">TAC Allocation Code (First 8):</div>
          <div class="text-mono text-amber" style="font-size:1rem; font-weight:600;">${res.tac}</div>
        </div>
        <div style="background:rgba(4,12,26,0.6); padding:0.75rem; border-radius:6px; border:1px solid rgba(255,255,255,0.05);">
          <div class="text-muted" style="font-size:0.75rem;">Identified Device Brand:</div>
          <div class="text-green" style="font-size:1rem; font-weight:600;">${res.brand}</div>
        </div>
        <div style="background:rgba(4,12,26,0.6); padding:0.75rem; border-radius:6px; border:1px solid rgba(255,255,255,0.05);">
          <div class="text-muted" style="font-size:0.75rem;">Identified Model Name:</div>
          <div style="font-size:1rem; font-weight:600; color:#fff;">${res.model}</div>
        </div>
      </div>
    `;

    if (showUserToast && window.App && window.App.showToast) {
      window.App.showToast(`IMEI Forensic Analysis Complete for ${res.fixedIMEI}`, 'success');
    }
  }
};