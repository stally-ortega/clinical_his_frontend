import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface TipoUbicacion {
  id: number;
  nombre: string;
  estado: boolean;
}

export interface EstructuraNivel {
  id_tipo_ubicacion: number;
  orden: number;
  tipoUbicacion?: TipoUbicacion;
}

export interface NivelNomenclatura {
  id_tipo_ubicacion: number;
  orden: number;
  tipo?: TipoUbicacion;
}

export interface Nomenclatura {
  id: number;
  nombre: string;
  estado: boolean;
  estructura: EstructuraNivel[];
}

export interface NomenclaturaPayload {
  nombre: string;
  estructura: { id_tipo_ubicacion: number; orden: number }[];
}

export interface ApiResponse<T> {
  exito: boolean;
  data: T;
  mensaje?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UbicacionesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getTiposUbicacion(): Observable<TipoUbicacion[]> {
    return this.http.get<ApiResponse<TipoUbicacion[]>>(`${this.apiUrl}/catalogos/tipos-ubicacion?limit=100`)
    .pipe(
      map(res => {
        const payload = res.data;
        return Array.isArray(payload) ? payload : [];
      })
    );
  }

  crearTipoUbicacion(nombre: string): Observable<TipoUbicacion> {
    return this.http.post<ApiResponse<TipoUbicacion>>(`${this.apiUrl}/ubicaciones/tipos`, { nombre })
      .pipe(map(res => res.data));
  }

  getNomenclaturas(): Observable<Nomenclatura[]> {
    return this.http.get<ApiResponse<Nomenclatura[]>>(`${this.apiUrl}/ubicaciones/nomenclaturas`)
      .pipe(
        map(res => {
          const data = res.data || res;
          const arrayRespuesta = Array.isArray(data) ? data : [];
          return arrayRespuesta.map(nom => ({
            ...nom,
            estructura: (nom.estructura || []).map((nivel: EstructuraNivel & { tipo_ubicacion?: TipoUbicacion }) => ({
              ...nivel,
              tipoUbicacion: nivel.tipoUbicacion || nivel.tipo_ubicacion
            }))
          }));
        })
      );
  }

  getNomenclatura(id: number): Observable<Nomenclatura> {
    return this.http.get<ApiResponse<Nomenclatura>>(`${this.apiUrl}/ubicaciones/nomenclaturas/${id}`)
      .pipe(map(res => res.data));
  }

  crearNomenclatura(payload: NomenclaturaPayload): Observable<Nomenclatura> {
    return this.http.post<ApiResponse<Nomenclatura>>(`${this.apiUrl}/ubicaciones/nomenclaturas`, payload)
      .pipe(map(res => res.data));
  }

  actualizarNomenclatura(id: number, payload: NomenclaturaPayload): Observable<Nomenclatura> {
    return this.http.put<ApiResponse<Nomenclatura>>(`${this.apiUrl}/ubicaciones/nomenclaturas/${id}`, payload)
      .pipe(map(res => res.data));
  }

  actualizarTipo(id: number, payload: { nombre: string }): Observable<TipoUbicacion> {
    return this.http.put<ApiResponse<TipoUbicacion>>(`${this.apiUrl}/ubicaciones/tipos/${id}`, payload)
      .pipe(map(res => res.data));
  }

  toggleEstadoTipo(id: number): Observable<TipoUbicacion> {
    return this.http.patch<ApiResponse<TipoUbicacion>>(`${this.apiUrl}/ubicaciones/tipos/${id}/estado`, {})
      .pipe(map(res => res.data));
  }

  toggleEstadoNomenclatura(id: number): Observable<Nomenclatura> {
    return this.http.patch<ApiResponse<Nomenclatura>>(`${this.apiUrl}/ubicaciones/nomenclaturas/${id}/estado`, {})
      .pipe(map(res => res.data));
  }
}
