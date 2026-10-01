# repository-quality-gates

## ADDED Requirements

### Requirement: Higiene de ficheros del repositorio

El repositorio SHALL mantener ficheros de higiene en la raíz que fijen el tratamiento de finales de
línea y codificación, de modo que el diff de cualquier cambio futuro sea estable en Windows, Linux y
macOS.

#### Scenario: Final de línea unificado

- **WHEN** se hace `git add` de cualquier fichero de texto del repositorio
- **THEN** Git lo normaliza a LF en el índice por la regla `* text=auto eol=lf` de `.gitattributes`

#### Scenario: Ficheros de Windows conservan CRLF

- **WHEN** se hace `git add` de un fichero con extensión `.bat` o `.cmd`
- **THEN** se almacena con CRLF por la regla explícita de `.gitattributes`

#### Scenario: Configuración de editor uniforme

- **WHEN** un editor lee `.editorconfig`
- **THEN** aplica `charset = utf-8`, `end_of_line = lf`, `indent_style = space` e `indent_size = 2`
  a todos los ficheros del repositorio, y `indent_size = 4` a los ficheros Markdown

### Requirement: Puerta de duplicidad con ratchet

El repositorio SHALL medir la duplicidad de código con `jscpd` y SHALL fallar **solo** ante clones
nuevos o crecientes, nunca ante la deuda ya existente.

#### Scenario: Clones nuevos rompen la puerta

- **WHEN** `npx jscpd --config .jscpd.json .` encuentra un clon cuyo fingerprint no está en
  `.jscpd-baseline.json`
- **THEN** el comando sale con código distinto de cero

#### Scenario: La deuda preexistente no rompe la puerta

- **WHEN** `npx jscpd --config .jscpd.json .` se ejecuta sobre el árbol sin modificar
- **THEN** sale con código 0, aunque la duplicidad total medida sea del 1.28 %

#### Scenario: Un análisis vacío no sale en verde falso

- **WHEN** los patrones de `format` e `ignore` de `.jscpd.json` no coinciden con ningún fichero
- **THEN** el comando sale con código distinto de cero, porque `failOnEmpty` está activo

#### Scenario: Los clones preexistentes son identificables

- **WHEN** se lee `.jscpd-baseline.json`
- **THEN** contiene exactamente los fingerprints medidos sobre el árbol actual, y esos mismos clones
  están descritos en la documentación de puertas de calidad con su fichero y su rango de líneas

### Requirement: Clasificación previa de cualquier fallo de puerta

Cuando una puerta de calidad del repositorio falle, la documentación de operaciones SHALL indicar la
clasificación del fallo —dependencia, configuración o código— y el arreglo propuesto, sin que el
arreglo se haya aplicado.

#### Scenario: Un fallo de lint se puede clasificar

- **WHEN** unrul de `nx run-many -t lint` falla
- **THEN** `docs/operations/quality-gates.md` nombra la regla que falla y etiqueta el fallo como
  `dependencia`, `configuración` o `código`

#### Scenario: Un fallo sin arreglo aplicado

- **WHEN** se lee la sección de arreglo propuesto de un fallo
- **THEN** el arreglo está descrito en prosa y **no** aplicado en el árbol

### Requirement: Logging y configuración a través de los canales del framework

El código de producto SHALL emitir logs a través del `Logger` del framework que lo Aloja y SHALL leer
variables de entorno a través del módulo de configuración del framework, nunca a través de
`console.*` ni de acceso directo a `process.env`.

#### Scenario: Código de producto sin console

- **WHEN** se busca `console.log|warn|error|info|debug` en `apps/` y `libs/`, excluyendo el
  andamiaje de tests end-to-end
- **THEN** no hay coincidencias

#### Scenario: La API lee su configuración por inyección

- **WHEN** se busca `process.env` en el código de la API
- **THEN** no hay coincidencias, porque toda variable se resuelve con el servicio de configuración y
  conserva su valor por defecto previo
