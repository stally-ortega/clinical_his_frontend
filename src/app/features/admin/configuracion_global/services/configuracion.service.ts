import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import { ConfiguracionGlobal, ActualizarConfiguracionDto } from '@features/admin/configuracion_global/models/configuracion.interface';

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

  obtenerConfiguraciones(): Observable<ConfiguracionGlobal[]> {
    return this.http.get<ApiResponse<ConfiguracionGlobal[]> | ConfiguracionGlobal[]>(`${this.apiUrl}/configuraciones`).pipe(
      map((res) => (Array.isArray(res) ? res : res.data || []))
    );
  }

  actualizarBulk(data: ActualizarConfiguracionDto[]): Observable<{ modificados: number }> {
    return this.http.patch<{ modificados: number }>(
      `${this.apiUrl}/configuraciones/bulk`,
      { configuraciones: data },
    );
  }
}
