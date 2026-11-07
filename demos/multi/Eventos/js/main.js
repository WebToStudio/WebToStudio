/**
 * CHISPA — Eventos & Experiencias Creativas
 * Lógica compartida: Header/Footer modulares, menú móvil, filtros, modal y configurador.
 */

document.addEventListener('DOMContentLoaded', () => {
  injectLayout();
  initMobileNav();
  initGalleryFilters();
  initGalleryModal();
  initQuoteConfigurator();
});

/* =========================================================
   1. INYECCIÓN DE HEADER Y FOOTER COMPARTIDOS
   ========================================================= */
function injectLayout() {
  const headerContainer = document.getElementById('app-header');
  const footerContainer = document.getElementById('app-footer');

  // Detectar página actual para asignar clase .active
  const path = window.location.pathname;
  const page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';

  const isActive = (target) => (page === target ? 'active' : '');

  if (headerContainer) {
    headerContainer.innerHTML = `
      <div class="demo-bar">
        <span>💡 Demo WebToStudio: Web Multisectorial Colorida</span>
        <a href="/index.html#proyectos">← Volver</a>
      </div>
      <header class="site-header">
        <div class="container nav-container">
          <a href="index.html" class="brand-logo">CHISPA!</a>
          <button class="nav-toggle" id="nav-toggle" aria-label="Abrir menú de navegación" aria-expanded="false">
            <span></span>
            <span></span>
            <span></span>
          </button>
          <nav class="nav-menu" id="nav-menu" aria-label="Navegación principal">
            <a href="index.html" class="nav-link ${isActive('index.html')}">Inicio</a>
            <a href="experiencias.html" class="nav-link ${isActive('experiencias.html')}">Experiencias</a>
            <a href="galeria.html" class="nav-link ${isActive('galeria.html')}">Galería</a>
            <a href="cotizar.html" class="btn btn-primary ${isActive('cotizar.html')}">Cotizar Evento ⚡</a>
          </nav>
        </div>
      </header>
    `;
  }

  if (footerContainer) {
    footerContainer.innerHTML = `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-brand">
              <a href="index.html" class="brand-logo" style="color: #18181B;">CHISPA!</a>
              <p>Agencia creativa de producción de eventos, festivales boutique y experiencias de marca con alto impacto visual y emocional.</p>
              <div class="social-links">
                <a href="#" aria-label="Instagram">Instagram</a>
                <a href="#" aria-label="TikTok">TikTok</a>
                <a href="#" aria-label="LinkedIn">LinkedIn</a>
              </div>
            </div>

            <div class="footer-col">
              <h4>Explorar</h4>
              <ul class="footer-links">
                <li><a href="index.html">Inicio</a></li>
                <li><a href="experiencias.html">Formatos y Experiencias</a></li>
                <li><a href="galeria.html">Casos de Éxito</a></li>
                <li><a href="cotizar.html">Configurador de Presupuesto</a></li>
              </ul>
            </div>

            <div class="footer-col">
              <h4>Contacto Directo</h4>
              <ul class="footer-links">
                <li>📍 Calle Kreativa 42, Madrid & Barcelona</li>
                <li>📞 +34 910 882 419</li>
                <li>✉️ hola@chispaeventos.es</li>
                <li>🕒 Lun – Vie: 09:30 a 19:00</li>
              </ul>
            </div>
          </div>

          <div class="footer-bottom">
            <span>© ${new Date().getFullYear()} Chispa — Eventos & Experiencias Creativas. Todos los derechos reservados.</span>
            <span>Plantilla modular multisectorial • WebToStudio</span>
          </div>
        </div>
      </footer>
    `;
  }
}

/* =========================================================
   2. MENÚ HAMBURGUESA MÓVIL
   ========================================================= */
function initMobileNav() {
  const toggleBtn = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('is-open');
    toggleBtn.setAttribute('aria-expanded', String(isOpen));
  });
}

/* =========================================================
   3. FILTROS INTERACTIVOS DE GALERÍA (galeria.html)
   ========================================================= */
function initGalleryFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.gallery-card');
  if (!filterButtons.length || !cards.length) return;

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const selectedCategory = btn.dataset.filter;

      cards.forEach((card) => {
        const cardCategory = card.dataset.category;
        if (selectedCategory === 'todos' || cardCategory === selectedCategory) {
          card.classList.remove('is-hidden');
        } else {
          card.classList.add('is-hidden');
        }
      });
    });
  });
}

/* =========================================================
   4. MODAL DE DETALLES DE MONTAJE (galeria.html)
   ========================================================= */
function initGalleryModal() {
  const modal = document.getElementById('gallery-modal');
  const cards = document.querySelectorAll('.gallery-card');
  if (!modal || !cards.length) return;

  const modalImg = document.getElementById('modal-img');
  const modalCat = document.getElementById('modal-cat');
  const modalMeta = document.getElementById('modal-meta');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const closeBtn = document.getElementById('modal-close');

  const openModal = (card) => {
    modalImg.src = card.dataset.img;
    modalImg.alt = card.dataset.title;
    modalCat.textContent = card.dataset.category;
    modalMeta.textContent = `📍 ${card.dataset.city} • 👥 ${card.dataset.attendees}`;
    modalTitle.textContent = card.dataset.title;
    modalDesc.textContent = card.dataset.details;

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
  };

  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
  };

  cards.forEach((card) => {
    card.addEventListener('click', () => openModal(card));
  });

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });
}

/* =========================================================
   5. CONFIGURADOR DE EVENTO & FORMULARIO (cotizar.html)
   ========================================================= */
function initQuoteConfigurator() {
  const eventSelect = document.getElementById('event-type');
  const slider = document.getElementById('attendees-slider');
  const attendeesDisplay = document.getElementById('attendees-display');
  const extraInputs = document.querySelectorAll('.extra-input');
  const totalEstimateEl = document.getElementById('total-estimate');
  const breakdownEl = document.getElementById('estimate-breakdown');
  const quoteForm = document.getElementById('quote-form');

  if (!eventSelect || !slider) return;

  // Leer parámetro ?tipo= de la URL para preseleccionar formato
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedType = urlParams.get('tipo');
  if (preselectedType) {
    Array.from(eventSelect.options).forEach((option) => {
      if (option.value.toLowerCase() === preselectedType.toLowerCase()) {
        eventSelect.value = option.value;
      }
    });
  }

  // Cálculo dinámico en tiempo real
  const calculateEstimate = () => {
    const selectedOption = eventSelect.options[eventSelect.selectedIndex];
    const basePrice = Number(selectedOption.dataset.base) || 0;
    const perHeadPrice = Number(selectedOption.dataset.perHead) || 0;
    const attendees = Number(slider.value);

    attendeesDisplay.textContent = `${attendees} personas`;

    let extrasTotal = 0;
    let selectedExtrasCount = 0;

    extraInputs.forEach((checkbox) => {
      if (checkbox.checked) {
        selectedExtrasCount++;
        const fixed = Number(checkbox.dataset.price) || 0;
        const variable = (Number(checkbox.dataset.perHead) || 0) * attendees;
        extrasTotal += fixed + variable;
      }
    });

    const total = basePrice + (perHeadPrice * attendees) + extrasTotal;
    totalEstimateEl.textContent = `${total.toLocaleString('es-ES')} €`;
    breakdownEl.textContent = `Formato ${selectedOption.value} • ${attendees} asistentes • ${selectedExtrasCount} extra(s)`;
  };

  eventSelect.addEventListener('change', calculateEstimate);
  slider.addEventListener('input', calculateEstimate);
  extraInputs.forEach((cb) => cb.addEventListener('change', calculateEstimate));

  // Ejecutar cálculo inicial
  calculateEstimate();

  // Envío de formulario sin recargar la página
  if (quoteForm) {
    const successBanner = document.getElementById('form-success');
    const successSummary = document.getElementById('success-summary');
    const resetBtn = document.getElementById('reset-form-btn');

    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!quoteForm.checkValidity()) {
        quoteForm.reportValidity();
        return;
      }

      const clientName = document.getElementById('client-name').value.trim();
      const eventDate = document.getElementById('event-date').value;
      const chosenType = eventSelect.value;
      const attendees = slider.value;
      const estimatedPrice = totalEstimateEl.textContent;

      successSummary.innerHTML = `Gracias, <strong>${clientName}</strong>. Hemos registrado tu configuración para <strong>${chosenType}</strong> (${attendees} asistentes, fecha aprox. ${eventDate}) con una estimación de <strong>${estimatedPrice}</strong>. Nuestro equipo creativo te escribirá en menos de 48h.`;

      quoteForm.hidden = true;
      successBanner.hidden = false;
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        quoteForm.reset();
        calculateEstimate();
        successBanner.hidden = true;
        quoteForm.hidden = false;
      });
    }
  }
}
