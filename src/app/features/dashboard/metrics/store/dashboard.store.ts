import { inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap, switchMap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { KpiDashboard, KpiMetric } from '@features/dashboard/metrics/models/dashboard-metrics.interface';

const defaultMetricas: KpiMetric[] = [
  {
    icon: 'group',
    titulo: 'Pacientes Activos',
    valor: 42,
    subtitulo: 'Hospitalizados al momento',
    colorClass: 'card-teal',
    tendencia: '+3%',
  },
  {
    icon: 'pending_actions',
    titulo: 'Tareas Pendientes',
    valor: 12,
    subtitulo: 'En el turno actual',
    colorClass: 'card-amber',
    tendencia: '-2%',
  },
  {
    icon: 'calendar_view_week',
    titulo: 'Turno en Curso',
    valor: 'Mañana',
    subtitulo: '06:00 – 14:00 h',
    colorClass: 'card-sky',
  },
  {
    icon: 'event_available',
    titulo: 'Ingresos Hoy',
    valor: 7,
    subtitulo: 'Nuevas admisiones en 24h',
    colorClass: 'card-emerald',
    tendencia: '+12%',
  },
];

const initialState: KpiDashboard = {
  metricas: defaultMetricas,
  lastUpdated: null,
  isLoading: false,
  error: null,
};

export const DashboardStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    totalPacientesActivos: () =>
      store.metricas().find((m: KpiMetric) => m.titulo === 'Pacientes Activos')?.valor ?? 0,
    totalTareasPendientes: () =>
      store.metricas().find((m: KpiMetric) => m.titulo === 'Tareas Pendientes')?.valor ?? 0,
    hasError: () => store.error() !== null,
    isEmpty: () => store.metricas().length === 0,
  })),
  withMethods((store, http = inject(HttpClient)) => ({
    loadDashboard: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() =>
          http
            .get<{ exito: boolean; data: KpiMetric[]; mensaje?: string }>(`${environment.apiUrl}/dashboard/metricas`)
            .pipe(
              tapResponse({
                next: (res) =>
                  patchState(store, {
                    metricas: res.data?.length ? res.data : defaultMetricas,
                    lastUpdated: new Date(),
                    isLoading: false,
                    error: null,
                  }),
                error: (err: unknown) => {
                  const mensaje =
                    err instanceof Error ? err.message : 'Error cargando métricas del dashboard';
                  patchState(store, {
                    isLoading: false,
                    error: mensaje,
                  });
                },
              })
            )
        )
      )
    ),

    clearError: () => patchState(store, { error: null }),
  }))
);
