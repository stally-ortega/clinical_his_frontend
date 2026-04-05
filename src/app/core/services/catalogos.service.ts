import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Catalogo {
  id: number;
  nombre: string;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class CatalogosService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getCatalogos(tipo: string): Observable<Catalogo[]> {
    return this.http.get<ApiResponse<Catalogo[]>>(`${this.apiUrl}/catalogos/${tipo}`)
      .pipe(map(response => response.data));
  }

  crearCatalogo(payload: { tipo: string; nombre: string; descripcion?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/catalogos`, payload);
  }

  toggleEstado(id: number, activo: boolean, tipo?: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/catalogos/${id}/estado`, { activo, tipo });
  }
}
