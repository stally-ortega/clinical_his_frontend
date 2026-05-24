/**
 * Modelos del motor EAV (Entidad-Atributo-Valor).
 * Permite construir formularios dinámicos a partir de metadata de la base de datos.
 */

/** Tipo de dato que puede renderizar el motor EAV */
export type EavTipoDato = 'texto' | 'numero' | 'booleano' | 'catalogo' | 'fecha';

/** Representa una Entidad en el sistema (ej. Nomenclatura, Ubicación) */
export interface EntidadEAV {
  id: number;
  nombre: string;
  descripcion?: string;
}

/** Representa un Atributo de una Entidad (ej. Torre, Piso, Habitación, Cama) */
export interface AtributoEAV {
  id: number;
  id_entidad: number;
  nombre: string;
  tipo_dato: EavTipoDato;
  orden: number;
  obligatorio: boolean;
  id_catalogo?: number; // Solo si tipo_dato === 'catalogo'
  /** Nombre del atributo padre en la jerarquía para filtros en cascada */
  dependencia?: string;
  /** Valores posibles para renderizar como select (usado en ubicaciones jerárquicas) */
  valores?: ValorEAV[];
}

/** Representa un Valor posible para un Atributo (ej. Torre A, Piso 3, Cama 4) */
export interface ValorEAV {
  id: number;
  id_atributo: number;
  valor: string;
  etiqueta: string;
  orden?: number;
  /** Si este valor depende de un valor padre (cascada), referencia al ID del valor padre */
  id_valor_padre?: number | null;
}

/** Payload que envía el frontend al guardar un registro EAV */
export interface EavPayload {
  [atributoNombre: string]: string | number | boolean;
}
