import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthStore } from '../../../../../store/auth.store';
import { TurnosStore } from '../../store/turnos.store';
import { ButtonComponent } from '../../../../../shared/components/ui/button/button.component';

@Component({
  selector: 'app-panel-turnos',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './panel-turnos.component.html',
  styleUrl: './panel-turnos.component.scss'
})
export class PanelTurnosComponent {
  public authStore = inject(AuthStore);
  public turnosStore = inject(TurnosStore);
  
  public timeObj = new Date();

  constructor() {
    // Para simplificar la fecha en el UI
    setInterval(() => {
      this.timeObj = new Date();
    }, 60000);
  }
}
