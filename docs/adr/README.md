# Architecture Decision Records

Registro de decisiones de arquitectura de `exodex`. Un ADR documenta **por qué** se hizo algo una
vez, no **qué** se hace hoy: el estado actual vive en [`ARCHITECTURE.md`](../../ARCHITECTURE.md).

## Ciclo de vida

`Proposed` → `Accepted` → `Superseded by ADR-NNNN`. Un ADR aceptado **nunca se borra ni se
reescribe**: se marca como sustituido y se añade el nuevo. Cada ADR lleva fecha y **al menos una
consecuencia negativa**; un ADR sin ellas no registra los trade-offs que se decidieron.

## Formato

```markdown
# ADR-NNNN · <título>
- Estado: Accepted (YYYY-MM-DD)
- Supersedes: —
- Superseded by: —

## Contexto      qué requisito obliga, qué opciones se consideraron
## Decisión      qué se elige y por qué gana (criterio, no adjetivo)
## Consecuencias  · Positivas  · Negativas / deuda asumida  · Umbral de revisión
```

## Indice

| # | Titulo | Estado | Fecha |
|---|---|---|---|
| [0001](0001-nx-como-orquestador-del-monorepo.md) | Nx como orquestador del monorepo | Accepted | 2026-10-01 |
| [0002](0002-cache-en-memoria-y-disco-para-el-catalogo.md) | Cache en memoria y disco para el catalogo | Accepted | 2026-10-01 |
