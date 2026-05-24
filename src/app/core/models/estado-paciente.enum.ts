/**
 * Estados clínicos de un paciente según el backend.
 * Espejo exacto del Enum de Prisma para garantizar contratos de datos seguros.
 */
export enum EstadoPaciente {
  ESTABLE = 'ESTABLE',
  REGULAR = 'REGULAR',
  GRAVE = 'GRAVE',
  CRITICO = 'CRITICO',
  OBSERVACION = 'OBSERVACION',
  PRONOSTICO_RESERVADO = 'PRONOSTICO_RESERVADO',
}
