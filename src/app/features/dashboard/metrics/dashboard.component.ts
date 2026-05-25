import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardStore } from '@features/dashboard/metrics/store/dashboard.store';
import { KpiCardComponent } from '@shared/components/ui/kpi-card/kpi-card.component';
import { BarChartComponent } from '@shared/components/ui/charts/bar-chart/bar-chart.component';
import { LineChartComponent } from '@shared/components/ui/charts/line-chart/line-chart.component';
import { ChartData } from '@features/dashboard/metrics/models/dashboard-metrics.interface';
import { ExportacionService } from '@core/services/exportacion.service';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-dashboard-metrics',
  standalone: true,
  imports: [CommonModule, RouterLink, KpiCardComponent, BarChartComponent, LineChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardMetricsComponent implements OnInit {
  readonly store = inject(DashboardStore);
  private readonly exportacionService = inject(ExportacionService);
  private readonly toastService = inject(ToastService);

  readonly isExportando = signal(false);

  readonly barChartData: ChartData = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [
      {
        label: 'Ingresos',
        data: [4, 6, 3, 8, 5, 2, 7],
        backgroundColor: '#0d9488',
      },
    ],
  };

  readonly lineChartData: ChartData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    datasets: [
      {
        label: 'Ocupación de camas (%)',
        data: [65, 62, 78, 85, 80, 72],
        borderColor: '#0ea5e9',
        backgroundColor: '#0ea5e9',
        fill: true,
      },
    ],
  };

  ngOnInit(): void {
    this.store.loadDashboard();
  }

  exportarMetricasCsv(): void {
    if (this.isExportando()) return;
    this.isExportando.set(true);

    try {
      const metricas = this.store.metricas();
      const rows = [
        ['Título', 'Valor', 'Subtítulo', 'Tendencia'],
        ...metricas.map((m) => [
          String(m.titulo),
          String(m.valor),
          String(m.subtitulo),
          String(m.tendencia ?? ''),
        ]),
      ];
      this.exportacionService.descargarCsv(rows, `dashboard_metricas_${new Date().toISOString().slice(0, 10)}.csv`);
      this.toastService.success('Reporte CSV descargado');
    } catch (err) {
      this.toastService.error('Error al generar el reporte');
    } finally {
      this.isExportando.set(false);
    }
  }
}
