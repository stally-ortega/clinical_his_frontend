import { inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap, switchMap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { UbicacionesService, TipoUbicacion, Nomenclatura } from '../services/ubicaciones.service';
import { ToastService } from '../../../../core/services/toast.service';

export type UbicacionesState = {
  tiposDisponibles: TipoUbicacion[];
  nomenclaturas: Nomenclatura[];
  nomenclaturaActiva: Nomenclatura | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: UbicacionesState = {
  tiposDisponibles: [],
  nomenclaturas: [],
  nomenclaturaActiva: null,
  isLoading: false,
  error: null,
};

function parseErrorMessage(err: unknown): string {
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

export const UbicacionesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (store, service = inject(UbicacionesService), toast = inject(ToastService)) => ({
      cargarTipos: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(() =>
            service.getTiposUbicacion().pipe(
              tapResponse({
                next: (tipos) => patchState(store, { tiposDisponibles: tipos, isLoading: false }),
                error: (err: unknown) => {
                  const mensaje = parseErrorMessage(err);
                  console.error('Error cargando tipos:', err);
                  patchState(store, { error: mensaje, isLoading: false });
                  toast.error(mensaje);
                },
              })
            )
          )
        )
      ),

      cargarNomenclaturas: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(() =>
            service.getNomenclaturas().pipe(
              tapResponse({
                next: (nomenclaturas) => patchState(store, { nomenclaturas, isLoading: false }),
                error: (err: unknown) => {
                  const mensaje = parseErrorMessage(err);
                  console.error('Error cargando nomenclaturas:', err);
                  patchState(store, { error: mensaje, isLoading: false });
                  toast.error(mensaje);
                },
              })
            )
          )
        )
      ),

      registrarTipo: rxMethod<{ id?: number; nombre: string }>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(({ id, nombre }) => {
            const obs = id != null
              ? service.actualizarTipo(id, { nombre })
              : service.crearTipoUbicacion(nombre);
            return obs.pipe(
              tapResponse({
                next: () => {
                  patchState(store, { isLoading: false });
                  service.getTiposUbicacion().subscribe(t => patchState(store, { tiposDisponibles: t }));
                  toast.success(id != null ? 'Tipo de ubicación actualizado correctamente' : 'Tipo de ubicación registrado correctamente');
                },
                error: (err: unknown) => {
                  const mensaje = parseErrorMessage(err);
                  console.error('Error guardando tipo:', err);
                  patchState(store, { error: mensaje, isLoading: false });
                  toast.error(mensaje);
                },
              })
            );
          })
        )
      ),

      toggleEstadoTipo: rxMethod<number>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((id) =>
            service.toggleEstadoTipo(id).pipe(
              tapResponse({
                next: () => {
                  patchState(store, { isLoading: false });
                  service.getTiposUbicacion().subscribe(t => patchState(store, { tiposDisponibles: t }));
                  toast.success('Estado del tipo actualizado');
                },
                error: (err: unknown) => {
                  const mensaje = parseErrorMessage(err);
                  console.error('Error toggling estado tipo:', err);
                  patchState(store, { error: mensaje, isLoading: false });
                  toast.error(mensaje);
                },
              })
            )
          )
        )
      ),

      configurarEstructura: rxMethod<{ nombre: string; estructura: { id_tipo_ubicacion: number; orden: number }[] }>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((payload) =>
            service.crearNomenclatura(payload).pipe(
              tapResponse({
                next: (n) => {
                  patchState(store, { nomenclaturaActiva: n, nomenclaturas: [], isLoading: false });
                  service.getNomenclaturas().subscribe(noms => patchState(store, { nomenclaturas: noms }));
                  toast.success('Estructura global guardada exitosamente');
                },
                error: (err: unknown) => {
                  const mensaje = parseErrorMessage(err);
                  console.error('Error creando nomenclatura:', err);
                  patchState(store, { error: mensaje, isLoading: false });
                  toast.error(mensaje);
                },
              })
            )
          )
        )
      ),

      actualizarEstructura: rxMethod<{ id: number; payload: { nombre: string; estructura: { id_tipo_ubicacion: number; orden: number }[] } }>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(({ id, payload }) =>
            service.actualizarNomenclatura(id, payload).pipe(
              tapResponse({
                next: (n) => {
                  patchState(store, { nomenclaturaActiva: n, nomenclaturas: [], isLoading: false });
                  service.getNomenclaturas().subscribe(noms => patchState(store, { nomenclaturas: noms }));
                  toast.success('Estructura global actualizada exitosamente');
                },
                error: (err: unknown) => {
                  const mensaje = parseErrorMessage(err);
                  console.error('Error actualizando nomenclatura:', err);
                  patchState(store, { error: mensaje, isLoading: false });
                  toast.error(mensaje);
                },
              })
            )
          )
        )
      ),

      toggleEstado: rxMethod<number>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((id) =>
            service.toggleEstadoNomenclatura(id).pipe(
              tapResponse({
                next: () => {
                  patchState(store, { isLoading: false });
                  service.getNomenclaturas().subscribe(noms => patchState(store, { nomenclaturas: noms }));
                  toast.success('Estado de la nomenclatura actualizado');
                },
                error: (err: unknown) => {
                  const mensaje = parseErrorMessage(err);
                  console.error('Error toggling estado:', err);
                  patchState(store, { error: mensaje, isLoading: false });
                  toast.error(mensaje);
                },
              })
            )
          )
        )
      )
    })
  )
);
