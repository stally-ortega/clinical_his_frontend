import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { CatalogosService, Catalogo } from '../../../../core/services/catalogos.service';

// Extendemos Catalogo para UI
export interface CatalogoItem extends Catalogo {
  activo?: boolean;
  descripcion?: string;
}

export type CatalogosState = {
  items: CatalogoItem[];
  tipoActivo: string;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  successMessage: string | null;
};

const initialState: CatalogosState = {
  items: [],
  tipoActivo: 'DIETAS',
  isLoading: false,
  isSaving: false,
  error: null,
  successMessage: null,
};

export const CatalogosStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const catalogosService = inject(CatalogosService);

    return {
      setTipoActivo(tipo: string) {
        patchState(store, { tipoActivo: tipo, successMessage: null, error: null });
      },

      loadCatalogos: rxMethod<string>(
        pipe(
          tap((tipo) => patchState(store, { isLoading: true, error: null, tipoActivo: tipo })),
          switchMap((tipo) =>
            catalogosService.getCatalogos(tipo).pipe(
              tapResponse({
                next: (res: any) => {
                  const items = Array.isArray(res) ? res : [];
                  patchState(store, { items, isLoading: false });
                },
                error: (err) => patchState(store, { error: `Error al cargar catálogo ${tipo}`, isLoading: false }),
              })
            )
          )
        )
      ),

      crearRegistro: rxMethod<{ tipo: string; nombre: string; descripcion?: string }>(
        pipe(
          tap(() => patchState(store, { isSaving: true, error: null, successMessage: null })),
          switchMap((payload) =>
            catalogosService.crearCatalogo(payload).pipe(
              tapResponse({
                next: (res: any) => {
                  const nuevo = res.data || res;
                  // Si estamos viendo el mismo tipo, lo agregamos localmente
                  if (store.tipoActivo() === payload.tipo) {
                    patchState(store, { 
                      items: [...store.items(), { ...nuevo, activo: true }],
                      isSaving: false,
                      successMessage: 'Registro creado correctamente'
                    });
                  } else {
                    patchState(store, { isSaving: false, successMessage: 'Registro creado correctamente' });
                  }
                },
                error: (err) => patchState(store, { error: 'Error al crear registro', isSaving: false }),
              })
            )
          )
        )
      ),

      toggleEstado: rxMethod<{ id: number; activo: boolean }>(
        pipe(
          switchMap(({ id, activo }) => {
            const tipo = store.tipoActivo();
            patchState(store, { error: null, successMessage: null });
            return catalogosService.toggleEstado(id, activo, tipo).pipe(
              tapResponse({
                next: () => {
                  const itemsActualizados = store.items().map(item => 
                    item.id === id ? { ...item, activo } : item
                  );
                  patchState(store, { 
                    items: itemsActualizados,
                    successMessage: `Estado actualizado correctamente`
                  });
                },
                error: (err) => patchState(store, { error: 'Error al cambiar estado' }),
              })
            );
          })
        )
      )
    };
  })
);
