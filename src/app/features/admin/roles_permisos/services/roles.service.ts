import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface Permiso {
  id: number;
  codigo: string;
  modulo: string;
  descripcion: string;
}

export interface Rol {
  id: number;
  nombre: string;
  descripcion: string;
  permisos: Permiso[];
}

@Injectable({ providedIn: 'root' })
export class RolesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getRoles(): Observable<{ data: Rol[] }> {
    return this.http.get<{ data: Rol[] }>(`${this.apiUrl}/roles`);
  }

  getPermisos(): Observable<{ data: Permiso[] }> {
    return this.http.get<{ data: Permiso[] }>(`${this.apiUrl}/permisos`);
  }

  crearRol(nombre: string, descripcion: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/roles`, { nombre, descripcion });
  }

  asignarPermisos(rolId: number, permiso_ids: number[]): Observable<any> {
    return this.http.patch(`${this.apiUrl}/roles/${rolId}/permisos`, { permiso_ids });
  }
}
