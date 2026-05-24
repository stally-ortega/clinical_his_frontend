import { Component, Input, Output, EventEmitter, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UbicacionesStore } from '../../store/ubicaciones.store';
import { Nomenclatura, ValorUbicacion } from '../../services/ubicaciones.service';
import { ButtonComponent } from '../../../../../shared/components/ui/button/button.component';
import { FormInputComponent } from '../../../../../shared/components/ui/form-input/form-input.component';

/**
 * Modal/panel lateral para gestionar valores concretos de una nomenclatura EAV.
 * Permite crear, visualizar y cambiar estado de nodos jerárquicos
 * (ej. Torre A → Piso 3 → Habitación 312 → Cama 4).
 */
@Component({
  selector: 'app-valor-nodo-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, FormInputComponent],
  template: `
    <div class="modal-overlay" (click)="cerrar.emit()">
      <div class="modal-panel glass-panel grain-overlay" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3 class="section-title">
            <span class="material-symbols-outlined">account_tree</span>
            Valores de {{ nomenclatura.nombre }}
          </h3>
          <button type="button" class="btn-icon" (click)="cerrar.emit()" title="Cerrar">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="modal-body">
          <!-- Formulario de creación -->
          <form [formGroup]="form" (ngSubmit)="guardar()" class="nodo-form" novalidate>
            <div class="form-row">
              <div class="native-select-group">
                <label class="native-select-label">Nivel Jerárquico</label>
                <select formControlName="id_tipo_ubicacion" class="native-select">
                  <option [ngValue]="null">Seleccione nivel...</option>
                  @for (nivel of niveles(); track nivel.id_tipo_ubicacion) {
                    <option [ngValue]="nivel.id_tipo_ubicacion">{{ nivel.nombre }}</option>
                  }
                </select>
              </div>

              @if (nivelSeleccionado() && nivelSeleccionado()!.orden > 1) {
                <div class="native-select-group">
                  <label class="native-select-label">Valor Padre</label>
                  <select formControlName="id_valor_padre" class="native-select">
                    <option [ngValue]="null">Seleccione padre...</option>
                    @for (v of valoresPadreDisponibles(); track v.id) {
                      <option [ngValue]="v.id">{{ v.valor }}</option>
                    }
                  </select>
                </div>
              }

              <app-form-input controlName="valor" label="Nombre del Valor" placeholder="Ej. Torre A, Piso 3"></app-form-input>
            </div>

            <div class="form-actions">
              <app-button text="Cancelar" variant="outline" (onClick)="cancelarEdicion()"></app-button>
              <app-button [text]="modoEdicion() ? 'Actualizar Valor' : 'Agregar Valor'"
                icon="add_box" type="submit" variant="primary"
                [isLoading]="store.isSaving()"
                [disabled]="form.invalid || store.isSaving()">
              </app-button>
            </div>
          </form>

          <!-- Listado de valores -->
          <div class="valores-list">
            <h4 class="list-title">Valores registrados</h4>
            @if (store.isLoading() && store.valoresNomenclatura().length === 0) {
              <p class="loading-text">Cargando valores...</p>
            } @else {
              <div class="valores-grid">
                @for (nivel of niveles(); track nivel.id_tipo_ubicacion) {
                  <div class="nivel-bloque">
                    <h5 class="nivel-title">{{ nivel.nombre }}</h5>
                    @for (v of valoresPorNivel(nivel.id_tipo_ubicacion); track v.id) {
                      <div class="valor-chip" [class.inactive]="v.estado === false">
                        <span class="valor-text">{{ v.valor }}</span>
                        <div class="valor-actions">
                          <button type="button" class="btn-icon btn-edit" (click)="editarValor(v)" title="Editar">
                            <span class="material-symbols-outlined">edit</span>
                          </button>
                          <button type="button" class="btn-icon btn-delete" (click)="toggleEstado(v.id)" title="Cambiar Estado">
                            <span class="material-symbols-outlined">{{ v.estado === false ? 'restore' : 'block' }}</span>
                          </button>
                        </div>
                      </div>
                    } @empty {
                      <span class="empty-chip">Sin valores registrados</span>
                    }
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './valor-nodo-form.component.scss',
})
export class ValorNodoFormComponent {
  @Input({ required: true }) nomenclatura!: Nomenclatura;
  cerrar = new EventEmitter<void>();

  readonly store = inject(UbicacionesStore);
  private readonly fb = inject(FormBuilder);

  modoEdicion = signal(false);
  valorEditandoId = signal<number | null>(null);

  form: FormGroup = this.fb.group({
    id_tipo_ubicacion: [null, Validators.required],
    id_valor_padre: [null],
    valor: ['', [Validators.required, Validators.minLength(1)]],
  });

  niveles = computed(() =>
    this.nomenclatura.estructura
      .slice()
      .sort((a, b) => a.orden - b.orden)
      .map((n) => ({
        id_tipo_ubicacion: n.id_tipo_ubicacion,
        orden: n.orden,
        nombre: n.tipoUbicacion?.nombre || `Nivel ${n.orden}`,
      }))
  );

  nivelSeleccionado = computed(() => {
    const idTipo = this.form.get('id_tipo_ubicacion')?.value as number | null;
    if (!idTipo) return null;
    return this.niveles().find((n) => n.id_tipo_ubicacion === idTipo) ?? null;
  });

  valoresPadreDisponibles = computed(() => {
    const nivel = this.nivelSeleccionado();
    if (!nivel || nivel.orden <= 1) return [];
    const idTipoPadre = this.niveles().find((n) => n.orden === nivel.orden - 1)?.id_tipo_ubicacion;
    if (!idTipoPadre) return [];
    return this.store.valoresNomenclatura().filter((v) => v.id_tipo_ubicacion === idTipoPadre && v.estado !== false);
  });

  constructor() {
    this.store.cargarValores(this.nomenclatura.id);

    // Resetear padre cuando cambia el nivel seleccionado
    this.form.get('id_tipo_ubicacion')?.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.form.get('id_valor_padre')?.reset(null, { emitEvent: false });
      });
  }

  valoresPorNivel(idTipoUbicacion: number): ValorUbicacion[] {
    return this.store.valoresNomenclatura()
      .filter((v) => v.id_tipo_ubicacion === idTipoUbicacion)
      .sort((a, b) => a.orden - b.orden);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.value;
    const payload = {
      id_nomenclatura: this.nomenclatura.id,
      id_tipo_ubicacion: Number(raw.id_tipo_ubicacion),
      valor: String(raw.valor).trim(),
      id_valor_padre: raw.id_valor_padre != null ? Number(raw.id_valor_padre) : null,
      orden: this.calcularOrden(raw.id_tipo_ubicacion),
    };

    if (this.modoEdicion()) {
      const id = this.valorEditandoId();
      if (id != null) {
        this.store.actualizarValor({ id, payload });
      }
    } else {
      this.store.crearValor(payload as Omit<ValorUbicacion, 'id' | 'estado'>);
    }
    this.cancelarEdicion();
  }

  editarValor(v: ValorUbicacion): void {
    this.modoEdicion.set(true);
    this.valorEditandoId.set(v.id);
    this.form.patchValue({
      id_tipo_ubicacion: v.id_tipo_ubicacion,
      id_valor_padre: v.id_valor_padre ?? null,
      valor: v.valor,
    });
  }

  toggleEstado(id: number): void {
    this.store.toggleEstadoValor(id);
  }

  cancelarEdicion(): void {
    this.form.reset({ id_tipo_ubicacion: null, id_valor_padre: null, valor: '' });
    this.modoEdicion.set(false);
    this.valorEditandoId.set(null);
  }

  private calcularOrden(idTipoUbicacion: number): number {
    const existentes = this.store.valoresNomenclatura().filter(
      (v) => v.id_tipo_ubicacion === idTipoUbicacion
    );
    return existentes.length + 1;
  }
}
