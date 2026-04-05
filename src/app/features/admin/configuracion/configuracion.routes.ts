import { Routes } from '@angular/router';

export const ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/panel-configuracion/panel-configuracion.component').then(m => m.PanelConfiguracionComponent)
  }
];
