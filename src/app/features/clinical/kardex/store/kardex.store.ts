import { inject, computed } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap, catchError, of, forkJoin } from 'rxjs';

import { KardexService, Prescripcion } from '@features/clinical/kardex/services/kardex.service';
import { TareasService, Tarea } from '@features/dashboard/tareas/services/tareas.service';
import { NotasService } from '@features/clinical/historia-clinica/services/notas.service';
import { EvolucionesService } from '@features/clinical/historia-clinica/services/evoluciones.service';
import { Nota } from '@core/models/evolucion.model';
import { Evolucion } from '@core/models/evolucion.model';
import { SyncService } from '@core/offline/sync.service';

export type KardexFiltro = 'HOY' | 'AYER' | 'PENDIENTES';

export type KardexState = {
  prescripciones: Prescripcion[];
  tareas: Tarea[];
  notas: Nota[];
  evoluciones: Evolucion[];
  isLoading: boolean;
  error: string | null;
  filtro: KardexFiltro;
};

const initialState: KardexState = {
  prescripciones: [],
  tareas: [],
  notas: [],
  evoluciones: [],
  isLoading: false,
  error: null,
  filtro: 'HOY',
};

export const KardexStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    prescripcionesFiltradas: computed(() => {
      const prescripciones = store.prescripciones();
      const filtro = store.filtro();

      if (filtro === 'PENDIENTES') {
        return prescripciones.filter((p) =>
          p.dosis_programadas?.some((d) => d.estado_dosis === 'PENDIENTE')
        );
      }

      return prescripciones;
    }),

    matrizHoraria: computed(() => {
      const prescripciones = store.prescripciones();
      const horas = Array.from({ length: 24 }, (_, i) => i);

      return prescripciones.map((p) => ({
        fila: p.medicamento,
        celdas: horas.map((hora) => {
          const dosis = p.dosis_programadas?.find((d) => {
            const fecha = new Date(d.fecha_hora_programada);
            return fecha.getHours() === hora;
          });
          return dosis ?? null;
        }),
      }));
    }),

    tieneDatos: computed(() => {
      const s = store;
      return (
        s.prescripciones().length > 0 ||
        s.tareas().length > 0 ||
        s.notas().length > 0 ||
        s.evoluciones().length > 0
      );
    }),
  })),
  withMethods((store) => {
    const kardexSvc = inject(KardexService);
    const tareasSvc = inject(TareasService);
    const notasSvc = inject(NotasService);
    const evolucionesSvc = inject(EvolucionesService);
    const syncSvc = inject(SyncService);

    const cargarKardex = rxMethod<number>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((idPaciente) => {
          const now = new Date();
          const desde = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).toISOString();
          const hasta = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();

          return forkJoin({
            prescripciones: kardexSvc.getKardexPaciente(idPaciente, desde, hasta),
            tareas: tareasSvc.getTareasPendientes().pipe(catchError(() => of([]))),
            notas: notasSvc.getNotas(idPaciente).pipe(catchError(() => of([]))),
            evoluciones: evolucionesSvc.getEvoluciones(idPaciente).pipe(catchError(() => of([]))),
          }).pipe(
            tapResponse({
              next: ({ prescripciones, tareas, notas, evoluciones }) =>
                patchState(store, { prescripciones, tareas, notas, evoluciones, isLoading: false }),
              error: (err: { message?: string }) => patchState(store, {
                error: err?.message ?? 'Error al cargar el Kardex',
                isLoading: false,
              }),
            })
          );
        })
      )
    );

    const setFiltro = (filtro: KardexFiltro) => {
      patchState(store, { filtro });
    };

    const marcarDosis = rxMethod<{ idDosis: number; idPaciente: number }>(
      pipe(
        tap(({ idDosis }) => {
          patchState(store, { isLoading: true, error: null });

          const fechaActual = new Date().toISOString();
          const prescripcionesAct = store.prescripciones().map((p) => {
            if (!p.dosis_programadas) return p;
            const hasTarget = p.dosis_programadas.some((d) => d.id === idDosis);
            if (!hasTarget) return p;

            return {
              ...p,
              dosis_programadas: p.dosis_programadas.map((d) =>
                d.id === idDosis
                  ? { ...d, estado_dosis: 'APLICADA' as const, fecha_hora_aplicacion: fechaActual }
                  : d
              )
            };
          });

          patchState(store, { prescripciones: prescripcionesAct });
        }),
        switchMap(({ idDosis, idPaciente }) => {
          const fechaActual = new Date().toISOString();
          const payload = {
            idempotency_key: crypto.randomUUID(),
            fecha_hora_aplicacion: fechaActual,
            estado_dosis: 'APLICADA',
          };

          return kardexSvc.aplicarDosis(idDosis, payload).pipe(
            tapResponse({
              next: () => {
                patchState(store, { isLoading: false });
              },
              error: (err: { status?: number; error?: { status?: number; message?: string }; message?: string }) => {
                patchState(store, { isLoading: false });

                const status = err?.status || err?.error?.status;
                if (!navigator.onLine || status === 0 || status === 504 || status === 503) {
                  console.warn('Network offline or unreachable. Enqueuing for background sync...');
                  syncSvc.encolarDosis({ idDosis, data: payload });
                } else {
                  patchState(store, { error: err?.message ?? 'Error crítico al aplicar dosis' });
                }
              },
            })
          );
        })
      )
    );

    return { cargarKardex, marcarDosis, setFiltro };
  })
);
