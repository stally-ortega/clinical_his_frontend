import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '@core/services/catalogos.service';
import { Evolucion, CrearEvolucionDto } from '@core/models/evolucion.model';

@Injectable({ providedIn: 'root' })
export class EvolucionesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getEvoluciones(idPaciente: number): Observable<Evolucion[]> {
    return this.http
      .get<ApiResponse<Evolucion[]>>(`${this.apiUrl}/evoluciones/paciente/${idPaciente}`)
      .pipe(map((res) => res.data));
  }

  crearEvolucion(payload: CrearEvolucionDto): Observable<Evolucion> {
    return this.http
      .post<ApiResponse<Evolucion>>(`${this.apiUrl}/evoluciones`, payload)
      .pipe(map((res) => res.data));
  }
}
