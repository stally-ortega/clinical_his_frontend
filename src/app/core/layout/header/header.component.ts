import { Component, inject, output, signal, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthStore } from '../../../store/auth.store';
import { NotificacionesStore, Alerta } from '../../store/notificaciones.store';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  public store = inject(AuthStore);
  public notifStore = inject(NotificacionesStore);
  private router = inject(Router);

  /** Emite evento para que el MainLayout abra/cierre el sidebar en mobile */
  mobileMenuToggle = output<void>();

  /** Control del panel dropdown de notificaciones */
  showNotifPanel = signal(false);

  /** Lista de toasts activos */
  toasts = signal<Array<{ id: string; mensaje: string; tipo: string }>>([]);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.notif-wrapper')) {
      this.showNotifPanel.set(false);
    }
  }

  onLogout(): void {
    this.store.logout();
  }

  onMobileMenuToggle(): void {
    this.mobileMenuToggle.emit();
  }

  /** Navegación al panel de perfil del usuario */
  onUserChipClick(): void {
    this.router.navigate(['/app/perfil']);
  }

  toggleNotifPanel(): void {
    this.showNotifPanel.update(v => !v);
  }

  onMarcarLeida(alerta: Alerta): void {
    this.notifStore.marcarLeida(alerta.id);
  }

  onMarcarTodas(): void {
    this.notifStore.marcarTodasLeidas();
  }

  /** Muestra un Toast temporal (auto-elimina a los 4s) */
  mostrarToast(mensaje: string, tipo: string): void {
    const id = crypto.randomUUID();
    this.toasts.update(arr => [...arr, { id, mensaje, tipo }]);
    setTimeout(() => {
      this.toasts.update(arr => arr.filter(t => t.id !== id));
    }, 4000);
  }

  getAlertIcon(tipo: string): string {
    switch (tipo) {
      case 'error': return 'emergency';
      case 'warning': return 'warning';
      case 'success': return 'check_circle';
      default: return 'info';
    }
  }
}
