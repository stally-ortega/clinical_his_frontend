import { inject, computed } from '@angular/core';
import { signalStore, withState, withMethods, patchState, withComputed } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';
import { Router } from '@angular/router';

import { PacientesService, Paciente, PacientePayload } from '../services/pacientes.service';
import { CatalogosService, Catalogo } from '../../../../core/services/catalogos.service';

export type PacientesState = {
  pacientes: Paciente[];
  pacienteActivo: Paciente | null;
  dietas: Catalogo[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
};

const initialState: PacientesState = {
  pacientes: [],
  pacienteActivo: null,
  dietas: [],
  isLoading: false,
  isSaving: false,
  error: null,
};

/** Normaliza un mensaje de error HTTP o runtime */
function normalizeError(err: unknown): string {
  if (typeof err === 'object' && err !== null) {
    const e = err as { error?: { message?: string }; message?: string };
    return e.error?.message ?? e.message ?? 'Error desconocido';
  }
  return 'Error desconocido';
}

export const PacientesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    pacientesActivos: computed(() => store.pacientes().filter((p) => p.estado !== 'EGRESADO')),
    totalPacientes: computed(() => store.pacientes().length),
  })),
  withMethods((store) => {
    const pacientesSvc = inject(PacientesService);
    const catalogosSvc = inject(CatalogosService);
    const router = inject(Router);

    return {
      cargarPacientes: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(() =>
            pacientesSvc.getPacientesActivos().pipe(
              tapResponse({
                next: (pacientes) => patchState(store, { pacientes, isLoading: false }),
                error: (err: unknown) => patchState(store, { error: normalizeError(err), isLoading: false }),
              })
            )
          )
        )
      ),

      cargarDietas: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(() =>
            catalogosSvc.getCatalogos('dietas').pipe(
              tapResponse({
                next: (res) => patchState(store, { dietas: res.data, isLoading: false }),
                error: (err: unknown) => patchState(store, { error: normalizeError(err), isLoading: false }),
              })
            )
          )
        )
      ),

      seleccionarPaciente(paciente: Paciente | null) {
        patchState(store, { pacienteActivo: paciente });
      },

      registrar: rxMethod<PacientePayload>(
        pipe(
          tap(() => patchState(store, { isSaving: true, error: null })),
          switchMap((payload) =>
            pacientesSvc.registrarPaciente(payload).pipe(
              tapResponse({
                next: (nuevoPaciente) => {
                  patchState(store, {
                    pacientes: [...store.pacientes(), nuevoPaciente],
                    isSaving: false,
                  });
                  router.navigate(['/app/pacientes']);
                },
                error: (err: unknown) => patchState(store, { error: normalizeError(err), isSaving: false }),
              })
            )
          )
        )
      ),

      cargarPacientePorDocumento: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((documento) =>
            pacientesSvc.getPacienteByDocumento(documento).pipe(
              tapResponse({
                next: (paciente) => patchState(store, { pacienteActivo: paciente, isLoading: false }),
                error: (err: unknown) => patchState(store, { error: normalizeError(err), isLoading: false }),
              })
            )
          )
        )
      ),

      actualizar: rxMethod<{ documento: string; payload: PacientePayload }>(
        pipe(
          tap(() => patchState(store, { isSaving: true, error: null })),
          switchMap(({ documento, payload }) =>
            pacientesSvc.actualizarPaciente(documento, payload).pipe(
              tapResponse({
                next: (pacienteActualizado) => {
                  patchState(store, {
                    pacientes: store.pacientes().map((p) =>
                      p.id === pacienteActualizado.id ? pacienteActualizado : p
                    ),
                    pacienteActivo: pacienteActualizado,
                    isSaving: false,
                  });
                  router.navigate(['/app/pacientes']);
                },
                error: (err: unknown) => patchState(store, { error: normalizeError(err), isSaving: false }),
              })
            )
          )
        )
      ),
    };
  })
);
