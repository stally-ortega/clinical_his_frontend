import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { TurnosStore } from './turnos.store';
import { TurnosService } from '@features/personal/logueo_turnos/services/turnos.service';
import { TurnoActivo, EstadoTurno } from '@core/models/turno.model';
import { of, throwError } from 'rxjs';

describe('TurnosStore', () => {
  let store: InstanceType<typeof TurnosStore>;

  const mockTurnoActivo: TurnoActivo = {
    id: 1,
    id_usuario: 42,
    fecha_inicio: '2026-05-24T08:00:00Z',
    fecha_fin: null,
    tipo_turno: 'MANANA',
    estado: 'EN_TURNO' as EstadoTurno,
  };

  const mockTurnosService = {
    iniciarTurno: vi.fn(),
    finalizarTurno: vi.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TurnosStore,
        { provide: TurnosService, useValue: mockTurnosService },
      ],
    });

    store = TestBed.inject(TurnosStore);
    vi.clearAllMocks();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should have initial state', () => {
    expect(store.estadoActual()).toBe('FUERA_TURNO');
    expect(store.turnoActivo()).toBeNull();
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBeNull();
    expect(store.hasTurnoActivo()).toBe(false);
  });

  it('should set estadoActual to EN_TURNO and turnoActivo on iniciar success', () => {
    mockTurnosService.iniciarTurno.mockReturnValue(of({ status: 'ok', data: mockTurnoActivo }));

    store.iniciar();

    // rxMethod + of() ejecuta sincrónicamente; isLoading ya es false aquí
    expect(store.estadoActual()).toBe('EN_TURNO');
    expect(store.turnoActivo()).toEqual(mockTurnoActivo);
    expect(store.hasTurnoActivo()).toBe(true);
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('should set error on iniciar failure', () => {
    mockTurnosService.iniciarTurno.mockReturnValue(
      throwError(() => ({ error: { message: 'Error de red' } }))
    );

    store.iniciar();

    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBe('No se pudo iniciar el turno');
    expect(store.estadoActual()).toBe('FUERA_TURNO');
    expect(store.hasTurnoActivo()).toBe(false);
  });

  it('should set estadoActual to FUERA_TURNO on finalizar success', () => {
    const turnoFinalizado: TurnoActivo = { ...mockTurnoActivo, estado: 'FUERA_TURNO' as EstadoTurno, fecha_fin: '2026-05-24T16:00:00Z' };
    mockTurnosService.finalizarTurno.mockReturnValue(of({ status: 'ok', data: turnoFinalizado }));

    store.finalizar();

    expect(store.estadoActual()).toBe('FUERA_TURNO');
    expect(store.turnoActivo()).toEqual(turnoFinalizado);
    expect(store.hasTurnoActivo()).toBe(false);
    expect(store.isLoading()).toBe(false);
  });

  it('should set error on finalizar failure', () => {
    mockTurnosService.finalizarTurno.mockReturnValue(
      throwError(() => ({ error: { message: 'Turno no encontrado' } }))
    );

    store.finalizar();

    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBe('No se pudo finalizar el turno');
    expect(store.estadoActual()).toBe('FUERA_TURNO');
  });
});
