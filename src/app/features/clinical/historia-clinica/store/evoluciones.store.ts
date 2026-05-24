import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';

import { EvolucionesService } from '@features/clinical/historia-clinica/services/evoluciones.service';
import { Evolucion, CrearEvolucionDto } from '@core/models/evolucion.model';

export type EvolucionesState = {
  evoluciones: Evolucion[];
  pacienteId: number | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
};

const initialState: EvolucionesState = {
  evoluciones: [],
  pacienteId: null,
  isLoading: false,
  isSaving: false,
  error: null,
};

function normalizeError(err: unknown): string {
  if (typeof err === 'object' && err !== null) {
    const e = err as { error?: { message?: string }; message?: string };
    return e.error?.message ?? e.message ?? 'Error desconocido';
  }
  return 'Error desconocido';
}

export const EvolucionesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const evolucionesSvc = inject(EvolucionesService);

    const cargarEvoluciones = rxMethod<number>(
      pipe(
        tap((id) => patchState(store, { isLoading: true, error: null, pacienteId: id })),
        switchMap((id) =>
          evolucionesSvc.getEvoluciones(id).pipe(
            tapResponse({
              next: (evoluciones) => patchState(store, { evoluciones, isLoading: false }),
              error: (err: unknown) => patchState(store, { error: normalizeError(err), isLoading: false }),
            })
          )
        )
      )
    );

    const agregarEvolucion = rxMethod<CrearEvolucionDto>(
      pipe(
        tap(() => patchState(store, { isSaving: true, error: null })),
        switchMap((payload) =>
          evolucionesSvc.crearEvolucion(payload).pipe(
            tapResponse({
              next: (nuevaEvolucion) => {
                patchState(store, {
                  evoluciones: [...store.evoluciones(), nuevaEvolucion],
                  isSaving: false,
                });
              },
              error: (err: unknown) => patchState(store, { error: normalizeError(err), isSaving: false }),
            })
          )
        )
      )
    );

    return { cargarEvoluciones, agregarEvolucion };
  })
);
