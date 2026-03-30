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
      { path: 'dashboard', redirectTo: 'dashboard/tareas', pathMatch: 'full' },
      {
        path: 'dashboard/tareas',
        loadChildren: () => import('./features/dashboard/tareas/tareas.routes').then(m => m.ROUTES)
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
      {
        path: 'prescribir/:idPaciente',
        loadChildren: () => import('./features/clinical/medicamentos_prescripcion/medicamentos_prescripcion.routes').then(m => m.ROUTES)
      },
      {
        path: 'admin/ubicaciones',
        loadChildren: () => import('./features/admin/constructor_ubicaciones/constructor_ubicaciones.routes').then(m => m.ROUTES)
      },
      {
        path: 'admin/auditoria',
        loadChildren: () => import('./features/admin/visor_auditoria/visor_auditoria.routes').then(m => m.ROUTES)
      },
      // Futura expansión: evoluciones, notas, turnos, tareas
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: 'app/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
