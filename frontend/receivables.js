const GST_OPTIONS = [0, 5, 12, 18, 28];

let receivablesData = [
  { el: 'Planning & Execution Fee', entity: 'Oh Yes Events', inv: 'INV-000484', date: '2026-02-14', base: 450000, gst: 18, recv: 371700 },
  { el: 'Venue', entity: 'MGM Resorts', inv: 'INV-000486', date: '2026-02-22', base: 825000, gst: 18, recv: 486750 },
  { el: 'Photography', entity: 'Wedding Artist', inv: 'INV-000500', date: '2026-03-18', base: 495000, gst: 12, recv: 292050 },
  { el: 'Mehandi Artist', entity: 'Nivethetha', inv: 'INV-000503', date: '2026-03-23', base: 21350, gst: 18, recv: 12597 },
  { el: 'Makeup Artist', entity: 'Ratna Makeup', inv: 'INV-000525', date: '2026-04-11', base: 206000, gst: 18, recv: 121540 }
];

function fmt(n) { return '₹' + Math.round(n).toLocaleString('en-IN'); }
function fmtNum(n) { return Math.round(n).toLocaleString('en-IN'); }

function getStatus(total, paid) {
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

function render() {
  const tbody = document.getElementById('receivablesBody');
  let totalBase = 0, totalGst = 0, totalRecv = 0;

  tbody.innerHTML = '';
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
      <td><input class="editable" value="${esc(row.el)}" onchange="updateRow(${i}, 'el', this.value)"></td>
      <td><input class="editable" value="${esc(row.entity)}" onchange="updateRow(${i}, 'entity', this.value)"></td>
      <td><input class="editable" value="${esc(row.inv)}" onchange="updateRow(${i}, 'inv', this.value)"></td>
      <td><input class="editable" type="date" value="${row.date}" onchange="updateRow(${i}, 'date', this.value)"></td>
      <td><input class="editable right num" type="number" value="${row.base}" onchange="updateRow(${i}, 'base', parseFloat(this.value) || 0)"></td>
      <td><select class="gst-sel" onchange="updateRow(${i}, 'gst', parseInt(this.value))">${gstOptions}</select></td>
      <td class="computed">${fmtNum(total)}</td>
      <td><input class="editable right num" type="number" value="${row.recv}" onchange="updateRow(${i}, 'recv', parseFloat(this.value) || 0)"></td>
      <td class="computed ${out > 0 ? 'red' : 'green'}">${fmtNum(out)}</td>
      <td style="padding:6px 12px">
        ${statusBadge(status)}
        <div class="progress-wrap"><div class="progress-fill" style="width:${pct.toFixed(1)}%;background:${status === 'cleared' ? '#2a7a4b' : status === 'partial' ? '#c87a1a' : '#e8e4dc'}"></div></div>
      </td>
      <td><button class="del-btn" onclick="deleteRow(${i})">×</button></td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById('baseTotal').textContent = fmt(totalBase);
  document.getElementById('gstTotal').textContent = fmt(totalGst);
  document.getElementById('receivedTotal').textContent = fmt(totalRecv);
  document.getElementById('outstandingTotal').textContent = fmt(totalGst - totalRecv);

  // Update summary stats
  const collectionRate = totalGst > 0 ? (totalRecv / totalGst * 100).toFixed(1) : 0;
  document.getElementById('statTotal').textContent = fmt(totalGst);
  document.getElementById('statReceived').textContent = fmt(totalRecv);
  document.getElementById('statOutstanding').textContent = fmt(totalGst - totalRecv);
  document.getElementById('statRate').textContent = collectionRate + '%';
}

function updateRow(index, field, value) {
  receivablesData[index][field] = value;
  render();
}

function deleteRow(index) {
  if (receivablesData.length > 1) {
    receivablesData.splice(index, 1);
  } else {
    receivablesData[index] = { el: '', entity: '', inv: '', date: '', base: 0, gst: 18, recv: 0 };
  }
  render();
}

function addRow() {
  const today = new Date().toISOString().slice(0, 10);
  receivablesData.push({ el: '', entity: '', inv: '', date: today, base: 0, gst: 18, recv: 0 });
  render();
}

function exportCSV() {
  const client = document.getElementById('metaClient')?.value || 'Client';
  let csv = `Client,${client}\nEvent Date,${document.getElementById('metaDate')?.value || ''}\nEvent Type,${document.getElementById('metaType')?.value || ''}\n\n`;
  csv += 'RECEIVABLES\nS.No,Element,Billing Entity,Invoice #,Date,Base Amount,GST %,Total incl GST,Received,Outstanding\n';
  receivablesData.forEach((row, i) => {
    const total = row.base * (1 + row.gst / 100);
    csv += `${i + 1},"${row.el}","${row.entity}","${row.inv}","${row.date}",${row.base},${row.gst}%,${Math.round(total)},${row.recv},${Math.round(total - row.recv)}\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${client.replace(/\s+/g, '-')}-receivables.csv`;
  a.click();
}

function printView() { window.print(); }

document.addEventListener('DOMContentLoaded', () => {
  render();
  document.getElementById('addRowBtn')?.addEventListener('click', addRow);
  document.getElementById('exportReceivablesBtn')?.addEventListener('click', exportCSV);
  document.getElementById('printReceivablesBtn')?.addEventListener('click', printView);
});