import { api } from "./api.js";
import { closeModal } from "./state.js";
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
  },
  departamentos: {
    titulo: "Departamentos",
    subtitulo: "Unidades académicas y administrativas de la institución",
    render: renderDepartamentos,
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
  },
};

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

  await verificarConexionBackend();
  await navigateTo("dashboard");
});