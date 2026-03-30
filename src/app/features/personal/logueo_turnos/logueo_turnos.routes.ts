import { Routes } from '@angular/router';

export const ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/panel-turnos/panel-turnos.component').then(m => m.PanelTurnosComponent)
  }
];
