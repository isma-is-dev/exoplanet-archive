# Contexto de sistema

Vista **C4 nivel 1 (contexto)** y **nivel 2 (contenedores)** de `exodex`, en Mermaid para que
GitHub lo renderice sin tooling. El detalle por proyecto está en
[`ARCHITECTURE.md`](../../ARCHITECTURE.md).

## C4 · Nivel 1 — Contexto de sistema

```mermaid
C4Context
  title C4 L1 — exodex (contexto de sistema)

  Person(user, "Usuario", "Navegador. Busca, filtra y compara exoplanetas.")

  System(exodex, "exodex", "Visor web de exoplanetas. Sin cuentas ni base de datos: el catalogo vive en memoria.")
  System_Ext(nasa, "NASA Exoplanet Archive", "Catalogo publico de exoplanetas, protocolo TAP/sync.")

  Rel(user, exodex, "Consulta exoplanetas, filtra, ordena y abre fichas", "HTTPS")
  Rel(exodex, nasa, "Descarga el catalogo y lo normaliza", "HTTPS / TAP")
```

`exodex` no expone nada más que HTTP de lectura. No tiene autenticación, no escribe y no tiene
estado entre peticiones: todo el estado es la caché en memoria y el fichero en disco.

## C4 · Nivel 2 — Contenedores

```mermaid
C4Container
  title C4 L2 — exodex (contenedores Nx)

  Person(user, "Usuario", "Navegador")

  System_Boundary(exo, "exodex") {
    Container(web, "apps/web", "Angular 21.2, standalone + SSR", "UI, rutas, estado de filtros. Llama a la API y cae a datos mock si falla.")
    Container(api, "apps/api", "NestJS 11 sobre Express 4", "Endpoint de exoplanetas, cache en memoria y disco, transformacion del feed de la NASA.")
    Container(shared, "libs/shared-types", "TypeScript puro", "Contrato de dominio compartido entre web y api.")
    Container(renderer, "libs/planet-renderer", "TypeScript puro, buildable con esbuild", "Algoritmos SVG de planeta y estrella.")
    Container(components, "libs/ui-components", "Angular 21.2, 12 componentes standalone", "Piezas visuales reutilizables.")
    Container(i18n, "libs/i18n", "ngx-translate 17", "Catalogo ES/EN y configuracion del loader.")
    Container(apiE2E, "apps/api-e2e", "Playwright 1.36", "E2E de la API, con global-setup que la levanta.")
    Container(webE2E, "apps/web-e2e", "Playwright 1.36", "E2E de la web.")
  }

  System_Ext(nasa, "NASA Exoplanet Archive", "Catalogo publico de exoplanetas.")
  System_Ext(nas, "Nginx + supervisor", "Serve la web estatica y mantiene la API viva en la imagen unificada.")

  Rel(user, web, "Usa", "HTTPS")
  Rel(web, components, "Compone", "")
  Rel(web, renderer, "Dibuja planetas", "")
  Rel(web, shared, "Importa tipos", "")
  Rel(web, i18n, "Traduce", "")
  Rel(web, api, "GET /api/exoplanets", "JSON/HTTP")
  Rel(api, shared, "Importa tipos", "")
  Rel(api, nasa, "Descarga y cachea el catalogo", "TAP/HTTPS")
  Rel(api, nas, "Registra y reinicia", "supervisord")
  Rel(apiE2E, api, "Verifica", "HTTP")
  Rel(webE2E, web, "Verifica", "HTTP")
```

## Lectura del diagrama

- **Dos aplicaciones, cuatro librerías.** Las cuatro librerías se resuelven por alias
  `@exodex/*` declarados en `tsconfig.base.json`: Nx compila cada proyecto por separado y comparte
  el codigo fuente, no paquetes construidos.
- **Una sola direccion entre web y api.** La web consume la API; la API no conoce al front. El
  unico acoplamiento es el tipo `Exoplanet` de `libs/shared-types`.
- **La API es dueño de la cache.** La web no cachea el catalogo: si la API cae, `web` sirve datos
  mock desde `exoplanet-mock.service.ts` para que la interfaz siga siendo usable.
- **La NASA es la unica dependencia externa de datos**, y se consulta de forma diferida: el arranque
  no la espera. Un arranque lento o caido de la NASA degrada el servicio, no lo impide.

## Donde encaja cada fichero de configuracion

| Fichero | Papel en el diagrama |
|---|---|
| `nx.json` | Declara los plugins que infieren los targets `build`, `lint`, `test` y `e2e` |
| `tsconfig.base.json` | Define los alias `@exodex/*` que materializan las flechas entre contenedores |
| `apps/web/src/app/app.config.ts` | Ensambla providers de la web (router, HTTP, i18n, interceptores) |
| `apps/api/src/app/app.module.ts` | Ensambla `ConfigModule` global y `ExoplanetModule` |
| `docker-compose.yml` | Recorta los contenedores a dos servicios: `web` y `api` |
