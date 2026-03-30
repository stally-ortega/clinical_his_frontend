import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap, switchMap, catchError, of } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { CatalogosService, Catalogo } from '../../../../core/services/catalogos.service';
import { PrescripcionService, PrescripcionPayload } from '../services/prescripcion.service';
import { Router } from '@angular/router';

export type PrescripcionState = {
  viasAplicacion: Catalogo[];
  isLoading: boolean;
  error: string | null;
};

const initialState: PrescripcionState = {
  viasAplicacion: [],
  isLoading: false,
  error: null,
};

export const PrescripcionStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store,
      catalogosService = inject(CatalogosService),
      prescripcionService = inject(PrescripcionService),
      router = inject(Router)
    ) => ({
      cargarVias: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(() =>
            catalogosService.getCatalogos('vias').pipe(
              tapResponse({
                next: (vias) => patchState(store, { viasAplicacion: vias, isLoading: false }),
                error: (err: any) => {
                  console.error('Error cargando vías:', err);
                  patchState(store, { error: 'Error al cargar las vías de aplicación', isLoading: false });
                },
              })
            )
          )
        )
      ),

      guardarPrescripcion: rxMethod<{ payload: PrescripcionPayload; idPaciente: number }>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(({ payload, idPaciente }) =>
            prescripcionService.crearPrescripcion(payload).pipe(
              tapResponse({
                next: () => {
                  patchState(store, { isLoading: false });
                  router.navigate(['/app/kardex', idPaciente]);
                },
                error: (err: any) => {
                  console.error('Error prescribiendo medicamento:', err);
                  patchState(store, { error: 'No se pudo generar la prescripción médica', isLoading: false });
                },
              })
            )
          )
        )
      )
    })
  )
);
