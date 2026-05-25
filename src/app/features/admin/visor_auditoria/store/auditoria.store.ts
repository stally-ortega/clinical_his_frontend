import { inject, computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap, switchMap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { AuditoriaService } from '@features/admin/visor_auditoria/services/auditoria.service';
import {
  AuditoriaLog,
  AuditoriaFiltros,
} from '@features/admin/visor_auditoria/models/auditoria.model';

export type AuditoriaState = {
  logs: AuditoriaLog[];
  total: number;
  filtros: Required<AuditoriaFiltros>;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  lastUpdated: Date | null;
};

const initialState: AuditoriaState = {
  logs: [],
  total: 0,
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
  lastUpdated: null,
};

export const AuditoriaStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    totalLogs: () => store.total(),
    hasFilters: () =>
      store.filtros().search !== '' ||
      store.filtros().startDate !== '' ||
      store.filtros().endDate !== '',
    filtrosCount: () => {
      const f = store.filtros();
      let count = 0;
      if (f.search) count++;
      if (f.startDate) count++;
      if (f.endDate) count++;
      return count;
    },
  })),
  withMethods((store, service = inject(AuditoriaService)) => ({
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
        total: 0,
        isLoading: false,
        isLoadingMore: false,
        hasMore: true,
        error: null,
        lastUpdated: null,
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
              next: (result) => {
                const limit = store.filtros().limit || 50;
                const hayMas = result.logs.length === limit;
                const offset = store.filtros().offset || 0;
                if (offset === 0) {
                  patchState(store, {
                    logs: result.logs,
                    total: result.total,
                    isLoading: false,
                    isLoadingMore: false,
                    hasMore: hayMas,
                    lastUpdated: new Date(),
                  });
                } else {
                  patchState(store, {
                    logs: [...store.logs(), ...result.logs],
                    total: result.total,
                    isLoadingMore: false,
                    hasMore: hayMas,
                    lastUpdated: new Date(),
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
  }))
);
