import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap, forkJoin } from 'rxjs';

import { EvolucionesService } from '@features/clinical/historia-clinica/services/evoluciones.service';
import { NotasService } from '@features/clinical/historia-clinica/services/notas.service';
import { Evolucion, CrearEvolucionDto, Nota, CrearNotaDto } from '@core/models/evolucion.model';

export type HistoriaState = {
  evoluciones: Evolucion[];
  notas: Nota[];
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

export const HistoriaStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const evolucionesSvc = inject(EvolucionesService);
    const notasSvc = inject(NotasService);

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

    const agregarEvolucion = rxMethod<CrearEvolucionDto>(
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

    const agregarNota = rxMethod<CrearNotaDto>(
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
