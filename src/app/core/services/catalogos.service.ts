import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';

export interface Catalogo {
  id: number;
  nombre: string;
}

/**
 * Interfaz para los parámetros de consulta de catálogos con paginación, búsqueda y ordenamiento
 */
export interface CatalogoQueryParams {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

/**
 * Interfaz genérica para resultados paginados de catálogos
 */
export interface CatalogoPaginatedResult<T> {
  data: T[];
  total: number;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class CatalogosService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /**
   * Obtiene catálogos con soporte para paginación, búsqueda y ordenamiento
   * @param tipo - Tipo de catálogo (ej: 'dietas', 'especialidades')
   * @param params - Parámetros opcionales de consulta
   * @returns Observable con resultado paginado
   */
  getCatalogos(
    tipo: string,
    params?: CatalogoQueryParams
  ): Observable<CatalogoPaginatedResult<Catalogo>> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.search !== undefined && params.search !== '') {
        httpParams = httpParams.set('search', params.search);
      }
      if (params.sortBy !== undefined && params.sortBy !== '') {
        httpParams = httpParams.set('sortBy', params.sortBy);
      }
      if (params.sortOrder !== undefined) {
        httpParams = httpParams.set('sortOrder', params.sortOrder);
      }
      if (params.limit !== undefined) {
        httpParams = httpParams.set('limit', params.limit.toString());
      }
      if (params.offset !== undefined) {
        httpParams = httpParams.set('offset', params.offset.toString());
      }
    }

    return this.http
      .get<ApiResponse<CatalogoPaginatedResult<Catalogo>>>(
        `${this.apiUrl}/catalogos/${tipo}`,
        { params: httpParams }
      )
      .pipe(map((response) => response.data));
  }

  crearCatalogo(payload: {
    tipo: string;
    nombre: string;
    descripcion?: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/catalogos`, payload);
  }

  /**
   * Actualiza un registro de catálogo existente
   * @param tipo - Tipo de catálogo
   * @param id - ID del registro a actualizar
   * @param payload - Datos a actualizar
   * @returns Observable con la respuesta del servidor
   */
  updateCatalogo(
    tipo: string,
    id: number,
    payload: { nombre?: string; descripcion?: string; codigo?: string; estado?: boolean }
  ): Observable<any> {
    return this.http.patch(`${this.apiUrl}/catalogos/${tipo}/${id}`, payload);
  }

  toggleEstado(id: number, activo: boolean, tipo?: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/catalogos/${id}/estado`, {
      activo,
      tipo,
    });
  }

  /** GET /catalogos/estados-paciente */
  getEstadosPaciente(): Observable<string[]> {
    return this.http.get<any>(`${this.apiUrl}/catalogos/estados-paciente`).pipe(
      map((res) => {
        const payload = res && res.data ? res.data : res;
        return Array.isArray(payload) ? payload : Object.values(payload);
      }),
    );
  }
}
