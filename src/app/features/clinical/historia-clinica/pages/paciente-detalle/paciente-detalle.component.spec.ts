import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Directive, Input } from '@angular/core';
import { vi } from 'vitest';
import { PacienteDetalleComponent } from './paciente-detalle.component';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PacientesStore } from '@features/clinical/pacientes/store/pacientes.store';
import { EvolucionesStore } from '@features/clinical/historia-clinica/store/evoluciones.store';
import { AuthStore } from '@store/auth.store';
import { HasPermissionDirective } from '@shared/directives/has-permission.directive';

@Directive({
  selector: '[appHasPermission]',
  standalone: true,
})
class StubHasPermissionDirective {
  @Input() appHasPermission!: string;
}

describe('PacienteDetalleComponent', () => {
  const createMockActivatedRoute = (idParam: string | null) => ({
    snapshot: {
      paramMap: {
        get: vi.fn(() => idParam),
      },
    },
  });

  const mockPacientesStore = {
    cargarPacientePorId: vi.fn(),
    pacienteActivo: vi.fn(() => null),
    pacientes: vi.fn(() => []),
  };

  const mockEvolucionesStore = {
    cargarEvoluciones: vi.fn(),
    evoluciones: vi.fn(() => []),
    isSaving: vi.fn(() => false),
  };

  const mockAuthStore = {
    usuario: vi.fn(() => null),
  };

  const setup = async (idParam: string | null) => {
    TestBed.configureTestingModule({
      imports: [PacienteDetalleComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: createMockActivatedRoute(idParam) },
        { provide: PacientesStore, useValue: mockPacientesStore },
        { provide: EvolucionesStore, useValue: mockEvolucionesStore },
        { provide: AuthStore, useValue: mockAuthStore },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    TestBed.overrideComponent(PacienteDetalleComponent, {
      remove: { imports: [HasPermissionDirective] },
      add: { imports: [StubHasPermissionDirective] },
    });

    await TestBed.compileComponents();

    const fixture = TestBed.createComponent(PacienteDetalleComponent);
    const component = fixture.componentInstance;
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.detectChanges();
    return { fixture, component, router };
  };

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.clearAllMocks();
  });

  it('should redirect to /app/pacientes when route param id is invalid', async () => {
    const { router } = await setup('invalid');

    expect(router.navigate).toHaveBeenCalledWith(['/app/pacientes']);
    expect(mockPacientesStore.cargarPacientePorId).not.toHaveBeenCalled();
    expect(mockEvolucionesStore.cargarEvoluciones).not.toHaveBeenCalled();
  });

  it('should redirect to /app/pacientes when route param id is negative', async () => {
    const { router } = await setup('-5');

    expect(router.navigate).toHaveBeenCalledWith(['/app/pacientes']);
  });

  it('should redirect to /app/pacientes when route param id is null', async () => {
    const { router } = await setup(null);

    expect(router.navigate).toHaveBeenCalledWith(['/app/pacientes']);
  });

  it('should load patient and evolutions when route param id is valid', async () => {
    const { component, router } = await setup('42');

    expect(component.pacienteId()).toBe(42);
    expect(mockPacientesStore.cargarPacientePorId).toHaveBeenCalledWith(42);
    expect(mockEvolucionesStore.cargarEvoluciones).toHaveBeenCalledWith(42);
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
