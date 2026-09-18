// Fuente: tabla «WMO Weather interpretation codes (WW)» de https://open-meteo.com/en/docs
const WEATHER_DESCRIPTIONS = {
  0: 'Cielo despejado',
  1: 'Mayormente despejado',
  2: 'Parcialmente nublado',
  3: 'Cielo cubierto',
  45: 'Niebla',
  48: 'Niebla con depósito de escarcha',
  51: 'Llovizna ligera',
  53: 'Llovizna moderada',
  55: 'Llovizna densa',
  56: 'Llovizna helada ligera',
  57: 'Llovizna helada densa',
  61: 'Lluvia ligera',
  63: 'Lluvia moderada',
  65: 'Lluvia intensa',
  66: 'Lluvia helada ligera',
  67: 'Lluvia helada intensa',
  71: 'Nevada ligera',
  73: 'Nevada moderada',
  75: 'Nevada intensa',
  77: 'Granos de nieve',
  80: 'Chubascos de lluvia ligeros',
  81: 'Chubascos de lluvia moderados',
  82: 'Chubascos de lluvia violentos',
  85: 'Chubascos de nieve ligeros',
  86: 'Chubascos de nieve intensos',
  95: 'Tormenta eléctrica ligera o moderada',
  96: 'Tormenta eléctrica con granizo ligero',
  99: 'Tormenta eléctrica con granizo intenso',
};

export function getWeatherDescription(weatherCode) {
  return Number.isInteger(weatherCode) && Object.hasOwn(WEATHER_DESCRIPTIONS, weatherCode)
    ? WEATHER_DESCRIPTIONS[weatherCode]
    : 'Condición no disponible';
}
