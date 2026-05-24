import { Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfiguracionStore } from '../../store/configuracion.store';
import { ToastService } from '../../../../../core/services/toast.service';
import { ActualizarConfiguracionDto } from '../../models/configuracion.interface';

@Component({
  selector: 'app-panel-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './panel-configuracion.component.html',
  styleUrl: './panel-configuracion.component.scss',
})
export class PanelConfiguracionComponent implements OnInit {
  public store = inject(ConfiguracionStore);
  private readonly toastService = inject(ToastService);

  valoresEditados: Record<string, string | undefined> = {};

  constructor() {
    effect(() => {
      const successMsg = this.store.successMessage();
      if (successMsg) {
        this.toastService.success(successMsg as string);
      }

      const errorMsg = this.store.error();
      if (errorMsg) {
        this.toastService.error(errorMsg as string);
      }
    });
  }

  ngOnInit(): void {
    this.store.cargarConfiguraciones();
  }

  actualizarValor(clave: string, nuevoValor: string): void {
    this.valoresEditados[clave] = nuevoValor;
  }

  /** Toggle booleano: convierte checked a 'true'/'false' string */
  actualizarBooleano(clave: string, checked: boolean): void {
    this.valoresEditados[clave] = checked ? 'true' : 'false';
  }

  /** Lee el valor actual (editado o del store) como booleano para el checkbox */
  esBooleanoActivo(clave: string, valorDefault: string): boolean {
    const editado = this.valoresEditados[clave];
    if (editado !== undefined) return editado === 'true';
    return valorDefault === 'true';
  }

  hayCambios(): boolean {
    return Object.keys(this.valoresEditados).length > 0;
  }

  onSubmit(): void {
    if (!this.hayCambios()) return;

    const payload: ActualizarConfiguracionDto[] = Object.entries(this.valoresEditados).map(([clave, valor]) => ({
      clave,
      valor: String(valor),
    }));

    this.store.guardarCambios(payload);
    this.valoresEditados = {};
  }
}
