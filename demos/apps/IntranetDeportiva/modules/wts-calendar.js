(function () {
  'use strict';

  class WtsCalendar {
    constructor(options) {
      this.container = options.container;
      this.mode = options.mode || 'client'; // 'client' | 'staff' | 'admin'
      this.viewMode = options.viewMode || 'week'; // 'month' | 'week' | 'day'
      this.showViewSwitcher = options.showViewSwitcher !== false;
      this.storageKey = options.storageKey || 'wts_calendar_events';
      this.resources = Array.isArray(options.resources) ? options.resources : [];
      this.services = Array.isArray(options.services) ? options.services : [];
      this.areaLabels = options.areaLabels || {};
      this.areaColors = options.areaColors || {};
      this.selectedResourceId = options.initialResourceId || 'all';
      this.prefillUser = options.prefillUser || null;
      this.startHour = Number.isFinite(options.startHour) ? options.startHour : 8;
      this.endHour = Number.isFinite(options.endHour) ? options.endHour : 20;
      this.onBookingChange = typeof options.onBookingChange === 'function' ? options.onBookingChange : null;
      this.onOpenClinicalRecord =
        typeof options.onOpenClinicalRecord === 'function' ? options.onOpenClinicalRecord : null;

      this.anchorDate = this._stripTime(new Date());
    }

    init() {
      if (!this.container) return;
      this.render();
    }

    _stripTime(dateObj) {
      return new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    }

    _toIsoDate(dateObj) {
      const y = dateObj.getFullYear();
      const m = String(dateObj.getMonth() + 1).padStart(2, '0');
      const d = String(dateObj.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }

    _getEvents() {
      try {
        return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      } catch (e) {
        return [];
      }
    }

    _saveEvents(events) {
      localStorage.setItem(this.storageKey, JSON.stringify(events));
      if (this.onBookingChange) {
        this.onBookingChange(events);
      }
    }

    _hasConflict(resourceId, dateIso, startHour, ignoreEventId = null) {
      const events = this._getEvents();
      return events.some(
        (ev) =>
          ev.id !== ignoreEventId &&
          ev.status !== 'cancelled' &&
          ev.resourceId === resourceId &&
          ev.date === dateIso &&
          Number(ev.startHour) === Number(startHour)
      );
    }

    _getWeekDays(anchorDate) {
      const dayOfWeek = anchorDate.getDay();
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(anchorDate);
      monday.setDate(anchorDate.getDate() + diffToMonday);

      const days = [];
      for (let i = 0; i < 6; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        days.push(d);
      }
      return days;
    }

    _getMonthMatrix(anchorDate) {
      const year = anchorDate.getFullYear();
      const month = anchorDate.getMonth();
      const firstOfMonth = new Date(year, month, 1);
      const startDay = firstOfMonth.getDay();
      const offsetToMonday = startDay === 0 ? -6 : 1 - startDay;
      const gridStart = new Date(year, month, 1 + offsetToMonday);

      const cells = [];
      for (let i = 0; i < 35; i++) {
        const d = new Date(gridStart);
        d.setDate(gridStart.getDate() + i);
        cells.push(d);
      }
      return cells;
    }

    _formatDayHeader(dateObj) {
      return new Intl.DateTimeFormat('es-ES', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      }).format(dateObj);
    }

    _formatFullDate(dateIso) {
      const [y, m, d] = dateIso.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      return new Intl.DateTimeFormat('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      }).format(dt);
    }

    _formatMonthTitle(dateObj) {
      return new Intl.DateTimeFormat('es-ES', {
        month: 'long',
        year: 'numeric'
      }).format(dateObj);
    }

    _getDayEventsForUser(dateIso) {
      const events = this._getEvents();
      return events
        .filter((ev) => {
          if (ev.status === 'cancelled' || ev.date !== dateIso) return false;
          if (this.mode === 'client' && this.prefillUser) {
            return (
              (ev.patientEmail && ev.patientEmail.toLowerCase() === this.prefillUser.email.toLowerCase()) ||
              ev.patientName.toLowerCase() === this.prefillUser.name.toLowerCase()
            );
          }
          return this.selectedResourceId === 'all' ? true : ev.resourceId === this.selectedResourceId;
        })
        .sort((a, b) => Number(a.startHour) - Number(b.startHour));
    }

    render() {
      const todayIso = this._toIsoDate(new Date());
      const events = this._getEvents();
      const resourceMap = Object.fromEntries(this.resources.map((r) => [r.id, r]));

      if (this.mode === 'client' && this.viewMode !== 'month' && this.selectedResourceId === 'all' && this.resources.length > 0) {
        this.selectedResourceId = this.resources[0].id;
      }

      let rangeLabel = '';
      if (this.viewMode === 'month') {
        rangeLabel = this._formatMonthTitle(this.anchorDate);
      } else if (this.viewMode === 'week') {
        const days = this._getWeekDays(this.anchorDate);
        rangeLabel = `${this._formatDayHeader(days[0])} — ${this._formatDayHeader(days[days.length - 1])}`;
      } else {
        rangeLabel = this._formatDayHeader(this.anchorDate);
      }

      const showResourceSelect = !(this.mode === 'client' && this.viewMode === 'month');
      const resourceOptions = [
        ...(this.mode !== 'client' ? [`<option value="all">Todos los especialistas (${this.resources.length})</option>`] : []),
        ...this.resources.map(
          (r) =>
            `<option value="${r.id}" ${this.selectedResourceId === r.id ? 'selected' : ''}>
              ${r.name} · ${this.areaLabels[r.category] || r.category}
            </option>`
        )
      ].join('');

      let bodyContentHtml = '';

      if (this.viewMode === 'month') {
        const cells = this._getMonthMatrix(this.anchorDate);
        const currentMonth = this.anchorDate.getMonth();
        const weekHeaders = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
          .map((w) => `<div class="wts-cal-month-head">${w}</div>`)
          .join('');

        const cellsHtml = cells
          .map((dateObj) => {
            const iso = this._toIsoDate(dateObj);
            const isOutside = dateObj.getMonth() !== currentMonth ? 'is-outside' : '';
            const isToday = iso === todayIso;
            const dayEvents = this._getDayEventsForUser(iso);
            const count = dayEvents.length;

            return `
              <div class="wts-cal-month-cell ${isOutside} ${isToday ? 'is-today' : ''}" data-action="inspect-day" data-date="${iso}">
                <div class="wts-cal-month-cell__top">
                  <span class="wts-cal-day-num">${dateObj.getDate()}</span>
                  ${
                    isToday
                      ? `<span class="wts-cal-today-tag">Hoy</span>`
                      : `<span class="wts-cal-month-hint">+</span>`
                  }
                </div>
                <div class="wts-cal-month-cell__bottom">
                  ${
                    count > 0
                      ? `<span class="wts-cal-count-badge" title="${count} evento(s) este día">${count}</span>`
                      : ''
                  }
                </div>
              </div>
            `;
          })
          .join('');

        bodyContentHtml = `<div class="wts-cal-month-grid">${weekHeaders}${cellsHtml}</div>`;
      } else {
        const days = this.viewMode === 'week' ? this._getWeekDays(this.anchorDate) : [this.anchorDate];
        let headerCellsHtml = `<th class="wts-cal-th wts-cal-th--hour">Hora</th>`;
        days.forEach((d) => {
          const iso = this._toIsoDate(d);
          const isToday = iso === todayIso ? 'is-today' : '';
          headerCellsHtml += `<th class="wts-cal-th ${isToday}">${this._formatDayHeader(d)}</th>`;
        });

        let rowsHtml = '';
        for (let h = this.startHour; h < this.endHour; h++) {
          const hourLabel = `${String(h).padStart(2, '0')}:00`;
          let cellsHtml = `<td class="wts-cal-hour-cell">${hourLabel}</td>`;

          days.forEach((d) => {
            const dateIso = this._toIsoDate(d);
            const slotEvents = events.filter((ev) => {
              const matchDateHour = ev.date === dateIso && Number(ev.startHour) === h;
              const matchResource =
                this.selectedResourceId === 'all' ? true : ev.resourceId === this.selectedResourceId;
              return matchDateHour && matchResource;
            });

            const activeEvents = slotEvents.filter((ev) => ev.status !== 'cancelled');

            if (this.mode === 'client') {
              if (activeEvents.length > 0) {
                const mine =
                  this.prefillUser &&
                  activeEvents.find(
                    (e) =>
                      e.patientEmail &&
                      this.prefillUser.email &&
                      e.patientEmail.toLowerCase() === this.prefillUser.email.toLowerCase()
                  );

                if (mine) {
                  cellsHtml += `
                    <td class="wts-cal-slot wts-cal-slot--mine-client">
                      <strong style="display:block;color:#059669;">✓ Tu Sesión</strong>
                      <span style="color:#334155;font-size:0.68rem;">${mine.title}</span>
                    </td>
                  `;
                } else {
                  cellsHtml += `<td class="wts-cal-slot wts-cal-slot--blocked-client">Ocupado</td>`;
                }
              } else {
                cellsHtml += `
                  <td class="wts-cal-slot wts-cal-slot--free" data-action="book-slot" data-date="${dateIso}" data-hour="${h}">
                    <div class="wts-cal-slot-add">+ Apuntarme</div>
                  </td>
                `;
              }
            } else {
              const cardsHtml = slotEvents
                .map((ev) => {
                  const res = resourceMap[ev.resourceId];
                  const color = res ? res.color : '#0284C7';
                  const statusClass =
                    ev.status === 'completed'
                      ? 'wts-cal-event--completed'
                      : ev.status === 'cancelled'
                      ? 'wts-cal-event--cancelled'
                      : '';

                  return `
                    <div class="wts-cal-event ${statusClass}" style="border-left-color:${color}" data-action="inspect-event" data-event-id="${ev.id}">
                      <div class="wts-cal-event__title">${ev.patientName}</div>
                      <div class="wts-cal-event__sub">${ev.title}${
                    this.selectedResourceId === 'all' && res ? ` · ${res.name.split(' ')[0]}` : ''
                  }</div>
                    </div>
                  `;
                })
                .join('');

              const canAddMore =
                this.selectedResourceId === 'all'
                  ? activeEvents.length < this.resources.length
                  : activeEvents.length === 0;

              const addTrigger = canAddMore
                ? `<div class="wts-cal-slot-add" style="height:auto;padding-top:2px;" data-action="book-slot" data-date="${dateIso}" data-hour="${h}">+ Agendar</div>`
                : '';

              cellsHtml += `
                <td class="wts-cal-slot ${canAddMore ? 'wts-cal-slot--free' : ''}" ${
                canAddMore && slotEvents.length === 0
                  ? `data-action="book-slot" data-date="${dateIso}" data-hour="${h}"`
                  : ''
              }>
                  ${cardsHtml}
                  ${addTrigger}
                </td>
              `;
            }
          });

          rowsHtml += `<tr>${cellsHtml}</tr>`;
        }

        bodyContentHtml = `
          <div class="wts-cal-grid-wrap">
            <table class="wts-cal-table ${this.viewMode === 'day' ? 'wts-cal-table--day' : ''}">
              <thead><tr>${headerCellsHtml}</tr></thead>
              <tbody>${rowsHtml}</tbody>
            </table>
          </div>
        `;
      }

      const viewSwitcherHtml = this.showViewSwitcher
        ? `
          <div class="wts-cal-segmented" role="group" aria-label="Cambiar vista">
            <button type="button" class="wts-cal-btn ${this.viewMode === 'week' ? 'is-active' : ''}" data-cal-view="week">Semana</button>
            <button type="button" class="wts-cal-btn ${this.viewMode === 'day' ? 'is-active' : ''}" data-cal-view="day">Día</button>
          </div>
        `
        : '';

      this.container.innerHTML = `
        <div class="wts-cal-shell">
          <div class="wts-cal-toolbar">
            <div class="wts-cal-toolbar__group">
              <button type="button" class="wts-cal-btn" data-cal-nav="prev">←</button>
              <button type="button" class="wts-cal-btn" data-cal-nav="today">Hoy</button>
              <button type="button" class="wts-cal-btn" data-cal-nav="next">→</button>
              <span class="wts-cal-title">${rangeLabel}</span>
            </div>

            <div class="wts-cal-toolbar__group" style="flex:1 1 auto;justify-content:flex-end;">
              ${
                showResourceSelect
                  ? `<select class="wts-cal-select" id="wts-cal-resource-filter" aria-label="Filtrar especialista">${resourceOptions}</select>`
                  : ''
              }
              ${viewSwitcherHtml}
            </div>
          </div>

          ${bodyContentHtml}
        </div>
      `;

      this._bindEvents();
    }

    _bindEvents() {
      const resSelect = this.container.querySelector('#wts-cal-resource-filter');
      if (resSelect) {
        resSelect.addEventListener('change', (e) => {
          this.selectedResourceId = e.target.value;
          this.render();
        });
      }

      this.container.querySelectorAll('[data-cal-nav]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const dir = btn.getAttribute('data-cal-nav');
          if (dir === 'today') {
            this.anchorDate = this._stripTime(new Date());
          } else if (this.viewMode === 'month') {
            const delta = dir === 'next' ? 1 : -1;
            this.anchorDate = new Date(this.anchorDate.getFullYear(), this.anchorDate.getMonth() + delta, 1);
          } else {
            const step = this.viewMode === 'week' ? 7 : 1;
            this.anchorDate.setDate(this.anchorDate.getDate() + (dir === 'next' ? step : -step));
          }
          this.render();
        });
      });

      this.container.querySelectorAll('[data-cal-view]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.viewMode = btn.getAttribute('data-cal-view');
          this.render();
        });
      });

      this.container.querySelectorAll('[data-action="inspect-day"]').forEach((el) => {
        el.addEventListener('click', () => {
          const dateIso = el.getAttribute('data-date');
          this.openDayOverviewModal(dateIso);
        });
      });

      this.container.querySelectorAll('[data-action="book-slot"]').forEach((el) => {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          const dateIso = el.getAttribute('data-date');
          const hour = Number(el.getAttribute('data-hour'));
          this.openBookingModal(dateIso, hour);
        });
      });

      this.container.querySelectorAll('[data-action="inspect-event"]').forEach((el) => {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          const eventId = el.getAttribute('data-event-id');
          this._openInspectModal(eventId);
        });
      });
    }

    openDayOverviewModal(dateIso) {
      const dayEvents = this._getDayEventsForUser(dateIso);
      const resourceMap = Object.fromEntries(this.resources.map((r) => [r.id, r]));

      const backdrop = document.createElement('div');
      backdrop.className = 'wts-cal-modal-backdrop';

      const closeModal = () => backdrop.remove();
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) closeModal();
      });

      const listHtml =
        dayEvents.length > 0
          ? dayEvents
              .map((ev) => {
                const doc = resourceMap[ev.resourceId];
                const color = doc ? this.areaColors[doc.category] || doc.color || '#0284C7' : '#0284C7';
                return `
                  <div class="wts-cal-day-item" style="border-left-color:${color};">
                    <div>
                      <strong style="display:block;font-size:0.88rem;color:#0F172A;">
                        ${String(ev.startHour).padStart(2, '0')}:00 · ${ev.title}
                      </strong>
                      <span style="display:block;font-size:0.78rem;color:#475569;">
                        🩺 ${doc ? doc.name : 'Especialista'}${ev.notes ? ` · ${ev.notes}` : ''}
                      </span>
                    </div>
                    <button type="button" class="wts-cal-btn wts-cal-btn--danger" style="padding:0.28rem 0.55rem;font-size:0.74rem;" data-cancel-day-evt="${ev.id}">
                      Cancelar
                    </button>
                  </div>
                `;
              })
              .join('')
          : `<p style="font-size:0.86rem;color:#64748B;margin:0.25rem 0;">No tienes ningún evento anotado para este día.</p>`;

      backdrop.innerHTML = `
        <div class="wts-cal-modal" role="dialog" aria-modal="true">
          <div class="wts-cal-modal__head">
            <h3>${this._formatFullDate(dateIso)}</h3>
            <button type="button" class="wts-cal-modal__close" data-close-modal>&times;</button>
          </div>
          <div class="wts-cal-modal__body">
            <div style="font-size:0.78rem;font-weight:700;color:#475569;">
              Eventos programados (${dayEvents.length})
            </div>
            ${listHtml}
          </div>
          <div class="wts-cal-modal__foot">
            <button type="button" class="wts-cal-btn" data-close-modal>Cerrar</button>
            <button type="button" class="wts-cal-btn wts-cal-btn--primary" id="wts-switch-to-add-event">
              + Anotar un evento
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(backdrop);

      backdrop.querySelectorAll('[data-close-modal]').forEach((b) => b.addEventListener('click', closeModal));

      backdrop.querySelectorAll('[data-cancel-day-evt]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-cancel-day-evt');
          const all = this._getEvents();
          const idx = all.findIndex((item) => item.id === id);
          if (idx !== -1) {
            all[idx].status = 'cancelled';
            this._saveEvents(all);
            closeModal();
            this.render();
            this.openDayOverviewModal(dateIso);
          }
        });
      });

      const switchBtn = backdrop.querySelector('#wts-switch-to-add-event');
      if (switchBtn) {
        switchBtn.addEventListener('click', () => {
          closeModal();
          this.openBookingModal(dateIso, 10);
        });
      }
    }

    openBookingModal(dateIso, defaultHour = 10) {
      const defaultResId =
        this.selectedResourceId !== 'all' ? this.selectedResourceId : this.resources[0]?.id || '';

      const resourceOptions = this.resources
        .map(
          (r) =>
            `<option value="${r.id}" ${r.id === defaultResId ? 'selected' : ''}>${r.name} (${
              this.areaLabels[r.category] || r.category
            })</option>`
        )
        .join('');

      const serviceOptions = this.services
        .map((s) => `<option value="${s.id}">${s.name} — ${s.price}€</option>`)
        .join('');

      let hourOptions = '';
      for (let h = this.startHour; h < this.endHour; h++) {
        hourOptions += `<option value="${h}" ${Number(defaultHour) === h ? 'selected' : ''}>${String(h).padStart(
          2,
          '0'
        )}:00 - ${String(h + 1).padStart(2, '0')}:00</option>`;
      }

      const preName = this.prefillUser ? this.prefillUser.name : '';
      const preEmail = this.prefillUser ? this.prefillUser.email : '';
      const prePhone = this.prefillUser ? this.prefillUser.phone : '';

      const backdrop = document.createElement('div');
      backdrop.className = 'wts-cal-modal-backdrop';
      backdrop.innerHTML = `
        <div class="wts-cal-modal" role="dialog" aria-modal="true">
          <div class="wts-cal-modal__head">
            <h3>${this.mode === 'client' ? 'Anotar Evento / Reservar Sesión' : 'Agendar Cita'}</h3>
            <button type="button" class="wts-cal-modal__close" data-close-modal>&times;</button>
          </div>
          <form id="wts-cal-create-form" style="display:flex;flex-direction:column;min-height:0;">
            <div class="wts-cal-modal__body">
              <div id="wts-cal-form-error" class="wts-cal-alert" hidden></div>

              <div class="wts-cal-row-2">
                <div class="wts-cal-field">
                  <label>Fecha</label>
                  <input type="date" name="date" value="${dateIso}" required />
                </div>
                <div class="wts-cal-field">
                  <label>Tramo horario</label>
                  <select name="startHour" required>${hourOptions}</select>
                </div>
              </div>

              <div class="wts-cal-row-2">
                <div class="wts-cal-field">
                  <label>Especialista</label>
                  <select name="resourceId" required>${resourceOptions}</select>
                </div>
                <div class="wts-cal-field">
                  <label>Servicio</label>
                  <select name="serviceId" required>${serviceOptions}</select>
                </div>
              </div>

              <div class="wts-cal-row-2">
                <div class="wts-cal-field">
                  <label>Paciente / Socio</label>
                  <input type="text" name="patientName" value="${preName}" placeholder="Nombre completo" required />
                </div>
                <div class="wts-cal-field">
                  <label>Teléfono</label>
                  <input type="tel" name="patientPhone" value="${prePhone}" placeholder="+34 600 000 000" required />
                </div>
              </div>

              <div class="wts-cal-field">
                <label>Correo electrónico</label>
                <input type="email" name="patientEmail" value="${preEmail}" placeholder="correo@ejemplo.com" required />
              </div>

              <div class="wts-cal-field">
                <label>Notas (opcional)</label>
                <input type="text" name="notes" placeholder="Motivo de consulta, lesión o prueba..." />
              </div>
            </div>

            <div class="wts-cal-modal__foot">
              <button type="button" class="wts-cal-btn" data-close-modal>Cancelar</button>
              <button type="submit" class="wts-cal-btn wts-cal-btn--primary">Guardar Evento</button>
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

      const form = backdrop.querySelector('#wts-cal-create-form');
      const errorBox = backdrop.querySelector('#wts-cal-form-error');

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const chosenResourceId = fd.get('resourceId');
        const chosenDate = fd.get('date');
        const chosenHour = Number(fd.get('startHour'));
        const chosenServiceId = fd.get('serviceId');

        if (this._hasConflict(chosenResourceId, chosenDate, chosenHour)) {
          errorBox.textContent = 'Franja ocupada: ese especialista ya tiene una sesión confirmada en ese horario.';
          errorBox.hidden = false;
          return;
        }

        const serviceObj = this.services.find((s) => s.id === chosenServiceId) || this.services[0];
        const newEvent = {
          id: 'evt-' + Date.now(),
          resourceId: chosenResourceId,
          serviceId: serviceObj ? serviceObj.id : '',
          title: serviceObj ? serviceObj.name : 'Sesión',
          patientName: String(fd.get('patientName')).trim(),
          patientEmail: String(fd.get('patientEmail')).trim(),
          patientPhone: String(fd.get('patientPhone')).trim(),
          date: chosenDate,
          startHour: chosenHour,
          durationMinutes: serviceObj ? Number(serviceObj.duration) : 60,
          price: serviceObj ? Number(serviceObj.price) : 65,
          status: 'confirmed',
          notes: String(fd.get('notes') || '').trim()
        };

        const allEvents = this._getEvents();
        allEvents.push(newEvent);
        this._saveEvents(allEvents);
        closeModal();
        this.render();
      });
    }

    _openInspectModal(eventId) {
      const events = this._getEvents();
      const ev = events.find((item) => item.id === eventId);
      if (!ev) return;

      const isAdmin = this.mode === 'admin';
      const resourceOptions = this.resources
        .map(
          (r) =>
            `<option value="${r.id}" ${r.id === ev.resourceId ? 'selected' : ''}>${r.name}</option>`
        )
        .join('');

      let hourOptions = '';
      for (let h = this.startHour; h < this.endHour; h++) {
        hourOptions += `<option value="${h}" ${Number(ev.startHour) === h ? 'selected' : ''}>${String(h).padStart(
          2,
          '0'
        )}:00</option>`;
      }

      const backdrop = document.createElement('div');
      backdrop.className = 'wts-cal-modal-backdrop';
      backdrop.innerHTML = `
        <div class="wts-cal-modal" role="dialog" aria-modal="true">
          <div class="wts-cal-modal__head">
            <h3>Cita · ${ev.patientName}</h3>
            <button type="button" class="wts-cal-modal__close" data-close-modal>&times;</button>
          </div>
          <div class="wts-cal-modal__body">
            <div id="wts-cal-edit-error" class="wts-cal-alert" hidden></div>

            <div class="wts-cal-field">
              <label>Sesión (${ev.price} €)</label>
              <input type="text" value="${ev.title}" disabled />
            </div>

            <div class="wts-cal-row-2">
              <div class="wts-cal-field">
                <label>Email</label>
                <input type="text" value="${ev.patientEmail || 'N/D'}" disabled />
              </div>
              <div class="wts-cal-field">
                <label>Teléfono</label>
                <input type="text" value="${ev.patientPhone || 'N/D'}" disabled />
              </div>
            </div>

            ${
              isAdmin
                ? `
              <div class="wts-cal-field">
                <label>Reasignar Especialista (Admin)</label>
                <select id="wts-edit-resource">${resourceOptions}</select>
              </div>
              <div class="wts-cal-row-2">
                <div class="wts-cal-field">
                  <label>Fecha</label>
                  <input type="date" id="wts-edit-date" value="${ev.date}" />
                </div>
                <div class="wts-cal-field">
                  <label>Hora</label>
                  <select id="wts-edit-hour">${hourOptions}</select>
                </div>
              </div>
            `
                : ''
            }

            <div class="wts-cal-field">
              <label>Notas</label>
              <textarea id="wts-edit-notes" rows="2">${ev.notes || ''}</textarea>
            </div>
          </div>

          <div class="wts-cal-modal__foot">
            ${
              this.onOpenClinicalRecord
                ? `<button type="button" class="wts-cal-btn wts-cal-btn--primary" data-status-action="clinical">🩺 Ficha Clínica</button>`
                : ''
            }
            <button type="button" class="wts-cal-btn wts-cal-btn--success" data-status-action="completed">✓ Completada</button>
            <button type="button" class="wts-cal-btn wts-cal-btn--danger" data-status-action="cancelled">✕ Cancelar</button>
            ${
              isAdmin
                ? `<button type="button" class="wts-cal-btn" data-status-action="save-admin">Guardar</button>`
                : ''
            }
          </div>
        </div>
      `;

      document.body.appendChild(backdrop);
      const closeModal = () => backdrop.remove();
      backdrop.querySelectorAll('[data-close-modal]').forEach((b) => b.addEventListener('click', closeModal));
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) closeModal();
      });

      backdrop.querySelectorAll('[data-status-action]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const action = btn.getAttribute('data-status-action');
          const allEvents = this._getEvents();
          const idx = allEvents.findIndex((item) => item.id === ev.id);
          if (idx === -1) return;

          if (action === 'clinical') {
            closeModal();
            if (this.onOpenClinicalRecord) {
              this.onOpenClinicalRecord(allEvents[idx]);
            }
            return;
          }

          allEvents[idx].notes = backdrop.querySelector('#wts-edit-notes').value.trim();

          if (isAdmin) {
            const newRes = backdrop.querySelector('#wts-edit-resource').value;
            const newDate = backdrop.querySelector('#wts-edit-date').value;
            const newHour = Number(backdrop.querySelector('#wts-edit-hour').value);

            if (action !== 'cancelled' && this._hasConflict(newRes, newDate, newHour, ev.id)) {
              const errEl = backdrop.querySelector('#wts-cal-edit-error');
              errEl.textContent = 'Franja ocupada para el especialista seleccionado.';
              errEl.hidden = false;
              return;
            }
            allEvents[idx].resourceId = newRes;
            allEvents[idx].date = newDate;
            allEvents[idx].startHour = newHour;
          }

          if (action === 'completed') allEvents[idx].status = 'completed';
          if (action === 'cancelled') allEvents[idx].status = 'cancelled';

          this._saveEvents(allEvents);
          closeModal();
          this.render();
        });
      });
    }
  }

  window.WtsCalendar = WtsCalendar;
})();
