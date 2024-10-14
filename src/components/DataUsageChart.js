import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
      setData(jsonData); // Use the raw data directly
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div className="chart-container">
      <h2 className="chart-title">Data Usage Chart</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="loginTime" />
          <YAxis label={{ value: 'Data Usage (MB)', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="download" stroke="#8884d8" name="Download (MB)" />
          <Line type="monotone" dataKey="upload" stroke="#82ca9d" name="Upload (MB)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DataUsageChart;
