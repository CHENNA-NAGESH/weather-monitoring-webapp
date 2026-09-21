const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

export const WEATHER_CODES = {
  0: { label: "Clear sky", icon: "sun" },
  1: { label: "Mainly clear", icon: "sun" },
  2: { label: "Partly cloudy", icon: "cloud-sun" },
  3: { label: "Overcast", icon: "cloud" },
  45: { label: "Fog", icon: "fog" },
  48: { label: "Icy fog", icon: "fog" },
  51: { label: "Light drizzle", icon: "drizzle" },
  53: { label: "Drizzle", icon: "drizzle" },
  55: { label: "Heavy drizzle", icon: "rain" },
  61: { label: "Light rain", icon: "rain" },
  63: { label: "Rain", icon: "rain" },
  65: { label: "Heavy rain", icon: "rain" },
  71: { label: "Light snow", icon: "snow" },
  73: { label: "Snow", icon: "snow" },
  75: { label: "Heavy snow", icon: "snow" },
  77: { label: "Snow grains", icon: "snow" },
  80: { label: "Rain showers", icon: "rain" },
  81: { label: "Rain showers", icon: "rain" },
  82: { label: "Violent showers", icon: "storm" },
  85: { label: "Snow showers", icon: "snow" },
  86: { label: "Heavy snow showers", icon: "snow" },
  95: { label: "Thunderstorm", icon: "storm" },
  96: { label: "Storm with hail", icon: "storm" },
  99: { label: "Severe hail storm", icon: "storm" },
};

export function describeWeather(code) {
  return WEATHER_CODES[code] ?? { label: "Unknown", icon: "cloud" };
}

export async function searchCities(query) {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const url = new URL(GEOCODE_URL);
  url.searchParams.set("name", trimmed);
  url.searchParams.set("count", "6");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("City search failed");
  }

  const data = await response.json();
  return (data.results ?? []).map((place) => ({
    id: place.id,
    name: place.name,
    country: place.country,
    admin: place.admin1,
    latitude: place.latitude,
    longitude: place.longitude,
    timezone: place.timezone,
  }));
}

export async function fetchForecast(latitude, longitude) {
  const url = new URL(FORECAST_URL);
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set(
    "current",
    [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "is_day",
      "precipitation",
      "weather_code",
      "cloud_cover",
      "pressure_msl",
      "wind_speed_10m",
      "wind_direction_10m",
      "uv_index",
      "visibility",
    ].join(","),
  );
  url.searchParams.set(
    "hourly",
    ["temperature_2m", "precipitation_probability", "weather_code"].join(","),
  );
  url.searchParams.set(
    "daily",
    [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
      "sunrise",
      "sunset",
      "uv_index_max",
    ].join(","),
  );
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "7");

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Weather forecast failed");
  }

  return response.json();
}

export function windDirection(degrees) {
  const points = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return points[Math.round(degrees / 45) % 8];
}
