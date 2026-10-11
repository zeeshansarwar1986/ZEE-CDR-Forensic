/* ==========================================================================
   MODULE: EXPORT & REPORTING ENGINE
   ========================================================================== */

window.ExporterModule = {
  init: function() {
    this.bindEvents();
  },

  bindEvents: function() {
    // Top Bar Quick Exporters
    document.getElementById('export-excel-btn')?.addEventListener('click', () => this.exportExcel());
    document.getElementById('export-pdf-btn')?.addEventListener('click', () => this.exportPDF());
    document.getElementById('export-csv-btn')?.addEventListener('click', () => this.exportCSV());
    document.getElementById('export-kml-btn')?.addEventListener('click', () => this.exportKML());
    document.getElementById('capture-screenshot-btn')?.addEventListener('click', () => this.captureScreenshot());

    // Main Exporter Page Buttons
    document.getElementById('btn-export-pdf-main')?.addEventListener('click', () => this.exportPDF());
    document.getElementById('btn-export-excel-main')?.addEventListener('click', () => this.exportExcel());
    document.getElementById('btn-export-kml-main')?.addEventListener('click', () => this.exportKML());
  },

  exportExcel: function() {
    if (typeof XLSX === 'undefined') {
      window.App.showToast('SheetJS library not loaded!', 'danger');
      return;
    }

    const records = window.CDRDataStore.cdrRecords;
    const wb = XLSX.utils.book_new();

    // Sheet 1: Raw CDR Records
    const rawData = records.map(r => ({
      'Record ID': r.id,
      'Target Number': r.targetNumber,
      'B-Party Number': r.bPartyNumber,
      'Operator': r.bPartyOperator,
      'Call Type': r.callType,
      'Timestamp': r.timestamp,
      'Duration (sec)': r.duration,
      'Location': r.locationName,
      'Cell ID': r.cellId,
      'IMEI': r.imei,
      'IMSI': r.imsi
    }));
    const wsRaw = XLSX.utils.json_to_sheet(rawData);
    XLSX.utils.book_append_sheet(wb, wsRaw, 'Raw CDR Data');

    // Sheet 2: Case Summary
    const summaryData = [
      { Metric: 'Case ID', Value: window.CDRDataStore.currentCaseId },
      { Metric: 'Target Phone', Value: window.CDRDataStore.activeTargetNumber },
      { Metric: 'Total Records', Value: records.length },
      { Metric: 'Export Date', Value: new Date().toLocaleString() }
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Case Telemetry');

    XLSX.writeFile(wb, `CDR_Investigation_Case_${window.CDRDataStore.currentCaseId}.xlsx`);
    window.App.showToast('Multi-Tab Excel Workbook Exported!', 'success');
  },

  exportCSV: function() {
    const records = window.CDRDataStore.cdrRecords;
    let csv = 'RecordID,TargetNumber,BPartyNumber,Operator,CallType,Timestamp,Duration,Location,CellID,IMEI,IMSI\n';

    records.forEach(r => {
      csv += `${r.id},${r.targetNumber},${r.bPartyNumber},${r.bPartyOperator},${r.callType},"${r.timestamp}",${r.duration},"${r.locationName}",${r.cellId},${r.imei},${r.imsi}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Raw_CDR_${window.CDRDataStore.currentCaseId}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    window.App.showToast('CSV File Exported Successfully!', 'success');
  },

  exportKML: function() {
    const records = window.CDRDataStore.cdrRecords;
    let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Case ${window.CDRDataStore.currentCaseId} Movement Route</name>
    <Placemark>
      <name>Target Suspect Route</name>
      <LineString>
        <coordinates>
`;
    records.forEach(r => {
      kml += `          ${r.lng},${r.lat},0\n`;
    });

    kml += `        </coordinates>
      </LineString>
    </Placemark>
  </Document>
</kml>`;

    const blob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GPS_Movement_Route_${window.CDRDataStore.currentCaseId}.kml`;
    a.click();
    window.URL.revokeObjectURL(url);
    window.App.showToast('Google Earth KML Route File Generated!', 'success');
  },

  exportPDF: function() {
    window.print();
    window.App.showToast('Printing / PDF Export Dialog Opened!', 'info');
  },

  captureScreenshot: function() {
    if (typeof html2canvas === 'undefined') {
      window.App.showToast('html2canvas library not loaded!', 'danger');
      return;
    }

    const mainEl = document.getElementById('main-content');
    window.App.showToast('Capturing Panel Screenshot...', 'info');

    html2canvas(mainEl, { backgroundColor: '#090d16' }).then(canvas => {
      const link = document.createElement('a');
      link.download = `Investigation_Screenshot_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      window.App.showToast('Screenshot Captured & Downloaded!', 'success');
    }).catch(err => {
      console.error(err);
      window.App.showToast('Screenshot capture failed.', 'danger');
    });
  }
};
