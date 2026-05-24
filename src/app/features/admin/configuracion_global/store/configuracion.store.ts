import { inject, computed } from '@angular/core';
import { signalStore, withState, withMethods, patchState, withComputed } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import {
  ConfiguracionGlobal,
  ActualizarConfiguracionDto,
} from '../models/configuracion.interface';
import { ConfiguracionGlobalService } from '../services/configuracion.service';

export interface ConfiguracionState {
  configuraciones: ConfiguracionGlobal[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: ConfiguracionState = {
  configuraciones: [],
  isLoading: false,
  isSaving: false,
  error: null,
  successMessage: null,
};

export const ConfiguracionStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    configuracionesPorGrupo: computed(() => {
      const confs = store.configuraciones();
      if (!Array.isArray(confs)) return {};

      return confs.reduce((acc, curr) => {
        if (!acc[curr.grupo]) acc[curr.grupo] = [];
        acc[curr.grupo].push(curr);
        return acc;
      }, {} as Record<string, ConfiguracionGlobal[]>);
    }),
  })),
  withMethods((store, configuracionService = inject(ConfiguracionGlobalService)) => ({
    cargarConfiguraciones: rxMethod<void>(
      pipe(
        tap(() => {
          patchState(store, { isLoading: true, error: null, successMessage: null });
        }),
        switchMap(() =>
          configuracionService.obtenerConfiguraciones().pipe(
            tapResponse({
              next: (configuraciones) => {
                patchState(store, {
                  configuraciones,
                  isLoading: false,
                });
              },
              error: (err: unknown) => {
                console.error('Error cargando configuraciones:', err);
                patchState(store, {
                  error: 'No se pudieron cargar las configuraciones',
                  isLoading: false,
                });
              },
            })
          )
        )
      )
    ),
  })),
  withMethods((store, configuracionService = inject(ConfiguracionGlobalService)) => ({
    guardarCambios: rxMethod<ActualizarConfiguracionDto[]>(
      pipe(
        tap(() => {
          patchState(store, { isSaving: true, error: null, successMessage: null });
        }),
        switchMap((data) =>
          configuracionService.actualizarBulk(data).pipe(
            tapResponse({
              next: (result) => {
                patchState(store, {
                  isSaving: false,
                  successMessage: `${result.modificados} configuración(es) actualizada(s) correctamente`,
                });
                store.cargarConfiguraciones();
              },
              error: (err: unknown) => {
                console.error('Error guardando configuraciones:', err);
                patchState(store, {
                  error: 'No se pudieron guardar los cambios',
                  isSaving: false,
                });
              },
            })
          )
        )
      )
    ),
  }))
);
