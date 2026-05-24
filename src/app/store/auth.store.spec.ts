import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { AuthStore } from './auth.store';
import { AuthService } from '@core/services/auth.service';
import { SessionTimeoutService } from '@core/services/session-timeout.service';
import { WebSocketService } from '@core/services/websocket.service';
import { Usuario } from '@core/models/auth.model';

describe('AuthStore', () => {
  let store: InstanceType<typeof AuthStore>;
  let mockAuthService: {
    getToken: ReturnType<typeof vi.fn>;
    getStoredUser: ReturnType<typeof vi.fn>;
    clearSession: ReturnType<typeof vi.fn>;
    saveSession: ReturnType<typeof vi.fn>;
    login: ReturnType<typeof vi.fn>;
  };
  let mockSessionTimeout: {
    iniciarMonitoreo: ReturnType<typeof vi.fn>;
    detenerMonitoreo: ReturnType<typeof vi.fn>;
  };
  let mockWebSocket: {
    conectar: ReturnType<typeof vi.fn>;
    desconectar: ReturnType<typeof vi.fn>;
  };
  let router: Router;

  beforeEach(() => {
    mockAuthService = {
      getToken: vi.fn(),
      getStoredUser: vi.fn(),
      clearSession: vi.fn(),
      saveSession: vi.fn(),
      login: vi.fn(),
    };
    mockSessionTimeout = {
      iniciarMonitoreo: vi.fn(),
      detenerMonitoreo: vi.fn(),
    };
    mockWebSocket = {
      conectar: vi.fn(),
      desconectar: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthStore,
        { provide: AuthService, useValue: mockAuthService },
        { provide: SessionTimeoutService, useValue: mockSessionTimeout },
        { provide: WebSocketService, useValue: mockWebSocket },
        provideRouter([]),
      ],
    });

    store = TestBed.inject(AuthStore);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.clearAllMocks();
  });

  it('should have initial state with unauthenticated user and null token', () => {
    expect(store.usuario()).toBeNull();
    expect(store.token()).toBeNull();
    expect(store.isAuthenticated()).toBe(false);
    expect(store.permisos()).toEqual([]);
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('should restore auth state from localStorage via checkAuth when token and user exist', () => {
    const mockUser: Usuario = {
      id: 1,
      nombres: 'Juan',
      apellidos: 'Pérez',
      documento: '123456',
      rol: 'MEDICO',
      permisos: ['VER_KARDEX', 'CREAR_RECETA'],
    };
    mockAuthService.getToken.mockReturnValue('abc123');
    mockAuthService.getStoredUser.mockReturnValue(mockUser);

    store.checkAuth();

    expect(store.token()).toBe('abc123');
    expect(store.usuario()).toEqual(mockUser);
    expect(store.isAuthenticated()).toBe(true);
    expect(store.permisos()).toEqual(['VER_KARDEX', 'CREAR_RECETA']);
    expect(mockSessionTimeout.iniciarMonitoreo).toHaveBeenCalledOnce();
    expect(mockWebSocket.conectar).toHaveBeenCalledOnce();
  });

  it('should not restore state when no token or user in localStorage', () => {
    mockAuthService.getToken.mockReturnValue(null);
    mockAuthService.getStoredUser.mockReturnValue(null);

    store.checkAuth();

    expect(store.isAuthenticated()).toBe(false);
    expect(store.usuario()).toBeNull();
    expect(store.token()).toBeNull();
    expect(store.permisos()).toEqual([]);
    expect(mockSessionTimeout.iniciarMonitoreo).not.toHaveBeenCalled();
    expect(mockWebSocket.conectar).not.toHaveBeenCalled();
  });

  it('should clear state and call services on logout', () => {
    const mockUser: Usuario = {
      id: 1,
      nombres: 'Juan',
      apellidos: 'Pérez',
      documento: '123456',
      rol: 'MEDICO',
      permisos: ['VER_KARDEX'],
    };
    mockAuthService.getToken.mockReturnValue('abc123');
    mockAuthService.getStoredUser.mockReturnValue(mockUser);
    store.checkAuth();

    store.logout();

    expect(mockSessionTimeout.detenerMonitoreo).toHaveBeenCalledOnce();
    expect(mockWebSocket.desconectar).toHaveBeenCalledOnce();
    expect(mockAuthService.clearSession).toHaveBeenCalledOnce();
    expect(store.usuario()).toBeNull();
    expect(store.token()).toBeNull();
    expect(store.isAuthenticated()).toBe(false);
    expect(store.permisos()).toEqual([]);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should compute hasPermission correctly based on current permissions', () => {
    const mockUser: Usuario = {
      id: 1,
      nombres: 'Juan',
      apellidos: 'Pérez',
      documento: '123456',
      rol: 'MEDICO',
      permisos: ['VER_KARDEX', 'CREAR_RECETA'],
    };
    mockAuthService.getToken.mockReturnValue('abc123');
    mockAuthService.getStoredUser.mockReturnValue(mockUser);
    store.checkAuth();

    expect(store.hasPermission()('VER_KARDEX')).toBe(true);
    expect(store.hasPermission()('CREAR_RECETA')).toBe(true);
    expect(store.hasPermission()('ELIMINAR_PACIENTE')).toBe(false);
  });
});
