import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditoriaStore } from '../../store/auditoria.store';

@Component({
  selector: 'app-panel-auditoria',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './panel-auditoria.component.html',
  styleUrl: './panel-auditoria.component.scss'
})
export class PanelAuditoriaComponent implements OnInit {
  public store = inject(AuditoriaStore);

  ngOnInit(): void {
    this.store.cargarLogs();
  }
}
