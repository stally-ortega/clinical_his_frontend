import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { UsuariosService, UsuarioAdmin } from '../services/usuarios.service';

export type UsuariosState = {
  usuarios: UsuarioAdmin[];
  isLoading: boolean;
  error: string | null;
};

const initialState: UsuariosState = {
  usuarios: [],
  isLoading: false,
  error: null,
};

export const UsuariosStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const usuariosService = inject(UsuariosService);

    return {
      loadUsuarios: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(() =>
            usuariosService.getUsuarios().pipe(
              tapResponse({
                next: (res: any) => {
                  const usuarios = Array.isArray(res) ? res : (res.data || []);
                  patchState(store, { usuarios, isLoading: false });
                },
                error: (err) => patchState(store, { error: 'Error al cargar usuarios', isLoading: false }),
              })
            )
          )
        )
      ),

      toggleBloqueo: rxMethod<{ id: number; accion: 'BLOQUEAR' | 'DESBLOQUEAR' }>(
        pipe(
          switchMap(({ id, accion }) => {
            // Optimistic Update temporal o estado de carga por fila (aquí hacemos re-fetch rápido/simulado)
            return usuariosService.toggleBloqueo(id, accion).pipe(
              tapResponse({
                next: () => {
                  // Actualizamos localmente
                  const usuarios = store.usuarios().map(u => {
                    if (u.id === id) {
                      return {
                        ...u,
                        bloqueado_hasta: accion === 'BLOQUEAR' ? '2030-12-31T23:59:59Z' : null
                      };
                    }
                    return u;
                  });
                  patchState(store, { usuarios });
                },
                error: (err) => console.error('Error al toggle bloqueo', err),
              })
            );
          })
        )
      ),

      forzarReset: rxMethod<number>(
        pipe(
          switchMap((id) =>
            usuariosService.forzarReset(id).pipe(
              tapResponse({
                next: () => console.log(`Reset forzado para usuario ${id} enviado`),
                error: (err) => console.error('Error al forzar reset', err),
              })
            )
          )
        )
      )
    };
  })
);
