import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tarea } from '@features/dashboard/tareas/services/tareas.service';
import { ButtonComponent } from '@shared/components/ui/button/button.component';

@Component({
  selector: 'app-tarea-card',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './tarea-card.component.html',
  styleUrl: './tarea-card.component.scss'
})
export class TareaCardComponent {
  readonly tarea = input.required<Tarea>();
  readonly puedeCompletar = input<boolean>(true);
  readonly tooltipDisabled = input<string>('');

  readonly completar = output<{ id: number; observaciones: string }>();

  observaciones = '';

  onCompletar(): void {
    if (!this.puedeCompletar()) return;
    this.completar.emit({ id: this.tarea().id, observaciones: this.observaciones });
    this.observaciones = '';
  }

  onObservacionesChange(event: Event): void {
    this.observaciones = (event.target as HTMLInputElement)?.value ?? '';
  }
}
