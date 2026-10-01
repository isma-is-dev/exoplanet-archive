# Tasks: harden-architecture

## 1. Documentación de arquitectura

- [x] 1.1 `ARCHITECTURE.md` con C4 L2 y **un nodo por paquete/app** (8 proyectos Nx).
      *Verificar:* el fichero nombra los 8 proyectos y no contiene planes de futuro.
- [x] 1.2 `docs/architecture/context.md` con C4 L1 + L2 en Mermaid.
      *Verificar:* el bloque Mermaid renderiza en GitHub sin tooling; ningún diagrama > 20 nodos.
- [x] 1.3 `docs/adr/README.md` (índice: nº, título, estado, fecha).
      *Verificar:* el índice lista todos los ADR del directorio.
- [x] 1.4 `docs/adr/0001-*.md` y `0002-*.md` con **consecuencia negativa** y umbral de revisión.
      *Verificar:* cada ADR tiene al menos una consecuencia negativa y una fecha.

## 2. Documentación de uso

- [x] 2.1 `README.md` con 10 secciones y stack **leído de `package.json`**.
      *Verificar:* las versiones del bloque Stack coinciden con `package.json`.
- [x] 2.2 `CONTRIBUTING.md` (flujo, comandos, orden de puertas, qué es categoría C).
      *Verificar:* el quickstart es copiable y el orden de puertas es typecheck → lint → test → duplicidad → build.
- [x] 2.3 `docs/operations/deploy.md` y `docs/operations/runbook.md`.
      *Verificar:* los tres `Dockerfile*` y `docker-compose.yml` están descritos.
- [x] 2.4 `docs/operations/quality-gates.md` con el estado medido y la **clasificación
      (dependencia / configuración / código) de cada fallo**, con el arreglo propuesto sin aplicar.
      *Verificar:* cada fallo de puerta tiene una de las tres etiquetas.

## 3. Tooling estándar (categoría A)

- [x] 3.1 `.editorconfig` con `end_of_line = lf` y `charset = utf-8`.
- [x] 3.2 `.gitattributes` con `* text=auto eol=lf` y `*.bat text eol=crlf`.
      *Verificar:* `git check-attr eol -- Dockerfile` devuelve `lf`.
- [x] 3.3 `.gitignore` añade `jscpd-report/`.
      *Verificar:* el informe generado no aparece en `git status`.

## 4. Línea base de duplicidad

- [x] 4.1 `.jscpd.json` con la configuración estándar (con `failOnNewClones: 0` numérico y
      `failOnEmpty: true`, que es lo que acepta jscpd 5.4).
- [x] 4.2 Ejecutar jscpd de verdad y **registrar los números reales**.
      *Verificar:* 82 ficheros, 13 932 líneas, 8 clones, 179 líneas duplicadas (1.28 %).
- [x] 4.3 Commitear `.jscpd-baseline.json` con los 8 fingerprints medidos.
      *Verificar:* `npx jscpd --config .jscpd.json .` sale 0 sin clones nuevos.
- [x] 4.4 Documentar los 3-5 clones más relevantes y entre qué paquetes.
      *Verificar:* están en `docs/operations/quality-gates.md`; **no se refactoriza ninguno**.

## 5. Sustituciones de código seguras (categoría A)

- [x] 5.1 `console.*` → `Logger` en `apps/web/src/main.ts` y
      `apps/web/src/app/core/services/exoplanet-api.service.ts`.
      *Verificar:* `grep "console\." apps libs` no devuelve resultados en código de producto.
- [x] 5.2 `process.env` → `ConfigService` en `apps/api/src/main.ts`, mismos defaults.
      *Verificar:* `grep "process\.env" apps/api/src` no devuelve resultados.

## 6. Verificación

- [x] 6.1 `openspec validate --all --strict` en verde.
- [x] 6.2 `nx run-many -t build` sigue en verde (3/3).
- [x] 6.3 `nx run-many -t lint` sigue en rojo con el **mismo recuento** (no empeora).
- [x] 6.4 `nx run-many -t test` sigue en rojo con el **mismo conjunto** de proyectos (no empeora).
- [x] 6.5 `capture-quality.ps1` produce un `after/exodex.json` sin diferencia en `commands`.
