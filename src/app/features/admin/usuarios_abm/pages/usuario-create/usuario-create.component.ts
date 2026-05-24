import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UsuariosStore } from '../../store/usuarios.store';
import { UsuarioFormComponent } from '../usuario-form/usuario-form.component';
import { CrearUsuarioDto, ActualizarUsuarioDto } from '../../services/usuarios.service';

/**
 * Wrapper page para crear un usuario nuevo.
 * Delegación pura al componente reciclable UsuarioFormComponent.
 */
@Component({
  selector: 'app-usuario-create',
  standalone: true,
  imports: [UsuarioFormComponent],
  template: `
    <app-usuario-form
      (guardar)="onGuardar($event)"
      (cancelar)="onCancelar()"
    ></app-usuario-form>
  `,
})
export class UsuarioCreateComponent {
  private readonly store = inject(UsuariosStore);
  private readonly router = inject(Router);

  onGuardar(payload: CrearUsuarioDto | { id: number; payload: ActualizarUsuarioDto }): void {
    if ('id' in payload) {
      // En el flujo de crear no debería llegar un update, pero lo manejamos por type-safety
      this.store.actualizarUsuario(payload);
    } else {
      this.store.crearUsuario(payload);
    }
    this.router.navigate(['/app/admin/usuarios']);
  }

  onCancelar(): void {
    this.router.navigate(['/app/admin/usuarios']);
  }
}
