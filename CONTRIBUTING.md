# Contribuir en exodex

Guia de trabajo en este repositorio. Que hace el sistema esta en
[`ARCHITECTURE.md`](ARCHITECTURE.md); por que esta asi, en
[`docs/adr/`](docs/adr/README.md).

## 1. La regla que manda sobre las demas

> **El comportamiento no cambia. Solo cambia como esta construido.**

Si al terminar no se puede demostrar que lo que funcionaba sigue funcionando, el trabajo esta mal.
Da igual que el codigo quede mas bonito.

## 2. Requisitos

| Herramienta | Version | Nota |
|---|---|---|
| Node | 22 | La imagen Docker usa `node:22-alpine`. El `package.json` **no declara `engines.node`**: usa tu Node con criterio. |
| pnpm | la que publicaste | `Dockerfile*` hace `npm install -g pnpm`. No hay `packageManager` fijado, asi que la version no esta bloqueada. |

Instalacion:

```powershell
pnpm install
```

## 3. Comandos

Este repositorio **no tiene scripts en el `package.json` raiz**. Todo se ejecuta por target Nx:

| Que | Comando | Target |
|---|---|---|
| Instalar | `pnpm install` | — |
| Ver todos los proyectos | `npx nx show projects` | — |
| Ver los targets de un proyecto | `npx nx show project web` | — |
| Build de todo | `npx nx run-many -t build` | `build` |
| Servir la web | `npx nx serve web` | `serve` (puerto 4200) |
| Servir la API | `npx nx serve api` | `serve` (puerto 3000) |
| Lint | `npx nx run-many -t lint` | `lint` |
| Test | `npx nx run-many -t test` | `test` |
| E2E | `npx nx run-many -t e2e` | `e2e` |
| Duplicidad | `npx jscpd --config .jscpd.json .` | — |

Añade `--skip-nx-cache` cuando la cache te diga algo que no es cierto (por ejemplo, tras un cambio
en un fichero que
no deberia afectar al target).

### Estado actual de las puertas

`build` verde. `lint` rojo (3 de 8 proyectos). `test` rojo (4 de 5). **No esperes que esten en verde y
no las arregles de paso**: su clasificacion esta en
[`docs/operations/quality-gates.md`](docs/operations/quality-gates.md) y son deuda previa.

## 4. Orden de las puertas en un pull request

```
typecheck -> lint -> test -> duplicidad -> build
```

`build` va al final: es lo mas caro y lo que menos valor da como puerta temprana. Hoy `typecheck` no
existe como script (no hay `tsc` en el raiz); `nx build` hace el typecheck de cada proyecto como
parte de la compilacion.

## 5. Donde va cada tipo de cambio

| Si cambias… | Actualiza en el **mismo commit** |
|---|---|
| Estructura de paquetes o flujo de datos | `ARCHITECTURE.md` y `docs/architecture/context.md` |
| Por que se eligio algo | Un ADR nuevo en `docs/adr/`, y la entrada en su indice |
| Comandos, scripts, variables de entorno | `README.md` y `CONTRIBUTING.md` |
| Puertas de calidad o su clasificacion | `docs/operations/quality-gates.md` |
| Variables de entorno del servidor | `.env.example` **y** la tabla de `deploy.md` |
| Un `Dockerfile` o el `docker-compose.yml` | `docs/operations/deploy.md` |

Un documento actualizado "en una pasada final" es un documento que nunca se actualiza.

## 6. Convenciones de codigo

- **Formatting:** Prettier, `.prettierrc` con `singleQuote: true`. ESLint flat config en
  `eslint.config.mjs` con los presets de Nx.
- **Imports entre paquetes:** solo por alias `@exodex/*` de `tsconfig.base.json`. Nunca rutas
  relativas entre proyectos.
- **La API lee configuracion con `ConfigService`**, no con `process.env`. Ya es la convencion
  (`ExoplanetService` la sigue) y el unico que no la seguia era `main.ts`.
- **Log a traves de `Logger`.** En NestJS, `new Logger(MiClase.name)`. En Angular, el `Logger` de
  `@angular/core`. No `console.*` en codigo de producto. La excepcion son los ficheros
  `apps/*-e2e/src/support/*.ts`, que son andamiaje de test.
- **Comments y mensajes de log en ingles o espanol, pero el codigo en ingles.** Los mensajes de log
  existentes mezclan ambos idiomas; no unifiques el idioma en un change de otro tema.

## 7. Cuidado con los DTO de NestJS

`apps/api/src/app/exoplanet/dto/` contiene **`interface` y `type`, no clases**, y **no hay ningun
`ValidationPipe` en el repositorio**. `class-validator` y `class-transformer` no estan instalados.

Esto importa porque `ValidationPipe({ whitelist: true })` sobre un DTO sin decoradores de clase
**descarta todos los campos en silencio**: el body llega vacio y no salta ningun error. Si algun dia
se activa `whitelist`, hay que convertir antes los DTO en clases con decoradores. Y
`forbidNonWhitelisted: true` esta prohibido sin excepcion: devuelve 400 a clientes que hoy
funcionan. Detalle en la seccion 6 de
[`docs/operations/quality-gates.md`](docs/operations/quality-gates.md).

## 8. Que no se hace aqui (categoria C)

Estos cambios rompen clientes o cambian el producto. Se documentan como propuesta, no se aplican:

- Cambiar status codes, anadir auth o guards, migrar de ORM.
- `forbidNonWhitelisted`, `errorFormat: 'grouped'`.
- Upgrade mayor de Angular, NestJS o Prisma.
- Anadir Turborepo o quitar Nx (ver [ADR-0001](docs/adr/0001-nx-como-orquestador-del-monorepo.md)).
- `strict`, `noUncheckedIndexedAccess` o cobertura de golpe. Se adoptan por **ratchet medido**.

## 9. Duplicidad

`npx jscpd --config .jscpd.json .` falla **solo por clones nuevos**: la deuda esta congelada en
`.jscpd-baseline.json`.

- Clon legitimo (imports, plantilla, constantes): marca con
  `/* jscpd:ignore-start */ ... /* jscpd:ignore-end */`.
- Clon accidental: se corrige en el codigo.
- **Nunca** regeneres la linea base para callar un fallo sin revisar el clon.

Medicion actual: 82 ficheros, 13 932 lineas, 8 clones, 179 lineas duplicadas (1.28 %).

## 10. Proceso de cambio

1. `openspec new change <nombre>`, y los 4 artefactos del schema `spec-driven`: `proposal.md`,
   `design.md`, `tasks.md` y `specs/<dominio>/spec.md`.
2. `openspec validate --all --strict` en verde antes de pedir revision.
3. Implementa en commits pequenos y coherentes, cada uno dejando el repo en verde.
4. Una decicion estructural que sobreviva al change va a `docs/adr/`.

**No documentes el codigo entero para empezar.** Los specs describen lo que vas a cambiar, no el
repositorio entero: un spec que nada obliga a mantener cierto envejece mal.

## 11. Commits

Formato: `tipo(scope): que hace`. Tipos en uso: `feat`, `fix`, `chore`, `docs`.

Nunca mezcles reformateo masivo con cambios de logica: el diff de reformateo esconde bugs. Si un
commit toca 200 lineas solo por formato, va solo.
