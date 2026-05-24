import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Evolucion } from '@core/models/evolucion.model';
import { EstadoPaciente } from '@core/models/estado-paciente.enum';

@Component({
  selector: 'app-evoluciones-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './evoluciones-timeline.component.html',
  styleUrl: './evoluciones-timeline.component.scss',
})
export class EvolucionesTimelineComponent {
  readonly evoluciones = input.required<Evolucion[]>();

  estadoClass(estado: string): string {
    const map: Record<string, string> = {
      [EstadoPaciente.ESTABLE]: 'estado-badge--estable',
      [EstadoPaciente.REGULAR]: 'estado-badge--regular',
      [EstadoPaciente.GRAVE]: 'estado-badge--grave',
      [EstadoPaciente.CRITICO]: 'estado-badge--critico',
      [EstadoPaciente.OBSERVACION]: 'estado-badge--observacion',
      [EstadoPaciente.PRONOSTICO_RESERVADO]: 'estado-badge--reservado',
    };
    return map[estado] ?? 'estado-badge--default';
  }
}
