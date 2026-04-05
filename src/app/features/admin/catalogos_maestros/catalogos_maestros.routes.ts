import { Routes } from '@angular/router';

export const ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/panel-catalogos/panel-catalogos.component').then(m => m.PanelCatalogosComponent)
  }
];
