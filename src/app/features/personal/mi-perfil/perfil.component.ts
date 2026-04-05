import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthStore } from '../../../store/auth.store';
import { AuthService } from '../../../core/services/auth.service';
import { FormInputComponent } from '../../../shared/components/ui/form-input/form-input.component';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { Usuario } from '../../../core/models/auth.model';

/** Validador personalizado: nueva_password coincide con confirmar_password */
function passwordMatchValidator(control: AbstractControl) {
  const nueva = control.get('nueva_password')?.value;
  const confirmar = control.get('confirmar_password')?.value;
  return nueva && confirmar && nueva !== confirmar ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormInputComponent, ButtonComponent],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss'
})
export class PerfilComponent {
  private readonly authStore = inject(AuthStore);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly usuario = this.authStore.usuario;

  readonly formClave: FormGroup = this.fb.group({
    password_actual: ['', [Validators.required, Validators.minLength(8)]],
    nueva_password:  ['', [Validators.required, Validators.minLength(8)]],
    confirmar_password: ['', [Validators.required]]
  }, { validators: passwordMatchValidator });

  readonly isLoading = signal(false);
  readonly exito     = signal(false);
  readonly error     = signal<string | null>(null);

  get initials(): string {
    const u = this.usuario();
    if (!u) return '?';
    return `${u.nombres.charAt(0)}${u.apellidos.charAt(0)}`.toUpperCase();
  }

  onCambiarPassword(): void {
    if (this.formClave.invalid) {
      this.formClave.markAllAsTouched();
      return;
    }

    const { password_actual, nueva_password } = this.formClave.value;
    this.isLoading.set(true);
    this.exito.set(false);
    this.error.set(null);

    this.authService.cambiarPasswordInterno({ password_actual, nueva_password }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.exito.set(true);
        this.formClave.reset();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err?.error?.message ?? 'No se pudo actualizar la contraseña. Verifica la contraseña actual.');
      }
    });
  }

  get passwordMismatch(): boolean {
    return this.formClave.touched && !!this.formClave.errors?.['passwordMismatch'];
  }
}
