# Despliegue

Estado actual, derivado de `Dockerfile`, `Dockerfile.api`, `Dockerfile.web`,
`docker-compose.yml` y `supervisord.conf`. Detalle de incidentes en
[`runbook.md`](runbook.md).

## 1. Imagen unificada o imagenes separadas

Conviven tres ficheros `Dockerfile`. No son alternativos por capricho: cubren dos modos de despliegue
distintos.

| Fichero | Imagen | Contenido | Puerto | Lo usa |
|---|---|---|---|---|
| `Dockerfile` | `node:22-alpine` + nginx + supervisor | Web estatica **y** API | 80 | Despliegue de una sola unidad |
| `Dockerfile.api` | `node:22-alpine` | Solo `dist/apps/api` | 3000 | `docker-compose.yml` |
| `Dockerfile.web` | `node:22-alpine` + nginx | Solo `dist/apps/web/browser` | 80 | `docker-compose.yml` |

La imagen unificada arranca `supervisord` con `supervisord.conf`, que mantiene la API viva y sirve
los estaticos de Angular con nginx. Expone **un solo puerto (80)**: nginx hace de proxy inverso hacia
la API.

## 2. Docker Compose (recomendado para desarrollo y homerrotaje)

```powershell
Copy-Item .env.example .env    # ajustar CORS_ORIGIN y PORT
docker compose up --build
```

| Servicio | Puerto host | Puerto interno | Notas |
|---|---|---|---|
| `web` | **8089** | 80 | nginx. Depende de `api`. |
| `api` | **3039** | 3000 | Lee `.env`. `restart: unless-stopped`. |

El volumen `cache_data` se monta en `/app/api/data` (imagen unificada) o `/app/data`
(`Dockerfile.api`), que es donde `ExoplanetService` escribe `exoplanets-cache.json`. Es lo unico que
hace que la cache sobreviva a un `docker compose down`.

## 3. Imagen unificada a mano

```powershell
docker build -f Dockerfile -t exodex:local .
docker run --rm -p 8080:80 -e PORT=3000 -e CORS_ORIGIN=http://localhost:8080 exodex:local
```

## 4. Imagenes separadas a mano

```powershell
docker build -f Dockerfile.api -t exodex-api:local .
docker build -f Dockerfile.web -t exodex-web:local .
```

## 5. Requisitos de build

- **Node 22** (`node:22-alpine`).
- **pnpm**: los tres `Dockerfile` hacen `npm install -g pnpm` y `pnpm install --frozen-lockfile`.
  El `package.json` raiz **no declara `packageManager`**, asi que la version de pnpm no esta fijada
  y el build depende de la ultima publicada.
- `.npmrc` debe existir en el contexto de build: se copia junto a `package.json` y `pnpm-lock.yaml`.
- El build necesita `NX_DAEMON=false NX_NO_CLOUD=true` para que Nx no intente arrancar su daemon ni
  su agente de Nx Cloud dentro del contenedor.

## 6. Variables de entorno obligatorias en produccion

| Variable | Default | Por que importa |
|---|---|---|
| `CORS_ORIGIN` | `https://exodex.zemios.dev` | Origen unico permitido. Si no se ajusta al dominio real, **toda peticion de la web al servidor se bloquea en el navegador**. |
| `PORT` | `3000` | Debe coincidir con el puerto que publica el compose (`3039:3000`). |

Las demas (`NASA_TAP_BASE_URL`, `DISK_CACHE_TTL_HOURS`, `DISK_CACHE_PATH`, `CACHE_TTL_SECONDS`) tienen
default razonable y no hace falta fijarlas para un despliegue normal. Ver `.env.example`.

## 7. Orden de despliegue

1. `nx build api` y `nx build web` (o dejar que lo haga el `Dockerfile`).
2. Levantar `api` **antes** que `web`. La web arranca y cae a datos mock si la API no responde, asi
   que no se rompe, pero muestra datos falsos.
3. Verificar `GET api/exoplanets/meta/status`: debe indicar catalogo cargado y su antiguedad.
4. Verificar `GET api/exoplanets/meta/stats` y que la primera pagina devuelve exoplanetas reales.
5. Comprobar en el navegador que la web consume de la API y no del mock.

## 8. Notas de seguridad operative

- No hay autenticacion en ninguna capa: la API es de lectura y publica el catalogo completo. Si se
  expone fuera del dominio previsto, `CORS_ORIGIN` es la unica barrera.
- La API escribe en disco (`/app/api/data`). El volumen `cache_data` no tiene limite de tamano
  configurado; el fichero de cache crece con el catalogo.
- El contenedor unificado corre nginx y la API en el mismo proceso supervisor. Un fallo de la API no
  tumba nginx, y viceversa, porque estan en procesos separados.
