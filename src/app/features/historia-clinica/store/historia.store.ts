import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap, forkJoin } from 'rxjs';

import { EvolucionesService, Evolucion, EvolucionPayload } from '../services/evoluciones.service';
import { NotasService, Nota, NotaPayload } from '../services/notas.service';

// ─── State ───────────────────────────────────────────────────────────────────
export type HistoriaState = {
  evoluciones: Evolucion[];
  notas: Nota[];
  /** ID del paciente actualmente cargado (para recargar tras POST) */
  pacienteId: number | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: HistoriaState = {
  evoluciones: [],
  notas: [],
  pacienteId: null,
  isLoading: false,
  error: null,
};

// ─── Store ───────────────────────────────────────────────────────────────────
export const HistoriaStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const evolucionesSvc = inject(EvolucionesService);
    const notasSvc = inject(NotasService);

    /** Carga ambas listas en paralelo para un paciente dado. */
    const cargarHistorial = rxMethod<number>(
      pipe(
        tap((id) => patchState(store, { isLoading: true, error: null, pacienteId: id })),
        switchMap((id) =>
          forkJoin({
            evoluciones: evolucionesSvc.getEvoluciones(id),
            notas: notasSvc.getNotas(id),
          }).pipe(
            tapResponse({
              next: ({ evoluciones, notas }) =>
                patchState(store, { evoluciones, notas, isLoading: false }),
              error: (err: { message?: string }) =>
                patchState(store, {
                  error: err?.message ?? 'Error al cargar el historial.',
                  isLoading: false,
                }),
            }),
          ),
        ),
      ),
    );

    /** Crea una evolución y recarga el historial completo. */
    const agregarEvolucion = rxMethod<EvolucionPayload>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((payload) =>
          evolucionesSvc.crearEvolucion(payload).pipe(
            tapResponse({
              next: () => {
                const id = store.pacienteId();
                if (id != null) cargarHistorial(id);
              },
              error: (err: { message?: string }) =>
                patchState(store, {
                  error: err?.message ?? 'Error al registrar la evolución.',
                  isLoading: false,
                }),
            }),
          ),
        ),
      ),
    );

    /** Crea una nota y recarga el historial completo. */
    const agregarNota = rxMethod<NotaPayload>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((payload) =>
          notasSvc.crearNota(payload).pipe(
            tapResponse({
              next: () => {
                const id = store.pacienteId();
                if (id != null) cargarHistorial(id);
              },
              error: (err: { message?: string }) =>
                patchState(store, {
                  error: err?.message ?? 'Error al registrar la nota.',
                  isLoading: false,
                }),
            }),
          ),
        ),
      ),
    );

    return { cargarHistorial, agregarEvolucion, agregarNota };
  }),
);
