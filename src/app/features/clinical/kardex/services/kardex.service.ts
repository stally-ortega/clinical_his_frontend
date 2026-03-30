import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/services/catalogos.service'; // We reuse ApiResponse interface

export interface DosisProgramada {
  id: number;
  id_prescripcion: number;
  fecha_hora_programada: string;
  fecha_hora_aplicacion: string | null;
  estado_dosis: 'PENDIENTE' | 'APLICADA' | 'NO_APLICADA';
  observaciones: string | null;
  idempotency_key: string | null;
}

export interface Prescripcion {
  id: number;
  id_paciente: number;
  medicamento: string;
  dosis: number;
  medida_dosis: string;
  via_aplicacion: string;
  frecuencia_horas: number;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  dosis_programadas?: DosisProgramada[]; 
}

@Injectable({ providedIn: 'root' })
export class KardexService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getKardexPaciente(idPaciente: number, desde: string, hasta: string): Observable<Prescripcion[]> {
    return this.http
      .get<ApiResponse<Prescripcion[]>>(`${this.apiUrl}/kardex/paciente/${idPaciente}?desde=${desde}&hasta=${hasta}`)
      .pipe(map(res => res.data));
  }

  aplicarDosis(
    idDosis: number, 
    payload: { idempotency_key: string; fecha_hora_aplicacion: string; estado_dosis: string; observaciones?: string }
  ): Observable<any> {
    return this.http
      .patch<ApiResponse<any>>(`${this.apiUrl}/kardex/dosis/${idDosis}`, payload)
      .pipe(map(res => res.data));
  }
}
