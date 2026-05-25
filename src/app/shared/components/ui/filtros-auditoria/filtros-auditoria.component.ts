import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  DestroyRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { combineLatest, debounceTime, distinctUntilChanged, startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface FiltrosAuditoriaForm {
  search: string;
  startDate: string;
  endDate: string;
  modulo: string;
  usuarioId: string;
}

@Component({
  selector: 'app-filtros-auditoria',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './filtros-auditoria.component.html',
  styleUrl: './filtros-auditoria.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FiltrosAuditoriaComponent implements OnInit {
  private readonly fb = new FormBuilder();
  private readonly destroyRef = inject(DestroyRef);

  @Input() filtros: Partial<FiltrosAuditoriaForm> = {};

  @Output() readonly filtrosChange = new EventEmitter<Partial<FiltrosAuditoriaForm>>();
  @Output() readonly resetFiltros = new EventEmitter<void>();

  readonly moduloOptions = [
    { value: '', label: 'Todos los módulos' },
    { value: 'PACIENTES', label: 'Pacientes' },
    { value: 'CONFIGURACION', label: 'Configuración' },
    { value: 'TAREAS', label: 'Tareas' },
    { value: 'USUARIOS', label: 'Usuarios' },
    { value: 'AUDITORIA', label: 'Auditoría' },
  ];

  form!: FormGroup;

  ngOnInit(): void {
    this.form = this.fb.group<FiltrosAuditoriaForm>({
      search: this.filtros.search ?? '',
      startDate: this.filtros.startDate ?? '',
      endDate: this.filtros.endDate ?? '',
      modulo: this.filtros.modulo ?? '',
      usuarioId: this.filtros.usuarioId ?? '',
    });

    combineLatest({
      search: this.form.controls['search'].valueChanges.pipe(startWith(this.form.value.search)),
      startDate: this.form.controls['startDate'].valueChanges.pipe(startWith(this.form.value.startDate)),
      endDate: this.form.controls['endDate'].valueChanges.pipe(startWith(this.form.value.endDate)),
      modulo: this.form.controls['modulo'].valueChanges.pipe(startWith(this.form.value.modulo)),
      usuarioId: this.form.controls['usuarioId'].valueChanges.pipe(startWith(this.form.value.usuarioId)),
    })
      .pipe(
        debounceTime(400),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((value) => {
        this.filtrosChange.emit(value);
      });
  }

  onReset(): void {
    this.form.reset({
      search: '',
      startDate: '',
      endDate: '',
      modulo: '',
      usuarioId: '',
    });
    this.resetFiltros.emit();
  }
}
