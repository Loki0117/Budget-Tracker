// GST Options - User selectable
const GST_OPTIONS = [0, 5, 12, 18, 28];

// EMPTY DATA ARRAYS - Start fresh with no sample data
let receivablesData = [];  // Start empty - user will add rows
let payablesData = [];     // Start empty - user will add rows

// Helper Functions
function fmt(n) { return '₹' + Math.round(n).toLocaleString('en-IN'); }
function fmtNum(n) { return Math.round(n).toLocaleString('en-IN'); }
function fmtRaw(n) { return Math.round(n); }

function getStatus(total, paid) {
  if (total === 0) return 'outstanding';
  if (paid <= 0) return 'outstanding';
  if (paid >= total * 0.999) return 'cleared';
  return 'partial';
}

function statusBadge(status) {
  const map = {
    outstanding: ['Outstanding', 'status-outstanding'],
    cleared: ['Cleared', 'status-cleared'],
    partial: ['Partial', 'status-partial']
  };
  const [label, cls] = map[status] || map.outstanding;
  return `<span class="status-badge ${cls}">${label}</span>`;
}

function esc(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Get venue details
function getVenueDetails() {
  return {
    venueName: document.getElementById('venueName')?.value || '',
    venueAddress: document.getElementById('venueAddress')?.value || '',
    venueContact: document.getElementById('venueContact')?.value || '',
    venuePhone: document.getElementById('venuePhone')?.value || '',
    venueEmail: document.getElementById('venueEmail')?.value || '',
    venueContract: document.getElementById('venueContract')?.value || ''
  };
}

// Get complete data object for export
function getAllData() {
  const clientName = document.getElementById('metaClient')?.value || 'Client';
  const eventDate = document.getElementById('metaDate')?.value || '';
  const eventType = document.getElementById('metaType')?.value || '';
  const venue = getVenueDetails();
  
  let rTotalBase = 0, rTotalGst = 0, rTotalRecv = 0;
  const receivablesDetail = receivablesData.map((row, i) => {
    const gstAmt = row.base * row.gst / 100;
    const total = row.base + gstAmt;
    rTotalBase += row.base;
    rTotalGst += total;
    rTotalRecv += row.recv;
    return {
      sno: i + 1,
      element: row.el,
      billingEntity: row.entity,
      invoiceNo: row.inv,
      invoiceDate: row.date,
      baseAmount: row.base,
      gstPercent: row.gst,
      totalWithGst: total,
      receivedAmount: row.recv,
      outstandingAmount: total - row.recv,
      paymentStatus: getStatus(total, row.recv),
      comments: row.comment || ''
    };
  });

  let pTotalBase = 0, pTotalGst = 0, pTotalPaid = 0;
  const payablesDetail = payablesData.map((row, i) => {
    const gstAmt = row.base * row.gst / 100;
    const total = row.base + gstAmt;
    pTotalBase += row.base;
    pTotalGst += total;
    pTotalPaid += row.paid;
    return {
      sno: i + 1,
      element: row.el,
      vendorName: row.entity,
      referenceNo: row.ref,
      dueDate: row.date,
      contractedAmount: row.base,
      gstPercent: row.gst,
      totalWithGst: total,
      paidAmount: row.paid,
      balanceDue: total - row.paid,
      paymentStatus: getStatus(total, row.paid),
      comments: row.comment || ''
    };
  });

  const margin = rTotalBase - pTotalBase;
  const marginPct = rTotalBase > 0 ? (margin / rTotalBase * 100) : 0;

  return {
    eventInfo: {
      clientName: clientName,
      eventDate: eventDate,
      eventType: eventType,
      venue: venue,
      generatedOn: new Date().toLocaleString()
    },
    summary: {
      receivablesTotalBase: rTotalBase,
      receivablesTotalWithGst: rTotalGst,
      receivablesReceived: rTotalRecv,
      receivablesOutstanding: rTotalGst - rTotalRecv,
      payablesTotalBase: pTotalBase,
      payablesTotalWithGst: pTotalGst,
      payablesPaid: pTotalPaid,
      payablesBalance: pTotalGst - pTotalPaid,
      grossMargin: margin,
      grossMarginPercent: marginPct
    },
    receivables: receivablesDetail,
    payables: payablesDetail
  };
}

// Render Receivables
function renderReceivables() {
  const tbody = document.getElementById('receivablesBody');
  let totalBase = 0, totalGst = 0, totalRecv = 0;

  tbody.innerHTML = '';
  
  if (receivablesData.length === 0) {
    // Show empty state message
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="13" style="text-align:center; padding:40px; color:#8a6e5a;">
      ✨ No data yet. Click "+ Add New Row" to start adding receivables.
    </td>`;
    tbody.appendChild(tr);
  } else {
    receivablesData.forEach((row, i) => {
      const gstAmt = row.base * row.gst / 100;
      const total = row.base + gstAmt;
      const out = total - row.recv;
      totalBase += row.base;
      totalGst += total;
      totalRecv += row.recv;

      const pct = total > 0 ? Math.min(row.recv / total * 100, 100) : 0;
      const status = getStatus(total, row.recv);
      const gstOptions = GST_OPTIONS.map(g => `<option value="${g}" ${g === row.gst ? 'selected' : ''}>${g}%</option>`).join('');

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="sno-cell">${i + 1}</td>
        <td><input class="table-input" value="${esc(row.el)}" onchange="updateReceivable(${i}, 'el', this.value)" placeholder="Enter description"></td>
        <td><input class="table-input" value="${esc(row.entity)}" onchange="updateReceivable(${i}, 'entity', this.value)" placeholder="Entity name"></td>
        <td><input class="table-input" value="${esc(row.inv)}" onchange="updateReceivable(${i}, 'inv', this.value)" placeholder="INV-000"></td>
        <td><input class="table-input" type="date" value="${row.date}" onchange="updateReceivable(${i}, 'date', this.value)"></td>
        <td><select class="gst-select" onchange="updateReceivable(${i}, 'gst', parseInt(this.value))">${gstOptions}</select></td>
        <td class="right"><span class="computed-amount">${fmtNum(row.base)}</span></td>
        <td class="right"><span class="computed-amount">${fmtNum(total)}</span></td>
        <td><input class="table-input right num" type="number" value="${row.recv}" onchange="updateReceivable(${i}, 'recv', parseFloat(this.value) || 0)" placeholder="0"></td>
        <td class="right"><span class="computed-amount ${out > 0 ? 'red' : 'green'}">${fmtNum(out)}</span></td>
        <td>
          ${statusBadge(status)}
          <div class="progress-wrap"><div class="progress-fill" style="width:${pct.toFixed(1)}%;background:${status === 'cleared' ? '#2a7a4b' : status === 'partial' ? '#ffb703' : '#e8e4dc'}"></div></div>
        </td>
        <td><input class="comments-input" value="${esc(row.comment || '')}" placeholder="Add comment..." onchange="updateReceivable(${i}, 'comment', this.value)"></td>
        <td><button class="del-btn" onclick="deleteReceivable(${i})">×</button></td>
      `;
      tbody.appendChild(tr);
    });
  }

  document.getElementById('receivablesTotalAmount').textContent = fmt(totalBase);
  document.getElementById('receivablesFinalTotal').textContent = fmt(totalGst);
  document.getElementById('receivablesReceivedTotal').textContent = fmt(totalRecv);
  document.getElementById('receivablesOutstandingTotal').textContent = fmt(totalGst - totalRecv);
}

// Render Payables
function renderPayables() {
  const tbody = document.getElementById('payablesBody');
  let totalBase = 0, totalGst = 0, totalPaid = 0;

  tbody.innerHTML = '';
  
  if (payablesData.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="13" style="text-align:center; padding:40px; color:#8a6e5a;">
      ✨ No data yet. Click "+ Add New Vendor" to start adding payables.
    </td>`;
    tbody.appendChild(tr);
  } else {
    payablesData.forEach((row, i) => {
      const gstAmt = row.base * row.gst / 100;
      const total = row.base + gstAmt;
      const balance = total - row.paid;
      totalBase += row.base;
      totalGst += total;
      totalPaid += row.paid;

      const pct = total > 0 ? Math.min(row.paid / total * 100, 100) : 0;
      const status = getStatus(total, row.paid);
      const gstOptions = GST_OPTIONS.map(g => `<option value="${g}" ${g === row.gst ? 'selected' : ''}>${g}%</option>`).join('');

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="sno-cell">${i + 1}</td>
        <td><input class="table-input" value="${esc(row.el)}" onchange="updatePayable(${i}, 'el', this.value)" placeholder="Service description"></td>
        <td><input class="table-input" value="${esc(row.entity)}" onchange="updatePayable(${i}, 'entity', this.value)" placeholder="Vendor name"></td>
        <td><input class="table-input" value="${esc(row.ref)}" onchange="updatePayable(${i}, 'ref', this.value)" placeholder="REF-000"></td>
        <td><input class="table-input" type="date" value="${row.date}" onchange="updatePayable(${i}, 'date', this.value)"></td>
        <td><select class="gst-select" onchange="updatePayable(${i}, 'gst', parseInt(this.value))">${gstOptions}</select></td>
        <td class="right"><span class="computed-amount">${fmtNum(row.base)}</span></td>
        <td class="right"><span class="computed-amount">${fmtNum(total)}</span></td>
        <td><input class="table-input right num" type="number" value="${row.paid}" onchange="updatePayable(${i}, 'paid', parseFloat(this.value) || 0)" placeholder="0"></td>
        <td class="right"><span class="computed-amount ${balance > 0 ? 'red' : 'green'}">${fmtNum(balance)}</span></td>
        <td>
          ${statusBadge(status)}
          <div class="progress-wrap"><div class="progress-fill" style="width:${pct.toFixed(1)}%;background:${status === 'cleared' ? '#2a7a4b' : status === 'partial' ? '#ffb703' : '#e8e4dc'}"></div></div>
        </td>
        <td><input class="comments-input" value="${esc(row.comment || '')}" placeholder="Add comment..." onchange="updatePayable(${i}, 'comment', this.value)"></td>
        <td><button class="del-btn" onclick="deletePayable(${i})">×</button></td>
      `;
      tbody.appendChild(tr);
    });
  }

  document.getElementById('payablesTotalAmount').textContent = fmt(totalBase);
  document.getElementById('payablesFinalTotal').textContent = fmt(totalGst);
  document.getElementById('payablesPaidTotal').textContent = fmt(totalPaid);
  document.getElementById('payablesBalanceTotal').textContent = fmt(totalGst - totalPaid);
}

// Update Functions
function updateReceivable(index, field, value) {
  receivablesData[index][field] = value;
  renderReceivables();
  renderSummary();
}

function updatePayable(index, field, value) {
  payablesData[index][field] = value;
  renderPayables();
  renderSummary();
}

function deleteReceivable(index) {
  receivablesData.splice(index, 1);
  renderReceivables();
  renderSummary();
}

function deletePayable(index) {
  payablesData.splice(index, 1);
  renderPayables();
  renderSummary();
}

function addReceivable() {
  const today = new Date().toISOString().slice(0, 10);
  receivablesData.push({ 
    el: '', 
    entity: '', 
    inv: '', 
    date: today, 
    base: 0, 
    gst: 18, 
    recv: 0, 
    comment: '' 
  });
  renderReceivables();
  renderSummary();
}

function addPayable() {
  const today = new Date().toISOString().slice(0, 10);
  payablesData.push({ 
    el: '', 
    entity: '', 
    ref: '', 
    date: today, 
    base: 0, 
    gst: 18, 
    paid: 0, 
    comment: '' 
  });
  renderPayables();
  renderSummary();
}

// Render Summary
function renderSummary() {
  let rBase = 0, rTotal = 0, rRecv = 0;
  receivablesData.forEach(row => {
    const total = row.base * (1 + row.gst / 100);
    rBase += row.base;
    rTotal += total;
    rRecv += row.recv;
  });
  const rOut = rTotal - rRecv;

  let pBase = 0, pTotal = 0, pPaid = 0;
  payablesData.forEach(row => {
    const total = row.base * (1 + row.gst / 100);
    pBase += row.base;
    pTotal += total;
    pPaid += row.paid;
  });
  const pBal = pTotal - pPaid;
  const margin = rBase - pBase;
  const marginPct = rBase > 0 ? (margin / rBase * 100) : 0;
  const marginColor = marginPct >= 18 ? 'green' : marginPct >= 10 ? 'gold' : 'red';

  document.getElementById('summaryRow').innerHTML = `
    <div class="scard">
      <div class="scard-label">Total Invoice Value</div>
      <div class="scard-val">${fmt(rTotal)}</div>
      <div class="scard-sub">Incl. GST charged to client</div>
    </div>
    <div class="scard green">
      <div class="scard-label">Received from Client</div>
      <div class="scard-val">${fmt(rRecv)}</div>
      <div class="scard-sub">${fmt(rOut)} still outstanding</div>
      <div class="progress-wrap"><div class="progress-fill" style="width:${rTotal > 0 ? Math.min(rRecv / rTotal * 100, 100).toFixed(1) : 0}%;background:#2a7a4b"></div></div>
    </div>
    <div class="scard red">
      <div class="scard-label">Balance Due to Vendors</div>
      <div class="scard-val">${fmt(pBal)}</div>
      <div class="scard-sub">${fmt(pPaid)} already paid</div>
      <div class="progress-wrap"><div class="progress-fill" style="width:${pTotal > 0 ? Math.min(pPaid / pTotal * 100, 100).toFixed(1) : 0}%;background:#c0392b"></div></div>
    </div>
    <div class="scard ${marginColor}">
      <div class="scard-label">Gross Margin</div>
      <div class="scard-val">${fmt(margin)}</div>
      <div class="scard-sub">${marginPct.toFixed(1)}% of base revenue</div>
    </div>
  `;

  document.getElementById('marginText').innerHTML = `<strong>Margin insight:</strong> Base revenue: ${fmt(rBase)} | Vendor costs: ${fmt(pBase)} | Gross margin: <strong style="color:${marginPct >= 18 ? 'var(--green)' : marginPct >= 10 ? 'var(--gold)' : 'var(--red)'}">${fmt(margin)} (${marginPct.toFixed(1)}%)</strong>`;
}

// Export to Excel/CSV
function exportToExcel() {
  const clientName = document.getElementById('metaClient')?.value || 'Budget_Tracker';
  const eventDate = document.getElementById('metaDate')?.value || '';
  const eventType = document.getElementById('metaType')?.value || '';
  const venue = getVenueDetails();
  
  let csvRows = [];
  
  csvRows.push([`"${clientName}_Budget_Tracker"`]);
  csvRows.push([]);
  csvRows.push([`Generated On:`, new Date().toLocaleString()]);
  csvRows.push([`Client Name:`, clientName]);
  csvRows.push([`Event Date:`, eventDate]);
  if (eventType) csvRows.push([`Event Type:`, eventType]);
  csvRows.push([]);
  
  if (venue.venueName) {
    csvRows.push([`Venue Details:`]);
    if (venue.venueName) csvRows.push([`Venue Name:`, venue.venueName]);
    if (venue.venueAddress) csvRows.push([`Address:`, venue.venueAddress]);
    if (venue.venueContact) csvRows.push([`Contact Person:`, venue.venueContact]);
    if (venue.venuePhone) csvRows.push([`Phone:`, venue.venuePhone]);
    if (venue.venueEmail) csvRows.push([`Email:`, venue.venueEmail]);
    if (venue.venueContract) csvRows.push([`Contract #:`, venue.venueContract]);
    csvRows.push([]);
  }
  
  // Receivables Header
  csvRows.push(['=== RECEIVABLES ===']);
  csvRows.push([
    'S.no', 'Elements', 'Billing Entity', 'Invoice #', 'Invoice Date',
    'Base Amount', 'GST %', 'Total incl GST', 'Received Amount', 
    'Outstanding Amount', 'Payment Status', 'Comments'
  ]);
  
  let rTotalBase = 0, rTotalGst = 0, rTotalRecv = 0;
  receivablesData.forEach((row, i) => {
    const gstAmt = row.base * row.gst / 100;
    const total = row.base + gstAmt;
    const out = total - row.recv;
    rTotalBase += row.base;
    rTotalGst += total;
    rTotalRecv += row.recv;
    
    csvRows.push([
      i + 1, row.el, row.entity, row.inv, row.date,
      fmtRaw(row.base), row.gst + '%', fmtRaw(total), 
      fmtRaw(row.recv), fmtRaw(out), getStatus(total, row.recv).toUpperCase(), 
      row.comment || ''
    ]);
  });
  
  csvRows.push([`GRAND TOTAL:`, '', '', '', '', fmtRaw(rTotalBase), '', fmtRaw(rTotalGst), fmtRaw(rTotalRecv), fmtRaw(rTotalGst - rTotalRecv), '', '']);
  csvRows.push([]);
  
  // Payables Header
  csvRows.push(['=== PAYABLES ===']);
  csvRows.push([
    'S.no', 'Service', 'Vendor Name', 'Reference #', 'Due Date',
    'Contracted', 'GST %', 'Total incl GST', 'Paid Amount', 'Balance Due', 'Status', 'Comments'
  ]);
  
  let pTotalBase = 0, pTotalGst = 0, pTotalPaid = 0;
  payablesData.forEach((row, i) => {
    const gstAmt = row.base * row.gst / 100;
    const total = row.base + gstAmt;
    const balance = total - row.paid;
    pTotalBase += row.base;
    pTotalGst += total;
    pTotalPaid += row.paid;
    
    csvRows.push([
      i + 1, row.el, row.entity, row.ref, row.date,
      fmtRaw(row.base), row.gst + '%', fmtRaw(total), 
      fmtRaw(row.paid), fmtRaw(balance), getStatus(total, row.paid).toUpperCase(),
      row.comment || ''
    ]);
  });
  
  csvRows.push([`GRAND TOTAL:`, '', '', '', '', fmtRaw(pTotalBase), '', fmtRaw(pTotalGst), fmtRaw(pTotalPaid), fmtRaw(pTotalGst - pTotalPaid), '', '']);
  csvRows.push([]);
  
  // Summary
  const margin = rTotalBase - pTotalBase;
  const marginPct = rTotalBase > 0 ? (margin / rTotalBase * 100) : 0;
  
  csvRows.push(['=== SUMMARY ===']);
  csvRows.push([`Total Invoiced to Client:`, fmtRaw(rTotalGst)]);
  csvRows.push([`Received from Client:`, fmtRaw(rTotalRecv)]);
  csvRows.push([`Outstanding from Client:`, fmtRaw(rTotalGst - rTotalRecv)]);
  csvRows.push([`Total Vendor Liability:`, fmtRaw(pTotalGst)]);
  csvRows.push([`Paid to Vendors:`, fmtRaw(pTotalPaid)]);
  csvRows.push([`Balance Due to Vendors:`, fmtRaw(pTotalGst - pTotalPaid)]);
  csvRows.push([`Gross Margin:`, `${fmtRaw(margin)} (${marginPct.toFixed(1)}%)`]);
  
  const csvContent = csvRows.map(row => row.join(',')).join('\n');
  const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.setAttribute('download', `${clientName.replace(/\s+/g, '_')}_Budget_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Show All Data Modal
function showAllData() {
  const data = getAllData();
  const modal = document.getElementById('allDataModal');
  const display = document.getElementById('allDataDisplay');
  display.textContent = JSON.stringify(data, null, 2);
  modal.style.display = 'block';
}

function copyDataToClipboard() {
  const data = getAllData();
  const jsonStr = JSON.stringify(data, null, 2);
  navigator.clipboard.writeText(jsonStr).then(() => {
    alert('✅ Data copied to clipboard!');
  }).catch(() => {
    alert('❌ Failed to copy');
  });
}

function downloadAsJSON() {
  const data = getAllData();
  const client = document.getElementById('metaClient')?.value || 'budget';
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${client.replace(/\s+/g, '-')}-budget-data.json`;
  a.click();
}

// Email Modal Functions
function showEmailModal() {
  const modal = document.getElementById('emailModal');
  const clientName = document.getElementById('metaClient')?.value || 'Client';
  document.getElementById('emailSubject').value = `Budget Report - ${clientName} - ${new Date().toISOString().slice(0, 10)}`;
  modal.style.display = 'block';
}

function sendEmailReport() {
  const to = document.getElementById('emailTo').value;
  const subject = document.getElementById('emailSubject').value;
  const message = document.getElementById('emailMessage').value;
  
  if (!to) {
    alert('Please enter recipient email');
    return;
  }
  
  const data = getAllData();
  let body = `Oh Yes Events - Budget Report\n`;
  body += `=========================\n\n`;
  body += `Client: ${data.eventInfo.clientName}\n`;
  body += `Event Date: ${data.eventInfo.eventDate}\n`;
  body += `Generated: ${data.eventInfo.generatedOn}\n\n`;
  if (message) body += `Message: ${message}\n\n`;
  body += `Total Invoiced: ${fmt(data.summary.receivablesTotalWithGst)}\n`;
  body += `Received: ${fmt(data.summary.receivablesReceived)}\n`;
  body += `Outstanding: ${fmt(data.summary.receivablesOutstanding)}\n`;
  body += `Gross Margin: ${fmt(data.summary.grossMargin)} (${data.summary.grossMarginPercent.toFixed(1)}%)\n`;
  
  window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  
  setTimeout(() => {
    document.getElementById('emailModal').style.display = 'none';
  }, 1000);
}

function printView() { window.print(); }

// Tab Switching
function switchSection(section) {
  const receivablesSec = document.getElementById('secReceivables');
  const payablesSec = document.getElementById('secPayables');
  const tabs = document.querySelectorAll('.tab');

  if (section === 'receivables') {
    receivablesSec.style.display = '';
    payablesSec.style.display = 'none';
    tabs[0].classList.add('active');
    tabs[1].classList.remove('active');
  } else {
    receivablesSec.style.display = 'none';
    payablesSec.style.display = '';
    tabs[0].classList.remove('active');
    tabs[1].classList.add('active');
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  renderReceivables();
  renderPayables();
  renderSummary();

  document.getElementById('addReceivableBtn')?.addEventListener('click', addReceivable);
  document.getElementById('addPayableBtn')?.addEventListener('click', addPayable);
  document.getElementById('exportBtn')?.addEventListener('click', exportToExcel);
  document.getElementById('exportFullDataBtn')?.addEventListener('click', showAllData);
  document.getElementById('emailBtn')?.addEventListener('click', showEmailModal);
  document.getElementById('printBtn')?.addEventListener('click', printView);
  
  // Modal close buttons
  document.querySelector('.close')?.addEventListener('click', () => {
    document.getElementById('emailModal').style.display = 'none';
  });
  document.querySelector('.close-data')?.addEventListener('click', () => {
    document.getElementById('allDataModal').style.display = 'none';
  });
  document.getElementById('cancelEmailBtn')?.addEventListener('click', () => {
    document.getElementById('emailModal').style.display = 'none';
  });
  document.getElementById('sendEmailBtn')?.addEventListener('click', sendEmailReport);
  document.getElementById('copyDataBtn')?.addEventListener('click', copyDataToClipboard);
  document.getElementById('downloadDataBtn')?.addEventListener('click', downloadAsJSON);
  
  window.addEventListener('click', (e) => {
    const emailModal = document.getElementById('emailModal');
    const dataModal = document.getElementById('allDataModal');
    if (e.target === emailModal) emailModal.style.display = 'none';
    if (e.target === dataModal) dataModal.style.display = 'none';
  });

  document.querySelectorAll('.tab').forEach((tab, idx) => {
    tab.addEventListener('click', () => switchSection(idx === 0 ? 'receivables' : 'payables'));
  });
});
