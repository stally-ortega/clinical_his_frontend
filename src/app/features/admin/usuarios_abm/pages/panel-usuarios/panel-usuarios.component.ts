import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UsuariosStore } from '../../store/usuarios.store';
import { ButtonComponent } from '../../../../../shared/components/ui/button/button.component';

@Component({
  selector: 'app-panel-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  templateUrl: './panel-usuarios.component.html',
  styleUrl: './panel-usuarios.component.scss'
})
export class PanelUsuariosComponent implements OnInit {
  readonly store = inject(UsuariosStore);
  private readonly router = inject(Router);

  readonly searchControl = new FormControl('', { nonNullable: true });

  constructor() {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((query: string) => this.store.setSearchQuery(query));
  }

  ngOnInit(): void {
    this.store.loadUsuarios();
  }

  getRolNombre(rol: { id?: number; nombre?: string } | string): string {
    if (typeof rol === 'string') return rol;
    return rol?.nombre || 'N/A';
  }

  isBloqueado(bloqueado_hasta?: string | null): boolean {
    if (!bloqueado_hasta) return false;
    const dateBloqueo = new Date(bloqueado_hasta);
    const now = new Date();
    return dateBloqueo > now;
  }

  onToggleBloqueo(id: number, actualmenteBloqueado: boolean): void {
    const accion = actualmenteBloqueado ? 'DESBLOQUEAR' : 'BLOQUEAR';
    this.store.toggleBloqueo({ id, accion });
  }

  onForzarReset(id: number): void {
    if (confirm('¿Está seguro de forzar el reseteo de contraseña de este usuario? Se desvinculará de sus sesiones activas.')) {
      this.store.forzarReset(id);
    }
  }

  onCrear(): void {
    this.router.navigate(['/app/admin/usuarios/crear']);
  }

  onEditar(id: number): void {
    this.router.navigate(['/app/admin/usuarios/editar', id]);
  }
}
