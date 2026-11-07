/* ==========================================================================
   MÓDULO AGNÓSTICO: CLUB DE USUARIO VIP, OPCIONES DE CUENTA & WALLET TARJETAS
   - Cuadrado de perfil con engranaje ⚙️ solo icono y botón rojo Cerrar Sesión.
   - 3 botones de acceso rápido debajo (Recomendaciones, Deseados, Rasca y Gana).
   - Modal de Opciones con: Datos Personales, Datos de Compra (Dirección +
     Wallet de múltiples tarjetas con CVV, selección y "+ Añadir nueva tarjeta")
     e Historial de Compras.
   ========================================================================== */

(function () {
  'use strict';

  const DEFAULT_CONFIG = {
    storageKey: 'wts_vip_user',
    couponStorageKey: 'wts_vip_coupon_revealed',
    vipDiscountRate: 0.15,
    demoUser: {
      id: 'vip-demo',
      firstName: 'Alex',
      lastName: 'Rivera Gómez',
      name: 'Alex Rivera',
      dni: '48291045K',
      email: 'alex.rivera@threadlab.es',
      phone: '+34 612 849 302',
      address: 'Calle Fuencarral 48, 3º Izq',
      city: 'Madrid',
      postalCode: '28004',
      selectedCardId: 'card-demo-1',
      cards: [
        {
          id: 'card-demo-1',
          brand: 'VISA',
          holder: 'ALEX RIVERA GOMEZ',
          masked: '•••• •••• •••• 4829',
          last4: '4829',
          expiry: '09/29',
          cvv: '742'
        }
      ],
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
    catalogProvider: () => []
  };

  let config = { ...DEFAULT_CONFIG };
  let activeOptionsTab = 'personal';
  let showNewCardFormInOptions = false;

  function normalizeUser(user) {
    if (!user) return null;
    if (!Array.isArray(user.cards)) {
      user.cards = [];
      if (user.cardNumber) {
        user.cards.push({
          id: 'card-legacy-1',
          brand: 'TARJETA',
          holder: user.name ? user.name.toUpperCase() : 'TITULAR',
          masked: user.cardNumber,
          last4: user.cardNumber.slice(-4),
          expiry: user.cardExpiry || '12/28',
          cvv: '000'
        });
      }
    }
    if (!user.selectedCardId && user.cards.length > 0) {
      user.selectedCardId = user.cards[0].id;
    }
    return user;
  }

  function getUser() {
    try {
      const raw = localStorage.getItem(config.storageKey);
      return raw ? normalizeUser(JSON.parse(raw)) : null;
    } catch (_) {
      return null;
    }
  }

  function saveUser(user) {
    const normalized = normalizeUser(user);
    localStorage.setItem(config.storageKey, JSON.stringify(normalized));
    return normalized;
  }

  function isVip() {
    return Boolean(getUser());
  }

  function getDiscountRate() {
    return isVip() ? config.vipDiscountRate : 0;
  }

  function detectCardBrand(digits) {
    if (digits.startsWith('4')) return 'VISA';
    if (digits.startsWith('5')) return 'MASTERCARD';
    if (digits.startsWith('3')) return 'AMEX';
    return 'TARJETA';
  }

  function addCardToUser({ holder, rawNumber, expiry, cvv }) {
    const user = getUser();
    if (!user) return null;

    const digits = String(rawNumber || '').replace(/\D/g, '');
    const last4 = digits.slice(-4) || '0000';
    const newCard = {
      id: 'card-' + Date.now(),
      brand: detectCardBrand(digits),
      holder: (holder || user.name || 'TITULAR').trim().toUpperCase(),
      masked: '•••• •••• •••• ' + last4,
      last4,
      expiry: (expiry || '12/29').trim(),
      cvv: String(cvv || '').replace(/\D/g, '').slice(0, 4) || '000'
    };

    user.cards.push(newCard);
    user.selectedCardId = newCard.id;
    const saved = saveUser(user);
    notifyUserChange(saved, `💳 Tarjeta terminada en ${last4} añadida`);
    return newCard;
  }

  function selectUserCard(cardId) {
    const user = getUser();
    if (!user) return null;
    user.selectedCardId = cardId;
    const saved = saveUser(user);
    notifyUserChange(saved, '✓ Tarjeta seleccionada como principal');
    return saved;
  }

  function removeUserCard(cardId) {
    const user = getUser();
    if (!user) return null;
    user.cards = user.cards.filter((c) => c.id !== cardId);
    if (user.selectedCardId === cardId) {
      user.selectedCardId = user.cards[0]?.id || null;
    }
    const saved = saveUser(user);
    notifyUserChange(saved, 'Tarjeta eliminada de tu cuenta');
    return saved;
  }

  function loginDemo() {
    const clone = JSON.parse(JSON.stringify(config.demoUser));
    clone.loggedAt = new Date().toISOString();
    const user = saveUser(clone);
    closeLoginModal();
    notifyUserChange(user, `★ Hola ${user.firstName}: -${Math.round(config.vipDiscountRate * 100)}% VIP activado`);
    return user;
  }

  function loginCustom(formDataObj) {
    const firstName = (formDataObj.firstName || 'Miembro').trim();
    const lastName = (formDataObj.lastName || 'Studio').trim();
    const fullName = `${firstName} ${lastName}`.trim();
    const initials = ((firstName[0] || 'M') + (lastName[0] || 'S')).toUpperCase();

    const user = saveUser({
      id: 'vip-' + Date.now(),
      firstName,
      lastName,
      name: fullName,
      dni: (formDataObj.dni || '').trim().toUpperCase(),
      email: (formDataObj.email || '').trim(),
      phone: (formDataObj.phone || '').trim(),
      address: (formDataObj.address || '').trim(),
      city: (formDataObj.city || '').trim(),
      postalCode: (formDataObj.postalCode || '').trim(),
      selectedCardId: null,
      cards: [],
      handle: '@' + firstName.toLowerCase().replace(/[^a-z0-9]/g, ''),
      tier: 'Miembro Club VIP',
      avatar: initials,
      preferredFit: formDataObj.preferredFit || 'Oversize',
      preferredSize: formDataObj.preferredSize || 'L',
      points: 500,
      loggedAt: new Date().toISOString()
    });

    closeLoginModal();
    notifyUserChange(user, `★ Bienvenido ${firstName}: -${Math.round(config.vipDiscountRate * 100)}% VIP aplicado`);
    return user;
  }

  function updateAccountDetails(updates) {
    const user = getUser();
    if (!user) return null;

    const updated = { ...user, ...updates };
    if (updates.firstName || updates.lastName) {
      updated.name = `${updated.firstName || ''} ${updated.lastName || ''}`.trim();
      updated.avatar = ((updated.firstName?.[0] || 'M') + (updated.lastName?.[0] || 'V')).toUpperCase();
    }

    const saved = saveUser(updated);
    notifyUserChange(saved, '✓ Datos guardados correctamente');
    return saved;
  }

  function logout() {
    localStorage.removeItem(config.storageKey);
    closeAccountOptionsModal();
    closeScratchModal();
    notifyUserChange(null, 'Sesión cerrada. Precios estándar restaurados.');
  }

  function notifyUserChange(user, toastMsg) {
    document.dispatchEvent(new CustomEvent('wts:user-changed', { detail: { user } }));
    if (toastMsg) {
      document.dispatchEvent(new CustomEvent('wts:toast', {
        detail: { message: toastMsg, type: user ? 'vip' : 'info' }
      }));
    }
  }

  function isCouponRevealed() {
    return localStorage.getItem(config.couponStorageKey) === 'true';
  }

  function revealCoupon() {
    localStorage.setItem(config.couponStorageKey, 'true');
    document.dispatchEvent(new CustomEvent('wts:toast', {
      detail: {
        message: `🎟️ ¡Premio desbloqueado! Cupón ${config.secretCoupon.code}`,
        type: 'success'
      }
    }));
  }

  function getRecommendations(limit = 3) {
    const catalog = config.catalogProvider();
    const user = getUser();

    if (!user) {
      return catalog.filter((item) => !item.vipOnly).slice(0, limit);
    }

    const scored = catalog.map((item) => {
      let score = 0;
      if (item.fit === user.preferredFit) score += 4;
      if (item.stock && (item.stock[user.preferredSize] || 0) > 0) score += 3;
      if (item.vipOnly) score += 2;
      if (item.featured) score += 1;
      return { item, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map((entry) => entry.item);
  }

  function escapeAttr(val) {
    return String(val || '').replace(/"/g, '&quot;');
  }

  /* ========================================================================
     1. MODAL DE LOGIN RÁPIDO DESDE LA TIENDA
     ======================================================================== */
  function injectLoginModal() {
    if (document.getElementById('wts-login-modal')) return;

    const modalHtml = `
      <div id="wts-login-modal" class="tl-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="wts-login-title">
        <div class="tl-modal">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.85rem;">
            <span class="tl-tag tl-tag--yellow">★ CUENTA THREADLAB VIP</span>
            <button type="button" id="wts-login-close" class="tl-icon-btn" style="height:32px; width:32px; padding:0;">✕</button>
          </div>

          <h3 id="wts-login-title" style="font-family:var(--font-display); font-size:1.4rem; line-height:1.1; margin-bottom:0.4rem;">
            Accede a tu Cuenta
          </h3>
          <p style="font-size:0.85rem; color:var(--ink-secondary); margin-bottom:1rem;">
            Desbloquea tu <strong>15% de descuento VIP</strong>, recomendaciones según tu talla, lista de deseados y tu tarjeta <strong>Rasca y Gana</strong>.
          </p>

          <button type="button" id="wts-modal-demo-btn" class="tl-btn tl-btn--acid" style="width:100%; margin-bottom:0.95rem;">
            ⚡ Entrar en 1 Clic como ${config.demoUser.name}
          </button>

          <div style="text-align:center; font-size:0.74rem; font-weight:800; color:var(--ink-muted); margin-bottom:0.8rem;">
            — O CREA TU CUENTA CON TUS DATOS —
          </div>

          <form id="wts-modal-login-form" class="wts-club-form">
            <label class="wts-club-label">
              Nombre
              <input type="text" name="firstName" class="wts-club-input" placeholder="Valeria" required />
            </label>

            <label class="wts-club-label">
              Apellidos
              <input type="text" name="lastName" class="wts-club-input" placeholder="Cruz Martín" required />
            </label>

            <label class="wts-club-label">
              DNI / NIE
              <input type="text" name="dni" class="wts-club-input" placeholder="12345678Z" required />
            </label>

            <label class="wts-club-label">
              Teléfono
              <input type="tel" name="phone" class="wts-club-input" placeholder="+34 600 000 000" required />
            </label>

            <label class="wts-club-label">
              Correo Electrónico
              <input type="email" name="email" class="wts-club-input" placeholder="valeria@email.com" required />
            </label>

            <label class="wts-club-label">
              Corte Preferido
              <select name="preferredFit" class="wts-club-input">
                <option value="Oversize">Oversize</option>
                <option value="Boxy Fit">Boxy Fit</option>
              </select>
            </label>

            <label class="wts-club-label">
              Talla Habitual
              <select name="preferredSize" class="wts-club-input">
                <option value="S">Talla S</option>
                <option value="M">Talla M</option>
                <option value="L" selected>Talla L</option>
                <option value="XL">Talla XL</option>
              </select>
            </label>

            <button type="submit" class="tl-btn tl-btn--dark" style="width:100%; margin-top:0.25rem;">
              Guardar Datos y Entrar →
            </button>
          </form>
        </div>
      </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = modalHtml;
    document.body.appendChild(wrapper);

    const backdrop = document.getElementById('wts-login-modal');
    document.getElementById('wts-login-close').addEventListener('click', closeLoginModal);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeLoginModal();
    });

    document.getElementById('wts-modal-demo-btn').addEventListener('click', loginDemo);

    document.getElementById('wts-modal-login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      loginCustom({
        firstName: fd.get('firstName'),
        lastName: fd.get('lastName'),
        dni: fd.get('dni'),
        email: fd.get('email'),
        phone: fd.get('phone'),
        preferredFit: fd.get('preferredFit'),
        preferredSize: fd.get('preferredSize')
      });
    });
  }

  function openLoginModal() {
    injectLoginModal();
    document.getElementById('wts-login-modal')?.classList.add('is-open');
  }

  function closeLoginModal() {
    document.getElementById('wts-login-modal')?.classList.remove('is-open');
  }

  /* ========================================================================
     2. MODAL DE OPCIONES DE CUENTA (ENGRANAJE ⚙️)
        Con Wallet de tarjetas (elegir tarjeta o "+ Añadir nueva tarjeta" con CVV)
     ======================================================================== */
  function injectAccountOptionsModal() {
    if (document.getElementById('wts-options-modal')) return;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div id="wts-options-modal" class="tl-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="wts-options-title">
        <div class="tl-modal" style="max-width:480px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.85rem;">
            <span class="tl-tag tl-tag--yellow">⚙️ OPCIONES DE CUENTA</span>
            <button type="button" id="wts-options-close" class="tl-icon-btn" style="height:32px; width:32px; padding:0;">✕</button>
          </div>
          <div id="wts-options-dynamic"></div>
        </div>
      </div>
    `;
    document.body.appendChild(wrapper);

    const backdrop = document.getElementById('wts-options-modal');
    document.getElementById('wts-options-close').addEventListener('click', closeAccountOptionsModal);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeAccountOptionsModal();
    });
  }

  function renderAccountOptionsContent() {
    const mount = document.getElementById('wts-options-dynamic');
    const user = getUser();
    if (!mount || !user) return;

    const orders = window.WTS && window.WTS.ShopCart ? window.WTS.ShopCart.getOrders() : [];
    const hasCards = user.cards && user.cards.length > 0;
    const mustShowCardForm = !hasCards || showNewCardFormInOptions;

    mount.innerHTML = `
      <h3 id="wts-options-title" style="font-family:var(--font-display); font-size:1.3rem; margin-bottom:0.75rem;">
        Configuración de ${user.name}
      </h3>

      <div style="display:flex; flex-direction:column; gap:0.4rem; margin-bottom:1.1rem; padding-bottom:0.85rem; border-bottom:2px solid var(--border-color);">
        <button type="button" class="tl-filter-chip ${activeOptionsTab === 'personal' ? 'is-active' : ''}" data-opt-tab="personal" style="text-align:left;">
          👤 Datos Personales (Nombre, DNI, Email, Teléfono)
        </button>
        <button type="button" class="tl-filter-chip ${activeOptionsTab === 'checkout' ? 'is-active' : ''}" data-opt-tab="checkout" style="text-align:left;">
          💳 Datos de Compra (Dirección y Tarjetas)
        </button>
        <button type="button" class="tl-filter-chip ${activeOptionsTab === 'history' ? 'is-active' : ''}" data-opt-tab="history" style="text-align:left;">
          📦 Historial de Compras (${orders.length})
        </button>
      </div>

      ${activeOptionsTab === 'personal' ? `
        <form id="wts-opt-personal-form" class="wts-club-form">
          <label class="wts-club-label">
            Nombre
            <input type="text" name="firstName" class="wts-club-input" value="${escapeAttr(user.firstName)}" required />
          </label>

          <label class="wts-club-label">
            Apellidos
            <input type="text" name="lastName" class="wts-club-input" value="${escapeAttr(user.lastName)}" required />
          </label>

          <label class="wts-club-label">
            DNI / NIE
            <input type="text" name="dni" class="wts-club-input" value="${escapeAttr(user.dni)}" required />
          </label>

          <label class="wts-club-label">
            Correo Electrónico
            <input type="email" name="email" class="wts-club-input" value="${escapeAttr(user.email)}" required />
          </label>

          <label class="wts-club-label">
            Número de Teléfono
            <input type="tel" name="phone" class="wts-club-input" value="${escapeAttr(user.phone)}" required />
          </label>

          <label class="wts-club-label">
            Corte Preferido
            <select name="preferredFit" class="wts-club-input">
              <option value="Oversize" ${user.preferredFit === 'Oversize' ? 'selected' : ''}>Oversize</option>
              <option value="Boxy Fit" ${user.preferredFit === 'Boxy Fit' ? 'selected' : ''}>Boxy Fit</option>
              <option value="Relaxed" ${user.preferredFit === 'Relaxed' ? 'selected' : ''}>Relaxed Fit</option>
            </select>
          </label>

          <label class="wts-club-label">
            Talla Habitual
            <select name="preferredSize" class="wts-club-input">
              ${['S', 'M', 'L', 'XL'].map((s) => `<option value="${s}" ${user.preferredSize === s ? 'selected' : ''}>Talla ${s}</option>`).join('')}
            </select>
          </label>

          <button type="submit" class="tl-btn tl-btn--acid" style="width:100%; margin-top:0.35rem;">
            ✓ Guardar Datos Personales
          </button>
        </form>
      ` : ''}

      ${activeOptionsTab === 'checkout' ? `
        <div style="display:flex; flex-direction:column; gap:1.1rem;">
          <!-- Dirección de Envío -->
          <form id="wts-opt-address-form" class="wts-club-form">
            <label class="wts-club-label">
              Dirección de Envío
              <input type="text" name="address" class="wts-club-input" value="${escapeAttr(user.address)}" placeholder="Calle, número, piso..." required />
            </label>

            <label class="wts-club-label">
              Ciudad / Provincia
              <input type="text" name="city" class="wts-club-input" value="${escapeAttr(user.city)}" placeholder="Madrid" required />
            </label>

            <label class="wts-club-label">
              Código Postal
              <input type="text" name="postalCode" class="wts-club-input" value="${escapeAttr(user.postalCode)}" placeholder="28004" required />
            </label>

            <button type="submit" class="tl-btn tl-btn--sm tl-btn--dark" style="width:100%;">
              ✓ Guardar Dirección de Envío
            </button>
          </form>

          <!-- Wallet de Tarjetas -->
          <div style="padding:0.95rem; background:var(--bg-subtle); border:2px solid var(--border-color); border-radius:12px; display:flex; flex-direction:column; gap:0.75rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:0.5rem;">
              <strong style="font-family:var(--font-display); font-size:0.95rem;">💳 Mis Tarjetas Guardadas</strong>
              ${hasCards && !mustShowCardForm ? `
                <button type="button" id="wts-opt-show-new-card" class="tl-btn tl-btn--sm tl-btn--primary">
                  + Añadir nueva tarjeta
                </button>
              ` : ''}
            </div>

            ${hasCards && !mustShowCardForm ? `
              <div style="display:flex; flex-direction:column; gap:0.5rem;">
                ${user.cards.map((card) => {
                  const isSelected = card.id === user.selectedCardId;
                  return `
                    <div style="background:#FFFFFF; border:2px solid #18181B; border-radius:10px; padding:0.7rem 0.8rem; display:flex; align-items:center; justify-content:space-between; gap:0.5rem; ${isSelected ? 'box-shadow:3px 3px 0 #10B981;' : ''}">
                      <label style="display:flex; align-items:center; gap:0.6rem; cursor:pointer; flex:1; min-width:0;">
                        <input type="radio" name="selectedUserCard" value="${card.id}" ${isSelected ? 'checked' : ''} />
                        <div style="min-width:0;">
                          <div style="font-weight:800; font-size:0.84rem;">${card.brand} · ${card.masked}</div>
                          <div style="font-size:0.73rem; color:var(--ink-secondary);">
                            Cad: ${card.expiry} · CVV: •••
                          </div>
                        </div>
                      </label>
                      <button type="button" data-del-card="${card.id}" title="Eliminar tarjeta" style="color:var(--accent-coral); font-weight:800; padding:0.25rem 0.45rem;">✕</button>
                    </div>
                  `;
                }).join('')}
              </div>
            ` : `
              <form id="wts-opt-new-card-form" class="wts-club-form">
                <label class="wts-club-label">
                  Titular de la Tarjeta
                  <input type="text" name="holder" class="wts-club-input" value="${escapeAttr(user.name.toUpperCase())}" required />
                </label>

                <label class="wts-club-label">
                  Número de Tarjeta
                  <input type="text" name="rawNumber" class="wts-club-input" maxlength="19" placeholder="4532 8910 3421 8890" required />
                </label>

                <label class="wts-club-label">
                  Fecha de Caducidad (MM/AA)
                  <input type="text" name="expiry" class="wts-club-input" maxlength="5" placeholder="09/29" required />
                </label>

                <label class="wts-club-label">
                  Código Secreto (CVV / CVC)
                  <input type="password" name="cvv" class="wts-club-input" maxlength="4" inputmode="numeric" placeholder="•••" required />
                </label>

                <div style="display:flex; gap:0.5rem; margin-top:0.2rem;">
                  <button type="submit" class="tl-btn tl-btn--sm tl-btn--acid" style="flex:1;">
                    ✓ Guardar Tarjeta
                  </button>
                  ${hasCards ? `
                    <button type="button" id="wts-opt-cancel-new-card" class="tl-btn tl-btn--sm">
                      Cancelar
                    </button>
                  ` : ''}
                </div>
              </form>
            `}
          </div>
        </div>
      ` : ''}

      ${activeOptionsTab === 'history' ? `
        <div style="display:flex; flex-direction:column; gap:0.65rem;">
          ${orders.length === 0 ? `
            <div style="padding:1.25rem; background:var(--bg-subtle); border:2px dashed var(--border-color); border-radius:12px; text-align:center;">
              <p style="font-size:0.86rem; color:var(--ink-secondary); margin-bottom:0.75rem;">
                Aún no has realizado ningún pedido con esta cuenta.
              </p>
              <a href="catalogo.html" class="tl-btn tl-btn--sm tl-btn--primary">Ir a Comprar →</a>
            </div>
          ` : orders.map((ord) => `
            <div style="padding:0.75rem 0.9rem; background:var(--bg-subtle); border:2px solid var(--border-color); border-radius:10px; display:flex; flex-direction:column; gap:0.35rem;">
              <div style="display:flex; justify-content:space-between; align-items:center; gap:0.5rem;">
                <span class="tl-tag tl-tag--yellow">${ord.id}</span>
                <strong style="font-family:var(--font-display); font-size:1rem;">
                  ${window.ThreadLabApp ? window.ThreadLabApp.formatPrice(ord.totals.grandTotal) : ord.totals.grandTotal + ' €'}
                </strong>
              </div>
              <div style="font-size:0.74rem; font-weight:700; color:var(--ink-muted);">${ord.date}</div>
              <div style="font-size:0.8rem; color:var(--ink-primary); font-weight:600;">
                ${ord.items.map((i) => `${i.qty}× ${i.name} (${i.size})`).join(' · ')}
              </div>
            </div>
          `).join('')}

          <a href="pedidos.html" class="tl-btn tl-btn--sm tl-btn--dark" style="width:100%; margin-top:0.35rem;">
            Ver Seguimiento de Pedidos →
          </a>
        </div>
      ` : ''}
    `;

    mount.querySelectorAll('[data-opt-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeOptionsTab = btn.dataset.optTab;
        showNewCardFormInOptions = false;
        renderAccountOptionsContent();
      });
    });

    document.getElementById('wts-opt-personal-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      updateAccountDetails({
        firstName: fd.get('firstName'),
        lastName: fd.get('lastName'),
        dni: fd.get('dni'),
        phone: fd.get('phone'),
        email: fd.get('email'),
        preferredFit: fd.get('preferredFit'),
        preferredSize: fd.get('preferredSize')
      });
      renderAccountOptionsContent();
    });

    document.getElementById('wts-opt-address-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      updateAccountDetails({
        address: fd.get('address'),
        city: fd.get('city'),
        postalCode: fd.get('postalCode')
      });
      renderAccountOptionsContent();
    });

    document.getElementById('wts-opt-show-new-card')?.addEventListener('click', () => {
      showNewCardFormInOptions = true;
      renderAccountOptionsContent();
    });

    document.getElementById('wts-opt-cancel-new-card')?.addEventListener('click', () => {
      showNewCardFormInOptions = false;
      renderAccountOptionsContent();
    });

    mount.querySelectorAll('input[name="selectedUserCard"]').forEach((radio) => {
      radio.addEventListener('change', () => {
        selectUserCard(radio.value);
        renderAccountOptionsContent();
      });
    });

    mount.querySelectorAll('[data-del-card]').forEach((btn) => {
      btn.addEventListener('click', () => {
        removeUserCard(btn.dataset.delCard);
        renderAccountOptionsContent();
      });
    });

    document.getElementById('wts-opt-new-card-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      addCardToUser({
        holder: fd.get('holder'),
        rawNumber: fd.get('rawNumber'),
        expiry: fd.get('expiry'),
        cvv: fd.get('cvv')
      });
      showNewCardFormInOptions = false;
      renderAccountOptionsContent();
    });
  }

  function openAccountOptionsModal(initialTab = 'personal') {
    activeOptionsTab = initialTab;
    showNewCardFormInOptions = false;
    injectAccountOptionsModal();
    renderAccountOptionsContent();
    document.getElementById('wts-options-modal')?.classList.add('is-open');
  }

  function closeAccountOptionsModal() {
    document.getElementById('wts-options-modal')?.classList.remove('is-open');
  }

  /* ========================================================================
     3. MODAL DE RASCA Y GANA VIP
     ======================================================================== */
  function injectScratchModal() {
    if (document.getElementById('wts-scratch-modal')) return;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div id="wts-scratch-modal" class="tl-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="wts-scratch-title">
        <div class="tl-modal">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.85rem;">
            <span class="tl-tag tl-tag--coral">🎟️ RASCA Y GANA VIP</span>
            <button type="button" id="wts-scratch-modal-close" class="tl-icon-btn" style="height:32px; width:32px; padding:0;">✕</button>
          </div>
          <div id="wts-scratch-modal-body"></div>
        </div>
      </div>
    `;
    document.body.appendChild(wrapper);

    const backdrop = document.getElementById('wts-scratch-modal');
    document.getElementById('wts-scratch-modal-close').addEventListener('click', closeScratchModal);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeScratchModal();
    });
  }

  function openScratchModal() {
    const user = getUser();
    if (!user) return;
    injectScratchModal();
    const body = document.getElementById('wts-scratch-modal-body');
    const revealed = isCouponRevealed();

    body.innerHTML = `
      <h3 id="wts-scratch-title" style="font-family:var(--font-display); font-size:1.35rem; margin-bottom:0.35rem;">
        Tu Tarjeta Premio del Día
      </h3>
      <p style="font-size:0.84rem; color:var(--ink-secondary); margin-bottom:1rem;">
        Pulsa para rascar y descubrir tu código promocional acumulable a tu -15% VIP.
      </p>

      <div class="wts-scratch-box">
        <div id="wts-scratch-cover" class="wts-scratch-cover ${revealed ? 'is-revealed' : ''}">
          <span style="font-size:1.75rem;">🪙</span>
          <strong style="font-family:var(--font-display); font-size:1rem;">PULSA AQUÍ PARA RASCAR Y GANAR</strong>
          <span style="font-size:0.75rem; opacity:0.9;">Premio exclusivo para ${user.firstName}</span>
        </div>

        <div style="font-size:0.76rem; text-transform:uppercase; letter-spacing:0.06em; color:#A1A1AA;">
          ${config.secretCoupon.label}
        </div>
        <div class="wts-coupon-code">${config.secretCoupon.code}</div>
        <div>
          <button type="button" id="wts-copy-coupon-btn" class="tl-btn tl-btn--sm tl-btn--acid">
            Aplicar en el Carrito Ahora →
          </button>
        </div>
      </div>
    `;

    const scratchCover = document.getElementById('wts-scratch-cover');
    if (scratchCover) {
      scratchCover.addEventListener('click', () => {
        revealCoupon();
        scratchCover.classList.add('is-revealed');
      });
    }

    document.getElementById('wts-copy-coupon-btn')?.addEventListener('click', () => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(config.secretCoupon.code).catch(() => {});
      }
      closeScratchModal();
      if (window.WTS && window.WTS.ShopCart) {
        window.WTS.ShopCart.applyCoupon(config.secretCoupon.code);
        window.WTS.ShopCart.open();
      }
    });

    document.getElementById('wts-scratch-modal')?.classList.add('is-open');
  }

  function closeScratchModal() {
    document.getElementById('wts-scratch-modal')?.classList.remove('is-open');
  }

  /* ========================================================================
     4. CUADRADO DE PERFIL + ENGRANAJE SOLO ICONO + BOTÓN ROJO CERRAR SESIÓN
     ======================================================================== */
  function renderProfilePortal(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const user = getUser();

    if (!user) {
      container.innerHTML = `
        <div class="wts-club-grid">
          <div class="wts-club-hero">
            <div>
              <span class="tl-tag tl-tag--dark" style="margin-bottom:0.75rem;">ACCESO CLIENTES &amp; VIP</span>
              <h2 style="font-family:var(--font-display); font-size:1.85rem; line-height:1.08; margin-bottom:0.6rem;">
                Inicia sesión en tu Cuenta ThreadLab
              </h2>
              <p style="font-size:0.92rem; font-weight:600;">
                Al entrar verás tus recomendaciones personalizadas, tu lista de deseados, tu -15% VIP y tus opciones de cuenta.
              </p>
            </div>

            <div class="wts-club-perks">
              <div class="wts-perk-pill">⚡ -15% Automático</div>
              <div class="wts-perk-pill">♥ Lista de Deseados</div>
              <div class="wts-perk-pill">🎟️ Rasca y Gana VIP</div>
            </div>

            <button type="button" id="wts-demo-login-btn" class="tl-btn tl-btn--dark" style="width:100%;">
              ⚡ Entrar en 1 Clic como ${config.demoUser.name}
            </button>
          </div>

          <div class="wts-club-card">
            <h3 style="font-family:var(--font-display); font-size:1.3rem; margin-bottom:0.35rem;">
              Registro Rápido
            </h3>
            <p style="font-size:0.84rem; color:var(--ink-secondary); margin-bottom:1rem;">
              Introduce tus datos para crear tu cuenta de cliente VIP.
            </p>

            <form id="wts-custom-login-form" class="wts-club-form">
              <label class="wts-club-label">
                Nombre
                <input type="text" name="firstName" class="wts-club-input" placeholder="Valeria" required />
              </label>

              <label class="wts-club-label">
                Apellidos
                <input type="text" name="lastName" class="wts-club-input" placeholder="Cruz Martín" required />
              </label>

              <label class="wts-club-label">
                DNI / NIE
                <input type="text" name="dni" class="wts-club-input" placeholder="12345678Z" required />
              </label>

              <label class="wts-club-label">
                Teléfono
                <input type="tel" name="phone" class="wts-club-input" placeholder="+34 600 000 000" required />
              </label>

              <label class="wts-club-label">
                Correo Electrónico
                <input type="email" name="email" class="wts-club-input" placeholder="valeria@email.com" required />
              </label>

              <label class="wts-club-label">
                Corte Favorito
                <select name="preferredFit" class="wts-club-input">
                  <option value="Oversize">Oversize</option>
                  <option value="Boxy Fit">Boxy Fit</option>
                </select>
              </label>

              <label class="wts-club-label">
                Talla Habitual
                <select name="preferredSize" class="wts-club-input">
                  <option value="S">Talla S</option>
                  <option value="M">Talla M</option>
                  <option value="L" selected>Talla L</option>
                  <option value="XL">Talla XL</option>
                </select>
              </label>

              <button type="submit" class="tl-btn tl-btn--primary" style="width:100%; margin-top:0.25rem;">
                Crear Cuenta y Entrar →
              </button>
            </form>
          </div>
        </div>
      `;

      document.getElementById('wts-demo-login-btn')?.addEventListener('click', () => {
        loginDemo();
        renderProfilePortal(containerId);
      });

      document.getElementById('wts-custom-login-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        loginCustom({
          firstName: fd.get('firstName'),
          lastName: fd.get('lastName'),
          dni: fd.get('dni'),
          email: fd.get('email'),
          phone: fd.get('phone'),
          preferredFit: fd.get('preferredFit'),
          preferredSize: fd.get('preferredSize')
        });
        renderProfilePortal(containerId);
      });
      return;
    }

    const wishCount = window.WTS && window.WTS.Wishlist ? window.WTS.Wishlist.getItems().length : 0;

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:0.9rem;">
        <div class="wts-club-hero">
          <div class="wts-profile-top">
            <div class="wts-profile-identity">
              <div class="wts-club-avatar">${user.avatar}</div>
              <div class="wts-profile-info">
                <span class="tl-tag tl-tag--dark">${user.tier}</span>
                <h2 class="wts-profile-name">${user.name}</h2>
                <span class="wts-profile-email">${user.email}</span>
              </div>
            </div>

            <button
              type="button"
              id="wts-open-options-gear"
              class="wts-gear-btn"
              title="Opciones de cuenta"
              aria-label="Opciones de cuenta"
            >⚙️</button>
          </div>

          <div class="wts-profile-bottom-bar">
            <div class="wts-club-perks">
              <div class="wts-perk-pill">⚡ -15% VIP</div>
              <div class="wts-perk-pill">✂️ ${user.preferredFit}</div>
              <div class="wts-perk-pill">📏 Talla ${user.preferredSize}</div>
            </div>

            <button type="button" id="wts-logout-btn" class="tl-btn tl-btn--sm tl-btn--coral">
              Cerrar Sesión
            </button>
          </div>
        </div>

        <div class="wts-quick-actions-bar">
          <a href="#recomendaciones" class="tl-btn tl-btn--sm tl-btn--primary" style="width:100%;">
            ✨ Recomendaciones (3)
          </a>
          <a href="#deseados" class="tl-btn tl-btn--sm" style="background:#FFFFFF; width:100%;">
            ♥ Lista de Deseados (${wishCount})
          </a>
          <button type="button" id="wts-quick-scratch-btn" class="tl-btn tl-btn--sm tl-btn--acid" style="width:100%;">
            🎟️ Rasca y Gana
          </button>
        </div>
      </div>
    `;

    document.getElementById('wts-open-options-gear')?.addEventListener('click', () => {
      openAccountOptionsModal('personal');
    });

    document.getElementById('wts-quick-scratch-btn')?.addEventListener('click', () => {
      openScratchModal();
    });

    document.getElementById('wts-logout-btn')?.addEventListener('click', () => {
      logout();
      renderProfilePortal(containerId);
    });
  }

  function init(userConfig = {}) {
    config = { ...DEFAULT_CONFIG, ...userConfig };
    injectLoginModal();
  }

  window.WTS = window.WTS || {};
  window.WTS.UserClub = {
    init,
    getUser,
    isVip,
    getDiscountRate,
    loginDemo,
    loginCustom,
    updateAccountDetails,
    addCardToUser,
    selectUserCard,
    removeUserCard,
    logout,
    getRecommendations,
    openLoginModal,
    closeLoginModal,
    openAccountOptionsModal,
    closeAccountOptionsModal,
    openScratchModal,
    renderProfilePortal
  };
})();
