import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { diseaseAPI } from '../services/api';

// Initial state
const initialState = {
  // Data
  countries: [],
  selectedCountry: null,
  selectedCountryData: null,
  historicalData: [],
  comparisonCountries: ['USA', 'India', 'Brazil', 'Russia', 'France'],
  comparisonData: [],
  
  // UI State
  loading: false,
  error: null,
  selectedMetric: 'cases',
  searchTerm: '',
  
  // Filters
  showPerMillion: false,
  chartType: 'bar', // 'bar' or 'table'
};

// Action types
const actionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_COUNTRIES: 'SET_COUNTRIES',
  SET_SELECTED_COUNTRY: 'SET_SELECTED_COUNTRY',
  SET_SELECTED_COUNTRY_DATA: 'SET_SELECTED_COUNTRY_DATA',
  SET_HISTORICAL_DATA: 'SET_HISTORICAL_DATA',
  SET_COMPARISON_DATA: 'SET_COMPARISON_DATA',
  SET_SELECTED_METRIC: 'SET_SELECTED_METRIC',
  SET_SEARCH_TERM: 'SET_SEARCH_TERM',
  TOGGLE_PER_MILLION: 'TOGGLE_PER_MILLION',
  SET_CHART_TYPE: 'SET_CHART_TYPE',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer function
const globalReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case actionTypes.SET_COUNTRIES:
      return { ...state, countries: action.payload };
    
    case actionTypes.SET_SELECTED_COUNTRY:
      return { ...state, selectedCountry: action.payload };
    
    case actionTypes.SET_SELECTED_COUNTRY_DATA:
      return { ...state, selectedCountryData: action.payload };
    
    case actionTypes.SET_HISTORICAL_DATA:
      return { ...state, historicalData: action.payload };
    
    case actionTypes.SET_COMPARISON_DATA:
      return { ...state, comparisonData: action.payload };
    
    case actionTypes.SET_SELECTED_METRIC:
      return { ...state, selectedMetric: action.payload };
    
    case actionTypes.SET_SEARCH_TERM:
      return { ...state, searchTerm: action.payload };
    
    case actionTypes.TOGGLE_PER_MILLION:
      return { ...state, showPerMillion: !state.showPerMillion };
    
    case actionTypes.SET_CHART_TYPE:
      return { ...state, chartType: action.payload };
    
    case actionTypes.CLEAR_ERROR:
      return { ...state, error: null };
    
    default:
      return state;
  }
};

// Create context
const GlobalStateContext = createContext();

// Provider component
export const GlobalStateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(globalReducer, initialState);

  // Actions
  const actions = {
    setLoading: (loading) => dispatch({ type: actionTypes.SET_LOADING, payload: loading }),
    setError: (error) => dispatch({ type: actionTypes.SET_ERROR, payload: error }),
    clearError: () => dispatch({ type: actionTypes.CLEAR_ERROR }),
    
    // Fetch all countries
    fetchCountries: async () => {
      try {
        actions.setLoading(true);
        const countries = await diseaseAPI.getAllCountries();
        dispatch({ type: actionTypes.SET_COUNTRIES, payload: countries });
        
        // Set default country if none selected
        if (!state.selectedCountry && countries.length > 0) {
          actions.selectCountry('USA');
        }
      } catch (error) {
        actions.setError(error.message);
      } finally {
        actions.setLoading(false);
      }
    },

    // Select a country
    selectCountry: async (countryName) => {
      try {
        actions.setLoading(true);
        dispatch({ type: actionTypes.SET_SELECTED_COUNTRY, payload: countryName });
        
        const countryData = await diseaseAPI.getCountryData(countryName);
        dispatch({ type: actionTypes.SET_SELECTED_COUNTRY_DATA, payload: countryData });
        
        const historicalData = await diseaseAPI.getHistoricalData(countryName);
        dispatch({ type: actionTypes.SET_HISTORICAL_DATA, payload: historicalData });
      } catch (error) {
        console.error('Error selecting country:', error);
        actions.setError(`Failed to fetch data for ${countryName}`);
      } finally {
        actions.setLoading(false);
      }
    },

    // Fetch comparison data
    fetchComparisonData: async () => {
      try {
        actions.setLoading(true);
        const comparisonData = await diseaseAPI.getCountriesData(state.comparisonCountries);
        dispatch({ type: actionTypes.SET_COMPARISON_DATA, payload: comparisonData });
      } catch (error) {
        actions.setError(error.message);
      } finally {
        actions.setLoading(false);
      }
    },

    // Set selected metric
    setSelectedMetric: (metric) => {
      dispatch({ type: actionTypes.SET_SELECTED_METRIC, payload: metric });
    },

    // Set search term
    setSearchTerm: (term) => {
      dispatch({ type: actionTypes.SET_SEARCH_TERM, payload: term });
    },

    // Toggle per million view
    togglePerMillion: () => {
      dispatch({ type: actionTypes.TOGGLE_PER_MILLION });
    },

    // Set chart type
    setChartType: (type) => {
      dispatch({ type: actionTypes.SET_CHART_TYPE, payload: type });
    },
  };

  // Initialize data on mount
  useEffect(() => {
    actions.fetchCountries();
    actions.fetchComparisonData();
  }, []);

  // Refetch comparison data when comparison countries or metric changes
  useEffect(() => {
    if (state.comparisonCountries.length > 0) {
      actions.fetchComparisonData();
    }
  }, [state.comparisonCountries, state.selectedMetric]);

  const value = {
    state,
    actions,
    // Computed values
    filteredCountries: state.countries.filter(country =>
      country.country.toLowerCase().includes(state.searchTerm.toLowerCase())
    ),
    isLoading: state.loading,
    hasError: !!state.error,
  };

  return (
    <GlobalStateContext.Provider value={value}>
      {children}
    </GlobalStateContext.Provider>
  );
};

// Custom hook to use the context
export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }
  return context;
};

export default GlobalStateContext;