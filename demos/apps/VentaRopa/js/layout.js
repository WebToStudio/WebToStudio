/* ==========================================================================
   THREADLAB — LAYOUT GLOBAL INJECTOR (js/layout.js)
   Cabecera responsive sin desbordamiento en móvil (logueado y deslogueado)
   ========================================================================== */

(function () {
  'use strict';

  function getCurrentPage() {
    const path = window.location.pathname;
    return path.substring(path.lastIndexOf('/') + 1) || 'index.html';
  }

  function injectHeader() {
    const current = getCurrentPage();
    const mount = document.getElementById('tl-header-mount');
    if (!mount) return;

    const navItems = [
      { href: 'index.html', label: 'Tienda' },
      { href: 'catalogo.html', label: 'Colección' },
      { href: 'customizer.html', label: 'Print Studio ✦', studio: true },
      { href: 'perfil.html', label: 'Mi Cuenta' },
      { href: 'pedidos.html', label: 'Pedidos' }
    ];

    const navHtml = navItems.map((item) => {
      const isActive = current === item.href ? 'is-active' : '';
      const studioCls = item.studio ? 'tl-nav-link--studio' : '';
      return `<a href="${item.href}" class="tl-nav-link ${studioCls} ${isActive}">${item.label}</a>`;
    }).join('');

    mount.innerHTML = `
      <div class="tl-demo-bar">
        <span>💡 Demo WebToStudio: App Web Colorida (E-commerce, Customizer & Club VIP)</span>
        <a href="/index.html#proyectos">← Volver</a>
      </div>

      <header class="tl-header">
        <div class="tl-container tl-header-inner">
          <a href="index.html" class="tl-brand" aria-label="ThreadLab Inicio">
            <span class="tl-brand-mark">TL</span>
            <span>ThreadLab</span>
            <span class="tl-brand-sub">Print Studio</span>
          </a>

          <nav class="tl-nav" aria-label="Navegación Principal">
            ${navHtml}
          </nav>

          <div class="tl-search-wrap">
            <input
              type="search"
              id="tl-global-search"
              class="tl-search-input"
              placeholder="Buscar ropa, sudadera, cargo..."
              autocomplete="off"
              aria-label="Buscador instantáneo de prendas"
            />
            <span class="tl-search-icon">⌕</span>
            <div id="tl-search-results" class="tl-search-results" role="listbox"></div>
          </div>

          <div class="tl-header-actions">
            <button type="button" id="tl-header-vip-btn" class="tl-icon-btn tl-vip-pill" title="Iniciar sesión o ver Cuenta VIP">
              <span id="tl-header-vip-icon">👤</span>
              <span id="tl-header-vip-desktop" class="tl-vip-text-desktop">Entrar</span>
              <span id="tl-header-vip-mobile" class="tl-vip-text-mobile"></span>
            </button>

            <a href="perfil.html#deseados" class="tl-icon-btn" title="Lista de Deseados" aria-label="Lista de Deseados">
              <span>♥</span>
              <span id="tl-header-wish-count" class="tl-badge-count">0</span>
            </a>

            <button type="button" id="tl-header-cart-btn" class="tl-icon-btn" title="Abrir Carrito" aria-label="Abrir Carrito">
              <span>🛍️</span>
              <span id="tl-header-cart-count" class="tl-badge-count">0</span>
            </button>

            <button type="button" id="tl-mobile-menu-btn" class="tl-icon-btn tl-mobile-toggle" aria-label="Abrir Menú">
              ☰
            </button>
          </div>
        </div>

        <div id="tl-mobile-drawer" class="tl-mobile-drawer">
          <form id="tl-mobile-search-form" style="display:flex; gap:0.45rem;">
            <input
              type="search"
              id="tl-mobile-search-input"
              class="tl-search-input"
              style="border-radius:10px; padding-right:0.85rem;"
              placeholder="Buscar camisetas, sudaderas, cargo..."
            />
            <button type="submit" class="tl-btn tl-btn--sm tl-btn--dark">Buscar</button>
          </form>
          ${navHtml}
          <button type="button" class="tl-btn tl-btn--sm tl-btn--acid" data-open-fit-finder>
            📏 Guía de Tallas (Fit Finder)
          </button>
        </div>
      </header>
    `;
  }

  function injectFooter() {
    const mount = document.getElementById('tl-footer-mount');
    if (!mount) return;

    mount.innerHTML = `
      <footer class="tl-footer">
        <div class="tl-container">
          <div class="tl-footer-grid">
            <div>
              <div class="tl-brand" style="margin-bottom:0.85rem;">
                <span class="tl-brand-mark" style="color:#18181B;">TL</span>
                <span>ThreadLab — Streetwear &amp; Print Studio</span>
              </div>
              <p style="font-size:0.86rem; color:#D4D4D8; max-width:36ch;">
                Tienda streetwear y taller de estampación independiente. Camisetas heavyweight, sudaderas, chaquetas y pantalones cargo.
              </p>
            </div>

            <div>
              <h4>Colección</h4>
              <ul>
                <li><a href="catalogo.html?type=Camisetas">Camisetas Heavyweight</a></li>
                <li><a href="catalogo.html?type=Sudaderas">Sudaderas &amp; Hoodies</a></li>
                <li><a href="catalogo.html?type=Chaquetas">Chaquetas Urbanas</a></li>
                <li><a href="catalogo.html?type=Pantalones">Pantalones Cargo</a></li>
                <li><a href="customizer.html">Print Studio (Personalizar)</a></li>
              </ul>
            </div>

            <div>
              <h4>Mi Cuenta VIP</h4>
              <ul>
                <li><a href="perfil.html">Acceso Club VIP (-15%)</a></li>
                <li><a href="perfil.html#deseados">Lista de Deseados</a></li>
                <li><a href="perfil.html">Rasca y Gana VIP</a></li>
                <li><a href="pedidos.html">Seguimiento de Pedidos</a></li>
              </ul>
            </div>

            <div>
              <h4>Envíos &amp; Estudio</h4>
              <ul>
                <li>Envío gratis desde 65,00 €</li>
                <li>Producción Print Studio en 48h</li>
                <li>Cambios de talla sin coste</li>
                <li>Madrid · Barcelona · Lisboa</li>
              </ul>
            </div>
          </div>

          <div class="tl-footer-bottom">
            <span>© 2026 ThreadLab Studio. Arquitectura Modular WebToStudio.</span>
            <span>Algodón 100% Peinado · Tintas Eco-Plastisol</span>
          </div>
        </div>
      </footer>

      <div id="tl-fit-modal" class="tl-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="tl-fit-title">
        <div class="tl-modal">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.85rem;">
            <span class="tl-tag tl-tag--acid">📏 Fit Finder</span>
            <button type="button" id="tl-fit-close" class="tl-icon-btn" style="height:32px; width:32px; padding:0;">✕</button>
          </div>
          <h3 id="tl-fit-title" style="font-family:var(--font-display); font-size:1.45rem; margin-bottom:0.35rem;">
            Encuentra tu talla exacta
          </h3>
          <p style="font-size:0.86rem; color:var(--ink-secondary); margin-bottom:1rem;">
            Indica tus medidas y el corte que prefieres para recomendarte tu talla ideal con stock real.
          </p>

          <form id="tl-fit-form" style="display:flex; flex-direction:column; gap:0.8rem;">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
              <label style="font-size:0.8rem; font-weight:700;">
                Altura (cm)
                <input type="number" id="tl-fit-height" min="145" max="215" value="178" class="tl-select" style="margin-top:0.25rem;" required />
              </label>
              <label style="font-size:0.8rem; font-weight:700;">
                Peso (kg)
                <input type="number" id="tl-fit-weight" min="40" max="150" value="74" class="tl-select" style="margin-top:0.25rem;" required />
              </label>
            </div>

            <label style="font-size:0.8rem; font-weight:700;">
              Corte deseado
              <select id="tl-fit-style" class="tl-select" style="margin-top:0.25rem;">
                <option value="Oversize">Oversize (Amplio)</option>
                <option value="Boxy Fit">Boxy Fit (Ancho y corto)</option>
                <option value="Relaxed">Relaxed Fit</option>
              </select>
            </label>

            <button type="submit" class="tl-btn tl-btn--primary" style="width:100%;">
              Calcular mi Talla Ideal
            </button>
          </form>

          <div id="tl-fit-result" style="display:none; margin-top:1rem; padding:0.9rem; background:var(--bg-subtle); border:2px solid var(--border-color); border-radius:var(--radius-md);"></div>
        </div>
      </div>

      <div id="tl-toast-stack" class="tl-toast-stack" aria-live="polite"></div>
    `;
  }

  function bindHeaderInteractions() {
    const mobileBtn = document.getElementById('tl-mobile-menu-btn');
    const mobileDrawer = document.getElementById('tl-mobile-drawer');
    if (mobileBtn && mobileDrawer) {
      mobileBtn.addEventListener('click', () => {
        mobileDrawer.classList.toggle('is-open');
      });
    }

    const mobileSearchForm = document.getElementById('tl-mobile-search-form');
    if (mobileSearchForm) {
      mobileSearchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const val = document.getElementById('tl-mobile-search-input')?.value.trim();
        if (val) {
          window.location.href = `catalogo.html?search=${encodeURIComponent(val)}`;
        }
      });
    }

    const vipBtn = document.getElementById('tl-header-vip-btn');
    if (vipBtn) {
      vipBtn.addEventListener('click', () => {
        if (window.WTS && window.WTS.UserClub) {
          if (window.WTS.UserClub.isVip()) {
            window.location.href = 'perfil.html';
          } else {
            window.WTS.UserClub.openLoginModal();
          }
        } else {
          window.location.href = 'perfil.html';
        }
      });
    }

    const cartBtn = document.getElementById('tl-header-cart-btn');
    if (cartBtn) {
      cartBtn.addEventListener('click', () => {
        if (window.WTS && window.WTS.ShopCart) {
          window.WTS.ShopCart.open();
        }
      });
    }

    const searchInput = document.getElementById('tl-global-search');
    const searchResults = document.getElementById('tl-search-results');

    if (searchInput && searchResults) {
      searchInput.addEventListener('input', (e) => {
        const q = e.target.value.trim().toLowerCase();
        if (!q || !window.ThreadLabApp) {
          searchResults.classList.remove('is-open');
          searchResults.innerHTML = '';
          return;
        }

        const isVip = window.WTS && window.WTS.UserClub && window.WTS.UserClub.isVip();
        const catalog = window.ThreadLabApp.getCatalog().filter((p) => !p.vipOnly || isVip);
        const matches = catalog.filter((p) =>
          p.name.toLowerCase().includes(q) ||
          p.type.toLowerCase().includes(q) ||
          p.fit.toLowerCase().includes(q) ||
          p.colorName.toLowerCase().includes(q)
        ).slice(0, 5);

        if (matches.length === 0) {
          searchResults.innerHTML = `<div style="padding:0.85rem; font-size:0.82rem; font-weight:600; color:var(--ink-secondary);">Sin resultados para "${e.target.value}"</div>`;
        } else {
          searchResults.innerHTML = matches.map((item) => {
            const finalPrice = window.ThreadLabApp.getEffectivePrice(item.price);
            return `
              <a href="catalogo.html?search=${encodeURIComponent(item.name)}" class="tl-search-item">
                <img src="${item.imageFront}" alt="${item.name}" loading="lazy" />
                <div style="flex:1; min-width:0;">
                  <div style="font-weight:800; font-size:0.84rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.name}</div>
                  <div style="font-size:0.74rem; color:var(--ink-secondary);">${item.type} · ${item.fit} · ${window.ThreadLabApp.formatPrice(finalPrice)}</div>
                </div>
              </a>
            `;
          }).join('');
        }
        searchResults.classList.add('is-open');
      });

      document.addEventListener('click', (e) => {
        if (!e.target.closest('.tl-search-wrap')) {
          searchResults.classList.remove('is-open');
        }
      });
    }

    const fitModal = document.getElementById('tl-fit-modal');
    const fitClose = document.getElementById('tl-fit-close');
    const fitForm = document.getElementById('tl-fit-form');
    const fitResult = document.getElementById('tl-fit-result');

    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-open-fit-finder]')) {
        e.preventDefault();
        if (fitModal) fitModal.classList.add('is-open');
      }
    });

    if (fitClose && fitModal) {
      fitClose.addEventListener('click', () => fitModal.classList.remove('is-open'));
      fitModal.addEventListener('click', (e) => {
        if (e.target === fitModal) fitModal.classList.remove('is-open');
      });
    }

    if (fitForm && fitResult) {
      fitForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const h = Number(document.getElementById('tl-fit-height').value);
        const w = Number(document.getElementById('tl-fit-weight').value);
        const style = document.getElementById('tl-fit-style').value;

        let size = 'M';
        if (h < 168 && w < 64) size = 'S';
        else if (h <= 178 && w <= 78) size = 'M';
        else if (h <= 187 && w <= 92) size = 'L';
        else size = 'XL';

        if (style === 'Oversize' && size === 'XL') size = 'L';

        fitResult.style.display = 'block';
        fitResult.innerHTML = `
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.5rem;">
            <span style="font-size:0.82rem; font-weight:700;">Tu talla recomendada:</span>
            <span class="tl-tag tl-tag--yellow" style="font-size:0.95rem;">TALLA ${size}</span>
          </div>
          <p style="font-size:0.8rem; color:var(--ink-secondary); margin-bottom:0.75rem;">
            Corte <strong>${style}</strong> con caída estructurada.
          </p>
          <a href="catalogo.html?size=${size}&fit=${encodeURIComponent(style)}" class="tl-btn tl-btn--sm tl-btn--dark" style="width:100%;">
            Ver prendas talla ${size} con stock →
          </a>
        `;
      });
    }
  }

  function syncHeaderBadges() {
    const vipBtn = document.getElementById('tl-header-vip-btn');
    const vipDesktop = document.getElementById('tl-header-vip-desktop');
    const vipMobile = document.getElementById('tl-header-vip-mobile');
    const vipIcon = document.getElementById('tl-header-vip-icon');

    if (vipBtn && vipDesktop && vipMobile && window.WTS && window.WTS.UserClub) {
      const user = window.WTS.UserClub.getUser();
      if (user) {
        vipBtn.classList.add('is-vip');
        vipIcon.textContent = '★';
        vipDesktop.textContent = `${user.name.split(' ')[0]} · -15%`;
        vipMobile.textContent = '-15%';
      } else {
        vipBtn.classList.remove('is-vip');
        vipIcon.textContent = '👤';
        vipDesktop.textContent = 'Entrar';
        vipMobile.textContent = '';
      }
    }

    const wishBadge = document.getElementById('tl-header-wish-count');
    if (wishBadge && window.WTS && window.WTS.Wishlist) {
      const count = window.WTS.Wishlist.getItems().length;
      wishBadge.textContent = count;
      wishBadge.classList.remove('is-bump');
      void wishBadge.offsetWidth;
      wishBadge.classList.add('is-bump');
    }

    const cartBadge = document.getElementById('tl-header-cart-count');
    if (cartBadge && window.WTS && window.WTS.ShopCart) {
      const count = window.WTS.ShopCart.getCount();
      cartBadge.textContent = count;
      cartBadge.classList.remove('is-bump');
      void cartBadge.offsetWidth;
      cartBadge.classList.add('is-bump');
    }
  }

  function showToast(message, type = 'info') {
    const stack = document.getElementById('tl-toast-stack');
    if (!stack) return;
    const toast = document.createElement('div');
    toast.className = `tl-toast tl-toast--${type}`;
    toast.textContent = message;
    stack.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.2s ease';
      setTimeout(() => toast.remove(), 220);
    }, 2800);
  }

  document.addEventListener('DOMContentLoaded', () => {
    injectHeader();
    injectFooter();
    bindHeaderInteractions();
    syncHeaderBadges();
  });

  document.addEventListener('wts:ready', syncHeaderBadges);
  document.addEventListener('wts:user-changed', syncHeaderBadges);
  document.addEventListener('wts:load', syncHeaderBadges);
  document.addEventListener('wts:wishlist-changed', syncHeaderBadges);
  document.addEventListener('wts:cart-changed', syncHeaderBadges);
  document.addEventListener('wts:toast', (e) => {
    if (e.detail && e.detail.message) {
      showToast(e.detail.message, e.detail.type || 'info');
    }
  });
})();
