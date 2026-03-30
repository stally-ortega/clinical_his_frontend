/**
 * Modelos de dominio del contexto de Autenticación.
 * Espejo tipado de las interfaces que devuelve la API del backend NestJS.
 */

/** Datos mínimos del usuario autenticado incluidos en el token JWT */
export interface Usuario {
  id: number;
  nombres: string;
  apellidos: string;
  rol: string;
}

/** Estructura completa de la respuesta del endpoint POST /auth/login */
export interface AuthResponse {
  status: string;
  data: {
    access_token: string;
    usuario: Usuario;
  };
}

/** Payload del formulario de login */
export interface LoginPayload {
  documento: string;
  clave: string;
}
