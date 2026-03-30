import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';

import { KardexService, Prescripcion } from '../services/kardex.service';
import { SyncService } from '../../../../core/offline/sync.service';

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
    const syncSvc = inject(SyncService);

    const cargarKardex = rxMethod<number>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((idPaciente) => {
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
        tap(({ idDosis }) => {
          patchState(store, { isLoading: true, error: null });

          // 🔥 Optimistic UI Update: Marcamos la dosis como APLICADA en memoria inmediatamente
          const fechaActual = new Date().toISOString();
          const prescripcionesAct = store.prescripciones().map((p) => {
            if (!p.dosis_programadas) return p;
            const hasTarget = p.dosis_programadas.some((d) => d.id === idDosis);
            if (!hasTarget) return p;

            return {
              ...p,
              dosis_programadas: p.dosis_programadas.map((d) =>
                d.id === idDosis
                  ? { ...d, estado_dosis: 'APLICADA' as const, fecha_hora_aplicacion: fechaActual }
                  : d
              )
            };
          });

          patchState(store, { prescripciones: prescripcionesAct });
        }),
        switchMap(({ idDosis, idPaciente }) => {
          const fechaActual = new Date().toISOString();
          const payload = {
            idempotency_key: crypto.randomUUID(), 
            fecha_hora_aplicacion: fechaActual,
            estado_dosis: 'APLICADA',
          };

          return kardexSvc.aplicarDosis(idDosis, payload).pipe(
            tapResponse({
              next: () => {
                // Background success - UI is already updated, we just stop loading state
                patchState(store, { isLoading: false });
              },
              error: (err: any) => {
                patchState(store, { isLoading: false });
                
                const status = err?.status || err?.error?.status;
                // Si es un status 0 (offline), 504 o la red está caida nativamente
                if (!navigator.onLine || status === 0 || status === 504 || status === 503) {
                  console.warn('Network offline or unreachable. Enqueuing for background sync...');
                  syncSvc.encolarDosis({ idDosis, data: payload });
                  // No revertimos UI (Optimista)
                } else {
                  // Si fue un error legítimo de negocio (ej. Validation Error 400), podríamos revertir la UI o avisar
                  patchState(store, { error: err?.message ?? 'Error crítico al aplicar dosis' });
                  // Nota: En una app real de producción aquí habría lógica de rollback visual
                }
              },
            })
          );
        })
      )
    );

    return { cargarKardex, marcarDosis };
  })
);
