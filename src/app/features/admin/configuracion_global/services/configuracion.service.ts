import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ConfiguracionGlobal, ActualizarConfiguracionDto } from '../models/configuracion.interface';

interface ApiResponse<T> {
  exito: boolean;
  data: T;
  mensaje?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ConfiguracionGlobalService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  obtenerConfiguraciones() {
    return this.http.get<any>(`${this.apiUrl}/configuraciones`).pipe(
      map((res) => res.data || res || [])
    );
  }

  actualizarBulk(data: ActualizarConfiguracionDto[]): Observable<{ modificados: number }> {
    return this.http.patch<{ modificados: number }>(
      `${this.apiUrl}/configuraciones/bulk`,
      { configuraciones: data },
    );
  }
}
