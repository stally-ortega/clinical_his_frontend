import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface AuditoriaLog {
  id: number;
  usuario_id: number;
  accion: string;
  modulo_endpoint: string;
  detalles: any;
  fecha_hora: string;
  ip_address?: string;
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

  getLogs(limite: number = 100, offset: number = 0): Observable<AuditoriaLog[]> {
    let params = new HttpParams()
      .set('limit', limite.toString())
      .set('offset', offset.toString());
      
    return this.http.get<ApiResponse<AuditoriaLog[]>>(`${this.apiUrl}/auditoria`, { params })
      .pipe(map(res => res.data || []));
  }
}
