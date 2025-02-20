import React, { useState } from 'react';
import ChartComponent from './ChartComponent';
import DateFilter from './DateFilter';
import { parseDate } from '../utils/datahelper';

const DataUsageChart = ({ data }) => {
  const [filteredData, setFilteredData] = useState(data);

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