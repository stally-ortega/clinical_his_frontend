import { Directive, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import { AuthStore } from '@store/auth.store';

/**
 * Directiva estructural que inserta o elimina elementos del DOM
 * según si el usuario posee el rol especificado.
 *
 * Uso: *appHasRole="'ADMIN'"
 */
@Directive({
  selector: '[appHasRole]',
  standalone: true,
})
export class HasRoleDirective {
  private readonly templateRef = inject(TemplateRef);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly store = inject(AuthStore);

  private role = '';
  private hasView = false;

  set appHasRole(role: string) {
    this.role = role;
    this.updateView();
  }

  constructor() {
    effect(() => {
      this.store.usuario();
      this.updateView();
    });
  }

  private updateView(): void {
    const granted = this.store.usuario()?.rol === this.role;
    if (granted && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!granted && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
