import { computed } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';

export interface Alerta {
  id: string;
  mensaje: string;
  tipo: 'info' | 'warning' | 'error' | 'success';
  fecha: Date;
  leida: boolean;
  origen?: string;
}

export type NotificacionesState = {
  alertas: Alerta[];
};

const initialState: NotificacionesState = {
  alertas: [],
};

export const NotificacionesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    unreadCount: computed(() => store.alertas().filter(a => !a.leida).length),
    ultimasAlertas: computed(() => {
      return [...store.alertas()]
        .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
        .slice(0, 10);
    }),
  })),
  withMethods((store) => ({
    agregarAlerta(alerta: Omit<Alerta, 'id' | 'fecha' | 'leida'>): void {
      const nueva: Alerta = {
        ...alerta,
        id: crypto.randomUUID(),
        fecha: new Date(),
        leida: false,
      };
      patchState(store, { alertas: [nueva, ...store.alertas()].slice(0, 50) });
    },

    marcarLeida(id: string): void {
      patchState(store, {
        alertas: store.alertas().map(a => a.id === id ? { ...a, leida: true } : a),
      });
    },

    marcarTodasLeidas(): void {
      patchState(store, {
        alertas: store.alertas().map(a => ({ ...a, leida: true })),
      });
    },

    limpiarTodas(): void {
      patchState(store, { alertas: [] });
    },
  })),
);
