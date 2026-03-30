import { inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { AuthService } from '../core/services/auth.service';
import { AuthResponse, LoginPayload, Usuario } from '../core/models/auth.model';

/** Forma del estado global de autenticación */
export type AuthState = {
  usuario: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};

const initialState: AuthState = {
  usuario: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

/**
 * Store global de Autenticación con NgRx SignalStore.
 * Expone signals reactivos de solo lectura y métodos que mutan el estado.
 */
export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const authService = inject(AuthService);

    return {
      /**
       * Método reactivo que maneja el flujo completo de login:
       * loading → petición HTTP → actualizar estado / persistir sesión → error handling.
       */
      login: rxMethod<LoginPayload>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((credentials) =>
            authService.login(credentials).pipe(
              tapResponse({
                next: (response: AuthResponse) => {
                  const { access_token, usuario } = response.data;
                  authService.saveSession(access_token, usuario);
                  patchState(store, {
                    usuario,
                    token: access_token,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null,
                  });
                },
                error: (err: { error?: { message?: string }; message?: string }) => {
                  const message =
                    err?.error?.message ?? err?.message ?? 'Error al iniciar sesión.';
                  patchState(store, {
                    isLoading: false,
                    error: message,
                    isAuthenticated: false,
                  });
                },
              }),
            ),
          ),
        ),
      ),

      /** Limpia el estado y elimina la sesión del navegador */
      logout(): void {
        authService.clearSession();
        patchState(store, initialState);
      },

      /**
       * Lee el localStorage al iniciar la app y restaura el estado
       * si existe una sesión previa válida.
       */
      checkAuth(): void {
        const token = authService.getToken();
        const usuario = authService.getStoredUser();
        if (token && usuario) {
          patchState(store, {
            token,
            usuario,
            isAuthenticated: true,
          });
        }
      },
    };
  }),
);
