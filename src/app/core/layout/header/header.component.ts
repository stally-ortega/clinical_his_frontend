import { Component, inject, output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '../../../store/auth.store';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  public store = inject(AuthStore);
  private router = inject(Router);

  /** Emite evento para que el MainLayout abra/cierre el sidebar en mobile */
  mobileMenuToggle = output<void>();

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
}
