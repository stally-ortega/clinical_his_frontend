import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

/** Tipo canónico del evento de timeline */
export interface TimelineEvento {
  id: number;
  fecha: string;
  tipo: 'NOTA' | 'EVOLUCION';
  autor: string;
  titulo: string;
  descripcion: string;
}

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.scss',
})
export class TimelineComponent {
  @Input({ required: true }) eventos: TimelineEvento[] = [];
}
