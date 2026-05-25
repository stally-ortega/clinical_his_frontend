import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Prescripcion, DosisProgramada } from '@features/clinical/kardex/services/kardex.service';

export interface KardexFila {
  medicamento: string;
  celdas: (DosisProgramada | null)[];
}

@Component({
  selector: 'app-kardex-matriz',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kardex-matriz.component.html',
  styleUrl: './kardex-matriz.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KardexMatrizComponent {
  readonly prescripciones = input.required<Prescripcion[]>();
  readonly isLoading = input<boolean>(false);
  readonly puedeAplicar = input<boolean>(true);

  readonly aplicarDosis = output<number>();

  readonly horas = Array.from({ length: 24 }, (_, i) => i);

  getCelda(p: Prescripcion, hora: number): DosisProgramada | null {
    return p.dosis_programadas?.find((d) => {
      const fecha = new Date(d.fecha_hora_programada);
      return fecha.getHours() === hora;
    }) ?? null;
  }

  onAplicar(idDosis: number | undefined): void {
    if (!idDosis || !this.puedeAplicar()) return;
    this.aplicarDosis.emit(idDosis);
  }
}
