import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { PacientesStore } from '../../store/pacientes.store';
import { PacientesService } from '../../services/pacientes.service';
import { CatalogosStore } from '../../../../admin/catalogos_maestros/store/catalogos.store';
import { UbicacionesStore } from '../../../../admin/constructor_ubicaciones/store/ubicaciones.store';
import { FormInputComponent } from '../../../../../shared/components/ui/form-input/form-input.component';
import { ButtonComponent } from '../../../../../shared/components/ui/button/button.component';

@Component({
  selector: 'app-paciente-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormInputComponent, ButtonComponent],
  templateUrl: './paciente-create.component.html',
  styleUrl: './paciente-create.component.scss'
})
export class PacienteCreateComponent implements OnInit {
  public store = inject(PacientesStore);
  public catalogosStore = inject(CatalogosStore);
  public ubicacionesStore = inject(UbicacionesStore);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private pacientesSvc = inject(PacientesService);

  modoEdicion = false;
  documentoPaciente = '';

  sexoOptions = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Femenino' },
    { value: 'O', label: 'Otro' }
  ];

  /** Señal que almacena los campos dinámicos EAV según la nomenclatura seleccionada */
  camposUbicacion = signal<string[]>([]);

  form: FormGroup = this.fb.group({
    documento: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    edad: ['', [Validators.required, Validators.min(0)]],
    sexo: ['', Validators.required],
    id_nomenclatura: [null, Validators.required],
    valores_ubicacion: this.fb.group({}),
    id_tipo_dieta: [null, Validators.required]
  });

  ngOnInit(): void {
    this.catalogosStore.loadCatalogos({ tipo: 'dietas', reset: true });
    this.ubicacionesStore.cargarNomenclaturas();

    const docParam = this.route.snapshot.paramMap.get('documento');
    if (docParam) {
      this.modoEdicion = true;
      this.documentoPaciente = docParam;
      this.cargarPaciente(docParam);
    }

    // ── Mutación dinámica del formulario EAV ────────────────────────────────
    this.form.get('id_nomenclatura')!.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((valorSeleccionado: unknown) => {
        const idSeleccionado = parseInt(valorSeleccionado as string, 10);
        this.reconstruirCamposUbicacion(idSeleccionado);
      });
  }

  private cargarPaciente(documento: string): void {
    this.pacientesSvc.getPacienteByDocumento(documento).subscribe({
      next: (paciente) => {
        this.form.patchValue({
          documento: paciente.documento,
          nombres: paciente.nombres,
          apellidos: paciente.apellidos,
          edad: paciente.edad,
          sexo: paciente.sexo,
          id_tipo_dieta: paciente.id_tipo_dieta,
        });

        if (paciente.ubicacion_fisica) {
          this.form.patchValue({
            id_nomenclatura: paciente.ubicacion_fisica.id_nomenclatura,
          });

          this.reconstruirCamposUbicacion(
            paciente.ubicacion_fisica.id_nomenclatura,
            paciente.ubicacion_fisica.valores
          );

          this.form.patchValue({
            valores_ubicacion: paciente.ubicacion_fisica.valores,
          });
        }
      },
      error: (err) => {
        console.error('Error cargando paciente:', err);
      }
    });
  }

  private reconstruirCamposUbicacion(idNomenclatura: number, valoresIniciales?: Record<string, string>): void {
    const nuevoGrupo = this.fb.group({});

    if (!isNaN(idNomenclatura)) {
      const nomenclatura = this.ubicacionesStore.nomenclaturas().find(
        (n) => n.id === idNomenclatura
      );

      if (nomenclatura?.estructura) {
        const nuevosCampos = nomenclatura.estructura
          .slice()
          .sort((a, b) => a.orden - b.orden)
          .map((e) => e.tipoUbicacion?.nombre || `nivel_${e.orden}`)
          .filter((nombre): nombre is string => Boolean(nombre));

        nuevosCampos.forEach((campo) => {
          const valorInicial = valoresIniciales?.[campo] ?? '';
          nuevoGrupo.addControl(campo, new FormControl(valorInicial, Validators.required));
        });

        this.form.setControl('valores_ubicacion', nuevoGrupo);
        this.form.updateValueAndValidity();

        this.camposUbicacion.set(nuevosCampos);
        return;
      }
    }

    this.form.setControl('valores_ubicacion', nuevoGrupo);
    this.camposUbicacion.set([]);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const rawVal = this.form.value;
    const payload = {
      ...rawVal,
      edad: parseInt(rawVal.edad, 10),
      id_nomenclatura: parseInt(rawVal.id_nomenclatura, 10),
      id_tipo_dieta: parseInt(rawVal.id_tipo_dieta, 10),
      valores_ubicacion: rawVal.valores_ubicacion as Record<string, string>
    };

    if (this.modoEdicion) {
      this.store.actualizar({ documento: this.documentoPaciente, payload });
    } else {
      this.store.registrar(payload);
    }
  }

  goBack(): void {
    this.router.navigate(['/app/pacientes']);
  }

}
