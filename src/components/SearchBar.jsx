import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useGlobalState } from '../context/GlobalStateContext';

const SearchBar = ({ placeholder = "Search countries...", className = "" }) => {
  const { state, actions } = useGlobalState();
  const [localSearchTerm, setLocalSearchTerm] = useState(state.searchTerm);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      actions.setSearchTerm(localSearchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearchTerm, actions]);

  const handleClear = () => {
    setLocalSearchTerm('');
    actions.setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search 
          size={20} 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={localSearchTerm}
          onChange={(e) => setLocalSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 bg-white shadow-sm hover:shadow-md"
        />
        {localSearchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>
      
      {/* Search results count */}
      {state.searchTerm && (
        <div className="mt-2 text-sm text-gray-600">
          Found {state.countries.filter(country =>
            country.country.toLowerCase().includes(state.searchTerm.toLowerCase())
          ).length} countries
        </div>
      )}
      
      {/* Quick suggestions */}
      {localSearchTerm && localSearchTerm.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto z-50">
          {state.countries
            .filter(country =>
              country.country.toLowerCase().includes(localSearchTerm.toLowerCase())
            )
            .slice(0, 8)
            .map((country) => (
              <button
                key={country.countryInfo._id}
                onClick={() => {
                  actions.selectCountry(country.country);
                  setLocalSearchTerm('');
                  actions.setSearchTerm('');
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center space-x-3 transition-colors"
              >
                <img
                  src={country.countryInfo.flag}
                  alt={`${country.country} flag`}
                  className="w-6 h-4 object-cover rounded-sm"
                />
                <span className="font-medium">{country.country}</span>
                <span className="text-sm text-gray-500 ml-auto">
                  {country.cases ? new Intl.NumberFormat().format(country.cases) : 0} cases
                </span>
              </button>
            ))}
          
          {state.countries.filter(country =>
            country.country.toLowerCase().includes(localSearchTerm.toLowerCase())
          ).length === 0 && (
            <div className="px-4 py-3 text-center text-gray-500">
              No countries found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;