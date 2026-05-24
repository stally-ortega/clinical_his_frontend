import { Injectable, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { EavFormBuilderService } from './eav-form-builder.service';
import { AtributoEAV } from '../models/eav.model';

/**
 * Servicio orquestador del motor EAV.
 * Expone métodos de alto nivel para construir, rehidratar y leer
 * el FormGroup dinámico de una entidad EAV.
 */
@Injectable({ providedIn: 'root' })
export class EavRendererService {
  readonly builder = inject(EavFormBuilderService);

  /**
   * Construye un FormGroup dinámico a partir de atributos EAV.
   */
  buildForm(atributos: AtributoEAV[], valoresIniciales?: Record<string, string>): FormGroup {
    const ordenados = this.builder.sortAtributos(atributos);
    return this.builder.buildFormGroup(ordenados, valoresIniciales);
  }

  /**
   * Rehidrata un FormGroup existente con nuevos valores.
   * Útil al cambiar de entidad (ej. seleccionar otra nomenclatura).
   */
  rehydrate(form: FormGroup, valores: Record<string, string>): void {
    form.patchValue(valores, { emitEvent: true });
  }

  /**
   * Extrae el payload plano desde un FormGroup EAV.
   */
  extractPayload(form: FormGroup): Record<string, string> {
    return form.getRawValue() as Record<string, string>;
  }

  /**
   * Determina el tipo de input nativo para un atributo EAV.
   */
  resolveInputType(tipo: AtributoEAV['tipo_dato']): string {
    return this.builder.resolveInputType(tipo);
  }
}
