import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { ToastService } from '@core/services/toast.service';
import { AuthStore } from '@store/auth.store';

const ERROR_MESSAGES: Record<number, string> = {
  400: 'Solicitud incorrecta. Verifique los datos e intente nuevamente.',
  401: 'Sesión expirada o no autorizada. Por favor, inicie sesión nuevamente.',
  403: 'No tiene permisos para realizar esta acción.',
  404: 'El recurso solicitado no fue encontrado.',
  409: 'Conflicto de datos. Puede que el registro ya exista.',
  422: 'Datos de entrada inválidos. Revise los campos del formulario.',
  500: 'Error interno del servidor. Contacte al administrador del sistema.',
  503: 'Servicio no disponible. El servidor está en mantenimiento.',
};

function getErrorMessage(error: HttpErrorResponse): string {
  if (error.error?.message && typeof error.error.message === 'string') {
    return error.error.message;
  }
  return ERROR_MESSAGES[error.status] ?? `Error inesperado (${error.status}). Intente más tarde.`;
}

/**
 * Interceptor funcional de errores HTTP.
 * Traduce códigos de estado en mensajes legibles vía ToastService
 * y gestiona automáticamente la sesión expirada (401).
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const authStore = inject(AuthStore);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const message = getErrorMessage(error);

      if (error.status === 401) {
        toast.error('Sesión expirada');
        authStore.logout();
      } else {
        toast.error(message);
      }

      throw error;
    }),
  );
};
