import React from 'react';
import { GlobalStateProvider } from './context/GlobalStateContext';
import Dashboard from './pages/Dashboard';
import './App.css';

const App = () => {
  return (
    <GlobalStateProvider>
      <Dashboard />
    </GlobalStateProvider>
  );
};

export default App;