import { Component, inject, OnInit, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MallaTurnosStore } from '../../store/malla-turnos.store';
import { UsuariosService } from '../../../../admin/usuarios_abm/services/usuarios.service';
import { Usuario } from '../../../../../core/models/auth.model';
import { ButtonComponent } from '../../../../../shared/components/ui/button/button.component';
import { FormInputComponent } from '../../../../../shared/components/ui/form-input/form-input.component';

@Component({
  selector: 'app-malla-calendario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, FormInputComponent],
  templateUrl: './malla-calendario.component.html',
  styleUrl: './malla-calendario.component.scss'
})
export class MallaCalendarioComponent implements OnInit {
  readonly store = inject(MallaTurnosStore);
  private readonly fb = inject(FormBuilder);
  private readonly usuariosService = inject(UsuariosService);

  readonly diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  readonly mesesNombre = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  // Estado del calendario a nivel vista
  readonly diasDelMes = signal<{fecha: Date, diaDelMes: number, inCurrentMonth: boolean}[]>([]);

  // Usuarios para el select
  usuarios = signal<Usuario[]>([]);

  // Panel lateral de programación
  showForm = signal(false);
  diaSeleccionado = signal<Date | null>(null);

  formTurno: FormGroup = this.fb.group({
    id_usuario: ['', Validators.required],
    tipo_turno: ['MANANA', Validators.required],
    fecha_inicio: ['', Validators.required],
    fecha_fin: ['', Validators.required]
  });

  // Efecto reactivo: cuadra la grilla según el mes actual y recarga el store
  constructor() {
    effect(() => {
      const mes = this.store.mesActual();
      const anio = this.store.anioActual();
      this.store.cargarMalla({ mes, anio });
      this.generarGrilla(mes, anio);
    }, { allowSignalWrites: true });

    // Cuando el save es exitoso, cierra el panel lateral y refresca
    effect(() => {
      if (this.store.successMessage()) {
        this.showForm.set(false);
        const mes = this.store.mesActual();
        const anio = this.store.anioActual();
        this.store.cargarMalla({ mes, anio });
      }
    });
  }

  ngOnInit() {
    this.usuariosService.getUsuarios().subscribe({
      next: (res: any) => {
        const list = res.data || res || [];
        this.usuarios.set(list);
      }
    });
  }

  navegarMes(incremento: number) {
    this.store.cambiarMes(incremento);
  }

  generarGrilla(mes: number, anio: number) {
    const dias = [];
    const primerDiaDelMes = new Date(anio, mes - 1, 1);
    const ultimoDiaDelMes = new Date(anio, mes, 0);

    // Padding anterior
    const primerDiaSemana = primerDiaDelMes.getDay();
    for (let i = primerDiaSemana - 1; i >= 0; i--) {
      const d = new Date(anio, mes - 1, -i);
      dias.push({ fecha: d, diaDelMes: d.getDate(), inCurrentMonth: false });
    }

    // Días del mes
    for (let i = 1; i <= ultimoDiaDelMes.getDate(); i++) {
      const d = new Date(anio, mes - 1, i);
      dias.push({ fecha: d, diaDelMes: i, inCurrentMonth: true });
    }

    // Padding posterior
    const paddingFinal = 42 - dias.length; // Asegura 6 filas exactas (7x6)
    for (let i = 1; i <= paddingFinal; i++) {
      const d = new Date(anio, mes, i);
      dias.push({ fecha: d, diaDelMes: i, inCurrentMonth: false });
    }

    this.diasDelMes.set(dias);
  }

  abrirProgramacion(diaInfo?: {fecha: Date}) {
    if (diaInfo) {
      this.diaSeleccionado.set(diaInfo.fecha);
      const isoDate = diaInfo.fecha.toISOString().split('T')[0];
      this.formTurno.patchValue({
        fecha_inicio: isoDate,
        fecha_fin: isoDate
      });
    } else {
      this.diaSeleccionado.set(null);
      this.formTurno.reset({ tipo_turno: 'MANANA' });
    }
    this.showForm.set(true);
  }

  cerrarProgramacion() {
    this.showForm.set(false);
  }

  onSubmit() {
    if (this.formTurno.valid) {
      this.store.asignarTurno({
        id_usuario: Number(this.formTurno.value.id_usuario),
        tipo_turno: this.formTurno.value.tipo_turno,
        fecha_inicio: this.formTurno.value.fecha_inicio,
        fecha_fin: this.formTurno.value.fecha_fin
      });
    } else {
      this.formTurno.markAllAsTouched();
    }
  }

  getTurnosPorDia(dia: Date) {
    // Retorna los turnos que ocurren en este día
    const isoDia = dia.toISOString().split('T')[0];
    return this.store.turnosProgramados().filter(t => t.fecha_inicio.startsWith(isoDia) || t.fecha_inicio === isoDia);
  }

  getNombreUsuario(id: number): string {
    const u = this.usuarios().find(user => user.id === id);
    if (!u) return 'Usuario';
    return `${u.nombres?.split(' ')[0]} ${u.apellidos?.split(' ')[0]}`;
  }
}
