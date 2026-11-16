import { api } from "./api.js";
import {
  store,
  tieneRol,
  badgeEstado,
  escapeHTML,
  showToast,
  openModal,
  closeModal,
} from "./state.js";

const ESTADOS_RECURSO = ["disponible", "prestado", "mantenimiento", "inactivo"];

export async function renderRecursos(container) {
  let filtroTexto = "";
  let filtroEstado = "";
  const esResponsable = tieneRol("responsable");

  async function cargarYRenderizar() {
    try {
      store.recursos = await api.listarRecursos();
      pintar();
    } catch (error) {
      showToast(error.message, "error");
      container.innerHTML = `<div class="card empty-state">${escapeHTML(error.message)}</div>`;
    }
  }

  function pintar() {
    const filtrados = store.recursos.filter((r) => {
      const coincideEstado = !filtroEstado || r.estado === filtroEstado;
      const q = filtroTexto.toLowerCase();
      const coincideTexto =
        !q ||
        r.nombre.toLowerCase().includes(q) ||
        r.codigo.toLowerCase().includes(q) ||
        (r.marca && r.marca.toLowerCase().includes(q)) ||
        (r.serial && r.serial.toLowerCase().includes(q));
      return coincideEstado && coincideTexto;
    });

    container.innerHTML = `
      <div class="card">
        <div class="section-header">
          <h3 class="section-title">Inventario de Equipos y Recursos (${filtrados.length})</h3>
          ${
            esResponsable
              ? `<button class="btn btn-primary" id="btnNuevoRecurso">+ Registrar Recurso</button>`
              : ""
          }
        </div>

        <div class="toolbar">
          <input
            type="search"
            class="input"
            id="buscarRecurso"
            placeholder="Buscar por nombre, código, marca o serial..."
            value="${escapeHTML(filtroTexto)}"
          />
          <select class="select" id="filtrarEstadoRecurso">
            <option value="">Todos los estados</option>
            ${ESTADOS_RECURSO.map(
              (est) => `<option value="${est}" ${filtroEstado === est ? "selected" : ""}>${est}</option>`
            ).join("")}
          </select>
        </div>

        ${
          filtrados.length === 0
            ? `<div class="empty-state">No hay recursos que coincidan con los filtros seleccionados.</div>`
            : `
            <div class="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Marca / Modelo</th>
                    <th>Serial</th>
                    <th>Estado</th>
                    ${esResponsable ? `<th>Acciones</th>` : ""}
                  </tr>
                </thead>
                <tbody>
                  ${filtrados
                    .map(
                      (r) => `
                    <tr>
                      <td>#${r.id}</td>
                      <td><strong>${escapeHTML(r.codigo)}</strong></td>
                      <td>${escapeHTML(r.nombre)}</td>
                      <td>${escapeHTML([r.marca, r.modelo].filter(Boolean).join(" ") || "—")}</td>
                      <td>${escapeHTML(r.serial || "—")}</td>
                      <td>${badgeEstado(r.estado)}</td>
                      ${
                        esResponsable
                          ? `<td>
                              <div class="actions-group">
                                <button class="btn btn-secondary btn-sm" data-edit="${r.id}">Editar</button>
                                <button class="btn btn-danger btn-sm" data-delete="${r.id}">Eliminar</button>
                              </div>
                            </td>`
                          : ""
                      }
                    </tr>`
                    )
                    .join("")}
                </tbody>
              </table>
            </div>`
        }
      </div>
    `;

    const btnNuevo = document.getElementById("btnNuevoRecurso");
    if (btnNuevo) {
      btnNuevo.addEventListener("click", () => abrirFormularioRecurso());
    }

    document.getElementById("buscarRecurso").addEventListener("input", (e) => {
      filtroTexto = e.target.value;
      pintar();
      const input = document.getElementById("buscarRecurso");
      input.focus();
      input.setSelectionRange(filtroTexto.length, filtroTexto.length);
    });

    document.getElementById("filtrarEstadoRecurso").addEventListener("change", (e) => {
      filtroEstado = e.target.value;
      pintar();
    });

    container.querySelectorAll("[data-edit]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const recurso = store.recursos.find((r) => r.id === Number(btn.dataset.edit));
        if (recurso) abrirFormularioRecurso(recurso);
      });
    });

    container.querySelectorAll("[data-delete]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = Number(btn.dataset.delete);
        if (!confirm("¿Seguro que deseas eliminar este recurso? Esta acción no se puede deshacer.")) return;
        try {
          await api.eliminarRecurso(id);
          showToast("Recurso eliminado correctamente", "success");
          await cargarYRenderizar();
        } catch (error) {
          showToast(error.message, "error");
        }
      });
    });
  }

  function abrirFormularioRecurso(recurso = null) {
    const esEdicion = Boolean(recurso);
    const body = openModal(
      esEdicion ? `Editar Recurso #${recurso.id}` : "Registrar Nuevo Recurso",
      `
      <form id="formRecurso">
        <div class="form-grid">
          <div class="form-group">
            <label for="recNombre">Nombre del equipo *</label>
            <input class="input" id="recNombre" required minlength="2" maxlength="150" value="${escapeHTML(recurso?.nombre || "")}" />
          </div>
          <div class="form-group">
            <label for="recCodigo">Código institucional *</label>
            <input class="input" id="recCodigo" required minlength="1" maxlength="50" value="${escapeHTML(recurso?.codigo || "")}" />
          </div>
          <div class="form-group">
            <label for="recMarca">Marca</label>
            <input class="input" id="recMarca" maxlength="100" value="${escapeHTML(recurso?.marca || "")}" />
          </div>
          <div class="form-group">
            <label for="recModelo">Modelo</label>
            <input class="input" id="recModelo" maxlength="100" value="${escapeHTML(recurso?.modelo || "")}" />
          </div>
          <div class="form-group">
            <label for="recSerial">Número de serie</label>
            <input class="input" id="recSerial" maxlength="100" value="${escapeHTML(recurso?.serial || "")}" />
          </div>
          <div class="form-group">
            <label for="recEstado">Estado *</label>
            <select class="select" id="recEstado">
              ${ESTADOS_RECURSO.map(
                (est) => `<option value="${est}" ${(recurso?.estado || "disponible") === est ? "selected" : ""}>${est}</option>`
              ).join("")}
            </select>
          </div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" id="btnCancelarModal">Cancelar</button>
          <button type="submit" class="btn btn-primary">${esEdicion ? "Guardar Cambios" : "Registrar Recurso"}</button>
        </div>
      </form>
      `
    );

    body.querySelector("#btnCancelarModal").addEventListener("click", closeModal);

    body.querySelector("#formRecurso").addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = {
        nombre: body.querySelector("#recNombre").value.trim(),
        codigo: body.querySelector("#recCodigo").value.trim(),
        marca: body.querySelector("#recMarca").value.trim() || null,
        modelo: body.querySelector("#recModelo").value.trim() || null,
        serial: body.querySelector("#recSerial").value.trim() || null,
        estado: body.querySelector("#recEstado").value,
      };

      try {
        if (esEdicion) {
          await api.actualizarRecurso(recurso.id, payload);
          showToast("Recurso actualizado correctamente", "success");
        } else {
          await api.crearRecurso(payload);
          showToast("Recurso registrado correctamente", "success");
        }
        closeModal();
        await cargarYRenderizar();
      } catch (error) {
        showToast(error.message, "error");
      }
    });
  }

  await cargarYRenderizar();
}