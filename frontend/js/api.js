export const API_BASE_URL = "http://127.0.0.1:8000/api/v1";

/**
 * Extrae un mensaje legible desde respuestas de error de FastAPI (400, 404, 409, 422).
 */
function parseApiError(data, status) {
  if (!data) {
    return `Error HTTP ${status}`;
  }
  if (typeof data.detail === "string") {
    return data.detail;
  }
  if (Array.isArray(data.detail)) {
    return data.detail
      .map((err) => {
        const campo = Array.isArray(err.loc) ? err.loc.slice(1).join(".") : "";
        const msg = err.msg.replace(/^Value error,\s*/i, "");
        return campo ? `${campo}: ${msg}` : msg;
      })
      .join(" | ");
  }
  return `Error inesperado (${status})`;
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  };

  let response;
  try {
    response = await fetch(url, config);
  } catch {
    throw new Error(
      "No se pudo conectar con el servidor backend (http://127.0.0.1:8000). Verifica que FastAPI esté encendido."
    );
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(parseApiError(data, response.status));
  }

  return data;
}

export const api = {
  // Estado
  verificarEstado: () => request("/estado"),

  // Departamentos
  listarDepartamentos: () => request("/departamentos/"),
  crearDepartamento: (payload) =>
    request("/departamentos/", { method: "POST", body: JSON.stringify(payload) }),
  actualizarDepartamento: (id, payload) =>
    request(`/departamentos/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  eliminarDepartamento: (id) =>
    request(`/departamentos/${id}`, { method: "DELETE" }),

  // Usuarios
  listarUsuarios: () => request("/usuarios/"),
  crearUsuario: (payload) =>
    request("/usuarios/", { method: "POST", body: JSON.stringify(payload) }),
  actualizarUsuario: (id, payload) =>
    request(`/usuarios/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  eliminarUsuario: (id) =>
    request(`/usuarios/${id}`, { method: "DELETE" }),

  // Recursos
  listarRecursos: () => request("/recursos/"),
  crearRecurso: (payload) =>
    request("/recursos/", { method: "POST", body: JSON.stringify(payload) }),
  actualizarRecurso: (id, payload) =>
    request(`/recursos/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  eliminarRecurso: (id) =>
    request(`/recursos/${id}`, { method: "DELETE" }),

  // Solicitudes
  listarSolicitudes: () => request("/solicitudes/"),
  crearSolicitud: (payload) =>
    request("/solicitudes/", { method: "POST", body: JSON.stringify(payload) }),
  decidirSolicitud: (id, payload) =>
    request(`/solicitudes/${id}/decision`, { method: "PATCH", body: JSON.stringify(payload) }),

  // Préstamos
  listarPrestamos: () => request("/prestamos/"),
  registrarEntrega: (id) =>
    request(`/prestamos/${id}/entrega`, { method: "POST" }),
  registrarDevolucion: (id, payload) =>
    request(`/prestamos/${id}/devolucion`, { method: "POST", body: JSON.stringify(payload) }),

  // Prórrogas
  listarProrrogas: () => request("/prorrogas/"),
  crearProrroga: (payload) =>
    request("/prorrogas/", { method: "POST", body: JSON.stringify(payload) }),
  decidirProrroga: (id, payload) =>
    request(`/prorrogas/${id}/decision`, { method: "PATCH", body: JSON.stringify(payload) }),

  // Reportes
  obtenerResumen: () => request("/reportes/resumen"),
  obtenerPrestamosActivos: () => request("/reportes/prestamos-activos"),
  obtenerHistorialPrestamos: () => request("/reportes/historial-prestamos"),
};