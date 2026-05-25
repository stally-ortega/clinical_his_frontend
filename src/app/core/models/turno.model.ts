/**
 * Modelos de dominio del contexto de Turnos (Malla y Turno Activo).
 * Espejo tipado de las interfaces que devuelve la API del backend NestJS.
 */

/** Tipos de turno soportados por el sistema */
export type TipoTurno = 'MANANA' | 'TARDE' | 'NOCHE' | 'COMPLETO';

/** Estados posibles del turno activo de un usuario */
export type EstadoTurno = 'FUERA_TURNO' | 'EN_TURNO';

/** Representa un turno programado en la malla administrativa */
export interface TurnoProgramado {
  id?: number;
  id_usuario: number;
  nombre_usuario?: string;
  fecha_inicio: string;
  fecha_fin: string;
  tipo_turno: TipoTurno;
}

/** Representa el turno activo del usuario logueado */
export interface TurnoActivo {
  id: number;
  id_usuario: number;
  fecha_inicio: string;
  fecha_fin?: string | null;
  tipo_turno: TipoTurno;
  estado: EstadoTurno;
}

// ------------------------------------------------------------------
// DTOs
// ------------------------------------------------------------------

/** Payload para iniciar un turno (logueo de entrada) */
export interface IniciarTurnoDto {
  tipo_turno?: TipoTurno;
}

/** Payload para finalizar un turno (logueo de salida) */
export interface FinalizarTurnoDto {
  observaciones?: string;
}

/** Payload para programar un turno en la malla administrativa */
export interface ProgramarTurnoDto {
  id_usuario: number;
  fecha_inicio: string;
  fecha_fin: string;
  tipo_turno: TipoTurno;
}

/** Respuesta estandarizada de la API para operaciones de turno */
export interface TurnoApiResponse<T = unknown> {
  status: string;
  data: T;
  message?: string;
}
