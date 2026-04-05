import { Routes } from '@angular/router';

export const ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/malla-calendario/malla-calendario.component').then(m => m.MallaCalendarioComponent)
  }
];
