// WeatherAPI.com client — rainfall data for outdoor court pricing

export interface RainForecast {
  date: string;
  totalPrecipMm: number;
  chanceOfRain: number; // 0-100
  condition: string;
}

export interface WeatherData {
  location: string;
  forecast: RainForecast[];
}

const API_KEY = process.env.WEATHER_API_KEY || "";
const BASE_URL = "https://api.weatherapi.com/v1";

export async function getRainForecast(
  city: string = "Jakarta",
  days: number = 3,
): Promise<WeatherData | null> {
  if (!API_KEY) return null;

  try {
    const res = await fetch(
      `${BASE_URL}/forecast.json?key=${API_KEY}&q=${encodeURIComponent(city)}&days=${days}&aqi=no`,
      { next: { revalidate: 1800 } }, // cache 30 min
    );

    if (!res.ok) return null;
    const data = await res.json();

    return {
      location: data.location.name,
      forecast: data.forecast.forecastday.map((d: Record<string, unknown>) => ({
        date: d.date as string,
        totalPrecipMm: (d.day as Record<string, unknown>).totalprecip_mm as number,
        chanceOfRain: (d.day as Record<string, unknown>).daily_chance_of_rain as number,
        condition: ((d.day as Record<string, unknown>).condition as Record<string, unknown>).text as string,
      })),
    };
  } catch {
    return null;
  }
}

export async function getRainForecastForLocation(
  lat: number,
  lon: number,
): Promise<RainForecast | null> {
  if (!API_KEY) return null;

  try {
    const res = await fetch(
      `${BASE_URL}/forecast.json?key=${API_KEY}&q=${lat},${lon}&days=1&aqi=no`,
      { next: { revalidate: 1800 } },
    );

    if (!res.ok) return null;
    const data = await res.json();
    const day = data.forecast.forecastday[0].day;

    return {
      date: data.forecast.forecastday[0].date,
      totalPrecipMm: day.totalprecip_mm,
      chanceOfRain: day.daily_chance_of_rain,
      condition: day.condition.text,
    };
  } catch {
    return null;
  }
}
