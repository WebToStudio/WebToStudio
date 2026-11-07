(function () {
  'use strict';

  const STORAGE_KEYS = {
    SESSION: 'apex_wts_auth_session_v2',
    USERS: 'apex_wts_users_v2',
    PLANS: 'apex_wts_plans_v2',
    RESOURCES: 'apex_wts_resources_v2',
    SERVICES: 'apex_wts_services_v2',
    EVENTS: 'apex_wts_events_v2',
    CLINICAL: 'apex_wts_clinical_v2'
  };

  const AREA_LABELS = {
    fisioterapia: 'Fisioterapia Avanzada',
    medicina: 'Medicina Deportiva',
    psicologia: 'Psicología del Rendimiento',
    entrenamiento: 'Entrenamiento Personal'
  };

  const AREA_COLORS = {
    fisioterapia: '#059669',
    medicina: '#0284C7',
    psicologia: '#7C3AED',
    entrenamiento: '#D97706'
  };

  const DEFAULT_PLANS = [
    {
      id: 'plan-free',
      name: 'Acceso Libre (Gratuito)',
      price: 0,
      sessionsIncluded: 0,
      badge: 'Sin Cuota Mensual',
      description: 'Explora la plataforma, consulta el calendario y reserva sesiones sueltas pagando solo por cada sesión.',
      features: [
        'Acceso completo a tu cuenta y calendario del centro',
        'Reserva de sesiones sueltas abonando la tarifa de cada sesión',
        'Directorio médico con llamada directa a especialistas',
        'Historial clínico digital de tus visitas'
      ]
    },
    {
      id: 'plan-base',
      name: 'Plan Salud Activa',
      price: 59,
      sessionsIncluded: 2,
      badge: 'Esencial',
      description: 'Mantenimiento preventivo y seguimiento mensual básico.',
      features: [
        '2 sesiones mensuales incluidas (Fisio o Entrenamiento)',
        'Reserva directa en calendario 24/7',
        'Línea directa con tu fisioterapeuta asignado',
        '10% de descuento en sesiones adicionales'
      ]
    },
    {
      id: 'plan-pro',
      name: 'Plan Rendimiento Pro',
      price: 119,
      sessionsIncluded: 5,
      badge: 'Más Elegido',
      description: 'Cobertura multidisciplinar para deportistas habituales y recuperación activa.',
      features: [
        '5 sesiones mensuales combinables en las 4 unidades',
        '1 valoración médica o ecográfica trimestral incluida',
        'Contacto telefónico prioritario con cuadro médico',
        '15% de descuento en sesiones adicionales'
      ]
    },
    {
      id: 'plan-elite',
      name: 'Plan Élite 360°',
      price: 199,
      sessionsIncluded: 10,
      badge: 'Alto Rendimiento',
      description: 'Acompañamiento integral de competición con medicina, fisio, psicología y fuerza.',
      features: [
        '10 sesiones mensuales en cualquier especialidad',
        'Prueba de esfuerzo con gases y analítica semestral',
        'Psicología deportiva y biofeedback HRV incluidos',
        'Atención urgente en menos de 24h con tu equipo'
      ]
    }
  ];

  const DEFAULT_RESOURCES = [
    {
      id: 'spec-1',
      name: 'Dra. Elena Mendoza',
      role: 'Directora de Medicina Deportiva',
      category: 'medicina',
      phone: '+34 910 842 101',
      age: 39,
      hiredSince: '10/01/2020',
      contractType: 'Indefinido · 40h/sem',
      salary: '48.000 €/año',
      totalClients: 32,
      weeklyAvgAppointments: 18,
      license: 'Col. 28/49102 · Medicina del Deporte',
      color: '#0284C7',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80',
      bio: 'Ergoespirometría, diagnóstico funcional y medicina regenerativa ecoguiada.'
    },
    {
      id: 'spec-2',
      name: 'Carlos Valdés, PT',
      role: 'Jefe de Fisioterapia Invasiva',
      category: 'fisioterapia',
      phone: '+34 910 842 102',
      age: 34,
      hiredSince: '14/03/2021',
      contractType: 'Indefinido · 40h/sem',
      salary: '39.500 €/año',
      totalClients: 41,
      weeklyAvgAppointments: 24,
      license: 'Col. Fisioterapeutas 04819',
      color: '#059669',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
      bio: 'Ecografía musculoesquelética, EPI y readaptación de lesiones tendinosas.'
    },
    {
      id: 'spec-3',
      name: 'Dra. Sofía Alarcón',
      role: 'Psicóloga del Alto Rendimiento',
      category: 'psicologia',
      phone: '+34 910 842 103',
      age: 31,
      hiredSince: '05/09/2022',
      contractType: 'Indefinido · 35h/sem',
      salary: '35.000 €/año',
      totalClients: 25,
      weeklyAvgAppointments: 15,
      license: 'Col. Psicólogos M-31904',
      color: '#7C3AED',
      avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=600&q=80',
      bio: 'Control cognitivo bajo presión, biofeedback HRV y recuperación mental post-lesión.'
    },
    {
      id: 'spec-4',
      name: 'Marcos Ibáñez, MSc',
      role: 'Responsable de Fuerza y Rendimiento',
      category: 'entrenamiento',
      phone: '+34 910 842 104',
      age: 29,
      hiredSince: '18/02/2023',
      contractType: 'Indefinido · 40h/sem',
      salary: '33.500 €/año',
      totalClients: 29,
      weeklyAvgAppointments: 21,
      license: 'CAFD 58210 · CSCS NSCA',
      color: '#D97706',
      avatar: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=600&q=80',
      bio: 'Perfil fuerza-velocidad, dinamometría isocinética y prevención estructural.'
    }
  ];

  const DEFAULT_SERVICES = [
    {
      id: 'srv-1',
      name: 'Fisioterapia Invasiva & Ecografía',
      category: 'fisioterapia',
      duration: 60,
      price: 75
    },
    {
      id: 'srv-2',
      name: 'Readaptación Funcional Post-Lesión',
      category: 'fisioterapia',
      duration: 60,
      price: 60
    },
    {
      id: 'srv-3',
      name: 'Consulta Medicina Deportiva',
      category: 'medicina',
      duration: 60,
      price: 110
    },
    {
      id: 'srv-4',
      name: 'Prueba de Esfuerzo con Gases',
      category: 'medicina',
      duration: 60,
      price: 145
    },
    {
      id: 'srv-5',
      name: 'Psicología del Rendimiento',
      category: 'psicologia',
      duration: 60,
      price: 70
    },
    {
      id: 'srv-6',
      name: 'Entrenamiento Personal & Fuerza',
      category: 'entrenamiento',
      duration: 60,
      price: 65
    }
  ];

  const DEFAULT_USERS = [
    {
      id: 'usr-client-1',
      name: 'Javier Ortega',
      email: 'j.ortega@clubtriatlon.es',
      password: 'demo',
      phone: '+34 611 204 881',
      sport: 'Triatlón Media Distancia',
      subscribedSince: '2025-09-12',
      role: 'client',
      roleLabel: 'Socio / Paciente · Plan Rendimiento Pro',
      planId: 'plan-pro'
    },
    {
      id: 'usr-staff-1',
      name: 'Carlos Valdés, PT',
      email: 'c.valdes@apexsport.es',
      password: 'demo',
      phone: '+34 910 842 102',
      nif: '48291045-K',
      licenseNumber: 'COL-FISIO-04819',
      ssn: '28 / 1049283719 / 42',
      iban: 'ES91 2100 0418 4502 0005 1332',
      contractType: 'Jornada Completa (40h/sem)',
      role: 'staff',
      roleLabel: 'Trabajador · Fisioterapia Avanzada',
      linkedResourceId: 'spec-2'
    },
    {
      id: 'usr-admin-1',
      name: 'Dirección Médica Apex',
      email: 'direccion@apexsport.es',
      password: 'demo',
      phone: '+34 910 842 100',
      role: 'admin',
      roleLabel: 'Administrador · Gestión Total',
      linkedResourceId: 'all'
    },
    {
      id: 'usr-client-2',
      name: 'Laura Domínguez',
      email: 'laura.dominguez@runpro.es',
      password: 'demo',
      phone: '+34 622 908 114',
      sport: 'Atletismo 10K',
      subscribedSince: '2026-01-18',
      role: 'client',
      roleLabel: 'Socio / Paciente · Plan Salud Activa',
      planId: 'plan-base'
    }
  ];

  function getIsoOffset(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function buildSeedEvents() {
    const today = getIsoOffset(0);
    const tomorrow = getIsoOffset(1);
    const plus3 = getIsoOffset(3);
    const plus5 = getIsoOffset(5);

    return [
      {
        id: 'evt-1',
        resourceId: 'spec-2',
        serviceId: 'srv-1',
        title: 'Fisioterapia Invasiva & Ecografía',
        patientName: 'Javier Ortega',
        patientEmail: 'j.ortega@clubtriatlon.es',
        patientPhone: '+34 611 204 881',
        date: today,
        startHour: 10,
        durationMinutes: 60,
        price: 75,
        status: 'confirmed',
        notes: 'Control tendón de Aquiles derecho.'
      },
      {
        id: 'evt-2',
        resourceId: 'spec-1',
        serviceId: 'srv-3',
        title: 'Consulta Medicina Deportiva',
        patientName: 'Javier Ortega',
        patientEmail: 'j.ortega@clubtriatlon.es',
        patientPhone: '+34 611 204 881',
        date: tomorrow,
        startHour: 12,
        durationMinutes: 60,
        price: 110,
        status: 'confirmed',
        notes: 'Revisión analítica y umbrales de lactato.'
      },
      {
        id: 'evt-3',
        resourceId: 'spec-4',
        serviceId: 'srv-6',
        title: 'Entrenamiento Personal & Fuerza',
        patientName: 'Javier Ortega',
        patientEmail: 'j.ortega@clubtriatlon.es',
        patientPhone: '+34 611 204 881',
        date: plus3,
        startHour: 17,
        durationMinutes: 60,
        price: 65,
        status: 'confirmed',
        notes: 'Perfil fuerza-velocidad tren inferior.'
      },
      {
        id: 'evt-4',
        resourceId: 'spec-3',
        serviceId: 'srv-5',
        title: 'Psicología del Rendimiento',
        patientName: 'Javier Ortega',
        patientEmail: 'j.ortega@clubtriatlon.es',
        patientPhone: '+34 611 204 881',
        date: plus5,
        startHour: 11,
        durationMinutes: 60,
        price: 70,
        status: 'confirmed',
        notes: 'Rutina precompetitiva y biofeedback HRV.'
      },
      {
        id: 'evt-5',
        resourceId: 'spec-2',
        serviceId: 'srv-2',
        title: 'Readaptación Funcional Post-Lesión',
        patientName: 'Laura Domínguez',
        patientEmail: 'laura.dominguez@runpro.es',
        patientPhone: '+34 622 908 114',
        date: today,
        startHour: 12,
        durationMinutes: 60,
        price: 60,
        status: 'completed',
        notes: 'Trabajo excéntrico isquiotibial.'
      }
    ];
  }

  function buildSeedClinical() {
    const today = getIsoOffset(0);
    return [
      {
        patientKey: 'j.ortega@clubtriatlon.es',
        patientName: 'Javier Ortega',
        patientEmail: 'j.ortega@clubtriatlon.es',
        patientPhone: '+34 611 204 881',
        sport: 'Triatlón Media Distancia',
        assignedResourceIds: ['spec-2', 'spec-1'],
        entries: [
          {
            id: 'clin-1',
            date: today,
            author: 'Carlos Valdés, PT',
            area: 'Fisioterapia Avanzada',
            diagnosis: 'Tendinopatía reactiva tercio medio Aquiles derecho',
            evolution: 'Ecografía Doppler muestra buena evolución. Aplicada terapia manual y pauta isométrica diaria.'
          }
        ]
      },
      {
        patientKey: 'laura.dominguez@runpro.es',
        patientName: 'Laura Domínguez',
        patientEmail: 'laura.dominguez@runpro.es',
        patientPhone: '+34 622 908 114',
        sport: 'Atletismo 10K',
        assignedResourceIds: ['spec-2'],
        entries: [
          {
            id: 'clin-2',
            date: today,
            author: 'Carlos Valdés, PT',
            area: 'Fisioterapia Avanzada',
            diagnosis: 'Readaptación post-rotura fibrilar bíceps femoral grado I',
            evolution: 'Sin dolor a la contracción excéntrica en nordic hamstring. Inicia carrera continua progresiva.'
          }
        ]
      }
    ];
  }

  function ensureSeedData() {
    const existingPlans = readJson(STORAGE_KEYS.PLANS);
    if (!existingPlans.length || !existingPlans.some((p) => p.id === 'plan-free')) {
      localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(DEFAULT_PLANS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.RESOURCES)) {
      localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(DEFAULT_RESOURCES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SERVICES)) {
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(DEFAULT_SERVICES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(buildSeedEvents()));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CLINICAL)) {
      localStorage.setItem(STORAGE_KEYS.CLINICAL, JSON.stringify(buildSeedClinical()));
    }
  }

  function readJson(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch (e) {
      return [];
    }
  }

  function getSession() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  /* =========================================================
     1. PUERTA DE ACCESO Y REGISTRO (index.html)
     ========================================================= */
  function initAuthPortal() {
    const mount = document.getElementById('auth-portal-mount');
    if (!mount || !window.WtsAuthAdmin) return;

    const authController = new window.WtsAuthAdmin({
      authContainer: mount,
      sessionStorageKey: STORAGE_KEYS.SESSION,
      usersStorageKey: STORAGE_KEYS.USERS,
      plansStorageKey: STORAGE_KEYS.PLANS,
      defaultPlanId: 'plan-free',
      onSessionChange: (session) => {
        if (session) {
          window.location.href = 'dashboard.html';
        }
      }
    });

    authController.renderAuthPortal();
  }

  /* =========================================================
     2. DASHBOARD PRINCIPAL SEGÚN ROL (dashboard.html)
     ========================================================= */
  function initDashboardPage() {
    const mount = document.getElementById('dashboard-dynamic-mount');
    const session = getSession();
    if (!mount || !session) return;

    const resources = readJson(STORAGE_KEYS.RESOURCES);
    const events = readJson(STORAGE_KEYS.EVENTS);
    const plans = readJson(STORAGE_KEYS.PLANS);
    const clinical = readJson(STORAGE_KEYS.CLINICAL);
    const resMap = Object.fromEntries(resources.map((r) => [r.id, r]));

    if (session.role === 'client') {
      const currentPlan = plans.find((p) => p.id === session.planId) || plans[0];
      const isFreePlan = Number(currentPlan.price) === 0;

      function renderClientCalendarDashboard() {
        const latestEvents = readJson(STORAGE_KEYS.EVENTS);
        const myEvents = latestEvents.filter(
          (e) =>
            e.status !== 'cancelled' &&
            ((e.patientEmail && e.patientEmail.toLowerCase() === session.email.toLowerCase()) ||
              e.patientName.toLowerCase() === session.name.toLowerCase())
        );

        const remaining = Math.max(0, Number(currentPlan.sessionsIncluded) - myEvents.length);
        const myRecord = clinical.find(
          (c) => c.patientEmail && c.patientEmail.toLowerCase() === session.email.toLowerCase()
        );

        const upcomingListHtml = myEvents.length
          ? myEvents
              .slice()
              .sort((a, b) => a.date.localeCompare(b.date) || a.startHour - b.startHour)
              .map((ev) => {
                const doc = resMap[ev.resourceId];
                const badgeColor = doc ? AREA_COLORS[doc.category] || '#0284C7' : '#0284C7';
                return `
                  <div style="padding:0.65rem 0.75rem;border-left:3px solid ${badgeColor};background:#F8FAFC;border-radius:0 8px 8px 0;margin-bottom:0.5rem;">
                    <div style="font-weight:700;font-size:0.83rem;color:#0F172A;">${ev.title}</div>
                    <div style="font-size:0.75rem;color:#475569;margin-top:0.15rem;">
                      📅 ${ev.date} · ${String(ev.startHour).padStart(2, '0')}:00
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:0.35rem;">
                      <span style="font-size:0.74rem;font-weight:600;color:${badgeColor};">${doc ? doc.name : 'Especialista'}</span>
                      ${
                        doc
                          ? `<a href="tel:${doc.phone.replace(/\s+/g, '')}" style="font-size:0.72rem;font-weight:700;color:#059669;">📞 Llamar</a>`
                          : ''
                      }
                    </div>
                  </div>
                `;
              })
              .join('')
          : `<p style="font-size:0.82rem;color:#64748B;">No tienes sesiones agendadas. Pulsa en cualquier día del calendario para apuntarte.</p>`;

        const lastNote = myRecord && myRecord.entries.length ? myRecord.entries[0] : null;

        mount.innerHTML = `
          <div class="apex-client-strip">
            <div class="apex-mini-stat">
              <span class="apex-mini-stat__label">Sesiones Agendadas</span>
              <span class="apex-mini-stat__val">${myEvents.length} activas</span>
              <span class="apex-mini-stat__sub">Sincronizadas en tu calendario</span>
            </div>
            <div class="apex-mini-stat">
              <span class="apex-mini-stat__label">${isFreePlan ? 'Modalidad de Reserva' : 'Bono Mensual Restante'}</span>
              <span class="apex-mini-stat__val">${isFreePlan ? 'Pago por sesión' : `${remaining} / ${currentPlan.sessionsIncluded}`}</span>
              <span class="apex-mini-stat__sub">${currentPlan.name}</span>
            </div>
            <div class="apex-mini-stat">
              <span class="apex-mini-stat__label">Tu Cuota Actual</span>
              <span class="apex-mini-stat__val">${isFreePlan ? 'Gratis (0 €)' : `${currentPlan.price} €/mes`}</span>
              <a href="suscripcion.html" class="apex-mini-stat__sub">Ver o mejorar plan →</a>
            </div>
            <div class="apex-mini-stat">
              <span class="apex-mini-stat__label">Asistencia Médica Directa</span>
              <span class="apex-mini-stat__val">4 Unidades</span>
              <a href="especialistas.html" class="apex-mini-stat__sub">Llamar a mi médico/fisio →</a>
            </div>
          </div>

          <div class="apex-client-board">
            <div class="apex-client-board__main">
              <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:0.65rem;margin-bottom:0.75rem;">
                <div class="apex-legend-bar">
                  <span class="apex-legend-dot"><i style="background:#0F172A;"></i>Día de hoy</span>
                  <span class="apex-legend-dot"><i style="background:#059669;"></i>N.º eventos del día</span>
                </div>
                <button type="button" id="apex-board-quick-book" class="apex-btn apex-btn--primary" style="padding:0.42rem 0.85rem;font-size:0.8rem;">
                  + Anotar Evento
                </button>
              </div>
              <div id="client-month-calendar-mount"></div>
            </div>

            <aside class="apex-board-side">
              <div class="apex-card">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.65rem;">
                  <h3 style="font-size:0.96rem;margin:0;">Tus Próximas Sesiones</h3>
                  <a href="calendario.html?view=week" style="font-size:0.76rem;font-weight:600;color:#0284C7;">Ver por horas →</a>
                </div>
                ${upcomingListHtml}
              </div>

              <div class="apex-card">
                <h3 style="font-size:0.95rem;margin-bottom:0.4rem;">Última Nota Clínica</h3>
                ${
                  lastNote
                    ? `<div style="font-size:0.76rem;color:#64748B;">${lastNote.date} · ${lastNote.author}</div>
                       <div style="font-weight:700;font-size:0.84rem;margin:0.2rem 0;">${lastNote.diagnosis}</div>
                       <p style="font-size:0.8rem;margin:0;">${lastNote.evolution}</p>`
                    : `<p style="font-size:0.8rem;color:#64748B;margin:0;">Aún no tienes informes registrados.</p>`
                }
              </div>
            </aside>
          </div>
        `;

        if (window.WtsCalendar) {
          const monthCal = new window.WtsCalendar({
            container: document.getElementById('client-month-calendar-mount'),
            mode: 'client',
            viewMode: 'month',
            showViewSwitcher: false,
            storageKey: STORAGE_KEYS.EVENTS,
            resources: resources,
            services: readJson(STORAGE_KEYS.SERVICES),
            areaLabels: AREA_LABELS,
            areaColors: AREA_COLORS,
            prefillUser: { name: session.name, email: session.email, phone: session.phone || '' },
            onBookingChange: () => {
              renderClientCalendarDashboard();
            }
          });
          monthCal.init();

          const openQuickModal = () => {
            monthCal.openBookingModal(getIsoOffset(0), 10);
          };

          const boardBtn = document.getElementById('apex-board-quick-book');
          if (boardBtn) boardBtn.addEventListener('click', openQuickModal);

          const topbarBtn = document.getElementById('apex-topbar-book-btn');
          if (topbarBtn) {
            topbarBtn.onclick = openQuickModal;
          }
        }
      }

      renderClientCalendarDashboard();
      return;
    }

    if (session.role === 'staff') {
      const myEvents = events.filter((e) => e.resourceId === session.linkedResourceId && e.status !== 'cancelled');
      const completedCount = myEvents.filter((e) => e.status === 'completed').length;

      const listHtml = myEvents
        .map((ev) => {
          const patientKey = encodeURIComponent((ev.patientEmail || ev.patientName).toLowerCase().trim());
          return `
            <div class="apex-session-row">
              <div>
                <strong>${ev.patientName}</strong> — ${ev.title}
                <div style="font-size:0.82rem;color:#64748B;">📅 ${ev.date} · ${String(ev.startHour).padStart(2, '0')}:00 · Tel: ${ev.patientPhone || 'N/D'}</div>
              </div>
              <div style="display:flex;gap:0.45rem;">
                <a href="calendario.html" class="apex-btn apex-btn--outline" style="padding:0.35rem 0.7rem;font-size:0.8rem;">Abrir Agenda</a>
                <a href="paciente-ficha.html?patient=${patientKey}" class="apex-btn apex-btn--clinical" style="padding:0.35rem 0.7rem;font-size:0.8rem;">Ficha Clínica</a>
              </div>
            </div>
          `;
        })
        .join('');

      mount.innerHTML = `
        <div class="apex-page-head">
          <div>
            <h1>Estación Clínica · ${session.name}</h1>
            <p>${session.roleLabel}. Consulta tus pacientes asignados y registra notas de evolución.</p>
          </div>
          <a href="calendario.html" class="apex-btn apex-btn--primary">Mi Agenda Horaria</a>
        </div>

        <div class="apex-kpi-grid">
          <div class="apex-kpi">
            <div class="apex-kpi__label">Mis Pacientes en Agenda</div>
            <div class="apex-kpi__val">${myEvents.length}</div>
            <div class="apex-kpi__sub">Sesiones asignadas</div>
          </div>
          <div class="apex-kpi">
            <div class="apex-kpi__label">Sesiones Completadas</div>
            <div class="apex-kpi__val">${completedCount}</div>
            <div class="apex-kpi__sub">Con seguimiento activo</div>
          </div>
          <div class="apex-kpi">
            <div class="apex-kpi__label">Historiales Clínicos</div>
            <div class="apex-kpi__val">${clinical.length}</div>
            <div class="apex-kpi__sub">Fichas sincronizadas</div>
          </div>
          <div class="apex-kpi">
            <div class="apex-kpi__label">Estado de Estación</div>
            <div class="apex-kpi__val">Operativo</div>
            <div class="apex-kpi__sub">Conectado con Recepción</div>
          </div>
        </div>

        <section class="apex-card">
          <h2 style="font-size:1.05rem;margin-bottom:0.85rem;">Pacientes Asignados Hoy</h2>
          ${listHtml || '<p>No tienes sesiones activas asignadas.</p>'}
        </section>
      `;
      return;
    }

    if (session.role === 'admin' && window.WtsAuthAdmin) {
      const adminController = new window.WtsAuthAdmin({
        adminContainer: mount,
        usersStorageKey: STORAGE_KEYS.USERS,
        servicesStorageKey: STORAGE_KEYS.SERVICES,
        resourcesStorageKey: STORAGE_KEYS.RESOURCES,
        eventsStorageKey: STORAGE_KEYS.EVENTS,
        plansStorageKey: STORAGE_KEYS.PLANS,
        areaLabels: AREA_LABELS
      });
      adminController.renderAdminDashboard();
    }
  }

  /* =========================================================
     3. CALENDARIO DETALLADO POR HORAS Y ESPECIALIDAD (calendario.html)
     ========================================================= */
  function initCalendarPage() {
    const calendarMount = document.getElementById('app-calendar-mount');
    const areaFilterBar = document.getElementById('calendar-area-filter');
    const titleEl = document.getElementById('calendar-page-title');
    const subEl = document.getElementById('calendar-page-subtitle');
    const session = getSession();
    if (!calendarMount || !session || !window.WtsCalendar) return;

    const params = new URLSearchParams(window.location.search);
    const requestedView = params.get('view');
    const initialViewMode =
      requestedView === 'day' || requestedView === 'month' || requestedView === 'week'
        ? requestedView
        : 'week';

    let selectedArea = 'all';

    if (session.role === 'staff') {
      titleEl.textContent = 'Mi Agenda de Trabajo';
      subEl.textContent = 'Pulsa sobre cualquier cita para marcarla como Completada, Cancelada o abrir la ficha del paciente.';
    } else if (session.role === 'admin') {
      titleEl.textContent = 'Agenda Global del Centro (Modo Admin)';
      subEl.textContent = 'Supervisa todas las especialidades, crea citas o reasigna sesiones entre especialistas.';
    }

    function mountCalendar() {
      const allResources = readJson(STORAGE_KEYS.RESOURCES);
      const filteredResources =
        selectedArea === 'all' ? allResources : allResources.filter((r) => r.category === selectedArea);

      const calMode = session.role === 'admin' ? 'admin' : session.role === 'staff' ? 'staff' : 'client';
      const initialRes =
        session.role === 'staff' && session.linkedResourceId
          ? session.linkedResourceId
          : filteredResources[0]?.id || 'all';

      const calendar = new window.WtsCalendar({
        container: calendarMount,
        mode: calMode,
        viewMode: initialViewMode,
        showViewSwitcher: true,
        storageKey: STORAGE_KEYS.EVENTS,
        resources: filteredResources.length ? filteredResources : allResources,
        services: readJson(STORAGE_KEYS.SERVICES),
        areaLabels: AREA_LABELS,
        areaColors: AREA_COLORS,
        initialResourceId: session.role === 'admin' ? 'all' : initialRes,
        prefillUser:
          session.role === 'client'
            ? { name: session.name, email: session.email, phone: session.phone || '' }
            : null,
        startHour: 8,
        endHour: 20,
        onOpenClinicalRecord: (ev) => {
          const pKey = encodeURIComponent((ev.patientEmail || ev.patientName).toLowerCase().trim());
          window.location.href = `paciente-ficha.html?patient=${pKey}`;
        }
      });

      calendar.init();

      const topbarBtn = document.getElementById('apex-topbar-book-btn');
      if (topbarBtn && session.role === 'client') {
        topbarBtn.onclick = () => calendar.openBookingModal(getIsoOffset(0), 10);
      }
    }

    if (areaFilterBar) {
      areaFilterBar.addEventListener('click', (e) => {
        const chip = e.target.closest('[data-area]');
        if (!chip) return;
        selectedArea = chip.getAttribute('data-area');
        areaFilterBar.querySelectorAll('.apex-chip').forEach((c) => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        mountCalendar();
      });
    }

    mountCalendar();
  }

  /* =========================================================
     4. ESPECIALISTAS Y CLIENTES (ADMIN) / MIS PACIENTES (STAFF) / MÉDICOS (CLIENTE)
     ========================================================= */
  function initSpecialistsPage() {
    const mount = document.getElementById('specialists-dynamic-mount');
    const session = getSession();
    if (!mount || !session) return;

    if (session.role === 'admin' && window.WtsAuthAdmin) {
      const adminDir = new window.WtsAuthAdmin({
        adminContainer: mount,
        resourcesStorageKey: STORAGE_KEYS.RESOURCES,
        usersStorageKey: STORAGE_KEYS.USERS,
        plansStorageKey: STORAGE_KEYS.PLANS,
        eventsStorageKey: STORAGE_KEYS.EVENTS,
        clinicalStorageKey: STORAGE_KEYS.CLINICAL,
        areaLabels: AREA_LABELS
      });
      adminDir.renderAdminDirectory();
      return;
    }

    if (session.role === 'staff' && window.WtsClinical) {
      mount.innerHTML = `
        <div class="apex-page-head">
          <div>
            <h1>Mis Pacientes y Fichas Clínicas</h1>
            <p>Pulsa encima de cualquier paciente para abrir su ficha completa y añadir notas de evolución, o registra un nuevo paciente.</p>
          </div>
        </div>
        <div id="clinical-records-mount"></div>
      `;

      const clinicalCtrl = new window.WtsClinical({
        container: document.getElementById('clinical-records-mount'),
        storageKey: STORAGE_KEYS.CLINICAL,
        eventsStorageKey: STORAGE_KEYS.EVENTS,
        areaLabels: AREA_LABELS,
        currentAuthor: session.name,
        linkedResourceId: session.linkedResourceId
      });
      clinicalCtrl.renderPatientDirectory();
      return;
    }

    let selectedArea = 'all';

    function renderDoctorsDirectory() {
      const resources = readJson(STORAGE_KEYS.RESOURCES);
      const filtered =
        selectedArea === 'all' ? resources : resources.filter((r) => r.category === selectedArea);

      const cardsHtml = filtered
        .map(
          (doc) => `
          <article class="apex-doc-card">
            <img src="${doc.avatar}" alt="${doc.name}" loading="lazy" class="apex-doc-card__img" />
            <div class="apex-doc-card__body">
              <div>
                <span class="apex-doc-card__badge">${AREA_LABELS[doc.category] || doc.category}</span>
                <h3 style="font-size:1.02rem;margin-bottom:0.2rem;">${doc.name}</h3>
                <div style="font-size:0.78rem;font-weight:600;color:#475569;margin-bottom:0.4rem;">${doc.role}</div>
                <p style="font-size:0.8rem;margin:0;">${doc.bio || ''}</p>
              </div>
              <div class="apex-doc-card__actions">
                <a href="tel:${(doc.phone || '+34910842100').replace(/\s+/g, '')}" class="apex-btn apex-btn--clinical apex-btn--full">
                  📞 Llamar: ${doc.phone || '+34 910 842 100'}
                </a>
                <a href="calendario.html" class="apex-btn apex-btn--outline apex-btn--full">
                  📅 Reservar con ${doc.name.split(' ')[0]}
                </a>
              </div>
            </div>
          </article>
        `
        )
        .join('');

      mount.innerHTML = `
        <div class="apex-page-head">
          <div>
            <h1>Mis Médicos, Fisios y Especialistas</h1>
            <p>Llama directamente a tu especialista asignado por si te ocurre cualquier molestia o duda, o reserva sesión en su agenda.</p>
          </div>
          <div class="apex-area-tabs">
            <button type="button" class="apex-chip ${selectedArea === 'all' ? 'is-active' : ''}" data-doc-area="all">Todos</button>
            <button type="button" class="apex-chip ${selectedArea === 'fisioterapia' ? 'is-active' : ''}" data-doc-area="fisioterapia">Fisioterapia</button>
            <button type="button" class="apex-chip ${selectedArea === 'medicina' ? 'is-active' : ''}" data-doc-area="medicina">Medicina</button>
            <button type="button" class="apex-chip ${selectedArea === 'psicologia' ? 'is-active' : ''}" data-doc-area="psicologia">Psicología</button>
            <button type="button" class="apex-chip ${selectedArea === 'entrenamiento' ? 'is-active' : ''}" data-doc-area="entrenamiento">Entrenamiento</button>
          </div>
        </div>
        <div class="apex-doctors-grid">${cardsHtml}</div>
      `;

      mount.querySelectorAll('[data-doc-area]').forEach((btn) => {
        btn.addEventListener('click', () => {
          selectedArea = btn.getAttribute('data-doc-area');
          renderDoctorsDirectory();
        });
      });
    }

    renderDoctorsDirectory();
  }

  /* =========================================================
     5. FICHA DEDICADA DE PACIENTE (paciente-ficha.html)
     ========================================================= */
  function initPatientDetailPage() {
    const mount = document.getElementById('patient-detail-mount');
    const session = getSession();
    if (!mount || !session || !window.WtsClinical) return;

    const params = new URLSearchParams(window.location.search);
    const patientParam = params.get('patient') || '';

    const clinicalCtrl = new window.WtsClinical({
      container: mount,
      storageKey: STORAGE_KEYS.CLINICAL,
      eventsStorageKey: STORAGE_KEYS.EVENTS,
      areaLabels: AREA_LABELS,
      currentAuthor: session.name
    });

    clinicalCtrl.renderPatientDetailPage(patientParam);
  }

  /* =========================================================
     6. FICHA DEDICADA DE ESPECIALISTA ADMIN (especialista-ficha.html)
     ========================================================= */
  function initSpecialistDetailPage() {
    const mount = document.getElementById('specialist-detail-mount');
    const session = getSession();
    if (!mount || !session || !window.WtsAuthAdmin) return;

    const params = new URLSearchParams(window.location.search);
    const specId = params.get('id') || '';

    const adminDetail = new window.WtsAuthAdmin({
      adminContainer: mount,
      resourcesStorageKey: STORAGE_KEYS.RESOURCES,
      eventsStorageKey: STORAGE_KEYS.EVENTS,
      areaLabels: AREA_LABELS
    });

    adminDetail.renderSpecialistDetailPage(specId);
  }

  /* =========================================================
     7. FICHA DEDICADA DE CLIENTE ADMIN (cliente-admin.html)
     ========================================================= */
  function initAdminClientDetailPage() {
    const mount = document.getElementById('admin-client-detail-mount');
    const session = getSession();
    if (!mount || !session || !window.WtsAuthAdmin) return;

    const params = new URLSearchParams(window.location.search);
    const clientEmail = params.get('email') || '';

    const adminClientDetail = new window.WtsAuthAdmin({
      adminContainer: mount,
      usersStorageKey: STORAGE_KEYS.USERS,
      plansStorageKey: STORAGE_KEYS.PLANS,
      eventsStorageKey: STORAGE_KEYS.EVENTS,
      resourcesStorageKey: STORAGE_KEYS.RESOURCES,
      clinicalStorageKey: STORAGE_KEYS.CLINICAL,
      areaLabels: AREA_LABELS
    });

    adminClientDetail.renderAdminClientDetailPage(clientEmail);
  }

  /* =========================================================
     8. SUSCRIPCIÓN Y TARIFAS (suscripcion.html)
     ========================================================= */
  function initSubscriptionPage() {
    const mount = document.getElementById('subscription-dynamic-mount');
    const session = getSession();
    if (!mount || !session || !window.WtsAuthAdmin) return;

    const subController = new window.WtsAuthAdmin({
      adminContainer: mount,
      sessionStorageKey: STORAGE_KEYS.SESSION,
      usersStorageKey: STORAGE_KEYS.USERS,
      plansStorageKey: STORAGE_KEYS.PLANS,
      servicesStorageKey: STORAGE_KEYS.SERVICES,
      areaLabels: AREA_LABELS,
      onSessionChange: () => {
        if (window.ApexLayout) {
          window.ApexLayout.refreshShell();
        }
      }
    });

    if (session.role === 'admin') {
      subController.renderAdminPlansAndServices();
    } else {
      subController.renderClientSubscriptionView();
    }
  }

  /* =========================================================
     9. OPCIONES Y CONTROL DE CUENTAS (cuenta.html)
     ========================================================= */
  function initAccountPage() {
    const mount = document.getElementById('account-dynamic-mount');
    const session = getSession();
    if (!mount || !session || !window.WtsAuthAdmin) return;

    const accController = new window.WtsAuthAdmin({
      adminContainer: mount,
      sessionStorageKey: STORAGE_KEYS.SESSION,
      usersStorageKey: STORAGE_KEYS.USERS,
      plansStorageKey: STORAGE_KEYS.PLANS,
      resourcesStorageKey: STORAGE_KEYS.RESOURCES,
      areaLabels: AREA_LABELS,
      onSessionChange: () => {
        if (window.ApexLayout) {
          window.ApexLayout.refreshShell();
        }
      }
    });

    accController.renderAccountSettingsView();
  }

  function bootstrap() {
    ensureSeedData();
    const page = document.body.getAttribute('data-apex-page');

    if (page === 'auth') initAuthPortal();
    if (page === 'dashboard') initDashboardPage();
    if (page === 'calendar') initCalendarPage();
    if (page === 'specialists') initSpecialistsPage();
    if (page === 'patient-detail') initPatientDetailPage();
    if (page === 'specialist-detail') initSpecialistDetailPage();
    if (page === 'admin-client-detail') initAdminClientDetailPage();
    if (page === 'subscription') initSubscriptionPage();
    if (page === 'account') initAccountPage();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
