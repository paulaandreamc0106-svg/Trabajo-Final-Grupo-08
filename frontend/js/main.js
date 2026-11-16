import {
  api,
  clearAuthSession,
  getAuthToken,
  setAuthSession,
} from "./api.js";
import { closeModal, showToast, store } from "./state.js";
import { renderDashboard } from "./dashboard.js";
import { renderRecursos } from "./recursos.js";
import { renderUsuarios } from "./usuarios.js";
import { renderDepartamentos } from "./departamentos.js";
import { renderSolicitudes } from "./solicitudes.js";
import { renderPrestamos } from "./prestamos.js";
import { renderProrrogas } from "./prorrogas.js";
import { renderReportes } from "./reportes.js";

const VISTAS = {
  dashboard: {
    titulo: "Panel General",
    subtitulo: "Resumen operativo y monitoreo de préstamos en curso",
    render: renderDashboard,
  },
  recursos: {
    titulo: "Catálogo de Recursos",
    subtitulo: "Inventario de equipos, códigos institucionales y disponibilidad",
    render: renderRecursos,
  },
  usuarios: {
    titulo: "Usuarios Institucionales",
    subtitulo: "Gestión de estudiantes, docentes, contratistas y responsables",
    render: renderUsuarios,
    roles: ["responsable", "coordinacion"],
  },
  departamentos: {
    titulo: "Departamentos",
    subtitulo: "Unidades académicas y administrativas de la institución",
    render: renderDepartamentos,
    roles: ["responsable", "coordinacion"],
  },
  solicitudes: {
    titulo: "Solicitudes de Préstamo",
    subtitulo: "Registro, consulta y evaluación de solicitudes",
    render: renderSolicitudes,
  },
  prestamos: {
    titulo: "Préstamos, Entregas y Devoluciones",
    subtitulo: "Control de entregas físicas y recepción de equipos",
    render: renderPrestamos,
  },
  prorrogas: {
    titulo: "Prórrogas",
    subtitulo: "Solicitudes y evaluación de extensión de fechas de devolución",
    render: renderProrrogas,
  },
  reportes: {
    titulo: "Reportes de Coordinación",
    subtitulo: "Consolidado estadístico, préstamos activos e historial",
    render: renderReportes,
    roles: ["responsable", "coordinacion"],
  },
};

function aplicarPermisosMenu() {
  const rol = store.usuarioActual?.rol || "";
  document.getElementById("sessionUserName").textContent =
    store.usuarioActual?.nombre || "Usuario";
  document.getElementById("sessionUserRole").textContent = rol;

  document.querySelectorAll(".nav-link").forEach((btn) => {
    const rolesAttr = btn.dataset.roles;
    if (!rolesAttr) {
      btn.classList.remove("hidden");
      return;
    }
    const permitidos = rolesAttr.split(",");
    btn.classList.toggle("hidden", !permitidos.includes(rol));
  });
}

function mostrarPantallaLogin() {
  document.getElementById("appShell").classList.add("hidden");
  document.getElementById("authScreen").classList.remove("hidden");
}

async function mostrarAplicacion(usuario) {
  store.usuarioActual = usuario;
  document.getElementById("authScreen").classList.add("hidden");
  document.getElementById("appShell").classList.remove("hidden");
  aplicarPermisosMenu();
  await verificarConexionBackend();
  await navigateTo("dashboard");
}

async function verificarConexionBackend() {
  const indicator = document.getElementById("apiStatusIndicator");
  const text = document.getElementById("apiStatusText");
  try {
    await api.verificarEstado();
    indicator.classList.remove("offline");
    indicator.classList.add("online");
    text.textContent = "API Conectada";
  } catch {
    indicator.classList.remove("online");
    indicator.classList.add("offline");
    text.textContent = "API Desconectada";
  }
}

async function navigateTo(vistaKey) {
  const vista = VISTAS[vistaKey] || VISTAS.dashboard;
  const rol = store.usuarioActual?.rol;

  if (vista.roles && !vista.roles.includes(rol)) {
    showToast("No tienes permisos para acceder a ese módulo.", "error");
    return navigateTo("dashboard");
  }

  const content = document.getElementById("appContent");

  document.querySelectorAll(".nav-link").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === vistaKey);
  });

  document.getElementById("topbarTitle").textContent = vista.titulo;
  document.getElementById("topbarSubtitle").textContent = vista.subtitulo;
  document.getElementById("sidebar").classList.remove("open");

  content.innerHTML = `
    <div class="loading-box">
      <div class="spinner"></div>
      <p>Cargando ${vista.titulo.toLowerCase()}...</p>
    </div>
  `;

  await vista.render(content, navigateTo);
}

document.addEventListener("DOMContentLoaded", async () => {
  // Autocompletar cuentas demo
  document.querySelectorAll("[data-demo-email]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.getElementById("loginCorreo").value = btn.dataset.demoEmail;
      document.getElementById("loginPassword").value = btn.dataset.demoPass;
    });
  });

  // Formulario Login
  document.getElementById("formLogin").addEventListener("submit", async (e) => {
    e.preventDefault();
    const correo = document.getElementById("loginCorreo").value.trim();
    const password = document.getElementById("loginPassword").value;

    try {
      const res = await api.login({ correo, password });
      setAuthSession(res.access_token, res.usuario);
      showToast(`Bienvenido/a, ${res.usuario.nombre}`, "success");
      await mostrarAplicacion(res.usuario);
    } catch (error) {
      showToast(error.message, "error");
    }
  });

  // Cerrar sesión
  document.getElementById("btnLogout").addEventListener("click", () => {
    clearAuthSession();
    store.usuarioActual = null;
    mostrarPantallaLogin();
    showToast("Sesión cerrada correctamente", "info");
  });

  window.addEventListener("sigep:unauthorized", () => {
    store.usuarioActual = null;
    mostrarPantallaLogin();
    showToast("Tu sesión ha expirado. Inicia sesión nuevamente.", "error");
  });

  document.querySelectorAll(".nav-link").forEach((btn) => {
    btn.addEventListener("click", () => navigateTo(btn.dataset.view));
  });

  document.getElementById("btnToggleMenu").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("open");
  });

  document.getElementById("globalModalClose").addEventListener("click", closeModal);
  document.getElementById("globalModalBackdrop").addEventListener("click", (e) => {
    if (e.target.id === "globalModalBackdrop") closeModal();
  });

  // Verificar sesión activa al recargar
  if (getAuthToken()) {
    try {
      const perfil = await api.obtenerPerfil();
      await mostrarAplicacion(perfil);
      return;
    } catch {
      clearAuthSession();
    }
  }

  mostrarPantallaLogin();
});