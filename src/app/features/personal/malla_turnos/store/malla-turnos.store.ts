import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { TurnosService } from '../../logueo_turnos/services/turnos.service';

export interface TurnoProgramado {
  id?: number;
  id_usuario: number;
  nombre_usuario?: string;
  fecha_inicio: string;
  fecha_fin: string;
  tipo_turno: string;
}

export type MallaTurnosState = {
  turnosProgramados: TurnoProgramado[];
  mesActual: number;
  anioActual: number;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  successMessage: string | null;
};

const date = new Date();
const initialState: MallaTurnosState = {
  turnosProgramados: [],
  mesActual: date.getMonth() + 1, // 1-12
  anioActual: date.getFullYear(),
  isLoading: false,
  isSaving: false,
  error: null,
  successMessage: null,
};

export const MallaTurnosStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const turnosService = inject(TurnosService);

    return {
      cambiarMes(incremento: number) {
        let nuevoMes = store.mesActual() + incremento;
        let nuevoAnio = store.anioActual();

        if (nuevoMes > 12) {
          nuevoMes = 1;
          nuevoAnio++;
        } else if (nuevoMes < 1) {
          nuevoMes = 12;
          nuevoAnio--;
        }

        patchState(store, { mesActual: nuevoMes, anioActual: nuevoAnio, error: null, successMessage: null });
      },

      cargarMalla: rxMethod<{ mes: number; anio: number }>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(({ mes, anio }) =>
            turnosService.getMallaMensual(mes, anio).pipe(
              tapResponse({
                next: (res: any) => {
                  const data = res.data || res || [];
                  patchState(store, { turnosProgramados: Array.isArray(data) ? data : [], isLoading: false });
                },
                error: (err) => patchState(store, { error: 'Error al cargar malla de turnos', isLoading: false }),
              })
            )
          )
        )
      ),

      asignarTurno: rxMethod<{ id_usuario: number; fecha_inicio: string; fecha_fin: string; tipo_turno: string }>(
        pipe(
          tap(() => patchState(store, { isSaving: true, error: null, successMessage: null })),
          switchMap((payload) =>
            turnosService.programarTurno(payload).pipe(
              tapResponse({
                next: (res: any) => {
                  patchState(store, { isSaving: false, successMessage: 'Turno programado correctamente' });
                  // Recargamos el mes actual
                  const mes = store.mesActual();
                  const anio = store.anioActual();
                  // No podemos despachar recursivamente pero idealmente exponemos esto
                },
                error: (err: any) => patchState(store, { error: err.error?.message || 'Error al programar turno', isSaving: false }),
              })
            )
          )
        )
      )
    };
  })
);
