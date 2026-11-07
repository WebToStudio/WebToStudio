/* ==========================================================================
   MÓDULO AGNÓSTICO: LISTA DE DESEADOS (wts-wishlist.js)
   Sincroniza corazones en todas las páginas, persiste en localStorage y
   permite mover artículos guardados directamente al carrito.
   ========================================================================== */

(function () {
  'use strict';

  const DEFAULT_CONFIG = {
    storageKey: 'wts_wishlist',
    catalogProvider: () => [],
    getEffectivePrice: (price) => price,
    formatPrice: (price) => `${Number(price).toFixed(2)} €`,
    onMoveToCart: () => {}
  };

  let config = { ...DEFAULT_CONFIG };

  function getItems() {
    try {
      const raw = localStorage.getItem(config.storageKey);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (_) {
      return [];
    }
  }

  function saveItems(list) {
    localStorage.setItem(config.storageKey, JSON.stringify(list));
    syncAllButtons();
    document.dispatchEvent(new CustomEvent('wts:wishlist-changed', { detail: { items: list } }));
  }

  function has(productId) {
    return getItems().includes(productId);
  }

  function toggle(productId) {
    const list = getItems();
    const idx = list.indexOf(productId);
    let added = false;

    if (idx === -1) {
      list.push(productId);
      added = true;
    } else {
      list.splice(idx, 1);
    }

    saveItems(list);

    document.dispatchEvent(new CustomEvent('wts:toast', {
      detail: {
        message: added ? '♥ Guardado en tu Lista de Deseados' : 'Eliminado de Deseados',
        type: added ? 'success' : 'info'
      }
    }));

    return added;
  }

  function syncAllButtons() {
    const items = getItems();
    document.querySelectorAll('.wts-wish-btn[data-product-id]').forEach((btn) => {
      const active = items.includes(btn.dataset.productId);
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
  }

  function renderWishlistView(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const savedIds = getItems();
    const catalog = config.catalogProvider();
    const products = savedIds
      .map((id) => catalog.find((p) => p.id === id))
      .filter(Boolean);

    if (products.length === 0) {
      container.innerHTML = `
        <div class="wts-wish-empty">
          <div style="font-size:2.2rem; margin-bottom:0.5rem;">♡</div>
          <h3 style="font-family:var(--font-display); font-size:1.3rem; margin-bottom:0.35rem;">
            Tu Lista de Deseados está vacía
          </h3>
          <p style="font-size:0.88rem; color:var(--ink-secondary); margin-bottom:1.1rem;">
            Pulsa el corazón en cualquier camiseta del catálogo para guardarla aquí.
          </p>
          <a href="catalogo.html" class="tl-btn tl-btn--sm tl-btn--primary">Explorar Catálogo →</a>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="wts-wish-grid">
        ${products.map((p) => {
          const finalPrice = config.getEffectivePrice(p.price);
          const availableSizes = ['S', 'M', 'L', 'XL'].filter((s) => (p.stock?.[s] || 0) > 0);
          return `
            <article class="wts-wish-card">
              <div class="wts-wish-card-img">
                <img src="${p.imageFront}" alt="${p.name}" loading="lazy" />
                <button type="button" class="wts-wish-remove" data-wish-remove="${p.id}" title="Quitar de Deseados">✕</button>
              </div>
              <div class="wts-wish-body">
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.75rem; font-weight:700; color:var(--ink-secondary);">
                  <span>${p.fit}</span>
                  <span>${p.colorName}</span>
                </div>
                <h4 style="font-family:var(--font-display); font-size:1.05rem;">${p.name}</h4>
                <div style="font-family:var(--font-display); font-weight:800; font-size:1.15rem;">
                  ${config.formatPrice(finalPrice)}
                </div>

                <div style="display:flex; gap:0.45rem; margin-top:auto;">
                  <select class="tl-select" data-wish-size="${p.id}" style="width:82px; height:36px;">
                    ${availableSizes.length > 0
                      ? availableSizes.map((s) => `<option value="${s}">${s}</option>`).join('')
                      : '<option value="M" disabled>Sin stock</option>'
                    }
                  </select>
                  <button
                    type="button"
                    class="tl-btn tl-btn--sm tl-btn--acid"
                    style="flex:1;"
                    data-wish-to-cart="${p.id}"
                    ${availableSizes.length === 0 ? 'disabled' : ''}
                  >
                    + Al Carrito
                  </button>
                </div>
              </div>
            </article>
          `;
        }).join('')}
      </div>
    `;

    container.querySelectorAll('[data-wish-remove]').forEach((btn) => {
      btn.addEventListener('click', () => {
        toggle(btn.dataset.wishRemove);
        renderWishlistView(containerId);
      });
    });

    container.querySelectorAll('[data-wish-to-cart]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const pid = btn.dataset.wishToCart;
        const select = container.querySelector(`[data-wish-size="${pid}"]`);
        const size = select ? select.value : 'M';
        config.onMoveToCart(pid, size);
      });
    });
  }

  function bindGlobalClicks() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.wts-wish-btn[data-product-id]');
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      toggle(btn.dataset.productId);
    });
  }

  function init(userConfig = {}) {
    config = { ...DEFAULT_CONFIG, ...userConfig };
    bindGlobalClicks();
    syncAllButtons();
  }

  window.WTS = window.WTS || {};
  window.WTS.Wishlist = {
    init,
    getItems,
    has,
    toggle,
    syncAllButtons,
    renderWishlistView
  };
})();
