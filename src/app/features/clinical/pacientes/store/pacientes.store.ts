import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap, forkJoin } from 'rxjs';
import { Router } from '@angular/router';

import { PacientesService, Paciente, PacientePayload } from '../services/pacientes.service';
import { CatalogosService, Catalogo } from '../../../../core/services/catalogos.service';

export type PacientesState = {
  pacientes: Paciente[];
  dietas: Catalogo[];
  ubicaciones: Catalogo[]; // Array temporal de catálogos base
  isLoading: boolean;
  error: string | null;
};

const initialState: PacientesState = {
  pacientes: [],
  dietas: [],
  ubicaciones: [
    { id: 1, nombre: 'Urgencias (Box 1)' },
    { id: 2, nombre: 'UCI (Cama 4)' },
    { id: 3, nombre: 'Hospitalización Norte (Hab. 201)' }
  ],
  isLoading: false,
  error: null,
};

export const PacientesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
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
                error: (err: any) => patchState(store, { error: err.message, isLoading: false })
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
                next: (dietas) => patchState(store, { dietas, isLoading: false }),
                error: (err: any) => patchState(store, { error: err.message, isLoading: false })
              })
            )
          )
        )
      ),

      registrar: rxMethod<PacientePayload>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((payload) =>
            pacientesSvc.registrarPaciente(payload).pipe(
              tapResponse({
                next: (nuevoPaciente) => {
                  patchState(store, { 
                    pacientes: [...store.pacientes(), nuevoPaciente],
                    isLoading: false 
                  });
                  router.navigate(['/app/pacientes']);
                },
                error: (err: any) => patchState(store, { error: err.error?.message || err.message, isLoading: false })
              })
            )
          )
        )
      )
    };
  })
);
