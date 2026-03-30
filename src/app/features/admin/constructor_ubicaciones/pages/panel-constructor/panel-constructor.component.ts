import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { UbicacionesStore } from '../../store/ubicaciones.store';
import { FormInputComponent } from '../../../../../shared/components/ui/form-input/form-input.component';
import { ButtonComponent } from '../../../../../shared/components/ui/button/button.component';

@Component({
  selector: 'app-panel-constructor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormInputComponent, ButtonComponent],
  templateUrl: './panel-constructor.component.html',
  styleUrl: './panel-constructor.component.scss'
})
export class PanelConstructorComponent implements OnInit {
  public store = inject(UbicacionesStore);
  private fb = inject(FormBuilder);

  formTipo: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]]
  });

  nivelesConstruccion = signal<{ id_tipo_ubicacion: number; orden: number; nombre: string }[]>([]);
  
  formNomenclatura: FormGroup = this.fb.group({
    nombre_nomenclatura: ['Estructura Hospitalaria Base', [Validators.required]],
    tipo_selector: ['']
  });

  tipoSeleccionado = signal<string>('');

  ngOnInit(): void {
    this.store.cargarTipos();
  }

  crearTipo(): void {
    if (this.formTipo.invalid) {
      this.formTipo.markAllAsTouched();
      return;
    }
    this.store.registrarTipo(this.formTipo.value.nombre);
    this.formTipo.reset();
  }

  agregarNivel(): void {
    const idTipoStr = this.formNomenclatura.get('tipo_selector')?.value;
    if (!idTipoStr) return;
    const idTipo = Number(idTipoStr);
    const tipo = this.store.tiposDisponibles().find(t => t.id === idTipo);
    if (!tipo) return;

    // Verificar si ya existe en la jerarquía (opcional, aunque puede existir repetido en algunos EAV muy raros, pero lo bloquearemos)
    const actuales = this.nivelesConstruccion();
    if (actuales.some(n => n.id_tipo_ubicacion === idTipo)) {
      return; // Ya añadido
    }

    const newOrden = actuales.length + 1;
    this.nivelesConstruccion.set([...actuales, { id_tipo_ubicacion: tipo.id, orden: newOrden, nombre: tipo.nombre }]);
    this.formNomenclatura.get('tipo_selector')?.reset('');
  }

  removerNivel(index: number): void {
    const actuales = [...this.nivelesConstruccion()];
    actuales.splice(index, 1);
    actuales.forEach((item, idx) => item.orden = idx + 1);
    this.nivelesConstruccion.set(actuales);
  }

  guardarEstructuraGlobal(): void {
    if (this.formNomenclatura.invalid || this.nivelesConstruccion().length === 0) {
      this.formNomenclatura.markAllAsTouched();
      return;
    }
    const payload = {
      nombre: this.formNomenclatura.value.nombre_nomenclatura,
      niveles: this.nivelesConstruccion().map(n => ({ id_tipo_ubicacion: n.id_tipo_ubicacion, orden: n.orden }))
    };
    this.store.configurarEstructura(payload);
  }

  getTiposOptions() {
    return this.store.tiposDisponibles().map(t => ({ value: t.id, label: t.nombre }));
  }
  
  setTipoSeleccionado(val: string) {
    this.tipoSeleccionado.set(val);
  }
}
