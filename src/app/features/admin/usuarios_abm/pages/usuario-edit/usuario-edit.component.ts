import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuariosStore } from '../../store/usuarios.store';
import { UsuarioFormComponent } from '../usuario-form/usuario-form.component';
import { CrearUsuarioDto, ActualizarUsuarioDto, UsuarioAdmin } from '../../services/usuarios.service';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { UsuariosService } from '../../services/usuarios.service';

/**
 * Wrapper page para editar un usuario existente.
 * Carga el usuario por ID y delega al formulario reciclable.
 */
@Component({
  selector: 'app-usuario-edit',
  standalone: true,
  imports: [UsuarioFormComponent],
  template: `
    @if (usuario()) {
      <app-usuario-form
        [usuario]="usuario()!"
        (guardar)="onGuardar($event)"
        (cancelar)="onCancelar()"
      ></app-usuario-form>
    } @else {
      <div class="loading-state">Cargando usuario...</div>
    }
  `,
})
export class UsuarioEditComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(UsuariosStore);
  private readonly usuariosService = inject(UsuariosService);

  readonly usuario = signal<UsuarioAdmin | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id || isNaN(id)) {
      this.router.navigate(['/app/admin/usuarios']);
      return;
    }

    this.usuariosService.getUsuario(id).subscribe({
      next: (res) => this.usuario.set(res.data),
      error: () => this.router.navigate(['/app/admin/usuarios']),
    });
  }

  onGuardar(event: CrearUsuarioDto | { id: number; payload: ActualizarUsuarioDto }): void {
    if ('id' in event) {
      this.store.actualizarUsuario(event);
    } else {
      // En el flujo de editar no debería llegar un create, pero lo manejamos por type-safety
      this.store.crearUsuario(event);
    }
    this.router.navigate(['/app/admin/usuarios']);
  }

  onCancelar(): void {
    this.router.navigate(['/app/admin/usuarios']);
  }
}
