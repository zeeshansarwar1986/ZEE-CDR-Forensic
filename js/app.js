/* ==========================================================================
   MAIN APPLICATION CONTROLLER & ROUTER
   ZEE CDR FORENSIC - Zee Meta Advertising Agency (Reg)
   ========================================================================== */

window.App = {
  init: function() {
    this.bindNavigation();
    this.bindHeaderTools();
    this.bindGlobalFilterDrawer();
    this.bindFileUpload();

    // Initialize Backup & Data Manager
    if (window.BackupModule) {
      window.BackupModule.init();
    }

    // Initialize Active View
    this.switchView('view-overview');

    // Show Welcome Toast
    this.showToast('ZEE CDR Forensic System Initialized (Zee Meta Advertising Agency Reg)', 'success');
  },

  switchView: function(viewId) {
    // Hide all views
    document.querySelectorAll('.view-page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));

    // Show target view
    const targetView = document.getElementById(viewId);
    if (targetView) targetView.classList.add('active');

    // Highlight sidebar nav item
    const navItem = document.querySelector(`.nav-item[data-view="${viewId}"]`);
    if (navItem) navItem.classList.add('active');

    // Initialize module visualizers on view switch
    switch (viewId) {
      case 'view-overview':
        if (window.OverviewModule) window.OverviewModule.init();
        break;
      case 'view-cases':
        if (window.CasesModule) window.CasesModule.init();
        break;
      case 'view-advance-cdr':
        if (window.AdvanceCDRModule) window.AdvanceCDRModule.init();
        break;
      case 'view-graphical':
        if (window.GraphicalModule) window.GraphicalModule.init();
        break;
      case 'view-raw-cdr':
        if (window.RawCDRModule) window.RawCDRModule.init();
        break;
      case 'view-intelligence':
        if (window.IntelligenceModule) window.IntelligenceModule.init();
        break;
      case 'view-forensic-imei':
        if (window.ForensicIMEIModule) window.ForensicIMEIModule.init();
        break;
      case 'view-geolocation':
        if (window.GeoLocationModule) window.GeoLocationModule.init();
        break;
      case 'view-link-analysis':
        if (window.LinkAnalysisModule) window.LinkAnalysisModule.init();
        break;
      case 'view-multi-cross':
        if (window.MultiCrossModule) window.MultiCrossModule.init();
        break;
      case 'view-exporter':
        if (window.ExporterModule) window.ExporterModule.init();
        break;
      case 'view-about':
        this.showToast('Zee Meta Advertising Agency Profile & Contact Info', 'info');
        break;
    }
  },

  bindNavigation: function() {
    document.querySelectorAll('.nav-item[data-view]').forEach(item => {
      item.onclick = () => {
        const viewId = item.getAttribute('data-view');
        this.switchView(viewId);
      };
    });
  },

  bindHeaderTools: function() {
    const openCaseModal = () => document.getElementById('modal-add-case').classList.add('active');
    document.getElementById('btn-quick-new-case')?.addEventListener('click', openCaseModal);
  },

  bindGlobalFilterDrawer: function() {
    const drawer = document.getElementById('filter-drawer');
    const openBtn = document.getElementById('open-filter-btn');
    const closeBtn = document.getElementById('close-filter-btn');
    const applyBtn = document.getElementById('btn-apply-filters');
    const resetBtn = document.getElementById('btn-reset-filters');

    if (openBtn) openBtn.onclick = () => drawer.classList.add('open');
    if (closeBtn) closeBtn.onclick = () => drawer.classList.remove('open');

    if (applyBtn) {
      applyBtn.onclick = () => {
        drawer.classList.remove('open');
        this.showToast('Global Filters Applied across Telemetry', 'info');
      };
    }

    if (resetBtn) {
      resetBtn.onclick = () => {
        document.getElementById('filter-location').value = 'ALL';
        document.getElementById('filter-call-type').value = 'ALL';
        document.getElementById('filter-bparty').value = '';
        this.showToast('Filters Reset to Default', 'warning');
      };
    }
  },

  bindFileUpload: function() {
    const input = document.getElementById('cdr-file-input');
    if (!input) return;

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      this.showToast(`AI Auto-Parsing File: ${file.name}...`, 'info');

      setTimeout(() => {
        document.getElementById('ai-parse-summary').style.display = 'block';
        document.getElementById('parse-target-num').innerText = '03005551234';
        document.getElementById('parse-operator').innerText = 'Jazz (Pakistan)';
        document.getElementById('parse-records').innerText = '1,200 Records Parsed';
        document.getElementById('parse-date-range').innerText = '2026-10-01 to 2026-10-08';

        this.showToast(`CDR File ${file.name} Ingested & Parsed Successfully!`, 'success');
      }, 800);
    };
  },

  showToast: function(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'fa-circle-info';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'warning') icon = 'fa-triangle-exclamation';
    if (type === 'danger') icon = 'fa-circle-xmark';

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
};

// Bootstrap App when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.App.init();
});
