import { Component, Input, forwardRef, inject, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CatalogosStore, CatalogoItem } from '@features/admin/catalogos_maestros/store/catalogos.store';

/**
 * Componente *Dumb* genérico de selección de catálogo maestro.
 * Recibe el nombre del catálogo por @Input() y se suscribe automáticamente
 * al CatalogosStore para mostrar los ítems disponibles.
 * Implementa ControlValueAccessor para integrarse nativamente con formControlName.
 */
@Component({
  selector: 'app-select-catalogo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="native-select-group"
      [class.error]="control.invalid && control.touched">
      <label class="native-select-label">{{ label }}</label>
      <select [formControl]="control" class="native-select">
        <option [ngValue]="null">{{ placeholder }}</option>
        @for (item of itemsList(); track item.id) {
          <option [ngValue]="item.id">{{ item.nombre }}</option>
        }
      </select>
      @if (control.invalid && control.touched) {
        <span class="field-error">{{ label }} es requerido.</span>
      }
    </div>
  `,
  styleUrl: './select-catalogo.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectCatalogoComponent),
      multi: true,
    },
  ],
})
export class SelectCatalogoComponent implements OnInit, ControlValueAccessor {
  @Input() catalogo?: string;
  @Input() items: CatalogoItem[] | null = null;
  @Input() label = 'Seleccionar';
  @Input() placeholder = 'Seleccione una opción...';

  readonly store = inject(CatalogosStore);

  readonly control = new FormControl<number | null>(null);

  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit(): void {
    if (!this.items && this.catalogo) {
      this.store.loadCatalogos({ tipo: this.catalogo, reset: true });
    }

    this.control.valueChanges.pipe(takeUntilDestroyed()).subscribe((val) => {
      this.onChange(val);
      this.onTouched();
    });
  }

  /** Expone los ítems inyectados o los del store */
  itemsList(): CatalogoItem[] {
    return this.items ?? this.store.items();
  }

  // ── ControlValueAccessor ──

  writeValue(value: number | null): void {
    this.control.setValue(value, { emitEvent: false });
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.control.disable({ emitEvent: false });
    } else {
      this.control.enable({ emitEvent: false });
    }
  }
}
