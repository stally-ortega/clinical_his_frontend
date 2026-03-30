import { Component, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Router } from '@angular/router';
import { AuthStore } from '../../../store/auth.store';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  host: {
    '[class.collapsed]': 'isCollapsed()',
    '[class.sidebar-host]': 'true'
  }
})
export class SidebarComponent {
  public authStore = inject(AuthStore);
  private router = inject(Router);

  /** Estado de colapso: recibido del layout padre */
  isCollapsed = input(false);

  /** Emite cuando el usuario presiona el botón de colapsar */
  collapseToggle = output<void>();

  toggleCollapse(): void {
    this.collapseToggle.emit();
  }

  onAdmitPatient(): void {
    this.router.navigate(['/app/pacientes/nuevo']);
  }
}
