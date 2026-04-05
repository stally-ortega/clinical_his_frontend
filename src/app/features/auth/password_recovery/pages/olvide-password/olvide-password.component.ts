import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../../core/services/auth.service';
import { FormInputComponent } from '../../../../../shared/components/ui/form-input/form-input.component';
import { ButtonComponent } from '../../../../../shared/components/ui/button/button.component';

@Component({
  selector: 'app-olvide-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, FormInputComponent, ButtonComponent],
  templateUrl: './olvide-password.component.html',
  styleUrl: './olvide-password.component.scss'
})
export class OlvidePasswordComponent {
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly form: FormGroup = this.fb.group({
    documento: ['', [Validators.required]]
  });

  readonly isLoading = signal(false);
  /** Silent Success: se muestra el mismo mensaje sin revelar si el doc. existe */
  readonly enviado = signal(false);
  readonly currentYear = new Date().getFullYear();

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    // Silent Success: Siempre mostramos éxito, sin importar si el documento existe
    this.authService.solicitarRecuperacion(this.form.value).subscribe({
      next: () => this._mostrarExito(),
      error: () => this._mostrarExito(), // Mismo mensaje en error para no revelar info
    });
  }

  private _mostrarExito(): void {
    this.isLoading.set(false);
    this.enviado.set(true);
  }
}
