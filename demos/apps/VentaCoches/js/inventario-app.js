/**
 * AutoSelect Enterprise — Orquestador de Inventario
 */
(function () {
  'use strict';

  const INITIAL_VEHICLES = [
    {
      id: 'veh-01',
      title: 'Polestar 2 Long Range Dual Motor',
      price: 46900,
      km: 1850,
      status: 'KM 0',
      fuel: 'Eléctrico',
      transmission: 'Automático',
      topSpeed: 205,
      power: 408,
      year: 2025,
      image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=900&q=80',
      history: 'Sin siniestros • Batería 82 kWh con SoH certificado al 99,8% • Garantía oficial fabricante hasta 2028'
    },
    {
      id: 'veh-02',
      title: 'BMW 330e M Sport Touring',
      price: 42500,
      km: 18400,
      status: 'Seminuevo',
      fuel: 'Híbrido',
      transmission: 'Automático',
      topSpeed: 230,
      power: 292,
      year: 2024,
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=900&q=80',
      history: 'Sin siniestros • Revisión oficial 15.000 km pasada en concesionario BMW • Cable Modo 2 y Modo 3 incluidos'
    },
    {
      id: 'veh-03',
      title: 'Audi Q5 Sportback 40 TDI quattro',
      price: 44800,
      km: 34200,
      status: 'Ocasión Certificado',
      fuel: 'Diésel',
      transmission: 'Automático',
      topSpeed: 222,
      power: 204,
      year: 2023,
      image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=900&q=80',
      history: 'Sin siniestros • Revisión oficial 30.000 km con cambio de aceite S tronic • Neumáticos Michelin CrossClimate nuevos'
    },
    {
      id: 'veh-04',
      title: 'Tesla Model Y Performance AWD',
      price: 48200,
      km: 14900,
      status: 'Seminuevo',
      fuel: 'Eléctrico',
      transmission: 'Automático',
      topSpeed: 250,
      power: 534,
      year: 2024,
      image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=900&q=80',
      history: 'Sin siniestros • Hardware 4 (HW4) • Diagnóstico térmico y batería de alto voltaje certificado al 98,9%'
    },
    {
      id: 'veh-05',
      title: 'Mercedes-Benz C 220 d AMG Line',
      price: 39400,
      km: 41600,
      status: 'Ocasión Certificado',
      fuel: 'Diésel',
      transmission: 'Automático',
      topSpeed: 245,
      power: 200,
      year: 2023,
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=900&q=80',
      history: 'Sin siniestros • Libro digital Digital Service Booklet completo • Pastillas y discos delanteros recién sustituidos'
    },
    {
      id: 'veh-06',
      title: 'Volvo XC60 Recharge T6 Core',
      price: 45900,
      km: 22100,
      status: 'Seminuevo',
      fuel: 'Híbrido',
      transmission: 'Automático',
      topSpeed: 180,
      power: 350,
      year: 2024,
      image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=900&q=80',
      history: 'Sin siniestros • Revisión oficial Volvo Selekt pasada • Sistema Google Automotive actualizado a última versión'
    },
    {
      id: 'veh-07',
      title: 'Cupra Formentor VZ 2.0 TSI 310 CV',
      price: 36800,
      km: 27500,
      status: 'Ocasión Certificado',
      fuel: 'Gasolina',
      transmission: 'Automático',
      topSpeed: 250,
      power: 310,
      year: 2023,
      image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=900&q=80',
      history: 'Sin siniestros • Mantenimiento Haldex 4Drive y cambio DSG realizados • Frenos Brembo al 85% de vida útil'
    },
    {
      id: 'veh-08',
      title: 'Hyundai IONIQ 5 Star 77.4 kWh RWD',
      price: 37900,
      km: 3200,
      status: 'KM 0',
      fuel: 'Eléctrico',
      transmission: 'Automático',
      topSpeed: 185,
      power: 229,
      year: 2025,
      image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=900&q=80',
      history: 'Sin siniestros • Arquitectura ultrarrápida 800V verificada • Incluye adaptador V2L y garantía oficial 5 años'
    },
    {
      id: 'veh-09',
      title: 'Mazda MX-5 RF 2.0 Skyactiv-G Zenith',
      price: 29500,
      km: 19800,
      status: 'Reservado',
      fuel: 'Gasolina',
      transmission: 'Manual',
      topSpeed: 220,
      power: 184,
      year: 2023,
      image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=900&q=80',
      history: 'Sin siniestros • Revisión oficial 20.000 km recién pasada • Diferencial autoblocante y suspensión Bilstein auditados'
    },
    {
      id: 'veh-10',
      title: 'Volkswagen Golf GTI Clubsport 2.0 TSI',
      price: 35400,
      km: 29400,
      status: 'Seminuevo',
      fuel: 'Gasolina',
      transmission: 'Automático',
      topSpeed: 250,
      power: 300,
      year: 2023,
      image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=900&q=80',
      history: 'Sin siniestros • Revisión oficial VW 30.000 km completada • Neumáticos Bridgestone Potenza Sport nuevos'
    }
  ];

  const isAdminMode = new URLSearchParams(window.location.search).get('admin') === '1';
  let engine = null;
  let comparator = null;

  function statusPillClass(status) {
    if (status === 'KM 0') return 'status-pill is-km0';
    if (status === 'Ocasión Certificado') return 'status-pill is-cert';
    if (status === 'Reservado') return 'status-pill is-reserved';
    return 'status-pill';
  }

  function formatEur(n) {
    return Number(n).toLocaleString('es-ES') + ' €';
  }

  function renderVehicleCard(item) {
    const isCompared = comparator && comparator.has(item.id);
    const adminControls = isAdminMode ? `
      <div style="display: flex; gap: 0.4rem; margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px dashed var(--border-color);">
        <button type="button" class="wts-de-btn" data-action="edit" data-id="${item.id}">Editar</button>
        <button type="button" class="wts-de-btn wts-de-btn-danger" data-action="delete" data-id="${item.id}">Eliminar</button>
      </div>
    ` : '';

    return `
      <article class="wts-de-card" data-card-id="${item.id}" style="cursor: pointer; border: 1px solid var(--border-color); border-radius: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.05);">
        <div>
          <div class="vehicle-card-img">
            <span class="${statusPillClass(item.status)}">${item.status}</span>
            <img
              src="${item.image}"
              alt="${item.title}"
              loading="lazy"
            >
          </div>
          <div class="card-body" style="padding-bottom: 0.65rem;">
            <h3 style="font-size: 1.0625rem; font-weight: 600; line-height: 1.3;">${item.title}</h3>
            <div class="card-meta">
              <span>${item.year}</span> ·
              <span>${Number(item.km).toLocaleString('es-ES')} km</span> ·
              <span>${item.fuel}</span> ·
              <span>${item.power} CV</span>
            </div>
          </div>
        </div>

        <div class="card-body" style="padding-top: 0;">
          <div class="card-price-row">
            <div>
              <span style="font-size: 0.7rem; color: var(--text-muted); display: block;">Contado IVA incl.</span>
              <span class="price-tag">${formatEur(item.price)}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.45rem;">
              <button
                type="button"
                class="wts-de-btn ${isCompared ? 'wts-de-btn-primary' : ''}"
                data-action="compare"
                data-id="${item.id}"
                title="Añadir al comparador"
              >
                ${isCompared ? '✓ Comparando' : '+ Comparar'}
              </button>
              <button type="button" class="btn btn-primary btn-sm" data-action="detail" data-id="${item.id}">
                Ver ficha
              </button>
            </div>
          </div>
          ${adminControls}
        </div>
      </article>
    `;
  }

  function openDetailModal(id) {
    if (!engine) return;
    const vehicle = engine.getById(id);
    if (!vehicle) return;

    const modal = document.getElementById('vehicle-detail-modal');
    const titleEl = document.getElementById('detail-modal-title');
    const badgeEl = document.getElementById('detail-modal-badge');
    const bodyEl = document.getElementById('vehicle-detail-body');

    badgeEl.textContent = `${vehicle.status} · ${vehicle.year}`;
    titleEl.textContent = vehicle.title;

    bodyEl.innerHTML = `
      <div class="grid-2" style="gap: 1.25rem; align-items: start;">
        <div>
          <img
            src="${vehicle.image}"
            alt="${vehicle.title}"
            loading="lazy"
            style="width: 100%; aspect-ratio: 16/10; object-fit: cover; border-radius: 12px;"
          >
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.65rem;">
            <span style="font-size: 0.8125rem; color: var(--text-secondary);">Precio al contado</span>
            <span style="font-size: 1.75rem; font-weight: 700; letter-spacing: -0.03em;">${formatEur(vehicle.price)}</span>
          </div>

          <div class="spec-grid">
            <div class="spec-cell">
              <span class="spec-cell-label">Kilómetros</span>
              <span class="spec-cell-value">${Number(vehicle.km).toLocaleString('es-ES')} km</span>
            </div>
            <div class="spec-cell">
              <span class="spec-cell-label">Combustible</span>
              <span class="spec-cell-value">${vehicle.fuel}</span>
            </div>
            <div class="spec-cell">
              <span class="spec-cell-label">Cambio</span>
              <span class="spec-cell-value">${vehicle.transmission}</span>
            </div>
            <div class="spec-cell">
              <span class="spec-cell-label">Año</span>
              <span class="spec-cell-value">${vehicle.year}</span>
            </div>
            <div class="spec-cell">
              <span class="spec-cell-label">Potencia</span>
              <span class="spec-cell-value">${vehicle.power} CV</span>
            </div>
            <div class="spec-cell">
              <span class="spec-cell-label">Vel. Máxima</span>
              <span class="spec-cell-value">${vehicle.topSpeed} km/h</span>
            </div>
            <div class="spec-cell" style="grid-column: span 2;">
              <span class="spec-cell-label">Estado</span>
              <span class="spec-cell-value">${vehicle.status}</span>
            </div>
          </div>

          <div style="background: var(--bg-page); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 0.85rem; margin-bottom: 1rem;">
            <span class="spec-cell-label" style="margin-bottom: 0.25rem;">Historial y Revisiones Oficiales</span>
            <p style="font-size: 0.875rem; color: var(--text-primary); font-weight: 500;">${vehicle.history}</p>
          </div>

          <button type="button" id="btn-toggle-testdrive" class="btn btn-dark" style="width: 100%;">
            Reservar Prueba de Conducción
          </button>

          <form id="testdrive-inline-form" style="display: none; margin-top: 0.85rem; padding: 0.9rem; border: 1px solid var(--border-color); border-radius: 10px; background: #FFFFFF;">
            <div style="display: grid; grid-template-columns: 1fr; gap: 0.65rem; margin-bottom: 0.65rem;">
              <input type="text" id="td-name" class="field-control" required placeholder="Nombre completo">
              <input type="tel" id="td-phone" class="field-control" required placeholder="Teléfono móvil">
            </div>
            <div style="display: grid; grid-template-columns: 1fr auto; gap: 0.65rem;">
              <select id="td-hub" class="field-control">
                <option value="Madrid — Alcobendas">Hub Madrid — Alcobendas</option>
                <option value="Barcelona — Zona Franca">Hub Barcelona — Zona Franca</option>
                <option value="Sevilla — Torneo">Hub Sevilla — Torneo</option>
              </select>
              <button type="submit" class="btn btn-primary btn-sm">Confirmar</button>
            </div>
          </form>
          <div id="testdrive-feedback"></div>
        </div>
      </div>

      <div style="margin-top: 1.35rem;" id="detail-finance-host"></div>
    `;

    new WTSFinance({
      container: document.getElementById('detail-finance-host'),
      amount: vehicle.price,
      minMonths: 24,
      maxMonths: 84,
      stepMonths: 12,
      defaultMonths: 60,
      defaultTin: 5.95
    });

    const toggleTdBtn = document.getElementById('btn-toggle-testdrive');
    const tdForm = document.getElementById('testdrive-inline-form');
    toggleTdBtn.addEventListener('click', () => {
      tdForm.style.display = tdForm.style.display === 'none' ? 'block' : 'none';
    });

    tdForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('td-name').value.trim();
      const hub = document.getElementById('td-hub').value;
      tdForm.style.display = 'none';
      document.getElementById('testdrive-feedback').innerHTML = `
        <div class="alert alert-success">
          Prueba solicitada para <strong>${vehicle.title}</strong> en <strong>${hub}</strong>. Te llamaremos en menos de 2h, ${name}.
        </div>
      `;
    });

    modal.scrollTop = 0;
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeDetailModal() {
    const modal = document.getElementById('vehicle-detail-modal');
    if (modal) modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function openFormModal(vehicleToEdit) {
    const modal = document.getElementById('vehicle-form-modal');
    const titleEl = document.getElementById('form-modal-title');
    const form = document.getElementById('vehicle-crud-form');

    form.reset();

    if (vehicleToEdit) {
      titleEl.textContent = 'Editar Unidad';
      document.getElementById('vf-id').value = vehicleToEdit.id;
      document.getElementById('vf-title').value = vehicleToEdit.title;
      document.getElementById('vf-price').value = vehicleToEdit.price;
      document.getElementById('vf-status').value = vehicleToEdit.status;
      document.getElementById('vf-year').value = vehicleToEdit.year;
      document.getElementById('vf-km').value = vehicleToEdit.km;
      document.getElementById('vf-fuel').value = vehicleToEdit.fuel;
      document.getElementById('vf-transmission').value = vehicleToEdit.transmission;
      document.getElementById('vf-power').value = vehicleToEdit.power;
      document.getElementById('vf-topSpeed').value = vehicleToEdit.topSpeed;
      document.getElementById('vf-image').value = vehicleToEdit.image;
      document.getElementById('vf-history').value = vehicleToEdit.history;
    } else {
      titleEl.textContent = 'Añadir Nuevo Vehículo';
      document.getElementById('vf-id').value = '';
      document.getElementById('vf-image').value =
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80';
    }

    modal.scrollTop = 0;
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeFormModal() {
    const modal = document.getElementById('vehicle-form-modal');
    if (modal) modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function initInventarioApp() {
    const rootEl = document.getElementById('wts-inventory-root');
    if (!rootEl) return;

    if (isAdminMode) {
      const adminBar = document.getElementById('admin-toolbar-actions');
      if (adminBar) adminBar.style.display = 'flex';
    }

    if (typeof WTSDataEngine === 'undefined' || typeof WTSCompare === 'undefined' || typeof WTSFinance === 'undefined') {
      return;
    }

    comparator = new WTSCompare({
      container: '#wts-compare-root',
      maxItems: 3,
      titleField: 'title',
      imageField: 'image',
      rows: [
        { label: 'Precio al contado', field: 'price', best: 'min', format: (v) => formatEur(v) },
        { label: 'Estado', field: 'status' },
        { label: 'Año', field: 'year', best: 'max' },
        { label: 'Kilómetros', field: 'km', best: 'min', format: (v) => `${Number(v).toLocaleString('es-ES')} km` },
        { label: 'Combustible', field: 'fuel' },
        { label: 'Cambio', field: 'transmission' },
        { label: 'Potencia', field: 'power', best: 'max', format: (v) => `${v} CV` },
        { label: 'Velocidad máxima', field: 'topSpeed', best: 'max', format: (v) => `${v} km/h` },
        { label: 'Historial técnico', field: 'history' }
      ],
      onSelectionChange: () => {
        if (engine) engine.render();
      }
    });

    engine = new WTSDataEngine({
      container: '#wts-inventory-root',
      storageKey: 'autoselect_enterprise_inventory_v4',
      seedData: INITIAL_VEHICLES,
      searchFields: ['title', 'fuel', 'status', 'transmission', 'history'],
      filters: [
        {
          field: 'fuel',
          param: 'fuel',
          label: 'Combustible',
          allLabel: 'Todos',
          options: [
            { value: 'Eléctrico', label: 'Eléctrico' },
            { value: 'Híbrido', label: 'Híbrido' },
            { value: 'Gasolina', label: 'Gasolina' },
            { value: 'Diésel', label: 'Diésel' }
          ]
        },
        {
          field: 'status',
          param: 'status',
          label: 'Estado',
          allLabel: 'Todos',
          options: [
            { value: 'KM 0', label: 'KM 0' },
            { value: 'Seminuevo', label: 'Seminuevo' },
            { value: 'Ocasión Certificado', label: 'Ocasión Certificado' },
            { value: 'Reservado', label: 'Reservado' }
          ]
        },
        {
          field: 'transmission',
          param: 'transmission',
          label: 'Cambio',
          allLabel: 'Todos',
          options: [
            { value: 'Automático', label: 'Automático' },
            { value: 'Manual', label: 'Manual' }
          ]
        }
      ],
      sortOptions: [
        { id: 'price-asc', label: 'Precio: menor a mayor', compare: (a, b) => a.price - b.price },
        { id: 'price-desc', label: 'Precio: mayor a menor', compare: (a, b) => b.price - a.price },
        { id: 'km-asc', label: 'Kilómetros: menor a mayor', compare: (a, b) => a.km - b.km },
        { id: 'power-desc', label: 'Potencia: mayor a menor', compare: (a, b) => b.power - a.power },
        { id: 'year-desc', label: 'Año: más reciente', compare: (a, b) => b.year - a.year }
      ],
      csvColumns: [
        { field: 'id', label: 'ID' },
        { field: 'title', label: 'Modelo' },
        { field: 'status', label: 'Estado' },
        { field: 'price', label: 'Precio_EUR' },
        { field: 'year', label: 'Año' },
        { field: 'km', label: 'Kilómetros' },
        { field: 'fuel', label: 'Combustible' },
        { field: 'transmission', label: 'Cambio' },
        { field: 'power', label: 'Potencia_CV' },
        { field: 'topSpeed', label: 'Vel_Max_kmh' },
        { field: 'history', label: 'Historial' }
      ],
      csvFilename: 'inventario-autoselect-enterprise.csv',
      renderCard: renderVehicleCard,
      onChange: (records) => {
        comparator.syncRecords(records);
      }
    });

    rootEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (btn) {
        const action = btn.getAttribute('data-action');
        const id = btn.getAttribute('data-id');

        if (action === 'detail') {
          openDetailModal(id);
        } else if (action === 'compare') {
          const item = engine.getById(id);
          comparator.toggle(item);
        } else if (action === 'edit' && isAdminMode) {
          const item = engine.getById(id);
          openFormModal(item);
        } else if (action === 'delete' && isAdminMode) {
          const item = engine.getById(id);
          if (item && confirm(`¿Eliminar "${item.title}" del inventario?`)) {
            comparator.remove(id);
            engine.deleteRecord(id);
          }
        }
        return;
      }

      const card = e.target.closest('[data-card-id]');
      if (card) {
        openDetailModal(card.getAttribute('data-card-id'));
      }
    });

    const createBtn = document.getElementById('btn-open-create-vehicle');
    if (createBtn) createBtn.addEventListener('click', () => openFormModal(null));

    const resetBtn = document.getElementById('btn-reset-demo-stock');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        comparator.clear();
        engine.resetToSeed();
      });
    }

    document.getElementById('vehicle-crud-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('vf-id').value;
      const payload = {
        title: document.getElementById('vf-title').value.trim(),
        price: Number(document.getElementById('vf-price').value),
        status: document.getElementById('vf-status').value,
        year: Number(document.getElementById('vf-year').value),
        km: Number(document.getElementById('vf-km').value),
        fuel: document.getElementById('vf-fuel').value,
        transmission: document.getElementById('vf-transmission').value,
        power: Number(document.getElementById('vf-power').value),
        topSpeed: Number(document.getElementById('vf-topSpeed').value),
        image: document.getElementById('vf-image').value.trim() ||
          'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80',
        history: document.getElementById('vf-history').value.trim()
      };

      if (id) {
        engine.updateRecord(id, payload);
      } else {
        engine.addRecord(payload);
      }
      closeFormModal();
    });

    const detailModal = document.getElementById('vehicle-detail-modal');
    const formModal = document.getElementById('vehicle-form-modal');

    document.getElementById('close-detail-modal').addEventListener('click', closeDetailModal);
    detailModal.addEventListener('click', (e) => {
      if (e.target === detailModal) closeDetailModal();
    });

    document.getElementById('close-form-modal').addEventListener('click', closeFormModal);
    document.getElementById('cancel-form-modal').addEventListener('click', closeFormModal);
    formModal.addEventListener('click', (e) => {
      if (e.target === formModal) closeFormModal();
    });

    const preselectedVehicle = new URLSearchParams(window.location.search).get('vehicle');
    if (preselectedVehicle) {
      openDetailModal(preselectedVehicle);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInventarioApp);
  } else {
    initInventarioApp();
  }
})();
