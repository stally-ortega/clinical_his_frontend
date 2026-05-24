import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, provideRouter, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { vi } from 'vitest';
import { permissionGuard } from './permission.guard';
import { AuthStore } from '../../store/auth.store';

describe('permissionGuard', () => {
  const runGuard = (route: ActivatedRouteSnapshot) => {
    return TestBed.runInInjectionContext(() =>
      permissionGuard(route, {} as RouterStateSnapshot),
    );
  };

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.clearAllMocks();
  });

  it('should return true when user has the required single permission', () => {
    const mockStore = {
      hasPermission: vi.fn(() => (codigo: string) => codigo === 'VER_KARDEX'),
      hasAnyPermission: vi.fn(() => (codigos: string[]) => codigos.includes('VER_KARDEX')),
    };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthStore, useValue: mockStore },
      ],
    });

    const route = { data: { permission: 'VER_KARDEX' } } as unknown as ActivatedRouteSnapshot;
    const result = runGuard(route);
    expect(result).toBe(true);
  });

  it('should return UrlTree to /app/dashboard when permission is missing', () => {
    const mockStore = {
      hasPermission: vi.fn(() => () => false),
      hasAnyPermission: vi.fn(() => () => false),
    };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthStore, useValue: mockStore },
      ],
    });
    const router = TestBed.inject(Router);

    const route = { data: { permission: 'VER_KARDEX' } } as unknown as ActivatedRouteSnapshot;
    const result = runGuard(route);
    expect(result).toBeInstanceOf(UrlTree);
    expect(result).toEqual(router.createUrlTree(['/app/dashboard']));
  });
});
