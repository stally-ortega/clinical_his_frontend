import { TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { EavFormBuilderService } from './eav-form-builder.service';
import { AtributoEAV } from '@core/models/eav.model';

describe('EavFormBuilderService', () => {
  let service: EavFormBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EavFormBuilderService);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('buildFormGroup', () => {
    it('should generate a FormGroup with exactly 5 controls from 5 attributes', () => {
      const atributos: AtributoEAV[] = [
        { id: 1, id_entidad: 1, nombre: 'torre', tipo_dato: 'texto', orden: 1, obligatorio: true },
        { id: 2, id_entidad: 1, nombre: 'piso', tipo_dato: 'texto', orden: 2, obligatorio: true },
        { id: 3, id_entidad: 1, nombre: 'habitacion', tipo_dato: 'texto', orden: 3, obligatorio: true },
        { id: 4, id_entidad: 1, nombre: 'cama', tipo_dato: 'texto', orden: 4, obligatorio: true },
        { id: 5, id_entidad: 1, nombre: 'observacion', tipo_dato: 'texto', orden: 5, obligatorio: false },
      ];

      const form = service.buildFormGroup(atributos);

      expect(form.contains('torre')).toBe(true);
      expect(form.contains('piso')).toBe(true);
      expect(form.contains('habitacion')).toBe(true);
      expect(form.contains('cama')).toBe(true);
      expect(form.contains('observacion')).toBe(true);
      expect(Object.keys(form.controls)).toHaveLength(5);
    });

    it('should rehydrate controls with valoresIniciales', () => {
      const atributos: AtributoEAV[] = [
        { id: 1, id_entidad: 1, nombre: 'torre', tipo_dato: 'texto', orden: 1, obligatorio: true },
        { id: 2, id_entidad: 1, nombre: 'piso', tipo_dato: 'texto', orden: 2, obligatorio: true },
      ];
      const valoresIniciales = { torre: 'Torre A', piso: 'Piso 3' };

      const form = service.buildFormGroup(atributos, valoresIniciales);

      expect(form.get('torre')?.value).toBe('Torre A');
      expect(form.get('piso')?.value).toBe('Piso 3');
    });

    it('should use empty string as default when no valoresIniciales provided', () => {
      const atributos: AtributoEAV[] = [
        { id: 1, id_entidad: 1, nombre: 'campo', tipo_dato: 'texto', orden: 1, obligatorio: false },
      ];

      const form = service.buildFormGroup(atributos);

      expect(form.get('campo')?.value).toBe('');
    });
  });

  describe('dynamic validators', () => {
    it('should inject Validators.required when obligatorio is true', () => {
      const atributos: AtributoEAV[] = [
        { id: 1, id_entidad: 1, nombre: 'requerido', tipo_dato: 'texto', orden: 1, obligatorio: true },
        { id: 2, id_entidad: 1, nombre: 'opcional', tipo_dato: 'texto', orden: 2, obligatorio: false },
      ];

      const form = service.buildFormGroup(atributos);
      const requiredControl = form.get('requerido') as FormControl;
      const optionalControl = form.get('opcional') as FormControl;

      requiredControl.setValue('');
      optionalControl.setValue('');

      expect(requiredControl.hasValidator(Validators.required)).toBe(true);
      expect(optionalControl.hasValidator(Validators.required)).toBe(false);
    });

    it('should invalidate the entire FormGroup when required EAV fields are empty', () => {
      const atributos: AtributoEAV[] = [
        { id: 1, id_entidad: 1, nombre: 'nombre', tipo_dato: 'texto', orden: 1, obligatorio: true },
        { id: 2, id_entidad: 1, nombre: 'documento', tipo_dato: 'texto', orden: 2, obligatorio: true },
        { id: 3, id_entidad: 1, nombre: 'edad', tipo_dato: 'numero', orden: 3, obligatorio: true },
      ];

      const form = service.buildFormGroup(atributos);

      expect(form.valid).toBe(false);

      form.patchValue({ nombre: 'Juan', documento: '12345', edad: '30' });

      expect(form.valid).toBe(true);
    });

    it('should add number pattern validator for tipo_dato numero', () => {
      const atributos: AtributoEAV[] = [
        { id: 1, id_entidad: 1, nombre: 'cantidad', tipo_dato: 'numero', orden: 1, obligatorio: false },
      ];

      const form = service.buildFormGroup(atributos);
      const control = form.get('cantidad') as FormControl;

      control.setValue('abc');
      expect(control.valid).toBe(false);

      control.setValue('42');
      expect(control.valid).toBe(true);

      control.setValue('-3.14');
      expect(control.valid).toBe(true);
    });
  });

  describe('sortAtributos', () => {
    it('should sort attributes by orden ascending', () => {
      const atributos: AtributoEAV[] = [
        { id: 3, id_entidad: 1, nombre: 'c', tipo_dato: 'texto', orden: 3, obligatorio: false },
        { id: 1, id_entidad: 1, nombre: 'a', tipo_dato: 'texto', orden: 1, obligatorio: false },
        { id: 2, id_entidad: 1, nombre: 'b', tipo_dato: 'texto', orden: 2, obligatorio: false },
      ];

      const sorted = service.sortAtributos(atributos);

      expect(sorted.map((a) => a.nombre)).toEqual(['a', 'b', 'c']);
    });

    it('should not mutate the original array', () => {
      const atributos: AtributoEAV[] = [
        { id: 2, id_entidad: 1, nombre: 'b', tipo_dato: 'texto', orden: 2, obligatorio: false },
        { id: 1, id_entidad: 1, nombre: 'a', tipo_dato: 'texto', orden: 1, obligatorio: false },
      ];

      service.sortAtributos(atributos);

      expect(atributos[0].nombre).toBe('b');
    });
  });

  describe('resolveInputType', () => {
    it('should map EAV data types to HTML input types', () => {
      expect(service.resolveInputType('numero')).toBe('number');
      expect(service.resolveInputType('booleano')).toBe('checkbox');
      expect(service.resolveInputType('fecha')).toBe('date');
      expect(service.resolveInputType('texto')).toBe('text');
      expect(service.resolveInputType('catalogo')).toBe('text');
    });
  });
});
