import React from 'react';
import HtmlDataExtractor from './components/HtmlDataExtractor';
import DataUsageChart from './components/DataUsageChart';
import './styles/App.css';

function App() {
  return (
    <div className="App">
      <HtmlDataExtractor />
      <DataUsageChart />
    </div>
  );
}

export default App;
