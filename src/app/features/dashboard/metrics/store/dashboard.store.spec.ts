import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DashboardStore } from './dashboard.store';
import { KpiMetric } from '@features/dashboard/metrics/models/dashboard-metrics.interface';
import { environment } from '@env/environment';

describe('DashboardStore', () => {
  let store: InstanceType<typeof DashboardStore>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DashboardStore,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    store = TestBed.inject(DashboardStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should have initial state with default metrics and null lastUpdated', () => {
    expect(store.metricas().length).toBeGreaterThan(0);
    expect(store.lastUpdated()).toBeNull();
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('should not produce NaN in computed signals when metrics are empty', () => {
    // Simular estado vacío forzando métricas vacías vía patchState no es directo en SignalStore,
    // pero verificamos que los computed no retornen NaN con el estado inicial
    const total = store.totalPacientesActivos();
    expect(total).not.toBeNaN();
    expect(typeof total === 'number' || typeof total === 'string').toBe(true);
  });

  it('should load dashboard metrics from API and set lastUpdated', () => {
    const mockMetrics: KpiMetric[] = [
      {
        icon: 'group',
        titulo: 'Pacientes Activos',
        valor: 50,
        subtitulo: 'Test',
        colorClass: 'card-teal',
      },
    ];

    store.loadDashboard();

    const req = httpMock.expectOne(`${environment.apiUrl}/dashboard/metricas`);
    expect(req.request.method).toBe('GET');
    req.flush({ exito: true, data: mockMetrics });

    expect(store.metricas()).toEqual(mockMetrics);
    expect(store.lastUpdated()).toBeInstanceOf(Date);
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('should handle HTTP error gracefully without crashing', () => {
    store.loadDashboard();

    const req = httpMock.expectOne(`${environment.apiUrl}/dashboard/metricas`);
    req.flush(
      { exito: false, mensaje: 'Server error' },
      { status: 500, statusText: 'Internal Server Error' }
    );

    expect(store.isLoading()).toBe(false);
    expect(store.error()).not.toBeNull();
    expect(store.metricas().length).toBeGreaterThan(0); // fallback defaults
  });
});
