import { Routes } from '@angular/router';

export const ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/panel-roles/panel-roles.component').then(m => m.PanelRolesComponent)
  }
];
