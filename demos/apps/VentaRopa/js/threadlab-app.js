/* ==========================================================================
   THREADLAB — APPLICATION CONTROLLER (js/threadlab-app.js)
   Catálogo completo de tienda streetwear (Camisetas, Sudaderas, Chaquetas,
   Pantalones Cargo y Accesorios), control de inventario y conexión de módulos.
   ========================================================================== */

(function () {
  'use strict';

  const STOCK_STORAGE_KEY = 'threadlab_live_stock_v2';

  const BASE_CATALOG = [
    /* CAMISETAS */
    {
      id: 'tl-001',
      name: 'Cyber Acid Backprint Tee',
      type: 'Camisetas',
      fit: 'Oversize',
      colorName: 'Negro Lavado',
      colorHex: '#18181B',
      gsm: '260 GSM',
      price: 38.00,
      vipOnly: false,
      featured: true,
      badge: 'TOP VENTAS',
      badgeColor: 'yellow',
      imageFront: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=700&q=80',
      imageBack: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=700&q=80',
      stock: { S: 4, M: 7, L: 5, XL: 2 }
    },
    {
      id: 'tl-002',
      name: 'Brutalist Grid Boxy Tee',
      type: 'Camisetas',
      fit: 'Boxy Fit',
      colorName: 'Blanco Tiza',
      colorHex: '#FAFAFA',
      gsm: '280 GSM',
      price: 42.00,
      vipOnly: false,
      featured: true,
      badge: 'NUEVO',
      badgeColor: 'blue',
      imageFront: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80',
      imageBack: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=700&q=80',
      stock: { S: 6, M: 3, L: 8, XL: 4 }
    },
    {
      id: 'tl-003',
      name: 'Tokyo Risograph Collab 04',
      type: 'Camisetas',
      fit: 'Oversize',
      colorName: 'Azul Eléctrico',
      colorHex: '#3B82F6',
      gsm: '260 GSM',
      price: 45.00,
      vipOnly: false,
      featured: true,
      badge: 'ARTISTA',
      badgeColor: 'coral',
      imageFront: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=700&q=80',
      imageBack: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=700&q=80',
      stock: { S: 2, M: 5, L: 4, XL: 1 }
    },
    {
      id: 'tl-004',
      name: 'Heavy Blank Studio Essential',
      type: 'Camisetas',
      fit: 'Boxy Fit',
      colorName: 'Arena Crudo',
      colorHex: '#E7E5E4',
      gsm: '300 GSM',
      price: 34.00,
      vipOnly: false,
      featured: false,
      badge: '300 GSM',
      badgeColor: 'acid',
      imageFront: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=700&q=80',
      imageBack: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=700&q=80',
      stock: { S: 9, M: 10, L: 6, XL: 5 }
    },
    {
      id: 'tl-005',
      name: 'Kinetic Soundwave Puff Tee',
      type: 'Camisetas',
      fit: 'Oversize',
      colorName: 'Coral Neón',
      colorHex: '#F43F5E',
      gsm: '260 GSM',
      price: 39.00,
      vipOnly: false,
      featured: false,
      badge: 'RELIEVE 3D',
      badgeColor: 'yellow',
      imageFront: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&w=700&q=80',
      imageBack: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=700&q=80',
      stock: { S: 3, M: 4, L: 2, XL: 3 }
    },
    {
      id: 'tl-006',
      name: 'Acid Smiley Distressed Tee',
      type: 'Camisetas',
      fit: 'Oversize',
      colorName: 'Verde Ácido',
      colorHex: '#10B981',
      gsm: '260 GSM',
      price: 39.00,
      vipOnly: false,
      featured: false,
      badge: 'ACID WASH',
      badgeColor: 'acid',
      imageFront: 'https://images.unsplash.com/photo-1527719327859-c6ce80353573?auto=format&fit=crop&w=700&q=80',
      imageBack: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80',
      stock: { S: 5, M: 6, L: 4, XL: 2 }
    },

    /* SUDADERAS / HOODIES */
    {
      id: 'tl-007',
      name: 'Heavyweight Studio Hoodie 480G',
      type: 'Sudaderas',
      fit: 'Oversize',
      colorName: 'Negro Lavado',
      colorHex: '#18181B',
      gsm: '480 GSM',
      price: 68.00,
      vipOnly: false,
      featured: true,
      badge: 'BESTSELLER',
      badgeColor: 'yellow',
      imageFront: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=700&q=80',
      imageBack: 'https://images.unsplash.com/photo-1509942774463-acf339cf87d5?auto=format&fit=crop&w=700&q=80',
      stock: { S: 3, M: 6, L: 5, XL: 3 }
    },
    {
      id: 'tl-008',
      name: 'Concrete Boxy Crewneck',
      type: 'Sudaderas',
      fit: 'Boxy Fit',
      colorName: 'Gris Hormigón',
      colorHex: '#71717A',
      gsm: '450 GSM',
      price: 62.00,
      vipOnly: false,
      featured: true,
      badge: '450 GSM',
      badgeColor: 'dark',
      imageFront: 'https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?auto=format&fit=crop&w=700&q=80',
      imageBack: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=700&q=80',
      stock: { S: 4, M: 5, L: 6, XL: 2 }
    },
    {
      id: 'tl-009',
      name: 'Volt Zip-Up Print Hoodie',
      type: 'Sudaderas',
      fit: 'Oversize',
      colorName: 'Amarillo Solar',
      colorHex: '#FACC15',
      gsm: '460 GSM',
      price: 72.00,
      vipOnly: false,
      featured: false,
      badge: 'DROP 07',
      badgeColor: 'yellow',
      imageFront: 'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?auto=format&fit=crop&w=700&q=80',
      imageBack: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=700&q=80',
      stock: { S: 2, M: 4, L: 3, XL: 1 }
    },

    /* CHAQUETAS */
    {
      id: 'tl-010',
      name: 'Workwear Canvas Chore Jacket',
      type: 'Chaquetas',
      fit: 'Boxy Fit',
      colorName: 'Arena Crudo',
      colorHex: '#E7E5E4',
      gsm: 'Canvas 12oz',
      price: 89.00,
      vipOnly: false,
      featured: true,
      badge: 'WORKWEAR',
      badgeColor: 'blue',
      imageFront: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=700&q=80',
      imageBack: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=700&q=80',
      stock: { S: 2, M: 4, L: 4, XL: 2 }
    },
    {
      id: 'tl-011',
      name: 'Nylon Tech Coach Jacket',
      type: 'Chaquetas',
      fit: 'Relaxed',
      colorName: 'Negro Lavado',
      colorHex: '#18181B',
      gsm: 'Ripstop',
      price: 84.00,
      vipOnly: false,
      featured: false,
      badge: 'REPELENTE AGUA',
      badgeColor: 'acid',
      imageFront: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=700&q=80',
      imageBack: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=700&q=80',
      stock: { S: 3, M: 5, L: 3, XL: 2 }
    },

    /* PANTALONES CARGO */
    {
      id: 'tl-012',
      name: 'Parachute Ripstop Cargo Pants',
      type: 'Pantalones',
      fit: 'Relaxed',
      colorName: 'Verde Ácido',
      colorHex: '#10B981',
      gsm: 'Ripstop 290G',
      price: 74.00,
      vipOnly: false,
      featured: true,
      badge: 'CARGO FIT',
      badgeColor: 'acid',
      imageFront: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=700&q=80',
      imageBack: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=700&q=80',
      stock: { S: 4, M: 6, L: 5, XL: 2 }
    },
    {
      id: 'tl-013',
      name: 'Double-Knee Carpenter Denim',
      type: 'Pantalones',
      fit: 'Relaxed',
      colorName: 'Azul Eléctrico',
      colorHex: '#3B82F6',
      gsm: 'Denim 14oz',
      price: 79.00,
      vipOnly: false,
      featured: false,
      badge: '14 OZ DENIM',
      badgeColor: 'blue',
      imageFront: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=700&q=80',
      imageBack: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=700&q=80',
      stock: { S: 3, M: 4, L: 4, XL: 1 }
    },

    /* ACCESORIOS */
    {
      id: 'tl-014',
      name: 'Studio 6-Panel Embroidered Cap',
      type: 'Accesorios',
      fit: 'Regular',
      colorName: 'Negro Lavado',
      colorHex: '#18181B',
      gsm: 'Twill 100%',
      price: 26.00,
      vipOnly: false,
      featured: true,
      badge: 'TALLA ÚNICA',
      badgeColor: 'yellow',
      imageFront: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=700&q=80',
      imageBack: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=700&q=80',
      stock: { S: 8, M: 10, L: 10, XL: 8 }
    },

    /* EXCLUSIVOS SOLO MIEMBROS VIP */
    {
      id: 'tl-015',
      name: 'Kaos Lab — Secret Vault Tee #01',
      type: 'Camisetas',
      fit: 'Oversize',
      colorName: 'Negro Lavado',
      colorHex: '#18181B',
      gsm: '290 GSM',
      price: 52.00,
      vipOnly: true,
      featured: false,
      badge: 'SOLO MIEMBROS',
      badgeColor: 'acid',
      imageFront: 'https://images.unsplash.com/photo-1622445275576-721325763afe?auto=format&fit=crop&w=700&q=80',
      imageBack: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=700&q=80',
      stock: { S: 2, M: 3, L: 3, XL: 1 }
    },
    {
      id: 'tl-016',
      name: 'Midnight Lab Prototype Hoodie',
      type: 'Sudaderas',
      fit: 'Boxy Fit',
      colorName: 'Azul Eléctrico',
      colorHex: '#3B82F6',
      gsm: '500 GSM',
      price: 85.00,
      vipOnly: true,
      featured: false,
      badge: 'SOLO MIEMBROS',
      badgeColor: 'acid',
      imageFront: 'https://images.unsplash.com/photo-1509942774463-acf339cf87d5?auto=format&fit=crop&w=700&q=80',
      imageBack: 'https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?auto=format&fit=crop&w=700&q=80',
      stock: { S: 1, M: 2, L: 3, XL: 2 }
    }
  ];

  function loadStockMap() {
    try {
      const saved = JSON.parse(localStorage.getItem(STOCK_STORAGE_KEY));
      if (saved && typeof saved === 'object') return saved;
    } catch (_) {}
    const initial = {};
    BASE_CATALOG.forEach((p) => {
      initial[p.id] = { ...p.stock };
    });
    localStorage.setItem(STOCK_STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }

  function saveStockMap(stockMap) {
    localStorage.setItem(STOCK_STORAGE_KEY, JSON.stringify(stockMap));
    document.dispatchEvent(new CustomEvent('wts:stock-changed', { detail: { stockMap } }));
  }

  function getCatalog() {
    const stockMap = loadStockMap();
    return BASE_CATALOG.map((item) => ({
      ...item,
      stock: stockMap[item.id] ? { ...stockMap[item.id] } : { ...item.stock }
    }));
  }

  function getProductById(id) {
    return getCatalog().find((p) => p.id === id) || null;
  }

  function getAvailableStock(productId, size) {
    const product = getProductById(productId);
    if (!product || !product.stock) return 0;
    return Number(product.stock[size] || 0);
  }

  function deductStock(purchasedItems) {
    const stockMap = loadStockMap();
    purchasedItems.forEach((line) => {
      if (!line.isCustom && stockMap[line.productId] && typeof stockMap[line.productId][line.size] === 'number') {
        stockMap[line.productId][line.size] = Math.max(0, stockMap[line.productId][line.size] - line.qty);
      }
    });
    saveStockMap(stockMap);
  }

  function formatPrice(amount) {
    return Number(amount).toFixed(2).replace('.', ',') + ' €';
  }

  function getVipRate() {
    if (window.WTS && window.WTS.UserClub) {
      return window.WTS.UserClub.getDiscountRate();
    }
    return 0;
  }

  function getEffectivePrice(basePrice) {
    const rate = getVipRate();
    return Number((basePrice * (1 - rate)).toFixed(2));
  }

  function renderProductCard(product) {
    const isVip = getVipRate() > 0;
    const finalPrice = getEffectivePrice(product.price);
    const sizes = ['S', 'M', 'L', 'XL'];
    const defaultSize = sizes.find((s) => (product.stock[s] || 0) > 0) || 'M';
    const totalStock = sizes.reduce((acc, s) => acc + (product.stock[s] || 0), 0);

    const isWished = window.WTS && window.WTS.Wishlist ? window.WTS.Wishlist.has(product.id) : false;

    const sizeButtonsHtml = sizes.map((sz) => {
      const qty = product.stock[sz] || 0;
      const selected = sz === defaultSize && qty > 0 ? 'is-selected' : '';
      return `
        <button
          type="button"
          class="tl-size-pill ${selected}"
          data-size="${sz}"
          ${qty <= 0 ? 'disabled title="Agotado"' : `title="${qty} uds disponibles"`}
        >${sz}</button>
      `;
    }).join('');

    return `
      <article class="tl-card" data-product-card="${product.id}" data-selected-size="${defaultSize}">
        <div class="tl-card-media">
          <div class="tl-card-badges">
            <span class="tl-tag tl-tag--${product.badgeColor}">${product.badge}</span>
            <span class="tl-tag">${product.type} · ${product.fit}</span>
          </div>

          <button
            type="button"
            class="wts-wish-btn ${isWished ? 'is-active' : ''}"
            data-product-id="${product.id}"
            aria-label="Guardar ${product.name} en Deseados"
            aria-pressed="${isWished}"
            title="Guardar en Deseados"
          >♥</button>

          <img class="tl-card-img-front" src="${product.imageFront}" alt="${product.name} vista frontal" loading="lazy" />
          <img class="tl-card-img-back" src="${product.imageBack}" alt="${product.name} vista trasera" loading="lazy" />

          <button type="button" class="tl-card-flip-btn" data-flip-card>↻ Frente / Espalda</button>
        </div>

        <div class="tl-card-body">
          <div class="tl-card-meta">
            <span>${product.colorName} · ${product.gsm}</span>
            <span>${totalStock > 0 ? `${totalStock} disp.` : 'Agotado'}</span>
          </div>

          <h3 class="tl-card-title">${product.name}</h3>

          <div class="tl-card-price-row">
            <span class="tl-price-now">${formatPrice(finalPrice)}</span>
            ${isVip ? `<span class="tl-price-old">${formatPrice(product.price)}</span><span class="tl-tag tl-tag--acid">-15% VIP</span>` : ''}
          </div>

          <div>
            <div style="font-size:0.72rem; font-weight:700; color:var(--ink-secondary); margin-bottom:0.35rem;">
              Selecciona talla:
            </div>
            <div class="tl-size-pills">${sizeButtonsHtml}</div>
          </div>

          <div class="tl-card-actions">
            <button
              type="button"
              class="tl-btn tl-btn--sm tl-btn--primary"
              style="width:100%;"
              data-quick-add="${product.id}"
              ${totalStock <= 0 ? 'disabled' : ''}
            >
              ${totalStock > 0 ? '+ Añadir al Carrito' : 'Sin Stock'}
            </button>
          </div>
        </div>
      </article>
    `;
  }

  function bindGlobalCardDelegation() {
    document.addEventListener('click', (e) => {
      const flipBtn = e.target.closest('[data-flip-card]');
      if (flipBtn) {
        const card = flipBtn.closest('[data-product-card]');
        if (card) card.classList.toggle('is-flipped');
        return;
      }

      const sizeBtn = e.target.closest('.tl-size-pill');
      if (sizeBtn && !sizeBtn.disabled) {
        const card = sizeBtn.closest('[data-product-card]');
        if (!card) return;
        const size = sizeBtn.dataset.size;
        card.dataset.selectedSize = size;
        card.querySelectorAll('.tl-size-pill').forEach((b) => b.classList.remove('is-selected'));
        sizeBtn.classList.add('is-selected');
        return;
      }

      const addBtn = e.target.closest('[data-quick-add]');
      if (addBtn && !addBtn.disabled) {
        const card = addBtn.closest('[data-product-card]');
        const productId = addBtn.dataset.quickAdd;
        const size = card ? card.dataset.selectedSize : 'M';
        if (window.WTS && window.WTS.ShopCart) {
          window.WTS.ShopCart.addItem({ productId, size, qty: 1 });
        }
      }
    });
  }

  function initModules() {
    window.WTS = window.WTS || {};

    if (window.WTS.UserClub) {
      window.WTS.UserClub.init({
        storageKey: 'threadlab_vip_user_v1',
        couponStorageKey: 'threadlab_vip_coupon_v1',
        vipDiscountRate: 0.15,
        demoUser: {
          id: 'vip-alex-rivera',
          name: 'Alex Rivera',
          handle: '@alex.rivera',
          tier: 'Miembro Club VIP',
          avatar: 'AR',
          preferredFit: 'Oversize',
          preferredSize: 'L',
          points: 1450
        },
        secretCoupon: {
          code: 'STUDIO25',
          discount: 0.25,
          label: '25% DTO. EXTRA VIP'
        },
        catalogProvider: getCatalog
      });
    }

    if (window.WTS.Wishlist) {
      window.WTS.Wishlist.init({
        storageKey: 'threadlab_wishlist_v1',
        catalogProvider: getCatalog,
        getEffectivePrice: getEffectivePrice,
        formatPrice: formatPrice,
        onMoveToCart: (productId, size) => {
          if (window.WTS.ShopCart) {
            window.WTS.ShopCart.addItem({ productId, size, qty: 1 });
          }
        }
      });
    }

    if (window.WTS.ShopCart) {
      window.WTS.ShopCart.init({
        storageKey: 'threadlab_cart_v1',
        ordersStorageKey: 'threadlab_orders_v1',
        freeShippingThreshold: 65,
        shippingCost: 4.95,
        coupons: {
          'THREAD10': { discount: 0.10, label: '10% Bienvenida' },
          'STUDIO25': { discount: 0.25, label: '25% Rasca y Gana VIP' },
          'LAB15': { discount: 0.15, label: '15% Print Studio' }
        },
        catalogProvider: getCatalog,
        getAvailableStock: getAvailableStock,
        getDiscountRate: getVipRate,
        formatPrice: formatPrice,
        onStockDeduct: deductStock
      });
    }

    document.dispatchEvent(new CustomEvent('wts:ready'));
  }

  window.ThreadLabApp = {
    getCatalog,
    getProductById,
    getAvailableStock,
    deductStock,
    formatPrice,
    getVipRate,
    getEffectivePrice,
    renderProductCard
  };

  document.addEventListener('DOMContentLoaded', () => {
    bindGlobalCardDelegation();
    initModules();
  });
})();
