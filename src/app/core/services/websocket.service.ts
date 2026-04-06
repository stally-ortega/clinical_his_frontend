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
    this.socket.on('notificacion_personal', (data: any) => {
      this.notifStore.agregarAlerta({
        mensaje: data.mensaje ?? 'Nueva notificación personal',
        tipo: data.tipo ?? 'info',
        origen: 'Personal',
      });
    });

    this.socket.on('emergencia_rol', (data: any) => {
      this.notifStore.agregarAlerta({
        mensaje: data.mensaje ?? '⚠️ Emergencia de rol activa',
        tipo: 'error',
        origen: 'Emergencia',
      });
    });

    this.socket.on('alerta_clinica', (data: any) => {
      this.notifStore.agregarAlerta({
        mensaje: data.mensaje ?? 'Alerta clínica recibida',
        tipo: 'warning',
        origen: data.origen ?? 'Clínica',
      });
    });

    this.socket.on('tarea_asignada', (data: any) => {
      this.notifStore.agregarAlerta({
        mensaje: data.mensaje ?? 'Se te ha asignado una nueva tarea',
        tipo: 'info',
        origen: 'Tareas',
      });
    });

    this.socket.on('turno_programado', (data: any) => {
      this.notifStore.agregarAlerta({
        mensaje: data.mensaje ?? 'Tu turno ha sido actualizado',
        tipo: 'success',
        origen: 'Turnos',
      });
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

  ngOnDestroy(): void {
    this.desconectar();
  }
}
