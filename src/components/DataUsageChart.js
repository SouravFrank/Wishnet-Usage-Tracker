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
      // Sort data by login time in ascending order (oldest first)
      jsonData.sort((a, b) => parseDate(a.loginTime) - parseDate(b.loginTime));
      setData(jsonData); // Use the sorted data directly
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Function to parse date from DD-MM-YYYY HH:mm:ss format
  const parseDate = (dateString) => {
    const [date, time] = dateString.split(' ');
    const [day, month, year] = date.split('-');
    return new Date(year, month - 1, day, ...time.split(':')); // Month is 0-indexed
  };

  // Function to format MB to GB for tooltip
  const formatDataUsage = (value) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)} GB (${value} MB)`; // Format to 1 decimal place
    }
    return `${value} MB`;
  };

  // Function to format date to DD/MM
  const formatDate = (dateString) => {
    const [day, month] = dateString.split('-');
    return `${day}/${month}`;
  };

  return (
    <div className="chart-container">
      <h2 className="chart-title">Data Usage Chart</h2>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 2" />
          <XAxis 
            dataKey="loginTime" 
            tickFormatter={formatDate} 
            tick={{ angle: 0, textAnchor: 'middle', fontSize: 14 }} // Adjust font size for X-axis
          />
          <YAxis 
            label={{ value: 'Data Usage (GB)', angle: -90, position: 'insideLeft', fontSize: 15 }} 
            domain={[0, 'dataMax + 1000']} 
            tickFormatter={(value) => (value / 1000).toFixed(1)} // Convert MB to GB for Y-axis labels
            interval={0} // Show all ticks
            tick={{ fontSize: 14 }} // Adjust font size for Y-axis
          />
          <Tooltip formatter={(value, name, props) => formatDataUsage(value) + ` (${props.payload.sessionTime} duration)`} contentStyle={{ fontSize: 11.5 }} />
          <Legend />
          <Line type="monotone" dataKey="download" stroke="#800303" name="Download" />
          <Line type="monotone" dataKey="upload" stroke="#ff6767" name="Upload" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DataUsageChart;
