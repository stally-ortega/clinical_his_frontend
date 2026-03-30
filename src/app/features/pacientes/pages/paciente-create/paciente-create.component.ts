import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { PacientesStore } from '../../store/pacientes.store';
import { FormInputComponent } from '../../../../shared/components/ui/form-input/form-input.component';

@Component({
  selector: 'app-paciente-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormInputComponent],
  templateUrl: './paciente-create.component.html',
  styleUrl: './paciente-create.component.scss'
})
export class PacienteCreateComponent implements OnInit {
  public store = inject(PacientesStore);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  form: FormGroup = this.fb.group({
    documento: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    edad: ['', [Validators.required, Validators.min(0)]],
    sexo: ['', Validators.required],
    id_ubicacion_fisica: ['', Validators.required],
    id_tipo_dieta: ['', Validators.required]
  });

  ngOnInit(): void {
    this.store.cargarDietas();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Convert string inputs to numbers where necessary
    const rawVal = this.form.value;
    const payload = {
      ...rawVal,
      edad: parseInt(rawVal.edad, 10),
      id_ubicacion_fisica: parseInt(rawVal.id_ubicacion_fisica, 10),
      id_tipo_dieta: parseInt(rawVal.id_tipo_dieta, 10)
    };

    this.store.registrar(payload);
  }

  goBack(): void {
    this.router.navigate(['/app/pacientes']);
  }
}
