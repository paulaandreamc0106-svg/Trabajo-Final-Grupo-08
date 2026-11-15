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

export async function renderProrrogas(container) {
  async function cargarYRenderizar() {
    try {
      await refrescarCatalogosBase();
      const [prorrogas, prestamos, solicitudes] = await Promise.all([
        api.listarProrrogas(),
        api.listarPrestamos(),
        api.listarSolicitudes(),
      ]);
      store.prorrogas = prorrogas;
      store.prestamos = prestamos;
      store.solicitudes = solicitudes;
      pintar();
    } catch (error) {
      showToast(error.message, "error");
      container.innerHTML = `<div class="card empty-state">${escapeHTML(error.message)}</div>`;
    }
  }

  function pintar() {
    container.innerHTML = `
      <div class="card">
        <div class="section-header">
          <h3 class="section-title">Solicitudes de Prórroga (${store.prorrogas.length})</h3>
          <button class="btn btn-primary" id="btnNuevaProrroga">+ Solicitar Prórroga</button>
        </div>

        ${
          store.prorrogas.length === 0
            ? `<div class="empty-state">No hay solicitudes de prórroga registradas.</div>`
            : `
            <div class="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Préstamo</th>
                    <th>Solicitante / Recurso</th>
                    <th>Fecha Solicitud</th>
                    <th>Nueva Fecha Propuesta</th>
                    <th>Motivo</th>
                    <th>Estado</th>
                    <th>Responsable</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  ${store.prorrogas
                    .map((pr) => {
                      const prestamo = store.prestamos.find((p) => p.id === pr.prestamo_id);
                      const sol = prestamo
                        ? store.solicitudes.find((s) => s.id === prestamo.solicitud_id)
                        : null;
                      return `
                      <tr>
                        <td>#${pr.id}</td>
                        <td>Préstamo #${pr.prestamo_id}</td>
                        <td>
                          ${sol ? escapeHTML(nombreUsuario(sol.solicitante_id)) : "—"}<br/>
                          <small>${sol ? escapeHTML(infoRecurso(sol.recurso_id)) : ""}</small>
                        </td>
                        <td>${formatearFecha(pr.fecha_solicitud)}</td>
                        <td><strong>${formatearFecha(pr.nueva_fecha_devolucion)}</strong></td>
                        <td>${escapeHTML(pr.motivo || "—")}</td>
                        <td>${badgeEstado(pr.estado)}</td>
                        <td>${pr.responsable_decision_id ? escapeHTML(nombreUsuario(pr.responsable_decision_id)) : "—"}</td>
                        <td>
                          ${
                            pr.estado === "pendiente"
                              ? `<button class="btn btn-primary btn-sm" data-decidir-prorroga="${pr.id}">Evaluar</button>`
                              : `<span style="color:var(--text-muted);font-size:0.8rem;">Evaluada</span>`
                          }
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

    document.getElementById("btnNuevaProrroga").addEventListener("click", abrirModalNuevaProrroga);

    container.querySelectorAll("[data-decidir-prorroga]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const pr = store.prorrogas.find((x) => x.id === Number(btn.dataset.decidirProrroga));
        if (pr) abrirModalDecisionProrroga(pr);
      });
    });
  }

  function abrirModalNuevaProrroga() {
    const prestamosActivos = store.prestamos.filter((p) => p.estado === "activo");

    if (prestamosActivos.length === 0) {
      showToast("No hay préstamos activos actualmente para solicitar prórroga.", "error");
      return;
    }

    // Obtener solicitantes únicos que tienen al menos un préstamo activo
    const opcionesActivas = prestamosActivos.map((p) => {
      const sol = store.solicitudes.find((s) => s.id === p.solicitud_id);
      const usr = sol ? store.usuarios.find((u) => u.id === sol.solicitante_id) : null;
      const rec = sol ? store.recursos.find((r) => r.id === sol.recurso_id) : null;
      return {
        solicitante_id: sol?.solicitante_id,
        etiqueta: `${usr ? usr.nombre : `Usuario #${sol?.solicitante_id}`} — Préstamo #${p.id} (${rec ? rec.nombre : "Equipo"}, vence: ${p.fecha_devolucion_prevista})`,
      };
    });

    const body = openModal(
      "Solicitar Prórroga de Préstamo Activo",
      `
      <form id="formNuevaProrroga">
        <div class="form-group" style="margin-bottom:14px;">
          <label for="proSolicitante">Solicitante con préstamo activo *</label>
          <select class="select" id="proSolicitante" required>
            <option value="">Seleccione el solicitante...</option>
            ${opcionesActivas
              .filter((o) => o.solicitante_id)
              .map(
                (o) => `<option value="${o.solicitante_id}">${escapeHTML(o.etiqueta)}</option>`
              )
              .join("")}
          </select>
        </div>
        <div class="form-group" style="margin-bottom:14px;">
          <label for="proNuevaFecha">Nueva fecha propuesta de devolución *</label>
          <input type="date" class="input" id="proNuevaFecha" min="${hoyISO()}" required />
        </div>
        <div class="form-group">
          <label for="proMotivo">Motivo de la extensión (mínimo 5 caracteres) *</label>
          <textarea class="textarea" id="proMotivo" rows="3" minlength="5" maxlength="500" required placeholder="Justificación para extender el periodo de préstamo..."></textarea>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" id="btnCancelarModal">Cancelar</button>
          <button type="submit" class="btn btn-primary">Registrar Prórroga</button>
        </div>
      </form>
      `
    );

    body.querySelector("#btnCancelarModal").addEventListener("click", closeModal);

    body.querySelector("#formNuevaProrroga").addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = {
        solicitante_id: Number(body.querySelector("#proSolicitante").value),
        nueva_fecha_devolucion: body.querySelector("#proNuevaFecha").value,
        motivo: body.querySelector("#proMotivo").value.trim(),
      };

      try {
        await api.crearProrroga(payload);
        showToast("Solicitud de prórroga registrada", "success");
        closeModal();
        await cargarYRenderizar();
      } catch (error) {
        showToast(error.message, "error");
      }
    });
  }

  function abrirModalDecisionProrroga(prorroga) {
    const body = openModal(
      `Evaluar Prórroga #${prorroga.id}`,
      `
      <p style="margin-bottom:12px;font-size:0.9rem;color:var(--text-muted);">
        <strong>Préstamo asociado:</strong> #${prorroga.prestamo_id}<br/>
        <strong>Nueva fecha solicitada:</strong> ${formatearFecha(prorroga.nueva_fecha_devolucion)}<br/>
        <strong>Motivo:</strong> ${escapeHTML(prorroga.motivo || "—")}
      </p>
      <form id="formDecisionProrroga">
        <div class="form-grid">
          <div class="form-group">
            <label for="proResponsable">Responsable que decide *</label>
            <select class="select" id="proResponsable" required>
              <option value="">Seleccione responsable...</option>
              ${store.usuarios
                .map(
                  (u) => `<option value="${u.id}">${escapeHTML(u.nombre)} (${u.tipo})</option>`
                )
                .join("")}
            </select>
          </div>
          <div class="form-group">
            <label for="proDecision">Decisión *</label>
            <select class="select" id="proDecision" required>
              <option value="aprobada">Aprobar prórroga</option>
              <option value="rechazada">Rechazar prórroga</option>
            </select>
          </div>
          <div class="form-group full">
            <label for="proObservacion">Observación (obligatoria si se rechaza)</label>
            <textarea class="textarea" id="proObservacion" rows="3" maxlength="500"></textarea>
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

    body.querySelector("#formDecisionProrroga").addEventListener("submit", async (e) => {
      e.preventDefault();
      const decision = body.querySelector("#proDecision").value;
      const observacion = body.querySelector("#proObservacion").value.trim() || null;

      if (decision === "rechazada" && !observacion) {
        showToast("Debes indicar el motivo del rechazo.", "error");
        return;
      }

      const payload = {
        responsable_decision_id: Number(body.querySelector("#proResponsable").value),
        decision,
        observacion,
      };

      try {
        await api.decidirProrroga(prorroga.id, payload);
        showToast(`Prórroga ${decision} correctamente`, "success");
        closeModal();
        await cargarYRenderizar();
      } catch (error) {
        showToast(error.message, "error");
      }
    });
  }

  await cargarYRenderizar();
}