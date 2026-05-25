import { Component, OnInit, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { KardexStore, KardexFiltro } from '@features/clinical/kardex/store/kardex.store';
import { TurnosStore } from '@features/personal/logueo_turnos/store/turnos.store';
import { ButtonComponent } from '@shared/components/ui/button/button.component';
import { KardexMatrizComponent } from '@features/clinical/kardex/components/kardex-matriz/kardex-matriz.component';

@Component({
  selector: 'app-kardex-paciente',
  standalone: true,
  imports: [CommonModule, ButtonComponent, KardexMatrizComponent],
  templateUrl: './kardex-paciente.component.html',
  styleUrl: './kardex-paciente.component.scss'
})
export class KardexPacienteComponent implements OnInit {
  readonly store = inject(KardexStore);
  readonly turnosStore = inject(TurnosStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  pacienteId = signal<number | null>(null);
  isOffline = signal<boolean>(!navigator.onLine);

  filtros: { key: KardexFiltro; label: string }[] = [
    { key: 'HOY', label: 'Hoy' },
    { key: 'AYER', label: 'Ayer' },
    { key: 'PENDIENTES', label: 'Solo pendientes' },
  ];

  @HostListener('window:offline')
  setOffline() {
    this.isOffline.set(true);
  }

  @HostListener('window:online')
  setOnline() {
    this.isOffline.set(false);
  }

  ngOnInit(): void {
    const idParam = Number(this.route.snapshot.paramMap.get('id'));
    if (!isNaN(idParam) && idParam > 0) {
      this.pacienteId.set(idParam);
      this.store.cargarKardex(idParam);
    } else {
      this.router.navigate(['/app/pacientes']);
    }
  }

  cambiarFiltro(filtro: KardexFiltro): void {
    this.store.setFiltro(filtro);
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
