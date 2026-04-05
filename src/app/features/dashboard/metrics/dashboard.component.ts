import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface MetricaCard {
  icon: string;
  titulo: string;
  valor: string | number;
  subtitulo: string;
  colorClass: string;
}

@Component({
  selector: 'app-dashboard-metrics',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardMetricsComponent {
  readonly metricas: MetricaCard[] = [
    {
      icon: 'group',
      titulo: 'Pacientes Activos',
      valor: 42,
      subtitulo: 'Hospitalizados al momento',
      colorClass: 'card-teal'
    },
    {
      icon: 'pending_actions',
      titulo: 'Tareas Pendientes',
      valor: 12,
      subtitulo: 'En el turno actual',
      colorClass: 'card-amber'
    },
    {
      icon: 'calendar_view_week',
      titulo: 'Turno en Curso',
      valor: 'Mañana',
      subtitulo: '06:00 – 14:00 h',
      colorClass: 'card-sky'
    },
    {
      icon: 'event_available',
      titulo: 'Ingresos Hoy',
      valor: 7,
      subtitulo: 'Nuevas admisiones en 24h',
      colorClass: 'card-emerald'
    }
  ];
}
