import { Routes } from '@angular/router';
import { roleGuard } from '@core/guards/role.guard';
import { PacientesListComponent } from './pages/pacientes-list/pacientes-list.component';
import { PacienteCreateComponent } from './pages/paciente-create/paciente-create.component';

export const PACIENTES_ROUTES: Routes = [
  { path: '', component: PacientesListComponent },
  {
    path: 'nuevo',
    component: PacienteCreateComponent,
    canActivate: [roleGuard],
    data: { roles: ['ADMIN', 'MEDICO'] },
  },
  {
    path: 'editar/:documento',
    component: PacienteCreateComponent,
    canActivate: [roleGuard],
    data: { roles: ['ADMIN', 'MEDICO'] },
  },
  {
    path: ':id/historia',
    loadComponent: () =>
      import('../historia-clinica/pages/historia-detalle/historia-detalle.component')
        .then((m) => m.HistoriaDetalleComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('../historia-clinica/pages/paciente-detalle/paciente-detalle.component')
        .then((m) => m.PacienteDetalleComponent),
  },
];
