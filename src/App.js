import React, { useEffect, useState } from 'react';
import HtmlDataExtractor from './components/HtmlDataExtractor';
import DataUsageChart from './components/DataUsageChart';
import './styles/App.css';

function App() {
  const [reload, setReload] = useState(true);
  const [apiFailed, setApiFailed] = useState(false);
  const [message, setMessage] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/fetchWishnetData");
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || data.details || 'Backend API failed');
        }
        
        setApiFailed(false);
      } catch (error) {
        console.error("API call failed:", error);
        setApiFailed(true);
        setMessage(error.message);
        setShowSnackbar(true);
      }
      setReload(false);
    };

    if (reload) {
      fetchData();
    }
  }, [reload]);

  return (
    <div className="App">
      <h1 className='elegantshadow'>Wishnet Usage Tracker</h1>
      {apiFailed && <HtmlDataExtractor setReload={setReload} />}
      {reload ? (
        <div className='loader-container'><span className="loader" /></div>
      ) : (
        !apiFailed && <DataUsageChart />
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
