import { Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfiguracionStore } from '../../store/configuracion.store';
import { ToastService } from '../../../../../core/services/toast.service';
import { ConfiguracionGlobal, ActualizarConfiguracionDto } from '../../models/configuracion.interface';

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

  detectarTipo(item: ConfiguracionGlobal): 'boolean' | 'time' | 'number' | 'text' {
    if (item.tipo) {
      return item.tipo;
    }

    const valor = item.valor;

    if (valor === 'true' || valor === 'false') {
      return 'boolean';
    }

    if (/^\d{2}:\d{2}$/.test(valor)) {
      return 'time';
    }

    if (/^\d+$/.test(valor)) {
      return 'number';
    }

    return 'text';
  }

  onChange(event: Event, item: ConfiguracionGlobal): void {
    const target = event.target as HTMLInputElement;
    const tipo = this.detectarTipo(item);

    if (tipo === 'boolean') {
      this.valoresEditados[item.clave] = target.checked ? 'true' : 'false';
    } else {
      this.valoresEditados[item.clave] = target.value;
    }
  }

  isActivo(item: ConfiguracionGlobal): boolean {
    const editado = this.valoresEditados[item.clave];
    const valorActual = editado !== undefined ? editado : item.valor;
    return valorActual === 'true';
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
