/**
 * OpenWeather API Integration
 * Fetches live temperature & humidity for 4 Indian data center cities
 */

import axios from 'axios';

class WeatherService {
  constructor() {
    this.apiKey = process.env.REACT_APP_OPENWEATHER_API_KEY || '';
    this.baseEndpoint = 'https://api.openweathermap.org/data/2.5/weather';
    this.cities = [
      { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
      { name: 'Hyderabad', lat: 17.3850, lon: 78.4867 },
      { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
      { name: 'Delhi NCR', lat: 28.7041, lon: 77.1025 }
    ];
    this.weatherCache = {};
    this.lastFetchTime = {};
    this.CACHE_DURATION = 5 * 60 * 1000; // 5 minute cache
  }

  /**
   * Fetch live weather data for all 4 cities
   */
  async fetchAllCities() {
    const results = {};

    // If no API key, fallback to realistic simulation
    if (!this.apiKey) {
      console.warn('OpenWeather API key not found, using fallback simulation');
      return this.getFallbackWeatherData();
    }

    try {
      const promises = this.cities.map(city => this.fetchCity(city));
      const weatherData = await Promise.allSettled(promises);

      weatherData.forEach((result, idx) => {
        const city = this.cities[idx];
        if (result.status === 'fulfilled') {
          results[city.name] = result.value;
        } else {
          console.warn(`Failed to fetch weather for ${city.name}, using fallback`);
          results[city.name] = this.getFallbackWeatherForCity(city.name);
        }
      });

      return results;
    } catch (error) {
      console.error('Weather fetch error:', error.message);
      return this.getFallbackWeatherData();
    }
  }

  /**
   * Fetch weather for a single city
   */
  async fetchCity(city) {
    const cacheKey = city.name;

    // Check cache
    if (
      this.weatherCache[cacheKey] &&
      Date.now() - this.lastFetchTime[cacheKey] < this.CACHE_DURATION
    ) {
      return this.weatherCache[cacheKey];
    }

    try {
      const response = await axios.get(this.baseEndpoint, {
        params: {
          lat: city.lat,
          lon: city.lon,
          appid: this.apiKey,
          units: 'metric'
        },
        timeout: 8000
      });

      const data = response.data;
      const weatherInfo = {
        city: city.name,
        temp: Math.round(data.main.temp * 10) / 10,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        feelsLike: Math.round(data.main.feels_like * 10) / 10,
        description: data.weather[0].description,
        windSpeed: Math.round(data.wind.speed * 10) / 10,
        cloudiness: data.clouds.all,
        timestamp: Date.now()
      };

      // Cache result
      this.weatherCache[cacheKey] = weatherInfo;
      this.lastFetchTime[cacheKey] = Date.now();

      return weatherInfo;
    } catch (error) {
      console.warn(`OpenWeather API error for ${city.name}:`, error.message);
      return this.getFallbackWeatherForCity(city.name);
    }
  }

  /**
   * Fallback weather data for all cities (realistic Indian climate patterns)
   */
  getFallbackWeatherData() {
    return {
      'Mumbai': this.getFallbackWeatherForCity('Mumbai'),
      'Hyderabad': this.getFallbackWeatherForCity('Hyderabad'),
      'Chennai': this.getFallbackWeatherForCity('Chennai'),
      'Delhi NCR': this.getFallbackWeatherForCity('Delhi NCR')
    };
  }

  /**
   * Fallback weather for single city (simulates realistic patterns)
   */
  getFallbackWeatherForCity(cityName) {
    const hour = new Date().getHours();
    
    // Base temperatures for each city (simplified)
    const baseTemps = {
      'Mumbai': 32,
      'Hyderabad': 33,
      'Chennai': 35,
      'Delhi NCR': 38
    };

    const baseTemp = baseTemps[cityName] || 30;

    // Daily cycle: cooler at night (6 AM - 6 PM is hotter)
    let tempVariation = 0;
    if (hour >= 6 && hour <= 18) {
      const hoursFromNoon = Math.abs(hour - 12);
      tempVariation = Math.cos(hoursFromNoon / 6) * 5; // ±5°C variation
    } else {
      tempVariation = -4; // Cooler at night
    }

    // Minor minute-based variation
    const minuteVariation = (Math.random() - 0.5) * 1;

    // Humidity tends to be higher at night
    let humidity = 60 + Math.random() * 20;
    if (hour < 6 || hour > 18) {
      humidity = Math.min(95, humidity + 20);
    }

    return {
      city: cityName,
      temp: Math.round((baseTemp + tempVariation + minuteVariation) * 10) / 10,
      humidity: Math.round(humidity),
      pressure: 1013,
      feelsLike: Math.round((baseTemp + tempVariation + minuteVariation + Math.random() * 2) * 10) / 10,
      description: humidity > 70 ? 'partly cloudy' : 'clear sky',
      windSpeed: Math.round((5 + Math.random() * 10) * 10) / 10,
      cloudiness: Math.round(humidity > 70 ? 40 : 15),
      timestamp: Date.now()
    };
  }

  /**
   * Get weather for a specific city
   */
  getWeatherForCity(cityName, weatherData) {
    return weatherData[cityName] || this.getFallbackWeatherForCity(cityName);
  }

  /**
   * Analyze weather stress (high temp + high humidity = high stress)
   */
  analyzeStress(weatherData) {
    return Object.entries(weatherData).map(([city, data]) => {
      // Stress score: temperature (0-100) + humidity (0-100), 0-50 is normal
      const tempStress = Math.max(0, (data.temp - 20) / 30 * 100); // 20°C baseline
      const humidityStress = (data.humidity / 100) * 50; // Max 50 points
      const windCalmness = (1 - Math.min(1, data.windSpeed / 20)) * 30; // Calm = +30 points

      const stressScore = Math.min(100, tempStress + humidityStress - windCalmness);

      return {
        city,
        stressScore: Math.round(stressScore),
        temp: data.temp,
        status: stressScore > 70 ? 'critical' : stressScore > 50 ? 'high' : 'normal'
      };
    });
  }

  /**
   * Recommend best city by weather (lowest temp)
   */
  recommendBestCity(weatherData) {
    let bestCity = null;
    let lowestTemp = Infinity;

    Object.entries(weatherData).forEach(([city, data]) => {
      if (data.temp < lowestTemp) {
        lowestTemp = data.temp;
        bestCity = city;
      }
    });

    return { city: bestCity, temp: lowestTemp };
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache() {
    this.weatherCache = {};
    this.lastFetchTime = {};
  }
}

// Export singleton
export const weatherService = new WeatherService();

export default WeatherService;
