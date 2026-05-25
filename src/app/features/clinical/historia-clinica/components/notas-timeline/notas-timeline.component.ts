import { Component, input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Nota } from '@core/models/evolucion.model';

@Component({
  selector: 'app-notas-timeline',
  standalone: true,
  imports: [CommonModule],
  providers: [DatePipe],
  templateUrl: './notas-timeline.component.html',
  styleUrl: './notas-timeline.component.scss'
})
export class NotasTimelineComponent {
  readonly notas = input<Nota[]>([]);
  readonly isLoading = input<boolean>(false);

  constructor(private readonly datePipe: DatePipe) {}

  formatoFechaHora(fechaIso: string): string {
    return this.datePipe.transform(fechaIso, 'dd/MM/yyyy HH:mm') ?? fechaIso;
  }
}
