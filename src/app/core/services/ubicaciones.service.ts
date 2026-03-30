import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Catalogo, ApiResponse } from './catalogos.service';

@Injectable({ providedIn: 'root' })
export class UbicacionesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getTiposUbicacion(): Observable<Catalogo[]> {
    const fallbackData = [
      {id: 1, nombre: 'Urgencias (Box 1)'},
      {id: 2, nombre: 'UCI (Cama 4)'},
      {id: 3, nombre: 'Hospitalización Norte (Hab. 201)'}
    ];

    return this.http.get<ApiResponse<Catalogo[]>>(`${this.apiUrl}/ubicaciones/nomenclaturas/1`)
      .pipe(
        map(response => {
          const data: any = response.data;
          if(data && data.estructura) {
             return data.estructura.map((e: any) => ({id: e.id_tipo_ubicacion, nombre: `Ubicación Tipo ${e.id_tipo_ubicacion}`}));
          }
          return fallbackData;
        }),
        catchError(() => of(fallbackData)) // Interceptamos 404 para evitar que se rompa la app
      );
  }
}

