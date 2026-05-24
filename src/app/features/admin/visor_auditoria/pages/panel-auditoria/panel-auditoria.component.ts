import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuditoriaStore } from '@features/admin/visor_auditoria/store/auditoria.store';
import { AuditoriaLog } from '@features/admin/visor_auditoria/services/auditoria.service';
import { JsonViewerComponent } from '@shared/components/ui/json-viewer/json-viewer.component';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-panel-auditoria',
  standalone: true,
  imports: [CommonModule, FormsModule, JsonViewerComponent],
  templateUrl: './panel-auditoria.component.html',
  styleUrl: './panel-auditoria.component.scss'
})
export class PanelAuditoriaComponent implements OnInit {
  public store = inject(AuditoriaStore);
  private readonly toastService = inject(ToastService);

  private readonly searchSubject = new Subject<string>();
  private readonly destroyRef = inject(DestroyRef);

  modalAbierto = signal(false);
  logSeleccionado = signal<AuditoriaLog | null>(null);

  ngOnInit(): void {
    this.store.cargarLogs();

    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((search) => {
      this.store.setFiltros({ search });
      this.store.cargarLogs();
    });
  }

  onSearchChange(valor: string): void {
    this.searchSubject.next(valor);
  }

  onFechaChange(tipo: 'startDate' | 'endDate', valor: string): void {
    this.store.setFiltros({ [tipo]: valor });
    this.store.cargarLogs();
  }

  onSort(field: string): void {
    const current = this.store.filtros();
    const newOrder = current.sortBy === field && current.sortOrder === 'asc' ? 'desc' : 'asc';
    this.store.setFiltros({ sortBy: field, sortOrder: newOrder });
    this.store.cargarLogs();
  }

  onTableScroll(event: Event): void {
    const target = event.target as HTMLElement;
    const isAtBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 50;

    if (isAtBottom && !this.store.isLoading() && !this.store.isLoadingMore() && this.store.hasMore()) {
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
}
