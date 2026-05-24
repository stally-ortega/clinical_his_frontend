import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CatalogosStore, CatalogoItem } from '@features/admin/catalogos_maestros/store/catalogos.store';
import { ButtonComponent } from '@shared/components/ui/button/button.component';
import { FormInputComponent } from '@shared/components/ui/form-input/form-input.component';

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

  // Término de búsqueda actual
  readonly searchTerm = signal('');

  // Estado de edición
  readonly registroEnEdicion = signal<CatalogoItem | null>(null);
  readonly isEditing = signal(false);

  readonly addForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    descripcion: [''],
    codigo: ['']
  });

  ngOnInit() {
    this.store.loadCatalogos({ tipo: this.store.tipoActivo(), reset: true });
  }

  onSelectDiccionario(event: Event) {
    const tipo = (event.target as HTMLSelectElement).value;
    this.store.setTipoActivo(tipo);
    this.searchTerm.set('');
    this.resetFormulario();
    this.store.loadCatalogos({ tipo, reset: true });
  }

  toggleAddForm() {
    // Si estamos editando, reseteamos primero
    if (this.isEditing()) {
      this.resetFormulario();
    }
    this.showForm.set(!this.showForm());
    if (this.showForm() && !this.isEditing()) {
      this.addForm.reset();
    }
  }

  /**
   * Prepara el formulario para editar un registro existente
   */
  editarRegistro(item: CatalogoItem) {
    this.registroEnEdicion.set(item);
    this.isEditing.set(true);

    // Poblamos el formulario con los datos del item
    this.addForm.patchValue({
      nombre: item.nombre,
      descripcion: item.descripcion || '',
      codigo: item.codigo || ''
    });

    // Abrimos el panel lateral
    this.showForm.set(true);
  }

  /**
   * Resetea el formulario y el estado de edición
   */
  resetFormulario() {
    this.registroEnEdicion.set(null);
    this.isEditing.set(false);
    this.addForm.reset();
  }

  onSubmitAdd() {
    if (this.addForm.valid) {
      const tipo = this.store.tipoActivo();

      if (this.isEditing() && this.registroEnEdicion()) {
        // Modo edición - actualizar registro existente
        const id = this.registroEnEdicion()!.id;
        const payload: {
          nombre?: string;
          descripcion?: string;
          codigo?: string;
        } = {
          nombre: this.addForm.value.nombre,
          descripcion: this.addForm.value.descripcion || undefined,
        };

        // Solo incluimos código si el tipo es TIPOS_DIAGNOSTICO
        if (tipo === 'TIPOS_DIAGNOSTICO' && this.addForm.value.codigo) {
          payload.codigo = this.addForm.value.codigo;
        }

        this.store.actualizarRegistro({ tipo, id, payload });

        // Esperamos que la operación termine para cerrar
        setTimeout(() => {
          if (!this.store.error()) {
            this.resetFormulario();
            this.showForm.set(false);
          }
        }, 500);
      } else {
        // Modo creación - crear nuevo registro
        const payload = {
          tipo: tipo,
          nombre: this.addForm.value.nombre,
          descripcion: this.addForm.value.descripcion || undefined,
        };

        this.store.crearRegistro(payload);

        // Esperamos que la operación termine para cerrar
        setTimeout(() => {
          if (!this.store.error()) {
            this.addForm.reset();
            this.showForm.set(false);
          }
        }, 500);
      }
    } else {
      this.addForm.markAllAsTouched();
    }
  }

  onToggleEstado(id: number, estadoActual: boolean) {
    this.store.actualizarRegistro({
      tipo: this.store.tipoActivo(),
      id: id,
      payload: { estado: !estadoActual }
    });
  }

  /**
   * Maneja el input del buscador
   */
  onSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }

  /**
   * Ejecuta la búsqueda al presionar Enter
   */
  onSearchSubmit() {
    this.store.setSearch(this.searchTerm());
  }

  /**
   * Limpia la búsqueda
   */
  clearSearch() {
    this.searchTerm.set('');
    this.store.setSearch('');
  }

  /**
   * Cambia el ordenamiento de la tabla
   */
  onSort(column: string) {
    const currentSortBy = this.store.sortBy();
    const currentSortOrder = this.store.sortOrder();

    // Si ya está ordenado por esta columna, invertimos el orden
    const newSortOrder = currentSortBy === column && currentSortOrder === 'asc' ? 'desc' : 'asc';

    this.store.setSort({ sortBy: column, sortOrder: newSortOrder });
  }

  /**
   * Maneja el evento de scroll infinito en la tabla
   */
  onTableScroll(event: Event) {
    const target = event.target as HTMLElement;

    // Verificar si llegó al final del scroll (con margen de 50px)
    const isNearBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;

    if (isNearBottom && !this.store.isLoading() && this.store.hasMoreItems()) {
      this.store.loadCatalogos({ tipo: this.store.tipoActivo(), reset: false });
    }
  }

  getDiccionarioNombre(key: string): string {
    return this.diccionarios.find(d => d.key === key)?.label || key;
  }
}
