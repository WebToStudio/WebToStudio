/**
 * WTSCompare — Comparador técnico lado a lado estilo Apple Compare.
 * Adapta las columnas exactamente al número de vehículos (2 o 3) sin scroll horizontal.
 */
(function (global) {
  'use strict';

  class WTSCompare {
    constructor(config) {
      this.container = typeof config.container === 'string'
        ? document.querySelector(config.container)
        : config.container;

      this.maxItems = config.maxItems || 3;
      this.titleField = config.titleField || 'title';
      this.imageField = config.imageField || 'image';
      this.rows = Array.isArray(config.rows) ? config.rows : [];
      this.onSelectionChange = typeof config.onSelectionChange === 'function'
        ? config.onSelectionChange
        : null;

      this.selectedItems = [];
      this.isModalOpen = false;
      this.render();
    }

    has(id) {
      return this.selectedItems.some((item) => String(item.id) === String(id));
    }

    toggle(record) {
      if (!record) return false;
      if (this.has(record.id)) {
        this.remove(record.id);
        return false;
      }
      if (this.selectedItems.length >= this.maxItems) {
        alert(`Puedes comparar un máximo de ${this.maxItems} vehículos a la vez.`);
        return false;
      }
      this.selectedItems.push(record);
      this._notify();
      this.render();
      return true;
    }

    syncRecords(latestRecords) {
      if (!Array.isArray(latestRecords)) return;
      this.selectedItems = this.selectedItems
        .map((sel) => latestRecords.find((r) => String(r.id) === String(sel.id)))
        .filter(Boolean);
      this.render();
    }

    remove(id) {
      this.selectedItems = this.selectedItems.filter((item) => String(item.id) !== String(id));
      if (this.selectedItems.length < 2) {
        this.isModalOpen = false;
      }
      this._notify();
      this.render();
    }

    clear() {
      this.selectedItems = [];
      this.isModalOpen = false;
      this._notify();
      this.render();
    }

    _notify() {
      if (this.onSelectionChange) {
        this.onSelectionChange(this.selectedItems.map((i) => i.id));
      }
    }

    _findBestIds(rowDef) {
      if (!rowDef.best || this.selectedItems.length < 2) return new Set();

      const numericPairs = this.selectedItems
        .map((item) => ({ id: item.id, val: Number(item[rowDef.field]) }))
        .filter((p) => !Number.isNaN(p.val));

      if (numericPairs.length < 2) return new Set();

      const targetVal = rowDef.best === 'min'
        ? Math.min(...numericPairs.map((p) => p.val))
        : Math.max(...numericPairs.map((p) => p.val));

      const allEqual = numericPairs.every((p) => p.val === targetVal);
      if (allEqual) return new Set();

      return new Set(numericPairs.filter((p) => p.val === targetVal).map((p) => String(p.id)));
    }

    render() {
      if (!this.container) return;

      if (!this.selectedItems.length) {
        this.container.innerHTML = '';
        return;
      }

      const chipsHtml = this.selectedItems.map((item) => `
        <span class="wts-cmp-chip">
          <span>${item[this.titleField]}</span>
          <button type="button" data-wts-cmp-remove="${item.id}" aria-label="Quitar">✕</button>
        </span>
      `).join('');

      const dockHtml = `
        <div class="wts-cmp-dock" role="region" aria-label="Barra de comparación">
          <div class="wts-cmp-items">
            <span style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #A1A1A6;">
              Comparar (${this.selectedItems.length}/${this.maxItems}):
            </span>
            ${chipsHtml}
          </div>
          <div class="wts-cmp-actions">
            <button type="button" class="wts-cmp-btn wts-cmp-btn-ghost" data-wts-cmp-clear>Vaciar</button>
            <button
              type="button"
              class="wts-cmp-btn wts-cmp-btn-primary"
              data-wts-cmp-open
              ${this.selectedItems.length < 2 ? 'disabled style="opacity:0.45;cursor:not-allowed;"' : ''}
            >
              Comparar (${this.selectedItems.length})
            </button>
          </div>
        </div>
      `;

      let modalHtml = '';
      if (this.isModalOpen && this.selectedItems.length >= 2) {
        const colsTemplate = `repeat(${this.selectedItems.length}, minmax(0, 1fr))`;

        const carsHeaderHtml = this.selectedItems.map((item) => `
          <div class="wts-cmp-car-head">
            ${item[this.imageField] ? `<img src="${item[this.imageField]}" alt="${item[this.titleField]}">` : ''}
            <div class="wts-cmp-car-title">${item[this.titleField]}</div>
          </div>
        `).join('');

        const groupsHtml = this.rows.map((row) => {
          const bestSet = this._findBestIds(row);
          const valsHtml = this.selectedItems.map((item) => {
            const rawVal = item[row.field];
            const formatted = typeof row.format === 'function' ? row.format(rawVal, item) : rawVal;
            const isBest = bestSet.has(String(item.id));
            return `
              <div class="wts-cmp-val-box ${isBest ? 'is-best' : ''}">
                <span>${formatted}</span>
                ${isBest ? '<span class="wts-cmp-best-pill">Mejor</span>' : ''}
              </div>
            `;
          }).join('');

          return `
            <div class="wts-cmp-spec-group">
              <div class="wts-cmp-spec-label">${row.label}</div>
              <div class="wts-cmp-spec-values" style="grid-template-columns: ${colsTemplate};">
                ${valsHtml}
              </div>
            </div>
          `;
        }).join('');

        modalHtml = `
          <div class="wts-cmp-backdrop" id="wts-cmp-backdrop">
            <div class="wts-cmp-modal" role="dialog" aria-modal="true" aria-label="Comparativa de vehículos">
              <div class="wts-cmp-modal-head">
                <h3 style="font-size: 1.05rem; font-weight: 600;">Comparativa Técnica</h3>
                <button type="button" class="btn btn-outline btn-sm" data-wts-cmp-close>Cerrar ✕</button>
              </div>

              <div class="wts-cmp-sticky-cars" style="grid-template-columns: ${colsTemplate};">
                ${carsHeaderHtml}
              </div>

              <div class="wts-cmp-specs-list">
                ${groupsHtml}
              </div>
            </div>
          </div>
        `;
      }

      this.container.innerHTML = dockHtml + modalHtml;
      this._bindEvents();
    }

    _bindEvents() {
      this.container.querySelectorAll('[data-wts-cmp-remove]').forEach((btn) => {
        btn.addEventListener('click', () => this.remove(btn.getAttribute('data-wts-cmp-remove')));
      });

      const clearBtn = this.container.querySelector('[data-wts-cmp-clear]');
      if (clearBtn) clearBtn.addEventListener('click', () => this.clear());

      const openBtn = this.container.querySelector('[data-wts-cmp-open]');
      if (openBtn && this.selectedItems.length >= 2) {
        openBtn.addEventListener('click', () => {
          this.isModalOpen = true;
          this.render();
        });
      }

      const closeBtn = this.container.querySelector('[data-wts-cmp-close]');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          this.isModalOpen = false;
          this.render();
        });
      }

      const backdrop = this.container.querySelector('#wts-cmp-backdrop');
      if (backdrop) {
        backdrop.addEventListener('click', (e) => {
          if (e.target === backdrop) {
            this.isModalOpen = false;
            this.render();
          }
        });
      }
    }
  }

  global.WTSCompare = WTSCompare;
})(window);
