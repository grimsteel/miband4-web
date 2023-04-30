import type { GeocodedCity, WeatherData } from "./types";
import { WeatherIcons } from "./types";

// A list of weathercodes and their corresponding band icons and names
const weathercodeDefinitions = new Map([
  [0, { icon: "sun", name: "Clear sky" }],
  [1, { icon: "sun-cloud", name: "Mainly clear" }],
  [2, { icon: "sun-cloud", name: "Partly cloudy" }],
  [3, { icon: "cloud", name: "Overcast" }],
  [45, { icon: "fog", name: "Fog" }],
  [48, { icon: "fog", name: "Depositing rime" }],
  [51, { icon: "rain-3", name: "Light drizzle" }],
  [53, { icon: "rain-3", name: "Moderate drizzle" }],
  [55, { icon: "rain-4", name: "Heavy drizzle" }],
  [56, { icon: "rain-snow-cloud", name: "Light freezing drizzle" }],
  [57, { icon: "rain-snow-cloud", name: "Dense freezing drizzle" }],
  [61, { icon: "rain-4", name: "Slight rain" }],
  [63, { icon: "rain-5-alt", name: "Moderate rain" }],
  [65, { icon: "rain-5", name: "Heavy rain" }],
  [66, { icon: "rain-snow-cloud", name: "Light freezing rain" }],
  [67, { icon: "rain-snow-cloud", name: "Heavy freezing rain" }],
  [71, { icon: "snow-2", name: "Slight snow fall" }],
  [73, { icon: "snow-3", name: "Moderate snow fall" }],
  [75, { icon: "snow-4", name: "Heavy snow fall" }],
  [77, { icon: "hail", name: "Snow grains" }],
  [80, { icon: "rain-4", name: "Light rain shower" }],
  [81, { icon: "rain-5", name: "Moderate rain shower" }],
  [82, { icon: "rain-6", name: "Violent rain shower" }],
  [85, { icon: "snow-1", name: "Slight snow shower" }],
  [86, { icon: "snow-3", name: "Heavy snow shower" }],
  [95, { icon: "lightning-rain-cloud", name: "Thunderstorm" }],
  [96, { icon: "lightning-snow-cloud", name: "Thunderstorm with hail" }],
]);

function getWeathercodeIcon(weathercode: number) {
  const iconName = weathercodeDefinitions.get(weathercode)?.icon ?? "sun";
  const iconData = WeatherIcons.find(({ icon }) => icon === iconName) ?? WeatherIcons[0];
  return iconData.code;
}

/** Fetch weather data from Open Meteo */
async function fetchWeatherData(latitude: number, longitude: number) {
  const weatherDataUrl = new URL("https://api.open-meteo.com/v1/forecast");
  weatherDataUrl.searchParams.set("latitude", latitude.toString());
  weatherDataUrl.searchParams.set("longitude", longitude.toString());
  weatherDataUrl.searchParams.set("daily", "weathercode,temperature_2m_max,temperature_2m_min");
  weatherDataUrl.searchParams.set("current_weather", "true");
  weatherDataUrl.searchParams.set("temperature_unit", "fahrenheit"); // TODO: Make this configurable
  weatherDataUrl.searchParams.set("timezone", "auto");
  const weatherDataRes = await fetch(weatherDataUrl);
  const weatherData = await weatherDataRes.json();
  return weatherData;
}

function parseWeatherData(
  data: { current_weather: { temperature: number, weathercode: number }, daily: { time: string[], weathercode: number[], temperature_2m_max: number[], temperature_2m_min: number[] } }
): Omit<WeatherData, "city"> {
  const { current_weather, daily } = data;
  // Parse the lists of times, weathercodes, and temperatures into a list of forecasts
  const forecast = daily.time.map((_, index) => ({
    icon: getWeathercodeIcon(daily.weathercode[index]),
    high: Math.round(daily.temperature_2m_max[index]),
    low: Math.round(daily.temperature_2m_min[index]),
    text: weathercodeDefinitions.get(daily.weathercode[index])?.name ?? "Unknown",
  }));
  return {
    currentTemp: Math.round(current_weather.temperature), // the band only supports integers
    currentIcon: getWeathercodeIcon(current_weather.weathercode),
    forecast,
    airIndex: 0,
  };
}

export async function geocode(city: string) {
  const geocodeUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
  geocodeUrl.searchParams.set("name", city);
  geocodeUrl.searchParams.set("count", "5");
  geocodeUrl.searchParams.set("language", "en");
  geocodeUrl.searchParams.set("format", "json");
  const geocodeRes = await fetch(geocodeUrl);
  const { results }: { results: GeocodedCity[] } = await geocodeRes.json();
  return results;
}

export async function getWeatherData(latitude: number, longitude: number) {
  const rawData = await fetchWeatherData(latitude, longitude);
  const weatherData = parseWeatherData(rawData);
  return weatherData;
}