import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { AuthResponse, LoginPayload, Usuario, RecuperacionPayload, CambioPasswordPayload } from '@core/models/auth.model';
import { secureSet, secureGet, secureRemove } from '@core/utils/storage.util';

const TOKEN_KEY = 'clinical_his_token';
const USER_KEY = 'clinical_his_user';

/**
 * Servicio de Autenticación.
 * Responsable de la comunicación HTTP con el backend y la gestión de sesión en localStorage.
 * El estado reactivo (signals) vive en AuthStore, no aquí.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /** Realiza el login contra el backend y retorna un Observable con la respuesta completa */
  login(credentials: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials);
  }

  /**
   * POST /api/v1/auth/forgot-password
   * Solicita instrucciones de recuperación de contraseña por documento.
   * El backend siempre responde con éxito (Silent Success pattern).
   */
  solicitarRecuperacion(payload: RecuperacionPayload): Observable<null> {
    return this.http.post<null>(`${this.apiUrl}/auth/forgot-password`, payload);
  }

  /**
   * PATCH /api/v1/auth/cambiar-password
   * Cambia la contraseña de un usuario autenticado.
   * Requiere token JWT válido en el header (añadido por el interceptor HTTP).
   */
  cambiarPasswordInterno(payload: CambioPasswordPayload): Observable<null> {
    return this.http.patch<null>(`${this.apiUrl}/auth/cambiar-password`, payload);
  }

  /** Persiste el token y los datos del usuario en localStorage ofuscado */
  saveSession(token: string, user: Usuario): void {
    secureSet(TOKEN_KEY, token);
    secureSet(USER_KEY, JSON.stringify(user));
  }

  /** Elimina la sesión local (logout) */
  clearSession(): void {
    secureRemove(TOKEN_KEY);
    secureRemove(USER_KEY);
  }

  /** Lee el token almacenado (puede ser null si no hay sesión) */
  getToken(): string | null {
    return secureGet(TOKEN_KEY);
  }

  /** Reconstruye el objeto Usuario desde localStorage ofuscado */
  getStoredUser(): Usuario | null {
    const raw = secureGet(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Usuario;
    } catch {
      return null;
    }
  }
}
