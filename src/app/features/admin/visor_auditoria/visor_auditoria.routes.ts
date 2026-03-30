import { Routes } from '@angular/router';

export const ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/panel-auditoria/panel-auditoria.component').then(m => m.PanelAuditoriaComponent)
  }
];
