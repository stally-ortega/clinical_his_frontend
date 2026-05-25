import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  TurnoActivo,
  TurnoProgramado,
  IniciarTurnoDto,
  FinalizarTurnoDto,
  ProgramarTurnoDto,
  TurnoApiResponse,
} from '@core/models/turno.model';

@Injectable({
  providedIn: 'root'
})
export class TurnosService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  iniciarTurno(dto?: IniciarTurnoDto): Observable<TurnoApiResponse<TurnoActivo>> {
    return this.http.post<TurnoApiResponse<TurnoActivo>>(`${this.apiUrl}/turnos/iniciar`, dto ?? {});
  }

  finalizarTurno(dto?: FinalizarTurnoDto): Observable<TurnoApiResponse<TurnoActivo>> {
    return this.http.post<TurnoApiResponse<TurnoActivo>>(`${this.apiUrl}/turnos/finalizar`, dto ?? {});
  }

  getMallaMensual(mes: number, anio: number): Observable<TurnoApiResponse<TurnoProgramado[]>> {
    return this.http.get<TurnoApiResponse<TurnoProgramado[]>>(`${this.apiUrl}/turnos/malla?mes=${mes}&anio=${anio}`);
  }

  programarTurno(payload: ProgramarTurnoDto): Observable<TurnoApiResponse<TurnoProgramado>> {
    return this.http.post<TurnoApiResponse<TurnoProgramado>>(`${this.apiUrl}/turnos/programar`, payload);
  }
}
