import React from 'react';
import { Globe, AlertCircle } from 'lucide-react';
import { useGlobalState } from '../context/GlobalStateContext';
import CountrySelector from '../components/CountrySelector';
import CountryStats from '../components/CountryStats';
import MetricFilter from '../components/MetricFilter';
import ComparisonChart from '../components/ComparisonChart';
import HistoricalChart from '../components/HistoricalChart';
import ErrorBoundary from '../components/ErrorBoundary';

const Dashboard = () => {
  const { state } = useGlobalState();
  const { loading, error } = state;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-red-200">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-700 mb-4">Oops! Something went wrong</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary-500 rounded-lg">
                  <Globe className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 leading-tight">COVID-19 Dashboard</h1>
                  <p className="text-sm text-gray-500">Global Statistics & Analysis</p>
                </div>
              </div>
              <div className="w-80 flex-shrink-0">
                <CountrySelector />
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {loading ? (
            <LoadingState />
          ) : (
            <div className="grid gap-4">
              {/* Country Stats */}
              <div className="animate-fade-in">
                <CountryStats />
              </div>

              {/* Metric Filter - Moved here */}
              <div className="animate-fade-in">
                <MetricFilter />
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  <ComparisonChart />
                </div>
                <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
                  <HistoricalChart />
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="text-center text-sm text-gray-500">
              Data provided by disease.sh API • Updated every 5 minutes
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
};

const LoadingState = () => (
  <div className="space-y-6">
    {[1, 2, 3].map((i) => (
      <div key={i} className="animate-pulse bg-white rounded-xl shadow-sm p-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    ))}
  </div>
);

export default Dashboard;
