import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  /** Controla si el sidebar (overlay) está abierto en mobile */
  mobileMenuOpen = signal(false);

  /** Estado de colapso del sidebar (compartido entre layout y sidebar) */
  sidebarCollapsed = signal(false);

  onMobileMenuToggle(): void {
    this.mobileMenuOpen.update(v => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  onSidebarToggle(): void {
    this.sidebarCollapsed.update(v => !v);
  }
}
