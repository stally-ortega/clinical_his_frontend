import { Injectable, inject, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { NotificacionesStore } from '../store/notificaciones.store';
import { AuthStore } from '../../store/auth.store';

/**
 * WebSocketService
 *
 * Gestiona la conexión Socket.IO con el backend.
 * Al conectar autentica con el JWT del AuthStore y enruta
 * los eventos recibidos al NotificacionesStore global.
 */
@Injectable({ providedIn: 'root' })
export class WebSocketService implements OnDestroy {
  private readonly authStore = inject(AuthStore);
  private readonly notifStore = inject(NotificacionesStore);

  private socket: Socket | null = null;
  private readonly wsUrl = environment.apiUrl.replace('/api/v1', '');

  /** Conecta al servidor WS autenticado con el JWT actual */
  conectar(): void {
    if (this.socket?.connected) return;

    const token = this.authStore.token();
    if (!token) {
      console.warn('[WebSocket] Sin token, conexión cancelada.');
      return;
    }

    this.socket = io(this.wsUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    this.socket.on('connect', () => {
      console.info(`[WebSocket] ✅ Conectado — ID: ${this.socket?.id}`);
    });

    this.socket.on('disconnect', (reason) => {
      console.warn(`[WebSocket] 🔌 Desconectado — motivo: ${reason}`);
    });

    this.socket.on('connect_error', (err) => {
      console.warn('[WebSocket] Error de conexión:', err.message);
    });

    // ── Eventos clínicos ─────────────────────────────────────────────
    this.socket.on('notificacion_personal', (data: unknown) => {
      const payload = this._parseAlerta(data);
      this.notifStore.agregarAlerta(payload);
    });

    this.socket.on('emergencia_rol', (data: unknown) => {
      const payload = this._parseAlerta(data, '⚠️ Emergencia de rol activa', 'error', 'Emergencia');
      this.notifStore.agregarAlerta(payload);
    });

    this.socket.on('alerta_clinica', (data: unknown) => {
      const payload = this._parseAlerta(data, 'Alerta clínica recibida', 'warning', 'Clínica');
      this.notifStore.agregarAlerta(payload);
    });

    this.socket.on('tarea_asignada', (data: unknown) => {
      const payload = this._parseAlerta(data, 'Se te ha asignado una nueva tarea', 'info', 'Tareas');
      this.notifStore.agregarAlerta(payload);
    });

    this.socket.on('turno_programado', (data: unknown) => {
      const payload = this._parseAlerta(data, 'Tu turno ha sido actualizado', 'success', 'Turnos');
      this.notifStore.agregarAlerta(payload);
    });
  }

  /** Desconecta limpiamente (llamar en logout) */
  desconectar(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.info('[WebSocket] Desconectado manualmente.');
    }
  }

  /** Estado de la conexión */
  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  private _parseAlerta(
    data: unknown,
    fallbackMensaje = 'Nueva notificación',
    fallbackTipo: 'info' | 'success' | 'warning' | 'error' = 'info',
    fallbackOrigen = 'Sistema',
  ): { mensaje: string; tipo: 'info' | 'success' | 'warning' | 'error'; origen: string } {
    if (data && typeof data === 'object') {
      const d = data as Record<string, unknown>;
      const tipo = (d['tipo'] as 'info' | 'success' | 'warning' | 'error') || fallbackTipo;
      return {
        mensaje: (d['mensaje'] as string) || fallbackMensaje,
        tipo,
        origen: (d['origen'] as string) || fallbackOrigen,
      };
    }
    return { mensaje: fallbackMensaje, tipo: fallbackTipo, origen: fallbackOrigen };
  }

  ngOnDestroy(): void {
    this.desconectar();
  }
}
