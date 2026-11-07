/* ==========================================================================
   MÓDULO AGNÓSTICO: PRINT STUDIO CUSTOMIZER (wts-customizer.js)
   Permite girar vista Frente/Espalda, elegir Sin Gráfico, Sin Serigrafía,
   colores base, parches SVG, ubicación y cálculo de precio en tiempo real.
   ========================================================================== */

(function () {
  'use strict';

  const DEFAULT_CONFIG = {
    mountId: 'wts-customizer-mount',
    basePrice: 34.00,
    customTextSurcharge: 4.50,
    colors: [],
    graphics: [],
    placements: [],
    inkColors: [
      { id: 'ink-dark', name: 'Negro Tinta', hex: '#18181B' },
      { id: 'ink-white', name: 'Blanco Puro', hex: '#FAFAFA' },
      { id: 'ink-yellow', name: 'Amarillo Volt', hex: '#FACC15' },
      { id: 'ink-coral', name: 'Coral Neón', hex: '#F43F5E' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    formatPrice: (n) => `${Number(n).toFixed(2)} €`,
    getVipDiscountRate: () => 0,
    onAddToCart: () => {}
  };

  let config = { ...DEFAULT_CONFIG };
  let state = {
    colorId: null,
    graphicId: 'none',
    placementId: null,
    viewSide: 'front',
    hasText: true,
    customText: 'STUDIO 26',
    inkHex: '#18181B',
    size: 'L',
    fit: 'Oversize'
  };

  function getSelectedColor() {
    return config.colors.find((c) => c.id === state.colorId) || config.colors[0];
  }

  function getSelectedGraphic() {
    if (state.graphicId === 'none') {
      return { id: 'none', name: 'Sin Gráfico', surcharge: 0, svg: '' };
    }
    return config.graphics.find((g) => g.id === state.graphicId) || { id: 'none', name: 'Sin Gráfico', surcharge: 0, svg: '' };
  }

  function getSelectedPlacement() {
    return config.placements.find((p) => p.id === state.placementId) || config.placements[0];
  }

  function calculateTotalPrice() {
    const graphic = getSelectedGraphic();
    const placement = getSelectedPlacement();
    const activeText = state.hasText && state.customText.trim().length > 0;
    const hasAnyPrint = graphic.id !== 'none' || activeText;

    const raw =
      Number(config.basePrice) +
      Number(graphic?.surcharge || 0) +
      (hasAnyPrint ? Number(placement?.surcharge || 0) : 0) +
      (activeText ? Number(config.customTextSurcharge) : 0);

    return Number(raw.toFixed(2));
  }

  function buildShirtSvg(fillHex, isBackView) {
    const stroke = fillHex.toLowerCase() === '#18181b' ? '#3F3F46' : '#18181B';
    const collarPath = isBackView
      ? `<path d="M115 36 Q150 48 185 36" fill="none" stroke="${stroke}" stroke-width="3.5"/>`
      : `<path d="M115 36 Q150 72 185 36" fill="none" stroke="${stroke}" stroke-width="3.5"/>
         <path d="M120 38 Q150 64 180 38" fill="none" stroke="${stroke}" stroke-width="1.5" opacity="0.5"/>`;

    return `
      <svg class="wts-tee-base-svg" viewBox="0 0 300 340" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path
          d="M95 34 L115 36 Q150 56 185 36 L205 34 L276 74 L252 132 L218 114 L218 308 L82 308 L82 114 L48 132 L24 74 Z"
          fill="${fillHex}"
          stroke="#18181B"
          stroke-width="4"
          stroke-linejoin="round"
        />
        ${collarPath}
        <line x1="82" y1="292" x2="218" y2="292" stroke="${stroke}" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.55"/>
      </svg>
    `;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function render() {
    const mount = document.getElementById(config.mountId);
    if (!mount) return;

    const color = getSelectedColor();
    const graphic = getSelectedGraphic();
    const placement = getSelectedPlacement();
    const isBackView = state.viewSide === 'back';
    const placementIsBack = placement.id === 'back-full';
    const showPrintOnCurrentSide = (isBackView && placementIsBack) || (!isBackView && !placementIsBack);

    const activeText = state.hasText && state.customText.trim().length > 0;
    const rawTotal = calculateTotalPrice();
    const vipRate = config.getVipDiscountRate();
    const vipTotal = Number((rawTotal * (1 - vipRate)).toFixed(2));

    mount.innerHTML = `
      <div class="wts-studio-layout">
        <!-- Columna Izquierda: Vista Previa Frente / Espalda -->
        <div class="wts-studio-stage">
          <div class="wts-studio-stage-head">
            <div class="tl-view-switch" role="group" aria-label="Cambiar vista delantera o trasera">
              <button type="button" data-studio-view="front" class="${!isBackView ? 'is-active' : ''}">Frente</button>
              <button type="button" data-studio-view="back" class="${isBackView ? 'is-active' : ''}">Espalda</button>
            </div>
            <span class="tl-tag">${state.fit} · 280 GSM</span>
          </div>

          <div class="wts-studio-canvas">
            <div class="wts-tee-mockup">
              ${buildShirtSvg(color.hex, isBackView)}

              ${showPrintOnCurrentSide ? `
                <div class="wts-print-zone" data-placement="${placement.id}">
                  ${graphic.id !== 'none' ? `<div class="wts-print-graphic">${graphic.svg}</div>` : ''}
                  ${activeText
                    ? `<div class="wts-print-text" style="color:${state.inkHex};">${escapeHtml(state.customText.trim())}</div>`
                    : ''
                  }
                </div>
              ` : `
                <div style="position:absolute; bottom:14px; background:rgba(24,24,27,0.82); color:#FFF; font-size:0.72rem; font-weight:700; padding:0.25rem 0.65rem; border-radius:999px;">
                  Estampado situado en ${placementIsBack ? 'Espalda' : 'Frente'}
                </div>
              `}
            </div>
          </div>

          <div class="wts-studio-specs">
            <span>Color: <strong>${color.name}</strong></span>
            <span>Gráfico: <strong>${graphic.name}</strong></span>
            <span>Serigrafía: <strong>${activeText ? `"${escapeHtml(state.customText.trim())}"` : 'Sin texto'}</strong></span>
          </div>
        </div>

        <!-- Columna Derecha: Controles del Estudio -->
        <div class="wts-studio-controls">
          <!-- 1. Color de Prenda -->
          <div class="wts-control-block">
            <div class="wts-control-title">
              <span>1. Base Algodón Heavyweight</span>
              <span style="font-size:0.78rem; color:var(--ink-secondary);">${color.name}</span>
            </div>
            <div class="wts-color-grid">
              ${config.colors.map((c) => `
                <button
                  type="button"
                  class="wts-color-btn ${c.id === color.id ? 'is-active' : ''}"
                  data-studio-color="${c.id}"
                >
                  <span class="wts-color-dot" style="background:${c.hex};"></span>
                  <span>${c.name}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- 2. Gráfico / Parche SVG (con opción Sin Gráfico) -->
          <div class="wts-control-block">
            <div class="wts-control-title">
              <span>2. Gráfico / Parche Vectorial</span>
              <span style="font-size:0.78rem; color:var(--ink-secondary);">
                ${graphic.surcharge > 0 ? `+${config.formatPrice(graphic.surcharge)}` : 'Sin coste extra'}
              </span>
            </div>
            <div class="wts-graphic-grid">
              <button
                type="button"
                class="wts-graphic-card ${graphic.id === 'none' ? 'is-active' : ''}"
                data-studio-graphic="none"
              >
                <div class="wts-graphic-thumb" style="font-size:1.5rem; font-weight:800; color:var(--ink-muted);">⊘</div>
                <div style="font-weight:800; font-size:0.76rem; line-height:1.15;">Sin Gráfico</div>
                <div style="font-size:0.7rem; color:var(--ink-secondary); font-weight:700;">Lisa / Solo texto</div>
              </button>

              ${config.graphics.map((g) => `
                <button
                  type="button"
                  class="wts-graphic-card ${g.id === graphic.id ? 'is-active' : ''}"
                  data-studio-graphic="${g.id}"
                >
                  <div class="wts-graphic-thumb">${g.svg}</div>
                  <div style="font-weight:800; font-size:0.76rem; line-height:1.15;">${g.name}</div>
                  <div style="font-size:0.7rem; color:var(--ink-secondary); font-weight:700;">
                    ${g.surcharge > 0 ? `+${config.formatPrice(g.surcharge)}` : 'Incluido'}
                  </div>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- 3. Ubicación de Estampación -->
          <div class="wts-control-block">
            <div class="wts-control-title">
              <span>3. Ubicación del Estampado</span>
              <span style="font-size:0.78rem; color:var(--ink-secondary);">
                ${placement.surcharge > 0 ? `+${config.formatPrice(placement.surcharge)}` : 'Incluido'}
              </span>
            </div>
            <div class="wts-placement-grid">
              ${config.placements.map((p) => `
                <button
                  type="button"
                  class="wts-placement-btn ${p.id === placement.id ? 'is-active' : ''}"
                  data-studio-placement="${p.id}"
                >
                  <div>${p.name}</div>
                  <div style="font-size:0.68rem; font-weight:600; opacity:0.85; margin-top:2px;">
                    ${p.surcharge > 0 ? `+${config.formatPrice(p.surcharge)}` : 'Incluido'}
                  </div>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- 4. Frase Serigrafiada con opción Sin Serigrafía -->
          <div class="wts-control-block">
            <div class="wts-control-title">
              <span>4. Frase Serigrafiada</span>
              <button
                type="button"
                id="wts-toggle-text-btn"
                class="tl-tag ${state.hasText ? 'tl-tag--yellow' : ''}"
                style="cursor:pointer;"
              >
                ${state.hasText ? '✕ Quitar Serigrafía' : '+ Añadir Serigrafía'}
              </button>
            </div>

            ${state.hasText ? `
              <div class="wts-text-input-row">
                <input
                  type="text"
                  id="wts-studio-text-input"
                  class="wts-text-input"
                  maxlength="22"
                  placeholder="Escribe tu frase..."
                  value="${escapeHtml(state.customText)}"
                />
                <div class="wts-ink-pills" title="Color de tinta">
                  ${config.inkColors.map((ink) => `
                    <button
                      type="button"
                      class="wts-ink-dot ${ink.hex === state.inkHex ? 'is-active' : ''}"
                      style="background:${ink.hex};"
                      data-studio-ink="${ink.hex}"
                      title="Tinta ${ink.name}"
                    ></button>
                  `).join('')}
                </div>
              </div>
            ` : `
              <div style="padding:0.65rem 0.85rem; background:var(--bg-subtle); border:1.5px dashed var(--border-color); border-radius:10px; font-size:0.8rem; font-weight:600; color:var(--ink-secondary);">
                Sin serigrafía de texto (sin suplemento de +${config.formatPrice(config.customTextSurcharge)}).
              </div>
            `}
          </div>

          <!-- 5. Corte y Talla -->
          <div class="wts-studio-size-row">
            <label class="wts-control-title" style="flex-direction:column; align-items:stretch; gap:0.35rem;">
              <span>Corte</span>
              <select id="wts-studio-fit" class="tl-select">
                <option value="Oversize" ${state.fit === 'Oversize' ? 'selected' : ''}>Oversize 280 GSM</option>
                <option value="Boxy Fit" ${state.fit === 'Boxy Fit' ? 'selected' : ''}>Boxy Fit 280 GSM</option>
              </select>
            </label>

            <label class="wts-control-title" style="flex-direction:column; align-items:stretch; gap:0.35rem;">
              <span>Talla</span>
              <select id="wts-studio-size" class="tl-select">
                ${config.sizes.map((s) => `<option value="${s}" ${state.size === s ? 'selected' : ''}>Talla ${s}</option>`).join('')}
              </select>
            </label>
          </div>

          <!-- Resumen de Precio y Botón Añadir -->
          <div class="wts-price-summary">
            <div>
              <div style="font-size:0.74rem; color:#A1A1AA; text-transform:uppercase; font-weight:700;">
                Precio Pieza Única
              </div>
              <div style="display:flex; align-items:baseline; gap:0.55rem;">
                <span id="wts-studio-live-price" style="font-family:var(--font-display); font-size:1.75rem; font-weight:800; color:#FACC15;">
                  ${config.formatPrice(vipRate > 0 ? vipTotal : rawTotal)}
                </span>
                ${vipRate > 0
                  ? `<span style="font-size:0.85rem; text-decoration:line-through; color:#A1A1AA;">${config.formatPrice(rawTotal)}</span>
                     <span class="tl-tag tl-tag--acid" style="color:#18181B;">-15% VIP</span>`
                  : ''
                }
              </div>
            </div>

            <button type="button" id="wts-studio-add-btn" class="tl-btn tl-btn--acid">
              ✦ Añadir Creación al Carrito
            </button>
          </div>
        </div>
      </div>
    `;

    bindEvents(mount);
  }

  function bindEvents(mount) {
    mount.querySelectorAll('[data-studio-view]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.viewSide = btn.dataset.studioView;
        render();
      });
    });

    mount.querySelectorAll('[data-studio-color]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.colorId = btn.dataset.studioColor;
        const chosen = getSelectedColor();
        if (chosen && chosen.hex.toLowerCase() === '#18181b' && state.inkHex === '#18181B') {
          state.inkHex = '#FACC15';
        }
        render();
      });
    });

    mount.querySelectorAll('[data-studio-graphic]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.graphicId = btn.dataset.studioGraphic;
        render();
      });
    });

    mount.querySelectorAll('[data-studio-placement]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.placementId = btn.dataset.studioPlacement;
        state.viewSide = state.placementId === 'back-full' ? 'back' : 'front';
        render();
      });
    });

    const toggleTextBtn = document.getElementById('wts-toggle-text-btn');
    if (toggleTextBtn) {
      toggleTextBtn.addEventListener('click', () => {
        state.hasText = !state.hasText;
        render();
      });
    }

    mount.querySelectorAll('[data-studio-ink]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.inkHex = btn.dataset.studioInk;
        render();
      });
    });

    const textInput = document.getElementById('wts-studio-text-input');
    if (textInput) {
      textInput.addEventListener('input', (e) => {
        state.customText = e.target.value;
        const zone = mount.querySelector('.wts-print-zone');
        const priceEl = document.getElementById('wts-studio-live-price');
        const rawTotal = calculateTotalPrice();
        const vipRate = config.getVipDiscountRate();
        const finalVal = vipRate > 0 ? Number((rawTotal * (1 - vipRate)).toFixed(2)) : rawTotal;

        if (priceEl) priceEl.textContent = config.formatPrice(finalVal);

        if (zone) {
          let textDiv = zone.querySelector('.wts-print-text');
          if (state.customText.trim()) {
            if (!textDiv) {
              textDiv = document.createElement('div');
              textDiv.className = 'wts-print-text';
              zone.appendChild(textDiv);
            }
            textDiv.style.color = state.inkHex;
            textDiv.textContent = state.customText.trim();
          } else if (textDiv) {
            textDiv.remove();
          }
        }
      });
    }

    const fitSelect = document.getElementById('wts-studio-fit');
    if (fitSelect) {
      fitSelect.addEventListener('change', (e) => {
        state.fit = e.target.value;
        render();
      });
    }

    const sizeSelect = document.getElementById('wts-studio-size');
    if (sizeSelect) {
      sizeSelect.addEventListener('change', (e) => {
        state.size = e.target.value;
      });
    }

    const addBtn = document.getElementById('wts-studio-add-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const color = getSelectedColor();
        const graphic = getSelectedGraphic();
        const placement = getSelectedPlacement();
        const unitPrice = calculateTotalPrice();
        const activeText = state.hasText ? state.customText.trim() : '';

        const titleLabel = graphic.id === 'none'
          ? (activeText ? `Custom "${activeText}" (${color.name})` : `Heavyweight Lisa (${color.name})`)
          : `Custom "${graphic.name}" (${color.name})`;

        config.onAddToCart({
          isCustom: true,
          name: titleLabel,
          size: state.size,
          unitPrice,
          customMeta: {
            colorName: color.name,
            colorHex: color.hex,
            graphicName: graphic.name,
            placement: (graphic.id === 'none' && !activeText) ? 'Sin estampado' : placement.name,
            customText: activeText,
            fit: state.fit
          }
        });
      });
    }
  }

  function init(userConfig = {}) {
    config = { ...DEFAULT_CONFIG, ...userConfig };
    state.colorId = config.colors[0]?.id || null;
    state.graphicId = config.graphics[0]?.id || 'none';
    state.placementId = config.placements[1]?.id || config.placements[0]?.id || null;
    state.viewSide = state.placementId === 'back-full' ? 'back' : 'front';
    render();
    document.addEventListener('wts:user-changed', render);
  }

  window.WTS = window.WTS || {};
  window.WTS.Customizer = {
    init,
    render
  };
})();
