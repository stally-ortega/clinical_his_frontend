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
  selector: 'app-line-chart',
  standalone: true,
  imports: [CommonModule],
  template: `<canvas #canvas [attr.aria-label]="ariaLabel"></canvas>`,
  styleUrl: './line-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineChartComponent implements AfterViewInit {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input({ required: true }) data!: ChartData;
  @Input() ariaLabel = 'Gráfico de líneas';
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
    const min = Math.min(...values, 0);
    const range = max - min || 1;
    const stepX = chartWidth / (values.length - 1 || 1);

    ctx.clearRect(0, 0, rect.width, this.height);

    // Grid
    ctx.strokeStyle = 'rgba(0,0,0,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + chartWidth, y);
      ctx.stroke();
    }

    // Area fill
    ctx.beginPath();
    ctx.moveTo(padding, padding + chartHeight);
    values.forEach((value, i) => {
      const x = padding + i * stepX;
      const y = padding + chartHeight - ((value - min) / range) * chartHeight;
      if (i === 0) ctx.lineTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(padding + chartWidth, padding + chartHeight);
    ctx.closePath();
    ctx.fillStyle = dataset.backgroundColor
      ? (Array.isArray(dataset.backgroundColor) ? dataset.backgroundColor[0] : dataset.backgroundColor) + '20'
      : 'rgba(13, 148, 136, 0.12)';
    ctx.fill();

    // Line
    ctx.beginPath();
    values.forEach((value, i) => {
      const x = padding + i * stepX;
      const y = padding + chartHeight - ((value - min) / range) * chartHeight;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = Array.isArray(dataset.borderColor)
      ? dataset.borderColor[0]
      : (dataset.borderColor ?? '#0d9488');
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Points
    values.forEach((value, i) => {
      const x = padding + i * stepX;
      const y = padding + chartHeight - ((value - min) / range) * chartHeight;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = Array.isArray(dataset.borderColor)
        ? dataset.borderColor[0]
        : (dataset.borderColor ?? '#0d9488');
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // X labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    labels.forEach((label, i) => {
      const x = padding + i * stepX;
      ctx.fillText(label, x, this.height - 10);
    });

    // Y labels
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const value = Math.round(min + (range / 5) * (5 - i));
      const y = padding + (chartHeight / 5) * i + 4;
      ctx.fillText(value.toString(), padding - 8, y);
    }
  }
}
