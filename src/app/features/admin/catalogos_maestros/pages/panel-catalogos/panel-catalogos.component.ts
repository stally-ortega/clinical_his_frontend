import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CatalogosStore } from '../../store/catalogos.store';
import { ButtonComponent } from '../../../../../shared/components/ui/button/button.component';
import { FormInputComponent } from '../../../../../shared/components/ui/form-input/form-input.component';

@Component({
  selector: 'app-panel-catalogos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, FormInputComponent],
  templateUrl: './panel-catalogos.component.html',
  styleUrl: './panel-catalogos.component.scss'
})
export class PanelCatalogosComponent implements OnInit {
  readonly store = inject(CatalogosStore);
  private readonly fb = inject(FormBuilder);

  // Diccionarios disponibles para administrar
  readonly diccionarios = [
    { key: 'DIETAS', label: 'Tipos de Dietas' },
    { key: 'VIAS_APLICACION', label: 'Vías de Aplicación' },
    { key: 'TIPOS_DIAGNOSTICO', label: 'Tipos de Diagnóstico' },
    { key: 'ESPECIALIDADES', label: 'Especialidades Médicas' }
  ];

  // Control para el formulario lateral
  readonly showForm = signal(false);
  readonly addForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    descripcion: ['']
  });

  ngOnInit() {
    this.store.loadCatalogos(this.store.tipoActivo());
  }

  onSelectDiccionario(event: any) {
    const tipo = event.target.value;
    this.store.setTipoActivo(tipo);
    this.store.loadCatalogos(tipo);
    this.showForm.set(false);
  }

  toggleAddForm() {
    this.showForm.set(!this.showForm());
    if (this.showForm()) {
      this.addForm.reset();
    }
  }

  onSubmitAdd() {
    if (this.addForm.valid) {
      const payload = {
        tipo: this.store.tipoActivo(),
        nombre: this.addForm.value.nombre,
        descripcion: this.addForm.value.descripcion
      };
      this.store.crearRegistro(payload);
      
      // Esperamos que isSaving procese para cerrar, aquí simulamos inmediato
      setTimeout(() => {
        if (!this.store.error()) {
          this.showForm.set(false);
        }
      }, 500);
    } else {
      this.addForm.markAllAsTouched();
    }
  }

  onToggleEstado(id: number, activoActual: boolean) {
    this.store.toggleEstado({ id, activo: !activoActual });
  }

  getDiccionarioNombre(key: string): string {
    return this.diccionarios.find(d => d.key === key)?.label || key;
  }
}
