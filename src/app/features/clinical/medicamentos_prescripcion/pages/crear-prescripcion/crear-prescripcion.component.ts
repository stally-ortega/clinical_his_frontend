import { Component, OnInit, inject, computed } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { PrescripcionStore } from '../../store/prescripcion.store';
import { FormInputComponent } from '../../../../../shared/components/ui/form-input/form-input.component';
import { ButtonComponent } from '../../../../../shared/components/ui/button/button.component';

@Component({
  selector: 'app-crear-prescripcion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormInputComponent, ButtonComponent],
  templateUrl: './crear-prescripcion.component.html',
  styleUrl: './crear-prescripcion.component.scss'
})
export class CrearPrescripcionComponent implements OnInit {
  public store = inject(PrescripcionStore);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  idPaciente: number | null = null;

  viasOptions = computed(() => this.store.viasAplicacion().map(v => ({ value: v.id, label: v.nombre })));

  form: FormGroup = this.fb.group({
    medicamento: ['', [Validators.required, Validators.minLength(2)]],
    dosis: ['', [Validators.required, Validators.min(0.1)]],
    medida_dosis: ['', Validators.required],
    id_via_aplicacion: ['', Validators.required],
    frecuencia_horas: ['', [Validators.required, Validators.min(1)]],
    fecha_hora_inicio: ['', Validators.required],
    duracion_dias: ['', [Validators.required, Validators.min(1)]]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('idPaciente');
    if (id && !isNaN(Number(id))) {
      this.idPaciente = Number(id);
      this.store.cargarVias();
    } else {
      this.router.navigate(['/app/pacientes']);
    }
  }

  onSubmit(): void {
    if (this.form.invalid || !this.idPaciente) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.value;
    const payload = {
      id_paciente: this.idPaciente,
      medicamento: val.medicamento,
      dosis: Number(val.dosis),
      medida_dosis: val.medida_dosis,
      id_via_aplicacion: Number(val.id_via_aplicacion),
      frecuencia_horas: Number(val.frecuencia_horas),
      fecha_hora_inicio: new Date(val.fecha_hora_inicio).toISOString(),
      duracion_dias: Number(val.duracion_dias)
    };

    this.store.guardarPrescripcion({ payload, idPaciente: this.idPaciente });
  }

  goBack(): void {
    if (this.idPaciente) {
      this.router.navigate(['/app/kardex', this.idPaciente]);
    } else {
      this.router.navigate(['/app/pacientes']);
    }
  }
}
