import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface UsuarioAdmin {
  id: number;
  documento: string;
  nombres: string;
  apellidos: string;
  rol: { id: number; nombre: string } | string;
  bloqueado_hasta?: string | null;
}

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getUsuarios(): Observable<{ data: UsuarioAdmin[] }> {
    // Asumimos que el backend envuelve los objetos en "data"
    // Si los devuelve directo, NgRx lo manejará
    return this.http.get<{ data: UsuarioAdmin[] }>(`${this.apiUrl}/usuarios`);
  }

  crearUsuario(payload: unknown): Observable<null> {
    return this.http.post<null>(`${this.apiUrl}/usuarios`, payload);
  }

  toggleBloqueo(id: number, accion: 'BLOQUEAR' | 'DESBLOQUEAR'): Observable<null> {
    return this.http.patch<null>(`${this.apiUrl}/usuarios/${id}/bloqueo`, { accion });
  }

  forzarReset(id: number): Observable<null> {
    return this.http.post<null>(`${this.apiUrl}/usuarios/${id}/force-reset`, {});
  }
}
