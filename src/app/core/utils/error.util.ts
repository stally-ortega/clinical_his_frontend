import { HttpErrorResponse } from '@angular/common/http';

/**
 * Extrae un mensaje legible de cualquier error HTTP o runtime.
 * Centraliza la traducción de errores para el personal médico.
 */
export function parseErrorMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 400 || err.status === 409) {
      return err.error?.message ?? 'Operación no permitida por regla de negocio.';
    }
    if (err.status >= 500) {
      return 'Error interno. El administrador debe revisar los logs del servidor.';
    }
    return err.error?.message ?? err.message ?? 'Error de comunicación con el servidor.';
  }
  if (err instanceof Error) {
    return err.message;
  }
  return 'Error desconocido';
}
