let state = {
  r: []
};

function addRow(type) {
  const tbody = document.getElementById("body-r");

  const row = document.createElement("tr");

  row.innerHTML = `
    <td>${state.r.length + 1}</td>
    <td><input type="text" placeholder="Description"></td>
    <td><input type="text" placeholder="Entity"></td>
    <td><input type="number" placeholder="Amount"></td>
  `;

  tbody.appendChild(row);
  state.r.push({});
}

function switchSection(sec, btn) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  btn.classList.add("active");
}

function updateTitle() {
  const name = document.getElementById("meta-client").value;
  document.title = name + " — Budget Tracker";
}

function exportCSV() {
  alert("CSV export working (you can expand later)");
}

function printView() {
  window.print();
}


// SUBMIT TO BACKEND
function submitData() {
  fetch("http://localhost:5000/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      client: document.getElementById("meta-client").value,
      date: document.getElementById("meta-date").value,
      state: state
    })
  })
  .then(res => res.text())
  .then(data => alert("Data sent successfully"))
  .catch(err => console.error(err));
}