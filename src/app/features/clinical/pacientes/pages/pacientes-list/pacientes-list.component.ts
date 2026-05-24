import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PacientesStore } from '@features/clinical/pacientes/store/pacientes.store';
import { ButtonComponent } from '@shared/components/ui/button/button.component';
import { EstadoPaciente } from '@core/models/estado-paciente.enum';

@Component({
  selector: 'app-pacientes-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent],
  templateUrl: './pacientes-list.component.html',
  styleUrl: './pacientes-list.component.scss'
})
export class PacientesListComponent implements OnInit {
  readonly store = inject(PacientesStore);
  private readonly router = inject(Router);

  readonly estados = Object.values(EstadoPaciente);

  ngOnInit(): void {
    this.store.resetFilters();
    this.store.cargarPacientes();
  }

  onSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.store.setSearch(query);
    this.store.cargarPacientes();
  }

  onToggleActivo(activo: boolean | null): void {
    this.store.setActivoFilter(activo);
    this.store.cargarPacientes();
  }

  onSelectEstado(estado: EstadoPaciente | null): void {
    this.store.setEstadoFilter(estado);
    this.store.cargarPacientes();
  }

  loadNextPage(): void {
    this.store.loadNextPage();
    this.store.cargarPacientes();
  }

  goToCrear(): void {
    this.router.navigate(['/app/pacientes/nuevo']);
  }

  estadoClass(estado: string): string {
    const map: Record<string, string> = {
      [EstadoPaciente.ESTABLE]: 'status-chip--estable',
      [EstadoPaciente.REGULAR]: 'status-chip--regular',
      [EstadoPaciente.GRAVE]: 'status-chip--grave',
      [EstadoPaciente.CRITICO]: 'status-chip--critico',
      [EstadoPaciente.OBSERVACION]: 'status-chip--observacion',
      [EstadoPaciente.PRONOSTICO_RESERVADO]: 'status-chip--reservado',
    };
    return map[estado] ?? 'status-chip--default';
  }

  diasHospitalizacion(fechaIngreso: string): number {
    const start = new Date(fechaIngreso);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }
}
