/**
 * AutoSelect Enterprise — Shared Layout Injector
 */
(function () {
  'use strict';

  const NAV_ITEMS = [
    { href: 'index.html', label: 'Inicio' },
    { href: 'inventario.html', label: 'Inventario Certificado' },
    { href: 'taller.html', label: 'Taller Oficial' },
    { href: 'tasacion.html', label: 'Tasación y Centros' }
  ];

  function getCurrentPage() {
    const path = window.location.pathname;
    const file = path.substring(path.lastIndexOf('/') + 1);
    return file === '' ? 'index.html' : file;
  }

  function renderHeader() {
    const currentPage = getCurrentPage();
    const headerHost = document.getElementById('app-header');
    if (!headerHost) return;

    const navLinksHtml = NAV_ITEMS.map((item) => {
      const isActive = currentPage === item.href ? 'active' : '';
      return `<a href="${item.href}" class="${isActive}" ${isActive ? 'aria-current="page"' : ''}>${item.label}</a>`;
    }).join('');

    headerHost.innerHTML = `
      <div class="demo-topbar">
        <span>💡 Demo WebToStudio: App Web Minimalista Enterprise</span>
        <a href="/index.html#proyectos">← Volver</a>
      </div>
      <header class="site-header">
        <div class="container header-inner">
          <a href="index.html" class="brand-logo" aria-label="AutoSelect Enterprise Inicio">
            <span class="brand-mark">AS</span>
            <span>AutoSelect</span>
            <span class="brand-tag">Enterprise</span>
          </a>

          <button type="button" class="nav-toggle" id="wts-nav-toggle" aria-label="Abrir menú" aria-expanded="false">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          <nav class="main-nav" id="wts-main-nav" aria-label="Navegación principal">
            ${navLinksHtml}
          </nav>

          <div class="header-cta">
            <a href="inventario.html" class="btn btn-primary btn-sm">Explorar Stock</a>
          </div>
        </div>
      </header>
    `;

    const toggleBtn = document.getElementById('wts-nav-toggle');
    const navMenu = document.getElementById('wts-main-nav');
    if (toggleBtn && navMenu) {
      toggleBtn.addEventListener('click', () => {
        const expanded = navMenu.classList.toggle('is-open');
        toggleBtn.setAttribute('aria-expanded', String(expanded));
      });
    }
  }

  function renderFooter() {
    const footerHost = document.getElementById('app-footer');
    if (!footerHost) return;

    const year = new Date().getFullYear();
    footerHost.innerHTML = `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-grid">
            <div>
              <div class="brand-logo" style="color: #FFFFFF; margin-bottom: 0.85rem;">
                <span class="brand-mark" style="background: #0071E3;">AS</span>
                <span>AutoSelect Enterprise</span>
              </div>
              <p style="font-size: 0.875rem; max-width: 34ch; line-height: 1.6;">
                Vehículos certificados, movilidad eléctrica y servicio técnico oficial con inspección auditada de 150 puntos.
              </p>
            </div>

            <div>
              <h2 class="footer-heading">Plataforma</h2>
              <ul class="footer-links">
                <li><a href="index.html">Portada Corporativa</a></li>
                <li><a href="inventario.html">Catálogo Certificado</a></li>
                <li><a href="taller.html">Taller Oficial y Posventa</a></li>
                <li><a href="tasacion.html">Tasación Online</a></li>
              </ul>
            </div>

            <div>
              <h2 class="footer-heading">Garantías</h2>
              <ul class="footer-links">
                <li><a href="inventario.html">Certificación 150 Puntos</a></li>
                <li><a href="inventario.html">Historial CARFAX Verificado</a></li>
                <li><a href="taller.html">Garantía Europea 24 Meses</a></li>
                <li><a href="tasacion.html">Compromiso de Recompra</a></li>
              </ul>
            </div>

            <div>
              <h2 class="footer-heading">Atención Corporativa</h2>
              <ul class="footer-links">
                <li>Madrid · Av. de la Industria 48</li>
                <li>Barcelona · Passeig Zona Franca 112</li>
                <li>Sevilla · Parque Empresarial Torneo</li>
                <li style="color: #FFFFFF; font-weight: 500; margin-top: 0.25rem;">900 842 190 · L-S 09:00–20:00</li>
              </ul>
            </div>
          </div>

          <div class="footer-bottom">
            <span>© ${year} AutoSelect Enterprise S.A. Todos los derechos reservados.</span>
            <span>Precios con IVA deducible incluido · Arquitectura Modular WebToStudio</span>
          </div>
        </div>
      </footer>
    `;
  }

  function initLayout() {
    renderHeader();
    renderFooter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLayout);
  } else {
    initLayout();
  }
})();
