/**
 * CASES MANAGEMENT MODULE (Matching Screenshot 2 & Forensic Suite Requirements)
 * Clean Reset - Zero Dummy Cases. Pure User Input Persistence.
 */
window.CasesModule = {
  isInitialized: false,
  viewMode: 'table', // 'table' or 'cards'
  currentFilterStatus: 'all',
  currentSort: 'updated',
  currentSearchQuery: '',
  stagedFirFile: null,
  editStagedFirFile: null,

  init: function() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    this.cleanAndEnsureCases();
    this.renderCases();
    this.bindEvents();
  },

  cleanAndEnsureCases: function() {
    if (!window.CDRDataStore) window.CDRDataStore = {};
    if (!Array.isArray(window.CDRDataStore.cases)) {
      window.CDRDataStore.cases = [];
    }

    // One-time total reset requested by user to wipe all old mockup cases
    if (localStorage.getItem('ZEE_CASES_CLEAN_RESET_2026') !== 'done') {
      window.CDRDataStore.cases = [];
      window.CDRDataStore.currentCaseId = '';
      const headerTitle = document.getElementById('header-case-title');
      if (headerTitle) headerTitle.innerText = 'No Active Case (کیس رجسٹر کریں)';
      const headerDate = document.getElementById('header-last-updated');
      if (headerDate) headerDate.innerText = '-';
      localStorage.setItem('ZEE_CASES_CLEAN_RESET_2026', 'done');
      if (window.BackupModule) window.BackupModule.saveToStorage();
      return;
    }

    // Purge any demo/mockup cases if present
    const demoIds = ['case 005', 'Case 001', '0015', '420', '0011', 'damo', '001', 'CASE-001'];
    const hadDemo = window.CDRDataStore.cases.some(c => demoIds.includes(c.id));
    if (hadDemo) {
      window.CDRDataStore.cases = window.CDRDataStore.cases.filter(c => !demoIds.includes(c.id));
      if (demoIds.includes(window.CDRDataStore.currentCaseId)) {
        window.CDRDataStore.currentCaseId = '';
        const headerTitle = document.getElementById('header-case-title');
        if (headerTitle) headerTitle.innerText = 'No Active Case (کیس رجسٹر کریں)';
        const headerDate = document.getElementById('header-last-updated');
        if (headerDate) headerDate.innerText = '-';
      }
      if (window.BackupModule) window.BackupModule.saveToStorage();
    }
  },

  bindEvents: function() {
    // Save New Case
    const saveBtn = document.getElementById('btn-save-new-case');
    if (saveBtn) {
      saveBtn.onclick = (e) => {
        if (e) e.preventDefault();
        this.saveNewCase();
      };
    }

    // Update Edited Case
    const updateBtn = document.getElementById('btn-update-case');
    if (updateBtn) {
      updateBtn.onclick = (e) => {
        if (e) e.preventDefault();
        this.saveEditedCase();
      };
    }

    // Modals Close Buttons
    ['modal-add-case', 'modal-edit-case', 'modal-view-fir'].forEach(id => {
      const modal = document.getElementById(id);
      if (modal) {
        modal.onclick = (e) => {
          if (e.target === modal) modal.classList.remove('active');
        };
      }
    });

    // View Mode Toggle (Table vs Cards)
    const btnTable = document.getElementById('btn-cases-view-table');
    const btnCards = document.getElementById('btn-cases-view-cards');
    if (btnTable) {
      btnTable.onclick = () => {
        this.viewMode = 'table';
        btnTable.classList.add('active');
        btnCards?.classList.remove('active');
        this.renderCases();
      };
    }
    if (btnCards) {
      btnCards.onclick = () => {
        this.viewMode = 'cards';
        btnCards.classList.add('active');
        btnTable?.classList.remove('active');
        this.renderCases();
      };
    }

    // Search input
    const searchInput = document.getElementById('search-cases-input');
    if (searchInput) {
      searchInput.oninput = (e) => {
        this.currentSearchQuery = e.target.value.toLowerCase().trim();
        this.renderCases();
      };
    }

    // Filter by status
    const filterSelect = document.getElementById('filter-case-status');
    if (filterSelect) {
      filterSelect.onchange = (e) => {
        this.currentFilterStatus = e.target.value;
        this.renderCases();
      };
    }

    // Sort cases
    const sortSelect = document.getElementById('sort-cases');
    if (sortSelect) {
      sortSelect.onchange = (e) => {
        this.currentSort = e.target.value;
        this.renderCases();
      };
    }

    // Export CSV & Print
    document.getElementById('btn-export-cases-csv')?.addEventListener('click', () => this.exportCasesCSV());
    document.getElementById('btn-print-cases')?.addEventListener('click', () => window.print());

    // FIR File Attachment in Add Modal
    const firInput = document.getElementById('case-fir-input');
    if (firInput) {
      firInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (loadEvt) => {
          this.stagedFirFile = {
            name: file.name,
            size: (file.size / 1024).toFixed(1) + ' KB',
            type: file.type,
            data: loadEvt.target.result
          };
          this.updateFirPreview('add', this.stagedFirFile);
        };
        reader.readAsDataURL(file);
      };
    }

    // FIR File Attachment in Edit Modal
    const editFirInput = document.getElementById('edit-case-fir-input');
    if (editFirInput) {
      editFirInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (loadEvt) => {
          this.editStagedFirFile = {
            name: file.name,
            size: (file.size / 1024).toFixed(1) + ' KB',
            type: file.type,
            data: loadEvt.target.result
          };
          this.updateFirPreview('edit', this.editStagedFirFile);
        };
        reader.readAsDataURL(file);
      };
    }

    // Keyboard handlers
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
      }
    });

    // Delegation for Table row actions
    const tableContainer = document.getElementById('cases-table-container');
    if (tableContainer) {
      tableContainer.addEventListener('click', (e) => this.handleRowAction(e));
    }

    // Delegation for Cards actions
    const cardsContainer = document.getElementById('cases-cards-container');
    if (cardsContainer) {
      cardsContainer.addEventListener('click', (e) => this.handleRowAction(e));
    }
  },

  updateFirPreview: function(modalType, fileObj) {
    const previewEl = document.getElementById(modalType === 'add' ? 'fir-attached-preview' : 'edit-fir-attached-preview');
    const nameEl = document.getElementById(modalType === 'add' ? 'fir-attached-name' : 'edit-fir-attached-name');
    const promptEl = document.getElementById(modalType === 'add' ? 'fir-upload-prompt' : 'edit-fir-upload-prompt');

    if (fileObj) {
      if (nameEl) nameEl.innerText = `📎 ${fileObj.name} (${fileObj.size})`;
      if (previewEl) previewEl.style.display = 'flex';
      if (promptEl) promptEl.style.display = 'none';
    } else {
      if (previewEl) previewEl.style.display = 'none';
      if (promptEl) promptEl.style.display = 'flex';
    }
  },

  removeStagedFir: function(modalType) {
    if (modalType === 'add') {
      this.stagedFirFile = null;
      const input = document.getElementById('case-fir-input');
      if (input) input.value = '';
      this.updateFirPreview('add', null);
    } else {
      this.editStagedFirFile = null;
      const input = document.getElementById('edit-case-fir-input');
      if (input) input.value = '';
      this.updateFirPreview('edit', null);
    }
  },

  getFilteredCases: function() {
    let cases = (window.CDRDataStore && window.CDRDataStore.cases) ? [...window.CDRDataStore.cases] : [];

    // Filter by status
    if (this.currentFilterStatus !== 'all') {
      cases = cases.filter(c => (c.status || '').toLowerCase() === this.currentFilterStatus.toLowerCase());
    }

    // Search query
    if (this.currentSearchQuery) {
      cases = cases.filter(c =>
        (c.id || '').toLowerCase().includes(this.currentSearchQuery) ||
        (c.title || '').toLowerCase().includes(this.currentSearchQuery) ||
        (c.investigatingOfficer || '').toLowerCase().includes(this.currentSearchQuery) ||
        (c.policeStation || '').toLowerCase().includes(this.currentSearchQuery) ||
        (c.status || '').toLowerCase().includes(this.currentSearchQuery)
      );
    }

    // Sort
    cases.sort((a, b) => {
      switch (this.currentSort) {
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        case 'oldest':
          return (a.createdDate || '').localeCompare(b.createdDate || '');
        case 'newest':
          return (b.createdDate || '').localeCompare(a.createdDate || '');
        case 'cdrs':
          return (b.cdrs || 0) - (a.cdrs || 0);
        case 'updated':
        default:
          return (b.updatedDate || '').localeCompare(a.updatedDate || '');
      }
    });

    return cases;
  },

  renderCases: function() {
    const cases = this.getFilteredCases();
    const countSubtitle = document.getElementById('cases-count-subtitle');
    if (countSubtitle) {
      countSubtitle.innerText = `${cases.length} case(s), table or card view`;
    }

    const tableContainer = document.getElementById('cases-table-container');
    const cardsContainer = document.getElementById('cases-cards-container');

    if (this.viewMode === 'table') {
      if (tableContainer) tableContainer.style.display = 'block';
      if (cardsContainer) cardsContainer.style.display = 'none';
      this.renderTableView(cases);
    } else {
      if (tableContainer) tableContainer.style.display = 'none';
      if (cardsContainer) cardsContainer.style.display = 'grid';
      this.renderCardsView(cases);
    }
  },

  renderTableView: function(cases) {
    const tbody = document.getElementById('cases-table-body') || document.getElementById('cases-tbody');
    if (!tbody) return;

    if (cases.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 3.5rem 1.5rem; color: #8fa3bf;">
        <i class="fa-solid fa-folder-open" style="font-size: 2.8rem; margin-bottom: 0.85rem; color: rgba(0,168,255,0.25); display:block;"></i>
        <div style="font-size: 1.05rem; font-weight: 600; color: #f8fafc; margin-bottom: 0.35rem;">ابھی تک کوئی کیس شامل نہیں کیا گیا (No Cases Registered)</div>
        <div style="font-size: 0.85rem; color: #71829e; margin-bottom: 1.25rem;">نیا تفتیشی کیس درج کرنے کے لیے اوپر بنے نیلے بٹن پر کلک کریں۔</div>
        <button class="tool-btn primary" onclick="window.CasesModule.openModal();" style="display:inline-flex; align-items:center; gap:8px; margin:0 auto; padding:0.55rem 1.25rem;">
          <i class="fa-solid fa-plus"></i> Add New Case
        </button>
      </td></tr>`;
      return;
    }

    tbody.innerHTML = cases.map(c => {
      const statusClass = (c.status || 'pending').toLowerCase();
      const hasFir = Boolean(c.firFile && c.firFile.data);
      const ioDisplay = (c.investigatingOfficer && c.investigatingOfficer !== 'Investigating Officer' && c.investigatingOfficer !== '') ? c.investigatingOfficer : '-';
      const updatedDisplay = c.updatedDate || c.createdDate || 'Just now';
      const cdrsCount = c.cdrs !== undefined ? c.cdrs : (c.targets ? c.targets.length : 0);

      return `
        <tr>
          <td><span class="case-id-cell btn-select-case" data-id="${c.id}" title="Open Case">${c.id}</span></td>
          <td><strong style="color:#ffffff;">${c.title}</strong></td>
          <td><span class="case-status-pill ${statusClass}">${c.status || 'Pending'}</span></td>
          <td style="color:#cbd5e1; font-weight:600;">${cdrsCount}</td>
          <td style="color:#94a3b8;">${ioDisplay}</td>
          <td style="color:#71829e; font-size:0.8rem; font-family:'JetBrains Mono', monospace;">${updatedDisplay}</td>
          <td>
            <div class="case-actions-cell">
              <button class="case-row-btn btn-edit-case" data-id="${c.id}" title="Edit Case">
                <i class="fa-solid fa-pencil"></i>
              </button>
              <button class="case-row-btn btn-select-case text-cyan" data-id="${c.id}" title="Open Case Workspace">
                <i class="fa-solid fa-arrow-up-right-from-square"></i>
              </button>
              <button class="case-row-btn btn-view-fir ${hasFir ? 'has-fir' : ''}" data-id="${c.id}" title="${hasFir ? 'View Attached FIR: ' + c.firFile.name : 'No FIR Attached'}">
                <i class="fa-solid fa-download"></i>
              </button>
              <button class="case-row-btn btn-delete-case text-red" data-id="${c.id}" title="Delete Case">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  renderCardsView: function(cases) {
    const container = document.getElementById('cases-cards-container');
    if (!container) return;

    if (cases.length === 0) {
      container.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:3.5rem 1.5rem; color:#8fa3bf;">
        <i class="fa-solid fa-folder-open" style="font-size:2.8rem; margin-bottom:0.85rem; color:rgba(0,168,255,0.25); display:block;"></i>
        <div style="font-size:1.05rem; font-weight:600; color:#f8fafc; margin-bottom:0.35rem;">ابھی تک کوئی کیس شامل نہیں کیا گیا</div>
        <div style="font-size:0.85rem; color:#71829e; margin-bottom:1.25rem;">نیا تفتیشی کیس درج کرنے کے لیے ایڈ نیو کیس پر کلک کریں۔</div>
        <button class="tool-btn primary" onclick="window.CasesModule.openModal();" style="display:inline-flex; align-items:center; gap:8px; margin:0 auto; padding:0.55rem 1.25rem;">
          <i class="fa-solid fa-plus"></i> Add New Case
        </button>
      </div>`;
      return;
    }

    container.innerHTML = cases.map(c => {
      const statusClass = (c.status || 'pending').toLowerCase();
      const hasFir = Boolean(c.firFile && c.firFile.data);
      const ioDisplay = (c.investigatingOfficer && c.investigatingOfficer !== 'Investigating Officer' && c.investigatingOfficer !== '') ? c.investigatingOfficer : 'Unassigned';

      return `
        <div class="case-card-item">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="case-id-cell btn-select-case" data-id="${c.id}">${c.id}</span>
            <span class="case-status-pill ${statusClass}">${c.status || 'Pending'}</span>
          </div>
          <div>
            <h3 style="margin:0; font-size:1.05rem; font-weight:700; color:#fff;">${c.title}</h3>
            <p style="margin:4px 0 0; font-size:0.8rem; color:#8fa3bf;">${c.description || 'No description provided.'}</p>
          </div>
          <div style="font-size:0.8rem; color:#71829e; display:flex; flex-direction:column; gap:3px;">
            <div><strong>Station:</strong> ${c.policeStation || 'Central PS'}</div>
            <div><strong>Investigator:</strong> ${ioDisplay}</div>
            <div><strong>Attached FIR:</strong> ${hasFir ? '<span class="text-cyan-bright">Yes (📎 ' + c.firFile.name + ')</span>' : '<span class="text-muted">None</span>'}</div>
            <div><strong>Updated:</strong> ${c.updatedDate || c.createdDate}</div>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid #162a45; padding-top:0.6rem; margin-top:0.25rem;">
            <span style="font-size:0.8rem; color:#8fa3bf;"><strong>CDRs:</strong> ${c.cdrs || 0}</span>
            <div class="case-actions-cell">
              <button class="case-row-btn btn-edit-case" data-id="${c.id}" title="Edit Case"><i class="fa-solid fa-pencil"></i></button>
              <button class="case-row-btn btn-select-case text-cyan" data-id="${c.id}" title="Open Case"><i class="fa-solid fa-arrow-up-right-from-square"></i></button>
              <button class="case-row-btn btn-view-fir ${hasFir ? 'has-fir' : ''}" data-id="${c.id}" title="${hasFir ? 'View FIR' : 'No FIR'}"><i class="fa-solid fa-download"></i></button>
              <button class="case-row-btn btn-delete-case text-red" data-id="${c.id}" title="Delete Case"><i class="fa-regular fa-trash-can"></i></button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  handleRowAction: function(e) {
    const editBtn = e.target.closest('.btn-edit-case');
    if (editBtn) {
      e.stopPropagation();
      const id = editBtn.getAttribute('data-id');
      this.openEditModal(id);
      return;
    }

    const selectBtn = e.target.closest('.btn-select-case');
    if (selectBtn) {
      e.stopPropagation();
      const id = selectBtn.getAttribute('data-id');
      this.selectCase(id);
      return;
    }

    const firBtn = e.target.closest('.btn-view-fir');
    if (firBtn) {
      e.stopPropagation();
      const id = firBtn.getAttribute('data-id');
      this.viewOrDownloadFir(id);
      return;
    }

    const deleteBtn = e.target.closest('.btn-delete-case');
    if (deleteBtn) {
      e.stopPropagation();
      const id = deleteBtn.getAttribute('data-id');
      this.deleteCase(id);
      return;
    }
  },

  openModal: function() {
    this.init();
    const modal = document.getElementById('modal-add-case');
    if (!modal) return;

    this.removeStagedFir('add');

    const numEl = document.getElementById('new-case-num');
    const titleEl = document.getElementById('new-case-title');
    const typeEl = document.getElementById('new-case-type');
    const psEl = document.getElementById('new-case-ps');
    const ioEl = document.getElementById('new-case-io');
    const descEl = document.getElementById('new-case-desc');
    const statusEl = document.getElementById('new-case-status');

    const casesCount = (window.CDRDataStore && window.CDRDataStore.cases ? window.CDRDataStore.cases.length : 0) + 1;
    if (numEl) numEl.value = `CASE-2025-${String(casesCount).padStart(3, '0')}`;

    if (titleEl) titleEl.value = '';
    if (typeEl) typeEl.value = 'Murder';
    if (psEl) psEl.value = '';
    if (ioEl) ioEl.value = '';
    if (descEl) descEl.value = '';
    if (statusEl) statusEl.value = 'Pending';

    modal.classList.add('active');
    setTimeout(() => { if (titleEl) titleEl.focus(); }, 80);
  },

  closeModal: function() {
    const modal = document.getElementById('modal-add-case');
    if (modal) modal.classList.remove('active');
  },

  saveNewCase: function() {
    const numEl = document.getElementById('new-case-num');
    const titleEl = document.getElementById('new-case-title');
    const typeEl = document.getElementById('new-case-type');
    const psEl = document.getElementById('new-case-ps');
    const ioEl = document.getElementById('new-case-io');
    const descEl = document.getElementById('new-case-desc');
    const statusEl = document.getElementById('new-case-status');

    let num = (numEl ? numEl.value : '').trim();
    const title = (titleEl ? titleEl.value : '').trim();
    const offence = (typeEl ? typeEl.value : '').trim() || 'Murder';
    const station = (psEl ? psEl.value : '').trim() || 'Police Station';
    const io = (ioEl ? ioEl.value : '').trim() || '-';
    const desc = (descEl ? descEl.value : '').trim() || 'Forensic investigation case docket.';
    const status = (statusEl ? statusEl.value : 'Pending').trim();

    if (!num) {
      const casesCount = (window.CDRDataStore && window.CDRDataStore.cases ? window.CDRDataStore.cases.length : 0) + 1;
      num = `CASE-2025-${String(casesCount).padStart(3, '0')}`;
    }

    if (!title) {
      if (window.App && window.App.showToast) {
        window.App.showToast('براہ کرم کیس کا ٹائٹل درج کریں! (Please enter Case Title)', 'danger');
      }
      if (titleEl) titleEl.focus();
      return;
    }

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    const newCase = {
      id: num,
      title: title,
      offence: offence,
      policeStation: station,
      investigatingOfficer: io,
      status: status,
      cdrs: 0,
      createdDate: formattedDate.substring(0, 10),
      updatedDate: formattedDate,
      description: desc,
      targets: [],
      firFile: this.stagedFirFile ? { ...this.stagedFirFile } : null
    };

    if (!window.CDRDataStore) window.CDRDataStore = {};
    if (!window.CDRDataStore.cases) window.CDRDataStore.cases = [];

    window.CDRDataStore.cases.unshift(newCase);
    window.CDRDataStore.currentCaseId = num;

    const headerTitle = document.getElementById('header-case-title');
    if (headerTitle) headerTitle.innerText = `${num} - ${title}`;
    const headerDate = document.getElementById('header-last-updated');
    if (headerDate) headerDate.innerText = formattedDate;

    this.renderCases();
    if (window.OverviewModule) window.OverviewModule.renderMetrics();
    if (window.BackupModule) window.BackupModule.saveToStorage();

    this.closeModal();

    if (window.App && window.App.showToast) {
      const firNote = newCase.firFile ? ' اور ایف آئی آر بھی منسلک ہو گئی!' : '';
      window.App.showToast(`کیس ${num} کامیابی سے محفوظ ہو گیا!${firNote}`, 'success');
    }
  },

  openEditModal: function(caseId) {
    const c = (window.CDRDataStore.cases || []).find(item => item.id === caseId);
    if (!c) return;

    this.editingCaseId = caseId;
    this.editStagedFirFile = c.firFile ? { ...c.firFile } : null;

    const modal = document.getElementById('modal-edit-case');
    if (!modal) return;

    const numEl = document.getElementById('edit-case-num');
    const titleEl = document.getElementById('edit-case-title');
    const typeEl = document.getElementById('edit-case-type');
    const psEl = document.getElementById('edit-case-ps');
    const ioEl = document.getElementById('edit-case-io');
    const descEl = document.getElementById('edit-case-desc');
    const statusEl = document.getElementById('edit-case-status');

    if (numEl) numEl.value = c.id;
    if (titleEl) titleEl.value = c.title;
    if (typeEl) typeEl.value = c.offence || 'Murder';
    if (psEl) psEl.value = c.policeStation || '';
    if (ioEl) ioEl.value = (c.investigatingOfficer === '-') ? '' : c.investigatingOfficer;
    if (descEl) descEl.value = c.description || '';
    if (statusEl) statusEl.value = c.status || 'Pending';

    this.updateFirPreview('edit', this.editStagedFirFile);
    modal.classList.add('active');
  },

  closeEditModal: function() {
    const modal = document.getElementById('modal-edit-case');
    if (modal) modal.classList.remove('active');
    this.editingCaseId = null;
    this.editStagedFirFile = null;
  },

  saveEditedCase: function() {
    if (!this.editingCaseId) return;
    const c = (window.CDRDataStore.cases || []).find(item => item.id === this.editingCaseId);
    if (!c) return;

    const titleEl = document.getElementById('edit-case-title');
    const typeEl = document.getElementById('edit-case-type');
    const psEl = document.getElementById('edit-case-ps');
    const ioEl = document.getElementById('edit-case-io');
    const descEl = document.getElementById('edit-case-desc');
    const statusEl = document.getElementById('edit-case-status');

    const title = (titleEl ? titleEl.value : '').trim();
    if (!title) {
      if (window.App && window.App.showToast) {
        window.App.showToast('Please enter Case Title!', 'danger');
      }
      return;
    }

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    c.title = title;
    c.offence = (typeEl ? typeEl.value : 'Murder');
    c.policeStation = (psEl ? psEl.value : '').trim() || 'Central PS';
    c.investigatingOfficer = (ioEl ? ioEl.value : '').trim() || '-';
    c.description = (descEl ? descEl.value : '').trim();
    c.status = (statusEl ? statusEl.value : 'Pending');
    c.updatedDate = formattedDate;
    c.firFile = this.editStagedFirFile ? { ...this.editStagedFirFile } : null;

    this.renderCases();
    if (window.OverviewModule) window.OverviewModule.renderMetrics();
    if (window.BackupModule) window.BackupModule.saveToStorage();

    this.closeEditModal();

    if (window.App && window.App.showToast) {
      window.App.showToast(`کیس ${c.id} کامیابی سے اپڈیٹ ہو گیا!`, 'success');
    }
  },

  viewOrDownloadFir: function(caseId) {
    const c = (window.CDRDataStore.cases || []).find(item => item.id === caseId);
    if (!c || !c.firFile || !c.firFile.data) {
      if (window.App && window.App.showToast) {
        window.App.showToast('اس کیس کے ساتھ کوئی ایف آئی آر فائل منسلک نہیں ہے۔ ایڈٹ (✏️) بٹن سے اٹیچ کریں۔', 'warning');
      }
      return;
    }

    const modal = document.getElementById('modal-view-fir');
    const titleEl = document.getElementById('fir-modal-title');
    const containerEl = document.getElementById('fir-preview-container');
    const dlBtn = document.getElementById('btn-download-fir-file');

    if (titleEl) titleEl.innerText = `FIR Copy: ${c.firFile.name} (${c.id} - ${c.title})`;

    if (dlBtn) {
      dlBtn.onclick = () => {
        const a = document.createElement('a');
        a.href = c.firFile.data;
        a.download = c.firFile.name || `FIR_${c.id}.pdf`;
        a.click();
      };
    }

    if (containerEl) {
      if (c.firFile.type && c.firFile.type.startsWith('image/')) {
        containerEl.innerHTML = `<img src="${c.firFile.data}" style="max-width:100%; max-height:70vh; border-radius:8px; border:1px solid #162a45; display:block; margin:0 auto;" alt="FIR Image">`;
      } else {
        containerEl.innerHTML = `
          <div style="text-align:center; padding: 2rem; background:#071324; border-radius:8px; border:1px solid #162a45;">
            <i class="fa-solid fa-file-pdf text-red" style="font-size:3rem; margin-bottom:1rem; display:block;"></i>
            <div style="font-size:1.1rem; font-weight:700; color:#fff; margin-bottom:0.5rem;">${c.firFile.name}</div>
            <div style="color:#8fa3bf; font-size:0.85rem; margin-bottom:1.5rem;">Size: ${c.firFile.size || 'Document'}</div>
            <a href="${c.firFile.data}" target="_blank" class="tool-btn primary" style="display:inline-flex; align-items:center; gap:8px; padding:0.6rem 1.25rem;">
              <i class="fa-solid fa-arrow-up-right-from-square"></i> Open in New Tab / Download
            </a>
          </div>
        `;
      }
    }

    if (modal) modal.classList.add('active');
  },

  selectCase: function(caseId) {
    const foundCase = (window.CDRDataStore.cases || []).find(c => c.id === caseId);
    if (foundCase) {
      window.CDRDataStore.currentCaseId = foundCase.id;
      const headerTitle = document.getElementById('header-case-title');
      if (headerTitle) headerTitle.innerText = `${foundCase.id} - ${foundCase.title}`;
      const headerDate = document.getElementById('header-last-updated');
      if (headerDate) headerDate.innerText = foundCase.updatedDate;

      if (window.App && window.App.showToast) {
        window.App.showToast(`Switched active investigation to: ${foundCase.id} (${foundCase.title})`, 'info');
      }
      if (window.OverviewModule) window.OverviewModule.renderMetrics();
    }
  },

  deleteCase: function(caseId) {
    if (confirm(`کیا آپ واقعی کیس ${caseId} ڈیلیٹ کرنا چاہتے ہیں؟ (Are you sure you want to delete case ${caseId}?)`)) {
      window.CDRDataStore.cases = (window.CDRDataStore.cases || []).filter(c => c.id !== caseId);
      this.renderCases();
      if (window.OverviewModule) window.OverviewModule.renderMetrics();
      if (window.BackupModule) window.BackupModule.saveToStorage();
      if (window.App && window.App.showToast) {
        window.App.showToast(`کیس ${caseId} ڈیلیٹ کر دیا گیا ہے۔`, 'warning');
      }
    }
  },

  exportCasesCSV: function() {
    const cases = this.getFilteredCases();
    if (cases.length === 0) {
      if (window.App && window.App.showToast) window.App.showToast('No cases to export.', 'warning');
      return;
    }

    let csv = 'Case ID,Title,Offence,Police Station,Investigating Officer,Status,CDRs,Created Date,Updated Date\n';
    cases.forEach(c => {
      csv += `"${c.id}","${c.title}","${c.offence || ''}","${c.policeStation || ''}","${c.investigatingOfficer || ''}","${c.status || ''}","${c.cdrs || 0}","${c.createdDate || ''}","${c.updatedDate || ''}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Cases_Directory_${new Date().toISOString().substring(0,10)}.csv`;
    link.click();
    if (window.App && window.App.showToast) window.App.showToast('Cases exported to CSV successfully!', 'success');
  }
};

// Immediate self-init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.CasesModule.init());
} else {
  window.CasesModule.init();
}