import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpEvent, HttpHandlerFn } from '@angular/common/http';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { authInterceptor } from './auth.interceptor';
import { AuthStore } from '../../store/auth.store';

describe('authInterceptor', () => {
  const createMockStore = (token: string | null) => ({
    token: vi.fn(() => token),
  });

  const createMockNext = () =>
    vi.fn((req: HttpRequest<unknown>) => of({ type: 0 } as HttpEvent<unknown>));

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.clearAllMocks();
  });

  it('should clone request and add Authorization header when token exists', () => {
    const mockStore = createMockStore('fake-jwt');
    const mockNext = createMockNext();
    const req = new HttpRequest('GET', '/api/test');

    TestBed.configureTestingModule({
      providers: [{ provide: AuthStore, useValue: mockStore }],
    });

    TestBed.runInInjectionContext(() => {
      const result$ = authInterceptor(req, mockNext as unknown as HttpHandlerFn);
      result$.subscribe();
    });

    expect(mockNext).toHaveBeenCalledOnce();
    const clonedReq = mockNext.mock.calls[0][0] as HttpRequest<unknown>;
    expect(clonedReq.headers.get('Authorization')).toBe('Bearer fake-jwt');
    expect(clonedReq).not.toBe(req);
  });

  it('should pass request unchanged when no token', () => {
    const mockStore = createMockStore(null);
    const mockNext = createMockNext();
    const req = new HttpRequest('GET', '/api/test');

    TestBed.configureTestingModule({
      providers: [{ provide: AuthStore, useValue: mockStore }],
    });

    TestBed.runInInjectionContext(() => {
      const result$ = authInterceptor(req, mockNext as unknown as HttpHandlerFn);
      result$.subscribe();
    });

    expect(mockNext).toHaveBeenCalledOnce();
    const passedReq = mockNext.mock.calls[0][0] as HttpRequest<unknown>;
    expect(passedReq).toBe(req);
    expect(passedReq.headers.has('Authorization')).toBe(false);
  });
});
