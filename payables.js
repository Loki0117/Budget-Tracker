const GST_OPTIONS = [0, 5, 12, 18, 28];

let payablesData = [
  { el: 'Venue Booking', entity: 'MGM Resorts', ref: 'VND-001', date: '2026-03-01', base: 700000, gst: 18, paid: 210000 },
  { el: 'Photography', entity: 'Wedding Artist', ref: 'VND-002', date: '2026-03-20', base: 420000, gst: 12, paid: 126000 },
  { el: 'Mehandi Artist', entity: 'Nivethetha', ref: 'VND-003', date: '2026-03-25', base: 18000, gst: 18, paid: 18000 },
  { el: 'Makeup Artist', entity: 'Ratna Makeup', ref: 'VND-004', date: '2026-04-15', base: 175000, gst: 18, paid: 52500 },
  { el: 'DJ & Sound', entity: 'Beats Co.', ref: 'VND-005', date: '2026-05-01', base: 80000, gst: 18, paid: 24000 }
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
  const tbody = document.getElementById('payablesBody');
  let totalBase = 0, totalGst = 0, totalPaid = 0;

  tbody.innerHTML = '';
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
      <td><input class="editable" value="${esc(row.el)}" onchange="updateRow(${i}, 'el', this.value)"></td>
      <td><input class="editable" value="${esc(row.entity)}" onchange="updateRow(${i}, 'entity', this.value)"></td>
      <td><input class="editable" value="${esc(row.ref)}" onchange="updateRow(${i}, 'ref', this.value)"></td>
      <td><input class="editable" type="date" value="${row.date}" onchange="updateRow(${i}, 'date', this.value)"></td>
      <td><input class="editable right num" type="number" value="${row.base}" onchange="updateRow(${i}, 'base', parseFloat(this.value) || 0)"></td>
      <td><select class="gst-sel" onchange="updateRow(${i}, 'gst', parseInt(this.value))">${gstOptions}</select></td>
      <td class="computed">${fmtNum(total)}</td>
      <td><input class="editable right num" type="number" value="${row.paid}" onchange="updateRow(${i}, 'paid', parseFloat(this.value) || 0)"></td>
      <td class="computed ${balance > 0 ? 'red' : 'green'}">${fmtNum(balance)}</td>
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
  document.getElementById('paidTotal').textContent = fmt(totalPaid);
  document.getElementById('balanceTotal').textContent = fmt(totalGst - totalPaid);

  // Update summary stats
  const paymentRate = totalGst > 0 ? (totalPaid / totalGst * 100).toFixed(1) : 0;
  document.getElementById('statTotal').textContent = fmt(totalGst);
  document.getElementById('statPaid').textContent = fmt(totalPaid);
  document.getElementById('statBalance').textContent = fmt(totalGst - totalPaid);
  document.getElementById('statRate').textContent = paymentRate + '%';
}

function updateRow(index, field, value) {
  payablesData[index][field] = value;
  render();
}

function deleteRow(index) {
  if (payablesData.length > 1) {
    payablesData.splice(index, 1);
  } else {
    payablesData[index] = { el: '', entity: '', ref: '', date: '', base: 0, gst: 18, paid: 0 };
  }
  render();
}

function addRow() {
  const today = new Date().toISOString().slice(0, 10);
  payablesData.push({ el: '', entity: '', ref: '', date: today, base: 0, gst: 18, paid: 0 });
  render();
}

function exportCSV() {
  const eventName = document.getElementById('metaEvent')?.value || 'Event';
  let csv = `Event,${eventName}\nEvent Date,${document.getElementById('metaDate')?.value || ''}\n\n`;
  csv += 'PAYABLES\nS.No,Element,Vendor,Reference #,Due Date,Contracted,GST %,Total incl GST,Paid,Balance\n';
  payablesData.forEach((row, i) => {
    const total = row.base * (1 + row.gst / 100);
    csv += `${i + 1},"${row.el}","${row.entity}","${row.ref}","${row.date}",${row.base},${row.gst}%,${Math.round(total)},${row.paid},${Math.round(total - row.paid)}\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${eventName.replace(/\s+/g, '-')}-payables.csv`;
  a.click();
}

function printView() { window.print(); }

document.addEventListener('DOMContentLoaded', () => {
  render();
  document.getElementById('addRowBtn')?.addEventListener('click', addRow);
  document.getElementById('exportPayablesBtn')?.addEventListener('click', exportCSV);
  document.getElementById('printPayablesBtn')?.addEventListener('click', printView);
});
