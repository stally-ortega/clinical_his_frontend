import { Component, Input, Output, EventEmitter, inject, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EavRendererService } from '../../../../core/services/eav-renderer.service';
import { AtributoEAV } from '../../../../core/models/eav.model';

/**
 * Componente renderizador EAV (Entidad-Atributo-Valor).
 * Recibe un array de AtributoEAV y emite un FormGroup dinámico listo para usar.
 * Renderiza controles nativos según el tipo_dato de cada atributo.
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
            [class.error]="form.get(attr.nombre)?.invalid && form.get(attr.nombre)?.touched">
            <label class="native-select-label">{{ attr.nombre }}</label>
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
            @if (form.get(attr.nombre)?.invalid && form.get(attr.nombre)?.touched) {
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

  form: FormGroup = new FormGroup({});

  ngOnInit(): void {
    this.rebuildForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['atributos'] || changes['valoresIniciales']) {
      this.rebuildForm();
    }
  }

  atributosOrdenados(): AtributoEAV[] {
    return this.eavService.builder.sortAtributos(this.atributos);
  }

  private rebuildForm(): void {
    this.form = this.eavService.buildForm(this.atributos, this.valoresIniciales);
    this.formReady.emit(this.form);
  }
}
