(function () {
  'use strict';

  /**
   * Motor Agnóstico de Pacientes, Fichas Clínicas y Notas de Evolución (WtsClinical)
   */
  class WtsClinical {
    constructor(options) {
      this.container = options.container;
      this.storageKey = options.storageKey || 'wts_clinical_records';
      this.eventsStorageKey = options.eventsStorageKey || 'wts_calendar_events';
      this.areaLabels = options.areaLabels || {};
      this.currentAuthor = options.currentAuthor || 'Especialista';
      this.linkedResourceId = options.linkedResourceId || 'all';
      this.detailPageUrl = options.detailPageUrl || 'paciente-ficha.html';
      this.directoryPageUrl = options.directoryPageUrl || 'especialistas.html';
      this.searchTerm = '';
    }

    _getRecords() {
      try {
        return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      } catch (e) {
        return [];
      }
    }

    _saveRecords(records) {
      localStorage.setItem(this.storageKey, JSON.stringify(records));
    }

    _getEvents() {
      try {
        return JSON.parse(localStorage.getItem(this.eventsStorageKey) || '[]');
      } catch (e) {
        return [];
      }
    }

    _syncPatientsFromEvents() {
      const events = this._getEvents();
      const records = this._getRecords();
      let changed = false;

      events.forEach((ev) => {
        if (!ev.patientName) return;
        const key = (ev.patientEmail || ev.patientName).toLowerCase().trim();
        let rec = records.find((r) => r.patientKey === key);
        if (!rec) {
          rec = {
            patientKey: key,
            patientName: ev.patientName,
            patientEmail: ev.patientEmail || '',
            patientPhone: ev.patientPhone || '',
            sport: ev.notes || 'Deportista / Paciente Centro',
            assignedResourceIds: ev.resourceId ? [ev.resourceId] : [],
            entries: []
          };
          records.push(rec);
          changed = true;
        } else if (ev.resourceId) {
          rec.assignedResourceIds = Array.isArray(rec.assignedResourceIds) ? rec.assignedResourceIds : [];
          if (!rec.assignedResourceIds.includes(ev.resourceId)) {
            rec.assignedResourceIds.push(ev.resourceId);
            changed = true;
          }
        }
      });

      if (changed) {
        this._saveRecords(records);
      }
    }

    _getSpecialistPatients() {
      this._syncPatientsFromEvents();
      const records = this._getRecords();
      if (!this.linkedResourceId || this.linkedResourceId === 'all') {
        return records;
      }
      return records.filter((rec) => {
        const assigned = Array.isArray(rec.assignedResourceIds) ? rec.assignedResourceIds : [];
        return assigned.includes(this.linkedResourceId) || assigned.length === 0;
      });
    }

    /* =====================================================================
       1. DIRECTORIO DE PACIENTES DEL ESPECIALISTA + BOTÓN "+ NUEVO PACIENTE"
       ===================================================================== */
    renderPatientDirectory() {
      if (!this.container) return;
      const patients = this._getSpecialistPatients();
      const filtered = this.searchTerm
        ? patients.filter(
            (p) =>
              p.patientName.toLowerCase().includes(this.searchTerm) ||
              (p.sport || '').toLowerCase().includes(this.searchTerm) ||
              (p.patientEmail || '').toLowerCase().includes(this.searchTerm)
          )
        : patients;

      const cardsHtml =
        filtered.length > 0
          ? filtered
              .map((p) => {
                const initials = p.patientName
                  .split(' ')
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase();
                const lastEntry = p.entries && p.entries.length > 0 ? p.entries[0] : null;

                return `
                  <article class="wts-clin-patient-card" data-open-patient="${encodeURIComponent(p.patientKey)}">
                    <div>
                      <div class="wts-clin-patient-card__top">
                        <div class="wts-clin-avatar">${initials}</div>
                        <div style="min-width:0;">
                          <h3 style="font-size:1rem;margin-bottom:0.15rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                            ${p.patientName}
                          </h3>
                          <span class="wts-clin-sport-tag">${p.sport || 'Seguimiento Clínico'}</span>
                        </div>
                      </div>

                      <div style="font-size:0.78rem;color:#64748B;margin:0.65rem 0;">
                        📞 ${p.patientPhone || 'Sin teléfono'} · 📧 ${p.patientEmail || 'Sin email'}
                      </div>

                      <div class="wts-clin-patient-card__preview">
                        ${
                          lastEntry
                            ? `<strong>Última entrada (${lastEntry.date}):</strong> ${lastEntry.diagnosis}`
                            : `<strong>Motivo inicial:</strong> Pendiente de primera valoración`
                        }
                      </div>
                    </div>

                    <div class="wts-clin-patient-card__foot">
                      <span>${p.entries.length} nota(s) en ficha</span>
                      <span style="color:#0284C7;">Abrir ficha completa →</span>
                    </div>
                  </article>
                `;
              })
              .join('')
          : `<p style="color:#64748B;font-size:0.9rem;">No se encontraron pacientes con ese criterio. Pulsa en "+ Nuevo Paciente" para dar de alta uno.</p>`;

      this.container.innerHTML = `
        <div class="wts-clin-toolbar">
          <input type="search" id="wts-clin-search-input" class="wts-clin-search"
                 placeholder="Buscar paciente por nombre, deporte o correo..." value="${this.searchTerm}" />
          <button type="button" id="wts-clin-new-patient-btn" class="wts-clin-btn">
            + Nuevo Paciente
          </button>
        </div>

        <div class="wts-clin-cards-grid">${cardsHtml}</div>
      `;

      const searchInput = this.container.querySelector('#wts-clin-search-input');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          this.searchTerm = e.target.value.toLowerCase().trim();
          this.renderPatientDirectory();
        });
      }

      const newBtn = this.container.querySelector('#wts-clin-new-patient-btn');
      if (newBtn) {
        newBtn.addEventListener('click', () => this.openNewPatientModal());
      }

      this.container.querySelectorAll('[data-open-patient]').forEach((card) => {
        card.addEventListener('click', () => {
          const encodedKey = card.getAttribute('data-open-patient');
          window.location.href = `${this.detailPageUrl}?patient=${encodedKey}`;
        });
      });
    }

    /* =====================================================================
       2. MODAL "+ NUEVO PACIENTE" + PRIMERA ENTRADA (MOTIVO Y TRATAMIENTO)
       ===================================================================== */
    openNewPatientModal() {
      const areaOptions = Object.keys(this.areaLabels)
        .map((k) => `<option value="${this.areaLabels[k]}">${this.areaLabels[k]}</option>`)
        .join('');

      const backdrop = document.createElement('div');
      backdrop.className = 'wts-clin-modal-backdrop';
      backdrop.innerHTML = `
        <div class="wts-clin-modal" role="dialog" aria-modal="true">
          <div class="wts-clin-modal__head">
            <h3>Alta de Nuevo Paciente y Primera Entrada Clínica</h3>
            <button type="button" style="background:transparent;border:0;color:#CBD5E1;font-size:1.35rem;cursor:pointer;" data-close-modal>&times;</button>
          </div>
          <form id="wts-clin-create-patient-form" style="display:flex;flex-direction:column;min-height:0;">
            <div class="wts-clin-modal__body">
              <div style="font-size:0.76rem;font-weight:700;text-transform:uppercase;color:#0284C7;">
                1. Datos Personales del Paciente
              </div>

              <div class="wts-clin-row-2">
                <div>
                  <label style="display:block;font-size:0.76rem;font-weight:600;margin-bottom:0.2rem;">Nombre y apellidos</label>
                  <input type="text" name="patientName" class="wts-clin-input" placeholder="Ej. Álvaro Mendoza" required />
                </div>
                <div>
                  <label style="display:block;font-size:0.76rem;font-weight:600;margin-bottom:0.2rem;">Teléfono</label>
                  <input type="tel" name="patientPhone" class="wts-clin-input" placeholder="+34 600 000 000" required />
                </div>
              </div>

              <div class="wts-clin-row-2">
                <div>
                  <label style="display:block;font-size:0.76rem;font-weight:600;margin-bottom:0.2rem;">Correo electrónico</label>
                  <input type="email" name="patientEmail" class="wts-clin-input" placeholder="alvaro@correo.com" required />
                </div>
                <div>
                  <label style="display:block;font-size:0.76rem;font-weight:600;margin-bottom:0.2rem;">Deporte / Actividad</label>
                  <input type="text" name="sport" class="wts-clin-input" placeholder="Ej. Running / CrossFit / Pádel" required />
                </div>
              </div>

              <hr style="border:0;border-top:1px solid #E2E8F0;margin:0.25rem 0;" />

              <div style="font-size:0.76rem;font-weight:700;text-transform:uppercase;color:#059669;">
                2. Apertura de Historia: Motivo y Tratamiento
              </div>

              <div class="wts-clin-row-2">
                <div>
                  <label style="display:block;font-size:0.76rem;font-weight:600;margin-bottom:0.2rem;">Unidad Asistencial</label>
                  <select name="area" class="wts-clin-input">${areaOptions}</select>
                </div>
                <div>
                  <label style="display:block;font-size:0.76rem;font-weight:600;margin-bottom:0.2rem;">Por qué viene (Motivo / Diagnóstico)</label>
                  <input type="text" name="diagnosis" class="wts-clin-input" placeholder="Ej. Sobrecarga sóleo izquierdo" required />
                </div>
              </div>

              <div>
                <label style="display:block;font-size:0.76rem;font-weight:600;margin-bottom:0.2rem;">Cómo se le va a tratar (Plan terapéutico)</label>
                <textarea name="evolution" rows="3" class="wts-clin-input" placeholder="Describe exploración inicial, técnicas a aplicar y frecuencia de sesiones..." required></textarea>
              </div>
            </div>

            <div class="wts-clin-modal__foot">
              <button type="button" class="wts-clin-btn wts-clin-btn--outline" data-close-modal>Cancelar</button>
              <button type="submit" class="wts-clin-btn">Guardar Paciente y Abrir Ficha</button>
            </div>
          </form>
        </div>
      `;

      document.body.appendChild(backdrop);

      const closeModal = () => backdrop.remove();
      backdrop.querySelectorAll('[data-close-modal]').forEach((b) => b.addEventListener('click', closeModal));
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) closeModal();
      });

      const form = backdrop.querySelector('#wts-clin-create-patient-form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const email = String(fd.get('patientEmail')).trim().toLowerCase();
        const name = String(fd.get('patientName')).trim();
        const key = email || name.toLowerCase();

        const records = this._getRecords();
        const todayIso = new Date().toISOString().slice(0, 10);

        const initialEntry = {
          id: 'clin-' + Date.now(),
          date: todayIso,
          author: this.currentAuthor,
          area: String(fd.get('area')),
          diagnosis: `Motivo: ${String(fd.get('diagnosis')).trim()}`,
          evolution: `Plan de tratamiento: ${String(fd.get('evolution')).trim()}`
        };

        let existing = records.find((r) => r.patientKey === key);
        if (existing) {
          existing.patientName = name;
          existing.patientPhone = String(fd.get('patientPhone')).trim();
          existing.sport = String(fd.get('sport')).trim();
          existing.entries.unshift(initialEntry);
        } else {
          records.unshift({
            patientKey: key,
            patientName: name,
            patientEmail: email,
            patientPhone: String(fd.get('patientPhone')).trim(),
            sport: String(fd.get('sport')).trim(),
            assignedResourceIds: this.linkedResourceId && this.linkedResourceId !== 'all' ? [this.linkedResourceId] : [],
            entries: [initialEntry]
          });
        }

        this._saveRecords(records);
        closeModal();
        window.location.href = `${this.detailPageUrl}?patient=${encodeURIComponent(key)}`;
      });
    }

    /* =====================================================================
       3. PÁGINA DEDICADA DE FICHA DEL PACIENTE (paciente-ficha.html)
       ===================================================================== */
    renderPatientDetailPage(patientKey) {
      if (!this.container) return;
      this._syncPatientsFromEvents();
      const records = this._getRecords();
      const decodedKey = decodeURIComponent(patientKey || '').toLowerCase().trim();
      const patient = records.find((r) => r.patientKey === decodedKey) || records[0];

      if (!patient) {
        this.container.innerHTML = `
          <div class="wts-clin-box">
            <h2>Paciente no encontrado</h2>
            <a href="${this.directoryPageUrl}" class="wts-clin-btn wts-clin-btn--outline">← Volver a Mis Pacientes</a>
          </div>
        `;
        return;
      }

      const events = this._getEvents().filter(
        (ev) =>
          (ev.patientEmail && ev.patientEmail.toLowerCase() === patient.patientEmail.toLowerCase()) ||
          ev.patientName.toLowerCase() === patient.patientName.toLowerCase()
      );

      const areaOptions = Object.keys(this.areaLabels)
        .map((k) => `<option value="${this.areaLabels[k]}">${this.areaLabels[k]}</option>`)
        .join('');

      const entriesHtml =
        patient.entries.length > 0
          ? patient.entries
              .map(
                (ent) => `
                <article class="wts-clin-entry">
                  <div class="wts-clin-entry__meta">
                    <span><strong>${ent.author}</strong> · ${ent.area}</span>
                    <span>📅 ${ent.date}</span>
                  </div>
                  <div class="wts-clin-entry__diag">${ent.diagnosis}</div>
                  <p style="margin:0;font-size:0.86rem;">${ent.evolution}</p>
                </article>
              `
              )
              .join('')
          : `<p style="font-size:0.86rem;color:#64748B;">Todavía no hay entradas registradas en esta ficha.</p>`;

      const appointmentsHtml =
        events.length > 0
          ? events
              .map(
                (ev) => `
                <div style="padding:0.55rem 0.7rem;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:7px;font-size:0.8rem;">
                  <strong>${ev.title}</strong>
                  <div style="color:#64748B;">📅 ${ev.date} · ${String(ev.startHour).padStart(2, '0')}:00 (${
                  ev.status === 'completed' ? 'Completada' : ev.status === 'cancelled' ? 'Cancelada' : 'Confirmada'
                })</div>
                </div>
              `
              )
              .join('')
          : `<p style="font-size:0.8rem;color:#64748B;margin:0;">Sin citas previas en agenda.</p>`;

      this.container.innerHTML = `
        <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:0.75rem;margin-bottom:1.15rem;">
          <div style="display:flex;align-items:center;gap:0.75rem;">
            <a href="${this.directoryPageUrl}" class="wts-clin-btn wts-clin-btn--outline">← Mis Pacientes</a>
            <div>
              <h1 style="font-size:1.3rem;margin:0;">Ficha Clínica · ${patient.patientName}</h1>
              <span style="font-size:0.8rem;color:#64748B;">Historial unificado del cliente</span>
            </div>
          </div>
          <a href="tel:${(patient.patientPhone || '').replace(/\s+/g, '')}" class="wts-clin-btn wts-clin-btn--primary">
            📞 Llamar al Paciente
          </a>
        </div>

        <div class="wts-clin-detail-grid">
          <!-- Columna Izquierda: Datos del Cliente y Citas -->
          <aside style="display:grid;gap:1rem;">
            <div class="wts-clin-box">
              <h3 style="font-size:1rem;margin-bottom:0.25rem;">Datos del Paciente</h3>
              <div class="wts-clin-data-list">
                <div class="wts-clin-data-item">
                  <span>Nombre completo</span>
                  <strong>${patient.patientName}</strong>
                </div>
                <div class="wts-clin-data-item">
                  <span>Disciplina / Objetivo</span>
                  <strong>${patient.sport || 'No especificado'}</strong>
                </div>
                <div class="wts-clin-data-item">
                  <span>Teléfono</span>
                  <strong>${patient.patientPhone || 'No registrado'}</strong>
                </div>
                <div class="wts-clin-data-item" style="border-bottom:0;padding-bottom:0;">
                  <span>Correo electrónico</span>
                  <strong>${patient.patientEmail || 'No registrado'}</strong>
                </div>
              </div>
            </div>

            <div class="wts-clin-box">
              <h3 style="font-size:0.96rem;margin-bottom:0.65rem;">Historial de Citas (${events.length})</h3>
              <div style="display:grid;gap:0.5rem;">${appointmentsHtml}</div>
            </div>
          </aside>

          <!-- Columna Derecha: Añadir Entrada Nueva + Evolución -->
          <section class="wts-clin-box">
            <form id="wts-clin-detail-add-form" class="wts-clin-form">
              <strong style="font-size:0.94rem;color:#0F172A;">+ Añadir Nueva Entrada de Evolución / Tratamiento</strong>
              <div class="wts-clin-row-2">
                <div>
                  <label style="display:block;font-size:0.76rem;font-weight:600;margin-bottom:0.2rem;">Unidad Asistencial</label>
                  <select name="area" class="wts-clin-input">${areaOptions}</select>
                </div>
                <div>
                  <label style="display:block;font-size:0.76rem;font-weight:600;margin-bottom:0.2rem;">Motivo / Diagnóstico de sesión</label>
                  <input type="text" name="diagnosis" class="wts-clin-input" placeholder="Ej. Revisión ecográfica y descarga" required />
                </div>
              </div>
              <div>
                <label style="display:block;font-size:0.76rem;font-weight:600;margin-bottom:0.2rem;">Evolución observada y tratamiento aplicado</label>
                <textarea name="evolution" rows="3" class="wts-clin-input" placeholder="Detalla evolución, parámetros de carga, tratamiento y pautas..." required></textarea>
              </div>
              <button type="submit" class="wts-clin-btn" style="justify-self:start;">Guardar Entrada en Ficha</button>
            </form>

            <h3 style="font-size:1rem;margin-bottom:0.8rem;">Cronología Clínica (${patient.entries.length} entradas)</h3>
            <div class="wts-clin-timeline">${entriesHtml}</div>
          </section>
        </div>
      `;

      const addForm = this.container.querySelector('#wts-clin-detail-add-form');
      if (addForm) {
        addForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const fd = new FormData(addForm);
          const allRecords = this._getRecords();
          const target = allRecords.find((r) => r.patientKey === patient.patientKey);
          if (!target) return;

          target.entries.unshift({
            id: 'clin-' + Date.now(),
            date: new Date().toISOString().slice(0, 10),
            author: this.currentAuthor,
            area: String(fd.get('area')),
            diagnosis: String(fd.get('diagnosis')).trim(),
            evolution: String(fd.get('evolution')).trim()
          });

          this._saveRecords(allRecords);
          this.renderPatientDetailPage(patient.patientKey);
        });
      }
    }
  }

  window.WtsClinical = WtsClinical;
})();
