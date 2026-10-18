/* ==========================================================================
   MODULE: RAW CDR VIEWER & SMART DATA GRID
   ========================================================================== */

window.RawCDRModule = {
  currentPage: 1,
  pageSize: 25,
  currentSortField: 'id',
  currentSortAsc: true,
  filteredRecords: [],
  eventsBound: false,

  init: function() {
    this.filteredRecords = [...(window.CDRDataStore.cdrRecords || [])];
    this.bindEvents();
    this.applySort();
    this.renderGrid();
  },

  bindEvents: function() {
    if (this.eventsBound) return;
    this.eventsBound = true;

    const searchInput = document.getElementById('raw-cdr-search');
    if (searchInput) {
      searchInput.addEventListener('input', () => this.applyFilters());
    }

    const typeSelect = document.getElementById('raw-cdr-filter-type');
    if (typeSelect) {
      typeSelect.addEventListener('change', () => this.applyFilters());
    }

    const prevBtn = document.getElementById('btn-prev-page');
    if (prevBtn) {
      prevBtn.onclick = () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.renderGrid();
        }
      };
    }

    const nextBtn = document.getElementById('btn-next-page');
    if (nextBtn) {
      nextBtn.onclick = () => {
        const totalPages = Math.max(1, Math.ceil(this.filteredRecords.length / this.pageSize));
        if (this.currentPage < totalPages) {
          this.currentPage++;
          this.renderGrid();
        }
      };
    }

    // Sort headers
    document.querySelectorAll('.cyber-table th.sortable').forEach(th => {
      th.onclick = () => {
        const field = th.getAttribute('data-sort');
        if (this.currentSortField === field) {
          this.currentSortAsc = !this.currentSortAsc;
        } else {
          this.currentSortField = field;
          this.currentSortAsc = true;
        }
        this.applySort();
        this.renderGrid();
      };
    });
  },

  applyFilters: function() {
    const q = (document.getElementById('raw-cdr-search')?.value || '').trim().toLowerCase();
    const type = document.getElementById('raw-cdr-filter-type')?.value || 'ALL';

    const records = window.CDRDataStore.cdrRecords || [];

    this.filteredRecords = records.filter(r => {
      const bParty = (r.bPartyNumber || '').toLowerCase();
      const loc = (r.locationName || '').toLowerCase();
      const imei = (r.imei || '').toLowerCase();
      const cell = (r.cellId || '').toLowerCase();
      const op = (r.bPartyOperator || '').toLowerCase();

      const matchSearch = !q || bParty.includes(q) || loc.includes(q) || imei.includes(q) || cell.includes(q) || op.includes(q);
      const matchType = (type === 'ALL') || (r.callType === type);
      return matchSearch && matchType;
    });

    this.currentPage = 1;
    this.applySort();
    this.renderGrid();
  },

  applySort: function() {
    this.filteredRecords.sort((a, b) => {
      let valA = a[this.currentSortField];
      let valB = b[this.currentSortField];
      if (valA === undefined) valA = '';
      if (valB === undefined) valB = '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return this.currentSortAsc ? -1 : 1;
      if (valA > valB) return this.currentSortAsc ? 1 : -1;
      return 0;
    });
  },

  renderGrid: function() {
    const tbody = document.getElementById('raw-cdr-table-body');
    if (!tbody) return;

    const totalRecords = this.filteredRecords.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / this.pageSize));
    if (this.currentPage > totalPages) this.currentPage = totalPages;

    const startIdx = (this.currentPage - 1) * this.pageSize;
    const endIdx = Math.min(startIdx + this.pageSize, totalRecords);
    const pageRecords = this.filteredRecords.slice(startIdx, endIdx);

    // Update labels safely
    const curPageEl = document.getElementById('current-page-num');
    const totPageEl = document.getElementById('total-pages-num');
    const totalLblEl = document.getElementById('raw-cdr-total-label');

    if (curPageEl) curPageEl.innerText = this.currentPage;
    if (totPageEl) totPageEl.innerText = totalPages;
    if (totalLblEl) {
      totalLblEl.innerText = Showing - of  records;
    }

    if (pageRecords.length === 0) {
      tbody.innerHTML = 
        <tr>
          <td colspan="10" style="text-align:center; padding:2rem; color:var(--text-muted);">
            <i class="fa-solid fa-folder-open" style="font-size:1.5rem; margin-bottom:0.5rem; display:block;"></i>
            No CDR records match the current search or filters.
          </td>
        </tr>
      ;
      return;
    }

    tbody.innerHTML = pageRecords.map(r => {
      const op = r.bPartyOperator || 'Other';
      const opClass = op.toLowerCase();
      const callType = r.callType || 'Call';
      const typeClass = callType.toLowerCase();
      const cellId = r.cellId || '';
      const movement = (cellId.includes('F6') || cellId.includes('F7')) ? 'North <i class="fa-solid fa-arrow-right"></i> Central' : 'Central <i class="fa-solid fa-arrow-down"></i> South';

      return 
        <tr>
          <td><strong class="text-muted"></strong></td>
          <td class="text-mono"></td>
          <td><strong class="text-cyan"></strong></td>
          <td><span class="operator-tag "></span></td>
          <td><span class="type-tag "></span></td>
          <td class="text-mono">s</td>
          <td>
            <div><strong></strong></div>
            <span class="text-dim" style="font-size:0.75rem;"></span>
          </td>
          <td><span class="direction-indicator"></span></td>
          <td class="text-mono text-muted"></td>
          <td class="text-mono" style="font-size:0.75rem;"></td>
        </tr>
      ;
    }).join('');
  }
};