import { Injectable, inject, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { fromEvent, Subscription, merge } from 'rxjs';
import { throttleTime, debounceTime, tap } from 'rxjs/operators';
import { ConfiguracionService } from './configuracion.service';
import { AuthStore } from '../../store/auth.store';

/**
 * SessionTimeoutService
 *
 * Monitorea la inactividad del usuario escuchando eventos DOM via RxJS.
 * Flujo: iniciarMonitoreo() → consulta backend → inicia timer → 
 *        resetea en eventos → al vencer: logout + redirect
 */
@Injectable({ providedIn: 'root' })
export class SessionTimeoutService implements OnDestroy {
  private readonly router = inject(Router);
  private readonly configService = inject(ConfiguracionService);
  private readonly authStore = inject(AuthStore);

  private activitySub?: Subscription;
  private timeoutMs = 15 * 60 * 1000; // Default: 15 minutos

  /**
   * Inicia el monitoreo de inactividad.
   * Llamar tras un login exitoso.
   */
  iniciarMonitoreo(): void {
    this.detenerMonitoreo(); // Limpiar cualquier sub previa

    // Obtener timeout del backend y luego escuchar actividad
    this.configService.getConfiguracion().subscribe({
      next: (config) => {
        this.timeoutMs = config.timeout_inactividad_minutos * 60 * 1000;
        this._suscribirEventos();
      },
      error: () => {
        // Si el backend falla, usar el default de 15 min
        console.warn('[SessionTimeout] No se pudo obtener config. Usando 15 min por defecto.');
        this._suscribirEventos();
      }
    });
  }

  /** Detiene el monitoreo (se llama en logout) */
  detenerMonitoreo(): void {
    this.activitySub?.unsubscribe();
    this.activitySub = undefined;
  }

  private _suscribirEventos(): void {
    const actividad$ = merge(
      fromEvent(window, 'mousemove'),
      fromEvent(window, 'keydown'),
      fromEvent(window, 'click'),
      fromEvent(window, 'scroll'),
      fromEvent(window, 'touchstart'),
    );

    this.activitySub = actividad$.pipe(
      // Throttle: máximo un evento procesado por segundo para no saturar
      throttleTime(1000),
      // Debounce: si no hay actividad en timeoutMs, dispara el logout
      debounceTime(this.timeoutMs),
      tap(() => this._cerrarSesionPorInactividad())
    ).subscribe();
  }

  private _cerrarSesionPorInactividad(): void {
    console.warn('[SessionTimeout] Sesión cerrada por inactividad.');
    this.authStore.logout();
    this.router.navigate(['/login'], {
      queryParams: { motivo: 'inactividad' }
    });
  }

  ngOnDestroy(): void {
    this.detenerMonitoreo();
  }
}
