(function () {
  'use strict';

  /**
   * Motor Agnóstico de Autenticación, Registro, Perfil, Suscripciones y Administración (WtsAuthAdmin)
   */
  class WtsAuthAdmin {
    constructor(options) {
      this.authContainer = options.authContainer;
      this.adminContainer = options.adminContainer;
      this.sessionStorageKey = options.sessionStorageKey || 'wts_auth_session';
      this.usersStorageKey = options.usersStorageKey || 'wts_users';
      this.plansStorageKey = options.plansStorageKey || 'wts_plans';
      this.servicesStorageKey = options.servicesStorageKey || 'wts_services';
      this.resourcesStorageKey = options.resourcesStorageKey || 'wts_resources';
      this.eventsStorageKey = options.eventsStorageKey || 'wts_events';
      this.clinicalStorageKey = options.clinicalStorageKey || 'wts_clinical_records';
      this.defaultPlanId = options.defaultPlanId || 'plan-free';
      this.areaLabels = options.areaLabels || {};
      this.onSessionChange = typeof options.onSessionChange === 'function' ? options.onSessionChange : null;
    }

    _readJson(key) {
      try {
        return JSON.parse(localStorage.getItem(key) || '[]');
      } catch (e) {
        return [];
      }
    }

    _writeJson(key, data) {
      localStorage.setItem(key, JSON.stringify(data));
    }

    getSession() {
      try {
        const raw = localStorage.getItem(this.sessionStorageKey);
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    }

    setSession(userObj) {
      localStorage.setItem(this.sessionStorageKey, JSON.stringify(userObj));
      if (this.onSessionChange) {
        this.onSessionChange(userObj);
      }
    }

    /* =====================================================================
       1. PORTAL DE LOGIN Y CREACIÓN DE CUENTA EN UN VISTAZO (index.html)
       ===================================================================== */
    renderAuthPortal() {
      if (!this.authContainer) return;
      let mode = 'login';

      const renderForm = () => {
        const users = this._readJson(this.usersStorageKey);
        const plans = this._readJson(this.plansStorageKey);

        const quickCardsHtml = users
          .slice(0, 3)
          .map(
            (u) => `
            <button type="button" class="wts-aa-quick-card" data-quick-uid="${u.id}">
              <span style="display:block;font-size:0.65rem;font-weight:700;text-transform:uppercase;color:#0284C7;">
                ${u.role === 'client' ? 'Cliente' : u.role === 'staff' ? 'Especialista' : 'Admin'}
              </span>
              <strong style="display:block;font-size:0.8rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${u.name.split(' ')[0]}</strong>
            </button>
          `
          )
          .join('');

        const planOptionsHtml = plans
          .map((p) => {
            const label =
              Number(p.price) === 0
                ? `${p.name} — 0 €/mes (Pago por sesión suelta)`
                : `${p.name} — ${p.price} €/mes (${p.sessionsIncluded} ses.)`;
            return `<option value="${p.id}" ${p.id === this.defaultPlanId ? 'selected' : ''}>${label}</option>`;
          })
          .join('');

        this.authContainer.innerHTML = `
          <div>
            <div class="wts-aa-tabs">
              <button type="button" class="wts-aa-tab ${mode === 'login' ? 'is-active' : ''}" data-auth-mode="login">
                Iniciar Sesión
              </button>
              <button type="button" class="wts-aa-tab ${mode === 'register' ? 'is-active' : ''}" data-auth-mode="register">
                Crear Cuenta
              </button>
            </div>

            <div id="wts-aa-auth-feedback" class="wts-aa-alert wts-aa-alert--error" hidden style="margin-bottom:0.75rem;"></div>

            ${
              mode === 'login'
                ? `
              <form id="wts-aa-login-form" class="wts-aa-form">
                <div class="wts-aa-field">
                  <label>Correo electrónico</label>
                  <input type="email" name="email" class="wts-aa-input" value="j.ortega@clubtriatlon.es" required />
                </div>
                <div class="wts-aa-field">
                  <label>Contraseña</label>
                  <input type="password" name="password" class="wts-aa-input" value="demo" required />
                </div>
                <button type="submit" class="wts-aa-btn wts-aa-btn--primary" style="width:100%;padding:0.66rem;margin-top:0.2rem;">
                  Entrar a Mi Cuenta
                </button>
              </form>
            `
                : `
              <form id="wts-aa-register-form" class="wts-aa-form">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.6rem;">
                  <div class="wts-aa-field">
                    <label>Nombre completo</label>
                    <input type="text" name="name" class="wts-aa-input" placeholder="Ej. Laura Martín" required />
                  </div>
                  <div class="wts-aa-field">
                    <label>Teléfono</label>
                    <input type="tel" name="phone" class="wts-aa-input" placeholder="+34 600 000 000" required />
                  </div>
                </div>
                <div class="wts-aa-field">
                  <label>Correo electrónico</label>
                  <input type="email" name="email" class="wts-aa-input" placeholder="laura@correo.com" required />
                </div>
                <div style="display:grid;grid-template-columns:1.25fr 0.75fr;gap:0.6rem;">
                  <div class="wts-aa-field">
                    <label>Modalidad inicial</label>
                    <select name="planId" class="wts-aa-input">${planOptionsHtml}</select>
                  </div>
                  <div class="wts-aa-field">
                    <label>Contraseña</label>
                    <input type="password" name="password" class="wts-aa-input" placeholder="••••••" required />
                  </div>
                </div>
                <button type="submit" class="wts-aa-btn wts-aa-btn--success" style="width:100%;padding:0.66rem;margin-top:0.2rem;">
                  Crear Cuenta Gratuita y Entrar
                </button>
              </form>
            `
            }

            <div class="wts-aa-demo-box">
              <div style="font-size:0.74rem;font-weight:700;color:#64748B;">
                Acceso directo en 1 clic por rol:
              </div>
              <div class="wts-aa-demo-list">${quickCardsHtml}</div>
            </div>
          </div>
        `;

        this.authContainer.querySelectorAll('[data-auth-mode]').forEach((tab) => {
          tab.addEventListener('click', () => {
            mode = tab.getAttribute('data-auth-mode');
            renderForm();
          });
        });

        this.authContainer.querySelectorAll('[data-quick-uid]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const uid = btn.getAttribute('data-quick-uid');
            const found = users.find((u) => u.id === uid);
            if (found) this.setSession(found);
          });
        });

        const feedback = this.authContainer.querySelector('#wts-aa-auth-feedback');

        const loginForm = this.authContainer.querySelector('#wts-aa-login-form');
        if (loginForm) {
          loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(loginForm);
            const email = String(fd.get('email')).trim().toLowerCase();
            const found = users.find((u) => u.email.toLowerCase() === email);
            if (!found) {
              feedback.textContent = 'No existe ninguna cuenta con ese correo. Crea una en la pestaña "Crear Cuenta".';
              feedback.hidden = false;
              return;
            }
            this.setSession(found);
          });
        }

        const regForm = this.authContainer.querySelector('#wts-aa-register-form');
        if (regForm) {
          regForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(regForm);
            const email = String(fd.get('email')).trim().toLowerCase();
            const allUsers = this._readJson(this.usersStorageKey);

            if (allUsers.some((u) => u.email.toLowerCase() === email)) {
              feedback.textContent = 'Ese correo ya está registrado. Inicia sesión con él.';
              feedback.hidden = false;
              return;
            }

            const chosenPlanId = String(fd.get('planId') || this.defaultPlanId);
            const chosenPlan = plans.find((p) => p.id === chosenPlanId);

            const newUser = {
              id: 'usr-' + Date.now(),
              name: String(fd.get('name')).trim(),
              email: email,
              phone: String(fd.get('phone')).trim(),
              password: String(fd.get('password')),
              subscribedSince: new Date().toISOString().slice(0, 10),
              role: 'client',
              roleLabel: `Socio / Paciente · ${chosenPlan ? chosenPlan.name : 'Acceso Libre'}`,
              planId: chosenPlanId
            };

            allUsers.push(newUser);
            this._writeJson(this.usersStorageKey, allUsers);
            this.setSession(newUser);
          });
        }
      };

      renderForm();
    }

    /* =====================================================================
       2. DASHBOARD DE ADMINISTRADOR COMPACTO (CUADRADITOS + ACCESOS RÁPIDOS)
       ===================================================================== */
    renderAdminDashboard() {
      if (!this.adminContainer) return;
      const events = this._readJson(this.eventsStorageKey);
      const resources = this._readJson(this.resourcesStorageKey);
      const users = this._readJson(this.usersStorageKey);
      const plans = this._readJson(this.plansStorageKey);

      const activeEvents = events.filter((e) => e.status !== 'cancelled');
      const clientUsers = users.filter((u) => u.role === 'client');
      const estimatedRevenue = activeEvents.reduce((sum, ev) => sum + Number(ev.price || 0), 0);

      this.adminContainer.innerHTML = `
        <div class="apex-page-head">
          <div>
            <h1>Panel de Dirección</h1>
            <p>Resumen ejecutivo en tiempo real y acceso directo a todas las áreas de gestión.</p>
          </div>
        </div>

        <div class="wts-aa-squares-grid">
          <div class="wts-aa-square-kpi">
            <span class="wts-aa-square-kpi__label">Citas esta Semana</span>
            <div class="wts-aa-square-kpi__num">${activeEvents.length}</div>
            <span class="wts-aa-square-kpi__sub">Agenda activa</span>
          </div>

          <div class="wts-aa-square-kpi">
            <span class="wts-aa-square-kpi__label">Socios Activos</span>
            <div class="wts-aa-square-kpi__num">${clientUsers.length}</div>
            <span class="wts-aa-square-kpi__sub">${plans.length} modalidades</span>
          </div>

          <div class="wts-aa-square-kpi">
            <span class="wts-aa-square-kpi__label">Especialistas</span>
            <div class="wts-aa-square-kpi__num">${resources.length}</div>
            <span class="wts-aa-square-kpi__sub">4 unidades clínicas</span>
          </div>

          <div class="wts-aa-square-kpi">
            <span class="wts-aa-square-kpi__label">Facturación Sesiones</span>
            <div class="wts-aa-square-kpi__num">${estimatedRevenue} €</div>
            <span class="wts-aa-square-kpi__sub">Estimación en curso</span>
          </div>
        </div>

        <h2 style="font-size:1.05rem;margin-bottom:0.85rem;">Accesos Rápidos de Gestión</h2>
        <div class="wts-aa-nav-cards">
          <a href="calendario.html" class="wts-aa-nav-card">
            <div>
              <div class="wts-aa-nav-card__icon">📅</div>
              <h3 style="font-size:1rem;margin-top:0.65rem;">Agenda Global</h3>
              <p style="font-size:0.8rem;margin:0;color:#64748B;">Consulta todas las citas del centro, crea reservas o reasigna especialistas.</p>
            </div>
            <span style="font-size:0.8rem;font-weight:700;color:#0284C7;">Abrir Agenda →</span>
          </a>

          <a href="especialistas.html" class="wts-aa-nav-card">
            <div>
              <div class="wts-aa-nav-card__icon" style="background:#ECFDF5;color:#059669;">👥</div>
              <h3 style="font-size:1rem;margin-top:0.65rem;">Especialistas y Clientes</h3>
              <p style="font-size:0.8rem;margin:0;color:#64748B;">Fichas RRHH de tus especialistas y fichas completas de los clientes.</p>
            </div>
            <span style="font-size:0.8rem;font-weight:700;color:#059669;">Ver Fichas →</span>
          </a>

          <a href="suscripcion.html" class="wts-aa-nav-card">
            <div>
              <div class="wts-aa-nav-card__icon" style="background:#FEF3C7;color:#D97706;">💶</div>
              <h3 style="font-size:1rem;margin-top:0.65rem;">Tarifas y Planes</h3>
              <p style="font-size:0.8rem;margin:0;color:#64748B;">Edita precios y duración de sesiones individuales y cuotas mensuales.</p>
            </div>
            <span style="font-size:0.8rem;font-weight:700;color:#D97706;">Gestionar Precios →</span>
          </a>

          <a href="cuenta.html" class="wts-aa-nav-card">
            <div>
              <div class="wts-aa-nav-card__icon" style="background:#F3E8FF;color:#7C3AED;">⚙️</div>
              <h3 style="font-size:1rem;margin-top:0.65rem;">Opciones y Cuentas</h3>
              <p style="font-size:0.8rem;margin:0;color:#64748B;">Da de alta especialistas, asigna sus cuentas de trabajador y controla permisos.</p>
            </div>
            <span style="font-size:0.8rem;font-weight:700;color:#7C3AED;">Control Admin →</span>
          </a>
        </div>
      `;
    }

    /* =====================================================================
       3. SECCIÓN ADMIN: ESPECIALISTAS (CLICABLES) Y CLIENTES (CLICABLES)
       ===================================================================== */
    renderAdminDirectory() {
      if (!this.adminContainer) return;
      const resources = this._readJson(this.resourcesStorageKey);
      const users = this._readJson(this.usersStorageKey);
      const plans = this._readJson(this.plansStorageKey);
      const events = this._readJson(this.eventsStorageKey);
      const clinicalRecords = this._readJson(this.clinicalStorageKey);

      const planMap = Object.fromEntries(plans.map((p) => [p.id, p]));
      const clients = users.filter((u) => u.role === 'client');

      const specialistsCardsHtml = resources
        .map((spec) => {
          const activeCitas = events.filter((e) => e.resourceId === spec.id && e.status !== 'cancelled').length;
          return `
            <article class="wts-aa-spec-card" data-open-spec="${spec.id}">
              <img src="${spec.avatar}" alt="${spec.name}" loading="lazy" class="wts-aa-spec-card__img" />
              <div class="wts-aa-spec-card__body">
                <div>
                  <span style="display:inline-block;font-size:0.68rem;font-weight:700;text-transform:uppercase;padding:0.15rem 0.45rem;border-radius:4px;background:#F0F9FF;color:#0284C7;margin-bottom:0.3rem;">
                    ${this.areaLabels[spec.category] || spec.category}
                  </span>
                  <h3 style="font-size:1rem;margin-bottom:0.15rem;">${spec.name}</h3>
                  <div style="font-size:0.78rem;color:#64748B;">${spec.role}</div>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;padding-top:0.6rem;border-top:1px solid #F1F5F9;font-size:0.76rem;font-weight:600;">
                  <span style="color:#475569;">${activeCitas} citas activas</span>
                  <span style="color:#0284C7;">Ver ficha RRHH →</span>
                </div>
              </div>
            </article>
          `;
        })
        .join('');

      const clientsCardsHtml =
        clients.length > 0
          ? clients
              .map((cli) => {
                const plan = planMap[cli.planId] || plans[0];
                const cliEvents = events.filter(
                  (e) =>
                    e.status !== 'cancelled' &&
                    ((e.patientEmail && e.patientEmail.toLowerCase() === cli.email.toLowerCase()) ||
                      e.patientName.toLowerCase() === cli.name.toLowerCase())
                );
                const clinRec = clinicalRecords.find(
                  (r) => r.patientEmail && r.patientEmail.toLowerCase() === cli.email.toLowerCase()
                );
                const entriesCount = clinRec ? clinRec.entries.length : 0;

                return `
                  <article class="wts-aa-client-sub-card" data-open-admin-client="${encodeURIComponent(cli.email)}">
                    <div>
                      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem;">
                        <h3 style="font-size:0.98rem;margin:0;">${cli.name}</h3>
                        <span class="wts-aa-sub-pill">${plan ? plan.name : 'Acceso Libre'}</span>
                      </div>
                      <div style="font-size:0.78rem;color:#64748B;margin-top:0.3rem;">
                        📧 ${cli.email} · 📞 ${cli.phone || 'N/D'}
                      </div>
                    </div>

                    <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:0.65rem 0.75rem;font-size:0.78rem;display:grid;gap:0.25rem;">
                      <div style="display:flex;justify-content:space-between;">
                        <span style="color:#64748B;">Suscrito desde:</span>
                        <strong>${cli.subscribedSince || '2025-10-01'}</strong>
                      </div>
                      <div style="display:flex;justify-content:space-between;">
                        <span style="color:#64748B;">Cuota actual:</span>
                        <strong>${plan ? (Number(plan.price) === 0 ? 'Gratis (0 €)' : `${plan.price} €/mes`) : '0 €'}</strong>
                      </div>
                      <div style="display:flex;justify-content:space-between;">
                        <span style="color:#64748B;">Sesiones / Informes:</span>
                        <strong>${cliEvents.length} citas · ${entriesCount} notas</strong>
                      </div>
                    </div>

                    <div style="display:flex;justify-content:space-between;align-items:center;padding-top:0.45rem;border-top:1px solid #F1F5F9;font-size:0.76rem;font-weight:700;color:#059669;">
                      <span>Ver historial y opciones</span>
                      <span>Abrir ficha cliente →</span>
                    </div>
                  </article>
                `;
              })
              .join('')
          : `<p style="color:#64748B;font-size:0.9rem;">No hay clientes registrados actualmente.</p>`;

      this.adminContainer.innerHTML = `
        <div class="apex-page-head">
          <div>
            <h1>Especialistas y Clientes</h1>
            <p>Pulsa encima de cualquier especialista o cliente para abrir su ficha completa de gestión.</p>
          </div>
          <a href="cuenta.html" class="wts-aa-btn wts-aa-btn--primary">+ Alta Especialista y Cuenta</a>
        </div>

        <h2 style="font-size:1.05rem;margin-bottom:0.8rem;">1. Equipo de Especialistas (${resources.length})</h2>
        <div class="wts-aa-dir-grid" style="margin-bottom:2rem;">${specialistsCardsHtml}</div>

        <h2 style="font-size:1.05rem;margin-bottom:0.8rem;">2. Clientes y Suscripciones Activas (${clients.length})</h2>
        <div class="wts-aa-dir-grid">${clientsCardsHtml}</div>
      `;

      this.adminContainer.querySelectorAll('[data-open-spec]').forEach((card) => {
        card.addEventListener('click', () => {
          const specId = card.getAttribute('data-open-spec');
          window.location.href = `especialista-ficha.html?id=${encodeURIComponent(specId)}`;
        });
      });

      this.adminContainer.querySelectorAll('[data-open-admin-client]').forEach((card) => {
        card.addEventListener('click', () => {
          const encodedEmail = card.getAttribute('data-open-admin-client');
          window.location.href = `cliente-admin.html?email=${encodedEmail}`;
        });
      });
    }

    /* =====================================================================
       4. FICHA DE CLIENTE PARA ADMINISTRADOR (cliente-admin.html)
       Muestra lo que tiene contratado/agendado, entradas de especialistas y Baja
       ===================================================================== */
    renderAdminClientDetailPage(encodedEmail) {
      if (!this.adminContainer) return;
      const email = decodeURIComponent(encodedEmail || '').toLowerCase().trim();
      const users = this._readJson(this.usersStorageKey);
      const plans = this._readJson(this.plansStorageKey);
      const events = this._readJson(this.eventsStorageKey);
      const resources = this._readJson(this.resourcesStorageKey);
      const clinicalRecords = this._readJson(this.clinicalStorageKey);

      const client = users.find((u) => u.role === 'client' && u.email.toLowerCase() === email);

      if (!client) {
        this.adminContainer.innerHTML = `
          <div class="wts-aa-panel">
            <h2>Cliente no encontrado o dado de baja</h2>
            <a href="especialistas.html" class="wts-aa-btn">← Volver a Especialistas y Clientes</a>
          </div>
        `;
        return;
      }

      const plan = plans.find((p) => p.id === client.planId) || plans[0];
      const resMap = Object.fromEntries(resources.map((r) => [r.id, r]));

      const clientEvents = events.filter(
        (ev) =>
          (ev.patientEmail && ev.patientEmail.toLowerCase() === client.email.toLowerCase()) ||
          ev.patientName.toLowerCase() === client.name.toLowerCase()
      );

      const clinRecord = clinicalRecords.find(
        (rec) =>
          (rec.patientEmail && rec.patientEmail.toLowerCase() === client.email.toLowerCase()) ||
          rec.patientName.toLowerCase() === client.name.toLowerCase()
      );

      const specialistEntries = clinRecord && Array.isArray(clinRecord.entries) ? clinRecord.entries : [];

      const eventsHtml =
        clientEvents.length > 0
          ? clientEvents
              .map((ev) => {
                const doc = resMap[ev.resourceId];
                const statusLabel =
                  ev.status === 'completed'
                    ? 'Completada'
                    : ev.status === 'cancelled'
                    ? 'Cancelada'
                    : 'Confirmada';
                return `
                  <div style="padding:0.7rem 0.85rem;border:1px solid #E2E8F0;background:#F8FAFC;border-radius:8px;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:0.5rem;">
                    <div>
                      <strong style="font-size:0.88rem;color:#0F172A;">${ev.title}</strong>
                      <div style="font-size:0.78rem;color:#64748B;">
                        📅 ${ev.date} · ${String(ev.startHour).padStart(2, '0')}:00 · Con ${doc ? doc.name : 'Especialista'}
                      </div>
                    </div>
                    <div style="display:flex;align-items:center;gap:0.5rem;">
                      <span style="font-weight:700;font-size:0.82rem;">${ev.price} €</span>
                      <span style="font-size:0.72rem;font-weight:700;padding:0.18rem 0.5rem;border-radius:999px;background:${
                        ev.status === 'cancelled' ? '#FEF2F2' : '#ECFDF5'
                      };color:${ev.status === 'cancelled' ? '#DC2626' : '#059669'};">
                        ${statusLabel}
                      </span>
                    </div>
                  </div>
                `;
              })
              .join('')
          : `<p style="font-size:0.85rem;color:#64748B;margin:0;">Este cliente aún no tiene sesiones registradas en el calendario.</p>`;

      const entriesHtml =
        specialistEntries.length > 0
          ? specialistEntries
              .map(
                (ent) => `
                <article class="wts-aa-entry-card">
                  <div style="display:flex;flex-wrap:wrap;justify-content:space-between;font-size:0.76rem;color:#64748B;margin-bottom:0.25rem;">
                    <span><strong>${ent.author}</strong> · ${ent.area}</span>
                    <span>📅 ${ent.date}</span>
                  </div>
                  <div style="font-weight:700;font-size:0.9rem;color:#0F172A;margin-bottom:0.25rem;">${ent.diagnosis}</div>
                  <p style="margin:0;font-size:0.84rem;color:#334155;">${ent.evolution}</p>
                </article>
              `
              )
              .join('')
          : `<p style="font-size:0.85rem;color:#64748B;margin:0;">Ningún especialista ha añadido entradas clínicas a este cliente todavía.</p>`;

      this.adminContainer.innerHTML = `
        <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:0.75rem;margin-bottom:1.15rem;">
          <div style="display:flex;align-items:center;gap:0.75rem;">
            <a href="especialistas.html" class="wts-aa-btn">← Especialistas y Clientes</a>
            <div>
              <h1 style="font-size:1.28rem;margin:0;">Ficha de Cliente · ${client.name}</h1>
              <span style="font-size:0.8rem;color:#64748B;">Control administrativo, actividad e informes de especialistas</span>
            </div>
          </div>

          <div style="display:flex;flex-wrap:wrap;gap:0.5rem;">
            <a href="tel:${(client.phone || '').replace(/\s+/g, '')}" class="wts-aa-btn">📞 Llamar</a>
            <button type="button" id="wts-aa-deactivate-client-btn" class="wts-aa-btn wts-aa-btn--danger">
              ✕ Dar de Baja al Cliente
            </button>
          </div>
        </div>

        <div class="wts-aa-spec-detail-grid">
          <!-- Columna Izquierda: Suscripción y Datos del Socio -->
          <aside class="wts-aa-panel">
            <span class="wts-aa-sub-pill" style="margin-bottom:0.65rem;">${plan ? plan.name : 'Acceso Libre'}</span>
            <h3 style="margin-bottom:0.2rem;">${client.name}</h3>
            <div style="font-size:0.8rem;color:#64748B;margin-bottom:0.9rem;">${client.sport || 'Socio Deportivo'}</div>

            <div style="display:grid;gap:0.6rem;font-size:0.84rem;">
              <div class="wts-aa-data-tile">
                <span>Suscrito desde</span>
                <strong>${client.subscribedSince || '2025-10-01'}</strong>
              </div>
              <div class="wts-aa-data-tile">
                <span>Cuota Mensual</span>
                <strong>${plan ? (Number(plan.price) === 0 ? 'Gratis (0 €/mes)' : `${plan.price} €/mes`) : '0 €/mes'}</strong>
              </div>
              <div class="wts-aa-data-tile">
                <span>Teléfono</span>
                <strong>${client.phone || 'No registrado'}</strong>
              </div>
              <div class="wts-aa-data-tile">
                <span>Correo electrónico</span>
                <strong>${client.email}</strong>
              </div>
            </div>
          </aside>

          <!-- Columna Derecha: Lo que tiene ya + Entradas de los especialistas -->
          <div class="wts-aa-admin-stack">
            <section class="wts-aa-panel">
              <h3 style="margin-bottom:0.75rem;">Sesiones y Servicios Contratados (${clientEvents.length})</h3>
              <div style="display:grid;gap:0.55rem;">${eventsHtml}</div>
            </section>

            <section class="wts-aa-panel">
              <h3 style="margin-bottom:0.75rem;">Entradas y Evolución Registrada por Especialistas (${specialistEntries.length})</h3>
              <div>${entriesHtml}</div>
            </section>
          </div>
        </div>
      `;

      const deactivateBtn = this.adminContainer.querySelector('#wts-aa-deactivate-client-btn');
      if (deactivateBtn) {
        deactivateBtn.addEventListener('click', () => {
          const confirmed = window.confirm(
            `¿Confirmas dar de baja al cliente "${client.name}" (${client.email})? Se eliminará su acceso y se cancelarán sus citas pendientes.`
          );
          if (!confirmed) return;

          // 1. Eliminar cuenta del cliente de usuarios activos
          const remainingUsers = this._readJson(this.usersStorageKey).filter(
            (u) => !(u.role === 'client' && u.email.toLowerCase() === client.email.toLowerCase())
          );
          this._writeJson(this.usersStorageKey, remainingUsers);

          // 2. Cancelar sus citas futuras/confirmadas
          const updatedEvents = this._readJson(this.eventsStorageKey).map((ev) => {
            if (
              ev.status === 'confirmed' &&
              ((ev.patientEmail && ev.patientEmail.toLowerCase() === client.email.toLowerCase()) ||
                ev.patientName.toLowerCase() === client.name.toLowerCase())
            ) {
              return { ...ev, status: 'cancelled' };
            }
            return ev;
          });
          this._writeJson(this.eventsStorageKey, updatedEvents);

          window.location.href = 'especialistas.html';
        });
      }
    }

    /* =====================================================================
       5. FICHA COMPLETA DEL ESPECIALISTA PARA ADMIN (especialista-ficha.html)
       ===================================================================== */
    renderSpecialistDetailPage(specId) {
      if (!this.adminContainer) return;
      const resources = this._readJson(this.resourcesStorageKey);
      const events = this._readJson(this.eventsStorageKey);
      const spec = resources.find((r) => r.id === specId) || resources[0];

      if (!spec) {
        this.adminContainer.innerHTML = `<div class="wts-aa-panel"><p>Especialista no encontrado.</p><a href="especialistas.html" class="wts-aa-btn">← Volver</a></div>`;
        return;
      }

      const specEvents = events.filter((e) => e.resourceId === spec.id && e.status !== 'cancelled');
      const uniqueClients = new Set(specEvents.map((e) => (e.patientEmail || e.patientName).toLowerCase())).size;
      const weeklyAvg = spec.weeklyAvgAppointments || Math.max(8, specEvents.length * 4);

      this.adminContainer.innerHTML = `
        <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:0.75rem;margin-bottom:1.15rem;">
          <div style="display:flex;align-items:center;gap:0.75rem;">
            <a href="especialistas.html" class="wts-aa-btn">← Especialistas y Clientes</a>
            <div>
              <h1 style="font-size:1.28rem;margin:0;">Ficha de Especialista · ${spec.name}</h1>
              <span style="font-size:0.8rem;color:#64748B;">${this.areaLabels[spec.category] || spec.category} · ${spec.role}</span>
            </div>
          </div>
          <a href="tel:${(spec.phone || '+34910842100').replace(/\s+/g, '')}" class="wts-aa-btn wts-aa-btn--success">
            📞 Llamar: ${spec.phone || '+34 910 842 100'}
          </a>
        </div>

        <div class="wts-aa-spec-detail-grid">
          <aside class="wts-aa-panel" style="padding:0;overflow:hidden;">
            <img src="${spec.avatar}" alt="${spec.name}" style="width:100%;height:240px;object-fit:cover;" />
            <div style="padding:1.1rem;">
              <span style="display:inline-block;font-size:0.7rem;font-weight:700;text-transform:uppercase;padding:0.18rem 0.5rem;border-radius:4px;background:#F0F9FF;color:#0284C7;margin-bottom:0.4rem;">
                ${this.areaLabels[spec.category] || spec.category}
              </span>
              <h3 style="margin-bottom:0.2rem;">${spec.name}</h3>
              <div style="font-size:0.8rem;color:#64748B;margin-bottom:0.65rem;">${spec.license || 'Colegiado Activo'}</div>
              <p style="font-size:0.82rem;margin:0;">${spec.bio || ''}</p>
            </div>
          </aside>

          <section class="wts-aa-panel">
            <h3 style="margin-bottom:0.9rem;">Datos Contractuales, Económicos y Rendimiento</h3>
            <div class="wts-aa-spec-data-grid">
              <div class="wts-aa-data-tile">
                <span>Nombre y Apellidos</span>
                <strong>${spec.name}</strong>
              </div>
              <div class="wts-aa-data-tile">
                <span>Especialidad / Unidad</span>
                <strong>${this.areaLabels[spec.category] || spec.category}</strong>
              </div>
              <div class="wts-aa-data-tile">
                <span>Edad</span>
                <strong>${spec.age || 34} años</strong>
              </div>
              <div class="wts-aa-data-tile">
                <span>Trabajando aquí desde</span>
                <strong>${spec.hiredSince || '14/03/2022'}</strong>
              </div>
              <div class="wts-aa-data-tile">
                <span>Tipo de Contrato</span>
                <strong>${spec.contractType || 'Indefinido · 40h/sem'}</strong>
              </div>
              <div class="wts-aa-data-tile">
                <span>Sueldo Bruto Anual</span>
                <strong>${spec.salary || '38.500 €/año'}</strong>
              </div>
              <div class="wts-aa-data-tile">
                <span>Clientes Asignados</span>
                <strong>${Math.max(uniqueClients, spec.totalClients || 18)} pacientes</strong>
              </div>
              <div class="wts-aa-data-tile">
                <span>Citas Semanales de Media</span>
                <strong>${weeklyAvg} citas / semana</strong>
              </div>
              <div class="wts-aa-data-tile">
                <span>Teléfono Directo</span>
                <strong>${spec.phone || '+34 910 842 100'}</strong>
              </div>
            </div>
          </section>
        </div>
      `;
    }

    /* =====================================================================
       6. OPCIONES Y CONTROL DE ADMINISTRADOR (cuenta.html en Modo Admin)
       ===================================================================== */
    renderAdminControlOptions() {
      if (!this.adminContainer) return;
      const resources = this._readJson(this.resourcesStorageKey);
      const users = this._readJson(this.usersStorageKey);
      const workerAccounts = users.filter((u) => u.role === 'staff' || u.role === 'admin');

      const areaOptions = Object.keys(this.areaLabels)
        .map((k) => `<option value="${k}">${this.areaLabels[k]}</option>`)
        .join('');

      const specRowsHtml = resources
        .map(
          (r) => `
          <tr>
            <td><strong>${r.name}</strong><div style="font-size:0.75rem;color:#64748B;">${r.role}</div></td>
            <td>${this.areaLabels[r.category] || r.category}</td>
            <td>${r.contractType || 'Indefinido 40h'}</td>
            <td>${r.salary || '38.500 €/año'}</td>
            <td><button type="button" class="wts-aa-btn wts-aa-btn--danger" style="padding:0.35rem 0.65rem;font-size:0.78rem;" data-del-spec="${r.id}">Baja</button></td>
          </tr>
        `
        )
        .join('');

      const workerAccRowsHtml = workerAccounts
        .map((acc) => {
          const linked = resources.find((r) => r.id === acc.linkedResourceId);
          return `
            <tr>
              <td><strong>${acc.name}</strong><div style="font-size:0.75rem;color:#64748B;">${acc.email}</div></td>
              <td>${acc.role === 'admin' ? 'Administrador Total' : 'Trabajador / Especialista'}</td>
              <td>${acc.role === 'admin' ? 'Todas las agendas' : linked ? linked.name : 'Sin vincular'}</td>
            </tr>
          `;
        })
        .join('');

      this.adminContainer.innerHTML = `
        <div class="apex-page-head">
          <div>
            <h1>Opciones de Control y Gestión de Cuentas</h1>
            <p>Administra la plantilla de especialistas, asigna credenciales de trabajador y configura los permisos operativos del centro.</p>
          </div>
          <a href="dashboard.html" class="wts-aa-btn">Volver al Panel</a>
        </div>

        <div id="wts-aa-ctrl-toast" class="wts-aa-alert wts-aa-alert--ok" hidden style="margin-bottom:1rem;"></div>

        <div class="wts-aa-admin-stack">
          <section class="wts-aa-panel">
            <h3 style="margin-bottom:0.25rem;">1. Alta de Especialista y Asignación de Cuenta de Trabajador</h3>
            <p style="font-size:0.82rem;color:#64748B;margin-bottom:0.9rem;">Crea la ficha del especialista y genera automáticamente su usuario y contraseña para entrar a la intranet.</p>

            <form id="wts-aa-create-worker-full" class="wts-aa-form">
              <div class="wts-aa-form-grid-2 wts-aa-form-grid-3">
                <div class="wts-aa-field">
                  <label>Nombre y apellidos</label>
                  <input type="text" name="name" class="wts-aa-input" placeholder="Ej. Dr. Álvaro Vega" required />
                </div>
                <div class="wts-aa-field">
                  <label>Especialidad / Unidad</label>
                  <select name="category" class="wts-aa-input">${areaOptions}</select>
                </div>
                <div class="wts-aa-field">
                  <label>Cargo clínico</label>
                  <input type="text" name="role" class="wts-aa-input" placeholder="Médico Traumatólogo" required />
                </div>
              </div>

              <div class="wts-aa-form-grid-2 wts-aa-form-grid-3">
                <div class="wts-aa-field">
                  <label>Edad</label>
                  <input type="number" name="age" class="wts-aa-input" value="32" min="21" max="75" required />
                </div>
                <div class="wts-aa-field">
                  <label>Tipo de contrato</label>
                  <input type="text" name="contractType" class="wts-aa-input" value="Indefinido · 40h/sem" required />
                </div>
                <div class="wts-aa-field">
                  <label>Sueldo bruto anual</label>
                  <input type="text" name="salary" class="wts-aa-input" value="36.000 €/año" required />
                </div>
              </div>

              <div class="wts-aa-form-grid-2 wts-aa-form-grid-3">
                <div class="wts-aa-field">
                  <label>Teléfono directo</label>
                  <input type="tel" name="phone" class="wts-aa-input" placeholder="+34 910 842 108" required />
                </div>
                <div class="wts-aa-field">
                  <label>Email de acceso Intranet</label>
                  <input type="email" name="email" class="wts-aa-input" placeholder="a.vega@apexsport.es" required />
                </div>
                <div class="wts-aa-field">
                  <label>Contraseña asignada</label>
                  <input type="text" name="password" class="wts-aa-input" value="apex2026" required />
                </div>
              </div>

              <div style="display:flex;justify-content:flex-end;">
                <button type="submit" class="wts-aa-btn wts-aa-btn--primary">+ Dar de Alta Especialista y Crear Cuenta</button>
              </div>
            </form>
          </section>

          <section class="wts-aa-panel">
            <h3 style="margin-bottom:0.85rem;">2. Cuentas de Trabajadores Activas (${workerAccounts.length})</h3>
            <div class="wts-aa-table-scroll">
              <table class="wts-aa-crud-table">
                <thead><tr><th>Usuario / Email</th><th>Nivel de Acceso</th><th>Agenda Vinculada</th></tr></thead>
                <tbody>${workerAccRowsHtml}</tbody>
              </table>
            </div>
          </section>

          <section class="wts-aa-panel">
            <h3 style="margin-bottom:0.85rem;">3. Plantilla Activa y Bajas (${resources.length})</h3>
            <div class="wts-aa-table-scroll">
              <table class="wts-aa-crud-table">
                <thead><tr><th>Especialista</th><th>Unidad</th><th>Contrato</th><th>Sueldo</th><th>Acción</th></tr></thead>
                <tbody>${specRowsHtml}</tbody>
              </table>
            </div>
          </section>
        </div>
      `;

      const createForm = this.adminContainer.querySelector('#wts-aa-create-worker-full');
      if (createForm) {
        createForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const fd = new FormData(createForm);
          const name = String(fd.get('name')).trim();
          const category = String(fd.get('category'));
          const role = String(fd.get('role')).trim();
          const email = String(fd.get('email')).trim().toLowerCase();
          const phone = String(fd.get('phone')).trim();
          const newSpecId = 'spec-' + Date.now();

          const allSpecs = this._readJson(this.resourcesStorageKey);
          allSpecs.push({
            id: newSpecId,
            name,
            role,
            category,
            phone,
            age: Number(fd.get('age')),
            hiredSince: new Date().toLocaleDateString('es-ES'),
            contractType: String(fd.get('contractType')).trim(),
            salary: String(fd.get('salary')).trim(),
            totalClients: 0,
            weeklyAvgAppointments: 12,
            license: 'Col. Registrado · Alta Dirección',
            color: '#0284C7',
            avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=80',
            bio: 'Especialista incorporado desde el panel de dirección.'
          });
          this._writeJson(this.resourcesStorageKey, allSpecs);

          const allUsers = this._readJson(this.usersStorageKey);
          allUsers.push({
            id: 'usr-' + Date.now(),
            name,
            email,
            phone,
            password: String(fd.get('password')).trim(),
            role: 'staff',
            roleLabel: `Trabajador · ${this.areaLabels[category] || category}`,
            linkedResourceId: newSpecId
          });
          this._writeJson(this.usersStorageKey, allUsers);

          this.renderAdminControlOptions();
          const toast = this.adminContainer.querySelector('#wts-aa-ctrl-toast');
          if (toast) {
            toast.textContent = `Especialista "${name}" dado de alta y cuenta de trabajador (${email}) asignada.`;
            toast.hidden = false;
          }
        });
      }

      this.adminContainer.querySelectorAll('[data-del-spec]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-del-spec');
          const filtered = this._readJson(this.resourcesStorageKey).filter((r) => r.id !== id);
          this._writeJson(this.resourcesStorageKey, filtered);
          this.renderAdminControlOptions();
        });
      });
    }

    /* =====================================================================
       7. GESTIÓN DE PRECIOS Y DURACIÓN DE SERVICIOS Y PLANES (suscripcion.html)
       ===================================================================== */
    renderAdminPlansAndServices() {
      if (!this.adminContainer) return;
      const plans = this._readJson(this.plansStorageKey);
      const services = this._readJson(this.servicesStorageKey);
      const areaOptions = Object.keys(this.areaLabels)
        .map((k) => `<option value="${k}">${this.areaLabels[k]}</option>`)
        .join('');

      const plansRows = plans
        .map(
          (p) => `
          <tr>
            <td><strong>${p.name}</strong></td>
            <td><input type="number" class="wts-aa-input" style="width:82px;" value="${p.sessionsIncluded}" data-plan-sessions="${p.id}" /> ses./mes</td>
            <td><input type="number" class="wts-aa-input" style="width:82px;" value="${p.price}" data-plan-price="${p.id}" /> €/mes</td>
          </tr>
        `
        )
        .join('');

      const servicesRows = services
        .map(
          (s) => `
          <tr>
            <td><strong>${s.name}</strong><div style="font-size:0.74rem;color:#64748B;">${this.areaLabels[s.category] || s.category}</div></td>
            <td><input type="number" class="wts-aa-input" style="width:78px;" value="${s.duration}" min="15" step="15" data-srv-duration="${s.id}" /> min</td>
            <td><input type="number" class="wts-aa-input" style="width:78px;" value="${s.price}" min="0" step="5" data-srv-price="${s.id}" /> €</td>
            <td><button type="button" class="wts-aa-btn wts-aa-btn--danger" style="padding:0.32rem 0.6rem;font-size:0.76rem;" data-del-srv="${s.id}">Eliminar</button></td>
          </tr>
        `
        )
        .join('');

      this.adminContainer.innerHTML = `
        <div class="apex-page-head">
          <div>
            <h1>Tarifas, Duración de Servicios y Planes</h1>
            <p>Cualquier modificación de precio o duración se sincroniza al instante con los socios y el calendario de reservas.</p>
          </div>
          <a href="dashboard.html" class="wts-aa-btn">Volver al Panel</a>
        </div>

        <div id="wts-aa-pricing-toast" class="wts-aa-alert wts-aa-alert--ok" hidden style="margin-bottom:1rem;"></div>

        <div class="wts-aa-admin-stack">
          <div class="wts-aa-panel">
            <h3 style="margin-bottom:0.85rem;">1. Cuotas de Suscripción Mensual para Socios</h3>
            <div class="wts-aa-table-scroll">
              <table class="wts-aa-crud-table">
                <thead><tr><th>Modalidad / Plan</th><th>Sesiones Incluidas</th><th>Precio Mensual</th></tr></thead>
                <tbody>${plansRows}</tbody>
              </table>
            </div>
          </div>

          <div class="wts-aa-panel">
            <h3 style="margin-bottom:0.85rem;">2. Precios y Duración de Sesiones Individuales</h3>

            <form id="wts-aa-add-srv-form" class="wts-aa-form-grid-2" style="background:#F8FAFC;padding:0.85rem;border-radius:8px;border:1px solid #E2E8F0;margin-bottom:1rem;">
              <div class="wts-aa-field">
                <label>Nuevo servicio clínico / deportivo</label>
                <input type="text" name="name" class="wts-aa-input" placeholder="Ej. Estudio Biomecánico 3D" required />
              </div>
              <div class="wts-aa-field">
                <label>Unidad</label>
                <select name="category" class="wts-aa-input">${areaOptions}</select>
              </div>
              <div class="wts-aa-field">
                <label>Duración (min)</label>
                <input type="number" name="duration" class="wts-aa-input" value="60" min="15" step="15" required />
              </div>
              <div class="wts-aa-field" style="display:flex;gap:0.5rem;align-items:flex-end;">
                <div style="flex:1;">
                  <label>Precio (€)</label>
                  <input type="number" name="price" class="wts-aa-input" value="80" min="0" step="5" required />
                </div>
                <button type="submit" class="wts-aa-btn wts-aa-btn--primary">+ Añadir</button>
              </div>
            </form>

            <div class="wts-aa-table-scroll">
              <table class="wts-aa-crud-table">
                <thead><tr><th>Servicio</th><th>Duración</th><th>Precio</th><th>Acción</th></tr></thead>
                <tbody>${servicesRows}</tbody>
              </table>
            </div>
          </div>
        </div>
      `;

      const showSaved = (msg) => {
        const toast = this.adminContainer.querySelector('#wts-aa-pricing-toast');
        if (toast) {
          toast.textContent = msg;
          toast.hidden = false;
        }
      };

      this.adminContainer.querySelectorAll('[data-plan-price]').forEach((inp) => {
        inp.addEventListener('change', () => {
          const list = this._readJson(this.plansStorageKey);
          const item = list.find((p) => p.id === inp.getAttribute('data-plan-price'));
          if (item) {
            item.price = Number(inp.value);
            this._writeJson(this.plansStorageKey, list);
            showSaved(`Cuota de "${item.name}" actualizada a ${item.price} €/mes.`);
          }
        });
      });

      this.adminContainer.querySelectorAll('[data-plan-sessions]').forEach((inp) => {
        inp.addEventListener('change', () => {
          const list = this._readJson(this.plansStorageKey);
          const item = list.find((p) => p.id === inp.getAttribute('data-plan-sessions'));
          if (item) {
            item.sessionsIncluded = Number(inp.value);
            this._writeJson(this.plansStorageKey, list);
            showSaved(`Sesiones de "${item.name}" actualizadas a ${item.sessionsIncluded} al mes.`);
          }
        });
      });

      this.adminContainer.querySelectorAll('[data-srv-price]').forEach((inp) => {
        inp.addEventListener('change', () => {
          const list = this._readJson(this.servicesStorageKey);
          const item = list.find((s) => s.id === inp.getAttribute('data-srv-price'));
          if (item) {
            item.price = Number(inp.value);
            this._writeJson(this.servicesStorageKey, list);
            showSaved(`Tarifa de "${item.name}" actualizada a ${item.price} €.`);
          }
        });
      });

      this.adminContainer.querySelectorAll('[data-srv-duration]').forEach((inp) => {
        inp.addEventListener('change', () => {
          const list = this._readJson(this.servicesStorageKey);
          const item = list.find((s) => s.id === inp.getAttribute('data-srv-duration'));
          if (item) {
            item.duration = Number(inp.value);
            this._writeJson(this.servicesStorageKey, list);
            showSaved(`Duración de "${item.name}" actualizada a ${item.duration} min.`);
          }
        });
      });

      const addSrvForm = this.adminContainer.querySelector('#wts-aa-add-srv-form');
      if (addSrvForm) {
        addSrvForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const fd = new FormData(addSrvForm);
          const list = this._readJson(this.servicesStorageKey);
          list.push({
            id: 'srv-' + Date.now(),
            name: String(fd.get('name')).trim(),
            category: String(fd.get('category')),
            duration: Number(fd.get('duration')),
            price: Number(fd.get('price'))
          });
          this._writeJson(this.servicesStorageKey, list);
          this.renderAdminPlansAndServices();
          showSaved('Nuevo servicio añadido al catálogo.');
        });
      }

      this.adminContainer.querySelectorAll('[data-del-srv]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-del-srv');
          const list = this._readJson(this.servicesStorageKey).filter((s) => s.id !== id);
          this._writeJson(this.servicesStorageKey, list);
          this.renderAdminPlansAndServices();
        });
      });
    }

    /* =====================================================================
       8. PERFIL CLIENTE/STAFF Y SUSCRIPCIÓN CLIENTE
       ===================================================================== */
    renderAccountSettingsView() {
      if (!this.adminContainer) return;
      const session = this.getSession();
      if (!session) return;

      if (session.role === 'admin') {
        this.renderAdminControlOptions();
        return;
      }

      if (session.role === 'staff') {
        this.adminContainer.innerHTML = `
          <div class="apex-page-head">
            <div>
              <h1>Ficha Laboral y Datos del Especialista</h1>
              <p>Gestiona tus datos profesionales, número de colegiado, Seguridad Social y cuenta bancaria.</p>
            </div>
            <a href="dashboard.html" class="wts-aa-btn">Volver a Mi Estación</a>
          </div>

          <div id="wts-aa-account-toast" class="wts-aa-alert wts-aa-alert--ok" hidden style="margin-bottom:1rem;"></div>

          <section class="wts-aa-panel">
            <form id="wts-aa-worker-form" class="wts-aa-form">
              <div class="wts-aa-form-grid-2">
                <div class="wts-aa-field">
                  <label>Nombre y titulación</label>
                  <input type="text" name="name" class="wts-aa-input" value="${session.name || ''}" required />
                </div>
                <div class="wts-aa-field">
                  <label>DNI / NIF</label>
                  <input type="text" name="nif" class="wts-aa-input" value="${session.nif || '48291045-K'}" required />
                </div>
              </div>

              <div class="wts-aa-form-grid-2">
                <div class="wts-aa-field">
                  <label>Número de Colegiado / Licencia</label>
                  <input type="text" name="licenseNumber" class="wts-aa-input" value="${session.licenseNumber || 'COL-FISIO-04819'}" required />
                </div>
                <div class="wts-aa-field">
                  <label>Teléfono directo de consulta</label>
                  <input type="tel" name="phone" class="wts-aa-input" value="${session.phone || '+34 910 842 102'}" required />
                </div>
              </div>

              <div class="wts-aa-form-grid-2">
                <div class="wts-aa-field">
                  <label>Número de la Seguridad Social (NUSS)</label>
                  <input type="text" name="ssn" class="wts-aa-input" value="${session.ssn || '28 / 1049283719 / 42'}" required />
                </div>
                <div class="wts-aa-field">
                  <label>Cuenta Bancaria (IBAN Nómina)</label>
                  <input type="text" name="iban" class="wts-aa-input" value="${session.iban || 'ES91 2100 0418 4502 0005 1332'}" required />
                </div>
              </div>

              <div class="wts-aa-form-grid-2">
                <div class="wts-aa-field">
                  <label>Correo corporativo</label>
                  <input type="email" name="email" class="wts-aa-input" value="${session.email || ''}" required />
                </div>
                <div class="wts-aa-field">
                  <label>Contraseña</label>
                  <input type="password" name="password" class="wts-aa-input" value="${session.password || 'demo'}" required />
                </div>
              </div>

              <div style="display:flex;justify-content:flex-end;">
                <button type="submit" class="wts-aa-btn wts-aa-btn--primary">Guardar Ficha Laboral</button>
              </div>
            </form>
          </section>
        `;

        const workerForm = this.adminContainer.querySelector('#wts-aa-worker-form');
        if (workerForm) {
          workerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(workerForm);
            const updatedWorker = {
              ...session,
              name: String(fd.get('name')).trim(),
              nif: String(fd.get('nif')).trim(),
              licenseNumber: String(fd.get('licenseNumber')).trim(),
              phone: String(fd.get('phone')).trim(),
              ssn: String(fd.get('ssn')).trim(),
              iban: String(fd.get('iban')).trim(),
              email: String(fd.get('email')).trim().toLowerCase(),
              password: String(fd.get('password'))
            };
            this.setSession(updatedWorker);
            const toast = this.adminContainer.querySelector('#wts-aa-account-toast');
            if (toast) {
              toast.textContent = 'Ficha laboral y bancaria actualizada.';
              toast.hidden = false;
            }
          });
        }
        return;
      }

      const plans = this._readJson(this.plansStorageKey);
      const currentPlan = plans.find((p) => p.id === session.planId) || plans[0];

      this.adminContainer.innerHTML = `
        <div class="apex-page-head">
          <div>
            <h1>Opciones de Mi Cuenta y Perfil</h1>
            <p>Actualiza tus datos de contacto, disciplina deportiva y preferencias de avisos.</p>
          </div>
          <a href="dashboard.html" class="wts-aa-btn">Volver al Panel</a>
        </div>

        <div id="wts-aa-account-toast" class="wts-aa-alert wts-aa-alert--ok" hidden style="margin-bottom:1rem;"></div>

        <div class="wts-aa-admin-stack">
          <section class="wts-aa-panel">
            <h3 style="margin-bottom:0.85rem;">Datos Personales y Contacto</h3>
            <form id="wts-aa-profile-form" class="wts-aa-form">
              <div class="wts-aa-form-grid-2">
                <div class="wts-aa-field">
                  <label>Nombre completo</label>
                  <input type="text" name="name" class="wts-aa-input" value="${session.name || ''}" required />
                </div>
                <div class="wts-aa-field">
                  <label>Teléfono de contacto</label>
                  <input type="tel" name="phone" class="wts-aa-input" value="${session.phone || ''}" required />
                </div>
              </div>

              <div class="wts-aa-form-grid-2">
                <div class="wts-aa-field">
                  <label>Correo electrónico</label>
                  <input type="email" name="email" class="wts-aa-input" value="${session.email || ''}" required />
                </div>
                <div class="wts-aa-field">
                  <label>Disciplina deportiva / Objetivo</label>
                  <input type="text" name="sport" class="wts-aa-input" value="${session.sport || 'Alto Rendimiento'}" />
                </div>
              </div>

              <div class="wts-aa-field">
                <label>Contraseña</label>
                <input type="password" name="password" class="wts-aa-input" value="${session.password || 'demo'}" required />
              </div>

              <div style="display:flex;justify-content:flex-end;">
                <button type="submit" class="wts-aa-btn wts-aa-btn--primary">Guardar Cambios</button>
              </div>
            </form>
          </section>

          ${
            currentPlan
              ? `
            <section class="wts-aa-panel" style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:1rem;">
              <div>
                <span style="font-size:0.74rem;font-weight:700;text-transform:uppercase;color:#059669;">Estado de Suscripción</span>
                <h3 style="margin:0.2rem 0;">${currentPlan.name} (${
                  Number(currentPlan.price) === 0 ? 'Gratis · 0 €/mes' : `${currentPlan.price} €/mes`
                })</h3>
                <p style="margin:0;font-size:0.84rem;color:#475569;">${currentPlan.description}</p>
              </div>
              <a href="suscripcion.html" class="wts-aa-btn wts-aa-btn--success">Gestionar o Mejorar Plan →</a>
            </section>
          `
              : ''
          }
        </div>
      `;

      const profileForm = this.adminContainer.querySelector('#wts-aa-profile-form');
      if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const fd = new FormData(profileForm);
          const updatedSession = {
            ...session,
            name: String(fd.get('name')).trim(),
            phone: String(fd.get('phone')).trim(),
            email: String(fd.get('email')).trim().toLowerCase(),
            sport: String(fd.get('sport') || '').trim(),
            password: String(fd.get('password'))
          };
          this.setSession(updatedSession);
          const toast = this.adminContainer.querySelector('#wts-aa-account-toast');
          if (toast) {
            toast.textContent = 'Datos de tu cuenta actualizados.';
            toast.hidden = false;
          }
        });
      }
    }

    renderClientSubscriptionView() {
      if (!this.adminContainer) return;
      const session = this.getSession();
      const plans = this._readJson(this.plansStorageKey);
      const currentPlan = plans.find((p) => p.id === session.planId) || plans[0];

      const plansCardsHtml = plans
        .map((plan) => {
          const isCurrent = currentPlan && plan.id === currentPlan.id;
          const isUpgrade = currentPlan && Number(plan.price) > Number(currentPlan.price);
          const isFree = Number(plan.price) === 0;
          const featuresHtml = (plan.features || []).map((f) => `<li>${f}</li>`).join('');

          return `
            <article class="wts-aa-plan-card ${isCurrent ? 'is-current' : ''}">
              <div>
                <span class="wts-aa-plan-badge">
                  ${isCurrent ? '✓ Tu Plan Activo' : plan.badge || 'Disponible'}
                </span>
                <h3 style="margin-top:0.55rem;font-size:1.12rem;">${plan.name}</h3>
                <div class="wts-aa-plan-price">
                  ${isFree ? 'Gratis' : `${plan.price} €`} <span>${isFree ? '· pago por sesión' : '/ mes'}</span>
                </div>
                <p style="font-size:0.83rem;color:#334155;">${plan.description}</p>
                <ul class="wts-aa-plan-features">${featuresHtml}</ul>
              </div>

              <div>
                ${
                  isCurrent
                    ? `<button type="button" class="wts-aa-btn wts-aa-btn--success" style="width:100%;cursor:default;" disabled>✓ Suscripción Activa Actual</button>`
                    : `<button type="button" class="wts-aa-btn ${
                        isUpgrade ? 'wts-aa-btn--primary' : ''
                      }" style="width:100%;" data-switch-plan="${plan.id}">
                        ${isUpgrade ? '⬆ Mejorar a este Plan' : 'Seleccionar este Plan'}
                      </button>`
                }
              </div>
            </article>
          `;
        })
        .join('');

      this.adminContainer.innerHTML = `
        <div class="apex-page-head">
          <div>
            <h1>Mi Suscripción y Planes</h1>
            <p>Tu plan activo aparece resaltado en verde. Puedes empezar gratis pagando solo por sesión suelta o mejorar a un bono mensual cuando quieras.</p>
          </div>
          <a href="dashboard.html" class="wts-aa-btn">Volver a Mi Calendario</a>
        </div>

        <div id="wts-aa-plan-toast" class="wts-aa-alert wts-aa-alert--ok" hidden style="margin-bottom:1rem;"></div>

        <div class="wts-aa-plans-grid">${plansCardsHtml}</div>
      `;

      this.adminContainer.querySelectorAll('[data-switch-plan]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const targetPlanId = btn.getAttribute('data-switch-plan');
          const pickedPlan = plans.find((p) => p.id === targetPlanId);
          if (!pickedPlan) return;

          const updatedSession = {
            ...session,
            planId: pickedPlan.id,
            roleLabel: `Socio / Paciente · ${pickedPlan.name}`
          };
          this.setSession(updatedSession);

          const users = this._readJson(this.usersStorageKey);
          const idx = users.findIndex((u) => u.email.toLowerCase() === session.email.toLowerCase());
          if (idx !== -1) {
            users[idx].planId = pickedPlan.id;
            users[idx].roleLabel = updatedSession.roleLabel;
            this._writeJson(this.usersStorageKey, users);
          }

          this.renderClientSubscriptionView();
          const toast = this.adminContainer.querySelector('#wts-aa-plan-toast');
          if (toast) {
            toast.textContent =
              Number(pickedPlan.price) === 0
                ? `Has cambiado a "${pickedPlan.name}" (0 €/mes, abonas únicamente cada sesión suelta que reserves).`
                : `Plan actualizado correctamente a "${pickedPlan.name}" (${pickedPlan.price} €/mes).`;
            toast.hidden = false;
          }
        });
      });
    }
  }

  window.WtsAuthAdmin = WtsAuthAdmin;
})();
