# Design: harden-architecture

## Enfoque

Todo el trabajo es **categoría A** del contrato Zemios: documentación, ficheros de higiene,
línea base de duplicidad y dos sustituciones mecánicas de logging/configuración. No hay cambio de
comportamiento, así que no hay puerta de test que thoughtfully pueda validar un delta de runtime:
la verificación es "las puertas que pasaban siguen pasando y las que fallaban siguen fallando igual".

## Decisión 1 · Clasificación de puertas en vez de arreglo de puertas

Medido con `nx run-many -t <target> --skip-nx-cache` sobre los 8 proyectos del workspace.

| Puerta | Estado | Clasificación |
|---|---|---|
| `nx build` (3 proyectos) | verde | — |
| `nx lint` (8) | rojo: `planet-renderer`, `ui-components`, `web` | **código** (43 errores) + **configuración** (`nx.json` sin `tags`) |
| `nx test` (5) | rojo: `web`, `ui-components`, `shared-types`, `planet-renderer` | **configuración** (0 ficheros de test + `passWithNoTests` ausente) |
| `typecheck` | no existe script | no comparable |
| script root `package.json` | **vacío** | no comparable |

La línea base (`_tools/baseline/exodex.json`) tiene `scripts: {}` y `commands: {}`: el
`package.json` raíz **no define ni un script**. Por tanto el único gate comparable entre antes y
después es el conjunto de targets Nx, ejecutado a mano. Eso se documenta en
`docs/operations/quality-gates.md` en vez de inventar scripts nuevos que falsearían la comparación.

**Por qué no se arregla el rojo:** la regla del contrato es que un fallo preexistente no se arregla en
este encargo, y `nx test` fallando por "no hay tests" no es un bug de código sino ausencia de una
suite. Arreglarlo exigiría escribir la suite, que es categoría B con puerta.

## Decisión 2 · Alcance de la duplicidad medida

`jscpd` con `.jscpd.json` se ejecuta sobre el código de producto. Se excluyen del Measurement:

- `pnpm-lock.yaml` (580 KB) — generaba 13 clones y ahogaba la señal.
- `tsconfig*.json`, `eslint.config.mjs` — boilerplate generado por Nx.
- `.agents/**` (skills de OpenSpec), `openspec/**`, informes de `jscpd` — no son código de producto.

Resultado real: **82 ficheros, 13 932 líneas, 48 003 tokens, 8 clones, 179 líneas duplicadas
(1.28 %), 687 tokens duplicados (1.43 %)**. Los 8 fingerprints se commitean en
`.jscpd-baseline.json`. `failOnNewClones: 0` y `failOnEmpty: true` en config, y `--fail-on-empty`
también en el comando de CLI, porque un patrón mal escrito que analiza 0 ficheros sale 0 y deja el
pipeline verde en falso.

Nota de versión: en `jscpd` 5.4.0 `failOnNewClones` es un **número** (u64) en config, no un
booleano, y `--fail-on-new-clones` / `--fail-on-empty` son flags de CLI. La plantilla del contrato
Zemios usa `"failOnNewClones": true` y jscpd 5 lo rechaza (`invalid type: boolean`).

## Decision 3 · `ConfigService` como sustitucion de categoria A, y por que el `Logger` angular no

- `apps/api/src/main.ts`: `process.env.CORS_ORIGIN` y `process.env.PORT` → `ConfigService.get()`
  con los mismos defaults y el mismo operador `||` (para no cambiar el caso `PORT=""`).
  `ExoplanetService` ya usaba `ConfigService`; `main.ts` era la unica excepcion.

**El `Logger` de Angular no existe en esta version, y se comprobo empíricamente.** Se probo
sustituir los dos `console.*` del front por `Logger` de `@angular/core` y `nx build` paso de verde a
rojo con:

```
TS2305: Module '"@angular/core"' has no exported member 'Logger'.
```

`@angular/core@21.2.6` no exporta `Logger`, y el simbolo **no aparece en ningun paquete `@angular/*`
instalado**. Angular 21 retiro el `Logger` integrado. Sustituir `console.*` en el front exigiria anadir
una libreria de logging, que es anadir dependencia y decidir cual: no es un cambio de forma.

Segun la regla del contrato ("un fallo nuevo = revertir ese ítem"), **los dos cambios de Angular se
revirtieron** y solo se aplica el de la API. Los `console.log` de `apps/api-e2e/src/support/*.ts` y los
`process.env` de `apps/web-e2e/playwright.config.ts` y `apps/api-e2e/src/support/*` se dejan: son
andamiaje de test, se ejecutan antes de que exista contenedor DI.

## Decisión 4 · ADR como registro de deuda asumida

El ADR-0001 (mantener Nx) y el ADR-0002 (caché en memoria + disco) no son neutrales: el primero
asume que Nx seguirá siendo el orquestador y el segundo asume que 24 h de TTL y 30 s de caché de
filtros son aceptables. Se documentan con su consecuencia negativa y con el umbral medible que
obligaría a revisarlos, en lugar de omitirlos.

## Diagramas

C4 L1 + L2 en Mermaid dentro de `docs/architecture/context.md`, un nodo por cada uno de los 8
proyectos Nx (4 apps + 4 libs). L3 no se dibuja: ningún contenedor supera la complejidad que lo
justifique. Ningún diagrama pasa de ~20 nodos.
