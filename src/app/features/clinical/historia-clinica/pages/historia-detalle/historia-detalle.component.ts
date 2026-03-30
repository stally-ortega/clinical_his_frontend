import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { HistoriaStore } from '../../store/historia.store';
import { AuthStore } from '../../../../../store/auth.store';
import { TimelineComponent, TimelineEvento } from '../../../../../shared/components/organisms/timeline/timeline.component';
import { ButtonComponent } from '../../../../../shared/components/ui/button/button.component';
import { FormInputComponent } from '../../../../../shared/components/ui/form-input/form-input.component';

@Component({
  selector: 'app-historia-detalle',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TimelineComponent,
    ButtonComponent,
    FormInputComponent,
  ],
  templateUrl: './historia-detalle.component.html',
  styleUrl: './historia-detalle.component.scss',
})
export class HistoriaDetalleComponent implements OnInit {
  // ── Services & stores ────────────────────────────────────────────────────
  readonly store = inject(HistoriaStore);
  private readonly authStore = inject(AuthStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  // ── State ────────────────────────────────────────────────────────────────
  /** ID del paciente leído desde la URL */
  pacienteId = signal<number | null>(null);

  /** Controla qué formulario está activo: 'nota' | 'evolucion' */
  activeForm = signal<'nota' | 'evolucion'>('nota');

  // ── Forms ────────────────────────────────────────────────────────────────
  readonly notaForm: FormGroup = this.fb.group({
    titulo: ['', [Validators.required, Validators.minLength(3)]],
    descripcion: ['', [Validators.required, Validators.minLength(5)]],
  });

  readonly evolucionForm: FormGroup = this.fb.group({
    titulo: ['', [Validators.required, Validators.minLength(3)]],
    descripcion: ['', [Validators.required, Validators.minLength(5)]],
  });

  // ── Computed: timeline unificado ─────────────────────────────────────────
  /**
   * Mapea evoluciones y notas al formato TimelineEvento
   * y los ordena por fecha descendente (más reciente primero).
   */
  readonly eventosMapeados = computed<TimelineEvento[]>(() => {
    const evoluciones = this.store.evoluciones().map<TimelineEvento>((e) => ({
      id: e.id,
      fecha: e.fecha,
      tipo: 'EVOLUCION',
      autor: e.autor,
      titulo: e.titulo,
      descripcion: e.descripcion,
    }));

    const notas = this.store.notas().map<TimelineEvento>((n) => ({
      id: n.id + 100_000, // evita colisiones de id con evoluciones
      fecha: n.fecha,
      tipo: 'NOTA',
      autor: n.autor,
      titulo: n.titulo,
      descripcion: n.descripcion,
    }));

    return [...evoluciones, ...notas].sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
    );
  });

  // ── Lifecycle ────────────────────────────────────────────────────────────
  ngOnInit(): void {
    const idParam = Number(this.route.snapshot.paramMap.get('id'));
    if (!isNaN(idParam) && idParam > 0) {
      this.pacienteId.set(idParam);
      this.store.cargarHistorial(idParam);
    } else {
      this.router.navigate(['/app/pacientes']);
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  private get autorActual(): string {
    const u = this.authStore.usuario();
    return u ? `${u.nombres} ${u.apellidos}` : 'Profesional';
  }

  goBack(): void {
    this.router.navigate(['/app/pacientes']);
  }

  setActiveForm(form: 'nota' | 'evolucion'): void {
    this.activeForm.set(form);
  }

  // ── Submit handlers ──────────────────────────────────────────────────────
  submitNota(): void {
    if (this.notaForm.invalid || this.pacienteId() == null) {
      this.notaForm.markAllAsTouched();
      return;
    }
    const id = this.pacienteId()!;
    this.store.agregarNota({
      id_paciente: id,
      titulo: this.notaForm.value.titulo,
      descripcion: this.notaForm.value.descripcion,
      autor: this.autorActual,
      fecha: new Date().toISOString(),
    });
    this.notaForm.reset();
  }

  submitEvolucion(): void {
    if (this.evolucionForm.invalid || this.pacienteId() == null) {
      this.evolucionForm.markAllAsTouched();
      return;
    }
    const id = this.pacienteId()!;
    this.store.agregarEvolucion({
      id_paciente: id,
      titulo: this.evolucionForm.value.titulo,
      descripcion: this.evolucionForm.value.descripcion,
      autor: this.autorActual,
      fecha: new Date().toISOString(),
    });
    this.evolucionForm.reset();
  }
}
