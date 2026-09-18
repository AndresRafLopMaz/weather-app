const GEOCODING_ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_ENDPOINT = 'https://api.open-meteo.com/v1/forecast';
const REQUEST_TIMEOUT_MS = 10000;
const CURRENT_WEATHER_UNITS = {
  temperature_2m: '°C',
  apparent_temperature: '°C',
  relative_humidity_2m: '%',
  weather_code: 'wmo code',
  wind_speed_10m: 'km/h',
};

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

  const data = await requestJson(url, {
    http: 'El servicio de ciudades no pudo completar la búsqueda',
    timeout: 'La búsqueda tardó demasiado. Revisa tu conexión e inténtalo de nuevo.',
    network: 'No se pudo conectar con el servicio de ciudades. Revisa tu conexión e inténtalo de nuevo.',
    invalid: 'El servicio de ciudades devolvió una respuesta inválida. Inténtalo de nuevo.',
  });
  return validateResults(data);
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function validateCurrentWeather(data) {
  if (!isRecord(data) || data.error || !isRecord(data.current) || !isRecord(data.current_units)) {
    throw new Error('El servicio meteorológico devolvió una respuesta inválida. Inténtalo de nuevo.');
  }

  const current = data.current;
  const validFields = Object.entries(CURRENT_WEATHER_UNITS).every(([field, unit]) => (
    Number.isFinite(current[field]) && data.current_units[field] === unit
  ));

  if (!validFields
    || current.relative_humidity_2m < 0
    || current.relative_humidity_2m > 100
    || current.wind_speed_10m < 0
    || !Number.isInteger(current.weather_code)
    || current.weather_code < 0) {
    throw new Error('El servicio meteorológico devolvió datos o unidades inválidos. Inténtalo de nuevo.');
  }

  return current;
}

function validateDailyForecast(data) {
  const daily = data.daily;

  if (!isRecord(daily)
    || !Array.isArray(daily.time)
    || !Array.isArray(daily.temperature_2m_max)
    || !Array.isArray(daily.temperature_2m_min)
    || daily.time.length < 3
    || daily.temperature_2m_max.length !== daily.time.length
    || daily.temperature_2m_min.length !== daily.time.length
    || !daily.time.every((date) => typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date))
    || !daily.temperature_2m_max.every(Number.isFinite)
    || !daily.temperature_2m_min.every(Number.isFinite)) {
    throw new Error('El servicio meteorológico devolvió un pronóstico incompleto o inválido. Inténtalo de nuevo.');
  }

  return daily.time.slice(0, 3).map((date, index) => ({
    date,
    maximumTemperature: daily.temperature_2m_max[index],
    minimumTemperature: daily.temperature_2m_min[index],
  }));
}

export async function getWeather(latitude, longitude) {
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90
    || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new Error('Las coordenadas de la ciudad no son válidas. Busca y selecciona la ciudad de nuevo.');
  }

  const url = new URL(WEATHER_ENDPOINT);
  url.search = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: Object.keys(CURRENT_WEATHER_UNITS).join(','),
    daily: 'temperature_2m_max,temperature_2m_min',
    forecast_days: '3',
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    timezone: 'auto',
  }).toString();

  const data = await requestJson(url, {
    http: 'El servicio meteorológico no pudo completar la consulta',
    timeout: 'La consulta del clima tardó demasiado. Revisa tu conexión e inténtalo de nuevo.',
    network: 'No se pudo conectar con el servicio meteorológico. Revisa tu conexión e inténtalo de nuevo.',
    invalid: 'El servicio meteorológico devolvió una respuesta inválida. Inténtalo de nuevo.',
  });
  return {
    current: validateCurrentWeather(data),
    forecast: validateDailyForecast(data),
  };
}

async function requestJson(url, messages) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`${messages.http} (HTTP ${response.status}). Inténtalo de nuevo.`);
    }

    return await response.json();
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error(messages.timeout);
    }

    if (error instanceof TypeError) {
      throw new Error(messages.network);
    }

    if (error instanceof SyntaxError) {
      throw new Error(messages.invalid);
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
