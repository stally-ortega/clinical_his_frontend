import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { PacientesStore } from '@features/clinical/pacientes/store/pacientes.store';
import { PacientesService } from '@features/clinical/pacientes/services/pacientes.service';
import { CrearPacienteDto } from '@core/models/paciente.model';
import { UbicacionesStore } from '@features/admin/constructor_ubicaciones/store/ubicaciones.store';
import { FormInputComponent } from '@shared/components/ui/form-input/form-input.component';
import { ButtonComponent } from '@shared/components/ui/button/button.component';
import { SelectCatalogoComponent } from '@shared/components/ui/select-catalogo/select-catalogo.component';
import { EavRendererComponent } from '@shared/components/ui/eav-renderer/eav-renderer.component';
import { AtributoEAV } from '@core/models/eav.model';
import { EavRendererService } from '@core/services/eav-renderer.service';

@Component({
  selector: 'app-paciente-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormInputComponent,
    ButtonComponent,
    SelectCatalogoComponent,
    EavRendererComponent,
  ],
  templateUrl: './paciente-create.component.html',
  styleUrl: './paciente-create.component.scss',
})
export class PacienteCreateComponent implements OnInit {
  readonly store = inject(PacientesStore);
  readonly ubicacionesStore = inject(UbicacionesStore);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly pacientesSvc = inject(PacientesService);
  private readonly eavService = inject(EavRendererService);

  modoEdicion = false;
  documentoPaciente = '';

  sexoOptions = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Femenino' },
    { value: 'O', label: 'Otro' },
  ];

  /** Atributos EAV derivados de la nomenclatura seleccionada */
  atributosEav = signal<AtributoEAV[]>([]);

  /** Valores iniciales para rehidratación EAV en modo edición */
  valoresEavIniciales = signal<Record<string, string> | undefined>(undefined);

  /** FormGroup estático para datos demográficos */
  form: FormGroup = this.fb.group({
    documento: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    edad: ['', [Validators.required, Validators.min(0)]],
    sexo: ['', Validators.required],
    id_nomenclatura: [null, Validators.required],
    id_tipo_dieta: [null, Validators.required],
  });

  /** FormGroup dinámico generado por el motor EAV */
  eavForm: FormGroup = new FormGroup({});

  constructor() {
    // ── Mutación dinámica del formulario EAV al cambiar nomenclatura ──
    this.form.get('id_nomenclatura')?.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((valorSeleccionado: unknown) => {
        const idSeleccionado = typeof valorSeleccionado === 'string' ? parseInt(valorSeleccionado, 10) : valorSeleccionado;
        this.reconstruirEav(idSeleccionado as number | null);
      });
  }

  ngOnInit(): void {
    this.ubicacionesStore.cargarNomenclaturas();

    const docParam = this.route.snapshot.paramMap.get('documento');
    if (docParam) {
      this.modoEdicion = true;
      this.documentoPaciente = docParam;
      this.cargarPaciente(docParam);
    }
  }

  onEavFormReady(form: FormGroup): void {
    this.eavForm = form;
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
          this.reconstruirEav(
            paciente.ubicacion_fisica.id_nomenclatura,
            paciente.ubicacion_fisica.valores
          );
        }
      },
      error: (err) => {
        console.error('Error cargando paciente:', err);
      },
    });
  }

  private reconstruirEav(idNomenclatura: number | null, valoresIniciales?: Record<string, string>): void {
    if (!idNomenclatura || isNaN(idNomenclatura)) {
      this.atributosEav.set([]);
      this.valoresEavIniciales.set(undefined);
      return;
    }

    const nomenclatura = this.ubicacionesStore.nomenclaturas().find((n) => n.id === idNomenclatura);
    if (!nomenclatura?.estructura) {
      this.atributosEav.set([]);
      this.valoresEavIniciales.set(undefined);
      return;
    }

    // Convertir la estructura de nomenclatura a AtributoEAV
    const atributos: AtributoEAV[] = nomenclatura.estructura
      .slice()
      .sort((a, b) => a.orden - b.orden)
      .map((nivel, idx) => ({
        id: idx,
        id_entidad: idNomenclatura,
        nombre: nivel.tipoUbicacion?.nombre || `nivel_${nivel.orden}`,
        tipo_dato: 'texto' as const,
        orden: nivel.orden,
        obligatorio: true,
      }));

    this.atributosEav.set(atributos);
    this.valoresEavIniciales.set(valoresIniciales);
  }

  onSubmit(): void {
    if (this.form.invalid || this.eavForm.invalid) {
      this.form.markAllAsTouched();
      this.eavForm.markAllAsTouched();
      return;
    }

    const raw = this.form.value;
    const payload: CrearPacienteDto = {
      ...raw,
      edad: parseInt(raw.edad, 10),
      id_nomenclatura: parseInt(raw.id_nomenclatura, 10),
      id_tipo_dieta: parseInt(raw.id_tipo_dieta, 10),
      valores_ubicacion: this.eavService.extractPayload(this.eavForm),
      sexo: raw.sexo as 'M' | 'F' | 'O',
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
