import { api } from "./api.js";
import {
  store,
  refrescarCatalogosBase,
  nombreUsuario,
  infoRecurso,
  formatearFecha,
  hoyISO,
  badgeEstado,
  escapeHTML,
  showToast,
  openModal,
  closeModal,
} from "./state.js";

export async function renderSolicitudes(container) {
  let filtroEstado = "";

  async function cargarYRenderizar() {
    try {
      await refrescarCatalogosBase();
      store.solicitudes = await api.listarSolicitudes();
      pintar();
    } catch (error) {
      showToast(error.message, "error");
      container.innerHTML = `<div class="card empty-state">${escapeHTML(error.message)}</div>`;
    }
  }

  function pintar() {
    const filtradas = store.solicitudes.filter(
      (s) => !filtroEstado || s.estado === filtroEstado
    );

    container.innerHTML = `
      <div class="card">
        <div class="section-header">
          <h3 class="section-title">Solicitudes de Préstamo (${filtradas.length})</h3>
          <button class="btn btn-primary" id="btnNuevaSolicitud">+ Nueva Solicitud</button>
        </div>

        <div class="toolbar">
          <select class="select" id="filtrarEstadoSolicitud">
            <option value="">Todos los estados</option>
            <option value="pendiente" ${filtroEstado === "pendiente" ? "selected" : ""}>pendiente</option>
            <option value="aprobada" ${filtroEstado === "aprobada" ? "selected" : ""}>aprobada</option>
            <option value="rechazada" ${filtroEstado === "rechazada" ? "selected" : ""}>rechazada</option>
          </select>
        </div>

        ${
          filtradas.length === 0
            ? `<div class="empty-state">No hay solicitudes registradas con el filtro seleccionado.</div>`
            : `
            <div class="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Solicitante</th>
                    <th>Recurso</th>
                    <th>Entrega Prevista</th>
                    <th>Devolución Prevista</th>
                    <th>Motivo</th>
                    <th>Estado</th>
                    <th>Observación / Decisión</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  ${filtradas
                    .map(
                      (s) => `
                    <tr>
                      <td>#${s.id}</td>
                      <td>${escapeHTML(nombreUsuario(s.solicitante_id))}</td>
                      <td><strong>${escapeHTML(infoRecurso(s.recurso_id))}</strong></td>
                      <td>${formatearFecha(s.fecha_entrega)}</td>
                      <td>${formatearFecha(s.fecha_devolucion_prevista)}</td>
                      <td>${escapeHTML(s.motivo || "—")}</td>
                      <td>${badgeEstado(s.estado)}</td>
                      <td>${escapeHTML(s.observacion_decision || "—")}</td>
                      <td>
                        ${
                          s.estado === "pendiente"
                            ? `<button class="btn btn-primary btn-sm" data-decidir="${s.id}">Evaluar</button>`
                            : `<span style="color:var(--text-muted);font-size:0.8rem;">Evaluada</span>`
                        }
                      </td>
                    </tr>`
                    )
                    .join("")}
                </tbody>
              </table>
            </div>`
        }
      </div>
    `;

    document.getElementById("btnNuevaSolicitud").addEventListener("click", abrirFormularioSolicitud);

    document.getElementById("filtrarEstadoSolicitud").addEventListener("change", (e) => {
      filtroEstado = e.target.value;
      pintar();
    });

    container.querySelectorAll("[data-decidir]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const sol = store.solicitudes.find((s) => s.id === Number(btn.dataset.decidir));
        if (sol) abrirModalDecision(sol);
      });
    });
  }

  function abrirFormularioSolicitud() {
    const disponibles = store.recursos.filter((r) => r.estado === "disponible");
    const hoy = hoyISO();

    if (store.usuarios.length === 0 || disponibles.length === 0) {
      showToast(
        "Necesitas al menos un usuario registrado y un recurso en estado 'disponible' para crear una solicitud.",
        "error"
      );
      return;
    }

    const body = openModal(
      "Registrar Nueva Solicitud de Préstamo",
      `
      <form id="formSolicitud">
        <div class="form-grid">
          <div class="form-group full">
            <label for="solSolicitante">Solicitante *</label>
            <select class="select" id="solSolicitante" required>
              <option value="">Seleccione un usuario...</option>
              ${store.usuarios
                .map(
                  (u) =>
                    `<option value="${u.id}">${escapeHTML(u.nombre)} — ${escapeHTML(u.correo)} (${u.tipo})</option>`
                )
                .join("")}
            </select>
          </div>
          <div class="form-group full">
            <label for="solRecurso">Recurso disponible *</label>
            <select class="select" id="solRecurso" required>
              <option value="">Seleccione un equipo disponible...</option>
              ${disponibles
                .map(
                  (r) =>
                    `<option value="${r.id}">${escapeHTML(r.nombre)} [${escapeHTML(r.codigo)}]${r.marca ? ` - ${escapeHTML(r.marca)}` : ""}</option>`
                )
                .join("")}
            </select>
          </div>
          <div class="form-group">
            <label for="solFechaEntrega">Fecha prevista de entrega *</label>
            <input type="date" class="input" id="solFechaEntrega" min="${hoy}" value="${hoy}" required />
          </div>
          <div class="form-group">
            <label for="solFechaDevolucion">Fecha prevista de devolución *</label>
            <input type="date" class="input" id="solFechaDevolucion" min="${hoy}" required />
          </div>
          <div class="form-group full">
            <label for="solMotivo">Motivo o actividad académica</label>
            <textarea class="textarea" id="solMotivo" rows="3" maxlength="500" placeholder="Ej. Práctica de laboratorio, clase magistral, proyecto..."></textarea>
          </div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" id="btnCancelarModal">Cancelar</button>
          <button type="submit" class="btn btn-primary">Enviar Solicitud</button>
        </div>
      </form>
      `
    );

    body.querySelector("#btnCancelarModal").addEventListener("click", closeModal);

    body.querySelector("#formSolicitud").addEventListener("submit", async (e) => {
      e.preventDefault();
      const fechaEntrega = body.querySelector("#solFechaEntrega").value;
      const fechaDevolucion = body.querySelector("#solFechaDevolucion").value;

      if (fechaDevolucion <= fechaEntrega) {
        showToast("La fecha de devolución debe ser posterior a la fecha de entrega.", "error");
        return;
      }

      const payload = {
        solicitante_id: Number(body.querySelector("#solSolicitante").value),
        recurso_id: Number(body.querySelector("#solRecurso").value),
        fecha_entrega: fechaEntrega,
        fecha_devolucion_prevista: fechaDevolucion,
        motivo: body.querySelector("#solMotivo").value.trim() || null,
      };

      try {
        await api.crearSolicitud(payload);
        showToast("Solicitud registrada en estado pendiente", "success");
        closeModal();
        await cargarYRenderizar();
      } catch (error) {
        showToast(error.message, "error");
      }
    });
  }

  function abrirModalDecision(solicitud) {
    const body = openModal(
      `Evaluar Solicitud #${solicitud.id}`,
      `
      <p style="margin-bottom:12px;font-size:0.9rem;color:var(--text-muted);">
        <strong>Solicitante:</strong> ${escapeHTML(nombreUsuario(solicitud.solicitante_id))}<br/>
        <strong>Recurso:</strong> ${escapeHTML(infoRecurso(solicitud.recurso_id))}<br/>
        <strong>Periodo:</strong> ${formatearFecha(solicitud.fecha_entrega)} al ${formatearFecha(solicitud.fecha_devolucion_prevista)}
      </p>
      <form id="formDecisionSolicitud">
        <div class="form-grid">
          <div class="form-group">
            <label for="decResponsable">Responsable que evalúa *</label>
            <select class="select" id="decResponsable" required>
              <option value="">Seleccione responsable...</option>
              ${store.usuarios
                .map(
                  (u) => `<option value="${u.id}">${escapeHTML(u.nombre)} (${u.tipo})</option>`
                )
                .join("")}
            </select>
          </div>
          <div class="form-group">
            <label for="decEstado">Decisión *</label>
            <select class="select" id="decEstado" required>
              <option value="aprobada">Aprobar solicitud (genera préstamo)</option>
              <option value="rechazada">Rechazar solicitud</option>
            </select>
          </div>
          <div class="form-group full">
            <label for="decObservacion">Observación (obligatoria si se rechaza)</label>
            <textarea class="textarea" id="decObservacion" rows="3" maxlength="500" placeholder="Comentarios de aprobación o motivo del rechazo..."></textarea>
          </div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" id="btnCancelarModal">Cancelar</button>
          <button type="submit" class="btn btn-primary">Guardar Decisión</button>
        </div>
      </form>
      `
    );

    body.querySelector("#btnCancelarModal").addEventListener("click", closeModal);

    body.querySelector("#formDecisionSolicitud").addEventListener("submit", async (e) => {
      e.preventDefault();
      const decision = body.querySelector("#decEstado").value;
      const observacion = body.querySelector("#decObservacion").value.trim() || null;

      if (decision === "rechazada" && !observacion) {
        showToast("Debes indicar el motivo del rechazo en la observación.", "error");
        return;
      }

      const payload = {
        responsable_id: Number(body.querySelector("#decResponsable").value),
        decision,
        observacion,
      };

      try {
        await api.decidirSolicitud(solicitud.id, payload);
        showToast(
          decision === "aprobada"
            ? "Solicitud aprobada y préstamo creado"
            : "Solicitud rechazada correctamente",
          "success"
        );
        closeModal();
        await cargarYRenderizar();
      } catch (error) {
        showToast(error.message, "error");
      }
    });
  }

  await cargarYRenderizar();
}