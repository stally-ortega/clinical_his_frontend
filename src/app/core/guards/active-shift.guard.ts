import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TurnosStore } from '@features/personal/logueo_turnos/store/turnos.store';

/**
 * Guard funcional que bloquea la navegación a rutas de ejecución crítica
 * (ej. administrar medicamentos, completar tareas) si el usuario no tiene
 * un turno activo iniciado en el sistema.
 */
export const activeShiftGuard: CanActivateFn = () => {
  const turnosStore = inject(TurnosStore);
  const router = inject(Router);

  if (turnosStore.hasTurnoActivo()) {
    return true;
  }

  return router.createUrlTree(['/app/personal/turnos']);
};
