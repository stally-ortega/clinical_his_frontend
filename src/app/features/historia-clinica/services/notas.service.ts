import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/services/catalogos.service';

/** Modelo de una Nota de Enfermería */
export interface Nota {
  id: number;
  id_paciente: number;
  titulo: string;
  descripcion: string;
  autor: string;
  fecha: string; // ISO 8601
  created_at?: string;
}

export type NotaPayload = Omit<Nota, 'id' | 'created_at'>;

@Injectable({ providedIn: 'root' })
export class NotasService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /** GET /notas/paciente/:id */
  getNotas(idPaciente: number): Observable<Nota[]> {
    return this.http
      .get<ApiResponse<Nota[]>>(`${this.apiUrl}/notas/paciente/${idPaciente}`)
      .pipe(map((res) => res.data));
  }

  /** POST /notas */
  crearNota(payload: NotaPayload): Observable<Nota> {
    return this.http
      .post<ApiResponse<Nota>>(`${this.apiUrl}/notas`, payload)
      .pipe(map((res) => res.data));
  }
}
