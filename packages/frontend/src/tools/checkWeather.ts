import type { WeatherData } from '../services/weather.service';

export interface CheckWeatherInput {
  city_name: string;
  country: string | null;
}

export interface CheckWeatherOutput {
  weather: WeatherData | null;
  error?: string;
}

export interface CheckWeatherHandler {
  onToolCall: (params: {
    input: CheckWeatherInput;
    addToolResult: (result: { output: CheckWeatherOutput }) => void;
  }) => Promise<void>;
}

export function createCheckWeatherHandler(
  getWeather: (cityName: string, country?: string) => Promise<WeatherData | null>
): CheckWeatherHandler {
  return {
    onToolCall: async ({ input, addToolResult }) => {
      try {
        const weather = await getWeather(input.city_name, input.country || undefined);
        
        if (weather) {
          addToolResult({
            output: { weather },
          });
        } else {
          addToolResult({
            output: {
              weather: null,
              error: `Could not find weather data for ${input.city_name}${input.country ? `, ${input.country}` : ''}`,
            },
          });
        }
      } catch (error) {
        addToolResult({
          output: {
            weather: null,
            error: 'Failed to fetch weather data. Please try again.',
          },
        });
      }
    },
  };
}
