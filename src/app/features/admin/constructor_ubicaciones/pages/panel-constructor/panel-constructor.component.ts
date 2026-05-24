import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { UbicacionesStore } from '@features/admin/constructor_ubicaciones/store/ubicaciones.store';
import { Nomenclatura, TipoUbicacion } from '@features/admin/constructor_ubicaciones/services/ubicaciones.service';
import { FormInputComponent } from '@shared/components/ui/form-input/form-input.component';
import { ButtonComponent } from '@shared/components/ui/button/button.component';
import { ValorNodoFormComponent } from '@features/admin/constructor_ubicaciones/components/valor-nodo-form/valor-nodo-form.component';

@Component({
  selector: 'app-panel-constructor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormInputComponent, ButtonComponent, ValorNodoFormComponent],
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
  modoEdicionTipo = signal<boolean>(false);
  tipoEditandoId = signal<number | null>(null);
  modoEdicion = signal<boolean>(false);
  nomenclaturaEditandoId = signal<number | null>(null);
  nomenclaturaModalAbierta = signal<Nomenclatura | null>(null);

  ngOnInit(): void {
    this.store.cargarTipos();
    this.store.cargarNomenclaturas();
  }

  crearTipo(): void {
    if (this.formTipo.invalid) {
      this.formTipo.markAllAsTouched();
      return;
    }
    const payload = { id: this.modoEdicionTipo() ? this.tipoEditandoId() ?? undefined : undefined, nombre: this.formTipo.value.nombre };
    this.store.registrarTipo(payload);
    this.formTipo.reset();
    this.cancelarEdicionTipo();
  }

  editarTipo(tipo: TipoUbicacion): void {
    this.modoEdicionTipo.set(true);
    this.tipoEditandoId.set(tipo.id);
    this.formTipo.patchValue({ nombre: tipo.nombre });
  }

  cancelarEdicionTipo(): void {
    this.formTipo.reset();
    this.modoEdicionTipo.set(false);
    this.tipoEditandoId.set(null);
  }

  toggleEstadoTipo(tipo: TipoUbicacion, event: Event): void {
    event.stopPropagation();
    this.store.toggleEstadoTipo(tipo.id);
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
      estructura: this.nivelesConstruccion().map(n => ({ id_tipo_ubicacion: n.id_tipo_ubicacion, orden: n.orden }))
    };

    if (this.modoEdicion()) {
      const id = this.nomenclaturaEditandoId();
      if (id !== null) {
        this.store.actualizarEstructura({ id, payload });
        this.cancelarEdicion();
      }
    } else {
      this.store.configurarEstructura(payload);
    }
  }

  getTiposOptions() {
    return this.store.tiposDisponibles().map(t => ({ value: t.id, label: t.nombre }));
  }
  
  setTipoSeleccionado(val: string) {
    this.tipoSeleccionado.set(val);
  }

  editarNomenclatura(item: Nomenclatura): void {
    this.modoEdicion.set(true);
    this.nomenclaturaEditandoId.set(item.id);

    this.formNomenclatura.patchValue({
      nombre_nomenclatura: item.nombre
    });

    const niveles = item.estructura.map(n => ({
      id_tipo_ubicacion: n.id_tipo_ubicacion,
      orden: n.orden,
      nombre: n.tipoUbicacion?.nombre || ('Nivel ' + n.orden)
    }));
    this.nivelesConstruccion.set(niveles);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicion(): void {
    this.formNomenclatura.reset({
      nombre_nomenclatura: 'Estructura Hospitalaria Base',
      tipo_selector: ''
    });
    this.nivelesConstruccion.set([]);
    this.modoEdicion.set(false);
    this.nomenclaturaEditandoId.set(null);
  }

  toggleEstado(item: Nomenclatura): void {
    this.store.toggleEstado(item.id);
  }

  abrirModalValores(item: Nomenclatura): void {
    this.nomenclaturaModalAbierta.set(item);
  }

  cerrarModalValores(): void {
    this.nomenclaturaModalAbierta.set(null);
  }
}