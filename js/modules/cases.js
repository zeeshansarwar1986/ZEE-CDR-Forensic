/* ==========================================================================
   MODULE: CASE MANAGEMENT
   ========================================================================== */

window.CasesModule = {
  eventsBound: false,

  init: function() {
    this.renderCasesTable();
    this.bindEvents();
  },

  renderCasesTable: function(filterText = '') {
    const tbody = document.getElementById('cases-table-body');
    if (!tbody) return;

    const cases = (window.CDRDataStore.cases || []).filter(c => {
      const q = filterText.toLowerCase();
      return (c.id || '').toLowerCase().includes(q) ||
             (c.title || '').toLowerCase().includes(q) ||
             (c.policeStation || '').toLowerCase().includes(q) ||
             (c.investigatingOfficer || '').toLowerCase().includes(q) ||
             (c.offence || '').toLowerCase().includes(q);
    });

    if (cases.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align:center; padding:2rem; color:var(--text-muted);">
            <i class="fa-solid fa-folder-open" style="font-size:1.5rem; margin-bottom:0.5rem; display:block;"></i>
            No investigation cases found matching "${filterText}".
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = cases.map(c => {
      let badgeClass = c.status === 'Active' ? 'active' : (c.status === 'Pending' ? 'type-tag sms' : 'type-tag incoming');
      return `
        <tr>
          <td><strong class="text-cyan">${c.id}</strong></td>
          <td>
            <div><strong>${c.title}</strong></div>
            <div class="text-muted" style="font-size:0.75rem;">${c.description || ''}</div>
          </td>
          <td><span class="type-tag outgoing">${c.offence}</span></td>
          <td>${c.policeStation}</td>
          <td>${c.investigatingOfficer}</td>
          <td><span class="status-badge ${badgeClass}">${c.status}</span></td>
          <td class="text-muted" style="font-size:0.8rem;">${c.updatedDate}</td>
          <td>
            <div style="display:flex; gap:0.4rem;">
              <button class="tool-btn primary btn-select-case" data-id="${c.id}" title="Select Active Case Docket">
                <i class="fa-solid fa-folder-open"></i> Treat
              </button>
              <button class="tool-btn btn-delete-case" data-id="${c.id}" title="Delete Case Docket">
                <i class="fa-solid fa-trash" style="color:#ef4444;"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Update count in sidebar
    const countEl = document.getElementById('sidebar-cases-count');
    if (countEl) countEl.innerText = window.CDRDataStore.cases.length;
  },

  bindEvents: function() {
    if (this.eventsBound) return;
    this.eventsBound = true;

    const searchInput = document.getElementById('search-cases-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.renderCasesTable(e.target.value);
      });
    }

    const saveBtn = document.getElementById('btn-save-new-case');
    if (saveBtn) {
      saveBtn.onclick = () => this.saveNewCase();
    }

    // Delegate table actions
    const tableBody = document.getElementById('cases-table-body');
    if (tableBody) {
      tableBody.addEventListener('click', (e) => {
        const selectBtn = e.target.closest('.btn-select-case');
        if (selectBtn) {
          const caseId = selectBtn.getAttribute('data-id');
          this.selectCase(caseId);
        }

        const deleteBtn = e.target.closest('.btn-delete-case');
        if (deleteBtn) {
          const caseId = deleteBtn.getAttribute('data-id');
          this.deleteCase(caseId);
        }
      });
    }
  },

  saveNewCase: function() {
    const numEl = document.getElementById('new-case-num');
    const titleEl = document.getElementById('new-case-title');
    const offenceEl = document.getElementById('new-case-offence');
    const stationEl = document.getElementById('new-case-station');
    const ioEl = document.getElementById('new-case-io');

    const num = (numEl ? numEl.value : '').trim();
    const title = (titleEl ? titleEl.value : '').trim();
    const offence = (offenceEl ? offenceEl.value : '').trim() || 'Unspecified';
    const station = (stationEl ? stationEl.value : '').trim() || 'Central PS';
    const io = (ioEl ? ioEl.value : '').trim() || 'Investigating Officer';

    if (!num || !title) {
      if (window.App && window.App.showToast) {
        window.App.showToast('Please provide Case Number and Title!', 'danger');
      }
      return;
    }

    const newCase = {
      id: num,
      title: title,
      offence: offence,
      policeStation: station,
      investigatingOfficer: io,
      status: 'Active',
      createdDate: new Date().toISOString().substring(0, 10),
      updatedDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      description: 'Newly registered investigation case docket.',
      targets: ['03005551234']
    };

    window.CDRDataStore.cases.unshift(newCase);
    this.renderCasesTable();
    if (window.OverviewModule) window.OverviewModule.renderMetrics();
    if (window.BackupModule) window.BackupModule.saveToStorage();

    const modal = document.getElementById('modal-add-case');
    if (modal) modal.classList.remove('active');

    // Reset inputs
    if (numEl) numEl.value = '';
    if (titleEl) titleEl.value = '';

    if (window.App && window.App.showToast) {
      window.App.showToast(`New case ${num} created successfully!`, 'success');
    }
  },

  selectCase: function(caseId) {
    const foundCase = (window.CDRDataStore.cases || []).find(c => c.id === caseId);
    if (foundCase) {
      window.CDRDataStore.currentCaseId = foundCase.id;
      const headerTitle = document.getElementById('header-case-title');
      if (headerTitle) headerTitle.innerText = foundCase.title;
      const headerDate = document.getElementById('header-last-updated');
      if (headerDate) headerDate.innerText = foundCase.updatedDate;
      if (window.App && window.App.showToast) {
        window.App.showToast(`Switched active investigation to: ${foundCase.title}`, 'info');
      }
      if (window.OverviewModule) window.OverviewModule.renderMetrics();
    }
  },

  deleteCase: function(caseId) {
    if (confirm(`Are you sure you want to delete case ${caseId}?`)) {
      window.CDRDataStore.cases = (window.CDRDataStore.cases || []).filter(c => c.id !== caseId);
      this.renderCasesTable();
      if (window.OverviewModule) window.OverviewModule.renderMetrics();
      if (window.BackupModule) window.BackupModule.saveToStorage();
      if (window.App && window.App.showToast) {
        window.App.showToast(`Case ${caseId} deleted.`, 'warning');
      }
    }
  }
};