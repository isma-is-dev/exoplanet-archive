# Puertas de calidad: estado medido y clasificacion

Medido el 2026-10-01 sobre `chore/architecture-polish`, worktree
`.polish-wt/exodex`, con `npx nx run-many -t <target> --skip-nx-cache` y `CI=1`.

Este documento **no arregla** los fallos. Los clasifica, porque un fallo sin clasificacion no puede
interpretarse en una revision posterior.

## 1. Clasificacion: que significa cada etiqueta

| Etiqueta | Significado | Quien lo arregla |
|---|---|---|
| **dependencia** | Falta un paquete, o la version instalada no soporta lo que el codigo pide | Actualizar o anadir dependencia |
| **configuracion** | El codigo esta bien; falta o sobra algo en un fichero de configuracion | Anadir el ajuste correcto |
| **codigo** | El codigo hace algo que la regla rechaza. El arreglo es en el fuente | Editar el fuente |

## 2. Que se puede comparar antes/despues

La linea base (`_tools/baseline/exodex.json`) tiene **`scripts: {}` y `commands: {}`**: el
`package.json` raiz **no declara ni un solo script**. `capture-quality.ps1` solo busca
`typecheck`, `lint`, `test` y `build` en el `package.json` raiz, asi que **ninguna puerta de ese
script es comparable**: no existen antes, no se inventan.

La unica medicion comparable es la de los **targets Nx**, ejecutada a mano. Es la tabla siguiente.

## 3. Estado de las puertas

| Puerta | Comando | Antes | Despues |
|---|---|---|---|
| Build | `npx nx run-many -t build --skip-nx-cache` | **VERDE** (3/3: `planet-renderer`, `web`, `api`) | VERDE |
| Lint | `npx nx run-many -t lint --skip-nx-cache` | **ROJO** (5/8 verdes) | ROJO, identico |
| Test | `npx nx run-many -t test --skip-nx-cache` | **ROJO** (1/5 verdes) | ROJO, identico |
| Typecheck | — | no existe script | no existe |
| Duplicidad | `npx jscpd --config .jscpd.json .` | no existia | **VERDE** con baseline |

Detalle de lint: fallan `planet-renderer`, `ui-components` y `web`. Pasan `shared-types`, `i18n`,
`api`, `api-e2e` y `web-e2e`.
Detalle de test: pasan solo `api` (tiene `passWithNoTests: true`). Fallan `web`, `ui-components`,
`shared-types` y `planet-renderer`.

## 4. Clasificacion de cada fallo

### 4.1 `nx lint` — ROJO

| Regla que falla | Proyecto | Conteo | Clasificacion | Arreglo propuesto (NO aplicado) |
|---|---|---|---|---|
| `@nx/enforce-module-boundaries` | `planet-renderer`, `ui-components` | 3 | **configuracion** | `nx.json` no declara `tags` en ningun proyecto, y los 8 `project.json` tienen `"tags": []`. La regla no puede deducir que es buildable. Declarar `tags` por proyecto (p. ej. `type:lib`, `type:app`) y los `depConstraints` que correspondan. **No es un bug de importacion.** |
| `@angular-eslint/component-selector` | `ui-components` | 13 | **codigo** | Los selectores no llevan el prefijo `lib` que exige la regla. Es un cambio de API pública de los componentes: los 3 sitios que los usan en `apps/web` deben actualizarse a la vez. Por eso **no** se toca aquí. |
| `@angular-eslint/template/prefer-control-flow` | `ui-components` (6), `web` (1) | 7 | **codigo** | `*ngIf` / `*ngFor` en vez de `@if` / `@for`. Autofixable con la migracion oficial `ng generate @angular/core:control-flow`; cambia forma, no comportamiento. Es categoria A, pero queda para un change propio porque arrastra el diff de las plantillas. |
| `@typescript-eslint/no-inferrable-types` | `planet-renderer` | 14 | **codigo** | Anotaciones redundantes (`x: boolean = true`). Autofixable con `--fix`. |
| `prefer-const` | `planet-renderer` | 3 | **codigo** | `let` donde `const` basta (`svg`, `svgParts`, `extraStarsParts`). Autofixable con `--fix`. |
| `@angular-eslint/prefer-inject` | `ui-components` | 1 | **codigo** | Inyeccion por constructor en vez de `inject()`. La propia regla apunta a `ng generate @angular/core:inject`. |
| `@angular-eslint/no-output-native` | `ui-components` | 1 | **codigo** | Un `@Output` con nombre de evento DOM. Renombrarlo cambia la API del componente. |
| `@typescript-eslint/no-unused-vars` (warnings) | `web` (6) | 9 | **codigo** | Imports y parametros sin usar. No rompen la puerta: son warnings. |
| `no-explicit-any` (warnings) | `web` (3) | 4 | **codigo** | Tres usos de `any`. Warnings. |

**Total: 43 errores + 13 warnings.** 26 son autofixables con `eslint --fix`, pero hacerlo sin puerta
de test verde seria cambiar codigo a ciegas.

### 4.2 `nx test` — ROJO

| Sintoma | Proyecto | Clasificacion | Arreglo propuesto (NO aplicado) |
|---|---|---|---|
| `No tests found, exiting with code 1` | `ui-components`, `shared-types`, `planet-renderer` | **configuracion** | Los targets `test` de `@nx/jest/plugin` no pasan `--passWithNoTests`. El repositorio **no tiene ni un solo fichero `*.spec.ts`**. Anadir `--passWithNoTests` al `jest.preset.js` haria la puerta verde en falso; lo correcto es escribir la suite, que es categoria B con puerta. |
| `No tests found matching the following patterns: **/*.spec.ts, **/*.test.ts` (lanza desde `getVitestBuildOptions`) | `web` | **configuracion** | El target usa `@angular/build:unit-test` con Vitest, y el builder **lanza excepcion** si no encuentra ficheros. A diferencia de Jest, no admite `passWithNoTests` por target. |
| — | `api` | ya verde | Su `project.json` declara `options.passWithNoTests: true`. Es el unico que pasa, y pasa por configuracion, no por tener tests. |

**Conclusion: `nx test` no falla por un bug.** Falla porque no existe suite de tests. Es la razon
por la que en este change **no se toca nada de categoria B**: no hay puerta que valide un cambio de
codigo cuando la unica puerta de comportamiento esta en rojo por ausencia.

### 4.3 `nx build` — VERDE

Sin accion. `planet-renderer` (esbuild), `web` (`@angular/build:application`) y `api` (webpack-cli)
compilan.

## 5. Lo que NO se ha hecho y por que (categoria C del contrato Zemios)

| Propuesta | Por que queda fuera |
|---|---|
| `ValidationPipe({ whitelist: true })` | **Peligro silencioso.** Hoy **no hay ningun `ValidationPipe`** en el codigo, y los DTO no son clases. Ver seccion 6. |
| `forbidNonWhitelisted: true` | Devuelve 400 a clientes que hoy funcionan. Cambio de producto. |
| `errorFormat: 'grouped'` | `message` deja de ser `string[]` y rompe el parseo de errores del front. |
| `strict` + `strictTemplates` | Categoria B, sin puerta de test verde que valide el cambio. |
| `noUncheckedIndexedAccess` | De golpe genera cientos de TS2532/TS18048. Ratchet medido, nunca de golpe. |
| Arreglar los 43 errores de lint | Eran rojos antes de este change. Un fallo preexistente no se arregla aqui. |
| Escribir la suite de tests | Categoria B. |
| Anadir auth o guards, cambiar status codes, migrar de ORM | Cambio de producto. |
| Anadir Turborepo o quitar Nx | Cambio de plataforma. Ver ADR-0001. |

## 6. Auditoria de DTOs de NestJS (la trampa)

Esta seccion existe porque `whitelist: true` con un DTO sin decoradores de clase **descarta todos
los campos en silencio**: el body llega vacio y no hay error visible.

| Metrica | Valor |
|---|---|
| Ficheros en `apps/api/src/app/exoplanet/dto/` | **2** |
| Ficheros que declaran una **clase** | **0** |
| Ficheros con decoradores de clase (`@IsString`, `@Type`, …) | **0** |
| Instancias de `ValidationPipe` en todo el repo | **0** |
| `class-validator` en dependencias | **no esta instalado** |
| `class-transformer` en dependencias | **no esta instalado** |

Detalle:

| Fichero | Que declara | Decoradores |
|---|---|---|
| `dto/exoplanet-query.dto.ts` | `export interface ExoplanetQueryDto` — 14 campos opcionales | 0 (una `interface` no admite decoradores) |
| `dto/exoplanet-response.dto.ts` | `export type PaginatedResponse<T>`, `export type ExoplanetResponseDto`, `export type ExoplanetListResponseDto` | 0 (tres alias de tipo) |

**Conclusion:** no se puede activar `whitelist: true` hoy. Habria que convertir primero las dos
`interface`/`type` en clases con decoradores de `class-validator` e instalar
`class-validator` + `class-transformer`. Es un change propio, con su puerta. Y `forbidNonWhitelisted`
sigue siendo categoria C en cualquier caso, porque devuelve 400 a clientes que hoy funcionan.

## 7. Duplicidad real (medida con jscpd 5.4.0)

Configuracion en `.jscpd.json`, ejecutada sobre el codigo de producto. Se excluyen del measurement
`pnpm-lock.yaml` (580 KB, generaba 13 clones solo), `tsconfig*.json`, `eslint.config.mjs`,
`.agents/**` y `openspec/**`, porque no son codigo de producto y ahogaban la señal.

| Metrica | Valor |
|---|---|
| Ficheros analizados | **82** |
| Lineas totales | **13 932** |
| Tokens totales | **48 003** |
| Clones | **8** |
| Lineas duplicadas | **179 (1.28 %)** |
| Tokens duplicados | **687 (1.43 %)** |

Por formato:

| Formato | Ficheros | Lineas | Clones | Lineas duplicadas |
|---|---|---|---|---|
| typescript | 57 | 11 957 | 4 | 51 (0.43 %) |
| json | 14 | 1 356 | 4 | 128 (9.44 %) |
| scss | 3 | 383 | 0 | 0 |
| javascript | 1 | 25 | 0 | 0 |
| markup / markdown / yaml / bash / csv | 7 | 211 | 0 | 0 |

### Los 5 clones mas relevantes

| # | Clone | Paquetes implicados | Tamano |
|---|---|---|---|
| 1 | `apps/web/public/assets/i18n/en.json` L21-65 vs `libs/i18n/src/assets/i18n/en.json` L22-66 | **web ↔ i18n** | 45 lineas, 161 tokens |
| 2 | `apps/web/public/assets/i18n/es.json` L21-47 vs `libs/i18n/src/assets/i18n/es.json` L22-66 | **web ↔ i18n** | 45 lineas, 161 tokens |
| 3 | `apps/web/.../exoplanet-mock.service.ts` L158-172 vs L224-238 vs L257-271 | **web (interno)** | 15 lineas, 50 tokens, 3 ocurrencias |
| 4 | `libs/planet-renderer/src/lib/planet-renderer.ts` L10-20 vs `star-renderer.ts` L4-14 | **planet-renderer (interno)** | 11 lineas, 69 tokens |
| 5 | `apps/web/.../system-detail-page.component.ts` L1060-1069 vs L1081-1090 | **web (interno)** | 10 lineas, 62 tokens |

**El hallazgo de fondo:** el mayor bloque de duplicidad no esta en TypeScript, esta en el catalogo
i18n. Los mismos ficheros de traduccion viven en dos sitios —`libs/i18n/src/assets/i18n/` como
fuente y `apps/web/public/assets/i18n/` como asset servido— y no hay paso de build que genere el
segundo desde el primero. Cuatro de los ocho clones, y 128 de las 179 lineas duplicadas (71 %),
salen de ahi.

### Como se usa la linea base

```powershell
# 1. medir el estado actual (solo informe)
npx jscpd --config .jscpd.json .

# 2. reescribir la linea base, solo tras una refactorizacion intencionada
npx jscpd --config .jscpd.json --update-baseline .

# 3. en la puerta: falla SOLO por clones nuevos
npx jscpd --config .jscpd.json --fail-on-new-clones --fail-on-empty .
```

Los fingerprints son hashes de contenido con multiplicidad: **mover o renombrar ficheros no dispara
la puerta**, solo la duplicacion nueva o creciente. `--fail-on-empty` es obligatorio: sin el, un
patron mal escrito que analiza 0 ficheros sale 0 y deja el pipeline verde en falso.

**No se ha refactorizado nada para reducir esta duplicidad.** Se registra, se acota con la linea base
y la eliminacion se propone como change propio con su puerta. Unico caso que STANDARD.md permitiria
unificar sin mas (duplicacion textual exacta y aislada) es el bloque de generacion de
`exoplanet-mock.service.ts`, que se repite 3 veces con el mismo texto; no se ha tocado para no
alterar los datos mock que la web muestra cuando la API cae.

### Nota de version sobre la plantilla del contrato

STANDARD.md propone `"failOnNewClones": true` en `.jscpd.json`. En **jscpd 5.4.0 eso es un error de
configuracion**: la clave es un entero `u64` y el arranque falla con
`invalid type: boolean 'true', expected u64`. Ademas `--fail-on-new-clones` y `--fail-on-empty` son
flags de CLI, no claves de config. Aqui se usa `"failOnNewClones": 0` y `"failOnEmpty": true`, y los
flags se pasan en el comando de la puerta.

## 8. Angular 21 no tiene `Logger`: los `console.*` del front no se pueden quitar sin anadir dependencia

Este es el hallazgo mas accionable del change, porque **se intento y se revirtio**.

Se probo sustituir los dos `console.*` del codigo Angular por el `Logger` de `@angular/core`:

```
X [ERROR] TS2305: Module '"@angular/core"' has no exported member 'Logger'.
    apps/web/src/main.ts:1:9
    apps/web/src/app/core/services/exoplanet-api.service.ts:1:70
```

`nx build` paso de **verde a rojo**. Se verifico en los tipos instalados:

| Comprobacion | Resultado |
|---|---|
| `Logger` en `types/core.d.ts` de `@angular/core@21.2.6` | **0 coincidencias** |
| `Logger` en cualquier `*.d.ts` de los 14 paquetes `@angular/*` instalados | **0 coincidencias** |
| Export principal de `@angular/core` | `types/core.d.ts` → `fesm2022/core.mjs`, sin `Logger` |

**Conclusion:** Angular 21 retiro el `Logger` integrado. En NestJS la regla "Logger en vez de
`console.log`" si es aplicable, y es lo que se aplico en `apps/api/src/main.ts` (que ya usaba
`Logger`, y ahora ademas encamina su configuracion por `ConfigService`). En el front **no hay a donde
migrar sin anadir una libreria de logging**, y anadir una dependencia mas elegir cual es una decision,
no un cambio de forma. Se aplico la regla del contrato —*un fallo nuevo = revertir ese item*— y los
dos ficheros volvieron a su estado original.

### Inventario de `console.*` que queda

| Fichero | Linea | Que es |
|---|---|---|
| `apps/web/src/main.ts` | 5 | `console.error(err)` en el `catch` de `bootstrapApplication` |
| `apps/web/src/app/core/services/exoplanet-api.service.ts` | 109 | `console.log('API no disponible, usando datos mock')` |
| `apps/api-e2e/src/support/global-setup.ts` | 8 | Andamiaje de Playwright |
| `apps/api-e2e/src/support/global-teardown.ts` | 9 | Andamiaje de Playwright |

Los dos ultimos **no son codigo de producto**: son el setup y el teardown de Playwright, se ejecutan
una vez y su salida es el propio informe del runner. Alli `console` es lo correcto.

### Arreglo propuesto (NO aplicado)

Elegir una libreria de logging para el front y aplicarla en los dos puntos de la tabla. Es una
decision con criterio, no una sustitucion mecanica: las dos opciones sobre la mesa son una libreria
dedicada, o un servicio propio `providedIn: 'root'` que wrapee `console` y sirva de punto unico de
sustitucion. La eleccion deberia ir en su propio change, porque anadir dependencia es decision de
plataforma, igual que lo seria migrar a Biome o cambiar de orquestador.
