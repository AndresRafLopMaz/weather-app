# Contexto del repositorio

- El repositorio está en su estado inicial: solo existe `.gitignore` además de estas instrucciones. No hay aplicación, framework, manifiestos ni comandos configurados de desarrollo, build, lint o pruebas.
- `.gitignore` excluye `.env` y `.env.*`; `.env.example` es la única excepción explícita para versionar una plantilla de configuración sin secretos.

## Decisiones del proyecto

### Stack tecnológico

- La aplicación utilizará HTML5, CSS3 y JavaScript puro.
- No se utilizarán frameworks ni dependencias externas salvo que exista una necesidad técnica y se apruebe previamente.
- Se priorizará una solución sencilla que pueda explicarse y mantenerse con facilidad.

### Ejecución local

- La aplicación debe ejecutarse localmente desde la raíz del proyecto con `py -m http.server 5500`.
- Una vez iniciado el servidor, se accede desde `http://localhost:5500`.
- El servidor local se detiene con `Ctrl + C` en la terminal.
- No se deben instalar dependencias adicionales únicamente para servir la aplicación.

### Fuente de datos

- La aplicación utilizará Open-Meteo como fuente de información meteorológica.
- `geocoding-api.open-meteo.com` se utilizará para convertir el nombre de una ciudad en coordenadas geográficas.
- `api.open-meteo.com` se utilizará para consultar el clima actual y el pronóstico mediante latitud y longitud.
- Open-Meteo no requiere una llave de API para el uso planteado en este proyecto, por lo que no deben incluirse credenciales en el código.

### Requisitos funcionales

- Permitir buscar una ciudad y resolver sus coordenadas.
- Mostrar temperatura actual, sensación térmica, condición del cielo, velocidad del viento y humedad.
- Mostrar un pronóstico mínimo de tres días con temperaturas máximas y mínimas.
- Mostrar un estado visible de carga mientras se consulta la API.
- Mostrar mensajes de error comprensibles ante una ciudad inexistente o problemas de conexión.
- Mantener una interfaz adaptable a computadoras y dispositivos móviles.

### Convenciones de desarrollo

- Utilizar nombres descriptivos en variables y funciones.
- Usar `const` por defecto y `let` únicamente cuando un valor necesite reasignarse.
- Mantener las funciones enfocadas en una sola responsabilidad.
- Separar presentación, estilos y lógica de JavaScript de forma clara.
- Manejar explícitamente errores de red y respuestas inválidas de las API.
- No agregar dependencias, frameworks o configuraciones nuevas sin justificar primero su necesidad.
- Revisar y probar cada cambio antes de continuar con la siguiente funcionalidad.
- La estructura definitiva de archivos y las decisiones de arquitectura se definirán y revisarán en modo Plan antes de comenzar la implementación.

### Arquitectura aprobada

- La aplicación será una aplicación web de una sola página ejecutada directamente en el navegador.
- La estructura principal será:
  - `index.html`: estructura semántica de la interfaz.
  - `css/styles.css`: estilos, diseño responsive y estados visuales.
  - `js/app.js`: coordinación del flujo, eventos y actualización del DOM.
  - `js/api.js`: construcción de URLs, peticiones a Open-Meteo, validación HTTP y control de tiempo límite.
  - `js/weather-codes.js`: correspondencia entre códigos WMO y descripciones meteorológicas en español.
  - `README.md`: instrucciones de ejecución, decisiones técnicas y pruebas manuales.
- JavaScript utilizará módulos nativos del navegador y no requerirá herramientas de compilación.
- Las búsquedas se validarán después de aplicar `trim()` y requerirán un mínimo de 3 caracteres.
- Si la geocodificación devuelve varias ciudades, el usuario podrá seleccionar la coincidencia correcta en lugar de elegir automáticamente el primer resultado.
- Las consultas de red tendrán manejo explícito de errores y un tiempo límite mediante `AbortController`.
- El pronóstico mostrará tres días y utilizará la zona horaria correspondiente a la ubicación consultada.
- La implementación se realizará por etapas y cada incremento funcional será revisado antes de continuar.