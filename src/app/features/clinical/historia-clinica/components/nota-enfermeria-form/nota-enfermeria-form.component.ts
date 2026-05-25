import { Component, output, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '@shared/components/ui/button/button.component';

export interface NotaFormPayload {
  titulo: string;
  descripcion: string;
}

@Component({
  selector: 'app-nota-enfermeria-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  templateUrl: './nota-enfermeria-form.component.html',
  styleUrl: './nota-enfermeria-form.component.scss'
})
export class NotaEnfermeriaFormComponent {
  readonly disabled = input<boolean>(false);
  readonly submitNota = output<NotaFormPayload>();

  private readonly fb = inject(FormBuilder);

  form: FormGroup = this.fb.group({
    titulo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
    descripcion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
  });

  onSubmit(): void {
    if (this.disabled() || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitNota.emit(this.form.value as NotaFormPayload);
    this.form.reset();
  }
}
