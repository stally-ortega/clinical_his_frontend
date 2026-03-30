import { Routes } from '@angular/router';

export const ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/panel-constructor/panel-constructor.component').then(m => m.PanelConstructorComponent)
  }
];
