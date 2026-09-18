import { searchCities } from './api.js';

const searchForm = document.querySelector('#city-search-form');
const cityInput = document.querySelector('#city-query');
const searchButton = document.querySelector('#search-button');
const searchStatus = document.querySelector('#search-status');
const resultsSection = document.querySelector('#city-results');
const citySelect = document.querySelector('#city-select');
const selectedCityDetails = document.querySelector('#selected-city');

let cities = [];
let isLoading = false;

function setStatus(message, isError = false) {
  searchStatus.textContent = message;
  searchStatus.classList.toggle('error', isError);
}

function setLoading(loading) {
  isLoading = loading;
  cityInput.disabled = loading;
  searchButton.disabled = loading;
  searchButton.textContent = loading ? 'Buscando…' : 'Buscar';
  searchForm.setAttribute('aria-busy', String(loading));
}

function clearResults() {
  cities = [];
  citySelect.replaceChildren();
  selectedCityDetails.textContent = '';
  resultsSection.hidden = true;
}

function getCityLabel(city) {
  const region = city.admin1?.trim() || 'Región no disponible';
  const country = city.country?.trim() || 'País no disponible';
  return `${city.name}, ${region}, ${country}`;
}

function showSelectedCity() {
  const city = citySelect.value === '' ? undefined : cities[Number(citySelect.value)];

  selectedCityDetails.textContent = city
    ? `Ciudad seleccionada: ${getCityLabel(city)}. Latitud: ${city.latitude}. Longitud: ${city.longitude}.`
    : 'Selecciona una ciudad para ver sus coordenadas.';
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

  if (isLoading) {
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

searchForm.addEventListener('submit', handleSearch);
citySelect.addEventListener('change', showSelectedCity);
