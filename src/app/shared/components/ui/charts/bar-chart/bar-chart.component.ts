import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js';
import '../chart.registry';
import { ChartData } from '@features/dashboard/metrics/models/dashboard-metrics.interface';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule],
  template: `<canvas #canvas [attr.aria-label]="ariaLabel"></canvas>`,
  styleUrl: './bar-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarChartComponent implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input({ required: true }) data!: ChartData;
  @Input() ariaLabel = 'Gráfico de barras';
  @Input() height = 300;

  private chart?: Chart;

  ngAfterViewInit(): void {
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.chart) {
      this.updateChart();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
    this.chart = undefined;
  }

  private createChart(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx || !this.data?.labels?.length) return;

    const dpr = window.devicePixelRatio || 1;
    const parent = canvas.parentElement;
    const width = parent ? parent.clientWidth : canvas.clientWidth || 600;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${this.height}px`;
    canvas.width = width * dpr;
    canvas.height = this.height * dpr;

    const dataset = this.data.datasets[0];

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.data.labels,
        datasets: [
          {
            label: dataset?.label ?? '',
            data: dataset?.data ?? [],
            backgroundColor: dataset?.backgroundColor ?? '#0d9488',
            borderRadius: 4,
            barPercentage: 0.6,
          },
        ],
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            padding: 10,
            cornerRadius: 6,
            displayColors: false,
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#6b7280', font: { size: 12 } },
            border: { display: false },
          },
          y: {
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: { color: '#6b7280', font: { size: 12 } },
            border: { display: false },
            beginAtZero: true,
          },
        },
        animation: { duration: 800, easing: 'easeOutQuart' },
      },
    });
  }

  private updateChart(): void {
    if (!this.chart || !this.data) return;
    const dataset = this.data.datasets[0];
    this.chart.data.labels = this.data.labels;
    this.chart.data.datasets[0].data = dataset?.data ?? [];
    this.chart.data.datasets[0].label = dataset?.label ?? '';
    this.chart.data.datasets[0].backgroundColor = dataset?.backgroundColor ?? '#0d9488';
    this.chart.update();
  }
}
