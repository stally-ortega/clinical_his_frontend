import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';

import { KardexService, Prescripcion } from '../services/kardex.service';

export type KardexState = {
  prescripciones: Prescripcion[];
  isLoading: boolean;
  error: string | null;
};

const initialState: KardexState = {
  prescripciones: [],
  isLoading: false,
  error: null,
};

export const KardexStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const kardexSvc = inject(KardexService);

    const cargarKardex = rxMethod<number>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((idPaciente) => {
          // Calcular hoy desde las 00:00:00 hasta las 23:59:59 (ISO string)
          const now = new Date();
          const desde = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).toISOString();
          const hasta = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();

          return kardexSvc.getKardexPaciente(idPaciente, desde, hasta).pipe(
            tapResponse({
              next: (prescripciones) => patchState(store, { prescripciones, isLoading: false }),
              error: (err: { message?: string }) => patchState(store, {
                error: err?.message ?? 'Error al cargar el Kardex',
                isLoading: false,
              }),
            })
          );
        })
      )
    );

    const marcarDosis = rxMethod<{ idDosis: number; idPaciente: number }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ idDosis, idPaciente }) => {
          const payload = {
            idempotency_key: crypto.randomUUID(), // Browser crypto API
            fecha_hora_aplicacion: new Date().toISOString(),
            estado_dosis: 'APLICADA',
          };

          return kardexSvc.aplicarDosis(idDosis, payload).pipe(
            tapResponse({
              next: () => {
                // Al finalizar exitosamente, recargar para pintar UI
                cargarKardex(idPaciente);
              },
              error: (err: { message?: string }) => patchState(store, {
                error: err?.message ?? 'Error al aplicar la dosis',
                isLoading: false,
              }),
            })
          );
        })
      )
    );

    return { cargarKardex, marcarDosis };
  })
);
