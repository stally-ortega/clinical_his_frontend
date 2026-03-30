import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap, switchMap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { TurnosService } from '../services/turnos.service';

export type EstadoTurno = 'FUERA_TURNO' | 'EN_TURNO';

export type TurnoState = {
  estadoActual: EstadoTurno;
  isLoading: boolean;
  error: string | null;
};

const initialState: TurnoState = {
  estadoActual: 'FUERA_TURNO',
  isLoading: false,
  error: null,
};

export const TurnosStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (store, turnosService = inject(TurnosService)) => ({
      iniciar: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(() =>
            turnosService.iniciarTurno().pipe(
              tapResponse({
                next: () => patchState(store, { estadoActual: 'EN_TURNO', isLoading: false }),
                error: (err: any) => {
                  console.error('Error iniciando turno:', err);
                  patchState(store, { error: 'No se pudo iniciar el turno', isLoading: false });
                },
              })
            )
          )
        )
      ),

      finalizar: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(() =>
            turnosService.finalizarTurno().pipe(
              tapResponse({
                next: () => patchState(store, { estadoActual: 'FUERA_TURNO', isLoading: false }),
                error: (err: any) => {
                  console.error('Error finalizando turno:', err);
                  patchState(store, { error: 'No se pudo finalizar el turno', isLoading: false });
                },
              })
            )
          )
        )
      )
    })
  )
);
