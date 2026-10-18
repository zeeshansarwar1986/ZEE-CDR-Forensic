/* ==========================================================================
   MAIN APPLICATION CONTROLLER, ROUTER & CDR INGESTION ENGINE
   ZEE CDR FORENSIC - Zee Meta Advertising Agency (Reg)
   ========================================================================== */

window.App = {
  init: function() {
    // Initialize Hardware-Locked License Security Gate
    if (window.LicenseEngine) {
      window.LicenseEngine.init();
    }

    this.bindNavigation();
    this.bindHeaderTools();
    this.bindGlobalSearchBar();
    this.bindGlobalFilterDrawer();
    this.bindFileUpload();

    // Initialize Backup & Data Manager
    if (window.BackupModule) {
      window.BackupModule.init();
    }

    // Initialize Active View from URL params or default to overview
    const urlParams = new URLSearchParams(window.location.search);
    const initialView = urlParams.get('view') || 'view-overview';
    this.switchView(initialView);

    if (urlParams.get('modal') === 'backup') {
      setTimeout(() => {
        if (window.BackupModule) window.BackupModule.openModal();
      }, 400);
    }

    // Show Welcome Toast
    this.showToast('ZEE CDR Forensic Ready - Upload your CDR file to begin analysis', 'info');
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
    const openCaseModal = () => {
      const modal = document.getElementById('modal-add-case');
      if (modal) modal.classList.add('active');
    };
    document.getElementById('btn-quick-new-case')?.addEventListener('click', openCaseModal);
  },

  bindGlobalSearchBar: function() {
    const searchBar = document.getElementById('global-search-bar');
    if (!searchBar) return;

    const performSearch = () => {
      const q = searchBar.value.trim();
      if (!q) return;

      const cleanNum = q.replace(/[^0-9+]/g, '');

      // 1. Check if CNIC (13 digits or formatted with dashes)
      if (cleanNum.length === 13 || /^\d{5}-\d{7}-\d{1}$/.test(q)) {
        this.switchView('view-intelligence');
        const cnicInput = document.getElementById('cnic-input');
        if (cnicInput) cnicInput.value = q;
        if (window.IntelligenceModule) window.IntelligenceModule.renderCNICResult(q);
        this.showToast(`CNIC Intelligence search for: ${q}`, 'info');
        return;
      }

      // 2. Check if IMEI (14 to 16 digits)
      if (cleanNum.length >= 14 && cleanNum.length <= 16 && !cleanNum.startsWith('+')) {
        this.switchView('view-forensic-imei');
        const imeiInput = document.getElementById('imei-fixer-input');
        if (imeiInput) imeiInput.value = cleanNum;
        if (window.ForensicIMEIModule) window.ForensicIMEIModule.inspectIMEI(cleanNum, true);
        this.showToast(`IMEI Forensic TAC inspection for: ${cleanNum}`, 'info');
        return;
      }

      // 3. Check if matching any Case Title or Case ID
      const matchingCase = (window.CDRDataStore.cases || []).find(c =>
        (c.id || '').toLowerCase().includes(q.toLowerCase()) ||
        (c.title || '').toLowerCase().includes(q.toLowerCase())
      );
      if (matchingCase) {
        this.switchView('view-cases');
        const caseSearch = document.getElementById('search-cases-input');
        if (caseSearch) caseSearch.value = q;
        if (window.CasesModule) window.CasesModule.renderCasesTable(q);
        this.showToast(`Case Docket match found: ${matchingCase.title}`, 'info');
        return;
      }

      // 4. Default: Filter Raw CDR Grid
      this.switchView('view-raw-cdr');
      const rawSearch = document.getElementById('raw-cdr-search');
      if (rawSearch) {
        rawSearch.value = q;
        if (window.RawCDRModule) window.RawCDRModule.applyFilters();
      }
      this.showToast(`Filtered Raw CDR Grid for: "${q}"`, 'info');
    };

    searchBar.onkeypress = (e) => {
      if (e.key === 'Enter') performSearch();
    };

    const icon = searchBar.parentElement?.querySelector('.search-icon-inside');
    if (icon) {
      icon.style.cursor = 'pointer';
      icon.onclick = performSearch;
    }
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
        const loc = document.getElementById('filter-location')?.value || 'ALL';
        const type = document.getElementById('filter-call-type')?.value || 'ALL';
        const bparty = (document.getElementById('filter-bparty')?.value || '').trim();

        // Pass to Raw CDR Module
        if (window.RawCDRModule) {
          const rawSearch = document.getElementById('raw-cdr-search');
          const typeSelect = document.getElementById('raw-cdr-filter-type');
          if (rawSearch && bparty) rawSearch.value = bparty;
          if (typeSelect && type !== 'ALL') typeSelect.value = type;
          window.RawCDRModule.applyFilters();
        }

        this.showToast(`Global Filters Applied (Type: ${type}, Location: ${loc})`, 'info');
      };
    }

    if (resetBtn) {
      resetBtn.onclick = () => {
        if (document.getElementById('filter-location')) document.getElementById('filter-location').value = 'ALL';
        if (document.getElementById('filter-call-type')) document.getElementById('filter-call-type').value = 'ALL';
        if (document.getElementById('filter-bparty')) document.getElementById('filter-bparty').value = '';

        if (window.RawCDRModule) {
          const rawSearch = document.getElementById('raw-cdr-search');
          const typeSelect = document.getElementById('raw-cdr-filter-type');
          if (rawSearch) rawSearch.value = '';
          if (typeSelect) typeSelect.value = 'ALL';
          window.RawCDRModule.applyFilters();
        }
        this.showToast('Global Filters Reset to Default', 'warning');
      };
    }
  },

  bindFileUpload: function() {
    const input = document.getElementById('cdr-file-input');
    const dropCard = document.querySelector('#view-upload .cyber-card');

    if (input) {
      input.onchange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) this.processCDRFile(file);
      };
    }

    if (dropCard) {
      dropCard.ondragover = (e) => {
        e.preventDefault();
        dropCard.style.borderColor = 'var(--accent-blue-bright)';
        dropCard.style.background = 'rgba(0, 168, 255, 0.05)';
      };

      dropCard.ondragleave = (e) => {
        e.preventDefault();
        dropCard.style.borderColor = '';
        dropCard.style.background = '';
      };

      dropCard.ondrop = (e) => {
        e.preventDefault();
        dropCard.style.borderColor = '';
        dropCard.style.background = '';
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
          this.processCDRFile(e.dataTransfer.files[0]);
        }
      };
    }
  },

  // Real CDR Ingestion & Column Mapping Engine
  processCDRFile: function(file) {
    if (!file) return;

    this.showToast(`Ingesting & Parsing: ${file.name} (${(file.size / 1024).toFixed(1)} KB)...`, 'info');

    const ext = file.name.split('.').pop().toLowerCase();
    const isExcel = ext === 'xlsx' || ext === 'xls';

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        let rawRows = [];

        if (isExcel && typeof XLSX !== 'undefined') {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        } else {
          // CSV / TXT parsing with SheetJS or text fallback
          const text = e.target.result;
          if (typeof XLSX !== 'undefined') {
            const workbook = XLSX.read(text, { type: 'string' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
          } else {
            // Manual CSV parser fallback
            const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
            if (lines.length > 1) {
              const headers = lines[0].split(/[,;\t]/).map(h => h.trim().replace(/^["']|["']$/g, ''));
              for (let i = 1; i < lines.length; i++) {
                const cols = lines[i].split(/[,;\t]/).map(c => c.trim().replace(/^["']|["']$/g, ''));
                const row = {};
                headers.forEach((h, idx) => { row[h] = cols[idx] || ''; });
                rawRows.push(row);
              }
            }
          }
        }

        if (!rawRows || rawRows.length === 0) {
          throw new Error('No valid records found in uploaded CDR file.');
        }

        // Map columns intelligently
        const parsedRecords = this.normalizeCDRRows(rawRows);

        if (parsedRecords.length === 0) {
          throw new Error('Unable to parse recognized CDR rows. Please ensure file contains Call Date/Time, B-Party and Duration.');
        }

        // Store into CDRDataStore
        window.CDRDataStore.cdrRecords = parsedRecords;

        // Auto-detect target number
        const targetCounts = {};
        parsedRecords.forEach(r => {
          if (r.targetNumber) targetCounts[r.targetNumber] = (targetCounts[r.targetNumber] || 0) + 1;
        });
        const targetNumbers = Object.keys(targetCounts).sort((a, b) => targetCounts[b] - targetCounts[a]);
        const primaryTarget = targetNumbers[0] || (parsedRecords[0] ? parsedRecords[0].targetNumber : 'Unknown');

        window.CDRDataStore.activeTargetNumber = primaryTarget;
        const targetOperator = window.CDRDataStore.getOperator(primaryTarget);

        // Auto-create or update Case docket if empty
        if (!window.CDRDataStore.currentCaseId || (window.CDRDataStore.cases || []).length === 0) {
          const newCaseId = `CASE-${Date.now().toString().slice(-6)}`;
          window.CDRDataStore.currentCaseId = newCaseId;
          const newCase = {
            id: newCaseId,
            title: `Investigation of ${primaryTarget} (${file.name.replace(/\.[^/.]+$/, '')})`,
            offence: 'Forensic CDR Ingestion',
            policeStation: 'Forensic Intelligence Wing',
            investigatingOfficer: 'Analyst',
            status: 'Active',
            createdDate: new Date().toISOString().slice(0, 10),
            updatedDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
            description: `Imported from file: ${file.name}. Total ${parsedRecords.length.toLocaleString()} CDR interactions parsed.`,
            targets: [primaryTarget]
          };
          window.CDRDataStore.cases = [newCase];
        }

        // Calculate Date Range
        const sortedDates = parsedRecords.map(r => r.date).filter(Boolean).sort();
        const minDate = sortedDates[0] || 'N/A';
        const maxDate = sortedDates[sortedDates.length - 1] || 'N/A';

        // Update UI summary card in view-upload
        const summaryCard = document.getElementById('ai-parse-summary');
        if (summaryCard) {
          summaryCard.style.display = 'block';
          summaryCard.innerHTML = `
            <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
              <div class="card-title text-cyan-bright"><i class="fa-solid fa-circle-check text-green"></i> CDR Ingestion & Parsing Complete</div>
              <span class="operator-tag ${targetOperator.toLowerCase()}">${targetOperator}</span>
            </div>
            <div class="metrics-8-grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:0.75rem; font-size:0.85rem; margin-bottom:1rem;">
              <div style="background:rgba(4,12,26,0.8); padding:0.75rem; border-radius:6px; border:1px solid rgba(255,255,255,0.06);">
                <div class="text-muted" style="font-size:0.75rem;">Primary Target MSISDN:</div>
                <div class="text-green text-mono" style="font-size:1.1rem; font-weight:700;">${primaryTarget}</div>
              </div>
              <div style="background:rgba(4,12,26,0.8); padding:0.75rem; border-radius:6px; border:1px solid rgba(255,255,255,0.06);">
                <div class="text-muted" style="font-size:0.75rem;">Detected Operator:</div>
                <div class="text-cyan-bright" style="font-size:1.1rem; font-weight:700;">${targetOperator}</div>
              </div>
              <div style="background:rgba(4,12,26,0.8); padding:0.75rem; border-radius:6px; border:1px solid rgba(255,255,255,0.06);">
                <div class="text-muted" style="font-size:0.75rem;">Total Parsed Interactions:</div>
                <div class="text-amber text-mono" style="font-size:1.1rem; font-weight:700;">${parsedRecords.length.toLocaleString()} Records</div>
              </div>
              <div style="background:rgba(4,12,26,0.8); padding:0.75rem; border-radius:6px; border:1px solid rgba(255,255,255,0.06);">
                <div class="text-muted" style="font-size:0.75rem;">Timeline Range:</div>
                <div style="font-size:0.85rem; color:#fff; font-weight:600; margin-top:3px;">${minDate} to ${maxDate}</div>
              </div>
            </div>

            <!-- Quick Action Jump Buttons -->
            <div style="display:flex; gap:0.75rem; flex-wrap:wrap; border-top:1px solid rgba(255,255,255,0.08); padding-top:1rem;">
              <button class="tool-btn primary" onclick="window.App.switchView('view-raw-cdr');">
                <i class="fa-solid fa-table"></i> Open Raw CDR Data Grid
              </button>
              <button class="tool-btn" onclick="window.App.switchView('view-overview');">
                <i class="fa-solid fa-chart-pie"></i> View Command Dashboard
              </button>
              <button class="tool-btn" onclick="window.App.switchView('view-geolocation');">
                <i class="fa-solid fa-map-location-dot"></i> Inspect Movement on GIS Map
              </button>
              <button class="tool-btn" onclick="window.App.switchView('view-link-analysis');">
                <i class="fa-solid fa-diagram-project"></i> View Link Network
              </button>
            </div>
          `;
        }

        // Save into LocalStorage so user data persists across page refreshes
        if (window.BackupModule) {
          window.BackupModule.saveToStorage();
          window.BackupModule.refreshApplication();
          window.BackupModule.updateStats();
        }

        this.showToast(`Successfully Ingested ${parsedRecords.length.toLocaleString()} Records from ${file.name}!`, 'success');

      } catch (err) {
        console.error('File parsing error:', err);
        this.showToast(`Error parsing file: ${err.message || 'Invalid format'}`, 'danger');
      }
    };

    if (isExcel) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  },

  // Map unknown column headers to standard forensic CDR record keys
  normalizeCDRRows: function(rows) {
    if (!rows || rows.length === 0) return [];

    const firstRow = rows[0];
    const keys = Object.keys(firstRow);

    const findKey = (pattern) => keys.find(k => pattern.test(k.toLowerCase().replace(/[^a-z0-9]/g, '')));

    const aPartyKey = findKey(/aparty|calling|caller|source|target|orig|msisdna|from/);
    const bPartyKey = findKey(/bparty|called|dialed|dest|term|msisdnb|to|recipient|other/);
    const timeKey = findKey(/timestamp|calltime|datetime|date.*time|start.*time|time|date/);
    const typeKey = findKey(/type|calltype|direction|traffic|nature|event|service/);
    const durKey = findKey(/duration|call.*dur|sec|length/);
    const cellKey = findKey(/cell|site|cgi|tower|location|sector/);
    const imeiKey = findKey(/imei/);
    const imsiKey = findKey(/imsi/);
    const latKey = findKey(/lat|latitude/);
    const lngKey = findKey(/lng|lon|longitude/);

    const baseLat = 33.6844;
    const baseLng = 73.0479;

    let idCounter = 1001;

    return rows.map((r, idx) => {
      let bParty = bPartyKey ? String(r[bPartyKey]).trim() : '';
      let aParty = aPartyKey ? String(r[aPartyKey]).trim() : '';

      // If A-Party is missing but B-party exists
      if (!aParty && bParty) aParty = '03000000000';
      if (!bParty && aParty) bParty = 'Unknown';

      let rawTime = timeKey ? String(r[timeKey]).trim() : new Date().toISOString();
      let formattedTime = rawTime;
      let dateStr = rawTime.slice(0, 10);
      let hourVal = 12;

      // Extract date and hour safely
      const dateMatch = rawTime.match(/(\d{4}[-/]\d{2}[-/]\d{2})/);
      if (dateMatch) dateStr = dateMatch[1].replace(/\//g, '-');

      const timeMatch = rawTime.match(/(\d{1,2}):(\d{2})/);
      if (timeMatch) hourVal = parseInt(timeMatch[1], 10);

      // Call Type
      let callType = 'Call';
      if (typeKey && r[typeKey]) {
        const tVal = String(r[typeKey]).toLowerCase();
        if (tVal.includes('sms')) callType = 'SMS';
        else if (tVal.includes('in') || tVal.includes('mtc') || tVal.includes('term')) callType = 'Incoming';
        else if (tVal.includes('out') || tVal.includes('moc') || tVal.includes('orig')) callType = 'Outgoing';
      }

      // Duration
      let dur = durKey ? parseInt(r[durKey], 10) : 0;
      if (isNaN(dur)) dur = 0;
      if (callType === 'SMS') dur = 0;

      // Cell location & coordinates
      let locName = cellKey ? String(r[cellKey]).trim() : `Sector ${idx % 12 + 1}`;
      let cellId = `CELL-${(idx % 15) + 101}`;

      let lat = latKey && !isNaN(parseFloat(r[latKey])) ? parseFloat(r[latKey]) : (baseLat + ((idx % 7) - 3) * 0.015 + ((idx % 3) * 0.008));
      let lng = lngKey && !isNaN(parseFloat(r[lngKey])) ? parseFloat(r[lngKey]) : (baseLng + ((idx % 5) - 2) * 0.018 + ((idx % 4) * 0.005));

      let imei = imeiKey ? String(r[imeiKey]).trim() : '351234098765432';
      let imsi = imsiKey ? String(r[imsiKey]).trim() : '410010123456789';

      return {
        id: idCounter++,
        targetNumber: aParty,
        targetOperator: window.CDRDataStore.getOperator(aParty),
        bPartyNumber: bParty,
        bPartyOperator: window.CDRDataStore.getOperator(bParty),
        callType: callType,
        timestamp: formattedTime,
        date: dateStr,
        hour: hourVal,
        duration: dur,
        locationName: locName,
        cellId: cellId,
        lat: lat,
        lng: lng,
        imei: imei,
        imsi: imsi,
        mfc: `051-${100 + (idx % 900)}`
      };
    });
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
    }, 3200);
  }
};

// Bootstrap App when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.App.init();
});