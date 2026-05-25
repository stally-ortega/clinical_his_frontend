import { inject, computed } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap, switchMap, interval, startWith, Subscription } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { TareasService, Tarea, TareaPayload } from '@features/dashboard/tareas/services/tareas.service';
import { AuthStore } from '@store/auth.store';
import { TurnosStore } from '@features/personal/logueo_turnos/store/turnos.store';

export type TareasState = {
  tareas: Tarea[];
  isLoading: boolean;
  error: string | null;
  pollingActivo: boolean;
};

const initialState: TareasState = {
  tareas: [],
  isLoading: false,
  error: null,
  pollingActivo: false,
};

function normalizeError(err: unknown): string {
  if (typeof err === 'object' && err !== null) {
    const e = err as { error?: { message?: string }; message?: string };
    return e.error?.message ?? e.message ?? 'Error desconocido';
  }
  return 'Error desconocido';
}

export const TareasStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    tareasPendientes: computed(() => store.tareas().filter((t) => t.estado === 'PENDIENTE')),
    tareasCompletadas: computed(() => store.tareas().filter((t) => t.estado === 'COMPLETADO')),
    tieneTareasAtrasadas: computed(() => {
      const ahora = new Date().getTime();
      return store.tareas().some((t) => {
        if (t.estado !== 'PENDIENTE') return false;
        const programada = new Date(t.fecha_hora_programada).getTime();
        return programada < ahora;
      });
    }),
  })),
  withMethods(
    (
      store,
      tareasService = inject(TareasService),
      authStore = inject(AuthStore),
      turnosStore = inject(TurnosStore)
    ) => {
      let pollSub: Subscription | null = null;

      const cargarTareas = rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(() => {
            const userId = authStore.usuario()?.id;
            return tareasService.getTareasPendientes(userId).pipe(
              tapResponse({
                next: (tareas) => patchState(store, { tareas, isLoading: false }),
                error: (err: unknown) => {
                  console.error('Error cargando tareas:', err);
                  patchState(store, { error: normalizeError(err), isLoading: false });
                },
              })
            );
          })
        )
      );

      const agregarTarea = rxMethod<TareaPayload>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((payload) =>
            tareasService.crearTarea(payload).pipe(
              tapResponse({
                next: () => {
                  patchState(store, { isLoading: false });
                  const userId = authStore.usuario()?.id;
                  tareasService.getTareasPendientes(userId).subscribe({
                    next: (t) => patchState(store, { tareas: t }),
                    error: () => patchState(store, { isLoading: false }),
                  });
                },
                error: (err: unknown) => {
                  console.error('Error creando tarea:', err);
                  patchState(store, { error: normalizeError(err), isLoading: false });
                },
              })
            )
          )
        )
      );

      const marcarCompletada = rxMethod<{ id: number; observaciones?: string }>(
        pipe(
          tap(() => {
            if (!turnosStore.hasTurnoActivo()) {
              throw new Error('DEBE_INICIAR_TURNO');
            }
            patchState(store, { isLoading: true, error: null });
          }),
          switchMap(({ id, observaciones }) =>
            tareasService.completarTarea(id, observaciones).pipe(
              tapResponse({
                next: () => {
                  patchState(store, { isLoading: false });
                  const userId = authStore.usuario()?.id;
                  tareasService.getTareasPendientes(userId).subscribe({
                    next: (t) => patchState(store, { tareas: t }),
                    error: () => patchState(store, { isLoading: false }),
                  });
                },
                error: (err: unknown) => {
                  console.error('Error completando tarea:', err);
                  patchState(store, { error: normalizeError(err), isLoading: false });
                },
              })
            )
          )
        )
      );

      const iniciarPolling = (intervalMs = 30000) => {
        if (pollSub) return;
        patchState(store, { pollingActivo: true });
        pollSub = interval(intervalMs)
          .pipe(
            startWith(0),
            switchMap(() => {
              const userId = authStore.usuario()?.id;
              return tareasService.getTareasPendientes(userId).pipe(
                tap({
                  next: (tareas) => patchState(store, { tareas, isLoading: false }),
                  error: (err: unknown) => {
                    console.error('Error en polling de tareas:', err);
                    patchState(store, { error: normalizeError(err), isLoading: false });
                  },
                })
              );
            })
          )
          .subscribe();
      };

      const detenerPolling = () => {
        pollSub?.unsubscribe();
        pollSub = null;
        patchState(store, { pollingActivo: false });
      };

      return { cargarTareas, agregarTarea, marcarCompletada, iniciarPolling, detenerPolling };
    }
  )
);
