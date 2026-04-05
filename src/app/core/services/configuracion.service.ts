import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ConfiguracionSistema {
  id: number;
  timeout_inactividad_minutos: number;
  empresa_nombre: string;
}

@Injectable({ providedIn: 'root' })
export class ConfiguracionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /** GET /api/v1/configuracion — Público. Devuelve la configuración global del sistema. */
  getConfiguracion(): Observable<ConfiguracionSistema> {
    return this.http.get<{ id: number; timeout_inactividad_minutos: number; empresa_nombre: string }>(
      `${this.apiUrl}/configuracion`
    );
  }
}
