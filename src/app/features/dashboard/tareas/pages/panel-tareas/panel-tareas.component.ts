import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { TareasStore } from '../../store/tareas.store';
import { AuthStore } from '../../../../../store/auth.store';
import { FormInputComponent } from '../../../../../shared/components/ui/form-input/form-input.component';
import { ButtonComponent } from '../../../../../shared/components/ui/button/button.component';

@Component({
  selector: 'app-panel-tareas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormInputComponent, ButtonComponent],
  templateUrl: './panel-tareas.component.html',
  styleUrl: './panel-tareas.component.scss'
})
export class PanelTareasComponent implements OnInit {
  public store = inject(TareasStore);
  public authStore = inject(AuthStore);
  private fb = inject(FormBuilder);

  form: FormGroup = this.fb.group({
    id_paciente: ['', [Validators.required, Validators.min(1)]],
    descripcion: ['', [Validators.required, Validators.minLength(5)]],
    fecha_hora_programada: ['', Validators.required]
  });

  // Trackear observación temporal por tarea en un mapa reactivo en el componente
  observacionesCierre: { [key: number]: string } = {};

  ngOnInit(): void {
    this.store.cargarTareas();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.value;
    const payload = {
      id_paciente: Number(val.id_paciente),
      descripcion: val.descripcion,
      fecha_hora_programada: new Date(val.fecha_hora_programada).toISOString()
    };

    // Agregar y resetear si el control es exitoso
    this.store.agregarTarea(payload);
    this.form.reset();
  }

  onCompletar(id: number): void {
    const ob = this.observacionesCierre[id] || '';
    this.store.marcarCompletada({ id, observaciones: ob });
  }

  setObservacion(id: number, event: any): void {
    this.observacionesCierre[id] = event?.target?.value || '';
  }
}
