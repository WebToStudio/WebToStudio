/* ==========================================================================
   MÓDULO AGNÓSTICO: CARRITO LATERAL & CHECKOUT REALISTA POR PASOS (wts-shop-cart.js)
   Pasos:
   1. 'cart'   -> Bolsa de compra + botón "Seguir comprando" + "Finalizar Compra"
   2. 'details'-> Datos de envío y selección de tarjeta guardada (o "+ Añadir nueva tarjeta")
   3. 'verify' -> Pantalla de verificación bancaria de tarjeta + confirmación CVV
   4. 'done'   -> Compra completada sin contador residual y enlace directo al tracking
   ========================================================================== */

(function () {
  'use strict';

  const DEFAULT_CONFIG = {
    storageKey: 'wts_cart_items',
    ordersStorageKey: 'wts_orders_history',
    freeShippingThreshold: 65,
    shippingCost: 4.95,
    coupons: {},
    catalogProvider: () => [],
    getAvailableStock: () => 99,
    getDiscountRate: () => 0,
    formatPrice: (n) => `${Number(n).toFixed(2)} €`,
    onStockDeduct: () => {}
  };

  let config = { ...DEFAULT_CONFIG };
  let activeCouponCode = null;
  let lastOrderReceipt = null;
  let checkoutStep = 'cart'; // 'cart' | 'details' | 'verify' | 'done'
  let showAddCardInCheckout = false;
  let isVerifyingPayment = false;
  let pendingCheckoutPayload = null;

  function getCart() {
    try {
      const raw = localStorage.getItem(config.storageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  function saveCart(items) {
    localStorage.setItem(config.storageKey, JSON.stringify(items));
    renderDrawerContent();
    document.dispatchEvent(new CustomEvent('wts:cart-changed', { detail: { items } }));
  }

  function getCount() {
    return getCart().reduce((sum, item) => sum + item.qty, 0);
  }

  function getOrders() {
    try {
      const raw = localStorage.getItem(config.ordersStorageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  function saveOrder(order) {
    const orders = getOrders();
    orders.unshift(order);
    localStorage.setItem(config.ordersStorageKey, JSON.stringify(orders));
    document.dispatchEvent(new CustomEvent('wts:order-created', { detail: { order } }));
  }

  function addItem(payload) {
    const cart = getCart();
    lastOrderReceipt = null;
    checkoutStep = 'cart';

    if (payload.isCustom) {
      const customKey = `custom-${Date.now()}`;
      cart.push({
        key: customKey,
        productId: customKey,
        isCustom: true,
        name: payload.name || 'Camiseta Print Studio',
        size: payload.size || 'L',
        unitPrice: Number(payload.unitPrice || 45),
        qty: 1,
        customMeta: payload.customMeta || {}
      });
      saveCart(cart);
      open();
      document.dispatchEvent(new CustomEvent('wts:toast', {
        detail: { message: '✦ Creación añadida al carrito', type: 'success' }
      }));
      return true;
    }

    const catalog = config.catalogProvider();
    const product = catalog.find((p) => p.id === payload.productId);
    if (!product) return false;

    const size = payload.size || 'M';
    const maxStock = config.getAvailableStock(product.id, size);
    const key = `${product.id}__${size}`;
    const existing = cart.find((i) => i.key === key);
    const currentQty = existing ? existing.qty : 0;

    if (currentQty + (payload.qty || 1) > maxStock) {
      document.dispatchEvent(new CustomEvent('wts:toast', {
        detail: { message: `⚠️ Stock máximo alcanzado en talla ${size} (${maxStock} uds)`, type: 'info' }
      }));
      return false;
    }

    if (existing) {
      existing.qty += (payload.qty || 1);
    } else {
      cart.push({
        key,
        productId: product.id,
        isCustom: false,
        name: product.name,
        fit: product.fit,
        colorName: product.colorName,
        image: product.imageFront,
        size,
        unitPrice: product.price,
        qty: payload.qty || 1
      });
    }

    saveCart(cart);
    open();
    document.dispatchEvent(new CustomEvent('wts:toast', {
      detail: { message: `+ ${product.name} (${size}) añadido`, type: 'success' }
    }));
    return true;
  }

  function updateQty(key, delta) {
    const cart = getCart();
    const idx = cart.findIndex((i) => i.key === key);
    if (idx === -1) return;

    const item = cart[idx];
    const nextQty = item.qty + delta;

    if (nextQty <= 0) {
      cart.splice(idx, 1);
      saveCart(cart);
      return;
    }

    if (!item.isCustom) {
      const maxStock = config.getAvailableStock(item.productId, item.size);
      if (nextQty > maxStock) {
        document.dispatchEvent(new CustomEvent('wts:toast', {
          detail: { message: `Solo quedan ${maxStock} uds en talla ${item.size}`, type: 'info' }
        }));
        return;
      }
    }

    item.qty = nextQty;
    saveCart(cart);
  }

  function removeItem(key) {
    const cart = getCart().filter((i) => i.key !== key);
    saveCart(cart);
  }

  function applyCoupon(rawCode) {
    const code = (rawCode || '').trim().toUpperCase();
    if (!code || !config.coupons[code]) {
      document.dispatchEvent(new CustomEvent('wts:toast', {
        detail: { message: 'Cupón no válido. Prueba THREAD10 o STUDIO25', type: 'info' }
      }));
      return false;
    }
    activeCouponCode = code;
    renderDrawerContent();
    document.dispatchEvent(new CustomEvent('wts:toast', {
      detail: { message: `🎟️ Cupón ${code} (${config.coupons[code].label}) aplicado`, type: 'success' }
    }));
    return true;
  }

  function calculateTotals(cart) {
    const rawSubtotal = cart.reduce((acc, i) => acc + i.unitPrice * i.qty, 0);
    const vipRate = config.getDiscountRate();
    const vipDiscount = Number((rawSubtotal * vipRate).toFixed(2));
    const afterVip = rawSubtotal - vipDiscount;

    let couponDiscount = 0;
    if (activeCouponCode && config.coupons[activeCouponCode]) {
      couponDiscount = Number((afterVip * config.coupons[activeCouponCode].discount).toFixed(2));
    }

    const merchandiseTotal = Math.max(0, Number((afterVip - couponDiscount).toFixed(2)));
    const shipping = merchandiseTotal === 0 || merchandiseTotal >= config.freeShippingThreshold
      ? 0
      : config.shippingCost;
    const grandTotal = Number((merchandiseTotal + shipping).toFixed(2));

    return {
      rawSubtotal,
      vipRate,
      vipDiscount,
      couponDiscount,
      merchandiseTotal,
      shipping,
      grandTotal
    };
  }

  function finalizeVerifiedPurchase() {
    const cart = getCart();
    if (cart.length === 0) return;

    const totals = calculateTotals(cart);
    const trackingCode = 'TL-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);

    const order = {
      id: trackingCode,
      date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: 'En preparación en Print Studio',
      items: cart,
      totals,
      shippingTo: pendingCheckoutPayload?.shipping || null,
      paidWith: pendingCheckoutPayload?.card?.masked || 'Tarjeta verificada',
      couponUsed: activeCouponCode
    };

    config.onStockDeduct(cart);
    saveOrder(order);
    lastOrderReceipt = order;
    activeCouponCode = null;
    isVerifyingPayment = false;
    checkoutStep = 'done';
    localStorage.setItem(config.storageKey, JSON.stringify([]));
    renderDrawerContent();
    document.dispatchEvent(new CustomEvent('wts:cart-changed', { detail: { items: [] } }));
    document.dispatchEvent(new CustomEvent('wts:toast', {
      detail: { message: `🎉 Compra completada · Pedido ${trackingCode}`, type: 'success' }
    }));
  }

  function injectDrawerShell() {
    if (document.getElementById('wts-cart-drawer')) return;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div id="wts-cart-backdrop" class="wts-cart-backdrop"></div>
      <aside id="wts-cart-drawer" class="wts-cart-drawer" aria-label="Carrito de Compra" aria-hidden="true">
        <div class="wts-cart-header">
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <strong id="wts-drawer-title" style="font-family:var(--font-display); font-size:1.12rem;">Tu Bolsa Studio</strong>
            <span id="wts-drawer-count" class="tl-tag tl-tag--yellow" style="display:none;">0</span>
          </div>
          <button type="button" id="wts-cart-close" class="tl-icon-btn" style="height:34px; width:34px; padding:0;">✕</button>
        </div>
        <div id="wts-cart-dynamic" style="display:flex; flex-direction:column; flex:1; min-height:0;"></div>
      </aside>
    `;
    document.body.appendChild(wrapper);

    document.getElementById('wts-cart-backdrop').addEventListener('click', close);
    document.getElementById('wts-cart-close').addEventListener('click', close);
  }

  function escapeAttr(val) {
    return String(val || '').replace(/"/g, '&quot;');
  }

  function renderDrawerContent() {
    const mount = document.getElementById('wts-cart-dynamic');
    const countTag = document.getElementById('wts-drawer-count');
    const titleEl = document.getElementById('wts-drawer-title');
    if (!mount) return;

    const cart = getCart();
    const totalUnits = getCount();

    if (countTag) {
      if (checkoutStep === 'done' || totalUnits <= 0) {
        countTag.style.display = 'none';
      } else {
        countTag.style.display = 'inline-flex';
        countTag.textContent = totalUnits;
      }
    }

    /* ======================================================================
       PASO 4: COMPRA COMPLETADA
       ====================================================================== */
    if (checkoutStep === 'done' && lastOrderReceipt) {
      if (titleEl) titleEl.textContent = 'Compra Completada';
      const trackingUrl = `pedidos.html?track=${encodeURIComponent(lastOrderReceipt.id)}`;

      mount.innerHTML = `
        <div class="wts-cart-body" style="justify-content:center;">
          <div class="wts-receipt-card">
            <div style="font-size:2.4rem;">✅</div>
            <h3 style="font-family:var(--font-display); font-size:1.45rem; margin-top:0.35rem;">
              ¡Compra Completada!
            </h3>
            <p style="font-size:0.84rem; color:var(--ink-secondary); margin-top:0.3rem;">
              Pago verificado correctamente (${lastOrderReceipt.paidWith}). Tu código de seguimiento es:
            </p>
            <div class="wts-tracking-badge">${lastOrderReceipt.id}</div>
            <div style="font-size:0.84rem; font-weight:800; margin:0.5rem 0 1.15rem;">
              Importe pagado: ${config.formatPrice(lastOrderReceipt.totals.grandTotal)}
            </div>

            <div style="display:flex; flex-direction:column; gap:0.6rem;">
              <a href="${trackingUrl}" id="wts-locate-order-link" class="tl-btn tl-btn--acid" style="width:100%;">
                📦 Localizar tu pedido
              </a>
              <button type="button" id="wts-done-continue-btn" class="tl-btn tl-btn--dark" style="width:100%;">
                ← Seguir comprando
              </button>
            </div>
          </div>
        </div>
      `;

      document.getElementById('wts-locate-order-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = trackingUrl;
      });

      document.getElementById('wts-done-continue-btn')?.addEventListener('click', () => {
        lastOrderReceipt = null;
        checkoutStep = 'cart';
        close();
      });
      return;
    }

    if (cart.length === 0) {
      checkoutStep = 'cart';
      if (titleEl) titleEl.textContent = 'Tu Bolsa Studio';
      mount.innerHTML = `
        <div class="wts-shipping-bar-wrap">
          Envío GRATIS a partir de ${config.formatPrice(config.freeShippingThreshold)}
          <div class="wts-shipping-track"><div class="wts-shipping-fill" style="width:0%"></div></div>
        </div>
        <div class="wts-cart-body" style="justify-content:center; align-items:center; text-align:center;">
          <div style="font-size:2.5rem;">🛍️</div>
          <h4 style="font-family:var(--font-display); font-size:1.2rem;">Tu bolsa está vacía</h4>
          <p style="font-size:0.85rem; color:var(--ink-secondary); max-width:28ch;">
            Explora nuestras prendas heavyweight o diseña tu camiseta en el Print Studio.
          </p>
          <button type="button" id="wts-empty-continue-btn" class="tl-btn tl-btn--sm tl-btn--primary">
            ← Seguir comprando
          </button>
        </div>
      `;
      document.getElementById('wts-empty-continue-btn')?.addEventListener('click', close);
      return;
    }

    const totals = calculateTotals(cart);

    /* ======================================================================
       PASO 2: DATOS DE ENVÍO Y TARJETAS
       ====================================================================== */
    if (checkoutStep === 'details') {
      if (titleEl) titleEl.textContent = '1/2 · Envío y Pago';
      const user = window.WTS && window.WTS.UserClub ? window.WTS.UserClub.getUser() : null;
      const cards = user?.cards || [];
      const hasSavedCards = cards.length > 0;
      const showNewCardFields = !hasSavedCards || showAddCardInCheckout;

      mount.innerHTML = `
        <div class="wts-cart-body">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="tl-tag tl-tag--yellow">PASO 1 DE 2</span>
            <button type="button" id="wts-back-to-cart" style="font-size:0.8rem; font-weight:800; text-decoration:underline;">
              ← Volver a la bolsa
            </button>
          </div>

          <form id="wts-checkout-details-form" style="display:flex; flex-direction:column; gap:0.85rem;">
            <div style="background:#FFFFFF; border:2px solid #18181B; border-radius:12px; padding:0.9rem; display:flex; flex-direction:column; gap:0.65rem;">
              <strong style="font-family:var(--font-display); font-size:0.95rem;">📍 Datos de Envío</strong>

              <label class="wts-club-label">
                Nombre y Apellidos
                <input type="text" name="fullName" class="wts-club-input" value="${escapeAttr(user?.name || '')}" placeholder="Alex Rivera Gómez" required />
              </label>

              <label class="wts-club-label">
                Correo Electrónico
                <input type="email" name="email" class="wts-club-input" value="${escapeAttr(user?.email || '')}" placeholder="tu@email.com" required />
              </label>

              <label class="wts-club-label">
                Teléfono de Contacto
                <input type="tel" name="phone" class="wts-club-input" value="${escapeAttr(user?.phone || '')}" placeholder="+34 600 000 000" required />
              </label>

              <label class="wts-club-label">
                Dirección Completa
                <input type="text" name="address" class="wts-club-input" value="${escapeAttr(user?.address || '')}" placeholder="Calle, número, piso..." required />
              </label>

              <div style="display:grid; grid-template-columns:1.3fr 0.7fr; gap:0.55rem;">
                <label class="wts-club-label">
                  Ciudad
                  <input type="text" name="city" class="wts-club-input" value="${escapeAttr(user?.city || '')}" placeholder="Madrid" required />
                </label>
                <label class="wts-club-label">
                  C. Postal
                  <input type="text" name="postalCode" class="wts-club-input" value="${escapeAttr(user?.postalCode || '')}" placeholder="28004" required />
                </label>
              </div>
            </div>

            <div style="background:#FFFFFF; border:2px solid #18181B; border-radius:12px; padding:0.9rem; display:flex; flex-direction:column; gap:0.65rem;">
              <div style="display:flex; justify-content:space-between; align-items:center; gap:0.4rem; flex-wrap:wrap;">
                <strong style="font-family:var(--font-display); font-size:0.95rem;">💳 Método de Pago</strong>
                ${hasSavedCards && !showNewCardFields ? `
                  <button type="button" id="wts-checkout-add-card-btn" class="tl-btn tl-btn--sm tl-btn--primary">
                    + Añadir nueva tarjeta
                  </button>
                ` : ''}
              </div>

              ${hasSavedCards && !showNewCardFields ? `
                <div style="display:flex; flex-direction:column; gap:0.5rem;">
                  ${cards.map((card) => {
                    const checked = card.id === user.selectedCardId;
                    return `
                      <label style="display:flex; align-items:center; gap:0.6rem; padding:0.65rem 0.75rem; border:2px solid #18181B; border-radius:10px; background:${checked ? '#ECFDF5' : '#FAFAFA'}; cursor:pointer;">
                        <input type="radio" name="chosenCardId" value="${card.id}" ${checked ? 'checked' : ''} required />
                        <div style="flex:1; min-width:0;">
                          <div style="font-weight:800; font-size:0.84rem;">${card.brand} · ${card.masked}</div>
                          <div style="font-size:0.73rem; color:var(--ink-secondary);">${card.holder} · Cad. ${card.expiry}</div>
                        </div>
                      </label>
                    `;
                  }).join('')}
                </div>
              ` : `
                <div style="display:flex; flex-direction:column; gap:0.6rem;">
                  <label class="wts-club-label">
                    Titular de la Tarjeta
                    <input type="text" name="cardHolder" class="wts-club-input" value="${escapeAttr(user?.name?.toUpperCase() || '')}" placeholder="NOMBRE APELLIDOS" required />
                  </label>

                  <label class="wts-club-label">
                    Número de Tarjeta
                    <input type="text" name="cardNumber" class="wts-club-input" maxlength="19" placeholder="4532 8910 3421 8890" required />
                  </label>

                  <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.55rem;">
                    <label class="wts-club-label">
                      Caducidad (MM/AA)
                      <input type="text" name="cardExpiry" class="wts-club-input" maxlength="5" placeholder="09/29" required />
                    </label>
                    <label class="wts-club-label">
                      Código Secreto (CVV)
                      <input type="password" name="cardCvv" class="wts-club-input" maxlength="4" inputmode="numeric" placeholder="•••" required />
                    </label>
                  </div>

                  ${hasSavedCards ? `
                    <button type="button" id="wts-checkout-cancel-card-btn" class="tl-btn tl-btn--sm" style="width:100%;">
                      Usar una de mis tarjetas guardadas
                    </button>
                  ` : ''}
                </div>
              `}
            </div>

            <button type="submit" class="tl-btn tl-btn--acid" style="width:100%;">
              Siguiente: Verificar Tarjeta (${config.formatPrice(totals.grandTotal)}) →
            </button>
          </form>
        </div>
      `;

      document.getElementById('wts-back-to-cart')?.addEventListener('click', () => {
        checkoutStep = 'cart';
        showAddCardInCheckout = false;
        renderDrawerContent();
      });

      document.getElementById('wts-checkout-add-card-btn')?.addEventListener('click', () => {
        showAddCardInCheckout = true;
        renderDrawerContent();
      });

      document.getElementById('wts-checkout-cancel-card-btn')?.addEventListener('click', () => {
        showAddCardInCheckout = false;
        renderDrawerContent();
      });

      document.getElementById('wts-checkout-details-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);

        const shippingInfo = {
          fullName: fd.get('fullName'),
          email: fd.get('email'),
          phone: fd.get('phone'),
          address: fd.get('address'),
          city: fd.get('city'),
          postalCode: fd.get('postalCode')
        };

        let selectedCard = null;

        if (hasSavedCards && !showNewCardFields) {
          const chosenId = fd.get('chosenCardId');
          selectedCard = cards.find((c) => c.id === chosenId) || cards[0];
          if (window.WTS && window.WTS.UserClub) {
            window.WTS.UserClub.selectUserCard(selectedCard.id);
          }
        } else {
          const rawNum = String(fd.get('cardNumber') || '').replace(/\D/g, '');
          const last4 = rawNum.slice(-4) || '8890';
          const newCardData = {
            holder: fd.get('cardHolder'),
            rawNumber: rawNum,
            expiry: fd.get('cardExpiry'),
            cvv: fd.get('cardCvv')
          };

          if (user && window.WTS && window.WTS.UserClub) {
            window.WTS.UserClub.updateAccountDetails({
              address: shippingInfo.address,
              city: shippingInfo.city,
              postalCode: shippingInfo.postalCode,
              phone: shippingInfo.phone
            });
            selectedCard = window.WTS.UserClub.addCardToUser(newCardData);
          } else {
            selectedCard = {
              id: 'guest-card',
              brand: rawNum.startsWith('5') ? 'MASTERCARD' : 'VISA',
              holder: newCardData.holder,
              masked: '•••• •••• •••• ' + last4,
              last4,
              expiry: newCardData.expiry,
              cvv: newCardData.cvv
            };
          }
        }

        pendingCheckoutPayload = {
          shipping: shippingInfo,
          card: selectedCard
        };
        showAddCardInCheckout = false;
        checkoutStep = 'verify';
        renderDrawerContent();
      });
      return;
    }

    /* ======================================================================
       PASO 3: PANTALLA DE VERIFICACIÓN DE TARJETA (3D SECURE)
       ====================================================================== */
    if (checkoutStep === 'verify' && pendingCheckoutPayload) {
      if (titleEl) titleEl.textContent = '2/2 · Verificación Segura';
      const card = pendingCheckoutPayload.card;
      const ship = pendingCheckoutPayload.shipping;

      mount.innerHTML = `
        <div class="wts-cart-body">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="tl-tag tl-tag--blue">PASO 2 DE 2 · 3D SECURE</span>
            <button type="button" id="wts-back-to-details" style="font-size:0.8rem; font-weight:800; text-decoration:underline;">
              ← Cambiar datos
            </button>
          </div>

          <div style="background:#18181B; color:#FAFAFA; border:2.5px solid #18181B; border-radius:14px; padding:1.1rem; box-shadow:4px 4px 0 #3B82F6;">
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.75rem; color:#A1A1AA; margin-bottom:0.65rem;">
              <span>PASARELA BANCARIA VERIFICADA</span>
              <span style="background:#FACC15; color:#18181B; font-weight:800; padding:0.15rem 0.45rem; border-radius:4px;">${card.brand}</span>
            </div>
            <div style="font-family:var(--font-display); font-size:1.25rem; letter-spacing:0.08em; margin-bottom:0.45rem;">
              ${card.masked}
            </div>
            <div style="display:flex; justify-content:space-between; font-size:0.76rem; color:#D4D4D8;">
              <span>${card.holder}</span>
              <span>CAD. ${card.expiry}</span>
            </div>
          </div>

          <div style="background:#FFFFFF; border:2px solid #18181B; border-radius:12px; padding:0.9rem; font-size:0.82rem;">
            <div style="font-weight:800; margin-bottom:0.25rem;">Envío a: ${ship.fullName}</div>
            <div style="color:var(--ink-secondary);">${ship.address}, ${ship.postalCode} ${ship.city}</div>
            <div style="margin-top:0.55rem; padding-top:0.55rem; border-top:1.5px dashed #D4D4D8; display:flex; justify-content:space-between; font-weight:800; font-size:0.98rem;">
              <span>Total a autorizar:</span>
              <span>${config.formatPrice(totals.grandTotal)}</span>
            </div>
          </div>

          <form id="wts-verify-card-form" style="background:#FFFFFF; border:2px solid #18181B; border-radius:12px; padding:0.95rem; display:flex; flex-direction:column; gap:0.75rem;">
            <label class="wts-club-label">
              Confirma los 3 dígitos secretos (CVV) de tu tarjeta
              <input
                type="password"
                id="wts-verify-cvv-input"
                class="wts-club-input"
                maxlength="4"
                inputmode="numeric"
                placeholder="Ej. ${card.cvv || '742'}"
                required
              />
            </label>

            <div id="wts-verify-status-box" style="display:none; padding:0.75rem; background:#FEF9C3; border:2px solid #18181B; border-radius:10px; font-size:0.82rem; font-weight:800; text-align:center;">
              ⏳ Conectando con tu banco y verificando tarjeta...
            </div>

            <button type="submit" id="wts-confirm-verify-btn" class="tl-btn tl-btn--acid" style="width:100%;">
              🔒 Verificar Tarjeta y Completar Compra
            </button>
          </form>
        </div>
      `;

      document.getElementById('wts-back-to-details')?.addEventListener('click', () => {
        if (!isVerifyingPayment) {
          checkoutStep = 'details';
          renderDrawerContent();
        }
      });

      document.getElementById('wts-verify-card-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        if (isVerifyingPayment) return;

        const cvvVal = document.getElementById('wts-verify-cvv-input')?.value.trim();
        if (!cvvVal || cvvVal.length < 3) {
          document.dispatchEvent(new CustomEvent('wts:toast', {
            detail: { message: 'Introduce un código CVV válido de 3 o 4 dígitos', type: 'info' }
          }));
          return;
        }

        isVerifyingPayment = true;
        const statusBox = document.getElementById('wts-verify-status-box');
        const submitBtn = document.getElementById('wts-confirm-verify-btn');
        if (statusBox) statusBox.style.display = 'block';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Verificando con el banco...';
        }

        setTimeout(() => {
          finalizeVerifiedPurchase();
        }, 1200);
      });
      return;
    }

    /* ======================================================================
       PASO 1: BOLSA DE COMPRA ESTÁNDAR + BOTÓN SEGUIR COMPRANDO
       ====================================================================== */
    if (titleEl) titleEl.textContent = 'Tu Bolsa Studio';
    const remaining = Math.max(0, config.freeShippingThreshold - totals.merchandiseTotal);
    const pct = Math.min(100, Math.round((totals.merchandiseTotal / config.freeShippingThreshold) * 100));

    mount.innerHTML = `
      <div class="wts-shipping-bar-wrap">
        ${remaining === 0
          ? '🎉 ¡Tienes <strong>ENVÍO GRATIS</strong> activado!'
          : `Añade <strong>${config.formatPrice(remaining)}</strong> más para <strong>ENVÍO GRATIS</strong>`
        }
        <div class="wts-shipping-track">
          <div class="wts-shipping-fill" style="width:${pct}%"></div>
        </div>
      </div>

      <div class="wts-cart-body">
        ${cart.map((item) => `
          <div class="wts-cart-item">
            <div class="wts-cart-thumb" style="${item.isCustom ? `background:${item.customMeta?.colorHex || '#18181B'}; color:#FFF; font-weight:800; font-size:0.75rem;` : ''}">
              ${item.isCustom
                ? 'LAB✦'
                : `<img src="${item.image}" alt="${item.name}" style="width:100%; height:100%; object-fit:cover; border-radius:6px;" />`
              }
            </div>
            <div style="flex:1; min-width:0;">
              <div style="font-weight:800; font-size:0.88rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                ${item.name}
              </div>
              <div style="font-size:0.75rem; color:var(--ink-secondary); margin-bottom:0.4rem;">
                Talla <strong>${item.size}</strong> ${item.isCustom ? `· ${item.customMeta?.placement || 'Personalizada'}` : `· ${item.fit || ''}`}
              </div>
              <div style="display:flex; align-items:center; justify-content:space-between;">
                <div class="wts-qty-box">
                  <button type="button" data-cart-dec="${item.key}" aria-label="Reducir">−</button>
                  <span>${item.qty}</span>
                  <button type="button" data-cart-inc="${item.key}" aria-label="Aumentar">+</button>
                </div>
                <strong style="font-family:var(--font-display); font-size:0.95rem;">
                  ${config.formatPrice(item.unitPrice * item.qty)}
                </strong>
              </div>
            </div>
            <button type="button" data-cart-del="${item.key}" title="Eliminar" style="font-size:0.85rem; color:var(--ink-muted); padding:0.25rem;">🗑</button>
          </div>
        `).join('')}
      </div>

      <div class="wts-cart-footer">
        <form id="wts-coupon-form" class="wts-coupon-row">
          <input type="text" id="wts-coupon-input" placeholder="Cupón (THREAD10 / STUDIO25)" value="${activeCouponCode || ''}" />
          <button type="submit" class="tl-btn tl-btn--sm tl-btn--dark">Aplicar</button>
        </form>

        <div class="wts-cart-totals">
          <div class="wts-cart-row">
            <span>Subtotal</span>
            <span>${config.formatPrice(totals.rawSubtotal)}</span>
          </div>
          ${totals.vipDiscount > 0 ? `
            <div class="wts-cart-row" style="color:#059669; font-weight:700;">
              <span>★ Descuento Club VIP (-15%)</span>
              <span>−${config.formatPrice(totals.vipDiscount)}</span>
            </div>
          ` : ''}
          ${totals.couponDiscount > 0 ? `
            <div class="wts-cart-row" style="color:#2563EB; font-weight:700;">
              <span>🎟️ Cupón ${activeCouponCode}</span>
              <span>−${config.formatPrice(totals.couponDiscount)}</span>
            </div>
          ` : ''}
          <div class="wts-cart-row">
            <span>Envío</span>
            <span>${totals.shipping === 0 ? 'GRATIS' : config.formatPrice(totals.shipping)}</span>
          </div>
          <div class="wts-cart-row wts-cart-row--grand">
            <span>Total</span>
            <span>${config.formatPrice(totals.grandTotal)}</span>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:0.5rem;">
          <button type="button" id="wts-checkout-btn" class="tl-btn tl-btn--acid" style="width:100%;">
            ⚡ Finalizar Compra →
          </button>
          <button type="button" id="wts-continue-shopping-btn" class="tl-btn tl-btn--sm" style="width:100%; background:#FFFFFF;">
            ← Seguir comprando
          </button>
        </div>
      </div>
    `;

    mount.querySelectorAll('[data-cart-dec]').forEach((btn) => {
      btn.addEventListener('click', () => updateQty(btn.dataset.cartDec, -1));
    });
    mount.querySelectorAll('[data-cart-inc]').forEach((btn) => {
      btn.addEventListener('click', () => updateQty(btn.dataset.cartInc, 1));
    });
    mount.querySelectorAll('[data-cart-del]').forEach((btn) => {
      btn.addEventListener('click', () => removeItem(btn.dataset.cartDel));
    });

    document.getElementById('wts-coupon-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = document.getElementById('wts-coupon-input').value;
      applyCoupon(val);
    });

    document.getElementById('wts-checkout-btn')?.addEventListener('click', () => {
      checkoutStep = 'details';
      showAddCardInCheckout = false;
      renderDrawerContent();
    });

    document.getElementById('wts-continue-shopping-btn')?.addEventListener('click', close);
  }

  function open() {
    injectDrawerShell();
    renderDrawerContent();
    const drawer = document.getElementById('wts-cart-drawer');
    const backdrop = document.getElementById('wts-cart-backdrop');
    if (drawer) {
      drawer.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');
    }
    if (backdrop) backdrop.classList.add('is-open');
  }

  function close() {
    const drawer = document.getElementById('wts-cart-drawer');
    const backdrop = document.getElementById('wts-cart-backdrop');
    if (drawer) {
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
    }
    if (backdrop) backdrop.classList.remove('is-open');
    if (checkoutStep === 'done') {
      checkoutStep = 'cart';
      lastOrderReceipt = null;
    }
  }

  function init(userConfig = {}) {
    config = { ...DEFAULT_CONFIG, ...userConfig };
    injectDrawerShell();
    renderDrawerContent();
    document.addEventListener('wts:user-changed', renderDrawerContent);
  }

  window.WTS = window.WTS || {};
  window.WTS.ShopCart = {
    init,
    open,
    close,
    addItem,
    updateQty,
    removeItem,
    applyCoupon,
    getCart,
    getCount,
    getOrders
  };
})();
