import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TurnosService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  iniciarTurno(): Observable<any> {
    return this.http.post(`${this.apiUrl}/turnos/iniciar`, {});
  }

  finalizarTurno(): Observable<any> {
    return this.http.post(`${this.apiUrl}/turnos/finalizar`, {});
  }

  getMallaMensual(mes: number, anio: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/turnos/malla?mes=${mes}&anio=${anio}`);
  }

  programarTurno(payload: { id_usuario: number, fecha_inicio: string, fecha_fin: string, tipo_turno: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/turnos/programar`, payload);
  }
}
