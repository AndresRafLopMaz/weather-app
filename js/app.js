import { searchCities, getWeather } from './api.js';
import { getWeatherDescription } from './weather-codes.js';

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
const weatherCondition = document.querySelector('#weather-condition');
const forecastSection = document.querySelector('#weather-forecast');
const forecastDays = document.querySelector('#forecast-days');

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
  weatherButton.textContent = loading ? 'Consultando…' : 'Consultar clima y pronóstico';
  weatherSection.setAttribute('aria-busy', String(loading));
  forecastSection.setAttribute('aria-busy', String(loading));
  updateControls();
}

function clearWeather() {
  weatherSection.hidden = true;
  weatherCity.textContent = '';
  weatherTemperature.textContent = '';
  weatherApparentTemperature.textContent = '';
  weatherHumidity.textContent = '';
  weatherWindSpeed.textContent = '';
  weatherCondition.textContent = '';
  forecastSection.hidden = true;
  forecastDays.replaceChildren();
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
  weatherCondition.textContent = getWeatherDescription(current.weather_code);
  weatherSection.hidden = false;
}

function formatForecastDate(date) {
  // daily.time ya contiene la fecha local de la ciudad: no convertirla a un instante.
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}

function showForecast(forecast) {
  forecastDays.replaceChildren();

  forecast.forEach((day) => {
    const card = document.createElement('article');
    card.className = 'forecast-card';
    const heading = document.createElement('h3');
    const date = document.createElement('time');
    date.dateTime = day.date;
    date.textContent = formatForecastDate(day.date);
    heading.append(date);

    const temperatures = document.createElement('dl');
    temperatures.className = 'forecast-values';

    for (const [label, value] of [['Máxima', day.maximumTemperature], ['Mínima', day.minimumTemperature]]) {
      const row = document.createElement('div');
      const term = document.createElement('dt');
      const description = document.createElement('dd');
      term.textContent = label;
      description.textContent = `${value} °C`;
      row.append(term, description);
      temperatures.append(row);
    }

    card.append(heading, temperatures);
    forecastDays.append(card);
  });

  forecastSection.hidden = false;
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
  setWeatherStatus(`Consultando el clima actual y el pronóstico de ${getCityLabel(city)}…`);

  try {
    const { current, forecast } = await getWeather(city.latitude, city.longitude);
    showCurrentWeather(city, current);
    showForecast(forecast);
    setWeatherStatus('Clima actual y pronóstico de tres días actualizados.');
  } catch (error) {
    setWeatherStatus(error instanceof Error ? error.message : 'No se pudo consultar el clima. Inténtalo de nuevo.', true);
  } finally {
    setWeatherLoading(false);
  }
}

searchForm.addEventListener('submit', handleSearch);
citySelect.addEventListener('change', showSelectedCity);
weatherButton.addEventListener('click', handleWeatherRequest);
