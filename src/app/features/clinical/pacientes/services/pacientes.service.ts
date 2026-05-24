import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, distinctUntilChanged, shareReplay } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '@core/services/catalogos.service';
import {
  Paciente,
  CrearPacienteDto,
  ActualizarPacienteDto,
  PacienteQueryParams,
} from '@core/models/paciente.model';

@Injectable({ providedIn: 'root' })
export class PacientesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getPacientes(params?: PacienteQueryParams): Observable<Paciente[]> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.estado) httpParams = httpParams.set('estado', params.estado);
      if (params.activo !== undefined) httpParams = httpParams.set('activo', String(params.activo));
      if (params.offset !== undefined) httpParams = httpParams.set('offset', String(params.offset));
      if (params.limit !== undefined) httpParams = httpParams.set('limit', String(params.limit));
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortOrder) httpParams = httpParams.set('sortOrder', params.sortOrder);
    }
    return this.http
      .get<ApiResponse<Paciente[]>>(`${this.apiUrl}/pacientes`, { params: httpParams })
      .pipe(
        map((res) => res.data),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        shareReplay(1)
      );
  }

  getPacientesActivos(): Observable<Paciente[]> {
    return this.getPacientes({ activo: true });
  }

  getPacienteById(id: number): Observable<Paciente> {
    return this.http
      .get<ApiResponse<Paciente>>(`${this.apiUrl}/pacientes/${id}`)
      .pipe(map((res) => res.data), shareReplay(1));
  }

  getPacienteByDocumento(documento: string): Observable<Paciente> {
    return this.http
      .get<ApiResponse<Paciente>>(`${this.apiUrl}/pacientes/${documento}`)
      .pipe(map((res) => res.data), shareReplay(1));
  }

  registrarPaciente(payload: CrearPacienteDto): Observable<Paciente> {
    return this.http
      .post<ApiResponse<Paciente>>(`${this.apiUrl}/pacientes`, payload)
      .pipe(map((res) => res.data));
  }

  actualizarPaciente(documento: string, payload: ActualizarPacienteDto): Observable<Paciente> {
    return this.http
      .patch<ApiResponse<Paciente>>(`${this.apiUrl}/pacientes/${documento}`, payload)
      .pipe(map((res) => res.data));
  }
}
