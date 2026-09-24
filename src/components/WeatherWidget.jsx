// components/WeatherWidget.jsx
"use client";
import { useEffect, useState } from "react";

// Brandfort, Free State
const LAT = -28.7;
const LON = 26.46;
const URL =
  `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
  `&current=temperature_2m,weather_code,wind_speed_10m` +
  `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
  `&timezone=Africa%2FJohannesburg&forecast_days=3`;

const labels = {
  af: {
    title: "Weer in Brandfort",
    high: "Hoog",
    low: "Laag",
    rain: "Reën",
    wind: "Wind",
    conditions: {
      clear: "Helder",
      partly: "Gedeeltelik bewolk",
      cloudy: "Bewolk",
      fog: "Mistig",
      drizzle: "Motreën",
      rain: "Reën",
      snow: "Sneeu",
      showers: "Buie",
      storm: "Donderstorm",
    },
  },
  en: {
    title: "Weather in Brandfort",
    high: "High",
    low: "Low",
    rain: "Rain",
    wind: "Wind",
    conditions: {
      clear: "Clear",
      partly: "Partly cloudy",
      cloudy: "Cloudy",
      fog: "Foggy",
      drizzle: "Drizzle",
      rain: "Rain",
      snow: "Snow",
      showers: "Showers",
      storm: "Thunderstorm",
    },
  },
};

// WMO weather codes -> [emoji, condition key]
function describe(code) {
  if (code === 0) return ["☀️", "clear"];
  if (code === 1 || code === 2) return ["⛅", "partly"];
  if (code === 3) return ["☁️", "cloudy"];
  if (code === 45 || code === 48) return ["🌫️", "fog"];
  if (code >= 51 && code <= 57) return ["🌦️", "drizzle"];
  if (code >= 61 && code <= 67) return ["🌧️", "rain"];
  if (code >= 71 && code <= 77) return ["❄️", "snow"];
  if (code >= 80 && code <= 82) return ["🌧️", "showers"];
  if (code >= 95) return ["⛈️", "storm"];
  return ["🌡️", "cloudy"];
}

export default function WeatherWidget({ lang = "af" }) {
  const [data, setData] = useState(null);
  const t = labels[lang] || labels.af;

  useEffect(() => {
    let cancelled = false;
    fetch(URL)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        // Fail silently - the homepage should never break over weather
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data?.current || !data?.daily) return null;

  const [icon, key] = describe(data.current.weather_code);
  const daily = data.daily;
  const locale = lang === "af" ? "af-ZA" : "en-ZA";

  return (
    <section className="px-6 pt-6 max-w-2xl mx-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
        <p className="text-xs uppercase tracking-wide text-neutral-500 mb-3">
          {t.title}
        </p>

        <div className="flex items-center gap-4">
          <span className="text-5xl">{icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-4xl font-black text-orange-500 leading-none tabular-nums">
              {Math.round(data.current.temperature_2m)}°C
            </p>
            <p className="text-sm text-neutral-300 mt-1">{t.conditions[key]}</p>
          </div>
          <div className="text-right text-xs text-neutral-400 space-y-0.5">
            <p>
              {t.high} {Math.round(daily.temperature_2m_max[0])}° · {t.low}{" "}
              {Math.round(daily.temperature_2m_min[0])}°
            </p>
            <p>
              {t.rain} {daily.precipitation_probability_max[0] ?? 0}%
            </p>
            <p>
              {t.wind} {Math.round(data.current.wind_speed_10m)} km/h
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-neutral-800">
          {[1, 2].map((i) => {
            const [dIcon] = describe(daily.weather_code[i]);
            const dayName = new Date(daily.time[i] + "T12:00:00").toLocaleDateString(
              locale,
              { weekday: "short" }
            );
            return (
              <div key={daily.time[i]} className="flex items-center gap-2">
                <span className="text-2xl">{dIcon}</span>
                <div>
                  <p className="text-xs font-semibold text-neutral-300 capitalize">
                    {dayName}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {Math.round(daily.temperature_2m_max[i])}° /{" "}
                    {Math.round(daily.temperature_2m_min[i])}° ·{" "}
                    {daily.precipitation_probability_max[i] ?? 0}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}