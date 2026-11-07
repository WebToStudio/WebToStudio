/**
 * Aura — Clínica Dental & Fisioterapia
 * Lógica modular compartida: inyección de Header/Footer, estado activo,
 * menú móvil, lectura de parámetros URL y gestión del formulario de cita.
 */

document.addEventListener('DOMContentLoaded', () => {
  injectLayout();
  initMobileMenu();
  initAppointmentForm();
});

/**
 * Inyecta la barra superior de demostración, la navegación principal
 * con detección automática de ruta activa y el footer corporativo.
 */
function injectLayout() {
  const headerContainer = document.getElementById('app-header');
  const footerContainer = document.getElementById('app-footer');

  // Detectar página actual para asignar la clase .active
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';

  const isActive = (fileName) => (currentPath === fileName ? 'active' : '');

  if (headerContainer) {
    headerContainer.innerHTML = `
      <div class="demo-bar">
        <div class="container demo-bar-inner">
          <span>💡 Demo WebToStudio: Web Multisectorial Minimalista</span>
          <a href="/index.html#proyectos">← Volver</a>
        </div>
      </div>

      <header class="site-header">
        <div class="container navbar">
          <a href="index.html" class="brand-logo" aria-label="Aura Salud Inicio">
            Aura <span>Salud.</span>
          </a>

          <button 
            type="button" 
            class="nav-toggle" 
            id="nav-toggle" 
            aria-label="Abrir menú de navegación" 
            aria-expanded="false"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <nav class="nav-menu" id="nav-menu" aria-label="Navegación principal">
            <a href="index.html" class="nav-link ${isActive('index.html')}">Inicio</a>
            <a href="tratamientos.html" class="nav-link ${isActive('tratamientos.html')}">Tratamientos</a>
            <a href="equipo.html" class="nav-link ${isActive('equipo.html')}">Equipo Médico</a>
            <a href="contacto.html" class="btn btn-primary btn-sm ${isActive('contacto.html')}">Pedir Cita</a>
          </nav>
        </div>
      </header>
    `;
  }

  if (footerContainer) {
    const currentYear = new Date().getFullYear();

    footerContainer.innerHTML = `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-brand">
              <a href="index.html" class="brand-logo">Aura <span>Salud.</span></a>
              <p>Clínica especializada en Odontología Avanzada y Fisioterapia. Diagnóstico digital 3D y atención médica centrada en el paciente.</p>
            </div>

            <div class="footer-col">
              <h4>Navegación</h4>
              <ul class="footer-links">
                <li><a href="index.html">Inicio</a></li>
                <li><a href="tratamientos.html">Tratamientos</a></li>
                <li><a href="equipo.html">Cuadro Médico</a></li>
                <li><a href="contacto.html">Solicitar Cita</a></li>
              </ul>
            </div>

            <div class="footer-col">
              <h4>Especialidades</h4>
              <ul class="footer-links">
                <li><a href="tratamientos.html#odontologia">Ortodoncia Invisible</a></li>
                <li><a href="tratamientos.html#odontologia">Implantología Guiada</a></li>
                <li><a href="tratamientos.html#fisioterapia">Fisioterapia Deportiva</a></li>
                <li><a href="tratamientos.html#fisioterapia">Rehabilitación de ATM</a></li>
              </ul>
            </div>

            <div class="footer-col">
              <h4>Horario de Clínica</h4>
              <div class="footer-hours">
                <span><strong>Lun – Jue:</strong> 09:00 a 20:30</span>
                <span><strong>Viernes:</strong> 09:00 a 18:00</span>
                <span><strong>Sábados:</strong> 10:00 a 14:00</span>
                <span><strong>Urgencias:</strong> 910 00 24 18</span>
              </div>
            </div>
          </div>

          <div class="footer-bottom">
            <span>© ${currentYear} Aura Clínica Dental &amp; Fisioterapia. Todos los derechos reservados.</span>
            <span>Reg. Sanitario CS-14920 · Aviso Legal y Privacidad</span>
          </div>
        </div>
      </footer>
    `;
  }
}

/**
 * Controla la apertura y cierre del menú hamburguesa en dispositivos móviles.
 */
function initMobileMenu() {
  const toggleBtn = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('is-open');
    toggleBtn.setAttribute('aria-expanded', String(isOpen));
  });

  // Cerrar menú al hacer clic en cualquier enlace
  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('is-open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

/**
 * Gestiona el formulario de contacto:
 * 1. Lee el parámetro ?servicio= de la URL y lo selecciona automáticamente.
 * 2. Establece la fecha mínima al día de hoy.
 * 3. Muestra una confirmación elegante sin recargar la página al enviar.
 */
function initAppointmentForm() {
  const form = document.getElementById('appointment-form');
  if (!form) return;

  const treatmentSelect = document.getElementById('treatment-select');
  const dateInput = document.getElementById('appointment-date');
  const confirmationCard = document.getElementById('form-confirmation');
  const confirmationDetails = document.getElementById('confirmation-details');
  const resetBtn = document.getElementById('reset-form-btn');

  // Establecer fecha mínima hoy en el selector de fecha
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }

  // Leer parámetro ?servicio= de la URL
  const urlParams = new URLSearchParams(window.location.search);
  const requestedService = urlParams.get('servicio');

  if (requestedService && treatmentSelect) {
    const normalizedQuery = requestedService.trim().toLowerCase();

    for (const option of treatmentSelect.options) {
      if (option.value.toLowerCase() === normalizedQuery) {
        treatmentSelect.value = option.value;
        break;
      }
    }
  }

  // Envío asíncrono simulado sin recarga
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const name = formData.get('name');
    const treatment = formData.get('treatment');
    const date = formData.get('date');
    const slot = formData.get('slot');

    // Formatear fecha a formato legible español (DD/MM/YYYY)
    const formattedDate = date ? date.split('-').reverse().join('/') : '';

    confirmationDetails.innerHTML = `
      Gracias, <strong>${escapeHTML(name)}</strong>. Hemos registrado tu solicitud para 
      <strong>${escapeHTML(treatment)}</strong> el día <strong>${formattedDate}</strong> 
      en horario de <strong>${escapeHTML(slot)}</strong>. Te llamaremos en breve para confirmar la hora exacta.
    `;

    form.hidden = true;
    confirmationCard.hidden = false;
  });

  // Permitir volver a mostrar el formulario limpio
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      confirmationCard.hidden = true;
      form.hidden = false;
    });
  }
}

/**
 * Escapa caracteres HTML para evitar inyección en mensajes dinámicos.
 */
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
