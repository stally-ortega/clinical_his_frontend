/**
 * Contratos de datos del dominio Paciente.
 * Espejo del schema Prisma para garantizar tipado estricto en todo el frontend.
 */

/** Estado clínico de un paciente (alias del enum para conveniencia de templates) */
export type EstadoPacienteStr = 'ESTABLE' | 'REGULAR' | 'GRAVE' | 'CRITICO' | 'OBSERVACION' | 'PRONOSTICO_RESERVADO';

/** Ubicación física EAV resuelta para un paciente */
export interface UbicacionFisica {
  id: number;
  id_nomenclatura: number;
  valores: Record<string, string>;
}

/** Representación de un Tipo de Dieta asociado a un paciente */
export interface TipoDieta {
  id: number;
  nombre: string;
}

/** Paciente registrado en el sistema hospitalario */
export interface Paciente {
  id: number;
  documento: string;
  nombres: string;
  apellidos: string;
  edad: number;
  sexo: 'M' | 'F' | 'O';
  estado: EstadoPacienteStr;
  activo: boolean;
  fecha_ingreso: string; // ISO 8601
  fecha_registro: string; // ISO 8601
  id_ubicacion_fisica?: number;
  id_tipo_dieta?: number;
  ubicacion_fisica?: UbicacionFisica;
  tipo_dieta?: TipoDieta;
}

/** Payload para crear un nuevo ingreso de paciente */
export interface CrearPacienteDto {
  documento: string;
  nombres: string;
  apellidos: string;
  edad: number;
  sexo: 'M' | 'F' | 'O';
  id_nomenclatura: number;
  id_tipo_dieta: number;
  valores_ubicacion: Record<string, string>;
}

/** Payload para actualizar datos demográficos o reubicación de un paciente existente */
export interface ActualizarPacienteDto {
  documento?: string;
  nombres?: string;
  apellidos?: string;
  edad?: number;
  sexo?: 'M' | 'F' | 'O';
  id_nomenclatura?: number;
  id_tipo_dieta?: number;
  valores_ubicacion?: Record<string, string>;
}

/** Parámetros de consulta para listado paginado de pacientes */
export interface PacienteQueryParams {
  search?: string;
  estado?: EstadoPacienteStr;
  activo?: boolean;
  offset?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
