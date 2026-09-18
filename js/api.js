const GEOCODING_ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search';
const REQUEST_TIMEOUT_MS = 10000;

function isValidCity(city) {
  return city !== null
    && typeof city === 'object'
    && typeof city.name === 'string'
    && city.name.trim().length > 0
    && Number.isFinite(city.latitude)
    && city.latitude >= -90
    && city.latitude <= 90
    && Number.isFinite(city.longitude)
    && city.longitude >= -180
    && city.longitude <= 180
    && (city.admin1 === undefined || typeof city.admin1 === 'string')
    && (city.country === undefined || typeof city.country === 'string');
}

function validateResults(data) {
  if (data === null || typeof data !== 'object' || Array.isArray(data) || data.error) {
    throw new Error('El servicio de ciudades devolvió una respuesta inválida. Inténtalo de nuevo.');
  }

  // Open-Meteo omite "results" cuando no encuentra coincidencias.
  const results = data.results === undefined ? [] : data.results;

  if (!Array.isArray(results) || !results.every(isValidCity)) {
    throw new Error('El servicio de ciudades devolvió datos inválidos. Inténtalo de nuevo.');
  }

  return results;
}

export async function searchCities(query) {
  const cityName = query.trim();

  if (cityName.length < 3) {
    throw new Error('Escribe al menos 3 caracteres para buscar una ciudad.');
  }

  const url = new URL(GEOCODING_ENDPOINT);
  url.search = new URLSearchParams({
    name: cityName,
    count: '5',
    language: 'es',
    format: 'json',
  }).toString();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`El servicio de ciudades no pudo completar la búsqueda (HTTP ${response.status}). Inténtalo de nuevo.`);
    }

    const data = await response.json();
    return validateResults(data);
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error('La búsqueda tardó demasiado. Revisa tu conexión e inténtalo de nuevo.');
    }

    if (error instanceof TypeError) {
      throw new Error('No se pudo conectar con el servicio de ciudades. Revisa tu conexión e inténtalo de nuevo.');
    }

    if (error instanceof SyntaxError) {
      throw new Error('El servicio de ciudades devolvió una respuesta inválida. Inténtalo de nuevo.');
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
