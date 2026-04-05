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
      // ── Dashboard ──────────────────────────────────────────────────
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/metrics/dashboard.component').then(m => m.DashboardMetricsComponent)
      },
      {
        path: 'dashboard/tareas',
        loadChildren: () => import('./features/dashboard/tareas/tareas.routes').then(m => m.ROUTES)
      },
      // ── Clínico ────────────────────────────────────────────────────
      {
        path: 'pacientes',
        loadChildren: () =>
          import('./features/clinical/pacientes/pacientes.routes').then(m => m.PACIENTES_ROUTES)
      },
      {
        path: 'kardex/:id',
        loadChildren: () =>
          import('./features/clinical/kardex/kardex.routes').then(m => m.KARDEX_ROUTES)
      },
      {
        path: 'prescribir/:idPaciente',
        loadChildren: () =>
          import('./features/clinical/medicamentos_prescripcion/medicamentos_prescripcion.routes').then(m => m.ROUTES)
      },
      // ── Personal ───────────────────────────────────────────────────
      {
        path: 'perfil',
        loadComponent: () =>
          import('./features/personal/mi-perfil/perfil.component').then(m => m.PerfilComponent),
      },
      {
        path: 'turnos/logueo',
        loadChildren: () =>
          import('./features/personal/logueo_turnos/logueo_turnos.routes').then(m => m.ROUTES)
      },
      // ── Admin ──────────────────────────────────────────────────────
      {
        path: 'admin/ubicaciones',
        loadChildren: () =>
          import('./features/admin/constructor_ubicaciones/constructor_ubicaciones.routes').then(m => m.ROUTES)
      },
      {
        path: 'admin/auditoria',
        loadChildren: () =>
          import('./features/admin/visor_auditoria/visor_auditoria.routes').then(m => m.ROUTES)
      },
      // ── Fallback ───────────────────────────────────────────────────
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: 'app/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
