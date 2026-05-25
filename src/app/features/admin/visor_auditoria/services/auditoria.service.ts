import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import {
  AuditoriaLog,
  AuditoriaFiltros,
  AuditoriaApiResponse,
} from '@features/admin/visor_auditoria/models/auditoria.model';

export interface AuditoriaPaginatedResult {
  logs: AuditoriaLog[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuditoriaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getLogs(
    filtros: AuditoriaFiltros = {},
    limit: number = 50,
    offset: number = 0
  ): Observable<AuditoriaPaginatedResult> {
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

    return this.http
      .get<AuditoriaApiResponse<AuditoriaLog[]>>(`${this.apiUrl}/auditoria`, {
        params,
      })
      .pipe(
        map((res) => ({
          logs: res.data || [],
          total: res.total ?? 0,
        }))
      );
  }
}
