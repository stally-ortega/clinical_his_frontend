import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface TipoUbicacion {
  id: number;
  nombre: string;
}

export interface NivelNomenclatura {
  id_tipo_ubicacion: number;
  orden: number;
  tipo?: TipoUbicacion;
}

export interface Nomenclatura {
  id: number;
  nombre: string;
  niveles: NivelNomenclatura[];
}

export interface NomenclaturaPayload {
  nombre: string;
  niveles: { id_tipo_ubicacion: number; orden: number }[];
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
    return this.http.get<ApiResponse<TipoUbicacion[]>>(`${this.apiUrl}/ubicaciones/tipos`)
      .pipe(map(res => res.data));
  }

  crearTipoUbicacion(nombre: string): Observable<TipoUbicacion> {
    return this.http.post<ApiResponse<TipoUbicacion>>(`${this.apiUrl}/ubicaciones/tipos`, { nombre })
      .pipe(map(res => res.data));
  }

  getNomenclatura(id: number): Observable<Nomenclatura> {
    return this.http.get<ApiResponse<Nomenclatura>>(`${this.apiUrl}/ubicaciones/nomenclaturas/${id}`)
      .pipe(map(res => res.data));
  }

  crearNomenclatura(payload: NomenclaturaPayload): Observable<Nomenclatura> {
    return this.http.post<ApiResponse<Nomenclatura>>(`${this.apiUrl}/ubicaciones/nomenclaturas`, payload)
      .pipe(map(res => res.data));
  }
}
