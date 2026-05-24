import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '@store/auth.store';

/**
 * Guard funcional de protección por roles.
 * Redirige al dashboard si el usuario no tiene el rol requerido.
 */
export const roleGuard: CanActivateFn = (route) => {
  const store = inject(AuthStore);
  const router = inject(Router);

  const rolesPermitidos = route.data['roles'] as Array<string>;
  const usuario = store.usuario();

  if (usuario && rolesPermitidos?.includes(usuario.rol)) {
    return true;
  }

  return router.createUrlTree(['/app/dashboard']);
};
