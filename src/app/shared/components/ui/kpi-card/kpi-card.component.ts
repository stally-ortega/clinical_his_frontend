import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kpi-card.component.html',
  styleUrl: './kpi-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KpiCardComponent {
  @Input({ required: true }) icon!: string;
  @Input({ required: true }) titulo!: string;
  @Input({ required: true }) valor!: string | number;
  @Input({ required: true }) subtitulo!: string;
  @Input() colorClass: string = 'card-teal';
  @Input() tendencia?: string;
}
