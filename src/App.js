import React, { useEffect, useState } from 'react';
import HtmlDataExtractor from './components/HtmlDataExtractor';
import DataUsageChart from './components/DataUsageChart';
import RotationBanner from './components/RotationBanner';
import './styles/App.css';
import { useFetchData } from './hooks/useFetchData';

function App() {
  const { reload, setReload, apiFailed, message, showSnackbar, setShowSnackbar, data, dailyData, monthlyData, usageData } =
    useFetchData(true);

  const [showManualInput, setShowManualInput] = useState(false);
  const [showRotationBanner, setShowRotationBanner] = useState(true);

  useEffect(() => {
    const lockOrientation = async () => {
      try {
        if (typeof window !== 'undefined' && window.screen && window.screen.orientation) {
          await window.screen.orientation.lock('landscape');
        }
      } catch (error) {
        console.log('Orientation lock failed:', error);
      }
    };

    const isMobile = typeof window !== 'undefined' && /Mobi|Android/i.test(window.navigator.userAgent);

    if (isMobile) {
      lockOrientation();
    }
  }, []);

  return (
    <div className='App'>
      {showRotationBanner && typeof window !== 'undefined' && /Mobi|Android/i.test(window.navigator.userAgent) && (
        <RotationBanner onClose={() => setShowRotationBanner(false)} />
      )}
      <h1 className='elegantshadow'>Wishnet Usage Tracker</h1>

      <div className='toggle-container'>
        <label className='toggle'>
          <input type='checkbox' checked={showManualInput} onChange={() => setShowManualInput(!showManualInput)} />
          <span className='slider'></span>
          <span className='label'>Manual Input</span>
        </label>
      </div>

      {(apiFailed || showManualInput) && <HtmlDataExtractor setReload={setReload} />}
      {reload ? (
        <div className='loader-container'>
          <span className='loader' />
        </div>
      ) : (
        !apiFailed && (
          <div className="chart-grid">
            <div className="chart-container">
              <h3>Raw Session Data</h3>
              <DataUsageChart data={data} timeGranularity="session" />
            </div>
            <div className="chart-container">
              <h3>Daily Totals</h3>
              <DataUsageChart data={dailyData} timeGranularity="daily" />
            </div>
            <div className="chart-container">
              <h3>Weekly Totals (Sunday Start)</h3>
              <DataUsageChart data={dailyData} timeGranularity="weekly" />
            </div>
            <div className="chart-container">
              <h3>Monthly Totals</h3>
              <DataUsageChart data={monthlyData} timeGranularity="monthly" />
            </div>
          </div>
        )
      )}
      {showSnackbar && (
        <div className='snackbar'>
          {message}
          <button className='snackbar-close' onClick={() => setShowSnackbar(false)}>
            &times;
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
