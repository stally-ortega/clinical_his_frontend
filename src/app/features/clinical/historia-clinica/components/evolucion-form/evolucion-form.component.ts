import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonComponent } from '@shared/components/ui/button/button.component';
import { FormInputComponent } from '@shared/components/ui/form-input/form-input.component';
import { SelectCatalogoComponent } from '@shared/components/ui/select-catalogo/select-catalogo.component';
import { EstadoPaciente } from '@core/models/estado-paciente.enum';
import { CatalogoItem } from '@features/admin/catalogos_maestros/store/catalogos.store';

@Component({
  selector: 'app-evolucion-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, FormInputComponent, SelectCatalogoComponent],
  templateUrl: './evolucion-form.component.html',
  styleUrl: './evolucion-form.component.scss',
})
export class EvolucionFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly form: FormGroup = this.fb.group({
    titulo: ['', [Validators.required, Validators.minLength(3)]],
    descripcion: ['', [Validators.required, Validators.minLength(5)]],
    estado_paciente: [null as number | null, Validators.required],
  });

  readonly isSaving = input<boolean>(false);

  readonly submitEvolucion = output<{ titulo: string; descripcion: string; estado_paciente: EstadoPaciente }>();

  readonly estadoItems: CatalogoItem[] = Object.values(EstadoPaciente).map((nombre, idx) => ({
    id: idx,
    nombre,
  } as CatalogoItem));

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.value;
    const estadoSeleccionado = this.estadoItems.find((i) => i.id === raw.estado_paciente)?.nombre as EstadoPaciente;
    this.submitEvolucion.emit({
      titulo: raw.titulo,
      descripcion: raw.descripcion,
      estado_paciente: estadoSeleccionado,
    });
    this.form.reset({ estado_paciente: null });
  }
}
