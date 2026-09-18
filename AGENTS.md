# Contexto del repositorio

- El repositorio está en su estado inicial: solo existe `.gitignore` además de estas instrucciones. No hay aplicación, framework, manifiestos ni comandos configurados de desarrollo, build, lint o pruebas.
- `.gitignore` excluye `.env` y `.env.*`; `.env.example` es la única excepción explícita para versionar una plantilla de configuración sin secretos.

## Decisiones del proyecto

### Stack tecnológico

- La aplicación utilizará HTML5, CSS3 y JavaScript puro.
- No se utilizarán frameworks ni dependencias externas salvo que exista una necesidad técnica y se apruebe previamente.
- Se priorizará una solución sencilla que pueda explicarse y mantenerse con facilidad.

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