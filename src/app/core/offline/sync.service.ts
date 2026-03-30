import { Injectable, inject } from '@angular/core';
import { db } from './dexie.db';
import { KardexService } from '../../features/kardex/services/kardex.service';
import { firstValueFrom } from 'rxjs';

/** Payload esperado en el queue para sincronizar dosis */
export interface DosisSyncPayload {
  idDosis: number;
  data: {
    idempotency_key: string;
    fecha_hora_aplicacion: string;
    estado_dosis: string;
    observaciones?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class SyncService {
  private readonly kardexSvc = inject(KardexService);

  constructor() {
    // Escuchar el evento online del navegador para intentar vaciar la cola
    window.addEventListener('online', () => this.sincronizarPendientes());
  }

  /**
   * Encola la operación en Dexie (IndexedDB)
   */
  async encolarDosis(payload: DosisSyncPayload): Promise<void> {
    await db.syncQueue.add({ tipo: 'DOSIS', payload, fecha: Date.now() });

    // Intentamos sincronizar si recuperamos red casi de inmediato
    if (navigator.onLine) {
      this.sincronizarPendientes();
    }
  }

  /**
   * Procesa la cola local de pendientes hacia la API
   */
  async sincronizarPendientes(): Promise<void> {
    if (!navigator.onLine) return; // Precaución adicional

    const pendientes = await db.syncQueue.where('tipo').equals('DOSIS').toArray();

    for (const item of pendientes) {
      try {
        const payload = item.payload as DosisSyncPayload;
        
        // Ejecutamos la promesa HTTP
        await firstValueFrom(this.kardexSvc.aplicarDosis(payload.idDosis, payload.data));
        
        // Si fue exitoso, eliminamos de Dexie
        if (item.id) {
          await db.syncQueue.delete(item.id);
        }
      } catch (err: any) {
        // En caso de 400 o 409, asumimos que la idempotency_key previno la duplicación
        // o que hubo un error lógico de negocio irreparable. Para no bloquear la cola,
        // lo eliminamos. Si es error de red (0, 503, 504), simplemente se mantiene en cola.
        const status = err?.status || err?.error?.status;
        if (status === 400 || status === 409 || status === 422) {
          if (item.id) {
            await db.syncQueue.delete(item.id);
          }
        }
      }
    }
  }
}
