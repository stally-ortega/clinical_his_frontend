import { Component } from '@angular/core';

/**
 * Placeholder del Dashboard. Se implementará en la Fase 2.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="dashboard-placeholder">
      <h1>🏥 Dashboard Privado</h1>
      <p>Bienvenido al Clinical HIS. Módulos en construcción...</p>
    </div>
  `,
  styles: [`
    .dashboard-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background: linear-gradient(135deg, #0a1628 0%, #0d2137 50%, #0a1f2e 100%);
      color: #a0d8d8;
      font-family: 'Inter', sans-serif;
      gap: 1rem;
    }
    h1 { font-size: 2rem; color: #00d4d4; }
    p { color: #80c0c0; }
  `],
})
export class DashboardComponent {}
