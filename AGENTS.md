<!-- OPENSPEC:ZEMIOS -->
## OpenSpec (spec-driven development) - convencion comun Zemios

Este repo usa **OpenSpec** (@fission-ai/openspec, v1.14.0). El flujo es obligatorio
para cualquier cambio de comportamiento: **spec primero, codigo despues**.

- Documentos generados en **espanol** (perfil `core`, entrega `both`).
- Estructura: `openspec/specs/` (verdad actual), `openspec/changes/<id>/`
  (`proposal.md`, `design.md`, `tasks.md`, `specs/` con deltas ADDED/MODIFIED/REMOVED),
  `openspec/changes/archive/`.
- Los workflows viven en `.agents/skills/openspec-*/` ( portables, versionados aqui)
  y ademas en `~/.minimax/skills/` para MiniMax Code.

### Como trabajar
1. `/openspec-propose "<que quiero>"` genera la propuesta y los deltas de spec. Revisa y corrige antes de seguir.
2. `/openspec-apply-change` implementa las tareas de la spec aprovada.
3. `/openspec-archive-change` archiva el cambio y fusiona sus requisitos en `openspec/specs/`.

Comandos de terminal: `openspec list`, `openspec validate`, `openspec view`,
`openspec update` (tras actualizar el CLI).

**No escribas codigo de una funcionalidad sin su spec correspondiente en
`openspec/changes/`**, y no toques los ficheros generados de `.agents/skills/` a mano:
se regeneran con `openspec update`.
<!-- OPENSPEC:ZEMIOS -->