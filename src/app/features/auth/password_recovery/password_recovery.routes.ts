import { Routes } from '@angular/router';

export const RECOVERY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/olvide-password/olvide-password.component').then(m => m.OlvidePasswordComponent)
  }
];
