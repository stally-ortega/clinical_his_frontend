import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { vi } from 'vitest';
import { KardexMatrizComponent } from './kardex-matriz.component';
import { Prescripcion } from '@features/clinical/kardex/services/kardex.service';

describe('KardexMatrizComponent', () => {
  let fixture: ComponentFixture<KardexMatrizComponent>;
  let component: KardexMatrizComponent;

  const mockPrescripciones: Prescripcion[] = [
    {
      id: 1,
      id_paciente: 10,
      medicamento: 'Paracetamol',
      dosis: 500,
      medida_dosis: 'mg',
      via_aplicacion: 'Oral',
      frecuencia_horas: 8,
      fecha_inicio: '2026-05-24T00:00:00Z',
      fecha_fin: '2026-05-25T00:00:00Z',
      estado: 'ACTIVA',
      dosis_programadas: [
        {
          id: 101,
          id_prescripcion: 1,
          fecha_hora_programada: '2026-05-24T08:00:00Z',
          fecha_hora_aplicacion: null,
          estado_dosis: 'PENDIENTE',
          observaciones: null,
          idempotency_key: null,
        },
        {
          id: 102,
          id_prescripcion: 1,
          fecha_hora_programada: '2026-05-24T16:00:00Z',
          fecha_hora_aplicacion: '2026-05-24T16:05:00Z',
          estado_dosis: 'APLICADA',
          observaciones: null,
          idempotency_key: 'uuid-1',
        },
      ],
    },
    {
      id: 2,
      id_paciente: 10,
      medicamento: 'Ibuprofeno',
      dosis: 400,
      medida_dosis: 'mg',
      via_aplicacion: 'Oral',
      frecuencia_horas: 12,
      fecha_inicio: '2026-05-24T00:00:00Z',
      fecha_fin: '2026-05-25T00:00:00Z',
      estado: 'ACTIVA',
      dosis_programadas: [
        {
          id: 201,
          id_prescripcion: 2,
          fecha_hora_programada: '2026-05-24T12:00:00Z',
          fecha_hora_aplicacion: null,
          estado_dosis: 'PENDIENTE',
          observaciones: null,
          idempotency_key: null,
        },
      ],
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KardexMatrizComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(KardexMatrizComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('prescripciones', []);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render empty state when no prescripciones', () => {
    fixture.componentRef.setInput('prescripciones', []);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.matriz-empty')).toBeTruthy();
  });

  it('should render table rows for each prescripcion', () => {
    fixture.componentRef.setInput('prescripciones', mockPrescripciones);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const rows = compiled.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
  });

  it('should map dosis to correct hour cell without index errors', () => {
    fixture.componentRef.setInput('prescripciones', mockPrescripciones);
    fixture.detectChanges();

    // Paracetamol tiene dosis a las 08:00 y 16:00
    const p1 = mockPrescripciones[0];
    expect(component.getCelda(p1, 8)?.id).toBe(101);
    expect(component.getCelda(p1, 16)?.id).toBe(102);
    expect(component.getCelda(p1, 0)).toBeNull();
    expect(component.getCelda(p1, 23)).toBeNull();

    // Ibuprofeno tiene dosis a las 12:00
    const p2 = mockPrescripciones[1];
    expect(component.getCelda(p2, 12)?.id).toBe(201);
    expect(component.getCelda(p2, 8)).toBeNull();
  });

  it('should emit aplicarDosis when clicking aplicar button with puedeAplicar true', () => {
    fixture.componentRef.setInput('prescripciones', mockPrescripciones);
    fixture.componentRef.setInput('puedeAplicar', true);
    fixture.detectChanges();

    const spy = vi.spyOn(component.aplicarDosis, 'emit');
    component.onAplicar(101);
    expect(spy).toHaveBeenCalledWith(101);
  });

  it('should not emit aplicarDosis when puedeAplicar is false', () => {
    fixture.componentRef.setInput('prescripciones', mockPrescripciones);
    fixture.componentRef.setInput('puedeAplicar', false);
    fixture.detectChanges();

    const spy = vi.spyOn(component.aplicarDosis, 'emit');
    component.onAplicar(101);
    expect(spy).not.toHaveBeenCalled();
  });

  it('should not emit aplicarDosis when idDosis is undefined', () => {
    fixture.componentRef.setInput('prescripciones', mockPrescripciones);
    fixture.componentRef.setInput('puedeAplicar', true);
    fixture.detectChanges();

    const spy = vi.spyOn(component.aplicarDosis, 'emit');
    component.onAplicar(undefined);
    expect(spy).not.toHaveBeenCalled();
  });
});
