/**
 * WTSDataEngine — Motor genérico y agnóstico de base de datos en cliente.
 * Barra superior compacta con botón "Filtros" desplegable y botón "Guardar" que pliega el cajón.
 */
(function (global) {
  'use strict';

  class WTSDataEngine {
    constructor(config) {
      this.container = typeof config.container === 'string'
        ? document.querySelector(config.container)
        : config.container;

      this.storageKey = config.storageKey || 'wts_data_engine_records';
      this.seedData = Array.isArray(config.seedData) ? config.seedData : [];
      this.searchFields = Array.isArray(config.searchFields) ? config.searchFields : [];
      this.filters = Array.isArray(config.filters) ? config.filters : [];
      this.sortOptions = Array.isArray(config.sortOptions) ? config.sortOptions : [];
      this.csvColumns = Array.isArray(config.csvColumns) ? config.csvColumns : [];
      this.csvFilename = config.csvFilename || 'export-datos.csv';
      this.renderCard = config.renderCard;
      this.onChange = typeof config.onChange === 'function' ? config.onChange : null;

      this.state = {
        query: '',
        activeFilters: {},
        sortBy: this.sortOptions.length ? this.sortOptions[0].id : '',
        drawerOpen: false
      };

      this.records = this._loadFromStorage();
      this._applyInitialUrlParams();
      this.render();
    }

    _loadFromStorage() {
      try {
        const raw = localStorage.getItem(this.storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (err) {
        console.warn('[WTSDataEngine] Error leyendo localStorage:', err);
      }
      const cloned = JSON.parse(JSON.stringify(this.seedData));
      this._saveToStorage(cloned);
      return cloned;
    }

    _saveToStorage(data) {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
      } catch (err) {
        console.warn('[WTSDataEngine] Error guardando en localStorage:', err);
      }
    }

    _applyInitialUrlParams() {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');
      if (q) this.state.query = q;

      this.filters.forEach((f) => {
        const val = params.get(f.param || f.field);
        if (val) {
          this.state.activeFilters[f.field] = val;
        }
      });
    }

    _countActiveFilters() {
      let count = 0;
      Object.values(this.state.activeFilters).forEach((v) => {
        if (v) count++;
      });
      return count;
    }

    getAll() {
      return [...this.records];
    }

    getById(id) {
      return this.records.find((item) => String(item.id) === String(id)) || null;
    }

    addRecord(record) {
      const item = {
        ...record,
        id: record.id || 'rec_' + Date.now() + '_' + Math.floor(Math.random() * 1000)
      };
      this.records.unshift(item);
      this._commit();
      return item;
    }

    updateRecord(id, patch) {
      const idx = this.records.findIndex((item) => String(item.id) === String(id));
      if (idx === -1) return null;
      this.records[idx] = { ...this.records[idx], ...patch };
      this._commit();
      return this.records[idx];
    }

    deleteRecord(id) {
      this.records = this.records.filter((item) => String(item.id) !== String(id));
      this._commit();
    }

    resetToSeed() {
      this.records = JSON.parse(JSON.stringify(this.seedData));
      this.state.query = '';
      this.state.activeFilters = {};
      this.state.drawerOpen = false;
      this._commit();
    }

    _commit() {
      this._saveToStorage(this.records);
      this.render();
      if (this.onChange) this.onChange(this.records);
    }

    getFilteredRecords() {
      const q = this.state.query.trim().toLowerCase();

      let list = this.records.filter((item) => {
        if (q) {
          const matchesQuery = this.searchFields.some((field) => {
            const val = item[field];
            return val !== undefined && val !== null && String(val).toLowerCase().includes(q);
          });
          if (!matchesQuery) return false;
        }

        for (const filterDef of this.filters) {
          const selectedVal = this.state.activeFilters[filterDef.field];
          if (!selectedVal) continue;

          if (typeof filterDef.predicate === 'function') {
            if (!filterDef.predicate(item, selectedVal)) return false;
          } else if (String(item[filterDef.field]) !== String(selectedVal)) {
            return false;
          }
        }

        return true;
      });

      const activeSort = this.sortOptions.find((s) => s.id === this.state.sortBy);
      if (activeSort && typeof activeSort.compare === 'function') {
        list = [...list].sort(activeSort.compare);
      }

      return list;
    }

    exportCSV() {
      const rows = this.getFilteredRecords();
      if (!rows.length || !this.csvColumns.length) return;

      const escapeCell = (val) => {
        const str = val === undefined || val === null ? '' : String(val);
        return `"${str.replace(/"/g, '""')}"`;
      };

      const headerLine = this.csvColumns.map((col) => escapeCell(col.label)).join(';');
      const dataLines = rows.map((row) =>
        this.csvColumns.map((col) => escapeCell(row[col.field])).join(';')
      );

      const csvContent = '\uFEFF' + [headerLine, ...dataLines].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = this.csvFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    _getFilterOptions(filterDef) {
      if (Array.isArray(filterDef.options)) return filterDef.options;
      const unique = new Set();
      this.records.forEach((r) => {
        if (r[filterDef.field] !== undefined && r[filterDef.field] !== null) {
          unique.add(String(r[filterDef.field]));
        }
      });
      return Array.from(unique).map((v) => ({ value: v, label: v }));
    }

    render() {
      if (!this.container) return;
      const filtered = this.getFilteredRecords();
      const activeCount = this._countActiveFilters();

      const filtersHtml = this.filters.map((f) => {
        const opts = this._getFilterOptions(f);
        const current = this.state.activeFilters[f.field] || '';
        const optionsMarkup = opts.map((o) =>
          `<option value="${o.value}" ${String(o.value) === String(current) ? 'selected' : ''}>${o.label}</option>`
        ).join('');

        return `
          <div class="wts-de-field">
            <label class="wts-de-label" for="wts-filter-${f.field}">${f.label}</label>
            <select class="wts-de-select" id="wts-filter-${f.field}" data-wts-filter="${f.field}">
              <option value="">${f.allLabel || 'Todos'}</option>
              ${optionsMarkup}
            </select>
          </div>
        `;
      }).join('');

      const sortHtml = this.sortOptions.length ? `
        <div class="wts-de-field">
          <label class="wts-de-label" for="wts-sort-select">Ordenar por</label>
          <select class="wts-de-select" id="wts-sort-select">
            ${this.sortOptions.map((s) =>
              `<option value="${s.id}" ${s.id === this.state.sortBy ? 'selected' : ''}>${s.label}</option>`
            ).join('')}
          </select>
        </div>
      ` : '';

      const cardsMarkup = filtered.length
        ? `<div class="wts-de-grid">${filtered.map((item) => this.renderCard(item)).join('')}</div>`
        : `<div class="wts-de-empty">
             <p style="font-weight: 600; color: var(--text-primary); margin-bottom: 0.35rem;">Sin resultados para estos filtros</p>
             <p style="font-size: 0.875rem; margin-bottom: 1rem;">Prueba a restablecer los filtros activos.</p>
             <button type="button" class="wts-de-btn wts-de-btn-primary" data-wts-clear-filters>Ver todos los vehículos</button>
           </div>`;

      this.container.innerHTML = `
        <div class="wts-de-wrapper">
          <div class="wts-de-topbar">
            <div class="wts-de-compact-row">
              <div class="wts-de-search-wrap">
                <input
                  type="search"
                  id="wts-search-input"
                  class="wts-de-input"
                  placeholder="Buscar modelo, motor..."
                  value="${this.state.query.replace(/"/g, '&quot;')}"
                  aria-label="Buscar vehículos"
                >
              </div>

              <button
                type="button"
                class="wts-de-filter-toggle ${this.state.drawerOpen ? 'is-open' : ''}"
                id="wts-toggle-drawer"
                aria-expanded="${String(this.state.drawerOpen)}"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <line x1="4" y1="6" x2="20" y2="6"></line>
                  <line x1="7" y1="12" x2="17" y2="12"></line>
                  <line x1="10" y1="18" x2="14" y2="18"></line>
                </svg>
                <span>Filtros</span>
                ${activeCount > 0 ? `<span class="wts-de-badge-count">${activeCount}</span>` : ''}
              </button>
            </div>

            <div class="wts-de-drawer ${this.state.drawerOpen ? 'is-open' : ''}" id="wts-filter-drawer">
              <div class="wts-de-controls-grid">
                ${filtersHtml}
                ${sortHtml}
              </div>

              <div class="wts-de-drawer-footer">
                <div style="display: flex; gap: 0.5rem;">
                  <button type="button" class="wts-de-btn" data-wts-clear-filters>Limpiar</button>
                  <button type="button" class="wts-de-btn" data-wts-export-csv>CSV</button>
                </div>
                <button type="button" class="wts-de-btn wts-de-btn-primary" id="wts-save-filters">
                  Guardar filtros (${filtered.length})
                </button>
              </div>
            </div>
          </div>

          <div class="wts-de-substatus">
            <span><strong>${filtered.length}</strong> vehículos disponibles</span>
            ${activeCount > 0 || this.state.query
              ? `<button type="button" class="btn-ghost" style="font-size:0.8125rem;font-weight:600;border:none;cursor:pointer;" data-wts-clear-filters>Quitar filtros</button>`
              : `<span>Toca cualquier ficha para ver cuota</span>`
            }
          </div>

          ${cardsMarkup}
        </div>
      `;

      this._bindEvents();
    }

    _bindEvents() {
      const searchInput = this.container.querySelector('#wts-search-input');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          const pos = e.target.selectionStart;
          this.state.query = e.target.value;
          this.render();
          const refreshed = this.container.querySelector('#wts-search-input');
          if (refreshed) {
            refreshed.focus();
            refreshed.setSelectionRange(pos, pos);
          }
        });
      }

      const toggleDrawerBtn = this.container.querySelector('#wts-toggle-drawer');
      if (toggleDrawerBtn) {
        toggleDrawerBtn.addEventListener('click', () => {
          this.state.drawerOpen = !this.state.drawerOpen;
          this.render();
        });
      }

      const saveFiltersBtn = this.container.querySelector('#wts-save-filters');
      if (saveFiltersBtn) {
        saveFiltersBtn.addEventListener('click', () => {
          this.state.drawerOpen = false;
          this.render();
        });
      }

      this.container.querySelectorAll('[data-wts-filter]').forEach((sel) => {
        sel.addEventListener('change', (e) => {
          const field = e.target.getAttribute('data-wts-filter');
          this.state.activeFilters[field] = e.target.value;
          this.render();
        });
      });

      const sortSel = this.container.querySelector('#wts-sort-select');
      if (sortSel) {
        sortSel.addEventListener('change', (e) => {
          this.state.sortBy = e.target.value;
          this.render();
        });
      }

      this.container.querySelectorAll('[data-wts-clear-filters]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.state.query = '';
          this.state.activeFilters = {};
          this.state.drawerOpen = false;
          this.render();
        });
      });

      const csvBtn = this.container.querySelector('[data-wts-export-csv]');
      if (csvBtn) {
        csvBtn.addEventListener('click', () => this.exportCSV());
      }
    }
  }

  global.WTSDataEngine = WTSDataEngine;
})(window);
