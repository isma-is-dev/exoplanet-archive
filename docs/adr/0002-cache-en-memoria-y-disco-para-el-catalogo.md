# ADR-0002 · Cache en memoria y disco para el catalogo

- Estado: Accepted (2026-10-01)
- Supersedes: —
- Superseded by: —

## Contexto

El catalogo de exoplanetas de la NASA cambia con frecuencia baja (se publica de forma eventual, no
por streaming) y ocupa un volumen que cabe holgadamente en memoria de un proceso Node. La consulta
TAP de la NASA es lenta y tiene limite de peticiones.

Al mismo tiempo, `exodex` no tiene base de datos: no hay Postgres, ni Mongo, ni migraciones. El
catalogo se carga al arrancar y se mantiene en memoria.

Se evaluaron tres opciones:

- **A · Sin cache.** Consultar la NASA en cada peticion. Simple, pero lento yDependent de la
  disponibilidad de un tercero.
- **B · Solo memoria.** Cargar en `onModuleInit` y no volver a consultar mientras viva el proceso.
- **C · Memoria + disco con TTL.** La memoria es la fuente de lectura; el disco es la copia
  persistente entre reinicios.

## Decision

**C · Memoria + disco con TTL.** `ExoplanetService` mantiene el array en memoria y un `Map` por id
mas un indice de busqueda invertido. Al arrancar, y despues cada `CACHE_TTL_SECONDS` (3600 s), un
`loadData()` comprueba la antiguedad de `data/exoplanets-cache.json`; si es menor que
`DISK_CACHE_TTL_HOURS` (24 h) carga de disco y no sale a red. Solo si no hay cache o esta caducada
consulta la NASA y reescribe el fichero.

Encima hay una segunda cache, en memoria y mas corta, de resultados de filtrado
(`FILTER_CACHE_TTL_MS = 30_000`, `MAX_FILTER_CACHE_SIZE = 50` entradas), para que las combinaciones
de filtros frecuentes no reordenen el array completo en cada peticion.

El criterio es **coste de arranque contra coste de terceros**: B sola obliga a golpear la NASA en
cada despliegue y en cada reinicio, y C conserva el arranque instantaneo cuando el upstream no
responde, sin introducir una base de datos que el proyecto no necesita.

El arranque **no espera** a la NASA: `onModuleInit` lanza `loadData()` sin `await`, de modo que el
proceso escucha siempre en el puerto 3000, con el catalogo vacio o completo segun lo que hubiera.

## Consecuencias

- **Positivas:** sin dependencias de infraestructura. Arranque independiente de la NASA. La web
  degrada a `exoplanet-mock.service.ts` si la API no responde. Cachear en reinicios si la NASA esta
  caida. Indices en memoria: busqueda y filtrado O(1) sobre el `Map` por id.
- **Negativas / deuda asumida:**
  - El catalogo **esta desactualizado por diseño** hasta `DISK_CACHE_TTL_HOURS`. El endpoint
    `api/exoplanets/meta/status` expone la antiguedad, pero ningun cliente lo consulta para avisar.
  - `DISK_CACHE_PATH` se resuelve con `process.cwd()`, asi que la ruta efectiva depende del
    directorio de trabajo del proceso, no del modulo. Solo el volumen Docker
    `cache_data:/app/data` garantiza que la cache sobreviva a un redeploy.
  - La cache de filtros no tiene invalidacion por evento: si un loadData() termina con exito y reemplaza el
    array, las entradas cacheadas siguen sirviendo resultados del array anterior durante su TTL de
    30 s. La ventana es corta, pero es una inconsistencia real.
  - `MAX_FILTER_CACHE_SIZE = 50` es un limite arbitrario sin politica de expulsión declarada: si se
    supera, las combinaciones mas antiguas siguen ocupando sitio hasta que expire su TTL.
  - No hay metricas ni trazas del acierto de la cache, solo un `Logger.log`. No se puede saber si
    el 24 h de TTL es lo adecuado sin medir.
- **Que nos obliga a revisar esta decision:** si el catalogo de la NASA llega a cambiar con
  frecuencia sub-diaria y la diferencia de un dia pasa a ser visible para el usuario, si el
  volumen deja de caber en memoria de forma cómoda, o si la ventana de 30 s de la cache de filtros
  produce resultados contradictorios reportados por usuarios.
