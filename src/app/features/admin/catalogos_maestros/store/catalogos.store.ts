import { inject, computed } from '@angular/core';
import { signalStore, withState, withMethods, patchState, withComputed } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import {
  CatalogosService,
  Catalogo,
  CatalogoQueryParams,
  CatalogoPaginatedResult,
} from '../../../../core/services/catalogos.service';

export interface CatalogoItem extends Catalogo {
  estado?: boolean;
  descripcion?: string;
  codigo?: string;
}

export type SortOrder = 'asc' | 'desc';

export interface CatalogosState {
  items: CatalogoItem[];
  tipoActivo: string;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  successMessage: string | null;
  total: number;
  offset: number;
  limit: number;
  search: string;
  sortBy: string;
  sortOrder: SortOrder;
  estadosPaciente: string[];
}

const initialState: CatalogosState = {
  items: [],
  tipoActivo: 'DIETAS',
  isLoading: false,
  isSaving: false,
  error: null,
  successMessage: null,
  total: 0,
  offset: 0,
  limit: 20,
  search: '',
  sortBy: 'nombre',
  sortOrder: 'asc',
  estadosPaciente: [],
};

/** Construye los parámetros de consulta actuales del store */
function buildParams(store: { search: () => string; sortBy: () => string; sortOrder: () => SortOrder; limit: () => number; offset: () => number }): CatalogoQueryParams {
  return {
    search: store.search(),
    sortBy: store.sortBy(),
    sortOrder: store.sortOrder(),
    limit: store.limit(),
    offset: store.offset(),
  };
}

export const CatalogosStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    itemsFiltrados: computed(() => {
      const query = store.search().toLowerCase().trim();
      const items = store.items();
      if (!query) return items;
      return items.filter((i) => i.nombre.toLowerCase().includes(query));
    }),
    hasMoreItems: computed(() => store.items().length < store.total()),
  })),
  withMethods((store) => {
    const catalogosService = inject(CatalogosService);

    const resetPagination = () =>
      patchState(store, { offset: 0, items: [], total: 0, error: null });

    const applyCatalogoResponse = (response: CatalogoPaginatedResult<Catalogo>, reset: boolean) => {
      const newItems = response.data.map((c) => ({ ...c } as CatalogoItem));
      const currentItems = reset ? [] : store.items();
      patchState(store, {
        items: [...currentItems, ...newItems],
        total: response.total,
        offset: (reset ? 0 : store.offset()) + store.limit(),
        isLoading: false,
      });
    };

    const handleCatalogoError = (tipo: string) => {
      patchState(store, { error: `Error al cargar catálogo ${tipo}`, isLoading: false });
    };

    return {
      setTipoActivo(tipo: string) {
        patchState(store, {
          tipoActivo: tipo,
          successMessage: null,
          error: null,
          offset: 0,
          items: [],
          total: 0,
          search: '',
          sortBy: 'nombre',
          sortOrder: 'asc',
        });
      },

      setSearch: rxMethod<string>(
        pipe(
          tap((search) => {
            patchState(store, { search, offset: 0, items: [], total: 0, error: null });
          }),
          switchMap(() => {
            const tipo = store.tipoActivo();
            patchState(store, { isLoading: true, error: null });
            return catalogosService.getCatalogos(tipo, { ...buildParams(store), offset: 0 }).pipe(
              tapResponse({
                next: (res) => applyCatalogoResponse(res, true),
                error: () => handleCatalogoError(tipo),
              })
            );
          })
        )
      ),

      setSort: rxMethod<{ sortBy: string; sortOrder: SortOrder }>(
        pipe(
          tap(({ sortBy, sortOrder }) => {
            patchState(store, { sortBy, sortOrder, offset: 0, items: [], total: 0, error: null });
          }),
          switchMap(() => {
            const tipo = store.tipoActivo();
            patchState(store, { isLoading: true, error: null });
            return catalogosService.getCatalogos(tipo, { ...buildParams(store), offset: 0 }).pipe(
              tapResponse({
                next: (res) => applyCatalogoResponse(res, true),
                error: () => handleCatalogoError(tipo),
              })
            );
          })
        )
      ),

      loadCatalogos: rxMethod<{ tipo: string; reset: boolean }>(
        pipe(
          tap(({ reset }) => {
            if (reset) resetPagination();
            patchState(store, { isLoading: true, error: null });
          }),
          switchMap(({ tipo, reset }) =>
            catalogosService.getCatalogos(tipo, { ...buildParams(store), offset: reset ? 0 : store.offset() }).pipe(
              tapResponse({
                next: (res) => applyCatalogoResponse(res, reset),
                error: () => handleCatalogoError(tipo),
              })
            )
          )
        )
      ),

      resetPagination() {
        patchState(store, {
          offset: 0,
          items: [],
          total: 0,
          search: '',
          sortBy: 'nombre',
          sortOrder: 'asc',
          error: null,
        });
      },

      crearRegistro: rxMethod<{ tipo: string; nombre: string; descripcion?: string }>(
        pipe(
          tap(() => patchState(store, { isSaving: true, error: null, successMessage: null })),
          switchMap((payload) =>
            catalogosService.crearCatalogo(payload).pipe(
              tapResponse({
                next: (res) => {
                  const data = ('data' in res && res.data) ? res.data : res;
                  const nuevo = typeof data === 'object' && data !== null ? (data as Catalogo) : null;
                  if (nuevo && store.tipoActivo() === payload.tipo) {
                    patchState(store, {
                      items: [...store.items(), { ...nuevo, estado: true } as CatalogoItem],
                      total: store.total() + 1,
                      isSaving: false,
                      successMessage: 'Registro creado correctamente',
                    });
                  } else {
                    patchState(store, { isSaving: false, successMessage: 'Registro creado correctamente' });
                  }
                },
                error: () => patchState(store, { error: 'Error al crear registro', isSaving: false }),
              })
            )
          )
        )
      ),

      actualizarRegistro: rxMethod<{
        tipo: string;
        id: number;
        payload: { nombre?: string; descripcion?: string; codigo?: string; estado?: boolean };
      }>(
        pipe(
          tap(() => patchState(store, { isSaving: true, error: null, successMessage: null })),
          switchMap(({ tipo, id, payload }) =>
            catalogosService.updateCatalogo(tipo, id, payload).pipe(
              tapResponse({
                next: (res) => {
                  const data = ('data' in res && res.data) ? res.data : res;
                  const actualizado = typeof data === 'object' && data !== null ? (data as Catalogo) : null;
                  const itemsActualizados = store.items().map((item) =>
                    item.id === id && actualizado
                      ? ({ ...item, ...actualizado } as CatalogoItem)
                      : item
                  );
                  patchState(store, {
                    items: itemsActualizados,
                    isSaving: false,
                    successMessage: 'Registro actualizado correctamente',
                  });
                },
                error: () => patchState(store, { error: 'Error al actualizar registro', isSaving: false }),
              })
            )
          )
        )
      ),

      toggleEstado: rxMethod<{ id: number; estado: boolean }>(
        pipe(
          switchMap(({ id, estado }) => {
            const tipo = store.tipoActivo();
            patchState(store, { error: null, successMessage: null });
            return catalogosService.toggleEstado(id, estado, tipo).pipe(
              tapResponse({
                next: () => {
                  const itemsActualizados = store.items().map((item) =>
                    item.id === id ? { ...item, estado } : item
                  );
                  patchState(store, { items: itemsActualizados, successMessage: 'Estado actualizado correctamente' });
                },
                error: () => patchState(store, { error: 'Error al cambiar estado' }),
              })
            );
          })
        )
      ),

      loadEstadosPaciente: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(() =>
            catalogosService.getEstadosPaciente().pipe(
              tapResponse({
                next: (estados) => patchState(store, { estadosPaciente: estados, isLoading: false }),
                error: () => patchState(store, { error: 'Error al cargar estados de paciente', isLoading: false }),
              })
            )
          )
        )
      ),
    };
  })
);
