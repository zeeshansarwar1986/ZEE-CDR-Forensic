/* ==========================================================================
   MODULE: DATA BACKUP, RESTORE & RESET CENTER
   ZEE CDR FORENSIC - Zee Meta Advertising Agency (Reg)
   Provides:
   - Full JSON Database Backup Download
   - Backup Upload & Live Restoration
   - Complete Data Reset / Wipe
   - Factory Demo Data Re-Load
   ========================================================================== */

window.BackupModule = {
  selectedFile: null,

  init: function() {
    this.bindEvents();
    // Check if user has saved data in localStorage, load if available
    this.loadFromStorage();
    this.updateStats();
  },

  openModal: function() {
    const modal = document.getElementById('modal-backup-reset');
    if (modal) {
      modal.classList.add('active');
      this.updateStats();
    }
  },

  closeModal: function() {
    const modal = document.getElementById('modal-backup-reset');
    if (modal) {
      modal.classList.remove('active');
    }
  },

  updateStats: function() {
    const cases = window.CDRDataStore.cases || [];
    const records = window.CDRDataStore.cdrRecords || [];

    const caseCountEl = document.getElementById('backup-stat-cases');
    const recordCountEl = document.getElementById('backup-stat-records');
    const sizeEl = document.getElementById('backup-stat-size');

    if (caseCountEl) caseCountEl.innerText = cases.length;
    if (recordCountEl) recordCountEl.innerText = records.length.toLocaleString();

    // Estimate size in KB
    try {
      const dataStr = JSON.stringify({ cases, records });
      const sizeKB = (new TextEncoder().encode(dataStr).length / 1024).toFixed(1);
      if (sizeEl) sizeEl.innerText = `${sizeKB} KB`;
    } catch (e) {
      if (sizeEl) sizeEl.innerText = '0 KB';
    }
  },

  // 1. Download Backup as JSON
  downloadBackup: function() {
    try {
      const backupPackage = {
        app: 'ZEE CDR Forensic',
        agency: 'Zee Meta Advertising Agency (Reg)',
        version: '5.2.0',
        exportedAt: new Date().toISOString(),
        currentCaseId: window.CDRDataStore.currentCaseId || '',
        activeTargetNumber: window.CDRDataStore.activeTargetNumber || '',
        cases: window.CDRDataStore.cases || [],
        cdrRecords: window.CDRDataStore.cdrRecords || [],
        usageStats: window.CDRDataStore.usageStats || {},
        cnicDatabase: window.CDRDataStore.cnicDatabase || {},
        serviceNumbers: window.CDRDataStore.serviceNumbers || {},
        tacDatabase: window.CDRDataStore.tacDatabase || {}
      };

      const jsonStr = JSON.stringify(backupPackage, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);
      const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '-');
      const filename = `ZEE_CDR_Forensic_Backup_${dateStr}_${timeStr}.json`;

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (window.App && window.App.showToast) {
        window.App.showToast(`ڈیٹا بیک اپ کامیابی سے ڈاؤنلوڈ ہو گیا: ${filename}`, 'success');
      }
    } catch (err) {
      console.error('Backup download error:', err);
      if (window.App && window.App.showToast) {
        window.App.showToast('بیک اپ ڈاؤنلوڈ کرنے میں مسئلہ پیش آیا', 'danger');
      }
    }
  },

  // 2. Select file for restore
  handleFileSelect: function(file) {
    if (!file) return;
    this.selectedFile = file;

    const nameEl = document.getElementById('backup-file-selected-name');
    const restoreBtn = document.getElementById('btn-restore-backup');

    if (nameEl) {
      nameEl.style.display = 'block';
      nameEl.innerHTML = `<i class="fa-solid fa-file-code text-cyan-bright"></i> منتخب کردہ فائل: <strong>${file.name}</strong> (${(file.size / 1024).toFixed(1)} KB)`;
    }
    if (restoreBtn) {
      restoreBtn.disabled = false;
      restoreBtn.style.opacity = '1';
      restoreBtn.classList.add('primary');
    }
  },

  // 3. Restore Backup from JSON
  restoreBackup: function() {
    if (!this.selectedFile) {
      if (window.App && window.App.showToast) {
        window.App.showToast('براہ کرم پہلے بیک اپ (.json) فائل منتخب کریں', 'warning');
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = JSON.parse(e.target.result);

        if (!content || (!content.cases && !content.cdrRecords)) {
          throw new Error('غلط فائل فارمیٹ! یہ ایک مستند ZEE CDR بیک اپ فائل نہیں ہے۔');
        }

        if (Array.isArray(content.cases)) {
          window.CDRDataStore.cases = content.cases;
        }
        if (Array.isArray(content.cdrRecords)) {
          window.CDRDataStore.cdrRecords = content.cdrRecords;
        }
        if (content.usageStats) {
          window.CDRDataStore.usageStats = content.usageStats;
        }
        if (content.cnicDatabase) {
          window.CDRDataStore.cnicDatabase = content.cnicDatabase;
        }
        if (content.serviceNumbers) {
          window.CDRDataStore.serviceNumbers = content.serviceNumbers;
        }
        if (content.activeTargetNumber) {
          window.CDRDataStore.activeTargetNumber = content.activeTargetNumber;
        }
        if (content.currentCaseId) {
          window.CDRDataStore.currentCaseId = content.currentCaseId;
        }

        // Persist to LocalStorage
        this.saveToStorage();

        // Refresh all application views
        this.refreshApplication();
        this.updateStats();

        if (window.App && window.App.showToast) {
          window.App.showToast(`بیک اپ کامیابی سے بحال ہو گیا! (${(content.cases || []).length} کیسز، ${(content.cdrRecords || []).length} ریکارڈز)`, 'success');
        }

        this.closeModal();
      } catch (err) {
        console.error('Restore error:', err);
        alert('بیک اپ فائل پڑھنے میں خرابی: ' + err.message);
      }
    };
    reader.readAsText(this.selectedFile);
  },

  // 4. Reset & Clear All Data
  resetAllData: function() {
    const confirmed = confirm("کیا آپ واقعی تمام ڈیٹا ریسیٹ / صاف کرنا چاہتے ہیں؟\n\nاس عمل سے تمام رجسٹرڈ کیسز اور سی ڈی آر ریکارڈز ختم ہو جائیں گے۔\n(Are you sure you want to completely wipe all CDR records and cases?)");
    if (!confirmed) return;

    // Clear memory stores
    window.CDRDataStore.cases = [];
    window.CDRDataStore.cdrRecords = [];
    window.CDRDataStore.currentCaseId = '';
    window.CDRDataStore.activeTargetNumber = '';
    window.CDRDataStore.usageStats = {
      totalCases: 0,
      activeCases: 0,
      pendingCases: 0,
      completedCases: 0,
      totalCDRsUploaded: 0,
      totalRecordsParsed: 0,
      openingFrequency: [0, 0, 0, 0, 0, 0, 0],
      dailyAnalytics: [0, 0, 0, 0, 0, 0, 0]
    };

    // Remove from localStorage
    localStorage.removeItem('ZEE_CDR_FORENSIC_DB');

    // Refresh UI
    this.refreshApplication();
    this.updateStats();

    if (window.App && window.App.showToast) {
      window.App.showToast('تمام ڈیٹا صاف اور ریسیٹ کر دیا گیا ہے (All Data Cleared & Reset)', 'warning');
    }
  },

  // 5. Restore Default Demo Data
  restoreDemoData: function() {
    if (window.CDRDataStore.reloadDefaultDemoData) {
      window.CDRDataStore.reloadDefaultDemoData();
    }
    this.saveToStorage();
    this.refreshApplication();
    this.updateStats();

    if (window.App && window.App.showToast) {
      window.App.showToast('ڈیمو ڈیٹا کامیابی سے دوبارہ لوڈ کر دیا گیا (Demo Data Restored)', 'success');
    }
  },

  saveToStorage: function() {
    try {
      const dataToSave = {
        cases: window.CDRDataStore.cases,
        cdrRecords: window.CDRDataStore.cdrRecords,
        usageStats: window.CDRDataStore.usageStats,
        cnicDatabase: window.CDRDataStore.cnicDatabase,
        currentCaseId: window.CDRDataStore.currentCaseId,
        activeTargetNumber: window.CDRDataStore.activeTargetNumber
      };
      localStorage.setItem('ZEE_CDR_FORENSIC_DB', JSON.stringify(dataToSave));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  },

  loadFromStorage: function() {
    try {
      const saved = localStorage.getItem('ZEE_CDR_FORENSIC_DB');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Automatically purge obsolete demo mockup cache
        if (parsed.currentCaseId === 'CR-2026-8841' && parsed.activeTargetNumber === '03005551234') {
          localStorage.removeItem('ZEE_CDR_FORENSIC_DB');
          return false;
        }
        if (Array.isArray(parsed.cases)) window.CDRDataStore.cases = parsed.cases;
        if (Array.isArray(parsed.cdrRecords)) window.CDRDataStore.cdrRecords = parsed.cdrRecords;
        if (parsed.usageStats) window.CDRDataStore.usageStats = parsed.usageStats;
        if (parsed.cnicDatabase) window.CDRDataStore.cnicDatabase = parsed.cnicDatabase;
        if (parsed.currentCaseId) window.CDRDataStore.currentCaseId = parsed.currentCaseId;
        if (parsed.activeTargetNumber) window.CDRDataStore.activeTargetNumber = parsed.activeTargetNumber;
        return true;
      }
    } catch (e) {
      console.warn('LocalStorage load failed:', e);
    }
    return false;
  },

  refreshApplication: function() {
    // Re-render currently visible views & modules
    if (window.OverviewModule) window.OverviewModule.init();
    if (window.CasesModule) window.CasesModule.renderCasesTable();
    if (window.RawCDRModule) window.RawCDRModule.init();
    if (window.AdvanceCDRModule) window.AdvanceCDRModule.init();
    if (window.GraphicalModule) window.GraphicalModule.init();
    if (window.GeoLocationModule && window.GeoLocationModule.plotData) {
      window.GeoLocationModule.plotData();
    }
    if (window.LinkAnalysisModule) window.LinkAnalysisModule.init();
    if (window.MultiCrossModule) window.MultiCrossModule.init();
    if (window.IntelligenceModule) window.IntelligenceModule.init();
    if (window.ForensicIMEIModule) window.ForensicIMEIModule.init();
  },

  bindEvents: function() {
    // Download Button
    const downloadBtn = document.getElementById('btn-download-backup');
    if (downloadBtn) {
      downloadBtn.onclick = () => this.downloadBackup();
    }

    // File Input & Choose Button
    const fileInput = document.getElementById('backup-file-input');
    const chooseBtn = document.getElementById('btn-choose-backup-file');
    const restoreBtn = document.getElementById('btn-restore-backup');

    if (chooseBtn && fileInput) {
      chooseBtn.onclick = () => fileInput.click();
      fileInput.onchange = (e) => {
        if (e.target.files && e.target.files[0]) {
          this.handleFileSelect(e.target.files[0]);
        }
      };
    }

    if (restoreBtn) {
      restoreBtn.onclick = () => this.restoreBackup();
    }

    // Reset Button
    const clearBtn = document.getElementById('btn-clear-all-data');
    if (clearBtn) {
      clearBtn.onclick = () => this.resetAllData();
    }

    // Restore Demo Button
    const demoBtn = document.getElementById('btn-restore-demo-data');
    if (demoBtn) {
      demoBtn.onclick = () => this.restoreDemoData();
    }

    // Header Button
    const headerBtn = document.getElementById('btn-backup-header');
    if (headerBtn) {
      headerBtn.onclick = () => this.openModal();
    }
  }
};
