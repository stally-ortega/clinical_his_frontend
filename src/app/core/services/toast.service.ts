import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

/**
 * Servicio global de notificaciones (Toasts).
 * Hardcodeado a 3000 ms de duración; a futuro será configurable desde admin.
 */
@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  private addToast(message: string, type: 'success' | 'error'): void {
    const id = Date.now() + Math.random();
    this._toasts.update((current) => [...current, { id, message, type }]);
    setTimeout(() => this.remove(id), 3000);
  }

  success(message: string): void {
    this.addToast(message, 'success');
  }

  error(message: string): void {
    this.addToast(message, 'error');
  }

  remove(id: number): void {
    this._toasts.update((current) => current.filter((t) => t.id !== id));
  }
}
