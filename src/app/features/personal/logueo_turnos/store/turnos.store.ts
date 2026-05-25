import { inject, computed } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap, switchMap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { TurnosService } from '@features/personal/logueo_turnos/services/turnos.service';
import { EstadoTurno, TurnoActivo } from '@core/models/turno.model';

export type TurnoState = {
  estadoActual: EstadoTurno;
  turnoActivo: TurnoActivo | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: TurnoState = {
  estadoActual: 'FUERA_TURNO',
  turnoActivo: null,
  isLoading: false,
  error: null,
};

export const TurnosStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    hasTurnoActivo: computed(() => store.estadoActual() === 'EN_TURNO' && store.turnoActivo() !== null),
  })),
  withMethods(
    (store, turnosService = inject(TurnosService)) => ({
      iniciar: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(() =>
            turnosService.iniciarTurno().pipe(
              tapResponse({
                next: (res) => {
                  const turno = res.data ?? null;
                  patchState(store, {
                    estadoActual: 'EN_TURNO',
                    turnoActivo: turno,
                    isLoading: false,
                  });
                },
                error: (err: { error?: { message?: string }; message?: string }) => {
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
                next: (res) => {
                  const turno = res.data ?? null;
                  patchState(store, {
                    estadoActual: 'FUERA_TURNO',
                    turnoActivo: turno,
                    isLoading: false,
                  });
                },
                error: (err: { error?: { message?: string }; message?: string }) => {
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
