/**
 * Contratos de datos del dominio Evolución Médica.
 * Espejo del schema Prisma para garantizar tipado estricto.
 */

import { EstadoPaciente } from './estado-paciente.enum';

/** Evolución médica registrada en la historia clínica de un paciente */
export interface Evolucion {
  id: number;
  id_paciente: number;
  titulo: string;
  descripcion: string;
  autor: string;
  fecha: string; // ISO 8601
  estado_paciente: EstadoPaciente;
  created_at?: string;
}

/** DTO para crear una nueva evolución médica */
export interface CrearEvolucionDto {
  id_paciente: number;
  titulo: string;
  descripcion: string;
  estado_paciente: EstadoPaciente;
  autor: string;
  fecha: string; // ISO 8601
}

/** Nota de enfermería registrada en la historia clínica */
export interface Nota {
  id: number;
  id_paciente: number;
  titulo: string;
  descripcion: string;
  autor: string;
  fecha: string; // ISO 8601
  created_at?: string;
}

/** DTO para crear una nueva nota de enfermería */
export interface CrearNotaDto {
  id_paciente: number;
  titulo: string;
  descripcion: string;
  autor: string;
  fecha: string; // ISO 8601
}
