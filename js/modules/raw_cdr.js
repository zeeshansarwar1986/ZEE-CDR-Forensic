/* ==========================================================================
   MODULE: RAW CDR VIEWER & SMART DATA GRID
   ========================================================================== */

window.RawCDRModule = {
  currentPage: 1,
  pageSize: 25,
  currentSortField: 'id',
  currentSortAsc: true,
  filteredRecords: [],

  init: function() {
    this.filteredRecords = [...window.CDRDataStore.cdrRecords];
    this.bindEvents();
    this.renderGrid();
  },

  bindEvents: function() {
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
        const totalPages = Math.ceil(this.filteredRecords.length / this.pageSize);
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
    const q = (document.getElementById('raw-cdr-search')?.value || '').toLowerCase();
    const type = document.getElementById('raw-cdr-filter-type')?.value || 'ALL';

    this.filteredRecords = window.CDRDataStore.cdrRecords.filter(r => {
      const matchSearch = r.bPartyNumber.toLowerCase().includes(q) ||
                          r.locationName.toLowerCase().includes(q) ||
                          r.imei.toLowerCase().includes(q) ||
                          r.cellId.toLowerCase().includes(q);
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
    const startIdx = (this.currentPage - 1) * this.pageSize;
    const endIdx = Math.min(startIdx + this.pageSize, totalRecords);
    const pageRecords = this.filteredRecords.slice(startIdx, endIdx);

    // Update labels
    document.getElementById('current-page-num').innerText = this.currentPage;
    document.getElementById('total-pages-num').innerText = totalPages;
    document.getElementById('raw-cdr-total-label').innerText = `Showing ${totalRecords > 0 ? startIdx + 1 : 0}-${endIdx} of ${totalRecords.toLocaleString()} records`;

    tbody.innerHTML = pageRecords.map(r => {
      const opClass = r.bPartyOperator.toLowerCase();
      const typeClass = r.callType.toLowerCase();
      const movement = (r.cellId.includes('F6') || r.cellId.includes('F7')) ? 'North <i class="fa-solid fa-arrow-right"></i> Central' : 'Central <i class="fa-solid fa-arrow-down"></i> South';

      return `
        <tr>
          <td><strong class="text-muted">${r.id}</strong></td>
          <td class="text-mono">${r.timestamp}</td>
          <td><strong class="text-cyan">${r.bPartyNumber}</strong></td>
          <td><span class="operator-tag ${opClass}">${r.bPartyOperator}</span></td>
          <td><span class="type-tag ${typeClass}">${r.callType}</span></td>
          <td class="text-mono">${r.duration}s</td>
          <td>
            <div><strong>${r.locationName}</strong></div>
            <span class="text-dim" style="font-size:0.75rem;">${r.cellId}</span>
          </td>
          <td><span class="direction-indicator">${movement}</span></td>
          <td class="text-mono text-muted">${r.mfc}</td>
          <td class="text-mono" style="font-size:0.75rem;">${r.imei}</td>
        </tr>
      `;
    }).join('');
  }
};
