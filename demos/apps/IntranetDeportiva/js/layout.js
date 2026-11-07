(function () {
  'use strict';

  const SESSION_KEY = 'apex_wts_auth_session_v2';

  const DEMO_SWITCH_ACCOUNTS = [
    {
      id: 'usr-client-1',
      name: 'Javier Ortega',
      email: 'j.ortega@clubtriatlon.es',
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
      phone: '+34 910 842 102',
      role: 'staff',
      roleLabel: 'Trabajador · Fisioterapia Avanzada',
      linkedResourceId: 'spec-2'
    },
    {
      id: 'usr-admin-1',
      name: 'Dirección Médica Apex',
      email: 'direccion@apexsport.es',
      phone: '+34 910 842 100',
      role: 'admin',
      roleLabel: 'Administrador · Gestión Total',
      linkedResourceId: 'all'
    }
  ];

  function getSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function getNavItemsForRole(role) {
    if (role === 'client') {
      return [
        { id: 'dashboard', icon: '📅', label: 'Mi Calendario y Sesiones', href: 'dashboard.html' },
        { id: 'calendar', icon: '🕒', label: 'Agendas por Especialidad', href: 'calendario.html' },
        { id: 'specialists', icon: '🩺', label: 'Mis Médicos y Fisios', href: 'especialistas.html' },
        { id: 'subscription', icon: '💳', label: 'Mi Suscripción y Plan', href: 'suscripcion.html' },
        { id: 'account', icon: '👤', label: 'Mi Cuenta y Perfil', href: 'cuenta.html' }
      ];
    }

    if (role === 'staff') {
      return [
        { id: 'dashboard', icon: '📋', label: 'Estación de Trabajo', href: 'dashboard.html' },
        { id: 'calendar', icon: '📅', label: 'Mi Agenda Horaria', href: 'calendario.html' },
        { id: 'specialists', icon: '🗂️', label: 'Mis Pacientes', href: 'especialistas.html' },
        { id: 'account', icon: '👤', label: 'Mi Ficha Laboral', href: 'cuenta.html' }
      ];
    }

    return [
      { id: 'dashboard', icon: '📊', label: 'Panel Dirección', href: 'dashboard.html' },
      { id: 'calendar', icon: '📅', label: 'Agenda Global', href: 'calendario.html' },
      { id: 'specialists', icon: '👥', label: 'Especialistas y Clientes', href: 'especialistas.html' },
      { id: 'subscription', icon: '💶', label: 'Tarifas y Planes', href: 'suscripcion.html' },
      { id: 'account', icon: '⚙️', label: 'Opciones y Cuentas', href: 'cuenta.html' }
    ];
  }

  function renderAuthTopBar() {
    const authTopbar = document.getElementById('apex-auth-topbar-mount');
    if (!authTopbar) return;

    authTopbar.innerHTML = `
      <div class="apex-auth-topbar__inner">
        <a href="/index.html#proyectos" class="apex-auth-back-link">
          ← Volver a la página principal
        </a>
        <span class="apex-auth-topbar__status">Acceso Seguro · Apex Sport &amp; Health</span>
      </div>
    `;
  }

  function renderAppShellChrome() {
    const page = document.body.getAttribute('data-apex-page');
    if (page === 'auth') {
      renderAuthTopBar();
      return;
    }

    const session = getSession();
    if (!session) {
      window.location.href = 'index.html';
      return;
    }

    const sidebarMount = document.getElementById('apex-sidebar-mount');
    const topbarMount = document.getElementById('apex-topbar-mount');
    const navItems = getNavItemsForRole(session.role);

    let backdropEl = document.getElementById('apex-sidebar-backdrop');
    if (!backdropEl) {
      backdropEl = document.createElement('div');
      backdropEl.id = 'apex-sidebar-backdrop';
      backdropEl.className = 'apex-sidebar-backdrop';
      document.body.appendChild(backdropEl);
    }

    const closeSidebar = () => {
      if (sidebarMount) sidebarMount.classList.remove('is-open');
      backdropEl.classList.remove('is-visible');
    };

    const openSidebar = () => {
      if (sidebarMount) sidebarMount.classList.add('is-open');
      backdropEl.classList.add('is-visible');
    };

    backdropEl.onclick = closeSidebar;

    const rolePillClass =
      session.role === 'client'
        ? 'apex-sidebar__role-pill--client'
        : session.role === 'admin'
        ? 'apex-sidebar__role-pill--admin'
        : '';

    const roleShortText =
      session.role === 'client'
        ? 'Cuenta Cliente / Socio'
        : session.role === 'admin'
        ? 'Administrador Centro'
        : 'Trabajador / Especialista';

    if (sidebarMount) {
      const linksHtml = navItems
        .map(
          (item) => `
          <a href="${item.href}" class="apex-sidebar__link ${item.id === page ? 'is-active' : ''}">
            <span>${item.icon}</span>
            <span>${item.label}</span>
          </a>
        `
        )
        .join('');

      const switchOptionsHtml = DEMO_SWITCH_ACCOUNTS.map(
        (acc) =>
          `<option value="${acc.id}" ${acc.email === session.email ? 'selected' : ''}>${acc.name} (${
            acc.role === 'client' ? 'Cliente' : acc.role === 'staff' ? 'Trabajador' : 'Admin'
          })</option>`
      ).join('');

      sidebarMount.innerHTML = `
        <div class="apex-sidebar__top">
          <div class="apex-sidebar__header-row">
            <a href="dashboard.html" class="apex-brand apex-brand--light">
              <span class="apex-brand__mark">AX</span>
              <span>
                Apex Sport &amp; Health
                <span class="apex-brand__sub">Intranet &amp; Portal Socio</span>
              </span>
            </a>
            <button type="button" id="apex-sidebar-close-btn" class="apex-sidebar__close-btn" aria-label="Ocultar menú lateral" title="Ocultar menú">
              ✕
            </button>
          </div>

          <div class="apex-sidebar__role-box">
            <span class="apex-sidebar__role-pill ${rolePillClass}">${roleShortText}</span>
            <div style="font-weight:700;font-size:0.9rem;">${session.name}</div>
            <div style="font-size:0.74rem;color:#94A3B8;">${session.email}</div>
          </div>

          <nav class="apex-sidebar__nav" aria-label="Navegación de la plataforma">
            ${linksHtml}
          </nav>
        </div>

        <div class="apex-sidebar__bottom">
          <label class="apex-sidebar__switch-label" for="apex-role-quick-switch">Cambiar perfil activo</label>
          <select id="apex-role-quick-switch" class="apex-sidebar__quick-select">
            <option value="">-- Sesión actual --</option>
            ${switchOptionsHtml}
          </select>
          <button type="button" id="apex-global-logout" class="apex-btn apex-btn--outline apex-btn--full" style="margin-top:0.35rem;background:rgba(255,255,255,0.08);color:#fff;border-color:rgba(255,255,255,0.18);">
            Cerrar Sesión
          </button>
        </div>
      `;

      const closeBtn = document.getElementById('apex-sidebar-close-btn');
      if (closeBtn) closeBtn.addEventListener('click', closeSidebar);

      const quickSelect = document.getElementById('apex-role-quick-switch');
      if (quickSelect) {
        quickSelect.addEventListener('change', (e) => {
          const picked = DEMO_SWITCH_ACCOUNTS.find((a) => a.id === e.target.value);
          if (picked) {
            localStorage.setItem(SESSION_KEY, JSON.stringify(picked));
            window.location.href = 'dashboard.html';
          }
        });
      }

      const logoutBtn = document.getElementById('apex-global-logout');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          localStorage.removeItem(SESSION_KEY);
          window.location.href = 'index.html';
        });
      }
    }

    if (topbarMount) {
      const fallbackTitles = {
        'specialist-detail': 'Ficha de Especialista',
        'admin-client-detail': 'Ficha de Cliente (Admin)',
        'patient-detail': 'Ficha Clínica del Paciente'
      };
      const currentNav = navItems.find((i) => i.id === page) || { label: fallbackTitles[page] || 'Panel Principal' };
      topbarMount.innerHTML = `
        <div class="apex-topbar-left">
          <button type="button" class="apex-mobile-drawer-btn" id="apex-drawer-toggle" aria-label="Abrir menú">☰</button>
          <strong style="font-size:0.96rem;">${currentNav.label}</strong>
        </div>
        <div style="display:flex;align-items:center;gap:0.55rem;">
          ${
            session.role === 'client'
              ? `<button type="button" id="apex-topbar-book-btn" class="apex-btn apex-btn--primary" style="padding:0.42rem 0.85rem;font-size:0.82rem;">+ Apuntarme a Sesión</button>`
              : `<a href="calendario.html" class="apex-btn apex-btn--primary" style="padding:0.42rem 0.85rem;font-size:0.82rem;">+ Nueva Cita</a>`
          }
        </div>
      `;

      const drawerBtn = document.getElementById('apex-drawer-toggle');
      if (drawerBtn && sidebarMount) {
        drawerBtn.addEventListener('click', () => {
          if (sidebarMount.classList.contains('is-open')) {
            closeSidebar();
          } else {
            openSidebar();
          }
        });
      }
    }
  }

  window.ApexLayout = {
    SESSION_KEY,
    getSession,
    refreshShell: renderAppShellChrome
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderAppShellChrome);
  } else {
    renderAppShellChrome();
  }
})();
