import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';

export interface AuditoriaLog {
  id: number;
  id_usuario: number;
  tabla_afectada: string;
  id_registro_afectado: number;
  accion: string;
  valores_anteriores: unknown;
  valores_nuevos: unknown;
  fecha_cambio: string;
  usuario?: {
    nombres: string;
    apellidos: string;
    documento: string;
    rol?: { nombre: string };
  };
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

export interface ApiResponse<T> {
  exito: boolean;
  data: T;
  total?: number;
  mensaje?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuditoriaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getLogs(filtros: AuditoriaFiltros = {}, limit: number = 50, offset: number = 0): Observable<AuditoriaLog[]> {
    let params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString());

    if (filtros.search) {
      params = params.set('search', filtros.search);
    }
    if (filtros.startDate) {
      params = params.set('fecha_inicio', filtros.startDate);
    }
    if (filtros.endDate) {
      params = params.set('fecha_fin', filtros.endDate);
    }
    if (filtros.sortBy) {
      params = params.set('sortBy', filtros.sortBy);
    }
    if (filtros.sortOrder) {
      params = params.set('sortOrder', filtros.sortOrder);
    }

    return this.http.get<ApiResponse<AuditoriaLog[]>>(`${this.apiUrl}/auditoria`, { params })
      .pipe(map(res => res.data || []));
  }
}
