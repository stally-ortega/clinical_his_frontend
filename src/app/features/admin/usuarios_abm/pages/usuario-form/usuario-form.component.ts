import { Component, Input, Output, EventEmitter, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UsuarioAdmin, CrearUsuarioDto, ActualizarUsuarioDto } from '../../services/usuarios.service';
import { RolesService, Rol } from '../../../roles_permisos/services/roles.service';
import { FormInputComponent } from '../../../../../shared/components/ui/form-input/form-input.component';
import { ButtonComponent } from '../../../../../shared/components/ui/button/button.component';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormInputComponent, ButtonComponent],
  templateUrl: './usuario-form.component.html',
  styleUrl: './usuario-form.component.scss',
})
export class UsuarioFormComponent implements OnInit {
  @Input() usuario: UsuarioAdmin | null = null;
  @Output() guardar = new EventEmitter<CrearUsuarioDto | { id: number; payload: ActualizarUsuarioDto }>();
  @Output() cancelar = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly rolesService = inject(RolesService);

  readonly roles = signal<Rol[]>([]);
  readonly isEdit = computed(() => !!this.usuario);

  readonly form: FormGroup = this.fb.group({
    documento: ['', [Validators.required]],
    nombres: ['', [Validators.required]],
    apellidos: ['', [Validators.required]],
    celular: ['', [Validators.required, Validators.pattern(/^\d{7,15}$/)]],
    email: ['', [Validators.email]],
    clave: ['', [Validators.minLength(6)]],
    rol_id: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.rolesService.getRoles().pipe(takeUntilDestroyed()).subscribe({
      next: (res) => this.roles.set(res.data ?? []),
      error: (err) => console.error('Error cargando roles', err),
    });

    if (this.usuario) {
      const rolId = typeof this.usuario.rol === 'string' ? '' : this.usuario.rol?.id ?? '';
      this.form.patchValue({
        documento: this.usuario.documento,
        nombres: this.usuario.nombres,
        apellidos: this.usuario.apellidos,
        celular: this.usuario.celular ?? '',
        email: this.usuario.email ?? '',
        rol_id: rolId,
      });
      this.form.get('documento')?.disable();
      this.form.get('clave')?.clearValidators();
      this.form.get('clave')?.updateValueAndValidity();
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const rolId = Number(raw.rol_id);

    if (this.usuario) {
      const payload: ActualizarUsuarioDto = {
        nombres: raw.nombres,
        apellidos: raw.apellidos,
        celular: raw.celular,
        email: raw.email || undefined,
        rol_id: rolId,
      };
      this.guardar.emit({ id: this.usuario.id, payload });
    } else {
      const payload: CrearUsuarioDto = {
        documento: raw.documento,
        nombres: raw.nombres,
        apellidos: raw.apellidos,
        celular: raw.celular,
        email: raw.email || undefined,
        clave: raw.clave,
        rol_id: rolId,
      };
      this.guardar.emit(payload);
    }
  }

  onCancelar(): void {
    this.cancelar.emit();
  }
}
