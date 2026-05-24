import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface UsuarioAdmin {
  id: number;
  documento: string;
  nombres: string;
  apellidos: string;
  celular?: string;
  email?: string;
  rol: { id: number; nombre: string } | string;
  estado?: string;
  bloqueado_hasta?: string | null;
}

export interface CrearUsuarioDto {
  documento: string;
  nombres: string;
  apellidos: string;
  celular: string;
  email?: string;
  clave: string;
  rol_id: number;
}

export interface ActualizarUsuarioDto {
  nombres?: string;
  apellidos?: string;
  celular?: string;
  email?: string;
  rol_id?: number;
}

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getUsuarios(): Observable<{ data: UsuarioAdmin[] }> {
    return this.http.get<{ data: UsuarioAdmin[] }>(`${this.apiUrl}/usuarios`);
  }

  getUsuario(id: number): Observable<{ data: UsuarioAdmin }> {
    return this.http.get<{ data: UsuarioAdmin }>(`${this.apiUrl}/usuarios/${id}`);
  }

  crearUsuario(payload: CrearUsuarioDto): Observable<null> {
    return this.http.post<null>(`${this.apiUrl}/usuarios`, payload);
  }

  actualizarUsuario(id: number, payload: ActualizarUsuarioDto): Observable<null> {
    return this.http.patch<null>(`${this.apiUrl}/usuarios/${id}`, payload);
  }

  toggleBloqueo(id: number, accion: 'BLOQUEAR' | 'DESBLOQUEAR'): Observable<null> {
    return this.http.patch<null>(`${this.apiUrl}/usuarios/${id}/bloqueo`, { accion });
  }

  forzarReset(id: number): Observable<null> {
    return this.http.post<null>(`${this.apiUrl}/usuarios/${id}/force-reset`, {});
  }
}
