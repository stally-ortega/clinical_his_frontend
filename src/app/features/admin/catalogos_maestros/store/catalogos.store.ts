import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import {
  CatalogosService,
  Catalogo,
  CatalogoQueryParams,
  CatalogoPaginatedResult,
} from '../../../../core/services/catalogos.service';

// Extendemos Catalogo para UI
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
  // Paginación, búsqueda y ordenamiento
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
  // Estado inicial de paginación, búsqueda y ordenamiento
  total: 0,
  offset: 0,
  limit: 20,
  search: '',
  sortBy: 'nombre',
  sortOrder: 'asc',
  estadosPaciente: [],
};

export const CatalogosStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const catalogosService = inject(CatalogosService);

    return {
      setTipoActivo(tipo: string) {
        patchState(store, {
          tipoActivo: tipo,
          successMessage: null,
          error: null,
          // Resetear paginación al cambiar de tipo
          offset: 0,
          items: [],
          total: 0,
        });
      },

      /**
       * Actualiza el término de búsqueda y recarga los datos desde el inicio
       */
      setSearch: rxMethod<string>(
        pipe(
          tap((search) => {
            patchState(store, {
              search,
              offset: 0,
              items: [],
              total: 0,
              error: null,
            });
          }),
          switchMap(() => {
            const tipo = store.tipoActivo();
            const params: CatalogoQueryParams = {
              search: store.search(),
              sortBy: store.sortBy(),
              sortOrder: store.sortOrder(),
              limit: store.limit(),
              offset: 0,
            };
            patchState(store, { isLoading: true, error: null });

            return catalogosService.getCatalogos(tipo, params).pipe(
              tapResponse({
                next: (response: CatalogoPaginatedResult<Catalogo>) => {
                  patchState(store, {
                    items: response.data as CatalogoItem[],
                    total: response.total,
                    offset: store.limit(), // Próximo offset
                    isLoading: false,
                  });
                },
                error: (err) =>
                  patchState(store, {
                    error: `Error al cargar catálogo ${tipo}`,
                    isLoading: false,
                  }),
              })
            );
          })
        )
      ),

      /**
       * Actualiza el ordenamiento y recarga los datos desde el inicio
       */
      setSort: rxMethod<{ sortBy: string; sortOrder: SortOrder }>(
        pipe(
          tap(({ sortBy, sortOrder }) => {
            patchState(store, {
              sortBy,
              sortOrder,
              offset: 0,
              items: [],
              total: 0,
              error: null,
            });
          }),
          switchMap(() => {
            const tipo = store.tipoActivo();
            const params: CatalogoQueryParams = {
              search: store.search(),
              sortBy: store.sortBy(),
              sortOrder: store.sortOrder(),
              limit: store.limit(),
              offset: 0,
            };
            patchState(store, { isLoading: true, error: null });

            return catalogosService.getCatalogos(tipo, params).pipe(
              tapResponse({
                next: (response: CatalogoPaginatedResult<Catalogo>) => {
                  patchState(store, {
                    items: response.data as CatalogoItem[],
                    total: response.total,
                    offset: store.limit(),
                    isLoading: false,
                  });
                },
                error: (err) =>
                  patchState(store, {
                    error: `Error al cargar catálogo ${tipo}`,
                    isLoading: false,
                  }),
              })
            );
          })
        )
      ),

      /**
       * Carga catálogos con soporte para paginación acumulativa (scroll infinito)
       * @param params.tipo - Tipo de catálogo a cargar
       * @param params.reset - Si es true, reinicia la lista y el offset
       */
      loadCatalogos: rxMethod<{ tipo: string; reset: boolean }>(
        pipe(
          tap(({ reset }) => {
            if (reset) {
              patchState(store, {
                offset: 0,
                items: [],
                total: 0,
                error: null,
              });
            }
            patchState(store, { isLoading: true, error: null });
          }),
          switchMap(({ tipo, reset }) => {
            const params: CatalogoQueryParams = {
              search: store.search(),
              sortBy: store.sortBy(),
              sortOrder: store.sortOrder(),
              limit: store.limit(),
              offset: reset ? 0 : store.offset(),
            };

            return catalogosService.getCatalogos(tipo, params).pipe(
              tapResponse({
                next: (response: CatalogoPaginatedResult<Catalogo>) => {
                  const newItems = response.data as CatalogoItem[];
                  const currentItems = reset ? [] : store.items();

                  patchState(store, {
                    items: [...currentItems, ...newItems],
                    total: response.total,
                    offset: (reset ? 0 : store.offset()) + store.limit(),
                    isLoading: false,
                  });
                },
                error: (err) =>
                  patchState(store, {
                    error: `Error al cargar catálogo ${tipo}`,
                    isLoading: false,
                  }),
              })
            );
          })
        )
      ),

      /**
       * Resetea el estado de paginación y búsqueda (útil al cambiar de vista)
       */
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

      /**
       * Verifica si hay más elementos para cargar (útil para scroll infinito)
       */
      hasMoreItems(): boolean {
        return store.items().length < store.total();
      },

      crearRegistro: rxMethod<{
        tipo: string;
        nombre: string;
        descripcion?: string;
      }>(
        pipe(
          tap(() =>
            patchState(store, {
              isSaving: true,
              error: null,
              successMessage: null,
            })
          ),
          switchMap((payload) =>
            catalogosService.crearCatalogo(payload).pipe(
              tapResponse({
                next: (res: Catalogo | { data?: Catalogo }) => {
                  const nuevo = (res as { data?: Catalogo }).data || res;
                  // Si estamos viendo el mismo tipo, lo agregamos localmente
                  if (store.tipoActivo() === payload.tipo) {
                    patchState(store, {
                      items: [
                        ...store.items(),
                        { ...(nuevo as Catalogo), estado: true } as CatalogoItem,
                      ],
                      total: store.total() + 1,
                      isSaving: false,
                      successMessage: 'Registro creado correctamente',
                    });
                  } else {
                    patchState(store, {
                      isSaving: false,
                      successMessage: 'Registro creado correctamente',
                    });
                  }
                },
                error: (err) =>
                  patchState(store, {
                    error: 'Error al crear registro',
                    isSaving: false,
                  }),
              })
            )
          )
        )
      ),

      /**
       * Actualiza un registro existente del catálogo
       */
      actualizarRegistro: rxMethod<{
        tipo: string;
        id: number;
        payload: {
          nombre?: string;
          descripcion?: string;
          codigo?: string;
          estado?: boolean;
        };
      }>(
        pipe(
          tap(() =>
            patchState(store, {
              isSaving: true,
              error: null,
              successMessage: null,
            })
          ),
          switchMap(({ tipo, id, payload }) =>
            catalogosService.updateCatalogo(tipo, id, payload).pipe(
              tapResponse({
                next: (res: Catalogo | { data?: Catalogo }) => {
                  const actualizado = (res as { data?: Catalogo }).data || res;
                  // Actualizamos el item en la lista local
                  const itemsActualizados = store.items().map((item) =>
                    item.id === id
                      ? { ...item, ...(actualizado as Catalogo) } as CatalogoItem
                      : item
                  );
                  patchState(store, {
                    items: itemsActualizados,
                    isSaving: false,
                    successMessage: 'Registro actualizado correctamente',
                  });
                },
                error: (err) =>
                  patchState(store, {
                    error: 'Error al actualizar registro',
                    isSaving: false,
                  }),
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
                  const itemsActualizados = store
                    .items()
                    .map((item) =>
                      item.id === id ? { ...item, estado } : item
                    );
                  patchState(store, {
                    items: itemsActualizados,
                    successMessage: `Estado actualizado correctamente`,
                  });
                },
                error: (err) =>
                  patchState(store, { error: 'Error al cambiar estado' }),
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
                next: (estados) =>
                  patchState(store, {
                    estadosPaciente: estados,
                    isLoading: false,
                  }),
                error: (err) =>
                  patchState(store, {
                    error: 'Error al cargar estados de paciente',
                    isLoading: false,
                  }),
              })
            )
          )
        )
      ),
    };
  })
);
