import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '@core/services/catalogos.service';
import { Nota, CrearNotaDto } from '@core/models/evolucion.model';

@Injectable({ providedIn: 'root' })
export class NotasService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getNotas(idPaciente: number): Observable<Nota[]> {
    return this.http
      .get<ApiResponse<Nota[]>>(`${this.apiUrl}/notas/paciente/${idPaciente}`)
      .pipe(map((res) => res.data));
  }

  crearNota(payload: CrearNotaDto): Observable<Nota> {
    return this.http
      .post<ApiResponse<Nota>>(`${this.apiUrl}/notas`, payload)
      .pipe(map((res) => res.data));
  }
}
