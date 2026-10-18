/**
 * SETTINGS & SYSTEM CONFIGURATION MODULE
 * Manages forensic agency preferences, geocoding API keys, telemetry and license info
 */
window.SettingsModule = {
  storageKey: 'ZEE_CDR_FORENSIC_SETTINGS',

  getSettings: function() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) { }
    return {
      agencyName: 'ZEE Forensic Labs & Intelligence Unit',
      defaultPs: 'Central Police Station',
      investigator: 'Forensic Investigator',
      locationiqKey: localStorage.getItem('LOCATIONIQ_API_KEY') || 'pk.07b8ce8fce61c5c9fa4905f0f35da908',
      towerRadius: 1500,
      autoSave: true
    };
  },

  saveSettings: function(newSettings) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(newSettings));
      if (newSettings.locationiqKey) {
        localStorage.setItem('LOCATIONIQ_API_KEY', newSettings.locationiqKey);
      }
      if (window.App && window.App.showToast) {
        window.App.showToast('سیٹنگز کامیابی سے محفوظ ہو گئیں! (Settings saved successfully)', 'success');
      }
    } catch (e) { }
  },

  init: function() {
    this.renderSettings();
    this.bindEvents();
  },

  renderSettings: function() {
    const s = this.getSettings();

    const agencyEl = document.getElementById('setting-agency-name');
    if (agencyEl) agencyEl.value = s.agencyName || '';

    const psEl = document.getElementById('setting-default-ps');
    if (psEl) psEl.value = s.defaultPs || '';

    const ioEl = document.getElementById('setting-investigator');
    if (ioEl) ioEl.value = s.investigator || '';

    const keyEl = document.getElementById('setting-locationiq-key');
    if (keyEl) keyEl.value = s.locationiqKey || '';

    const radiusEl = document.getElementById('setting-tower-radius');
    if (radiusEl) radiusEl.value = s.towerRadius || 1500;

    // Telemetry
    const casesCount = (window.CDRDataStore && window.CDRDataStore.cases) ? window.CDRDataStore.cases.length : 0;
    const recordsCount = (window.CDRDataStore && window.CDRDataStore.cdrRecords) ? window.CDRDataStore.cdrRecords.length : 0;

    const statCasesEl = document.getElementById('setting-stat-cases');
    if (statCasesEl) statCasesEl.innerText = casesCount;

    const statRecordsEl = document.getElementById('setting-stat-records');
    if (statRecordsEl) statRecordsEl.innerText = recordsCount;

    // Hardware Key
    const hwKeyEl = document.getElementById('setting-hardware-key');
    if (hwKeyEl && window.LicenseEngine) {
      hwKeyEl.value = window.LicenseEngine.getHardwareFingerprint();
    }
  },

  bindEvents: function() {
    const form = document.getElementById('form-settings');
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const newSettings = {
          agencyName: (document.getElementById('setting-agency-name')?.value || '').trim(),
          defaultPs: (document.getElementById('setting-default-ps')?.value || '').trim(),
          investigator: (document.getElementById('setting-investigator')?.value || '').trim(),
          locationiqKey: (document.getElementById('setting-locationiq-key')?.value || '').trim(),
          towerRadius: parseInt(document.getElementById('setting-tower-radius')?.value || '1500', 10),
          autoSave: true
        };
        this.saveSettings(newSettings);
      };
    }
  }
};