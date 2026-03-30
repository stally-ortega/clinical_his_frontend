import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap, switchMap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { UbicacionesService, TipoUbicacion, Nomenclatura } from '../services/ubicaciones.service';

export type UbicacionesState = {
  tiposDisponibles: TipoUbicacion[];
  nomenclaturaActiva: Nomenclatura | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: UbicacionesState = {
  tiposDisponibles: [],
  nomenclaturaActiva: null,
  isLoading: false,
  error: null,
};

export const UbicacionesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (store, service = inject(UbicacionesService)) => ({
      cargarTipos: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(() =>
            service.getTiposUbicacion().pipe(
              tapResponse({
                next: (tipos) => patchState(store, { tiposDisponibles: tipos, isLoading: false }),
                error: (err: any) => {
                  console.error('Error cargando tipos:', err);
                  patchState(store, { error: 'No se pudieron cargar los tipos de ubicación', isLoading: false });
                },
              })
            )
          )
        )
      ),

      registrarTipo: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((nombre) =>
            service.crearTipoUbicacion(nombre).pipe(
              tapResponse({
                next: () => {
                  patchState(store, { isLoading: false });
                  service.getTiposUbicacion().subscribe(t => patchState(store, { tiposDisponibles: t }));
                },
                error: (err: any) => {
                  console.error('Error creando tipo:', err);
                  patchState(store, { error: 'No se pudo crear el tipo de ubicación', isLoading: false });
                },
              })
            )
          )
        )
      ),

      configurarEstructura: rxMethod<{ nombre: string; niveles: { id_tipo_ubicacion: number; orden: number }[] }>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((payload) =>
            service.crearNomenclatura(payload).pipe(
              tapResponse({
                next: (n) => patchState(store, { nomenclaturaActiva: n, isLoading: false }),
                error: (err: any) => {
                  console.error('Error creando nomenclatura:', err);
                  patchState(store, { error: 'No se pudo guardar la estructura global', isLoading: false });
                },
              })
            )
          )
        )
      )
    })
  )
);
