import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap, switchMap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { TareasService, Tarea, TareaPayload } from '../services/tareas.service';
import { AuthStore } from '../../../../store/auth.store';

export type TareasState = {
  tareas: Tarea[];
  isLoading: boolean;
  error: string | null;
};

const initialState: TareasState = {
  tareas: [],
  isLoading: false,
  error: null,
};

export const TareasStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store,
      tareasService = inject(TareasService),
      authStore = inject(AuthStore)
    ) => ({
      cargarTareas: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(() => {
            const userId = authStore.usuario()?.id;
            // Para el MVP y según los requerimientos, podemos pasar el ID para ver solo las nuestras
            // o no pasarlo para ver todo el pool. Por defecto, filtramos por el usuario logueado.
            return tareasService.getTareasPendientes(userId).pipe(
              tapResponse({
                next: (tareas) => patchState(store, { tareas, isLoading: false }),
                error: (err: any) => {
                  console.error('Error cargando tareas:', err);
                  patchState(store, { error: 'No se pudieron cargar las tareas pendientes', isLoading: false });
                },
              })
            );
          })
        )
      ),

      agregarTarea: rxMethod<TareaPayload>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((payload) =>
            tareasService.crearTarea(payload).pipe(
              tapResponse({
                next: () => {
                  // Mutamos estado asincronamente recargando las tareas
                  patchState(store, { isLoading: false });
                  // Llamamos recursivamente mediante el store inyectado original no se puede directo
                  // Recargaremos directamente el origen:
                  const userId = authStore.usuario()?.id;
                  tareasService.getTareasPendientes(userId).subscribe({
                     next: (t) => patchState(store, { tareas: t })
                  });
                },
                error: (err: any) => {
                  console.error('Error creando tarea:', err);
                  patchState(store, { error: 'No se pudo crear la tarea', isLoading: false });
                },
              })
            )
          )
        )
      ),

      marcarCompletada: rxMethod<{ id: number; observaciones?: string }>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(({ id, observaciones }) =>
            tareasService.completarTarea(id, observaciones).pipe(
              tapResponse({
                next: () => {
                  patchState(store, { isLoading: false });
                  // Recargamos el pool
                  const userId = authStore.usuario()?.id;
                  tareasService.getTareasPendientes(userId).subscribe({
                     next: (t) => patchState(store, { tareas: t })
                  });
                },
                error: (err: any) => {
                  console.error('Error completando tarea:', err);
                  patchState(store, { error: 'No se pudo completar la tarea', isLoading: false });
                },
              })
            )
          )
        )
      )
    })
  )
);
