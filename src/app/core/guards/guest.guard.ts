import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../../store/auth.store';

/**
 * Guard funcional que evita que un usuario autenticado acceda
 * a rutas públicas como /login o /auth/recuperar-password.
 * Redirige al dashboard si ya tiene sesión activa.
 */
export const guestGuard: CanActivateFn = () => {
  const store = inject(AuthStore);
  const router = inject(Router);

  if (store.isAuthenticated()) {
    return router.createUrlTree(['/app/dashboard']);
  }

  return true;
};
