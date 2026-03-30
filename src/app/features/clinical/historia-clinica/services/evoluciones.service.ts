import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/services/catalogos.service';

/** Modelo de una Evolución médica */
export interface Evolucion {
  id: number;
  id_paciente: number;
  titulo: string;
  descripcion: string;
  autor: string;
  fecha: string; // ISO 8601
  created_at?: string;
}

export type EvolucionPayload = Omit<Evolucion, 'id' | 'created_at'>;

@Injectable({ providedIn: 'root' })
export class EvolucionesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /** GET /evoluciones/paciente/:id */
  getEvoluciones(idPaciente: number): Observable<Evolucion[]> {
    return this.http
      .get<ApiResponse<Evolucion[]>>(`${this.apiUrl}/evoluciones/paciente/${idPaciente}`)
      .pipe(map((res) => res.data));
  }

  /** POST /evoluciones */
  crearEvolucion(payload: EvolucionPayload): Observable<Evolucion> {
    return this.http
      .post<ApiResponse<Evolucion>>(`${this.apiUrl}/evoluciones`, payload)
      .pipe(map((res) => res.data));
  }
}
