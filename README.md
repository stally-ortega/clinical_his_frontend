# Clinical HIS — Frontend

> **Sistema de Información Hospitalaria** · Angular 21 SPA con arquitectura modular, estado reactivo con NgRx SignalStore y diseño Glassmorphism "Clinical Ethereal".

---

## 📋 Descripción del Proyecto

Clinical HIS es una aplicación web de gestión clínica hospitalaria orientada al personal médico y de enfermería. Permite administrar el censo de pacientes activos, registrar evoluciones médicas y notas de enfermería, gestionar turnos, kardex y tareas clínicas, todo bajo una interfaz moderna con soporte offline mediante Service Worker.

El frontend consume una API REST NestJS (`clinical_his_api`) y está diseñado para operar en entornos hospitalarios con conectividad intermitente, gracias a la capa de sincronización offline basada en Dexie (IndexedDB).

---

## 🛠 Stack Tecnológico

| Tecnología | Versión | Rol |
|---|---|---|
| [Angular](https://angular.dev) | 21.2.x | Framework principal (Standalone Components) |
| [NgRx SignalStore](https://ngrx.io/guide/signals) | 21.0.x | Gestión de estado reactivo basado en Signals |
| [RxJS](https://rxjs.dev) | 7.8.x | Programación reactiva (rxMethod, tapResponse) |
| [Angular Router](https://angular.dev/guide/routing) | 21.2.x | Enrutamiento con lazy loading por feature |
| [Angular Forms](https://angular.dev/guide/forms) | 21.2.x | Formularios reactivos (Reactive Forms) |
| [Angular Service Worker](https://angular.dev/ecosystem/service-workers) | 21.2.x | Soporte PWA y caché offline |
| [Dexie.js](https://dexie.org) | 4.3.x | Base de datos local IndexedDB para sincronización offline |
| [TypeScript](https://www.typescriptlang.org) | 5.9.x | Tipado estricto en todo el proyecto |
| [SCSS](https://sass-lang.com) | — | Sistema de estilos con variables CSS personalizadas |
| [Vitest](https://vitest.dev) | 4.x | Testing unitario |
| [Prettier](https://prettier.io) | 3.x | Formateo de código |
| [Bun](https://bun.sh) | 1.3.11 | Package manager (alternativa a npm/yarn) |

---

## 🏛 Arquitectura y Patrones

### Arquitectura General

El proyecto sigue una **arquitectura modular por features** combinada con **Atomic Design** para la capa de componentes:

```
Feature-Based Architecture
├── Cada feature es un módulo autocontenido con su propio:
│   ├── services/    → Capa de acceso a datos (HTTP)
│   ├── store/       → Estado local (NgRx SignalStore)
│   └── pages/       → Componentes de página (Smart Components)
│
└── Shared contiene componentes reutilizables organizados por
    complejidad (Atomic Design: atoms → molecules → organisms)
```

### Patrones Aplicados

| Patrón | Descripción |
|---|---|
| **Standalone Components** | Todos los componentes son independientes, sin NgModules |
| **Signal-Based State** | Estado local y global mediante Angular Signals + NgRx SignalStore |
| **Lazy Loading** | Cada feature se carga bajo demanda con `loadComponent` / `loadChildren` |
| **rxMethod + tapResponse** | Patrón NgRx para efectos reactivos con manejo de errores integrado |
| **Atomic Design** | Jerarquía de componentes UI: átomos → moléculas → organismos |
| **Repository Pattern** | Servicios HTTP encapsulan toda la lógica de comunicación con la API |
| **Auth Interceptor** | JWT adjuntado automáticamente en cada petición HTTP saliente |
| **Route Guards** | `authGuard` protege todas las rutas privadas de la aplicación |
| **CSS Grid Layout** | Layout principal mediante CSS Grid sin frameworks externos |
| **Glassmorphism (Design System)** | Sistema de diseño "Clinical Ethereal" con variables CSS globales |

---

## 📁 Estructura de Carpetas

```
clinical_his_frontend/
├── src/
│   ├── app/
│   │   │
│   │   ├── app.config.ts          # Configuración raíz: router, HttpClient, interceptors, SW
│   │   ├── app.routes.ts          # Rutas principales con lazy loading por feature
│   │   ├── app.ts                 # Componente raíz (bootstrapping)
│   │   │
│   │   ├── core/                  # Infraestructura transversal de la app
│   │   │   ├── guards/            # Route guards (authGuard)
│   │   │   ├── interceptors/      # HTTP interceptors (auth JWT)
│   │   │   ├── layout/            # Shell visual de la app
│   │   │   │   ├── header/        # TopNavBar: búsqueda, notificaciones, perfil
│   │   │   │   ├── sidebar/       # Navegación lateral colapsable
│   │   │   │   └── main-layout/   # CSS Grid container (sidebar + header + main)
│   │   │   ├── models/            # Interfaces y tipos compartidos globales
│   │   │   ├── offline_sync/      # Lógica de sincronización offline (Dexie/IndexedDB)
│   │   │   └── services/          # Servicios globales (auth, catálogos)
│   │   │
│   │   ├── features/              # Módulos de negocio (uno por dominio funcional)
│   │   │   ├── auth/              # Login, autenticación JWT
│   │   │   ├── dashboard/         # Panel principal con métricas clínicas
│   │   │   ├── pacientes/         # Gestión de pacientes activos (CRUD + historial)
│   │   │   │   ├── pages/         # Componentes de página (list, create)
│   │   │   │   ├── services/      # PacientesService (HTTP)
│   │   │   │   ├── store/         # PacientesStore (NgRx SignalStore)
│   │   │   │   └── pacientes.routes.ts
│   │   │   ├── historia-clinica/  # Historial clínico (evoluciones + notas)
│   │   │   │   ├── pages/         # HistoriaDetalleComponent (timeline + formularios)
│   │   │   │   ├── services/      # EvolucionesService, NotasService (HTTP)
│   │   │   │   └── store/         # HistoriaStore (NgRx SignalStore + forkJoin)
│   │   │   ├── clinical/          # Módulos clínicos (kardex, evoluciones, notas)
│   │   │   ├── admin/             # Administración del sistema
│   │   │   ├── personal/          # Gestión del personal médico
│   │   │   └── perfil/            # Perfil del usuario autenticado
│   │   │
│   │   ├── shared/                # Componentes, directivas y pipes reutilizables
│   │   │   ├── components/
│   │   │   │   ├── atoms/         # Elementos indivisibles (badge, avatar, chip...)
│   │   │   │   ├── molecules/     # Combinaciones simples de átomos
│   │   │   │   ├── organisms/     # Componentes complejos (timeline, tablas...)
│   │   │   │   ├── templates/     # Layouts de página reutilizables
│   │   │   │   └── ui/            # UI Kit principal
│   │   │   │       ├── button/    # <app-button> — variantes primary / outline
│   │   │   │       ├── form-input/# <app-form-input> — integración Reactive Forms
│   │   │   │       └── spinner/   # <app-spinner> — indicador de carga
│   │   │   ├── directives/        # Directivas Angular personalizadas
│   │   │   ├── pipes/             # Pipes de transformación de datos
│   │   │   └── utils/             # Funciones utilitarias compartidas
│   │   │
│   │   └── store/
│   │       └── auth.store.ts      # AuthStore global (NgRx SignalStore, providedIn: root)
│   │
│   ├── environments/
│   │   ├── environment.ts         # Configuración de producción
│   │   └── environment.development.ts # Configuración de desarrollo (fileReplacements)
│   │
│   ├── styles.scss                # Estilos globales y sistema de tokens CSS
│   └── index.html                 # Punto de entrada HTML
│
├── .angular/                      # Caché de compilación (ignorado por git)
├── .vscode/                       # Configuración del workspace VS Code
├── angular.json                   # Configuración del Angular CLI
├── package.json                   # Dependencias y scripts npm
├── tsconfig.json                  # Configuración TypeScript base
├── tsconfig.app.json              # Configuración TypeScript para la app
├── ngsw-config.json               # Configuración del Service Worker (PWA)
└── .gitignore
```

---

## ⚙️ Configuración

### Variables de Entorno

La aplicación configura la URL de la API a través de los archivos de entorno en `src/environments/`.

**`environment.ts`** (producción):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://tu-api.dominio.com/api/v1',  // 👈 Cambiar antes de desplegar
};
```

**`environment.development.ts`** (desarrollo local):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1',
};
```

> ⚠️ **Importante**: `angular.json` usa `fileReplacements` para sustituir automáticamente `environment.ts` por `environment.development.ts` en modo `development`. No se necesitan archivos `.env`.

### Requisitos Previos

| Herramienta | Versión mínima |
|---|---|
| Node.js | 22.x LTS |
| Bun | 1.3.x *(package manager configurado)* |
| Angular CLI | 21.x (`npm install -g @angular/cli`) |
| `clinical_his_api` | En ejecución en `localhost:3000` |

---

## 🚀 Instalación y Ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/stally-ortega/clinical_his_frontend.git
cd clinical_his_frontend
```

### 2. Instalar dependencias

```bash
# Con Bun (recomendado — configurado como packageManager)
bun install

# O con npm
npm install
```

### 3. Ejecutar en desarrollo

```bash
# Con Angular CLI directamente
ng serve

# O con npm
npm start
```

Abre el navegador en **`http://localhost:4200`**

> El servidor recarga automáticamente ante cualquier cambio en el código fuente.

### 4. Build de producción

```bash
ng build
# O
npm run build
```

Los artefactos se generan en `dist/clinical_his_frontend/`.

### 5. Ejecutar tests unitarios

```bash
ng test
# O
npm test
```

---

## 🏗 Despliegue

### Consideraciones Pre-Despliegue

1. **Actualizar `apiUrl`** en `src/environments/environment.ts` con la URL real del backend
2. **CORS**: asegurarse de que el backend permita peticiones desde el dominio del frontend
3. **HTTPS**: el Service Worker solo funciona en contextos seguros (HTTPS o localhost)
4. **Base href**: si se despliega en un subdirectorio, configurar `--base-href` en el build:

```bash
ng build --base-href /clinical-his/
```

### Despliegue en Servidor Estático (Nginx, Apache, Vercel, Netlify)

```bash
# 1. Build de producción
ng build --configuration production

# 2. Copiar contenido de dist/ al servidor web
# El archivo dist/clinical_his_frontend/browser/ contiene los assets finales
```

**Configuración Nginx recomendada** para Angular SPA (routing del lado del cliente):
```nginx
server {
    listen 80;
    root /var/www/clinical-his;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 🔐 Autenticación

La aplicación utiliza **JWT Bearer Token**:
- El token se almacena en `localStorage` tras el login
- El `AuthInterceptor` lo adjunta automáticamente en el header `Authorization` de cada petición HTTP
- El `AuthGuard` protege todas las rutas bajo `/app/**`
- El `AuthStore` (NgRx SignalStore global) mantiene el estado de sesión reactivo

---

## 🎨 Sistema de Diseño

El diseño **"Clinical Ethereal"** está basado en las siguientes variables CSS globales definidas en `src/styles.scss`:

```scss
--primary          // Dark Cyan (#006a6a) — color de marca principal
--primary-dim      // Variante más oscura para gradientes
--on-primary       // Texto sobre fondo primario
--error            // Rojo clínico para alertas
--surface-*        // Escala de fondos con opacidad
--font-headline    // Fuente para títulos (display)
--font-body        // Fuente para cuerpo de texto
--font-label       // Fuente para etiquetas y capslock
--radius-*         // Escala de border-radius (sm, md, lg, full, xl)
```

La clase utilitaria `.grain-overlay` aplica textura sutil sobre los paneles Glassmorphism.

---

## 📦 Dependencias Principales

### Runtime

| Paquete | Propósito |
|---|---|
| `@angular/core` | Framework principal y sistema de Signals |
| `@angular/router` | Enrutamiento SPA con lazy loading |
| `@angular/forms` | Formularios reactivos con validación |
| `@angular/service-worker` | PWA, caché offline y background sync |
| `@ngrx/signals` | SignalStore para gestión de estado reactivo |
| `@ngrx/operators` | `tapResponse` para manejo de efectos HTTP |
| `rxjs` | Streams reactivos (usado en `rxMethod`) |
| `dexie` | Wrapper de IndexedDB para persistencia local offline |
| `workbox-window` | Utilidades del Service Worker (Workbox) |

### DevDependencies

| Paquete | Propósito |
|---|---|
| `@angular/cli` | Tooling de Angular (build, serve, generate) |
| `@angular/build` | Builder oficial para Vite/esbuild |
| `typescript` | Compilador TypeScript |
| `vitest` | Test runner ultrarrápido |
| `prettier` | Formateo consistente de código |

---

## 🤝 Contribución

1. Haz un fork del repositorio
2. Crea una rama descriptiva: `git checkout -b feature/nombre-funcionalidad`
3. Haz commit de tus cambios: `git commit -m 'feat: descripción del cambio'`
4. Empuja la rama: `git push origin feature/nombre-funcionalidad`
5. Abre un Pull Request hacia `main`

---

## 📄 Licencia

Este es un proyecto de código abierto bajo la [Licencia MIT](./LICENSE). Siéntete libre de utilizarlo, modificarlo y distribuirlo de acuerdo con los términos de dicha licencia.
