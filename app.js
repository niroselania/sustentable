const COLUMNS = [
  "item",
  "ticket",
  "aplicacion",
  "detalle",
  "fecha_estimada",
  "horas_estimadas",
  "estado",
];

const state = {
  tickets: [],
  filter: "todos",
  updatedAt: null,
  dirty: false,
};

const tableBody = document.getElementById("tableBody");
const emptyState = document.getElementById("emptyState");
const statusBox = document.getElementById("status");
const statsBox = document.getElementById("stats");
const addRowBtn = document.getElementById("addRowBtn");
const saveBtn = document.getElementById("saveBtn");
const exportBtn = document.getElementById("exportBtn");
const importInput = document.getElementById("importInput");
const filterButtons = Array.from(document.querySelectorAll(".filter"));

function setStatus(text) {
  statusBox.textContent = text;
}

function emptyTicket() {
  return {
    item: "",
    ticket: "",
    aplicacion: "",
    detalle: "",
    fecha_estimada: "",
    horas_estimadas: "",
    estado: "abierto",
  };
}

function normalizeEstado(value) {
  const text = String(value || "").trim().toLowerCase();
  if (["cerrado", "closed", "resuelto", "finalizado"].includes(text)) {
    return "cerrado";
  }
  return "abierto";
}

function toDateInputValue(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  const isoMatch = raw.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const arMatch = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (arMatch) {
    const [, day, month, year] = arMatch;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const day = String(parsed.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  return "";
}

function renderFechaCell(ticket, realIndex) {
  const raw = ticket.fecha_estimada || "";
  const dateValue = toDateInputValue(raw);
  const textValue = dateValue ? "" : raw;

  if (textValue) {
    return `
      <div class="fecha-cell">
        <input type="date" data-index="${realIndex}" data-field="fecha_estimada" value="">
        <input
          type="text"
          class="fecha-texto"
          data-index="${realIndex}"
          data-field="fecha_estimada_texto"
          value="${escapeHtml(textValue)}"
          placeholder="Texto libre (opcional)"
        >
      </div>
    `;
  }

  return `
    <input
      type="date"
      data-index="${realIndex}"
      data-field="fecha_estimada"
      value="${escapeHtml(dateValue)}"
    >
  `;
}

function visibleTickets() {
  if (state.filter === "todos") return state.tickets;
  return state.tickets.filter((ticket) => normalizeEstado(ticket.estado) === state.filter);
}

function updateStats() {
  const abiertos = state.tickets.filter((t) => normalizeEstado(t.estado) === "abierto").length;
  const cerrados = state.tickets.filter((t) => normalizeEstado(t.estado) === "cerrado").length;
  statsBox.innerHTML = `
    <span><strong>${state.tickets.length}</strong> total</span>
    <span><strong>${abiertos}</strong> abiertos</span>
    <span><strong>${cerrados}</strong> cerrados</span>
  `;
}

function markDirty() {
  state.dirty = true;
  setStatus("Hay cambios sin guardar.");
}

function renderTable() {
  const rows = visibleTickets();
  tableBody.innerHTML = "";

  rows.forEach((ticket) => {
    const realIndex = state.tickets.indexOf(ticket);
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td><input type="text" data-index="${realIndex}" data-field="item" value="${escapeHtml(ticket.item)}"></td>
      <td><input type="text" data-index="${realIndex}" data-field="ticket" value="${escapeHtml(ticket.ticket)}"></td>
      <td><input type="text" data-index="${realIndex}" data-field="aplicacion" value="${escapeHtml(ticket.aplicacion)}"></td>
      <td><textarea data-index="${realIndex}" data-field="detalle">${escapeHtml(ticket.detalle)}</textarea></td>
      <td>${renderFechaCell(ticket, realIndex)}</td>
      <td><input type="text" data-index="${realIndex}" data-field="horas_estimadas" value="${escapeHtml(ticket.horas_estimadas)}"></td>
      <td>
        <select data-index="${realIndex}" data-field="estado">
          <option value="abierto" ${normalizeEstado(ticket.estado) === "abierto" ? "selected" : ""}>Abierto</option>
          <option value="cerrado" ${normalizeEstado(ticket.estado) === "cerrado" ? "selected" : ""}>Cerrado</option>
        </select>
      </td>
      <td><button type="button" class="danger" data-delete="${realIndex}">Borrar</button></td>
    `;

    tableBody.appendChild(tr);
  });

  emptyState.hidden = rows.length > 0;
  updateStats();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function bindTableEvents() {
  tableBody.addEventListener("input", (event) => {
    const target = event.target;
    const index = Number(target.dataset.index);
    const field = target.dataset.field;
    if (!Number.isInteger(index) || !field) return;

    if (field === "fecha_estimada") {
      state.tickets[index].fecha_estimada = target.value;
    } else if (field === "fecha_estimada_texto") {
      state.tickets[index].fecha_estimada = target.value;
    } else {
      state.tickets[index][field] = target.value;
    }
    markDirty();
  });

  tableBody.addEventListener("change", (event) => {
    const target = event.target;
    const index = Number(target.dataset.index);
    const field = target.dataset.field;
    if (!Number.isInteger(index) || !field) return;

    if (field === "estado") {
      state.tickets[index][field] = normalizeEstado(target.value);
      markDirty();
      renderTable();
      return;
    }

    if (field === "fecha_estimada" && target.value) {
      state.tickets[index].fecha_estimada = target.value;
      markDirty();
      renderTable();
      return;
    }

    state.tickets[index][field] = target.value;
    markDirty();
  });

  tableBody.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (!target.dataset.delete) return;
    const index = Number(target.dataset.delete);
    state.tickets.splice(index, 1);
    markDirty();
    renderTable();
  });
}

function setFilter(filter) {
  state.filter = filter;
  filterButtons.forEach((button) => {
    const active = button.dataset.filter === filter;
    button.classList.toggle("active", active);
    button.classList.toggle("secondary", !active);
  });
  renderTable();
}

async function loadTickets() {
  setStatus("Cargando datos...");
  const response = await fetch("/api/tickets");
  if (!response.ok) throw new Error("No se pudieron cargar los tickets");
  const payload = await response.json();
  state.tickets = (payload.tickets || []).map((ticket) => ({
    ...emptyTicket(),
    ...ticket,
    estado: normalizeEstado(ticket.estado),
  }));
  state.updatedAt = payload.updatedAt || null;
  state.dirty = false;
  renderTable();
  const updated = state.updatedAt
    ? new Date(state.updatedAt * 1000).toLocaleString("es-AR")
    : "sin guardar aún";
  setStatus(`Listo. Última actualización: ${updated}.`);
}

async function saveTickets() {
  saveBtn.disabled = true;
  setStatus("Guardando...");
  try {
    const response = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tickets: state.tickets }),
    });
    if (!response.ok) throw new Error("No se pudo guardar");
    const payload = await response.json();
    state.updatedAt = payload.updatedAt;
    state.dirty = false;
    setStatus(`Guardado correctamente (${new Date(state.updatedAt * 1000).toLocaleString("es-AR")}).`);
  } catch (error) {
    setStatus(error.message || "Error al guardar");
  } finally {
    saveBtn.disabled = false;
  }
}

async function importExcel(file) {
  const formData = new FormData();
  formData.append("file", file);
  setStatus("Importando Excel...");
  const response = await fetch("/api/import", {
    method: "POST",
    body: formData,
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "No se pudo importar el Excel");
  state.tickets = (payload.tickets || []).map((ticket) => ({
    ...emptyTicket(),
    ...ticket,
    estado: normalizeEstado(ticket.estado),
  }));
  state.updatedAt = payload.updatedAt;
  state.dirty = false;
  renderTable();
  setStatus(`Importación completa: ${state.tickets.length} filas cargadas.`);
}

function exportExcel() {
  window.location.href = "/api/export";
}

addRowBtn.addEventListener("click", () => {
  const nextItem = state.tickets.length
    ? String(Number(state.tickets[state.tickets.length - 1].item || state.tickets.length) + 1)
    : "1";
  state.tickets.push({ ...emptyTicket(), item: nextItem });
  markDirty();
  renderTable();
});

saveBtn.addEventListener("click", saveTickets);
exportBtn.addEventListener("click", exportExcel);

importInput.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  importInput.value = "";
  if (!file) return;
  try {
    await importExcel(file);
  } catch (error) {
    setStatus(error.message || "Error al importar");
  }
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => setFilter(button.dataset.filter));
});

window.addEventListener("beforeunload", (event) => {
  if (!state.dirty) return;
  event.preventDefault();
  event.returnValue = "";
});

bindTableEvents();
loadTickets().catch((error) => setStatus(error.message || "Error al iniciar"));
