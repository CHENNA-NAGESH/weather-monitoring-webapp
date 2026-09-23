import { useEffect, useMemo, useRef, useState } from "react";
import {
  describeWeather,
  fetchForecast,
  searchCities,
  windDirection,
} from "./api/weather";
import { WeatherIcon } from "./components/WeatherIcon";
import "./App.css";

const DEFAULT_CITY = {
  id: 1277333,
  name: "Bengaluru",
  country: "India",
  admin: "Karnataka",
  latitude: 12.9716,
  longitude: 77.5946,
};

const BUILD_VERSION = import.meta.env.VITE_APP_VERSION ?? "local";

function formatHour(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric" });
}

function formatDay(iso) {
  return new Date(iso).toLocaleDateString([], { weekday: "short" });
}

function formatClock(iso) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="10" r="2.2" fill="currentColor" />
    </svg>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [city, setCity] = useState(DEFAULT_CITY);
  const [forecast, setForecast] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);
  const searchTimer = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");
      setError("");
      try {
        const data = await fetchForecast(city.latitude, city.longitude);
        if (!cancelled) {
          setForecast(data);
          setUpdatedAt(new Date());
          setStatus("ready");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load weather");
          setStatus("error");
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [city]);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);

    if (query.trim().length < 2) {
      setSuggestions([]);
      return undefined;
    }

    searchTimer.current = setTimeout(async () => {
      try {
        const results = await searchCities(query);
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      }
    }, 250);

    return () => clearTimeout(searchTimer.current);
  }, [query]);

  const currentMeta = useMemo(() => {
    if (!forecast) return { label: "—", icon: "cloud" };
    return describeWeather(forecast.current.weather_code);
  }, [forecast]);

  const hourly = useMemo(() => {
    if (!forecast) return [];
    const now = Date.now();
    return forecast.hourly.time
      .map((time, index) => ({
        time,
        temperature: forecast.hourly.temperature_2m[index],
        rain: forecast.hourly.precipitation_probability[index],
        code: forecast.hourly.weather_code[index],
      }))
      .filter((item) => new Date(item.time).getTime() >= now)
      .slice(0, 12);
  }, [forecast]);

  const daily = useMemo(() => {
    if (!forecast) return [];
    return forecast.daily.time.map((time, index) => ({
      time,
      max: forecast.daily.temperature_2m_max[index],
      min: forecast.daily.temperature_2m_min[index],
      rain: forecast.daily.precipitation_probability_max[index],
      code: forecast.daily.weather_code[index],
    }));
  }, [forecast]);

  function selectCity(nextCity) {
    setCity(nextCity);
    setQuery("");
    setSuggestions([]);
  }

  async function useMyLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not available in this browser");
      return;
    }

    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        selectCity({
          id: "geo",
          name: "My location",
          country: "",
          admin: "",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        setError("Location permission was denied");
        setStatus(forecast ? "ready" : "error");
      },
    );
  }

  const current = forecast?.current;
  const placeLine = [city.admin, city.country]
    .filter((part) => part && part !== city.name)
    .join(", ");
  const temps = daily.map((item) => item.max);
  const weekHigh = temps.length ? Math.max(...temps) : 1;
  const weekLow = daily.length ? Math.min(...daily.map((item) => item.min)) : 0;
  const spread = Math.max(weekHigh - weekLow, 1);

  return (
    <div
      className="page"
      data-theme={currentMeta.icon}
      data-period={current?.is_day ? "day" : "night"}
    >
      <div className="atmosphere" aria-hidden />
      <header className="topbar">
        <div className="brand">
          <div className="logo-mark">
            <WeatherIcon name={currentMeta.icon} size={26} />
          </div>
          <div>
            <p className="eyebrow">Weather Monitor</p>
            <h1>Live sky dashboard</h1>
          </div>
        </div>
        <div className="build-chip" title="Image / pipeline version">
          build {BUILD_VERSION}
        </div>
      </header>

      <section className="search-panel">
        <div className="search-wrap">
          <label className="search-field">
            <SearchIcon />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search a city to monitor"
              aria-label="Search city"
              autoComplete="off"
            />
          </label>
          {suggestions.length > 0 && (
            <ul className="suggestions">
              {suggestions.map((item) => (
                <li key={item.id}>
                  <button type="button" onClick={() => selectCity(item)}>
                    <strong>{item.name}</strong>
                    <span>
                      {[item.admin, item.country].filter(Boolean).join(", ")}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button type="button" className="ghost" onClick={useMyLocation}>
          <PinIcon />
          Use my location
        </button>
      </section>

      {error && <p className="banner error">{error}</p>}
      {status === "loading" && !forecast && (
        <div className="skeleton" aria-busy="true" aria-label="Loading weather feed">
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
      )}

      {current && (
        <main className="layout">
          <article className="hero card">
            <div>
              <p className="place">
                <strong>{city.name}</strong>
                {placeLine ? <span className="muted">{placeLine}</span> : null}
                <span className="chip">{current.is_day ? "Daytime" : "Night"}</span>
              </p>
              <div className="hero-temp">
                <WeatherIcon name={currentMeta.icon} size={86} />
                <div>
                  <p className="temp">{Math.round(current.temperature_2m)}°</p>
                  <p className="condition">{currentMeta.label}</p>
                </div>
              </div>
              <p className="hero-meta">
                <span>Feels like {Math.round(current.apparent_temperature)}°</span>
                <span>Updated {updatedAt ? updatedAt.toLocaleTimeString() : "—"}</span>
              </p>
            </div>
            <dl className="stats">
              <div className="stat">
                <dt>Humidity</dt>
                <dd>{current.relative_humidity_2m}%</dd>
              </div>
              <div className="stat">
                <dt>Wind</dt>
                <dd>
                  {Math.round(current.wind_speed_10m)} km/h{" "}
                  {windDirection(current.wind_direction_10m)}
                </dd>
              </div>
              <div className="stat">
                <dt>Pressure</dt>
                <dd>{Math.round(current.pressure_msl)} hPa</dd>
              </div>
              <div className="stat">
                <dt>Cloud cover</dt>
                <dd>{current.cloud_cover}%</dd>
              </div>
              <div className="stat">
                <dt>UV index</dt>
                <dd>{current.uv_index}</dd>
              </div>
              <div className="stat">
                <dt>Visibility</dt>
                <dd>{Math.round(current.visibility / 1000)} km</dd>
              </div>
            </dl>
          </article>

          <article className="card">
            <h2>Next 12 hours</h2>
            <div className="hourly">
              {hourly.map((item) => {
                const meta = describeWeather(item.code);
                return (
                  <div key={item.time} className="hour">
                    <span>{formatHour(item.time)}</span>
                    <WeatherIcon name={meta.icon} size={28} />
                    <strong>{Math.round(item.temperature)}°</strong>
                    <small>{item.rain}%</small>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="card span-2">
            <div className="card-head">
              <h2>7-day outlook</h2>
              {forecast && (
                <p className="muted">
                  Sunrise {formatClock(forecast.daily.sunrise[0])} · Sunset{" "}
                  {formatClock(forecast.daily.sunset[0])}
                </p>
              )}
            </div>
            <div className="daily">
              {daily.map((item) => {
                const meta = describeWeather(item.code);
                const width = ((item.max - weekLow) / spread) * 100;
                return (
                  <div key={item.time} className="day">
                    <span>{formatDay(item.time)}</span>
                    <WeatherIcon name={meta.icon} size={32} />
                    <span className="range">
                      {Math.round(item.max)}° / {Math.round(item.min)}°
                    </span>
                    <div className="temp-bar" aria-hidden>
                      <span style={{ width: `${Math.max(width, 18)}%` }} />
                    </div>
                    <small>{item.rain}% rain</small>
                  </div>
                );
              })}
            </div>
          </article>
        </main>
      )}

      <footer>
        <span>Open-Meteo forecast</span>
        <span>React demo for Jenkins / Docker / Kubernetes</span>
      </footer>
    </div>
  );
}
