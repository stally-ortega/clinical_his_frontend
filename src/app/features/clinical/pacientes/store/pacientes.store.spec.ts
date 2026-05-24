import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { PacientesStore } from './pacientes.store';
import { PacientesService } from '@features/clinical/pacientes/services/pacientes.service';
import { Router } from '@angular/router';
import { EstadoPaciente } from '@core/models/estado-paciente.enum';

describe('PacientesStore', () => {
  let store: InstanceType<typeof PacientesStore>;

  const mockPacientesService = {
    getPacientes: vi.fn(),
    getPacienteById: vi.fn(),
    getPacienteByDocumento: vi.fn(),
    registrarPaciente: vi.fn(),
    actualizarPaciente: vi.fn(),
  };

  const mockRouter = {
    navigate: vi.fn(() => Promise.resolve(true)),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PacientesStore,
        { provide: PacientesService, useValue: mockPacientesService },
        { provide: Router, useValue: mockRouter },
      ],
    });

    store = TestBed.inject(PacientesStore);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.clearAllMocks();
  });

  it('should have initial state', () => {
    expect(store.pacientes()).toEqual([]);
    expect(store.pacienteActivo()).toBeNull();
    expect(store.isLoading()).toBe(false);
    expect(store.isSaving()).toBe(false);
    expect(store.error()).toBeNull();
    expect(store.offset()).toBe(0);
    expect(store.limit()).toBe(12);
    expect(store.hasMore()).toBe(false);
    expect(store.search()).toBe('');
    expect(store.estado()).toBeNull();
    expect(store.activo()).toBe(true);
  });

  it('should update search signal and reset offset and pacientes list', () => {
    store.setSearch('Juan');
    expect(store.search()).toBe('Juan');
    expect(store.offset()).toBe(0);
    expect(store.pacientes()).toEqual([]);
  });

  it('should update activo filter and reset offset and pacientes list', () => {
    store.setActivoFilter(false);
    expect(store.activo()).toBe(false);
    expect(store.offset()).toBe(0);
    expect(store.pacientes()).toEqual([]);

    store.setActivoFilter(null);
    expect(store.activo()).toBeNull();
    expect(store.offset()).toBe(0);
  });

  it('should update estado filter and reset offset and pacientes list', () => {
    store.setEstadoFilter(EstadoPaciente.CRITICO);
    expect(store.estado()).toBe(EstadoPaciente.CRITICO);
    expect(store.offset()).toBe(0);
    expect(store.pacientes()).toEqual([]);
  });

  it('should reset all filters to initial values', () => {
    store.setSearch('test');
    store.setActivoFilter(false);
    store.setEstadoFilter(EstadoPaciente.GRAVE);

    store.resetFilters();

    expect(store.search()).toBe('');
    expect(store.estado()).toBeNull();
    expect(store.activo()).toBe(true);
    expect(store.offset()).toBe(0);
    expect(store.pacientes()).toEqual([]);
    expect(store.hasMore()).toBe(false);
  });

  it('should select active patient', () => {
    const paciente = {
      id: 1,
      documento: '123',
      nombres: 'Ana',
      apellidos: 'Garcia',
      edad: 30,
      sexo: 'F' as const,
      estado: EstadoPaciente.ESTABLE,
      activo: true,
      fecha_ingreso: '2026-01-01T00:00:00Z',
      fecha_registro: '2026-01-01T00:00:00Z',
    };

    store.seleccionarPaciente(paciente);
    expect(store.pacienteActivo()).toEqual(paciente);
  });
});
