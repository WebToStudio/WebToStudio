/**
 * WTSFinance — Simulador financiero agnóstico con sliders de entrada, plazo (24-84 meses),
 * tipo de interés nominal TIN (%) y tabla de amortización desplegable (sistema francés).
 */
(function (global) {
  'use strict';

  class WTSFinance {
    constructor(config) {
      this.container = typeof config.container === 'string'
        ? document.querySelector(config.container)
        : config.container;

      this.amount = Number(config.amount) || 30000;
      this.minMonths = Number(config.minMonths) || 24;
      this.maxMonths = Number(config.maxMonths) || 84;
      this.stepMonths = Number(config.stepMonths) || 12;

      this.state = {
        downPayment: Math.round(this.amount * 0.2),
        months: Number(config.defaultMonths) || 60,
        tin: Number(config.defaultTin) || 5.95,
        showSchedule: false
      };

      this.render();
    }

    _formatEur(value) {
      return Number(value).toLocaleString('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) + ' €';
    }

    _calculateSchedule() {
      const principal = Math.max(0, this.amount - this.state.downPayment);
      const n = this.state.months;
      const monthlyRate = (this.state.tin / 100) / 12;

      if (principal === 0) {
        return { principal: 0, monthlyQuota: 0, totalInterest: 0, totalPaid: 0, rows: [] };
      }

      let monthlyQuota = 0;
      if (monthlyRate === 0) {
        monthlyQuota = principal / n;
      } else {
        const factor = Math.pow(1 + monthlyRate, n);
        monthlyQuota = (principal * monthlyRate * factor) / (factor - 1);
      }

      let balance = principal;
      let totalInterest = 0;
      const rows = [];

      for (let month = 1; month <= n; month++) {
        const interestPart = balance * monthlyRate;
        let principalPart = monthlyQuota - interestPart;
        if (month === n) {
          principalPart = balance;
        }
        balance = Math.max(0, balance - principalPart);
        totalInterest += interestPart;

        rows.push({
          month,
          quota: principalPart + interestPart,
          principalPart,
          interestPart,
          balance
        });
      }

      return {
        principal,
        monthlyQuota,
        totalInterest,
        totalPaid: principal + totalInterest,
        rows
      };
    }

    render() {
      if (!this.container) return;

      const maxDownPayment = Math.round(this.amount * 0.8);
      if (this.state.downPayment > maxDownPayment) {
        this.state.downPayment = maxDownPayment;
      }

      const calc = this._calculateSchedule();

      const scheduleRowsHtml = calc.rows.map((r) => `
        <tr style="border-bottom: 1px solid #E4E4E7;">
          <td style="padding: 0.45rem 0.6rem;">Mes ${r.month}</td>
          <td style="padding: 0.45rem 0.6rem; font-weight: 600;">${this._formatEur(r.quota)}</td>
          <td style="padding: 0.45rem 0.6rem;">${this._formatEur(r.principalPart)}</td>
          <td style="padding: 0.45rem 0.6rem; color: #71717A;">${this._formatEur(r.interestPart)}</td>
          <td style="padding: 0.45rem 0.6rem;">${this._formatEur(r.balance)}</td>
        </tr>
      `).join('');

      this.container.innerHTML = `
        <div class="wts-fin-box" style="background: #F4F4F5; border: 1px solid #E4E4E7; border-radius: 8px; padding: 1.25rem;">
          <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; gap: 0.75rem; margin-bottom: 1rem;">
            <div>
              <span style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #2563EB;">
                Simulador Financiero Flexible
              </span>
              <h4 style="font-size: 1.05rem; font-weight: 600; color: #18181B;">Calcula tu cuota mensual</h4>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 0.75rem; color: #52525B; display: block;">Cuota estimada</span>
              <strong style="font-size: 1.6rem; font-weight: 700; color: #18181B; letter-spacing: -0.02em;">
                ${this._formatEur(calc.monthlyQuota)}<span style="font-size: 0.85rem; font-weight: 400; color: #52525B;">/mes</span>
              </strong>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
            <div style="background: #FFFFFF; padding: 0.85rem; border-radius: 6px; border: 1px solid #E4E4E7;">
              <div style="display: flex; justify-content: space-between; font-size: 0.8125rem; margin-bottom: 0.4rem;">
                <span style="color: #52525B;">Entrada inicial</span>
                <strong>${this.state.downPayment.toLocaleString('es-ES')} €</strong>
              </div>
              <input
                type="range"
                id="wts-fin-down"
                min="0"
                max="${maxDownPayment}"
                step="500"
                value="${this.state.downPayment}"
                style="width: 100%; accent-color: #2563EB; cursor: pointer;"
              >
            </div>

            <div style="background: #FFFFFF; padding: 0.85rem; border-radius: 6px; border: 1px solid #E4E4E7;">
              <div style="display: flex; justify-content: space-between; font-size: 0.8125rem; margin-bottom: 0.4rem;">
                <span style="color: #52525B;">Plazo</span>
                <strong>${this.state.months} meses</strong>
              </div>
              <input
                type="range"
                id="wts-fin-months"
                min="${this.minMonths}"
                max="${this.maxMonths}"
                step="${this.stepMonths}"
                value="${this.state.months}"
                style="width: 100%; accent-color: #2563EB; cursor: pointer;"
              >
            </div>

            <div style="background: #FFFFFF; padding: 0.85rem; border-radius: 6px; border: 1px solid #E4E4E7;">
              <div style="display: flex; justify-content: space-between; font-size: 0.8125rem; margin-bottom: 0.4rem;">
                <span style="color: #52525B;">TIN (%)</span>
                <strong>${this.state.tin.toFixed(2)} %</strong>
              </div>
              <input
                type="range"
                id="wts-fin-tin"
                min="2.50"
                max="10.50"
                step="0.25"
                value="${this.state.tin}"
                style="width: 100%; accent-color: #2563EB; cursor: pointer;"
              >
            </div>
          </div>

          <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 0.75rem; font-size: 0.8125rem; color: #52525B;">
            <div>
              Capital a financiar: <strong>${this._formatEur(calc.principal)}</strong> ·
              Intereses totales: <strong>${this._formatEur(calc.totalInterest)}</strong>
            </div>
            <button type="button" id="wts-fin-toggle-schedule" class="btn btn-outline btn-sm">
              ${this.state.showSchedule ? 'Ocultar cuadro de amortización ▲' : 'Ver cuadro de amortización ▼'}
            </button>
          </div>

          ${this.state.showSchedule ? `
            <div style="margin-top: 1rem; max-height: 240px; overflow-y: auto; background: #FFFFFF; border: 1px solid #E4E4E7; border-radius: 6px;">
              <table style="width: 100%; border-collapse: collapse; font-size: 0.78rem; text-align: left;">
                <thead style="position: sticky; top: 0; background: #F4F4F5; border-bottom: 1px solid #D4D4D8;">
                  <tr>
                    <th style="padding: 0.5rem 0.6rem;">Cuota</th>
                    <th style="padding: 0.5rem 0.6rem;">Mensualidad</th>
                    <th style="padding: 0.5rem 0.6rem;">Capital</th>
                    <th style="padding: 0.5rem 0.6rem;">Intereses</th>
                    <th style="padding: 0.5rem 0.6rem;">Pendiente</th>
                  </tr>
                </thead>
                <tbody>
                  ${scheduleRowsHtml}
                </tbody>
              </table>
            </div>
          ` : ''}
        </div>
      `;

      this._bindEvents();
    }

    _bindEvents() {
      const downEl = this.container.querySelector('#wts-fin-down');
      const monthsEl = this.container.querySelector('#wts-fin-months');
      const tinEl = this.container.querySelector('#wts-fin-tin');
      const toggleBtn = this.container.querySelector('#wts-fin-toggle-schedule');

      if (downEl) {
        downEl.addEventListener('input', (e) => {
          this.state.downPayment = Number(e.target.value);
          this.render();
        });
      }

      if (monthsEl) {
        monthsEl.addEventListener('input', (e) => {
          this.state.months = Number(e.target.value);
          this.render();
        });
      }

      if (tinEl) {
        tinEl.addEventListener('input', (e) => {
          this.state.tin = Number(e.target.value);
          this.render();
        });
      }

      if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
          this.state.showSchedule = !this.state.showSchedule;
          this.render();
        });
      }
    }
  }

  global.WTSFinance = WTSFinance;
})(window);
