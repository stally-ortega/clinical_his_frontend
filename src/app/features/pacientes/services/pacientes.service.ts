import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/services/catalogos.service';

export interface Paciente {
  id: number;
  documento: string;
  nombres: string;
  apellidos: string;
  edad: number;
  sexo: string;
  estado: string;
  id_ubicacion_fisica: number;
  id_tipo_dieta: number;
  fecha_ingreso: Date;
}

export type PacientePayload = Omit<Paciente, 'id' | 'estado' | 'fecha_ingreso'>;

@Injectable({ providedIn: 'root' })
export class PacientesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getPacientesActivos(): Observable<Paciente[]> {
    return this.http.get<ApiResponse<Paciente[]>>(`${this.apiUrl}/pacientes`)
      .pipe(map(res => res.data));
  }

  registrarPaciente(payload: PacientePayload): Observable<Paciente> {
    return this.http.post<ApiResponse<Paciente>>(`${this.apiUrl}/pacientes`, payload)
      .pipe(map(res => res.data));
  }
}
