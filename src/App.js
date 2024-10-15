import React, { useEffect, useState } from 'react';
import HtmlDataExtractor from './components/HtmlDataExtractor';
import DataUsageChart from './components/DataUsageChart';
import './styles/App.css';

function App() {
  const [reload, setReload] = useState(true);
  useEffect(() => {
    if (reload) {
      setTimeout(() => {
        setReload(false)
      }, 500);
    }
  }, [reload])
  return (
    <div className="App">
      <h1 class='elegantshadow'>Wishnet Usage Tracker</h1>
      <HtmlDataExtractor setReload={setReload} />
      {reload ? <div className='loader-container'><span className="loader" /></div> : <DataUsageChart />}
    </div>
  );
}

export default App;
