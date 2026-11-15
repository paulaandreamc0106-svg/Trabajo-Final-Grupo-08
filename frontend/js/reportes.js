import { api } from "./api.js";
import { badgeEstado, formatearFecha, escapeHTML, showToast } from "./state.js";

export async function renderReportes(container) {
  let tabActiva = "activos";
  let resumen = null;
  let activos = [];
  let historial = [];

  async function cargarDatos() {
    try {
      [resumen, activos, historial] = await Promise.all([
        api.obtenerResumen(),
        api.obtenerPrestamosActivos(),
        api.obtenerHistorialPrestamos(),
      ]);
      pintar();
    } catch (error) {
      showToast(error.message, "error");
      container.innerHTML = `<div class="card empty-state">${escapeHTML(error.message)}</div>`;
    }
  }

  function exportarCSV(registros, nombreArchivo) {
    if (!registros.length) {
      showToast("No hay datos disponibles para exportar.", "info");
      return;
    }
    const encabezados = [
      "Prestamo_ID",
      "Solicitud_ID",
      "Solicitante",
      "Codigo_Recurso",
      "Recurso",
      "Entrega_Real",
      "Devolucion_Prevista",
      "Devolucion_Real",
      "Estado",
      "Estado_Fisico",
      "Observaciones",
    ];

    const filas = registros.map((r) => [
      r.prestamo_id,
      r.solicitud_id,
      `"${(r.nombre_solicitante || "").replace(/"/g, '""')}"`,
      `"${(r.codigo_recurso || "").replace(/"/g, '""')}"`,
      `"${(r.nombre_recurso || "").replace(/"/g, '""')}"`,
      r.fecha_entrega_real || "",
      r.fecha_devolucion_prevista || "",
      r.fecha_devolucion_real || "",
      r.estado || "",
      r.estado_fisico_devolucion || "",
      `"${(r.observaciones_devolucion || "").replace(/"/g, '""')}"`,
    ]);

    const contenido = [encabezados.join(";"), ...filas.map((f) => f.join(";"))].join("\n");
    const blob = new Blob(["\uFEFF" + contenido], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = nombreArchivo;
    link.click();
    URL.revokeObjectURL(url);
  }

  function renderDesglose(mapa) {
    const entradas = Object.entries(mapa || {});
    if (entradas.length === 0) return "<span style='color:var(--text-muted)'>Sin registros</span>";
    return entradas
      .map(
        ([estado, cant]) =>
          `<div style="display:flex;justify-content:space-between;padding:4px 0;">
            <span>${badgeEstado(estado)}</span>
            <strong>${cant}</strong>
          </div>`
      )
      .join("");
  }

  function pintar() {
    const listaActual = tabActiva === "activos" ? activos : historial;

    container.innerHTML = `
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Recursos (${resumen.total_recursos})</div>
          <div style="margin-top:8px;">${renderDesglose(resumen.recursos_por_estado)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Solicitudes (${resumen.total_solicitudes})</div>
          <div style="margin-top:8px;">${renderDesglose(resumen.solicitudes_por_estado)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Préstamos (${resumen.total_prestamos})</div>
          <div style="margin-top:8px;">${renderDesglose(resumen.prestamos_por_estado)}</div>
        </div>
      </div>

      <div class="card">
        <div class="section-header">
          <h3 class="section-title">Reportes Operativos de Coordinación</h3>
          <button class="btn btn-secondary btn-sm" id="btnExportarCSV">Exportar Vista a CSV</button>
        </div>

        <div class="tabs">
          <button class="tab-btn ${tabActiva === "activos" ? "active" : ""}" data-tab="activos">
            Préstamos Activos (${activos.length})
          </button>
          <button class="tab-btn ${tabActiva === "historial" ? "active" : ""}" data-tab="historial">
            Historial Completo (${historial.length})
          </button>
        </div>

        ${
          listaActual.length === 0
            ? `<div class="empty-state">No hay registros en esta categoría.</div>`
            : `
            <div class="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Préstamo</th>
                    <th>Solicitante</th>
                    <th>Recurso</th>
                    <th>Entrega Real</th>
                    <th>Devolución Prevista</th>
                    <th>Devolución Real</th>
                    <th>Estado</th>
                    <th>Condición</th>
                    <th>Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  ${listaActual
                    .map(
                      (r) => `
                    <tr>
                      <td>#${r.prestamo_id}</td>
                      <td>${escapeHTML(r.nombre_solicitante)}</td>
                      <td><strong>${escapeHTML(r.nombre_recurso)}</strong> <small>(${escapeHTML(r.codigo_recurso)})</small></td>
                      <td>${formatearFecha(r.fecha_entrega_real)}</td>
                      <td>${formatearFecha(r.fecha_devolucion_prevista)}</td>
                      <td>${formatearFecha(r.fecha_devolucion_real)}</td>
                      <td>${badgeEstado(r.estado)}</td>
                      <td>${r.estado_fisico_devolucion ? badgeEstado(r.estado_fisico_devolucion) : "—"}</td>
                      <td>${escapeHTML(r.observaciones_devolucion || "—")}</td>
                    </tr>`
                    )
                    .join("")}
                </tbody>
              </table>
            </div>`
        }
      </div>
    `;

    container.querySelectorAll("[data-tab]").forEach((btn) => {
      btn.addEventListener("click", () => {
        tabActiva = btn.dataset.tab;
        pintar();
      });
    });

    document.getElementById("btnExportarCSV").addEventListener("click", () => {
      exportarCSV(
        listaActual,
        tabActiva === "activos" ? "prestamos_activos.csv" : "historial_prestamos.csv"
      );
    });
  }

  await cargarDatos();
}