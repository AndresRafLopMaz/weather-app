import { searchCities, getCurrentWeather } from './api.js';

const searchForm = document.querySelector('#city-search-form');
const cityInput = document.querySelector('#city-query');
const searchButton = document.querySelector('#search-button');
const searchStatus = document.querySelector('#search-status');
const resultsSection = document.querySelector('#city-results');
const citySelect = document.querySelector('#city-select');
const selectedCityDetails = document.querySelector('#selected-city');
const weatherButton = document.querySelector('#weather-button');
const weatherStatus = document.querySelector('#weather-status');
const weatherSection = document.querySelector('#current-weather');
const weatherCity = document.querySelector('#weather-city');
const weatherTemperature = document.querySelector('#weather-temperature');
const weatherApparentTemperature = document.querySelector('#weather-apparent-temperature');
const weatherHumidity = document.querySelector('#weather-humidity');
const weatherWindSpeed = document.querySelector('#weather-wind-speed');
const weatherCode = document.querySelector('#weather-code');

let cities = [];
let isLoading = false;
let isWeatherLoading = false;

function setStatus(message, isError = false) {
  searchStatus.textContent = message;
  searchStatus.classList.toggle('error', isError);
}

function setLoading(loading) {
  isLoading = loading;
  searchButton.textContent = loading ? 'Buscando…' : 'Buscar';
  searchForm.setAttribute('aria-busy', String(loading));
  updateControls();
}

function updateControls() {
  const busy = isLoading || isWeatherLoading;
  cityInput.disabled = busy;
  searchButton.disabled = busy;
  citySelect.disabled = busy;
  weatherButton.disabled = busy || !getSelectedCity();
}

function setWeatherStatus(message, isError = false) {
  weatherStatus.textContent = message;
  weatherStatus.classList.toggle('error', isError);
}

function setWeatherLoading(loading) {
  isWeatherLoading = loading;
  weatherButton.textContent = loading ? 'Consultando…' : 'Consultar clima actual';
  weatherSection.setAttribute('aria-busy', String(loading));
  updateControls();
}

function clearWeather() {
  weatherSection.hidden = true;
  weatherCity.textContent = '';
  weatherTemperature.textContent = '';
  weatherApparentTemperature.textContent = '';
  weatherHumidity.textContent = '';
  weatherWindSpeed.textContent = '';
  weatherCode.textContent = '';
  setWeatherStatus('');
}

function clearResults() {
  cities = [];
  citySelect.replaceChildren();
  selectedCityDetails.textContent = '';
  resultsSection.hidden = true;
  clearWeather();
  updateControls();
}

function getCityLabel(city) {
  const region = city.admin1?.trim() || 'Región no disponible';
  const country = city.country?.trim() || 'País no disponible';
  return `${city.name}, ${region}, ${country}`;
}

function getSelectedCity() {
  return citySelect.value === '' ? undefined : cities[Number(citySelect.value)];
}

function showSelectedCity() {
  const city = getSelectedCity();
  clearWeather();

  selectedCityDetails.textContent = city
    ? `Ciudad seleccionada: ${getCityLabel(city)}. Latitud: ${city.latitude}. Longitud: ${city.longitude}.`
    : 'Selecciona una ciudad para ver sus coordenadas.';
  updateControls();
}

function showResults() {
  if (cities.length > 1) {
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Selecciona una ciudad';
    placeholder.disabled = true;
    placeholder.selected = true;
    citySelect.append(placeholder);
  }

  cities.forEach((city, index) => {
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = getCityLabel(city);
    citySelect.append(option);
  });

  citySelect.value = cities.length === 1 ? '0' : '';
  resultsSection.hidden = false;
  showSelectedCity();
}

async function handleSearch(event) {
  event.preventDefault();

  if (isLoading || isWeatherLoading) {
    return;
  }

  const query = cityInput.value.trim();
  cityInput.value = query;
  cityInput.removeAttribute('aria-invalid');
  clearResults();

  if (query.length < 3) {
    cityInput.setAttribute('aria-invalid', 'true');
    setStatus('Escribe al menos 3 caracteres para buscar una ciudad.', true);
    cityInput.focus();
    return;
  }

  setLoading(true);
  setStatus('Buscando ciudades…');

  try {
    cities = await searchCities(query);

    if (cities.length === 0) {
      setStatus('No se encontraron ciudades con ese nombre. Revisa la escritura o prueba con otro nombre.');
      return;
    }

    showResults();
    setStatus(cities.length === 1
      ? 'Se encontró una ciudad y se seleccionó automáticamente.'
      : `Se muestran ${cities.length} coincidencias. Selecciona la ciudad correcta.`);
  } catch (error) {
    setStatus(error instanceof Error ? error.message : 'No se pudo completar la búsqueda. Inténtalo de nuevo.', true);
  } finally {
    setLoading(false);
  }
}

function showCurrentWeather(city, current) {
  weatherCity.textContent = getCityLabel(city);
  weatherTemperature.textContent = `${current.temperature_2m} °C`;
  weatherApparentTemperature.textContent = `${current.apparent_temperature} °C`;
  weatherHumidity.textContent = `${current.relative_humidity_2m} %`;
  weatherWindSpeed.textContent = `${current.wind_speed_10m} km/h`;
  weatherCode.textContent = String(current.weather_code);
  weatherSection.hidden = false;
}

async function handleWeatherRequest() {
  if (isLoading || isWeatherLoading) {
    return;
  }

  const city = getSelectedCity();
  if (!city) {
    return;
  }

  clearWeather();
  setWeatherLoading(true);
  setWeatherStatus(`Consultando el clima actual de ${getCityLabel(city)}…`);

  try {
    const current = await getCurrentWeather(city.latitude, city.longitude);
    showCurrentWeather(city, current);
    setWeatherStatus('Clima actual actualizado.');
  } catch (error) {
    setWeatherStatus(error instanceof Error ? error.message : 'No se pudo consultar el clima. Inténtalo de nuevo.', true);
  } finally {
    setWeatherLoading(false);
  }
}

searchForm.addEventListener('submit', handleSearch);
citySelect.addEventListener('change', showSelectedCity);
weatherButton.addEventListener('click', handleWeatherRequest);
