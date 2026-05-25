export interface AuditoriaUsuario {
  nombres: string;
  apellidos: string;
  documento: string;
  rol?: { nombre: string };
}

export interface AuditoriaLog {
  id: number;
  id_usuario: number;
  tabla_afectada: string;
  id_registro_afectado: number;
  accion: string;
  valores_anteriores: Record<string, unknown> | null;
  valores_nuevos: Record<string, unknown> | null;
  fecha_cambio: string;
  usuario?: AuditoriaUsuario;
}

export interface AuditoriaFiltros {
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  offset?: number;
  limit?: number;
}

export interface AuditoriaApiResponse<T> {
  exito: boolean;
  data: T;
  total?: number;
  mensaje?: string;
}
