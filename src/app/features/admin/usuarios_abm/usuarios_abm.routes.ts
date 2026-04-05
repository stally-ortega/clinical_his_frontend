import { Routes } from '@angular/router';

export const ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/panel-usuarios/panel-usuarios.component').then(m => m.PanelUsuariosComponent)
  }
];
