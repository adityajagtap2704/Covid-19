import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, ArrowUpDown } from 'lucide-react';
import { useGlobalState } from '../context/GlobalStateContext';
import { dataUtils } from '../services/api';

const ComparisonChart = () => {
  const { state } = useGlobalState();
  const { comparisonData, selectedMetric, showPerMillion, chartType } = state;

  // Transform data for charts
  const chartData = useMemo(() => {
    if (!comparisonData || comparisonData.length === 0) return [];

    return comparisonData.map(country => {
      let value = country[selectedMetric] || 0;
      
      if (showPerMillion && country.population) {
        value = dataUtils.formatPerMillion(value, country.population);
      }

      return {
        country: country.country,
        value: value,
        population: country.population,
        flag: country.countryInfo?.flag,
        continent: country.continent,
        rawValue: country[selectedMetric] || 0
      };
    }).sort((a, b) => b.value - a.value);
  }, [comparisonData, selectedMetric, showPerMillion]);

  // Get metric color
  const getMetricColor = () => {
    const colorMap = {
      cases: '#f97316', // orange
      deaths: '#ef4444', // red
      recovered: '#22c55e', // green
      active: '#3b82f6', // blue
      critical: '#a855f7', // purple
      todayCases: '#eab308', // yellow
      todayDeaths: '#ec4899' // pink
    };
    return colorMap[selectedMetric] || '#6b7280';
  };

  // Custom tooltip for bar chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2 mb-2">
            <img src={data.flag} alt={`${data.country} flag`} className="w-6 h-4 object-cover rounded" />
            <p className="font-semibold text-gray-800">{data.country}</p>
          </div>
          <p className="text-sm text-gray-600">
            {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}: 
            <span className="font-semibold ml-1">
              {showPerMillion ? `${dataUtils.formatNumber(data.value)} per 1M` : dataUtils.formatNumber(data.value)}
            </span>
          </p>
          <p className="text-xs text-gray-500">Population: {dataUtils.formatNumber(data.population)}</p>
        </div>
      );
    }
    return null;
  };

  if (!comparisonData || comparisonData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <BarChart size={48} className="mx-auto mb-4 text-gray-300" />
          <div className="text-lg font-medium">Loading Comparison Data</div>
          <div className="text-sm">Please wait while we fetch data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Country Comparison</h2>
          <p className="text-sm text-gray-600">
            Comparing {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} 
            {showPerMillion ? ' (per million population)' : ''}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: getMetricColor() }}></div>
          <span className="text-sm font-medium text-gray-600">
            {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}
          </span>
        </div>
      </div>

      {chartType === 'bar' ? (
        // Bar Chart View
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="country" 
                tick={{ fontSize: 12 }} 
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => dataUtils.formatNumber(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                fill={getMetricColor()}
                radius={[4, 4, 0, 0]}
                stroke={getMetricColor()}
                strokeWidth={1}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        // Table View
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Rank</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Country</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Continent</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">
                  <div className="flex items-center justify-end space-x-1">
                    <span>{selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}</span>
                    <ArrowUpDown size={14} />
                  </div>
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Population</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((country, index) => (
                <tr 
                  key={country.country} 
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-600">#{index + 1}</span>
                      {index === 0 && <TrendingUp size={16} className="text-green-500" />}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={country.flag} 
                        alt={`${country.country} flag`} 
                        className="w-6 h-4 object-cover rounded border"
                      />
                      <span className="font-medium text-gray-800">{country.country}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">{country.continent}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-semibold" style={{ color: getMetricColor() }}>
                      {showPerMillion 
                        ? `${dataUtils.formatNumber(country.value)} per 1M`
                        : dataUtils.formatNumber(country.value)
                      }
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-sm text-gray-600">
                      {dataUtils.formatNumber(country.population)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-sm text-gray-600">Highest</div>
          <div className="font-semibold text-gray-800">
            {chartData[0]?.country}
          </div>
          <div className="text-xs text-gray-500">
            {showPerMillion 
              ? `${dataUtils.formatNumber(chartData[0]?.value)} per 1M`
              : dataUtils.formatNumber(chartData[0]?.value)
            }
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600">Lowest</div>
          <div className="font-semibold text-gray-800">
            {chartData[chartData.length - 1]?.country}
          </div>
          <div className="text-xs text-gray-500">
            {showPerMillion 
              ? `${dataUtils.formatNumber(chartData[chartData.length - 1]?.value)} per 1M`
              : dataUtils.formatNumber(chartData[chartData.length - 1]?.value)
            }
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600">Average</div>
          <div className="font-semibold text-gray-800">
            {dataUtils.formatNumber(
              chartData.reduce((sum, item) => sum + item.value, 0) / chartData.length
            )}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600">Total</div>
          <div className="font-semibold text-gray-800">
            {dataUtils.formatNumber(
              chartData.reduce((sum, item) => sum + item.rawValue, 0)
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonChart;