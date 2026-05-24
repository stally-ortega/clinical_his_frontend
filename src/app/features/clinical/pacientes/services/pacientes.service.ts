import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/services/catalogos.service';

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
  fecha_registro: Date;
  ubicacion_fisica?: {
    id: number;
    id_nomenclatura: number;
    valores: Record<string, string>;
  };
  tipo_dieta?: {
    id: number;
    nombre: string;
  };
}

export interface PacientePayload {
  documento: string;
  nombres: string;
  apellidos: string;
  edad: number;
  sexo: string;
  id_nomenclatura: number;
  valores_ubicacion: Record<string, string>;
  id_tipo_dieta: number;
}

@Injectable({ providedIn: 'root' })
export class PacientesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getPacientesActivos(): Observable<Paciente[]> {
    return this.http.get<ApiResponse<Paciente[]>>(`${this.apiUrl}/pacientes`)
      .pipe(map(res => res.data));
  }

  getPacienteByDocumento(documento: string): Observable<Paciente> {
    return this.http.get<ApiResponse<Paciente>>(`${this.apiUrl}/pacientes/${documento}`)
      .pipe(map(res => res.data));
  }

  registrarPaciente(payload: PacientePayload): Observable<Paciente> {
    return this.http.post<ApiResponse<Paciente>>(`${this.apiUrl}/pacientes`, payload)
      .pipe(map(res => res.data));
  }

  actualizarPaciente(documento: string, payload: PacientePayload): Observable<Paciente> {
    return this.http.patch<ApiResponse<Paciente>>(`${this.apiUrl}/pacientes/${documento}`, payload)
      .pipe(map(res => res.data));
  }
}
