import { Component, inject, input, output, computed, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Router } from '@angular/router';
import { AuthStore } from '../../../store/auth.store';
import { ConfiguracionStore } from '../../../features/admin/configuracion_global/store/configuracion.store';

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
export class SidebarComponent implements OnInit {
  public authStore = inject(AuthStore);
  private router = inject(Router);
  private configStore = inject(ConfiguracionStore);

  nombreHospital = computed(() => {
    const confs = this.configStore.configuraciones();
    if (!Array.isArray(confs)) return 'Centro Medico TEST';
    const config = confs.find((c) => c.clave === 'NOMBRE_HOSPITAL');
    return config && config.valor ? config.valor : 'Centro Medico TEST';
  });

  /** Estado de colapso: recibido del layout padre */
  isCollapsed = input(false);

  /** Emite cuando el usuario presiona el botón de colapsar */
  collapseToggle = output<void>();

  ngOnInit(): void {
    this.configStore.cargarConfiguraciones();
  }

  toggleCollapse(): void {
    this.collapseToggle.emit();
  }

  onAdmitPatient(): void {
    this.router.navigate(['/app/pacientes/nuevo']);
  }
}
