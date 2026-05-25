import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuditoriaStore } from '@features/admin/visor_auditoria/store/auditoria.store';
import { AuditoriaLog } from '@features/admin/visor_auditoria/models/auditoria.model';
import { JsonViewerComponent } from '@shared/components/ui/json-viewer/json-viewer.component';
import {
  FiltrosAuditoriaComponent,
  FiltrosAuditoriaForm,
} from '@shared/components/ui/filtros-auditoria/filtros-auditoria.component';
import { ToastService } from '@core/services/toast.service';
import { ExportacionService } from '@core/services/exportacion.service';

@Component({
  selector: 'app-panel-auditoria',
  standalone: true,
  imports: [CommonModule, FormsModule, JsonViewerComponent, FiltrosAuditoriaComponent],
  templateUrl: './panel-auditoria.component.html',
  styleUrl: './panel-auditoria.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelAuditoriaComponent implements OnInit {
  readonly store = inject(AuditoriaStore);
  private readonly toastService = inject(ToastService);
  private readonly exportacionService = inject(ExportacionService);

  private readonly searchSubject = new Subject<string>();

  modalAbierto = signal(false);
  logSeleccionado = signal<AuditoriaLog | null>(null);
  isExportando = signal(false);

  // Virtual scroll state
  private readonly ROW_HEIGHT = 60;
  private readonly BUFFER = 5;
  private readonly CONTAINER_HEIGHT = 500;

  scrollTop = signal(0);
  containerHeight = signal(this.CONTAINER_HEIGHT);

  readonly visibleStart = computed(() => {
    const start = Math.floor(this.scrollTop() / this.ROW_HEIGHT) - this.BUFFER;
    return Math.max(0, start);
  });

  readonly visibleEnd = computed(() => {
    const end =
      this.visibleStart() +
      Math.ceil(this.containerHeight() / this.ROW_HEIGHT) +
      this.BUFFER * 2;
    return Math.min(this.store.logs().length, end);
  });

  readonly visibleLogs = computed(() => {
    const logs = this.store.logs();
    return logs.slice(this.visibleStart(), this.visibleEnd());
  });

  readonly totalHeight = computed(() => this.store.logs().length * this.ROW_HEIGHT);

  readonly topPadding = computed(() => this.visibleStart() * this.ROW_HEIGHT);

  readonly bottomPadding = computed(() => {
    const visibleCount = this.visibleEnd() - this.visibleStart();
    return Math.max(0, this.totalHeight() - this.topPadding() - visibleCount * this.ROW_HEIGHT);
  });

  ngOnInit(): void {
    this.store.cargarLogs();

    this.searchSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntilDestroyed()
      )
      .subscribe((search) => {
        this.store.setFiltros({ search });
        this.store.cargarLogs();
      });
  }

  onSearchChange(valor: string): void {
    this.searchSubject.next(valor);
  }

  onFiltrosChange(filtros: Partial<FiltrosAuditoriaForm>): void {
    this.store.setFiltros({
      search: filtros.search,
      startDate: filtros.startDate,
      endDate: filtros.endDate,
    });
    this.store.cargarLogs();
  }

  onResetFiltros(): void {
    this.store.resetFiltros();
    this.store.cargarLogs();
  }

  onSort(field: string): void {
    const current = this.store.filtros();
    const newOrder =
      current.sortBy === field && current.sortOrder === 'asc' ? 'desc' : 'asc';
    this.store.setFiltros({ sortBy: field, sortOrder: newOrder });
    this.store.cargarLogs();
  }

  onTableScroll(event: Event): void {
    const target = event.target as HTMLElement;
    this.scrollTop.set(target.scrollTop);
    this.containerHeight.set(target.clientHeight);

    const isAtBottom =
      target.scrollHeight - target.scrollTop - target.clientHeight < 50;

    if (
      isAtBottom &&
      !this.store.isLoading() &&
      !this.store.isLoadingMore() &&
      this.store.hasMore()
    ) {
      const currentOffset = this.store.filtros().offset || 0;
      const limit = this.store.filtros().limit || 50;

      this.store.actualizarOffset(currentOffset + limit);
      this.store.cargarLogs();
    }
  }

  abrirModal(log: AuditoriaLog): void {
    this.logSeleccionado.set(log);
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
    this.logSeleccionado.set(null);
  }

  sortIcon(field: string): string {
    const current = this.store.filtros();
    if (current.sortBy !== field) return 'sort';
    return current.sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  async copiarAlPortapapeles(data: unknown): Promise<void> {
    if (data === undefined || data === null) {
      this.toastService.error('No hay contenido para copiar');
      return;
    }
    try {
      const jsonString = JSON.stringify(data, null, 2);
      await navigator.clipboard.writeText(jsonString);
      this.toastService.success('JSON copiado al portapapeles');
    } catch (err) {
      this.toastService.error('Error al copiar el contenido');
    }
  }

  exportarLogsJson(): void {
    if (this.isExportando()) return;
    this.isExportando.set(true);

    try {
      const logs = this.store.logs();
      this.exportacionService.descargarJson(
        logs,
        `auditoria_logs_${new Date().toISOString().slice(0, 10)}.json`
      );
      this.toastService.success('Archivo JSON descargado');
    } catch (err) {
      this.toastService.error('Error al generar el archivo');
    } finally {
      this.isExportando.set(false);
    }
  }
}
