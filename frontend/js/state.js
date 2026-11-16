import { api, getStoredUser } from "./api.js";

export const store = {
  usuarioActual: getStoredUser(),
  departamentos: [],
  usuarios: [],
  recursos: [],
  solicitudes: [],
  prestamos: [],
  prorrogas: [],
};

export function tieneRol(...roles) {
  return Boolean(store.usuarioActual && roles.includes(store.usuarioActual.rol));
}

export async function refrescarCatalogosBase() {
  const [departamentos, usuarios, recursos] = await Promise.all([
    api.listarDepartamentos(),
    api.listarUsuarios(),
    api.listarRecursos(),
  ]);
  store.departamentos = departamentos;
  store.usuarios = usuarios;
  store.recursos = recursos;
}

export function nombreDepartamento(id) {
  if (!id) return "Sin departamento";
  const found = store.departamentos.find((d) => d.id === id);
  return found ? found.nombre : `Dept. #${id}`;
}

export function nombreUsuario(id) {
  if (!id) return "—";
  const found = store.usuarios.find((u) => u.id === id);
  return found ? `${found.nombre} (${found.tipo})` : `Usuario #${id}`;
}

export function infoRecurso(id) {
  if (!id) return "—";
  const found = store.recursos.find((r) => r.id === id);
  return found ? `${found.nombre} [${found.codigo}]` : `Recurso #${id}`;
}

export function formatearFecha(valor) {
  if (!valor) return "—";
  if (typeof valor === "string" && /^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    const [y, m, d] = valor.split("-");
    return `${d}/${m}/${y}`;
  }
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return valor;
  return fecha.toLocaleString("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function hoyISO() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function badgeEstado(estado) {
  if (!estado) return "—";
  return `<span class="badge badge-${estado.toLowerCase()}">${estado}</span>`;
}

export function escapeHTML(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function showToast(mensaje, tipo = "info") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast ${tipo}`;
  toast.textContent = mensaje;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4500);
}

export function openModal(titulo, htmlContenido) {
  const backdrop = document.getElementById("globalModalBackdrop");
  document.getElementById("globalModalTitle").textContent = titulo;
  const body = document.getElementById("globalModalBody");
  body.innerHTML = htmlContenido;
  backdrop.classList.remove("hidden");
  return body;
}

export function closeModal() {
  document.getElementById("globalModalBackdrop").classList.add("hidden");
  document.getElementById("globalModalBody").innerHTML = "";
}