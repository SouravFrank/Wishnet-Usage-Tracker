import React, { useState, useEffect } from 'react';
import '../styles/DataUsageChart.css';

const API_URL = 'http://localhost:8080/api/usageData';

const DataUsageChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const jsonData = await response.json();
      const processedData = processData(jsonData);
      setData(processedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const processData = (rawData) => {
    return rawData.map(item => ({
      date: item.loginTime,
      download: item.download,
      upload: item.upload
    }));
  };

  const maxDataUsage = Math.max(...data.map(item => Math.max(item.download, item.upload)));

  return (
    <div className="chart-container">
      <h2 className="chart-title">Data Usage Chart</h2>
      <div className="chart">
        {data.map((item, index) => (
          <div key={index} className="chart-bar">
            <div className="bar-label">{item.date}</div>
            <div className="bar-container">
              <div 
                className="bar download" 
                style={{height: `${(item.download / maxDataUsage) * 100}%`}}
                title={`Download: ${item.download.toFixed(2)} MB`}
              ></div>
              <div 
                className="bar upload" 
                style={{height: `${(item.upload / maxDataUsage) * 100}%`}}
                title={`Upload: ${item.upload.toFixed(2)} MB`}
              ></div>
            </div>
          </div>
        ))}
      </div>
      <div className="legend">
        <div className="legend-item">
          <div className="legend-color download"></div>
          <span>Download</span>
        </div>
        <div className="legend-item">
          <div className="legend-color upload"></div>
          <span>Upload</span>
        </div>
      </div>
    </div>
  );
};

export default DataUsageChart;
