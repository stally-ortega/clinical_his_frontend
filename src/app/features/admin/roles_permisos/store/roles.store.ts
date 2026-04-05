import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, forkJoin } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { RolesService, Rol, Permiso } from '../services/roles.service';

export type RolesState = {
  roles: Rol[];
  permisos: Permiso[];
  selectedRolId: number | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  successMessage: string | null;
};

const initialState: RolesState = {
  roles: [],
  permisos: [],
  selectedRolId: null,
  isLoading: false,
  isSaving: false,
  error: null,
  successMessage: null,
};

export const RolesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const rolesService = inject(RolesService);

    return {
      seleccionarRol(id: number | null) {
        patchState(store, { selectedRolId: id, successMessage: null, error: null });
      },

      loadDatosBasicos: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(() =>
            forkJoin({
              roles: rolesService.getRoles(),
              permisos: rolesService.getPermisos()
            }).pipe(
              tapResponse({
                next: (res) => {
                  const roles = Array.isArray(res.roles) ? res.roles : (res.roles.data || []);
                  const permisos = Array.isArray(res.permisos) ? res.permisos : (res.permisos.data || []);
                  patchState(store, { roles, permisos, isLoading: false });
                },
                error: (err) => patchState(store, { error: 'Error al cargar roles/permisos', isLoading: false }),
              })
            )
          )
        )
      ),

      crearRol: rxMethod<{ nombre: string; descripcion: string }>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(({ nombre, descripcion }) =>
            rolesService.crearRol(nombre, descripcion).pipe(
              tapResponse({
                next: (res) => {
                  const nuevoRol = res.data || res;
                  // Si no trae permisos, inicializamos vacío
                  if (!nuevoRol.permisos) nuevoRol.permisos = [];
                  
                  patchState(store, { 
                    roles: [...store.roles(), nuevoRol],
                    isLoading: false,
                    successMessage: `Rol ${nombre} creado exitosamente`
                  });
                },
                error: (err) => patchState(store, { error: 'Error al crear rol', isLoading: false }),
              })
            )
          )
        )
      ),

      guardarPermisos: rxMethod<{ rolId: number; permisosIds: number[] }>(
        pipe(
          tap(() => patchState(store, { isSaving: true, error: null, successMessage: null })),
          switchMap(({ rolId, permisosIds }) =>
            rolesService.asignarPermisos(rolId, permisosIds).pipe(
              tapResponse({
                next: () => {
                  // Actualizar localmente local
                  const rolesActualizados = store.roles().map(rol => {
                    if (rol.id === rolId) {
                      const nuevosPermisosObjs = store.permisos().filter(p => permisosIds.includes(p.id));
                      return { ...rol, permisos: nuevosPermisosObjs };
                    }
                    return rol;
                  });
                  patchState(store, { 
                    roles: rolesActualizados, 
                    isSaving: false,
                    successMessage: 'Permisos actualizados correctamente'
                  });
                },
                error: (err) => patchState(store, { error: 'Error al guardar permisos', isSaving: false }),
              })
            )
          )
        )
      )
    };
  })
);
