import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../../store/auth.store';

/**
 * Guard funcional de protección por permisos granulares.
 * Lee `data.permission` (string) o `data.permissions` (string[])
 * de la ruta y redirige a /app/dashboard si el usuario no los posee.
 */
export const permissionGuard: CanActivateFn = (route) => {
  const store = inject(AuthStore);
  const router = inject(Router);

  const single = route.data['permission'] as string | undefined;
  const multiple = route.data['permissions'] as string[] | undefined;

  if (single && store.hasPermission()(single)) return true;
  if (multiple && multiple.length > 0 && store.hasAnyPermission()(multiple)) return true;

  return router.createUrlTree(['/app/dashboard']);
};
