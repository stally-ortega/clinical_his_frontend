import { inject, computed } from '@angular/core';
import { signalStore, withState, withMethods, patchState, withComputed } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';
import { Router } from '@angular/router';

import { PacientesService } from '@features/clinical/pacientes/services/pacientes.service';
import {
  Paciente,
  CrearPacienteDto,
  ActualizarPacienteDto,
  PacienteQueryParams,
} from '@core/models/paciente.model';
import { EstadoPaciente } from '@core/models/estado-paciente.enum';

export type PacientesState = {
  pacientes: Paciente[];
  pacienteActivo: Paciente | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  offset: number;
  limit: number;
  hasMore: boolean;
  search: string;
  estado: EstadoPaciente | null;
  activo: boolean | null;
};

const initialState: PacientesState = {
  pacientes: [],
  pacienteActivo: null,
  isLoading: false,
  isSaving: false,
  error: null,
  offset: 0,
  limit: 12,
  hasMore: false,
  search: '',
  estado: null,
  activo: true,
};

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
    totalPacientes: computed(() => store.pacientes().length),
  })),
  withMethods((store) => {
    const pacientesSvc = inject(PacientesService);
    const router = inject(Router);

    return {
      cargarPacientes: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(() => {
            const params: PacienteQueryParams = {
              search: store.search() || undefined,
              estado: store.estado() ?? undefined,
              activo: store.activo() ?? undefined,
              offset: store.offset(),
              limit: store.limit(),
            };
            return pacientesSvc.getPacientes(params).pipe(
              tapResponse({
                next: (pacientes) => {
                  const current = store.offset() === 0 ? pacientes : [...store.pacientes(), ...pacientes];
                  patchState(store, {
                    pacientes: current,
                    hasMore: pacientes.length === store.limit(),
                    isLoading: false,
                  });
                },
                error: (err: unknown) => patchState(store, { error: normalizeError(err), isLoading: false }),
              })
            );
          })
        )
      ),

      seleccionarPaciente(paciente: Paciente | null) {
        patchState(store, { pacienteActivo: paciente });
      },

      setSearch(query: string) {
        patchState(store, { search: query, offset: 0, pacientes: [] });
      },

      setActivoFilter(activo: boolean | null) {
        patchState(store, { activo, offset: 0, pacientes: [] });
      },

      setEstadoFilter(estado: EstadoPaciente | null) {
        patchState(store, { estado, offset: 0, pacientes: [] });
      },

      loadNextPage() {
        if (!store.isLoading() && store.hasMore()) {
          patchState(store, { offset: store.offset() + store.limit() });
        }
      },

      resetFilters() {
        patchState(store, {
          search: '',
          estado: null,
          activo: true,
          offset: 0,
          pacientes: [],
          hasMore: false,
        });
      },

      registrar: rxMethod<CrearPacienteDto>(
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

      cargarPacientePorId: rxMethod<number>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((id) =>
            pacientesSvc.getPacienteById(id).pipe(
              tapResponse({
                next: (paciente) => patchState(store, { pacienteActivo: paciente, isLoading: false }),
                error: (err: unknown) => patchState(store, { error: normalizeError(err), isLoading: false }),
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

      actualizar: rxMethod<{ documento: string; payload: ActualizarPacienteDto }>(
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
