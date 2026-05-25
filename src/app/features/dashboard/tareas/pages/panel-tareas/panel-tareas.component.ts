import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { TareasStore } from '@features/dashboard/tareas/store/tareas.store';
import { TurnosStore } from '@features/personal/logueo_turnos/store/turnos.store';
import { AuthStore } from '@store/auth.store';
import { FormInputComponent } from '@shared/components/ui/form-input/form-input.component';
import { ButtonComponent } from '@shared/components/ui/button/button.component';
import { TareaCardComponent } from '@features/dashboard/tareas/components/tarea-card/tarea-card.component';

@Component({
  selector: 'app-panel-tareas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormInputComponent, ButtonComponent, TareaCardComponent],
  templateUrl: './panel-tareas.component.html',
  styleUrl: './panel-tareas.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelTareasComponent implements OnInit, OnDestroy {
  public store = inject(TareasStore);
  public authStore = inject(AuthStore);
  public turnosStore = inject(TurnosStore);
  private fb = inject(FormBuilder);

  form: FormGroup = this.fb.group({
    id_paciente: ['', [Validators.required, Validators.min(1)]],
    descripcion: ['', [Validators.required, Validators.minLength(5)]],
    fecha_hora_programada: ['', Validators.required]
  });

  ngOnInit(): void {
    this.store.cargarTareas();
    this.store.iniciarPolling(30000);
  }

  ngOnDestroy(): void {
    this.store.detenerPolling();
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

    this.store.agregarTarea(payload);
    this.form.reset();
  }

  onCompletar({ id, observaciones }: { id: number; observaciones: string }): void {
    if (!this.turnosStore.hasTurnoActivo()) {
      return;
    }
    this.store.marcarCompletada({ id, observaciones });
  }
}
