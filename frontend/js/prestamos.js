import { api } from "./api.js";
import {
  store,
  refrescarCatalogosBase,
  nombreUsuario,
  infoRecurso,
  formatearFecha,
  badgeEstado,
  escapeHTML,
  showToast,
  openModal,
  closeModal,
} from "./state.js";

export async function renderPrestamos(container) {
  let filtroEstado = "";

  async function cargarYRenderizar() {
    try {
      await refrescarCatalogosBase();
      const [prestamos, solicitudes] = await Promise.all([
        api.listarPrestamos(),
        api.listarSolicitudes(),
      ]);
      store.prestamos = prestamos;
      store.solicitudes = solicitudes;
      pintar();
    } catch (error) {
      showToast(error.message, "error");
      container.innerHTML = `<div class="card empty-state">${escapeHTML(error.message)}</div>`;
    }
  }

  function pintar() {
    const filtrados = store.prestamos.filter(
      (p) => !filtroEstado || p.estado === filtroEstado
    );

    container.innerHTML = `
      <div class="card">
        <div class="section-header">
          <h3 class="section-title">Gestión de Préstamos, Entregas y Devoluciones (${filtrados.length})</h3>
        </div>

        <div class="toolbar">
          <select class="select" id="filtrarEstadoPrestamo">
            <option value="">Todos los estados</option>
            <option value="aprobado" ${filtroEstado === "aprobado" ? "selected" : ""}>aprobado (pendiente de entrega)</option>
            <option value="activo" ${filtroEstado === "activo" ? "selected" : ""}>activo (en poder del usuario)</option>
            <option value="devuelto" ${filtroEstado === "devuelto" ? "selected" : ""}>devuelto</option>
          </select>
        </div>

        ${
          filtrados.length === 0
            ? `<div class="empty-state">No hay préstamos registrados con el filtro seleccionado.</div>`
            : `
            <div class="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Préstamo</th>
                    <th>Solicitud / Solicitante</th>
                    <th>Recurso</th>
                    <th>Entrega Real</th>
                    <th>Devolución Prevista</th>
                    <th>Devolución Real</th>
                    <th>Estado</th>
                    <th>Condición Física</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  ${filtrados
                    .map((p) => {
                      const sol = store.solicitudes.find((s) => s.id === p.solicitud_id);
                      return `
                      <tr>
                        <td>#${p.id}</td>
                        <td>
                          Sol. #${p.solicitud_id}<br/>
                          <small>${sol ? escapeHTML(nombreUsuario(sol.solicitante_id)) : "—"}</small>
                        </td>
                        <td><strong>${sol ? escapeHTML(infoRecurso(sol.recurso_id)) : "—"}</strong></td>
                        <td>${formatearFecha(p.fecha_entrega_real)}</td>
                        <td>${formatearFecha(p.fecha_devolucion_prevista)}</td>
                        <td>${formatearFecha(p.fecha_devolucion_real)}</td>
                        <td>${badgeEstado(p.estado)}</td>
                        <td>${p.estado_fisico_devolucion ? badgeEstado(p.estado_fisico_devolucion) : "—"}</td>
                        <td>
                          <div class="actions-group">
                            ${
                              p.estado === "aprobado"
                                ? `<button class="btn btn-success btn-sm" data-entregar="${p.id}">Registrar Entrega</button>`
                                : ""
                            }
                            ${
                              p.estado === "activo"
                                ? `<button class="btn btn-primary btn-sm" data-devolver="${p.id}">Registrar Devolución</button>`
                                : ""
                            }
                            ${
                              p.estado === "devuelto"
                                ? `<span style="color:var(--text-muted);font-size:0.8rem;">Finalizado</span>`
                                : ""
                            }
                          </div>
                        </td>
                      </tr>`;
                    })
                    .join("")}
                </tbody>
              </table>
            </div>`
        }
      </div>
    `;

    document.getElementById("filtrarEstadoPrestamo").addEventListener("change", (e) => {
      filtroEstado = e.target.value;
      pintar();
    });

    container.querySelectorAll("[data-entregar]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = Number(btn.dataset.entregar);
        if (!confirm(`¿Confirmas la entrega física del equipo para el préstamo #${id}?`)) return;
        try {
          await api.registrarEntrega(id);
          showToast("Entrega registrada: el préstamo ahora está activo", "success");
          await cargarYRenderizar();
        } catch (error) {
          showToast(error.message, "error");
        }
      });
    });

    container.querySelectorAll("[data-devolver]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const prestamo = store.prestamos.find((p) => p.id === Number(btn.dataset.devolver));
        if (prestamo) abrirModalDevolucion(prestamo);
      });
    });
  }

  function abrirModalDevolucion(prestamo) {
    const body = openModal(
      `Registrar Devolución — Préstamo #${prestamo.id}`,
      `
      <form id="formDevolucion">
        <div class="form-group" style="margin-bottom:14px;">
          <label for="devEstadoFisico">Estado físico del equipo al recibirlo *</label>
          <select class="select" id="devEstadoFisico" required>
            <option value="bueno">Bueno (el recurso vuelve a estar disponible)</option>
            <option value="dañado">Dañado (el recurso pasa a mantenimiento)</option>
            <option value="incompleto">Incompleto (el recurso pasa a mantenimiento)</option>
          </select>
        </div>
        <div class="form-group">
          <label for="devObservaciones">Observaciones de recepción</label>
          <textarea class="textarea" id="devObservaciones" rows="3" maxlength="500" placeholder="Accesorios revisados, novedades físicas, estado general..."></textarea>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" id="btnCancelarModal">Cancelar</button>
          <button type="submit" class="btn btn-primary">Confirmar Devolución</button>
        </div>
      </form>
      `
    );

    body.querySelector("#btnCancelarModal").addEventListener("click", closeModal);

    body.querySelector("#formDevolucion").addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = {
        estado_fisico: body.querySelector("#devEstadoFisico").value,
        observaciones: body.querySelector("#devObservaciones").value.trim() || null,
      };

      try {
        await api.registrarDevolucion(prestamo.id, payload);
        showToast("Devolución registrada correctamente", "success");
        closeModal();
        await cargarYRenderizar();
      } catch (error) {
        showToast(error.message, "error");
      }
    });
  }

  await cargarYRenderizar();
}