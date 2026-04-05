import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RolesStore } from '../../store/roles.store';
import { Rol, Permiso } from '../../services/roles.service';
import { ButtonComponent } from '../../../../../shared/components/ui/button/button.component';
import { FormInputComponent } from '../../../../../shared/components/ui/form-input/form-input.component';

@Component({
  selector: 'app-panel-roles',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, FormInputComponent],
  templateUrl: './panel-roles.component.html',
  styleUrl: './panel-roles.component.scss'
})
export class PanelRolesComponent implements OnInit {
  readonly store = inject(RolesStore);
  private readonly fb = inject(FormBuilder);

  // Formulario para crear nuevo rol
  readonly formNuevoRol: FormGroup = this.fb.group({
    nombre: ['', [Validators.required]],
    descripcion: ['', [Validators.required]]
  });
  readonly showNuevoRol = signal(false);

  // Estado local para los checkboxes marcados
  readonly seleccionados = signal<Set<number>>(new Set());

  // Rol seleccionado actualmente
  readonly rolActivo = computed(() => {
    const rId = this.store.selectedRolId();
    if (!rId) return null;
    return this.store.roles().find(r => r.id === rId) || null;
  });

  ngOnInit(): void {
    this.store.loadDatosBasicos();
  }

  onSeleccionarRol(rol: Rol): void {
    this.store.seleccionarRol(rol.id);
    this.showNuevoRol.set(false);
    
    // Inicializar los checkboxes con los permisos que ya tiene el rol
    const setIds = new Set<number>();
    if (rol.permisos && Array.isArray(rol.permisos)) {
      rol.permisos.forEach(p => setIds.add(typeof p === 'object' ? p.id : p));
    }
    this.seleccionados.set(setIds);
  }

  toggleNuevoRol(): void {
    this.showNuevoRol.set(!this.showNuevoRol());
    if (this.showNuevoRol()) {
      this.store.seleccionarRol(null);
      this.formNuevoRol.reset();
    }
  }

  onCrearRol(): void {
    if (this.formNuevoRol.valid) {
      this.store.crearRol(this.formNuevoRol.value);
      this.showNuevoRol.set(false);
    } else {
      this.formNuevoRol.markAllAsTouched();
    }
  }

  onTogglePermiso(permisoId: number, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    const currentSet = new Set(this.seleccionados());
    
    if (isChecked) {
      currentSet.add(permisoId);
    } else {
      currentSet.delete(permisoId);
    }
    this.seleccionados.set(currentSet);
  }

  hasPermiso(permisoId: number): boolean {
    return this.seleccionados().has(permisoId);
  }

  onGuardarPermisos(): void {
    const rolActual = this.rolActivo();
    if (rolActual) {
      const permisosIds = Array.from(this.seleccionados());
      this.store.guardarPermisos({ rolId: rolActual.id, permisosIds });
    }
  }

  // Agrupador visual de permisos por módulo
  get permisosAgrupados() {
    const grupos: { [modulo: string]: Permiso[] } = {};
    const todos = this.store.permisos() || [];
    
    todos.forEach(p => {
      const mod = p.modulo || 'OTROS';
      if (!grupos[mod]) grupos[mod] = [];
      grupos[mod].push(p);
    });
    
    return Object.keys(grupos).map(modulo => ({
      modulo,
      permisos: grupos[modulo]
    })).sort((a, b) => a.modulo.localeCompare(b.modulo));
  }
}
