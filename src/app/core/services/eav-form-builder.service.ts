import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AtributoEAV, EavTipoDato } from '@core/models/eav.model';

/**
 * Servicio dedicado a construir FormGroups dinámicos a partir de metadata EAV.
 * Lee un array de AtributoEAV e instancia un FormControl por cada atributo,
 * inyectando validadores dinámicos según la metadata (obligatorio, tipo de dato).
 */
@Injectable({ providedIn: 'root' })
export class EavFormBuilderService {
  private readonly fb = inject(FormBuilder);

  /**
   * Genera un FormGroup a partir de un array de atributos EAV.
   * @param atributos — Metadata de atributos ordenada
   * @param valoresIniciales — Valores previos para rehidratación (opcional)
   * @returns FormGroup con un control por cada atributo
   */
  buildFormGroup(atributos: AtributoEAV[], valoresIniciales?: Record<string, string>): FormGroup {
    const grupo = this.fb.group({});

    for (const attr of atributos) {
      const validators = this.buildValidators(attr);
      const initial = valoresIniciales?.[attr.nombre] ?? '';
      grupo.addControl(attr.nombre, new FormControl(initial, validators));
    }

    return grupo;
  }

  /**
   * Reordena los atributos por su propiedad `orden` ascendente.
   */
  sortAtributos(atributos: AtributoEAV[]): AtributoEAV[] {
    return [...atributos].sort((a, b) => a.orden - b.orden);
  }

  /**
   * Extrae los nombres de los atributos ordenados para iteración en templates.
   */
  extractNombres(atributos: AtributoEAV[]): string[] {
    return this.sortAtributos(atributos).map((a) => a.nombre);
  }

  private buildValidators(attr: AtributoEAV) {
    const validators = [];

    if (attr.obligatorio) {
      validators.push(Validators.required);
    }

    switch (attr.tipo_dato) {
      case 'numero':
        validators.push(Validators.pattern(/^-?\d+(\.\d+)?$/));
        break;
      case 'booleano':
        // No aplica validador de formato para booleanos en input nativo
        break;
      case 'fecha':
        // Angular no provee un validador de fecha estricto nativo
        break;
      case 'catalogo':
      case 'texto':
      default:
        break;
    }

    return validators;
  }

  /**
   * Determina el tipo de input HTML nativo que mejor se adapta al tipo EAV.
   */
  resolveInputType(tipo: EavTipoDato): string {
    switch (tipo) {
      case 'numero':
        return 'number';
      case 'booleano':
        return 'checkbox';
      case 'fecha':
        return 'date';
      case 'texto':
      case 'catalogo':
      default:
        return 'text';
    }
  }
}
