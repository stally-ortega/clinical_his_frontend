import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/services/catalogos.service';

export interface PrescripcionPayload {
  id_paciente: number;
  medicamento: string;
  dosis: number;
  medida_dosis: string;
  id_via_aplicacion: number;
  frecuencia_horas: number;
  fecha_hora_inicio: string; // ISO 8601
  duracion_dias: number;
}

export interface Prescripcion {
  id: number;
  id_paciente: number;
  medicamento: string;
  dosis: number;
  medida_dosis: string;
  id_via_aplicacion: number;
  frecuencia_horas: number;
  fecha_hora_inicio: string;
  duracion_dias: number;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class PrescripcionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  crearPrescripcion(payload: PrescripcionPayload): Observable<Prescripcion> {
    return this.http
      .post<ApiResponse<Prescripcion>>(`${this.apiUrl}/kardex/prescripciones`, payload)
      .pipe(map(res => res.data));
  }
}
