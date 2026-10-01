# exodex

Visor web de exoplanetas. Consulta el catalogo publico de la NASA Exoplanet Archive, lo normaliza y
lo publica con filtros, ordenacion, paginacion y fichas de planeta y de sistema.

Monorepo **Nx** con una aplicacion **Angular** y una API **NestJS**.

## 1. Que es

`exodex` es una aplicacion web de solo lectura sobre el catalogo de exoplanetas de la NASA. No tiene
cuentas de usuario, ni base de datos, ni pagos: descarga el catalogo, lo cachea en memoria y en disco,
y lo sirve como API JSON consumida por una SPA de Angular.

Cuando la API no responde, la web cae a un conjunto de datos de ejemplo para que la interfaz siga
siendo usable.

## 2. Estado

| | |
|---|---|
| Version | sin etiqueta de version en `package.json`; la imagen es `node:22-alpine` |
| Estado funcional | Operativo. `nx build` en verde |
| Puertas | `build` verde · `lint` rojo (3 de 8 proyectos) · `test` rojo (4 de 5, no hay tests) |
| Duplicidad | 1.28 % (179 de 13 932 lineas), acotada con linea base |
| Tests unitarios | **0**. No hay ni un `*.spec.ts` en el workspace |
| Documentacion | `ARCHITECTURE.md`, `docs/adr/`, `docs/operations/` |

El detalle de por que fallan las puertas y como se clasifica cada fallo esta en
[`docs/operations/quality-gates.md`](docs/operations/quality-gates.md).

## 3. Stack

Versiones leidas de `package.json` (raiz). Monorepo Nx, sin `scripts` en la raiz: todo se ejecuta
por target Nx.

**Runtime y servidor**

| Paquete | Version | Rol |
|---|---|---|
| `@nestjs/core` | `^11.0.0` | Nucleo de la API |
| `@nestjs/common` | `^11.0.0` | Modulos, controlador, providers |
| `@nestjs/platform-express` | `^11.0.0` | Adaptador HTTP |
| `@nestjs/config` | `^4.0.3` | Configuracion por entorno (`ConfigService`) |
| `express` | `^4.21.2` | Middleware HTTP; `compression ^1.8.1` para gzip |
| `axios` | `^1.13.6` | Cliente HTTP contra la NASA TAP |
| `rxjs` | `^7.8.0` | Observables |
| `reflect-metadata` | `^0.1.13` | Requerido por los decoradores de NestJS |

**Front**

| Paquete | Version | Rol |
|---|---|---|
| `@angular/core` | `~21.2.0` | Framework de la web (standalone, SSR) |
| `@angular/router` | `~21.2.0` | Rutas con `loadComponent` |
| `@angular/common` | `~21.2.0` | Directivas y pipes |
| `@angular/forms` | `~21.2.0` | Formularios |
| `@angular/platform-browser` | `~21.2.0` | Render en navegador |
| `@angular/platform-server` | `~21.2.0` | Render en servidor |
| `@angular/ssr` | `~21.2.0` | Entrada de SSR |
| `@angular/animations` | `^21.2.6` | Animaciones |
| `@ngx-translate/core` | `^17.0.0` | i18n |
| `@ngx-translate/http-loader` | `^17.0.0` | Loader HTTP de traducciones |

**Tooling**

| Paquete | Version | Rol |
|---|---|---|
| `nx` (via `@nx/devkit`) | `22.6.2` | Orquestador del monorepo, cache e inferencia de targets |
| `@nx/angular` / `@nx/nest` | `^22.6.2` | Plugins de Nx para Angular y NestJS |
| `typescript` | `~5.9.2` | Compilador |
| `jest` + `jest-preset-angular` | `^30.0.2` / `~16.0.0` | Runner de tests (sin tests que correr) |
| `vitest` | `^4.0.8` | Runner de tests de `apps/web` (sin tests que correr) |
| `@playwright/test` | `^1.36.0` | E2E |
| `eslint` + `typescript-eslint` | `^9.8.0` / `^8.40.0` | Lint (flat config) |
| `angular-eslint` | `^21.2.0` | Reglas de lint de Angular |
| `prettier` | `~3.6.2` | Formato (`singleQuote: true`) |
| `webpack-cli` | `^5.1.4` | Bundler de la API |

## 4. Prerrequisitos

| Requisito | Version | Nota |
|---|---|---|
| Node | 22 | La imagen Docker usa `node:22-alpine`. No hay `engines.node` declarado |
| pnpm | la publicada | `Dockerfile*` hace `npm install -g pnpm`. No hay `packageManager` fijado |
| Docker | cualquiera | Solo para `docker-compose up` |

Conviven `pnpm-lock.yaml` y `package-lock.json` en la raiz. Los `Dockerfile` usan **pnpm**.

## 5. Quickstart

### Opcion A · Docker Compose (lo mas parecido a produccion)

```powershell
Copy-Item .env.example .env
docker compose up --build
```

| Servicio | URL |
|---|---|
| Web | http://localhost:8089 |
| API | http://localhost:3039/api/exoplanets |

### Opcion B · Local, con hot reload

```powershell
pnpm install

# terminal 1 · API en :3000
npx nx serve api

# terminal 2 · Web en :4200
npx nx serve web
```

Abrir http://localhost:4200. La web llama a la API por CORS; `CORS_ORIGIN` debe permitir el origen
desde el que sirves la web.

## 6. Comandos

No hay scripts npm: se usan targets Nx.

| Que | Comando |
|---|---|
| Listar proyectos | `npx nx show projects` |
| Ver targets de un proyecto | `npx nx show project web` |
| Build | `npx nx run-many -t build` |
| Build de un proyecto | `npx nx build web` |
| Servir la web | `npx nx serve web` |
| Servir la API | `npx nx serve api` |
| Lint | `npx nx run-many -t lint` |
| Test | `npx nx run-many -t test` |
| E2E | `npx nx run-many -t e2e` |
| Duplicidad | `npx jscpd --config .jscpd.json .` |
| Validar OpenSpec | `openspec validate --all --strict` |

## 7. Estructura

```
exodex/
├── apps/
│   ├── web/            # Angular 21 · SPA + SSR, rutas, servicios core, features
│   ├── api/            # NestJS 11 · controller, service, transformer, DTOs
│   ├── web-e2e/        # Playwright
│   └── api-e2e/        # Playwright con global-setup
├── libs/
│   ├── shared-types/   # Tipos de dominio (Exoplanet, filtros, renderer)
│   ├── planet-renderer/# Algoritmos SVG de planeta y estrella
│   ├── ui-components/  # 12 componentes Angular reutilizables
│   └── i18n/           # ngx-translate · catalogos ES/EN
├── docs/
│   ├── architecture/   # C4 L1+L2 en Mermaid
│   ├── adr/            # Decisiones y su deuda asumida
│   └── operations/     # deploy, runbook, puertas de calidad
├── openspec/           # Cambios con spec (schema spec-driven)
├── nx.json             # Orquestador, plugins, targetDefaults
├── tsconfig.base.json  # Alias @exodex/*
└── eslint.config.mjs   # Lint flat config
```

## 8. Testing

| Tipo | Runner | Estado |
|---|---|---|
| Unit | Jest (libs, api) y Vitest (web) | **0 tests**. `nx test` falla con *"No tests found"* |
| E2E | Playwright 1.36 | Configurado en `apps/web-e2e` y `apps/api-e2e`; requiere servidores levantados |
| Duplicidad | jscpd 5.4 | Verde con linea base |

`nx test` fallando **no es una regresion**: es que no hay suite. La puerta de duplicidad si funciona y
es la unica que hoy da senal de calidad automatica.

## 9. Despliegue

Tres imagenes disponibles: `Dockerfile` (unificada: web + API + nginx + supervisor, puerto 80),
`Dockerfile.api` y `Dockerfile.web` (separadas, las que usa `docker-compose.yml`: web en
`8089:80`, API en `3039:3000`).

Variables relevantes: `CORS_ORIGIN` (default `https://exodex.zemios.dev`) y `PORT` (default `3000`).
El volumen `cache_data` mantiene la cache en disco entre reinicios.

Detalle en [`docs/operations/deploy.md`](docs/operations/deploy.md) e incidentes en
[`docs/operations/runbook.md`](docs/operations/runbook.md).

## 10. Documentacion

| Documento | Para que |
|---|---|
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Como esta construido hoy: C4 L2, flujo de datos, configuracion, deuda |
| [`docs/architecture/context.md`](docs/architecture/context.md) | Diagramas C4 L1 + L2 en Mermaid |
| [`docs/adr/README.md`](docs/adr/README.md) | Indice de decisiones |
| [`docs/adr/0001`](docs/adr/0001-nx-como-orquestador-del-monorepo.md) · [`0002`](docs/adr/0002-cache-en-memoria-y-disco-para-el-catalogo.md) | Decisiones con su consecuencia negativa |
| [`docs/operations/quality-gates.md`](docs/operations/quality-gates.md) | Estado de las puertas, clasificacion de cada fallo, auditoria de DTOs, duplicidad |
| [`docs/operations/deploy.md`](docs/operations/deploy.md) | Imagenes, compose, variables |
| [`docs/operations/runbook.md`](docs/operations/runbook.md) | Sintomas y respuesta |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Como trabajar aqui |
| [`openspec/changes/`](openspec/changes/) | Cambios en curso con su spec |
