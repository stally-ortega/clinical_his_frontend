import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'app',
    loadComponent: () =>
      import('./core/layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'pacientes',
        loadChildren: () =>
          import('./features/clinical/pacientes/pacientes.routes').then(m => m.PACIENTES_ROUTES)
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./features/personal/mi-perfil/perfil.component').then(m => m.PerfilComponent),
      },
      {
        path: 'kardex/:id',
        loadChildren: () =>
          import('./features/clinical/kardex/kardex.routes').then(m => m.KARDEX_ROUTES)
      },
      // Futura expansión: evoluciones, notas, turnos, tareas
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: 'app/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
