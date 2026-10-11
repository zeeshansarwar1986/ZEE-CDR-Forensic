/* ==========================================================================
   MODULE: CASE MANAGEMENT
   ========================================================================== */

window.CasesModule = {
  init: function() {
    this.renderCasesTable();
    this.bindEvents();
  },

  renderCasesTable: function(filterText = '') {
    const tbody = document.getElementById('cases-table-body');
    if (!tbody) return;

    const cases = window.CDRDataStore.cases.filter(c => {
      const q = filterText.toLowerCase();
      return c.id.toLowerCase().includes(q) ||
             c.title.toLowerCase().includes(q) ||
             c.policeStation.toLowerCase().includes(q) ||
             c.investigatingOfficer.toLowerCase().includes(q);
    });

    tbody.innerHTML = cases.map(c => {
      let badgeClass = c.status === 'Active' ? 'active' : (c.status === 'Pending' ? 'type-tag sms' : 'type-tag incoming');
      return `
        <tr>
          <td><strong class="text-cyan">${c.id}</strong></td>
          <td>
            <div><strong>${c.title}</strong></div>
            <div class="text-muted" style="font-size:0.75rem;">${c.description}</div>
          </td>
          <td><span class="type-tag outgoing">${c.offence}</span></td>
          <td>${c.policeStation}</td>
          <td>${c.investigatingOfficer}</td>
          <td><span class="status-badge ${badgeClass}">${c.status}</span></td>
          <td class="text-muted">${c.updatedDate}</td>
          <td>
            <div style="display:flex; gap:0.4rem;">
              <button class="tool-btn primary btn-select-case" data-id="${c.id}" title="Select & Treat Case">
                <i class="fa-solid fa-folder-open"></i> Treat
              </button>
              <button class="tool-btn btn-delete-case" data-id="${c.id}" title="Delete Case">
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
    document.getElementById('cases-table-body').addEventListener('click', (e) => {
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
  },

  saveNewCase: function() {
    const num = document.getElementById('new-case-num').value.trim();
    const title = document.getElementById('new-case-title').value.trim();
    const offence = document.getElementById('new-case-offence').value.trim() || 'Unspecified';
    const station = document.getElementById('new-case-station').value.trim() || 'Central PS';
    const io = document.getElementById('new-case-io').value.trim() || 'Investigating Officer';

    if (!num || !title) {
      window.App.showToast('Please provide Case Number and Title!', 'danger');
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
    document.getElementById('modal-add-case').classList.remove('active');
    window.App.showToast(`New case ${num} created successfully!`, 'success');
  },

  selectCase: function(caseId) {
    const foundCase = window.CDRDataStore.cases.find(c => c.id === caseId);
    if (foundCase) {
      window.CDRDataStore.currentCaseId = foundCase.id;
      document.getElementById('header-case-title').innerText = foundCase.title;
      document.getElementById('header-last-updated').innerText = foundCase.updatedDate;
      window.App.showToast(`Switched active investigation to ${foundCase.title}`, 'info');
    }
  },

  deleteCase: function(caseId) {
    if (confirm(`Are you sure you want to delete case ${caseId}?`)) {
      window.CDRDataStore.cases = window.CDRDataStore.cases.filter(c => c.id !== caseId);
      this.renderCasesTable();
      window.App.showToast(`Case ${caseId} deleted.`, 'warning');
    }
  }
};
