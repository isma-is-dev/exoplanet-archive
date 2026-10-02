# ADR-0001 · Nx como orquestador del monorepo

- Estado: Accepted (2026-10-01)
- Supersedes: —
- Superseded by: —

## Contexto

`exodex` grew hasta tener dos aplicaciones (Angular y NestJS) que comparten contratos y codigo: la
web importa tipos que la API tambien usa, y ambas consumen `libs/ui-components` y
`libs/planet-renderer`. Sin un orquestador, cada paquete necesita su propio `package.json`, su
propio `node_modules` y su propio resolvedor de alias, y el orden de build hay que mantenerlo a mano.

Se evaluaron tres opciones:

- **A · Nx.** Inferencia de targets desde `project.json` y plugins, grafo de dependencias con cache
  por hash, alias por path. Ya presente en el repositorio.
- **B · npm workspaces + Turbo.** Mas simple de entender, pero no infiere targets: cada proyecto
  declara sus scripts, y los targets de lint y test hay que replicarlos en los 8 proyectos.
- **C · Sin orquestador.** Un unico `package.json` y scripts monolithicos que compilan todo cada vez.

## Decision

**A · Nx 22.6.2.** Ya es el orquestador del repositorio y sus plugins infieren los targets
`build`, `lint`, `test` y `e2e` a partir de `project.json` y de los ficheros de configuracion
presentes. La cache por hash evita recompilar lo que no cambio, y el alias `@exodex/*` de
`tsconfig.base.json` resuelve las referencias entre librerias sin construir paquetes intermedios.

El criterio es **coste de migracion frente a beneficio**: la alternativa B exige reescribir los 8
`project.json` y duplicar la declaracion de cada target sin ganar cache por hash ni inferencia.

## Consecuencias

- **Positivas:** un solo `package.json` y un solo `node_modules`. Cache por hash: incremental.
  Los targets se infieren de la presencia de ficheros, asi que no hay una lista de scripts que
  se desincronice. `nx run-many` da un unico veredicto por puerta.
- **Negativas / deuda asumida:**
  - `nx.json` **no declara `tags`** en ningun proyecto, y `@nx/enforce-module-boundaries` esta
    activo con `enforceBuildableLibDependency: true`. La regla no puede distinguir que es
    buildable y de que no, y falla en `planet-renderer` y `ui-components` con *"Buildable libraries
    cannot import or export from non-buildable libraries"*. Es un problema de configuracion, no de
    codigo, y esta sin resolver.
  - El `package.json` raiz **no declara ni un script**. No hay `pnpm typecheck`, ni `pnpm lint`, ni
    `pnpm test`: los comandos son `nx run-many -t <target>`. Cualquiera que asuma los scripts
    estandar de npm no encontrara nada.
  - Conviven `pnpm-lock.yaml` y `package-lock.json`, y los tres `Dockerfile` usan pnpm mientras el
    runner de la imagen unificada usa `npm install --omit=dev`. Dos gestores de paquetes activos.
  - Nx es una dependencia de peso (136 paquetes solo el binario) y su cache exige un daemon o
    `NX_DAEMON=false`, como ya hacen los `Dockerfile`.
- **Que nos obliga a revisar esta decision:** si Nx deja de mantener soporte para la version de
  Angular en uso, si el grafo cacheado se desincroniza del arbol real en dos o mas
  publicaciones seguidas, o si la migracion a otro orquestador pasa a ser un cambio de un solo
  commit.
