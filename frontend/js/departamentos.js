import { api } from "./api.js";
import {
  store,
  escapeHTML,
  showToast,
  openModal,
  closeModal,
} from "./state.js";

export async function renderDepartamentos(container) {
  async function cargarYRenderizar() {
    try {
      const [departamentos, usuarios] = await Promise.all([
        api.listarDepartamentos(),
        api.listarUsuarios(),
      ]);
      store.departamentos = departamentos;
      store.usuarios = usuarios;
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
          <h3 class="section-title">Departamentos y Áreas (${store.departamentos.length})</h3>
          <button class="btn btn-primary" id="btnNuevoDept">+ Nuevo Departamento</button>
        </div>

        ${
          store.departamentos.length === 0
            ? `<div class="empty-state">No hay departamentos registrados todavía.</div>`
            : `
            <div class="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre del Departamento</th>
                    <th>Usuarios Asociados</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  ${store.departamentos
                    .map((d) => {
                      const cantidadUsuarios = store.usuarios.filter(
                        (u) => u.departamento_id === d.id
                      ).length;
                      return `
                      <tr>
                        <td>#${d.id}</td>
                        <td><strong>${escapeHTML(d.nombre)}</strong></td>
                        <td>${cantidadUsuarios} usuario(s)</td>
                        <td>
                          <div class="actions-group">
                            <button class="btn btn-secondary btn-sm" data-edit="${d.id}">Editar</button>
                            <button class="btn btn-danger btn-sm" data-delete="${d.id}">Eliminar</button>
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

    document.getElementById("btnNuevoDept").addEventListener("click", () => abrirFormularioDept());

    container.querySelectorAll("[data-edit]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const dept = store.departamentos.find((d) => d.id === Number(btn.dataset.edit));
        if (dept) abrirFormularioDept(dept);
      });
    });

    container.querySelectorAll("[data-delete]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = Number(btn.dataset.delete);
        if (!confirm("¿Seguro que deseas eliminar este departamento?")) return;
        try {
          await api.eliminarDepartamento(id);
          showToast("Departamento eliminado correctamente", "success");
          await cargarYRenderizar();
        } catch (error) {
          showToast(error.message, "error");
        }
      });
    });
  }

  function abrirFormularioDept(dept = null) {
    const esEdicion = Boolean(dept);
    const body = openModal(
      esEdicion ? `Editar Departamento #${dept.id}` : "Registrar Departamento",
      `
      <form id="formDepartamento">
        <div class="form-group">
          <label for="deptNombre">Nombre del departamento *</label>
          <input class="input" id="deptNombre" required minlength="2" maxlength="100" value="${escapeHTML(dept?.nombre || "")}" />
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" id="btnCancelarModal">Cancelar</button>
          <button type="submit" class="btn btn-primary">${esEdicion ? "Guardar Cambios" : "Crear Departamento"}</button>
        </div>
      </form>
      `
    );

    body.querySelector("#btnCancelarModal").addEventListener("click", closeModal);

    body.querySelector("#formDepartamento").addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = { nombre: body.querySelector("#deptNombre").value.trim() };
      try {
        if (esEdicion) {
          await api.actualizarDepartamento(dept.id, payload);
          showToast("Departamento actualizado correctamente", "success");
        } else {
          await api.crearDepartamento(payload);
          showToast("Departamento creado correctamente", "success");
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