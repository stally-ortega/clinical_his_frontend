import { inject, computed } from '@angular/core';
import { signalStore, withState, withMethods, patchState, withComputed } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap, switchMap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { UbicacionesService, TipoUbicacion, Nomenclatura } from '../services/ubicaciones.service';
import { ToastService } from '../../../../core/services/toast.service';
import { parseErrorMessage } from '../../../../core/utils/error.util';

export type UbicacionesState = {
  tiposDisponibles: TipoUbicacion[];
  nomenclaturas: Nomenclatura[];
  nomenclaturaActiva: Nomenclatura | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
};

const initialState: UbicacionesState = {
  tiposDisponibles: [],
  nomenclaturas: [],
  nomenclaturaActiva: null,
  isLoading: false,
  isSaving: false,
  error: null,
};

export const UbicacionesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    tiposActivos: computed(() => store.tiposDisponibles().filter((t) => t.estado !== false)),
    nomenclaturasActivas: computed(() => store.nomenclaturas().filter((n) => n.estado !== false)),
  })),
  withMethods((store) => {
    const service = inject(UbicacionesService);
    const toast = inject(ToastService);

    const handleError = (err: unknown, context: string) => {
      const mensaje = parseErrorMessage(err);
      console.error(context, err);
      patchState(store, { error: mensaje, isLoading: false, isSaving: false });
      toast.error(mensaje);
    };

    const reloadTipos = () =>
      service.getTiposUbicacion().pipe(
        tapResponse({
          next: (tipos) => patchState(store, { tiposDisponibles: tipos }),
          error: (err: unknown) => handleError(err, 'Error recargando tipos:'),
        })
      );

    const reloadNomenclaturas = () =>
      service.getNomenclaturas().pipe(
        tapResponse({
          next: (noms) => patchState(store, { nomenclaturas: noms }),
          error: (err: unknown) => handleError(err, 'Error recargando nomenclaturas:'),
        })
      );

    return {
      cargarTipos: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(() =>
            service.getTiposUbicacion().pipe(
              tapResponse({
                next: (tipos) => patchState(store, { tiposDisponibles: tipos, isLoading: false }),
                error: (err: unknown) => handleError(err, 'Error cargando tipos:'),
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
                error: (err: unknown) => handleError(err, 'Error cargando nomenclaturas:'),
              })
            )
          )
        )
      ),

      registrarTipo: rxMethod<{ id?: number; nombre: string }>(
        pipe(
          tap(() => patchState(store, { isSaving: true, error: null })),
          switchMap(({ id, nombre }) => {
            const obs = id != null ? service.actualizarTipo(id, { nombre }) : service.crearTipoUbicacion(nombre);
            return obs.pipe(
              tapResponse({
                next: () => {
                  patchState(store, { isSaving: false });
                  toast.success(id != null ? 'Tipo de ubicación actualizado correctamente' : 'Tipo de ubicación registrado correctamente');
                },
                error: (err: unknown) => handleError(err, 'Error guardando tipo:'),
              })
            );
          }),
          // Recargar tipos tras mutación exitosa
          switchMap(() => reloadTipos())
        )
      ),

      toggleEstadoTipo: rxMethod<number>(
        pipe(
          tap(() => patchState(store, { isSaving: true, error: null })),
          switchMap((id) =>
            service.toggleEstadoTipo(id).pipe(
              tapResponse({
                next: () => {
                  patchState(store, { isSaving: false });
                  toast.success('Estado del tipo actualizado');
                },
                error: (err: unknown) => handleError(err, 'Error toggling estado tipo:'),
              })
            )
          ),
          switchMap(() => reloadTipos())
        )
      ),

      configurarEstructura: rxMethod<{ nombre: string; estructura: { id_tipo_ubicacion: number; orden: number }[] }>(
        pipe(
          tap(() => patchState(store, { isSaving: true, error: null })),
          switchMap((payload) =>
            service.crearNomenclatura(payload).pipe(
              tapResponse({
                next: (n) => {
                  patchState(store, { nomenclaturaActiva: n, isSaving: false });
                  toast.success('Estructura global guardada exitosamente');
                },
                error: (err: unknown) => handleError(err, 'Error creando nomenclatura:'),
              })
            )
          ),
          switchMap(() => reloadNomenclaturas())
        )
      ),

      actualizarEstructura: rxMethod<{ id: number; payload: { nombre: string; estructura: { id_tipo_ubicacion: number; orden: number }[] } }>(
        pipe(
          tap(() => patchState(store, { isSaving: true, error: null })),
          switchMap(({ id, payload }) =>
            service.actualizarNomenclatura(id, payload).pipe(
              tapResponse({
                next: (n) => {
                  patchState(store, { nomenclaturaActiva: n, isSaving: false });
                  toast.success('Estructura global actualizada exitosamente');
                },
                error: (err: unknown) => handleError(err, 'Error actualizando nomenclatura:'),
              })
            )
          ),
          switchMap(() => reloadNomenclaturas())
        )
      ),

      toggleEstado: rxMethod<number>(
        pipe(
          tap(() => patchState(store, { isSaving: true, error: null })),
          switchMap((id) =>
            service.toggleEstadoNomenclatura(id).pipe(
              tapResponse({
                next: () => {
                  patchState(store, { isSaving: false });
                  toast.success('Estado de la nomenclatura actualizado');
                },
                error: (err: unknown) => handleError(err, 'Error toggling estado:'),
              })
            )
          ),
          switchMap(() => reloadNomenclaturas())
        )
      ),
    };
  })
);
