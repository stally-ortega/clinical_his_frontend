import { Directive, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import { AuthStore } from '../../store/auth.store';

/**
 * Directiva estructural que inserta o elimina elementos del DOM
 * según si el usuario posee el permiso especificado.
 *
 * Uso: *appHasPermission="'VER_KARDEX'"
 */
@Directive({
  selector: '[appHasPermission]',
  standalone: true,
})
export class HasPermissionDirective {
  private readonly templateRef = inject(TemplateRef);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly store = inject(AuthStore);

  private permission = '';
  private hasView = false;

  set appHasPermission(permission: string) {
    this.permission = permission;
    this.updateView();
  }

  constructor() {
    effect(() => {
      // Re-evaluar cuando cambien los permisos o el usuario
      this.store.permisos();
      this.store.usuario();
      this.updateView();
    });
  }

  private updateView(): void {
    const granted = this.store.hasPermission()(this.permission);
    if (granted && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!granted && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
