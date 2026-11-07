/**
 * NORTE — Reformas e Interiorismo
 * Módulo principal compartido:
 * 1. Inyección automática de Header (barra demo + navegación) y Footer corporativo
 * 2. Menú hamburguesa responsive
 * 3. Comparador interactivo Antes / Después (proyectos.html)
 * 4. Galería filtrable por categorías (proyectos.html)
 * 5. Calculadora orientativa por m² y formulario de visita técnica (presupuesto.html)
 */

document.addEventListener('DOMContentLoaded', () => {
  injectSharedLayout();
  initMobileNavigation();
  initBeforeAfterComparator();
  initProjectFilters();
  initBudgetCalculator();
  initVisitRequestForm();
});

/* ==========================================================================
   1. INYECCIÓN DE HEADER Y FOOTER COMPARTIDOS
   ========================================================================== */
function injectSharedLayout() {
  const headerContainer = document.getElementById('app-header');
  const footerContainer = document.getElementById('app-footer');

  // Detectar archivo actual para marcar clase .active
  const path = window.location.pathname;
  const currentPage = path.substring(path.lastIndexOf('/') + 1) || 'index.html';

  const isActive = (target) => (currentPage === target ? 'active' : '');

  if (headerContainer) {
    headerContainer.innerHTML = `
      <div class="demo-bar">
        <div class="container demo-bar__inner">
          <span>💡 Demo WebToStudio: Web Multisectorial Profesional</span>
          <a href="/index.html#proyectos">← Volver</a>
        </div>
      </div>

      <header class="site-header">
        <div class="container navbar">
          <a href="index.html" class="brand-logo" aria-label="Norte Reformas e Interiorismo - Inicio">
            <span class="brand-logo__mark">NORTE<span>.</span></span>
            <span class="brand-logo__sub">Reformas e Interiorismo</span>
          </a>

          <button
            type="button"
            class="nav-toggle"
            id="nav-toggle"
            aria-label="Abrir menú de navegación"
            aria-expanded="false"
            aria-controls="nav-menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <nav class="nav-menu" id="nav-menu" aria-label="Navegación principal">
            <a href="index.html" class="nav-link ${isActive('index.html')}">Inicio</a>
            <a href="servicios.html" class="nav-link ${isActive('servicios.html')}">Servicios</a>
            <a href="proyectos.html" class="nav-link ${isActive('proyectos.html')}">Proyectos</a>
            <a href="presupuesto.html" class="btn btn--primary btn--sm nav-cta ${isActive('presupuesto.html')}">
              Calcular presupuesto
            </a>
          </nav>
        </div>
      </header>
    `;
  }

  if (footerContainer) {
    const year = new Date().getFullYear();
    footerContainer.innerHTML = `
      <footer class="site-footer">
        <div class="container footer-grid">
          <div class="footer-brand">
            <a href="index.html" class="brand-logo">
              <span class="brand-logo__mark">NORTE<span>.</span></span>
              <span class="brand-logo__sub">Reformas e Interiorismo</span>
            </a>
            <p>
              Estudio de arquitectura técnica y ejecución de reformas llave en mano. Compromiso contractual en precio cerrado, plazos y calidad constructiva.
            </p>
          </div>

          <div class="footer-col">
            <h4>Navegación</h4>
            <ul class="footer-links">
              <li><a href="index.html">Inicio</a></li>
              <li><a href="servicios.html">Servicios y metodología</a></li>
              <li><a href="proyectos.html">Obras ejecutadas</a></li>
              <li><a href="presupuesto.html">Calculadora de presupuesto</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4>Garantías Norte</h4>
            <ul class="footer-links">
              <li>Garantía escrita de 5 años</li>
              <li>Presupuesto cerrado por contrato</li>
              <li>Dirección facultativa colegiada</li>
              <li>Seguro de Responsabilidad Civil</li>
            </ul>
          </div>

          <div class="footer-col">
            <h4>Estudio Central</h4>
            <ul class="footer-links">
              <li>Calle de Velázquez, 54 · Madrid</li>
              <li>Tel: +34 910 842 190</li>
              <li>proyectos@nortereformas.es</li>
              <li>Lunes a Viernes: 09:00 – 19:00</li>
            </ul>
          </div>
        </div>

        <div class="container footer-bottom">
          <span>© ${year} NORTE. Reformas e Interiorismo S.L. Todos los derechos reservados.</span>
          <span>Arquitectura · Construcción · Interiorismo</span>
        </div>
      </footer>
    `;
  }
}

/* ==========================================================================
   2. MENÚ HAMBURGUESA MÓVIL
   ========================================================================== */
function initMobileNavigation() {
  const toggleBtn = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('is-open');
    toggleBtn.setAttribute('aria-expanded', String(isOpen));
  });

  // Cerrar menú al pulsar un enlace en móvil
  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('is-open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ==========================================================================
   3. COMPARADOR INTERACTIVO ANTES / DESPUÉS (PROYECTOS.HTML)
   ========================================================================== */
function initBeforeAfterComparator() {
  const rangeInput = document.getElementById('ba-range');
  const beforeLayer = document.getElementById('ba-before-layer');
  const divider = document.getElementById('ba-divider');

  if (!rangeInput || !beforeLayer || !divider) return;

  const updatePosition = (value) => {
    const percentage = Math.max(0, Math.min(100, Number(value)));
    const rightClip = 100 - percentage;
    beforeLayer.style.clipPath = `inset(0 ${rightClip}% 0 0)`;
    divider.style.left = `${percentage}%`;
  };

  rangeInput.addEventListener('input', (e) => {
    updatePosition(e.target.value);
  });

  // Inicializar en 50%
  updatePosition(rangeInput.value);
}

/* ==========================================================================
   4. GALERÍA FILTRABLE DE OBRAS (PROYECTOS.HTML)
   ========================================================================== */
function initProjectFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  if (!filterButtons.length || !projectCards.length) return;

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const selectedCategory = btn.dataset.filter;

      projectCards.forEach((card) => {
        const cardCategory = card.dataset.category;
        const shouldShow =
          selectedCategory === 'todos' || cardCategory === selectedCategory;
        card.classList.toggle('is-hidden', !shouldShow);
      });
    });
  });
}

/* ==========================================================================
   5. CALCULADORA ORIENTATIVA EN VIVO (PRESUPUESTO.HTML)
   ========================================================================== */
function initBudgetCalculator() {
  const calcContainer = document.getElementById('budget-calculator');
  if (!calcContainer) return;

  const typeButtons = document.querySelectorAll('#calc-type-group .option-btn');
  const qualityButtons = document.querySelectorAll('#calc-quality-group .option-btn');
  const sqmSlider = document.getElementById('calc-sqm');
  const sqmDisplay = document.getElementById('calc-sqm-display');
  const minLabel = document.getElementById('calc-min-label');
  const maxLabel = document.getElementById('calc-max-label');
  const priceRangeEl = document.getElementById('calc-price-range');
  const summaryTextEl = document.getElementById('calc-summary-text');
  const transferBtn = document.getElementById('btn-transfer-calc');
  const notesTextarea = document.getElementById('client-notes');

  // Tarifas orientativas base (€/m²) y rangos lógicos de superficie por tipo
  const config = {
    integral: {
      label: 'Reforma Integral',
      minSqm: 35,
      maxSqm: 300,
      defaultSqm: 95,
      rates: { estandar: 650, premium: 850, lujo: 1150 }
    },
    cocina: {
      label: 'Reforma de Cocina',
      minSqm: 6,
      maxSqm: 45,
      defaultSqm: 14,
      rates: { estandar: 950, premium: 1350, lujo: 1850 }
    },
    bano: {
      label: 'Reforma de Baño',
      minSqm: 4,
      maxSqm: 25,
      defaultSqm: 8,
      rates: { estandar: 1100, premium: 1500, lujo: 2100 }
    }
  };

  const qualityLabels = {
    estandar: 'Estándar',
    premium: 'Premium',
    lujo: 'Lujo'
  };

  let state = {
    type: 'integral',
    quality: 'premium',
    sqm: 95
  };

  // Permitir preselección desde URL (?tipo=cocina / ?tipo=bano)
  const urlParams = new URLSearchParams(window.location.search);
  const paramType = urlParams.get('tipo');
  if (paramType && config[paramType]) {
    state.type = paramType;
    state.sqm = config[paramType].defaultSqm;
    typeButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.type === paramType);
    });
  }

  const formatEUR = (amount) =>
    new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amount);

  const syncSliderLimits = (resetValue = false) => {
    const currentCfg = config[state.type];
    sqmSlider.min = currentCfg.minSqm;
    sqmSlider.max = currentCfg.maxSqm;
    minLabel.textContent = `${currentCfg.minSqm} m²`;
    maxLabel.textContent = `${currentCfg.maxSqm} m²`;

    if (resetValue) {
      state.sqm = currentCfg.defaultSqm;
    } else {
      state.sqm = Math.max(currentCfg.minSqm, Math.min(currentCfg.maxSqm, state.sqm));
    }
    sqmSlider.value = state.sqm;
  };

  const renderCalculation = () => {
    const currentCfg = config[state.type];
    const baseRate = currentCfg.rates[state.quality];
    const minEstimate = Math.round((state.sqm * baseRate * 0.94) / 100) * 100;
    const maxEstimate = Math.round((state.sqm * baseRate * 1.1) / 100) * 100;

    sqmDisplay.textContent = `${state.sqm} m²`;
    priceRangeEl.textContent = `${formatEUR(minEstimate)} – ${formatEUR(maxEstimate)}`;
    summaryTextEl.textContent = `${currentCfg.label} · Calidad ${qualityLabels[state.quality]} · ${state.sqm} m² (Incluye proyecto técnico, gremios, materiales y gestión de residuos).`;
  };

  typeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      typeButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.type = btn.dataset.type;
      syncSliderLimits(true);
      renderCalculation();
    });
  });

  qualityButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      qualityButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.quality = btn.dataset.quality;
      renderCalculation();
    });
  });

  sqmSlider.addEventListener('input', (e) => {
    state.sqm = Number(e.target.value);
    renderCalculation();
  });

  if (transferBtn && notesTextarea) {
    transferBtn.addEventListener('click', () => {
      const summary = `[Simulación web] ${config[state.type].label} | Calidad: ${qualityLabels[state.quality]} | Superficie: ${state.sqm} m² | Horquilla: ${priceRangeEl.textContent}`;
      notesTextarea.value = notesTextarea.value
        ? `${summary}\n${notesTextarea.value}`
        : summary;
      notesTextarea.focus();
    });
  }

  syncSliderLimits(false);
  renderCalculation();
}

/* ==========================================================================
   6. FORMULARIO DE SOLICITUD DE VISITA TÉCNICA (PRESUPUESTO.HTML)
   ========================================================================== */
function initVisitRequestForm() {
  const form = document.getElementById('visit-form');
  const successBox = document.getElementById('form-success');
  const successDetail = document.getElementById('form-success-detail');
  const errorBox = document.getElementById('form-error');
  const resetBtn = document.getElementById('btn-reset-form');

  if (!form || !successBox) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('client-name').value.trim();
    const phone = document.getElementById('client-phone').value.trim();
    const city = document.getElementById('client-city').value.trim();

    if (!name || !phone || !city) {
      errorBox.textContent = 'Por favor, completa los campos obligatorios: Nombre, Teléfono y Localidad.';
      errorBox.hidden = false;
      return;
    }

    errorBox.hidden = true;
    form.hidden = true;

    successDetail.textContent = `Gracias, ${name}. Hemos registrado tu solicitud de visita técnica en ${city}. Un arquitecto de nuestro equipo te llamará al ${phone} en menos de 24 horas laborables.`;
    successBox.hidden = false;
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      successBox.hidden = true;
      form.hidden = false;
    });
  }
}
