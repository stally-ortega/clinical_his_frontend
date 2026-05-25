import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PacientesStore } from '@features/clinical/pacientes/store/pacientes.store';
import { EvolucionesStore } from '@features/clinical/historia-clinica/store/evoluciones.store';
import { NotasStore } from '@features/clinical/historia-clinica/store/notas.store';
import { EvolucionFormComponent } from '@features/clinical/historia-clinica/components/evolucion-form/evolucion-form.component';
import { EvolucionesTimelineComponent } from '@features/clinical/historia-clinica/components/evoluciones-timeline/evoluciones-timeline.component';
import { NotaEnfermeriaFormComponent } from '@features/clinical/historia-clinica/components/nota-enfermeria-form/nota-enfermeria-form.component';
import { NotasTimelineComponent } from '@features/clinical/historia-clinica/components/notas-timeline/notas-timeline.component';
import { ButtonComponent } from '@shared/components/ui/button/button.component';
import { ConfirmDialogComponent } from '@shared/components/ui/confirm-dialog/confirm-dialog.component';
import { EstadoPaciente } from '@core/models/estado-paciente.enum';
import { HasPermissionDirective } from '@shared/directives/has-permission.directive';
import { AuthStore } from '@store/auth.store';

type Tab = 'evoluciones' | 'kardex' | 'notas';

@Component({
  selector: 'app-paciente-detalle',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonComponent,
    ConfirmDialogComponent,
    EvolucionFormComponent,
    EvolucionesTimelineComponent,
    NotaEnfermeriaFormComponent,
    NotasTimelineComponent,
    HasPermissionDirective,
  ],
  templateUrl: './paciente-detalle.component.html',
  styleUrl: './paciente-detalle.component.scss',
})
export class PacienteDetalleComponent implements OnInit {
  readonly pacientesStore = inject(PacientesStore);
  readonly evolucionesStore = inject(EvolucionesStore);
  readonly notasStore = inject(NotasStore);
  private readonly authStore = inject(AuthStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  pacienteId = signal<number | null>(null);
  activeTab = signal<Tab>('evoluciones');
  confirmacionAbierta = signal<boolean>(false);
  datosEvolucionPendientes = signal<{ titulo: string; descripcion: string; estado_paciente: EstadoPaciente } | null>(null);

  readonly paciente = computed(() => {
    const id = this.pacienteId();
    if (id == null) return null;
    const activo = this.pacientesStore.pacienteActivo();
    if (activo && activo.id === id) return activo;
    return this.pacientesStore.pacientes().find((p) => p.id === id) ?? null;
  });

  readonly diasHospitalizacion = computed(() => {
    const p = this.paciente();
    if (!p?.fecha_ingreso) return 0;
    const start = new Date(p.fecha_ingreso);
    const now = new Date();
    return Math.max(0, Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  });

  readonly puedeRegistrarEvolucion = computed(() => {
    const p = this.paciente();
    return p?.activo === true;
  });

  ngOnInit(): void {
    const idParam = Number(this.route.snapshot.paramMap.get('id'));
    if (isNaN(idParam) || idParam <= 0) {
      this.router.navigate(['/app/pacientes']);
      return;
    }
    this.pacienteId.set(idParam);
    this.pacientesStore.cargarPacientePorId(idParam);
    this.evolucionesStore.cargarEvoluciones(idParam);
    this.notasStore.cargarNotas(idParam);
  }

  setTab(tab: Tab): void {
    this.activeTab.set(tab);
  }

  goBack(): void {
    this.router.navigate(['/app/pacientes']);
  }

  onSubmitEvolucion(data: { titulo: string; descripcion: string; estado_paciente: EstadoPaciente }): void {
    this.datosEvolucionPendientes.set(data);
    this.confirmacionAbierta.set(true);
  }

  confirmarEvolucion(): void {
    const data = this.datosEvolucionPendientes();
    const id = this.pacienteId();
    if (!data || id == null) return;
    this.evolucionesStore.agregarEvolucion({
      id_paciente: id,
      ...data,
      autor: this.autorActual,
      fecha: new Date().toISOString(),
    });
    this.confirmacionAbierta.set(false);
    this.datosEvolucionPendientes.set(null);
  }

  cancelarConfirmacion(): void {
    this.confirmacionAbierta.set(false);
    this.datosEvolucionPendientes.set(null);
  }

  onSubmitNota(data: { titulo: string; descripcion: string }): void {
    const id = this.pacienteId();
    if (id == null) return;
    this.notasStore.agregarNota({
      id_paciente: id,
      ...data,
      autor: this.autorActual,
      fecha: new Date().toISOString(),
    });
  }

  private get autorActual(): string {
    const u = this.authStore.usuario();
    return u ? `${u.nombres} ${u.apellidos}` : 'Profesional';
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

  ubicacionTexto(valores: Record<string, string> | undefined): string {
    if (!valores || Object.keys(valores).length === 0) return 'Sin asignar';
    return Object.values(valores).join(' / ');
  }
}
