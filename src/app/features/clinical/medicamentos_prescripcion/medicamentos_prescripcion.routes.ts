import { Routes } from '@angular/router';

export const ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/crear-prescripcion/crear-prescripcion.component').then(m => m.CrearPrescripcionComponent)
  }
];
