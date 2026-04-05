import { Component, inject, effect, computed, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../../store/auth.store';
import { CommonModule } from '@angular/common';
import { FormInputComponent } from '../../../shared/components/ui/form-input/form-input.component';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';

/**
 * Componente standalone del formulario de Login.
 * Glassmorphism + Dark Cyan theme.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, FormInputComponent, ButtonComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  protected readonly store = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly form: FormGroup = this.fb.group({
    documento: ['', [Validators.required]],
    clave: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected readonly currentYear = new Date().getFullYear();

  constructor() {
    // Cuando la autenticación sea exitosa, navega al dashboard del app layout
    effect(() => {
      if (this.store.isAuthenticated()) {
        this.router.navigate(['/app/dashboard']);
      }
    });
  }

  /** Detecta si el error del backend indica cuenta bloqueada */
  readonly cuentaBloqueada = computed(() => {
    const err = this.store.error() ?? '';
    return err.toLowerCase().includes('bloqueada') ||
           err.toLowerCase().includes('bloqueado') ||
           err.toLowerCase().includes('bloqueado_hasta');
  });

  onSubmit(): void {
    if (this.form.valid) {
      this.store.login(this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }

  get documento() { return this.form.get('documento'); }
  get clave() { return this.form.get('clave'); }
}
