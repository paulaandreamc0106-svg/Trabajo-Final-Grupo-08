import { api } from "./api.js";
import {
  store,
  tieneRol,
  nombreDepartamento,
  badgeEstado,
  escapeHTML,
  showToast,
  openModal,
  closeModal,
} from "./state.js";

const TIPOS_USUARIO = ["estudiante", "docente", "contratista", "otro"];
const ROLES_SISTEMA = ["solicitante", "responsable", "coordinacion"];

export async function renderUsuarios(container) {
  let filtroTexto = "";
  let filtroTipo = "";
  const esResponsable = tieneRol("responsable");

  async function cargarYRenderizar() {
    try {
      const [usuarios, departamentos] = await Promise.all([
        api.listarUsuarios(),
        api.listarDepartamentos(),
      ]);
      store.usuarios = usuarios;
      store.departamentos = departamentos;
      pintar();
    } catch (error) {
      showToast(error.message, "error");
      container.innerHTML = `<div class="card empty-state">${escapeHTML(error.message)}</div>`;
    }
  }

  function pintar() {
    const filtrados = store.usuarios.filter((u) => {
      const coincideTipo = !filtroTipo || u.tipo === filtroTipo;
      const q = filtroTexto.toLowerCase();
      const coincideTexto =
        !q ||
        u.nombre.toLowerCase().includes(q) ||
        u.correo.toLowerCase().includes(q);
      return coincideTipo && coincideTexto;
    });

    container.innerHTML = `
      <div class="card">
        <div class="section-header">
          <h3 class="section-title">Usuarios Institucionales (${filtrados.length})</h3>
          ${
            esResponsable
              ? `<button class="btn btn-primary" id="btnNuevoUsuario">+ Registrar Usuario</button>`
              : ""
          }
        </div>

        <div class="toolbar">
          <input
            type="search"
            class="input"
            id="buscarUsuario"
            placeholder="Buscar por nombre o correo..."
            value="${escapeHTML(filtroTexto)}"
          />
          <select class="select" id="filtrarTipoUsuario">
            <option value="">Todos los tipos</option>
            ${TIPOS_USUARIO.map(
              (t) => `<option value="${t}" ${filtroTipo === t ? "selected" : ""}>${t}</option>`
            ).join("")}
          </select>
        </div>

        ${
          filtrados.length === 0
            ? `<div class="empty-state">No hay usuarios registrados con los criterios seleccionados.</div>`
            : `
            <div class="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Correo Electrónico</th>
                    <th>Tipo</th>
                    <th>Rol Sistema</th>
                    <th>Departamento</th>
                    ${esResponsable ? `<th>Acciones</th>` : ""}
                  </tr>
                </thead>
                <tbody>
                  ${filtrados
                    .map(
                      (u) => `
                    <tr>
                      <td>#${u.id}</td>
                      <td><strong>${escapeHTML(u.nombre)}</strong></td>
                      <td>${escapeHTML(u.correo)}</td>
                      <td>${badgeEstado(u.tipo)}</td>
                      <td>${badgeEstado(u.rol)}</td>
                      <td>${escapeHTML(nombreDepartamento(u.departamento_id))}</td>
                      ${
                        esResponsable
                          ? `<td>
                              <div class="actions-group">
                                <button class="btn btn-secondary btn-sm" data-edit="${u.id}">Editar</button>
                                <button class="btn btn-danger btn-sm" data-delete="${u.id}">Eliminar</button>
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

    const btnNuevo = document.getElementById("btnNuevoUsuario");
    if (btnNuevo) {
      btnNuevo.addEventListener("click", () => abrirFormularioUsuario());
    }

    document.getElementById("buscarUsuario").addEventListener("input", (e) => {
      filtroTexto = e.target.value;
      pintar();
      const input = document.getElementById("buscarUsuario");
      input.focus();
      input.setSelectionRange(filtroTexto.length, filtroTexto.length);
    });

    document.getElementById("filtrarTipoUsuario").addEventListener("change", (e) => {
      filtroTipo = e.target.value;
      pintar();
    });

    container.querySelectorAll("[data-edit]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const usuario = store.usuarios.find((u) => u.id === Number(btn.dataset.edit));
        if (usuario) abrirFormularioUsuario(usuario);
      });
    });

    container.querySelectorAll("[data-delete]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = Number(btn.dataset.delete);
        if (!confirm("¿Deseas eliminar este usuario?")) return;
        try {
          await api.eliminarUsuario(id);
          showToast("Usuario eliminado correctamente", "success");
          await cargarYRenderizar();
        } catch (error) {
          showToast(error.message, "error");
        }
      });
    });
  }

  function abrirFormularioUsuario(usuario = null) {
    const esEdicion = Boolean(usuario);
    const body = openModal(
      esEdicion ? `Editar Usuario #${usuario.id}` : "Registrar Nuevo Usuario",
      `
      <form id="formUsuario">
        <div class="form-grid">
          <div class="form-group full">
            <label for="usrNombre">Nombre completo *</label>
            <input class="input" id="usrNombre" required minlength="2" maxlength="150" value="${escapeHTML(usuario?.nombre || "")}" />
          </div>
          <div class="form-group full">
            <label for="usrCorreo">Correo electrónico *</label>
            <input type="email" class="input" id="usrCorreo" required minlength="5" maxlength="150" value="${escapeHTML(usuario?.correo || "")}" />
          </div>
          <div class="form-group">
            <label for="usrTipo">Vinculación institucional *</label>
            <select class="select" id="usrTipo" required>
              ${TIPOS_USUARIO.map(
                (t) => `<option value="${t}" ${(usuario?.tipo || "estudiante") === t ? "selected" : ""}>${t}</option>`
              ).join("")}
            </select>
          </div>
          <div class="form-group">
            <label for="usrRol">Rol de acceso en SIGEP *</label>
            <select class="select" id="usrRol" required>
              ${ROLES_SISTEMA.map(
                (r) => `<option value="${r}" ${(usuario?.rol || "solicitante") === r ? "selected" : ""}>${r}</option>`
              ).join("")}
            </select>
          </div>
          <div class="form-group">
            <label for="usrPassword">${esEdicion ? "Nueva contraseña (opcional)" : "Contraseña inicial *"}</label>
            <input type="password" class="input" id="usrPassword" ${esEdicion ? "" : 'value="Sigep2026*" required'} minlength="6" maxlength="100" placeholder="${esEdicion ? "Dejar vacío para conservar" : ""}" />
          </div>
          <div class="form-group">
            <label for="usrDepartamento">Departamento</label>
            <select class="select" id="usrDepartamento">
              <option value="">Sin departamento asignado</option>
              ${store.departamentos
                .map(
                  (d) =>
                    `<option value="${d.id}" ${usuario?.departamento_id === d.id ? "selected" : ""}>${escapeHTML(d.nombre)}</option>`
                )
                .join("")}
            </select>
          </div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" id="btnCancelarModal">Cancelar</button>
          <button type="submit" class="btn btn-primary">${esEdicion ? "Guardar Cambios" : "Registrar Usuario"}</button>
        </div>
      </form>
      `
    );

    body.querySelector("#btnCancelarModal").addEventListener("click", closeModal);

    body.querySelector("#formUsuario").addEventListener("submit", async (e) => {
      e.preventDefault();
      const deptVal = body.querySelector("#usrDepartamento").value;
      const passVal = body.querySelector("#usrPassword").value;
      const payload = {
        nombre: body.querySelector("#usrNombre").value.trim(),
        correo: body.querySelector("#usrCorreo").value.trim().toLowerCase(),
        tipo: body.querySelector("#usrTipo").value,
        rol: body.querySelector("#usrRol").value,
        departamento_id: deptVal ? Number(deptVal) : null,
      };
      if (passVal) {
        payload.password = passVal;
      }

      try {
        if (esEdicion) {
          await api.actualizarUsuario(usuario.id, payload);
          showToast("Usuario actualizado correctamente", "success");
        } else {
          await api.crearUsuario(payload);
          showToast("Usuario registrado correctamente", "success");
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