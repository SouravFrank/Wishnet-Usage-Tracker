import React, { useState, useEffect } from 'react';
import ChartComponent from './ChartComponent';
import DateFilter from './DateFilter';

const API_URL = 'http://localhost:8080/api/usageData';

const DataUsageChart = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

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
      jsonData.sort((a, b) => parseDate(a.loginTime) - parseDate(b.loginTime));
      setData(jsonData);
      setFilteredData(jsonData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const parseDate = (dateString) => {
    const [date, time] = dateString.split(' ');
    const [day, month, year] = date.split('-');
    return new Date(year, month - 1, day, ...time.split(':'));
  };

  const handleFilterChange = ({ startDate, endDate }) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const filtered = data.filter(item => {
      const itemDate = parseDate(item.loginTime);
      return itemDate >= start && itemDate <= end;
    });
    setFilteredData(filtered);
  };

  return (
    <div>
      <DateFilter onFilterChange={handleFilterChange} />
      <ChartComponent data={filteredData} />
    </div>
  );
};

export default DataUsageChart;