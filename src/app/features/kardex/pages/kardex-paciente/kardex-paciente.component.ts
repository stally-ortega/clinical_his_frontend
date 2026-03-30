import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { KardexStore } from '../../store/kardex.store';
import { ButtonComponent } from '../../../../shared/components/ui/button/button.component';

@Component({
  selector: 'app-kardex-paciente',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './kardex-paciente.component.html',
  styleUrl: './kardex-paciente.component.scss'
})
export class KardexPacienteComponent implements OnInit {
  // Services & Store
  readonly store = inject(KardexStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // State
  pacienteId = signal<number | null>(null);

  ngOnInit(): void {
    const idParam = Number(this.route.snapshot.paramMap.get('id'));
    if (!isNaN(idParam) && idParam > 0) {
      this.pacienteId.set(idParam);
      this.store.cargarKardex(idParam);
    } else {
      this.router.navigate(['/app/pacientes']);
    }
  }

  aplicarDosis(idDosis: number): void {
    const pId = this.pacienteId();
    if (pId) {
      this.store.marcarDosis({ idDosis, idPaciente: pId });
    }
  }

  goBack(): void {
    this.router.navigate(['/app/pacientes']);
  }
}
