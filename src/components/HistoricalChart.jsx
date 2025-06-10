import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useGlobalState } from '../context/GlobalStateContext';
import { dataUtils } from '../services/api';

const HistoricalChart = () => {
  const { state } = useGlobalState();
  const { historicalData, selectedCountry } = state;

  const processedData = useMemo(() => {
    if (!historicalData || !historicalData.timeline) return [];
    return dataUtils.transformHistoricalData(historicalData);
  }, [historicalData]);

  if (!historicalData || historicalData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <LineChart size={48} className="mx-auto mb-4 text-gray-300" />
          <div className="text-lg font-medium">No Historical Data Available</div>
          <div className="text-sm">Please select a country to view historical trends</div>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex justify-between space-x-4 text-sm">
              <span style={{ color: entry.color }}>{entry.name}:</span>
              <span className="font-medium">{dataUtils.formatNumber(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Historical Trends - {selectedCountry}
      </h3>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => dataUtils.formatNumber(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="cases" 
              stroke="#f97316" 
              strokeWidth={2} 
              dot={false}
              name="Daily Cases"
              activeDot={{ r: 8 }}
            />
            <Line 
              type="monotone" 
              dataKey="deaths" 
              stroke="#dc2626" 
              strokeWidth={2} 
              dot={false}
              name="Daily Deaths"
            />
            <Line 
              type="monotone" 
              dataKey="recovered" 
              stroke="#16a34a" 
              strokeWidth={2} 
              dot={false}
              name="Daily Recovered"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend with actual numbers */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        {['cases', 'deaths', 'recovered'].map((metric) => {
          const latestValue = processedData[processedData.length - 1]?.[metric];
          return (
            <div key={metric} className="text-center">
              <div className={`text-sm font-medium ${
                metric === 'cases' ? 'text-orange-600' :
                metric === 'deaths' ? 'text-red-600' : 'text-green-600'
              }`}>
                Latest {metric.charAt(0).toUpperCase() + metric.slice(1)}
              </div>
              <div className="text-lg font-bold">
                {dataUtils.formatNumber(latestValue)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HistoricalChart;
