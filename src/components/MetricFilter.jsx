import React from 'react';
import { Filter, BarChart3, PieChart, ToggleLeft, ToggleRight } from 'lucide-react';
import { useGlobalState } from '../context/GlobalStateContext';

const MetricFilter = () => {
  const { state, actions } = useGlobalState();
  const { selectedMetric, showPerMillion, chartType } = state;

  const metrics = [
    { value: 'cases', label: 'Total Cases', color: 'bg-orange-500' },
    { value: 'deaths', label: 'Total Deaths', color: 'bg-red-500' },
    { value: 'recovered', label: 'Total Recovered', color: 'bg-green-500' },
    { value: 'active', label: 'Active Cases', color: 'bg-blue-500' },
    { value: 'critical', label: 'Critical Cases', color: 'bg-purple-500' },
    { value: 'todayCases', label: "Today's Cases", color: 'bg-yellow-500' },
    { value: 'todayDeaths', label: "Today's Deaths", color: 'bg-pink-500' }
  ];

  const chartTypes = [
    { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
    { value: 'table', label: 'Table View', icon: PieChart }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Filter className="text-primary-500" size={24} />
        <h2 className="text-xl font-bold text-gray-800">Filters & Options</h2>
      </div>

      {/* Metric Selection */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Select Metric</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {metrics.map((metric) => (
            <button
              key={metric.value}
              onClick={() => actions.setSelectedMetric(metric.value)}
              className={`
                relative p-3 rounded-lg border-2 transition-all duration-200 text-left
                ${selectedMetric === metric.value 
                  ? 'border-primary-500 bg-primary-50 shadow-md' 
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }
              `}
            >
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${metric.color}`}></div>
                <span className={`text-sm font-medium ${
                  selectedMetric === metric.value ? 'text-primary-700' : 'text-gray-700'
                }`}>
                  {metric.label}
                </span>
              </div>
              {selectedMetric === metric.value && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* View Options */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">View Options</h3>
        <div className="flex flex-wrap gap-3">
          {/* Chart Type Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {chartTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => actions.setChartType(type.value)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200
                    ${chartType === type.value 
                      ? 'bg-white shadow-sm text-primary-600' 
                      : 'text-gray-600 hover:text-gray-800'
                    }
                  `}
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
              );
            })}
          </div>

          {/* Per Million Toggle */}
          <button
            onClick={actions.togglePerMillion}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all duration-200
              ${showPerMillion 
                ? 'border-primary-500 bg-primary-50 text-primary-700' 
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }
            `}
          >
            {showPerMillion ? (
              <ToggleRight size={20} className="text-primary-500" />
            ) : (
              <ToggleLeft size={20} className="text-gray-400" />
            )}
            <span className="text-sm font-medium">Per Million Population</span>
          </button>
        </div>
      </div>

      {/* Active Filters Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="text-sm text-gray-600 mb-2">Current Selection:</div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-100 text-primary-800 text-sm font-medium">
            {metrics.find(m => m.value === selectedMetric)?.label}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
            {chartTypes.find(c => c.value === chartType)?.label}
          </span>
          {showPerMillion && (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
              Per Million View
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetricFilter;