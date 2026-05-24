import { Injectable, inject, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { fromEvent, Subscription, merge } from 'rxjs';
import { throttleTime, debounceTime, tap, catchError, switchMap, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '@env/environment';
import { AuthStore } from '@store/auth.store';

/**
 * SessionTimeoutService
 *
 * Monitorea la inactividad del usuario escuchando eventos DOM via RxJS.
 * Flujo: iniciarMonitoreo() → consulta backend → inicia timer → 
 *        resetea en eventos → al vencer: logout + redirect
 *
 * ⚠️ Bugs corregidos:
 *  - debounceTime ahora recibe la constante local (no this.timeoutMs leída antes del async)
 *  - monitoreoSub cancela TAMBIÉN la petición HTTP, eliminando suscripciones fantasmas
 */
@Injectable({ providedIn: 'root' })
export class SessionTimeoutService implements OnDestroy {
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly authStore = inject(AuthStore);

  /** Suscripción que cubre TANTO la petición HTTP como el stream de actividad DOM */
  private monitoreoSub?: Subscription;

  // ────────────────────────────────────────────────────────────────────────────
  /**
   * Inicia el monitoreo de inactividad.
   * Llamar tras un login exitoso.
   * Siempre destruye cualquier pipeline previo antes de arrancar uno nuevo.
   */
  iniciarMonitoreo(): void {
    this.detenerMonitoreo(); // 🔑 Destruye suscripciones fantasmas antes de crear nuevas

    interface ConfigGlobal { clave: string; valor: string }
    this.monitoreoSub = this.http.get<{ data?: ConfigGlobal[] }>(`${environment.apiUrl}/configuraciones`).pipe(
      map((res) => {
        const data = res.data ?? [];
        if (Array.isArray(data)) {
          const configTimeout = data.find((c) => c.clave === 'SESSION_TIMEOUT_MIN');
          return configTimeout ? parseInt(configTimeout.valor, 10) : 15;
        }
        return 15;
      }),
      // Si el backend falla (404, red) → devuelve el default silenciosamente
      catchError(() => of(15)),

      // ⚡ switchMap: si llegara una segunda respuesta (e.g. retry), cancela la anterior
      switchMap((minutos: number) => {
        const timeoutMs = Number(minutos) * 60 * 1000;

        // Guard: si por algún bug timeoutMs es NaN o ≤ 0, forzamos 15 min
        const safeMs = (!timeoutMs || isNaN(timeoutMs) || timeoutMs <= 0)
          ? 15 * 60 * 1000
          : timeoutMs;

        console.log(`[SessionTimeout] ✅ Iniciando monitoreo de sesión: ${minutos} min (${safeMs} ms)`);

        // ── Stream de actividad del usuario ───────────────────────────────
        const actividad$ = merge(
          fromEvent(window, 'mousemove'),
          fromEvent(window, 'keydown'),
          fromEvent(window, 'click'),
          fromEvent(window, 'scroll'),
          fromEvent(window, 'touchstart'),
        );

        return actividad$.pipe(
          throttleTime(1000),          // 1 evento procesado por segundo como máximo
          debounceTime(safeMs),        // ⚡ Usa la constante LOCAL — no this.timeoutMs
          tap(() => this._cerrarSesionPorInactividad()),
        );
      }),
    ).subscribe();
  }

  // ────────────────────────────────────────────────────────────────────────────
  /**
   * Detiene COMPLETAMENTE el monitoreo:
   * - Cancela la petición HTTP pendiente si el backend es lento
   * - Cancela el stream de eventos DOM
   * Se llama en logout() y antes de cada iniciarMonitoreo() nuevo.
   */
  detenerMonitoreo(): void {
    if (this.monitoreoSub) {
      this.monitoreoSub.unsubscribe();
      this.monitoreoSub = undefined;
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  private _cerrarSesionPorInactividad(): void {
    console.warn('[SessionTimeout] ⏰ Sesión cerrada por inactividad.');
    this.authStore.logout();
    // La navegación al /login ya está gestionada por authStore.logout() via Router diferido
  }

  ngOnDestroy(): void {
    this.detenerMonitoreo();
  }
}
