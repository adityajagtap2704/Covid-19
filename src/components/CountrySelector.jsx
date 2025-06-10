import React, { useState, useEffect } from 'react';
import { ChevronDown, Globe, MapPin } from 'lucide-react';
import { useGlobalState } from '../context/GlobalStateContext';
import SearchBar from './SearchBar';

const CountrySelector = () => {
  const { state, actions } = useGlobalState();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedCountryData = state.countries.find(
    country => country.country === state.selectedCountry
  );

  const filteredCountries = state.countries.filter(country =>
    country.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCountrySelect = (countryName) => {
    actions.selectCountry(countryName);
    setIsOpen(false);
    setSearchTerm('');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.country-selector')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="country-selector relative bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Globe className="text-primary-500" size={24} />
        <h2 className="text-xl font-bold text-gray-800">Select Country</h2>
      </div>

      {/* Search and Selection Area */}
      <div className="relative">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="cursor-pointer p-4 border rounded-lg hover:border-primary-300 transition-colors bg-gray-50 hover:bg-gray-100"
        >
          {selectedCountryData ? (
            <div className="flex items-center space-x-3">
              <img
                src={selectedCountryData.countryInfo.flag}
                alt={selectedCountryData.country}
                className="w-8 h-6 object-cover rounded"
              />
              <span className="font-medium">{selectedCountryData.country}</span>
            </div>
          ) : (
            <span className="text-gray-500">Select a country...</span>
          )}
          <ChevronDown
            className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200">
            {/* Search Input */}
            <div className="p-4 border-b">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search countries..."
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Countries List */}
            <div className="max-h-60 overflow-y-auto">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <button
                    key={country.countryInfo._id}
                    onClick={() => handleCountrySelect(country.country)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3"
                  >
                    <img
                      src={country.countryInfo.flag}
                      alt={country.country}
                      className="w-6 h-4 object-cover rounded"
                    />
                    <span className="flex-1">{country.country}</span>
                    {country.cases && (
                      <span className="text-sm text-gray-500">
                        {new Intl.NumberFormat().format(country.cases)} cases
                      </span>
                    )}
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No countries found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CountrySelector;