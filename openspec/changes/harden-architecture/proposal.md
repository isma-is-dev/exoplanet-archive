# Change: harden-architecture

## Why

`exodex` es un monorepo Nx (Angular 21 + NestJS 11) que ya compila y sirve correctamente, pero
carece por completo de la capa de documentación y de los ficheros de higiene que el resto de repos
de Zemios tienen: no hay `README.md`, ni `ARCHITECTURE.md`, ni `CONTRIBUTING.md`, ni ADR, ni
`.editorconfig`, ni `.gitattributes`, ni línea base de duplicidad. Además, las puertas de calidad
(`nx lint`, `nx test`) están en rojo y **no existe clasificación de por qué**, así que cualquier
puerta de futuro que se añada no se puede interpretar. Este change no arregla el rojo: lo mide, lo
documenta y acota con una línea base para que no pueda empeorar.

## What Changes

- Documenta la arquitectura actual en tres capas: `ARCHITECTURE.md` (estado), `docs/architecture/context.md`
  (C4 L1+L2 en Mermaid) y `docs/adr/` (decisiones con consecuencia negativa asumida).
- Añade `README.md` (10 secciones, stack leído de `package.json`) y `CONTRIBUTING.md`.
- Añade `.editorconfig` y `.gitattributes` para normalizar finales de línea y codificación.
- Añade `.jscpd.json` + `.jscpd-baseline.json` con la **línea base real medida** (8 clones,
  179 líneas duplicadas, 1.28 %) para que la puerta de duplicidad detecte solo clones nuevos.
- Sustituye `console.*` por `Logger` en el arranque de Angular y en `exoplanet-api.service.ts`.
- Encamina la lectura de `process.env` de `apps/api/src/main.ts` a través de `ConfigService`.
- Clasifica cada fallo de puerta existente (dependencia / configuración / código) en
  `docs/operations/quality-gates.md`, **sin aplicar el arreglo**.

## Capabilities

- **New Capabilities**: `repository-quality-gates` — reglas de higiene del repositorio y puerta de
  duplicidad con ratchet, que es comportamiento verificable del pipeline de entrega.
- **Modified Capabilities**: ninguna. `openspec/specs/` está vacío.

## Impact

- Ficheros nuevos: documentación (`README.md`, `ARCHITECTURE.md`, `CONTRIBUTING.md`, `docs/**`) y
  configuración (`.editorconfig`, `.gitattributes`, `.jscpd.json`, `.jscpd-baseline.json`).
- Ficheros de código tocados: `apps/api/src/main.ts`, `apps/web/src/main.ts`,
  `apps/web/src/app/core/services/exoplanet-api.service.ts`. Ningún cambio de comportamiento.
- Puertas: `nx build` debe seguir en verde; `nx lint` y `nx test` deben seguir en rojo **igual**,
  con el mismo recuento de errores.

### No objetivos (fuera de alcance)

Categoría C del contrato Zemios. **Prohibido en este change**, solo se documenta como propuesta:

- `ValidationPipe({ whitelist: true })` — hoy **no hay ningún `ValidationPipe`**. Los 2 ficheros DTO
  de `apps/api/src/app/exoplanet/dto/` contienen `interface` y `type`, no clases, y
  `class-validator` / `class-transformer` no están instalados. Activar `whitelist` sin decoradores
  de clase descartaría **todos** los campos en silencio. Convertir los DTO a clases + decoradores es
  un change propio.
- `forbidNonWhitelisted: true` — devuelve 400 a clientes que hoy funcionan. Cambio de producto.
- `errorFormat: 'grouped'` — `message` deja de ser `string[]` y rompe el parseo de errores del front.
- `strict` / `strictTemplates`, `noUncheckedIndexedAccess`, cobertura, Playwright como puerta.
- Arreglar los errores de `nx lint` y `nx test` (quedan en rojo, con su clasificación escrita).
- Añadir auth o guards, cambiar status codes, migrar de ORM, añadir Turborepo o quitar Nx.
