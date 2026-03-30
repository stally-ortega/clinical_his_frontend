import { Routes } from '@angular/router';
import { PacientesListComponent } from './pages/pacientes-list/pacientes-list.component';
import { PacienteCreateComponent } from './pages/paciente-create/paciente-create.component';

export const PACIENTES_ROUTES: Routes = [
  { path: '', component: PacientesListComponent },
  { path: 'nuevo', component: PacienteCreateComponent },
  {
    path: ':id/historia',
    loadComponent: () =>
      import('../historia-clinica/pages/historia-detalle/historia-detalle.component')
        .then((m) => m.HistoriaDetalleComponent),
  },
];
