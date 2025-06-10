import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  AlertTriangle, 
  Heart, 
  Activity,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useGlobalState } from '../context/GlobalStateContext';
import { dataUtils } from '../services/api';

const CountryStats = () => {
  const { state } = useGlobalState();
  const { selectedCountryData, showPerMillion } = state;

  if (!selectedCountryData) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <BarChart3 size={48} className="mx-auto mb-4 text-gray-300" />
          <div className="text-lg font-medium">No Country Selected</div>
          <div className="text-sm">Please select a country to view statistics</div>
        </div>
      </div>
    );
  }

  const data = selectedCountryData;
  const population = data.population;

  // Calculate values based on per million toggle
  const getValue = (value) => {
    if (showPerMillion && population) {
      return dataUtils.formatPerMillion(value, population);
    }
    return value;
  };

  const formatValue = (value) => {
    if (showPerMillion && population) {
      return `${dataUtils.formatPerMillion(value, population)} per 1M`;
    }
    return dataUtils.formatNumber(value);
  };

  const statsData = [
    {
      title: 'Total Cases',
      value: formatValue(data.cases),
      today: data.todayCases,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      title: 'Total Deaths',
      value: formatValue(data.deaths),
      today: data.todayDeaths,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      title: 'Total Recovered',
      value: formatValue(data.recovered),
      today: data.todayRecovered,
      icon: Heart,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Active Cases',
      value: formatValue(data.active),
      today: null,
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Critical Cases',
      value: formatValue(data.critical),
      today: null,
      icon: AlertTriangle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ];

  // Update the risk level calculation based on country-specific metrics
  const getRiskLevels = (country) => {
    const casesPerMillion = country.casesPerOneMillion || 0;
    const deathsPerMillion = country.deathsPerOneMillion || 0;
    const recoveryRate = ((country.recovered / country.cases) * 100) || 0;

    const currentLevel = 
      (casesPerMillion > 200000 || deathsPerMillion > 3000 || recoveryRate < 65) ? 'High' :
      (casesPerMillion > 100000 || deathsPerMillion > 1000 || recoveryRate < 85) ? 'Moderate' : 
      'Low';

    return {
      currentLevel,
      levels: {
        High: {
          level: 'High Risk',
          color: 'text-red-600',
          bg: 'bg-red-50',
          borderColor: 'border-red-200',
          description: 'Severe impact on healthcare system',
          criteria: 'Cases/1M > 200K or Deaths/1M > 3K',
          recoveryRate: '< 65%',
          actualRecoveryRate: recoveryRate
        },
        Moderate: {
          level: 'Moderate Risk',
          color: 'text-yellow-600',
          bg: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          description: 'Significant but manageable situation',
          criteria: 'Cases/1M > 100K or Deaths/1M > 1K',
          recoveryRate: '65% - 85%',
          actualRecoveryRate: recoveryRate
        },
        Low: {
          level: 'Low Risk',
          color: 'text-green-600',
          bg: 'bg-green-50',
          borderColor: 'border-green-200',
          description: 'Well-controlled situation',
          criteria: 'Cases/1M < 100K and Deaths/1M < 1K',
          recoveryRate: '> 85%',
          actualRecoveryRate: recoveryRate
        }
      }
    };
  };

  const riskAssessment = getRiskLevels(data);
  
  const statusCards = (
    <div className="grid grid-cols-1 gap-6 mt-6">
      <h3 className="text-xl font-bold text-gray-800">Risk Level Assessment</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(riskAssessment.levels).map(([key, level]) => (
          <div 
            key={key}
            className={`p-6 rounded-xl border ${level.bg} ${
              riskAssessment.currentLevel === key 
                ? `${level.borderColor} border-2` 
                : 'border-gray-200'
            }`}
          >
            <div className={`text-2xl font-bold ${level.color} mb-2`}>
              {level.level}
            </div>
            <div className="text-sm text-gray-600 mb-2">
              {level.description}
            </div>
            <div className={`text-xs ${level.color} font-medium mb-3`}>
              {level.criteria}
            </div>
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Recovery Rate:</span>
                <div className="text-right">
                  <div className={`text-sm font-medium ${level.color}`}>
                    {level.recoveryRate}
                  </div>
                  <div className="text-xs text-gray-500">
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Country Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img
              src={data.countryInfo.flag}
              alt={`${data.country} flag`}
              className="w-16 h-12 object-cover rounded-lg border-2 border-gray-200"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{data.country}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>{data.continent}</span>
                <span>•</span>
                <span>Population: {dataUtils.formatNumber(data.population)}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center text-sm text-gray-500">
              <Calendar size={16} className="mr-1" />
              Updated: {new Date(data.updated).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`bg-white rounded-xl shadow-lg border ${stat.borderColor} p-6 hover:shadow-xl transition-shadow duration-200`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon size={24} className={stat.color} />
                </div>
                {stat.today !== null && stat.today > 0 && (
                  <div className="flex items-center space-x-1">
                    <TrendingUp size={16} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">
                      +{dataUtils.formatNumber(stat.today)} today
                    </span>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">
                  {stat.title}
                </h3>
                <div className="text-2xl font-bold text-gray-800">
                  {stat.value}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Stats Section - Risk Level and Mortality Analysis */}
      {statusCards}

      {/* Additional Metrics */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Tests</div>
            <div className="text-lg font-semibold text-gray-800">
              {formatValue(data.tests)}
            </div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Cases/1M pop</div>
            <div className="text-lg font-semibold text-gray-800">
              {dataUtils.formatNumber(data.casesPerOneMillion)}
            </div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Deaths/1M pop</div>
            <div className="text-lg font-semibold text-gray-800">
              {dataUtils.formatNumber(data.deathsPerOneMillion)}
            </div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Tests/1M pop</div>
            <div className="text-lg font-semibold text-gray-800">
              {dataUtils.formatNumber(data.testsPerOneMillion)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountryStats;