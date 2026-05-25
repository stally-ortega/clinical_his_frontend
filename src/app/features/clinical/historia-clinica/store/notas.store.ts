import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';

import { NotasService } from '@features/clinical/historia-clinica/services/notas.service';
import { Nota, CrearNotaDto } from '@core/models/evolucion.model';

export type NotasState = {
  notas: Nota[];
  pacienteId: number | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
};

const initialState: NotasState = {
  notas: [],
  pacienteId: null,
  isLoading: false,
  isSaving: false,
  error: null,
};

function normalizeError(err: unknown): string {
  if (typeof err === 'object' && err !== null) {
    const e = err as { error?: { message?: string }; message?: string };
    return e.error?.message ?? e.message ?? 'Error desconocido';
  }
  return 'Error desconocido';
}

export const NotasStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const notasSvc = inject(NotasService);

    const cargarNotas = rxMethod<number>(
      pipe(
        tap((id) => patchState(store, { isLoading: true, error: null, pacienteId: id })),
        switchMap((id) =>
          notasSvc.getNotas(id).pipe(
            tapResponse({
              next: (notas) => patchState(store, { notas, isLoading: false }),
              error: (err: unknown) => patchState(store, { error: normalizeError(err), isLoading: false }),
            })
          )
        )
      )
    );

    const agregarNota = rxMethod<CrearNotaDto>(
      pipe(
        tap(() => patchState(store, { isSaving: true, error: null })),
        switchMap((payload) =>
          notasSvc.crearNota(payload).pipe(
            tapResponse({
              next: (nuevaNota) => {
                patchState(store, {
                  notas: [...store.notas(), nuevaNota],
                  isSaving: false,
                });
              },
              error: (err: unknown) => patchState(store, { error: normalizeError(err), isSaving: false }),
            })
          )
        )
      )
    );

    return { cargarNotas, agregarNota };
  })
);
