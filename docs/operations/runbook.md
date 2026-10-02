# Runbook

Sintomas, diagnostico y respuesta. Cada entrada dice **como se comprueba** antes de actuar: en este
repositorio no hay suite de tests que sirva de red (ver
[`quality-gates.md`](quality-gates.md)), asi que el diagnostico es manual.

## 1. La web muestra datos de ejemplo, no datos reales

**Sintoma:** la interfaz se ve correcta pero los datos no cuadran con la NASA.

**Diagnostico:**

```powershell
# 1. ¿el navegador está viendo el mock?
#    buscar en la consola del navegador: "API no disponible, usando datos mock"
# 2. ¿la API responde?
curl http://localhost:3039/api/exoplanets/meta/stats
```

Si el endpoint responde, el problema esta en la **web**: `exoplanet-api.service.ts` cayo al mock
porque la peticion fallo. Causas habituales: `CORS_ORIGIN` mal configurado (bloquea en el
navegador antes de llegar al servidor), o la API levantada en un puerto distinto del que espera la
web.

Si el endpoint **no** responde, el problema esta en la API: ver seccion 2.

**Nota:** este comportamiento es intencionado, no un bug. La decision esta en
[ADR-0002](../../docs/adr/0002-cache-en-memoria-y-disco-para-el-catalogo.md).

## 2. La API arranca pero responde vacio o lento

**Sintoma:** `/api/exoplanets` tarda, o devuelve `data: []` con `total: 0`.

**Diagnostico:**

```powershell
# ¿la API está escuchando?
curl http://localhost:3000/api/exoplanets/meta/status

# ¿hay caché en disco?
ls -la data/exoplanets-cache.json      # linux / contenedor
Get-Item .\data\exoplanets-cache.json   # windows
```

**Lectura del resultado:**

| Situacion | Causa probable | Respuesta |
|---|---|---|
| `upToDate: false`, catalogo vacio | La NASA no respondio en el arranque | Esperar a `CACHE_TTL_SECONDS` (3600 s) o reiniciar la API |
| `upToDate: false`, catalogo parcial | Transformacion fallida a mitad | Revisar logs de `ExoplanetService` |
| `upToDate: true`, `data: []` | Cache en disco corrupta o vacia | Borrar `exoplanets-cache.json` y reiniciar |

El arranque **no espera** a la NASA: el proceso escucha en el puerto siempre. Que el puerto este
abierto no significa que el catalogo este cargado. `meta/status` es la unica fuente de verdad.

## 3. La NASA no responde y la API no se recuperan

La API consulta la NASA a TAP (`NASA_TAP_BASE_URL`). Si ese endpoint esta caido o cambia, la
consulta falla, el `logger.error` lo registra y el servicio **sigue escuchando con el catalogo
anterior o vacio**. No hay reintento con backoff: la siguiente oportunidad es el siguiente tick de
`CACHE_TTL_SECONDS`, hasta 1 hora despues.

**Respuesta corta:** apuntar `NASA_TAP_BASE_URL` a una replica, o reiniciar la API tras restaurar
el upstream. `meta/status` y el log `'Failed to refresh data'` son las señales.

## 4. El build de la imagen falla

| Sintoma | Causa | Respuesta |
|---|---|---|
| `pnpm install --frozen-lockfile` falla | `package-lock.json` y `pnpm-lock.yaml` conviven y no coinciden | El `Dockerfile` copia `package.json pnpm-lock.yaml .npmrc`. Revisar que los tres esten presentes y que `pnpm-lock.yaml` no este desactualizado respecto a `package.json`. |
| Nx no arranca en el contenedor | Daemon o Nx Cloud | El `Dockerfile` ya pasa `NX_DAEMON=false NX_NO_CLOUD=true`. Si se construye a mano, exportar ambas. |
| `Cannot find module` en runtime | Dependencias no copiadas | `Dockerfile.api` hace `npm install --omit=dev --ignore-scripts` sobre `dist/apps/api`. Si falla, revisar que `api:prune-lockfile` se haya ejecutado. |

## 5. `nx test` falla en todos los proyectos

**Esto es lo esperado.** Los targets `test` no encuentran ficheros porque **el repositorio no tiene
ningun `*.spec.ts`**. No es una regresion: ver la seccion 4.2 de
[`quality-gates.md`](quality-gates.md).

Antes de investigar mas, comprobarlo:

```powershell
npx nx run-many -t test --skip-nx-cache
# esperado: "No tests found" en web, ui-components, shared-types, planet-renderer
```

## 6. `nx lint` falla

**Tambien esperado**, y preexistente. 43 errores en `planet-renderer`, `ui-components` y `web`, con su
clasificacion en la seccion 4.1 de [`quality-gates.md`](quality-gates.md).

```powershell
npx nx run-many -t lint --skip-nx-cache
```

Si un fallo **nuevo** aparece respecto a los 43 conocidos, es una regresion de este change: revisar
`git diff` sobre `apps/api/src/main.ts`, `apps/web/src/main.ts` y `exoplanet-api.service.ts`, que
son los tres unicos ficheros de codigo tocados.

## 7. La duplicidad dispara la puerta

```powershell
npx jscpd --config .jscpd.json --fail-on-new-clones --fail-on-empty .
```

Un fallo significa **duplicacion nueva**, no deuda existente. La deuda esta registrada en
`.jscpd-baseline.json`. Si el clon es legitimo (lista de imports, plantilla, constantes
intencionadamente repetidas), marcar el bloque con
`/* jscpd:ignore-start */ ... /* jscpd:ignore-end */`. Si es un clon accidental, se corrige en el
codigo. **Nunca** se regenera la linea base para silenciar el fallo sin revisar el clon.

El mayor cluster actual es el **catalogo i18n duplicado** entre `libs/i18n/src/assets/i18n/` y
`apps/web/public/assets/i18n/`: 128 de las 179 lineas duplicadas. Si se anade una traduccion, hay que
tocarlos los dos, o mejor, generar el asset desde la fuente.

## 8. Rotacion de la version de Node

La imagen fija `node:22-alpine` en los tres `Dockerfile`. Cambiar de version mayor exige:
actualizar la linea base en los tres ficheros, validar que `webpack-cli`, `@swc/core` y
`@angular/build` siguen soportando la nueva, y volver a construir las tres imagenes. El
`package.json` raiz no declara `engines.node`, asi que **nada impide hoy una incompatibilidad
silenciosa** entre el Node local y el de la imagen.
