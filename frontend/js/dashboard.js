import { api } from "./api.js";
import {
  store,
  refrescarCatalogosBase,
  badgeEstado,
  formatearFecha,
  escapeHTML,
  showToast,
} from "./state.js";

export async function renderDashboard(container, navigateTo) {
  try {
    await refrescarCatalogosBase();
    const [resumen, prestamosActivos, solicitudes] = await Promise.all([
      api.obtenerResumen(),
      api.obtenerPrestamosActivos(),
      api.listarSolicitudes(),
    ]);

    const disponibles = resumen.recursos_por_estado?.disponible || 0;
    const prestados = resumen.recursos_por_estado?.prestado || 0;
    const mantenimiento = resumen.recursos_por_estado?.mantenimiento || 0;
    const pendientes = resumen.solicitudes_por_estado?.pendiente || 0;
    const activos = resumen.prestamos_por_estado?.activo || 0;
    const aprobadosSinEntregar = resumen.prestamos_por_estado?.aprobado || 0;

    const ultimasSolicitudes = solicitudes.slice(0, 5);

    container.innerHTML = `
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Recursos Totales</div>
          <div class="kpi-value">${resumen.total_recursos}</div>
          <div class="kpi-meta">${disponibles} disponibles · ${prestados} prestados · ${mantenimiento} mant.</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Solicitudes Pendientes</div>
          <div class="kpi-value">${pendientes}</div>
          <div class="kpi-meta">De ${resumen.total_solicitudes} solicitudes históricas</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Préstamos Activos</div>
          <div class="kpi-value">${activos}</div>
          <div class="kpi-meta">${aprobadosSinEntregar} aprobados pendientes de entrega</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Comunidad Registrada</div>
          <div class="kpi-value">${store.usuarios.length}</div>
          <div class="kpi-meta">En ${store.departamentos.length} departamentos institucionales</div>
        </div>
      </div>

      <div class="card">
        <div class="section-header">
          <h3 class="section-title">Préstamos Activos en Curso</h3>
          <button class="btn btn-secondary btn-sm" data-goto="prestamos">Gestionar Préstamos</button>
        </div>
        ${
          prestamosActivos.length === 0
            ? `<div class="empty-state">No hay préstamos activos en este momento.</div>`
            : `
            <div class="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Préstamo</th>
                    <th>Recurso</th>
                    <th>Solicitante</th>
                    <th>Entrega Real</th>
                    <th>Devolución Prevista</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  ${prestamosActivos
                    .map(
                      (p) => `
                    <tr>
                      <td>#${p.prestamo_id}</td>
                      <td><strong>${escapeHTML(p.nombre_recurso)}</strong> <small>(${escapeHTML(p.codigo_recurso)})</small></td>
                      <td>${escapeHTML(p.nombre_solicitante)}</td>
                      <td>${formatearFecha(p.fecha_entrega_real)}</td>
                      <td>${formatearFecha(p.fecha_devolucion_prevista)}</td>
                      <td>${badgeEstado(p.estado)}</td>
                    </tr>`
                    )
                    .join("")}
                </tbody>
              </table>
            </div>`
        }
      </div>

      <div class="card">
        <div class="section-header">
          <h3 class="section-title">Últimas Solicitudes Registradas</h3>
          <button class="btn btn-primary btn-sm" data-goto="solicitudes">Ir a Solicitudes</button>
        </div>
        ${
          ultimasSolicitudes.length === 0
            ? `<div class="empty-state">Aún no se han registrado solicitudes de préstamo.</div>`
            : `
            <div class="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Solicitante</th>
                    <th>Recurso</th>
                    <th>Periodo Solicitado</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  ${ultimasSolicitudes
                    .map((s) => {
                      const u = store.usuarios.find((x) => x.id === s.solicitante_id);
                      const r = store.recursos.find((x) => x.id === s.recurso_id);
                      return `
                      <tr>
                        <td>#${s.id}</td>
                        <td>${escapeHTML(u ? u.nombre : `Usuario #${s.solicitante_id}`)}</td>
                        <td>${escapeHTML(r ? `${r.nombre} (${r.codigo})` : `Recurso #${s.recurso_id}`)}</td>
                        <td>${formatearFecha(s.fecha_entrega)} → ${formatearFecha(s.fecha_devolucion_prevista)}</td>
                        <td>${badgeEstado(s.estado)}</td>
                      </tr>`;
                    })
                    .join("")}
                </tbody>
              </table>
            </div>`
        }
      </div>
    `;

    container.querySelectorAll("[data-goto]").forEach((btn) => {
      btn.addEventListener("click", () => navigateTo(btn.dataset.goto));
    });
  } catch (error) {
    showToast(error.message, "error");
    container.innerHTML = `<div class="card empty-state">No se pudo cargar el panel general: ${escapeHTML(error.message)}</div>`;
  }
}