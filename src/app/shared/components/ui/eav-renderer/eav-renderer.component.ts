import { Component, Input, Output, EventEmitter, inject, OnInit, OnChanges, SimpleChanges, DestroyRef, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import { EavRendererService } from '@core/services/eav-renderer.service';
import { AtributoEAV, ValorEAV } from '@core/models/eav.model';

/**
 * Componente renderizador EAV (Entidad-Atributo-Valor).
 * Recibe un array de AtributoEAV y emite un FormGroup dinámico listo para usar.
 * Renderiza controles nativos según el tipo_dato de cada atributo.
 * Soporta filtros en cascada para jerarquías (ej. Ubicaciones hospitalarias).
 */
@Component({
  selector: 'app-eav-renderer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    @if (atributosOrdenados().length > 0) {
      <div [formGroup]="form" class="dynamic-eav-grid">
        @for (attr of atributosOrdenados(); track attr.id) {
          <div class="native-select-group"
            [class.error]="controlInvalido(attr.nombre)">
            <label class="native-select-label">{{ attr.nombre }}</label>
            @if (tieneValores(attr)) {
              <select [formControlName]="attr.nombre" class="native-select">
                <option [ngValue]="null">Seleccione {{ attr.nombre | lowercase }}...</option>
                @for (v of valoresVisibles(attr); track v.id) {
                  <option [ngValue]="v.valor">{{ v.etiqueta }}</option>
                }
              </select>
            } @else {
              @switch (attr.tipo_dato) {
                @case ('booleano') {
                  <input
                    type="checkbox"
                    [formControlName]="attr.nombre"
                    class="native-select"
                  />
                }
                @case ('numero') {
                  <input
                    type="number"
                    [formControlName]="attr.nombre"
                    class="native-select"
                    [placeholder]="'Ingrese ' + attr.nombre"
                  />
                }
                @case ('fecha') {
                  <input
                    type="date"
                    [formControlName]="attr.nombre"
                    class="native-select"
                  />
                }
                @default {
                  <input
                    type="text"
                    [formControlName]="attr.nombre"
                    class="native-select"
                    [placeholder]="'Ingrese ' + attr.nombre"
                  />
                }
              }
            }
            @if (controlInvalido(attr.nombre)) {
              <span class="field-error">{{ attr.nombre }} es requerido.</span>
            }
          </div>
        }
      </div>
    } @else {
      <p class="eav-placeholder">Seleccione una entidad para generar los campos dinámicos.</p>
    }
  `,
  styleUrl: './eav-renderer.component.scss',
})
export class EavRendererComponent implements OnInit, OnChanges {
  @Input({ required: true }) atributos: AtributoEAV[] = [];
  @Input() valoresIniciales?: Record<string, string>;
  @Output() formReady = new EventEmitter<FormGroup>();

  private readonly eavService = inject(EavRendererService);
  private readonly destroyRef = inject(DestroyRef);

  form: FormGroup = new FormGroup({});

  /** Mapa de valores filtrados por nombre de atributo (reactivo) */
  private readonly valoresFiltradosMap = signal<Record<string, ValorEAV[]>>({});

  /** Subscripciones activas de cascada (para limpieza ante rebuild) */
  private cascadingSubs: Subscription[] = [];

  atributosOrdenados = computed(() => this.eavService.builder.sortAtributos(this.atributos));

  ngOnInit(): void {
    this.rebuildForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['atributos'] || changes['valoresIniciales']) {
      this.rebuildForm();
    }
  }

  /** Determina si un control específico del form EAV es inválido y tocado */
  controlInvalido(nombre: string): boolean {
    const control = this.form.get(nombre);
    return control ? control.invalid && control.touched : false;
  }

  /** Indica si el atributo posee valores predefinidos para renderizar como <select> */
  tieneValores(attr: AtributoEAV): boolean {
    const visibles = this.valoresVisibles(attr);
    return visibles.length > 0;
  }

  /** Devuelve los valores visibles de un atributo, respetando filtros en cascada */
  valoresVisibles(attr: AtributoEAV): ValorEAV[] {
    const filtrados = this.valoresFiltradosMap()[attr.nombre];
    if (filtrados) return filtrados;
    return attr.valores ?? [];
  }

  private rebuildForm(): void {
    this.limpiarCascading();
    this.form = this.eavService.buildForm(this.atributos, this.valoresIniciales);
    this.formReady.emit(this.form);
    this.inicializarCascading();
  }

  /** Libera subscripciones de cascada anteriores para evitar fugas de memoria */
  private limpiarCascading(): void {
    for (const sub of this.cascadingSubs) {
      sub.unsubscribe();
    }
    this.cascadingSubs = [];
    this.valoresFiltradosMap.set({});
  }

  /** Configura subscripciones valueChanges con takeUntilDestroyed para cada dependencia */
  private inicializarCascading(): void {
    const atributos = this.atributosOrdenados();
    for (const attr of atributos) {
      if (!attr.dependencia) continue;

      const parentControl = this.form.get(attr.dependencia);
      const childControl = this.form.get(attr.nombre);
      if (!parentControl || !childControl) continue;

      const sub = parentControl.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((parentValue: unknown) => {
          const parentId = this.resolverIdValorPadre(attr.dependencia!, parentValue as string | null);
          const visibles = this.filtrarValoresHijo(attr, parentId);
          this.valoresFiltradosMap.update((map) => ({ ...map, [attr.nombre]: visibles }));
          childControl.reset(null, { emitEvent: false });
          childControl.markAsUntouched();
        });

      this.cascadingSubs.push(sub);

      // Aplicar filtro inicial si ya hay valor padre cargado (rehidratación)
      const parentValue = parentControl.value as string | null;
      if (parentValue) {
        const parentId = this.resolverIdValorPadre(attr.dependencia, parentValue);
        const visibles = this.filtrarValoresHijo(attr, parentId);
        this.valoresFiltradosMap.update((map) => ({ ...map, [attr.nombre]: visibles }));
      }
    }
  }

  /** Busca el ID de un valor padre a partir de su texto y los valores disponibles del atributo padre */
  private resolverIdValorPadre(nombrePadre: string, valorTexto: string | null): number | null {
    if (!valorTexto) return null;
    const padre = this.atributosOrdenados().find((a) => a.nombre === nombrePadre);
    if (!padre?.valores) return null;
    const match = padre.valores.find((v) => v.valor === valorTexto);
    return match?.id ?? null;
  }

  /** Filtra los valores de un atributo hijo según el id_valor_padre seleccionado */
  private filtrarValoresHijo(attr: AtributoEAV, idPadre: number | null): ValorEAV[] {
    const todos = attr.valores ?? [];
    if (idPadre == null) return [];
    return todos.filter((v) => v.id_valor_padre === idPadre);
  }
}
