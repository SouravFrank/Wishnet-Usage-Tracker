import React, { useEffect, useState } from 'react';
import HtmlDataExtractor from './components/HtmlDataExtractor';
import DataUsageChart from './components/DataUsageChart';
import RotationBanner from './components/RotationBanner';
import './styles/App.css';
import { useFetchData } from './hooks/useFetchData';

function App() {
  const { reload, setReload, apiFailed, message, showSnackbar, setShowSnackbar, data } = useFetchData(true);

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
    <div className="App">
      {showRotationBanner && typeof window !== 'undefined' && /Mobi|Android/i.test(window.navigator.userAgent) && (
        <RotationBanner onClose={() => setShowRotationBanner(false)} />
      )}
      <h1 className='elegantshadow'>Wishnet Usage Tracker</h1>

      <div className="toggle-container">
        <label className="toggle">
          <input
            type="checkbox"
            checked={showManualInput}
            onChange={() => setShowManualInput(!showManualInput)}
          />
          <span className="slider"></span>
          <span className="label">Manual Input</span>
        </label>
      </div>

      {(apiFailed || showManualInput) && <HtmlDataExtractor setReload={setReload} />}
      {reload ? (
        <div className='loader-container'><span className="loader" /></div>
      ) : (
        !apiFailed && <DataUsageChart data={data} />
      )}
      {showSnackbar && (
        <div className="snackbar">
          {message}
          <button className="snackbar-close" onClick={() => setShowSnackbar(false)}>
            &times;
          </button>
        </div>
      )}
    </div>
  );
}

export default App;