import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartData } from '@features/dashboard/metrics/models/dashboard-metrics.interface';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule],
  template: `<canvas #canvas [attr.aria-label]="ariaLabel"></canvas>`,
  styleUrl: './bar-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarChartComponent implements AfterViewInit {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input({ required: true }) data!: ChartData;
  @Input() ariaLabel = 'Gráfico de barras';
  @Input() height = 300;

  ngAfterViewInit(): void {
    this.draw();
  }

  private draw(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx || !this.data?.labels?.length) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = this.height * dpr;
    ctx.scale(dpr, dpr);

    const padding = 40;
    const chartWidth = rect.width - padding * 2;
    const chartHeight = this.height - padding * 2;
    const labels = this.data.labels;
    const dataset = this.data.datasets[0];
    const values = dataset?.data ?? [];
    if (!values.length) return;

    const max = Math.max(...values, 1);
    const barWidth = (chartWidth / values.length) * 0.6;
    const gap = (chartWidth / values.length) * 0.4;

    // Background
    ctx.clearRect(0, 0, rect.width, this.height);

    // Grid lines
    ctx.strokeStyle = 'rgba(0,0,0,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + chartWidth, y);
      ctx.stroke();
    }

    // Bars
    const colors = Array.isArray(dataset.backgroundColor)
      ? dataset.backgroundColor
      : Array(values.length).fill(dataset.backgroundColor ?? '#0d9488');

    values.forEach((value, i) => {
      const x = padding + gap / 2 + i * (barWidth + gap);
      const barHeight = (value / max) * chartHeight;
      const y = padding + chartHeight - barHeight;

      ctx.fillStyle = colors[i] ?? '#0d9488';
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 4);
      ctx.fill();
    });

    // Labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    labels.forEach((label, i) => {
      const x = padding + gap / 2 + i * (barWidth + gap) + barWidth / 2;
      ctx.fillText(label, x, this.height - 10);
    });

    // Y-axis labels
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const value = Math.round((max / 5) * (5 - i));
      const y = padding + (chartHeight / 5) * i + 4;
      ctx.fillText(value.toString(), padding - 8, y);
    }
  }
}
