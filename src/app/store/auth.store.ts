import { computed, inject, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { tapResponse } from '@ngrx/operators';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { AuthResponse, LoginPayload, Usuario } from '@core/models/auth.model';
import { SessionTimeoutService } from '@core/services/session-timeout.service';
import { WebSocketService } from '@core/services/websocket.service';

/** Forma del estado global de autenticación */
export type AuthState = {
  usuario: Usuario | null;
  token: string | null;
  permisos: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};

const initialState: AuthState = {
  usuario: null,
  token: null,
  permisos: [],
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

/**
 * Store global de Autenticación con NgRx SignalStore.
 * Expone signals reactivos de solo lectura y métodos que mutan el estado.
 * Incluye soporte para RBAC Dinámico (V3): permisos[] y gestión de sesión por inactividad.
 */
export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  // ── Señales computadas ─────────────────────────────────────────────────────
  withComputed((store) => ({
    /** true si el usuario logueado tiene rol ADMIN – bypass total del RBAC de UI */
    isAdmin: computed(() => store.usuario()?.rol === 'ADMIN'),

    /** Verifica si el usuario posee un permiso específico */
    hasPermission: computed(() => (codigo: string) => store.permisos().includes(codigo)),

    /** Verifica si el usuario posee al menos uno de los permisos requeridos */
    hasAnyPermission: computed(() => (codigos: string[]) => codigos.some((c) => store.permisos().includes(c))),
  })),

  withMethods((store) => {
    const authService = inject(AuthService);
    const injector = inject(Injector);

    // ── Inyección diferida (evita dependencias circulares en bootstrap) ───────
    let sessionTimeout: SessionTimeoutService | null = null;
    const getTimeoutService = () => {
      if (!sessionTimeout && injector) sessionTimeout = injector.get(SessionTimeoutService);
      return sessionTimeout;
    };

    let webSocket: WebSocketService | null = null;
    const getWsService = () => {
      if (!webSocket && injector) webSocket = injector.get(WebSocketService);
      return webSocket;
    };

    let router: Router | null = null;
    const getRouter = () => {
      if (!router && injector) router = injector.get(Router);
      return router;
    };

    return {
      /**
       * Método reactivo que maneja el flujo completo de login:
       * loading → petición HTTP → actualizar estado / persistir sesión → error handling.
       * Tras login exitoso, inicia el monitoreo de inactividad.
       */
      login: rxMethod<LoginPayload>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((credentials) =>
            authService.login(credentials).pipe(
              tapResponse({
                next: (response: AuthResponse) => {
                  const { access_token, usuario } = response.data;
                  const permisos = usuario.permisos ?? [];
                  authService.saveSession(access_token, usuario);
                  patchState(store, {
                    usuario,
                    token: access_token,
                    permisos,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null,
                  });
                  getTimeoutService()?.iniciarMonitoreo();
                  getWsService()?.conectar();
                },
                error: (err: { error?: { message?: string }; message?: string }) => {
                  const message = err?.error?.message ?? err?.message ?? 'Error al iniciar sesión.';
                  patchState(store, { isLoading: false, error: message, isAuthenticated: false });
                },
              }),
            ),
          ),
        ),
      ),

      /** Limpia el estado, detiene el timeout, cierra WS y redirige al login */
      logout(): void {
        getTimeoutService()?.detenerMonitoreo();
        getWsService()?.desconectar();
        authService.clearSession();
        patchState(store, initialState);
        // Redirección explícita al login tras limpiar el estado
        getRouter()?.navigate(['/login']);
      },

      /**
       * Lee el localStorage al iniciar la app y restaura el estado
       * si existe una sesión previa válida.
       */
      checkAuth(): void {
        const token = authService.getToken();
        const usuario = authService.getStoredUser();
        if (token && usuario) {
          const permisos = usuario.permisos ?? [];
          patchState(store, { token, usuario, permisos, isAuthenticated: true });
          getTimeoutService()?.iniciarMonitoreo();
          getWsService()?.conectar();
        }
      },
    };
  }),
);
