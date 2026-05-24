import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap, switchMap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { AuditoriaService, AuditoriaLog, AuditoriaFiltros } from '@features/admin/visor_auditoria/services/auditoria.service';

export type AuditoriaState = {
  logs: AuditoriaLog[];
  filtros: Required<AuditoriaFiltros>;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
};

const initialState: AuditoriaState = {
  logs: [],
  filtros: {
    search: '',
    startDate: '',
    endDate: '',
    sortBy: 'fecha_cambio',
    sortOrder: 'desc',
    offset: 0,
    limit: 50,
  },
  isLoading: false,
  isLoadingMore: false,
  hasMore: true,
  error: null,
};

export const AuditoriaStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (store, service = inject(AuditoriaService)) => ({
      actualizarOffset: (nuevoOffset: number) => {
        patchState(store, (state) => ({
          filtros: { ...state.filtros, offset: nuevoOffset },
        }));
      },

      setFiltros: (filtros: Partial<AuditoriaFiltros>) => {
        patchState(store, (state) => ({
          filtros: { ...state.filtros, ...filtros, offset: 0 },
        }));
      },

      resetFiltros: () => {
        patchState(store, {
          filtros: initialState.filtros,
          logs: [],
          isLoading: false,
          isLoadingMore: false,
          hasMore: true,
          error: null,
        });
      },

      cargarLogs: rxMethod<void>(
        pipe(
          tap(() => {
            const offset = store.filtros().offset || 0;
            if (offset === 0) {
              patchState(store, { isLoading: true, hasMore: true, error: null });
            } else {
              patchState(store, { isLoadingMore: true, error: null });
            }
          }),
          switchMap(() => {
            const filtros = store.filtros();
            const offset = filtros.offset || 0;
            const limit = filtros.limit || 50;
            return service.getLogs(filtros, limit, offset).pipe(
              tapResponse({
                next: (logs) => {
                  const limit = store.filtros().limit || 50;
                  const hayMas = logs.length === limit;
                  const offset = store.filtros().offset || 0;
                  if (offset === 0) {
                    patchState(store, {
                      logs,
                      isLoading: false,
                      isLoadingMore: false,
                      hasMore: hayMas,
                    });
                  } else {
                    patchState(store, {
                      logs: [...store.logs(), ...logs],
                      isLoadingMore: false,
                      hasMore: hayMas,
                    });
                  }
                },
                error: (err: unknown) => {
                  console.error('Error cargando logs de auditoría:', err);
                  patchState(store, {
                    error: 'No se pudo conectar con el registro de auditoría',
                    isLoading: false,
                    isLoadingMore: false,
                  });
                },
              })
            );
          })
        )
      ),
    })
  )
);
