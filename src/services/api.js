import axios from 'axios';

const BASE_URL = 'https://disease.sh/v3/covid-19';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for loading states
api.interceptors.request.use(
  (config) => {
    console.log(`Making API request to: ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API Functions
export const diseaseAPI = {
  // Get all countries
  getAllCountries: async () => {
    try {
      const response = await api.get('/countries');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch countries data');
    }
  },

  // Get specific country data
  getCountryData: async (country) => {
    try {
      const response = await api.get(`/countries/${country}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch data for ${country}`);
    }
  },

  // Get historical data for a country
  getHistoricalData: async (country, days = 30) => {
    try {
      // First try with country name
      let response = await api.get(`/historical/${country}?lastdays=${days}`);
      
      // If the data doesn't have timeline, try with country code
      if (!response.data.timeline) {
        const countryData = await api.get(`/countries/${country}`);
        const countryCode = countryData.data.countryInfo.iso2;
        response = await api.get(`/historical/${countryCode}?lastdays=${days}`);
      }

      return response.data;
    } catch (error) {
      console.error('Historical data fetch error:', error);
      throw new Error(`Failed to fetch historical data for ${country}`);
    }
  },

  // Add new method for weekly trends
  getWeeklyTrends: async (country) => {
    try {
      const response = await api.get(`/historical/${country}?lastdays=7`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch weekly trends for ${country}`);
    }
  },

  // Get global statistics
  getGlobalStats: async () => {
    try {
      const response = await api.get('/all');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch global statistics');
    }
  },

  // Get multiple countries for comparison
  getCountriesData: async (countries) => {
    try {
      const promises = countries.map(country => 
        api.get(`/countries/${country}`)
      );
      const responses = await Promise.all(promises);
      return responses.map(response => response.data);
    } catch (error) {
      throw new Error('Failed to fetch comparison data');
    }
  }
};

// Utility functions for data transformation
export const dataUtils = {
  // Format numbers with commas
  formatNumber: (num) => {
    if (num === null || num === undefined) return 'N/A';
    return new Intl.NumberFormat().format(num);
  },

  // Calculate percentage
  calculatePercentage: (part, whole) => {
    if (!whole || whole === 0) return 0;
    return ((part / whole) * 100).toFixed(2);
  },

  // Format per million population
  formatPerMillion: (value, population) => {
    if (!population || population === 0) return 'N/A';
    return Math.round((value / population) * 1000000);
  },

  // Transform historical data for charts
  transformHistoricalData: (data) => {
    if (!data || !data.timeline) return [];
    
    const { cases, deaths, recovered } = data.timeline;
    const dates = Object.keys(cases || {});
    
    // Calculate daily changes instead of cumulative numbers
    return dates.map((date, index) => {
      const dailyCases = index > 0 ? cases[date] - cases[dates[index - 1]] : cases[date];
      const dailyDeaths = index > 0 ? deaths[date] - deaths[dates[index - 1]] : deaths[date];
      const dailyRecovered = index > 0 ? (recovered?.[date] || 0) - (recovered?.[dates[index - 1]] || 0) : recovered?.[date] || 0;

      return {
        date: new Date(date).toLocaleDateString(),
        cases: Math.max(0, dailyCases), // Ensure no negative values
        deaths: Math.max(0, dailyDeaths),
        recovered: Math.max(0, dailyRecovered),
        active: Math.max(0, dailyCases - dailyDeaths - dailyRecovered)
      };
    });
  },

  processChartData: (data, metric = 'cases') => {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map(item => ({
      ...item,
      value: item[metric] || 0,
      valueFormatted: new Intl.NumberFormat().format(item[metric] || 0)
    }));
  },

  // Get country flag URL
  getCountryFlag: (countryInfo) => {
    return countryInfo?.flag || '/api/placeholder/32/24';
  },

  // Sort countries by metric
  sortCountriesByMetric: (countries, metric, ascending = false) => {
    return [...countries].sort((a, b) => {
      const aValue = a[metric] || 0;
      const bValue = b[metric] || 0;
      return ascending ? aValue - bValue : bValue - aValue;
    });
  }
};

export default api;