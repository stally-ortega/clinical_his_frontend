import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface TareaPayload {
  id_paciente: number;
  descripcion: string;
  fecha_hora_programada: string;
  id_usuario_asignado?: number;
}

export interface Tarea {
  id: number;
  id_paciente: number;
  id_usuario_creador: number;
  id_usuario_asignado: number | null;
  descripcion: string;
  fecha_hora_programada: string;
  estado: string;
}

export interface ApiResponse<T> {
  exito: boolean;
  data: T;
  mensaje?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TareasService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getTareasPendientes(idUsuario?: number): Observable<Tarea[]> {
    let params = new HttpParams();
    if (idUsuario) {
      params = params.set('id_usuario', idUsuario.toString());
    }
    return this.http.get<ApiResponse<Tarea[]>>(`${this.apiUrl}/tareas/pendientes`, { params })
      .pipe(map(res => res.data));
  }

  crearTarea(payload: TareaPayload): Observable<Tarea> {
    return this.http.post<ApiResponse<Tarea>>(`${this.apiUrl}/tareas`, payload)
      .pipe(map(res => res.data));
  }

  completarTarea(id: number, observaciones?: string): Observable<Tarea> {
    return this.http.patch<ApiResponse<Tarea>>(`${this.apiUrl}/tareas/${id}/completar`, { observaciones })
      .pipe(map(res => res.data));
  }
}
