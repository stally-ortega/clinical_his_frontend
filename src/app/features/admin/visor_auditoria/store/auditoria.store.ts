import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap, switchMap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { AuditoriaService, AuditoriaLog } from '../services/auditoria.service';

export type AuditoriaState = {
  logs: AuditoriaLog[];
  isLoading: boolean;
  error: string | null;
};

const initialState: AuditoriaState = {
  logs: [],
  isLoading: false,
  error: null,
};

export const AuditoriaStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (store, service = inject(AuditoriaService)) => ({
      cargarLogs: rxMethod<{ limite?: number; offset?: number } | void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((params) => {
            const limit = params && typeof params === 'object' && 'limite' in params ? params.limite : 100;
            const offset = params && typeof params === 'object' && 'offset' in params ? params.offset : 0;
            return service.getLogs(limit, offset).pipe(
              tapResponse({
                next: (logs) => patchState(store, { logs, isLoading: false }),
                error: (err: any) => {
                  console.error('Error cargando logs de auditoría:', err);
                  patchState(store, { error: 'No se pudo conectar con el registro de auditoría', isLoading: false });
                },
              })
            );
          })
        )
      )
    })
  )
);
