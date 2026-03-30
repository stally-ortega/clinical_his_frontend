import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PacientesStore } from '../../store/pacientes.store';
import { ButtonComponent } from '../../../../../shared/components/ui/button/button.component';

@Component({
  selector: 'app-pacientes-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent],
  templateUrl: './pacientes-list.component.html',
  styleUrl: './pacientes-list.component.scss'
})
export class PacientesListComponent implements OnInit {
  public store = inject(PacientesStore);
  private router = inject(Router);

  ngOnInit(): void {
    // Al entrar al módulo se precargan los pacientes
    this.store.cargarPacientes();
  }

  goToCrear() {
    this.router.navigate(['/app/pacientes/nuevo']);
  }
}
