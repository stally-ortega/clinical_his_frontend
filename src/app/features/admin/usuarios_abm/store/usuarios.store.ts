import { inject, computed } from '@angular/core';
import { signalStore, withState, withMethods, patchState, withComputed } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import {
  UsuariosService,
  UsuarioAdmin,
  CrearUsuarioDto,
  ActualizarUsuarioDto,
} from '@features/admin/usuarios_abm/services/usuarios.service';

export type UsuariosState = {
  usuarios: UsuarioAdmin[];
  usuarioSeleccionado: UsuarioAdmin | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  searchQuery: string;
};

const initialState: UsuariosState = {
  usuarios: [],
  usuarioSeleccionado: null,
  isLoading: false,
  isSaving: false,
  error: null,
  searchQuery: '',
};

export const UsuariosStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    usuariosFiltrados: computed(() => {
      const query = store.searchQuery().toLowerCase().trim();
      const usuarios = store.usuarios();
      if (!query) return usuarios;
      return usuarios.filter(
        (u) =>
          u.documento.toLowerCase().includes(query) ||
          u.nombres.toLowerCase().includes(query) ||
          u.apellidos.toLowerCase().includes(query)
      );
    }),
  })),
  withMethods((store) => {
    const usuariosService = inject(UsuariosService);

    return {
      setSearchQuery(query: string): void {
        patchState(store, { searchQuery: query });
      },

      loadUsuarios: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(() =>
            usuariosService.getUsuarios().pipe(
              tapResponse({
                next: (res) => {
                  const usuarios = Array.isArray(res) ? res : (res.data ?? []);
                  patchState(store, { usuarios, isLoading: false });
                },
                error: () => patchState(store, { error: 'Error al cargar usuarios', isLoading: false }),
              })
            )
          )
        )
      ),

      toggleBloqueo: rxMethod<{ id: number; accion: 'BLOQUEAR' | 'DESBLOQUEAR' }>(
        pipe(
          switchMap(({ id, accion }) => {
            return usuariosService.toggleBloqueo(id, accion).pipe(
              tapResponse({
                next: () => {
                  const usuarios = store.usuarios().map((u) => {
                    if (u.id === id) {
                      return {
                        ...u,
                        bloqueado_hasta: accion === 'BLOQUEAR' ? '2030-12-31T23:59:59Z' : null,
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
      ),
    };
  }),
  withMethods((store) => {
    const usuariosService = inject(UsuariosService);

    return {
      crearUsuario: rxMethod<CrearUsuarioDto>(
        pipe(
          tap(() => patchState(store, { isSaving: true, error: null })),
          switchMap((payload) =>
            usuariosService.crearUsuario(payload).pipe(
              tapResponse({
                next: () => {
                  patchState(store, { isSaving: false });
                  store.loadUsuarios();
                },
                error: (err: { error?: { message?: string }; message?: string }) => {
                  const message = err?.error?.message ?? err?.message ?? 'Error al crear usuario';
                  patchState(store, { error: message, isSaving: false });
                },
              })
            )
          )
        )
      ),

      actualizarUsuario: rxMethod<{ id: number; payload: ActualizarUsuarioDto }>(
        pipe(
          tap(() => patchState(store, { isSaving: true, error: null })),
          switchMap(({ id, payload }) =>
            usuariosService.actualizarUsuario(id, payload).pipe(
              tapResponse({
                next: () => {
                  patchState(store, { isSaving: false });
                  store.loadUsuarios();
                },
                error: (err: { error?: { message?: string }; message?: string }) => {
                  const message = err?.error?.message ?? err?.message ?? 'Error al actualizar usuario';
                  patchState(store, { error: message, isSaving: false });
                },
              })
            )
          )
        )
      ),
    };
  })
);
