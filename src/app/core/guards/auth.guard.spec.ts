import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, provideRouter, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { vi } from 'vitest';
import { authGuard } from './auth.guard';
import { AuthStore } from '@store/auth.store';

describe('authGuard', () => {
  const runGuard = () => {
    return TestBed.runInInjectionContext(() =>
      authGuard(
        {} as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot,
      ),
    );
  };

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.clearAllMocks();
  });

  it('should return true when user is authenticated', () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthStore, useValue: { isAuthenticated: vi.fn(() => true) } },
      ],
    });

    const result = runGuard();
    expect(result).toBe(true);
  });

  it('should return UrlTree to /login when user is not authenticated', () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthStore, useValue: { isAuthenticated: vi.fn(() => false) } },
      ],
    });
    const router = TestBed.inject(Router);

    const result = runGuard();
    expect(result).toBeInstanceOf(UrlTree);
    expect(result).toEqual(router.createUrlTree(['/login']));
  });
});
