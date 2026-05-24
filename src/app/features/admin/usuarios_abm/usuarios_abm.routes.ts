import { Routes } from '@angular/router';

export const ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/panel-usuarios/panel-usuarios.component').then(m => m.PanelUsuariosComponent)
  },
  {
    path: 'crear',
    loadComponent: () =>
      import('./pages/usuario-create/usuario-create.component').then(m => m.UsuarioCreateComponent)
  },
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./pages/usuario-edit/usuario-edit.component').then(m => m.UsuarioEditComponent)
  }
];
