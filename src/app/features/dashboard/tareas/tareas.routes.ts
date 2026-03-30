import { Routes } from '@angular/router';

export const ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/panel-tareas/panel-tareas.component').then(m => m.PanelTareasComponent)
  }
];
