import React, { useState, useEffect, useMemo } from 'react';
import ChartComponent from './ChartComponent';
import DateFilter from './DateFilter';
import { parseDate, formatCustomDate } from '../utils/datahelper';
import PropTypes from 'prop-types';

const DataUsageChart = ({ data = [], timeGranularity = 'daily' }) => {
  const [filteredData, setFilteredData] = useState(data);
  console.log("🚀 ~ DataUsageChart ~ filteredData:", filteredData)

  // Find the earliest date in the data
  const minDate = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    const dates = data.map(item => parseDate(item.loginTime || item.date));
    const earliestDate = new Date(Math.min(...dates.filter(d => d !== null).map(d => d.getTime())));
    return formatCustomDate(earliestDate).split(' ')[0]; // Get only the date part
  }, [data]);

  // Apply initial filter when component mounts
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7); // Default to last 7 days
    
    // Ensure start date is not before minDate
    if (minDate) {
      const minDateTime = parseDate(minDate);
      if (minDateTime && start < minDateTime) {
        start.setTime(minDateTime.getTime());
      }
    }
    
    handleFilterChange({
      startDate: formatCustomDate(start),
      endDate: formatCustomDate(end)
    });
  }, [data, minDate]);

  const handleFilterChange = ({ startDate, endDate }) => {
    console.log("🚀 ~ handleFilterChange ~ input dates:", { startDate, endDate });
    
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    console.log("🚀 ~ handleFilterChange ~ parsed dates:", { start, end });
    
    if (!start || !end) return;

    const filtered = data.filter(item => {
      const itemDate = parseDate(item.loginTime || item.date);
      return itemDate && itemDate >= start && itemDate <= end;
    });
    
    setFilteredData(filtered);
  };

  return (
    <div>
      <DateFilter onFilterChange={handleFilterChange} minDate={minDate} />
      <ChartComponent 
        data={filteredData} 
        timeGranularity={timeGranularity}
        dateFormat="DD/MM" 
      />
    </div>
  );
};

DataUsageChart.propTypes = {
  data: PropTypes.array,
  timeGranularity: PropTypes.oneOf(['session', 'daily', 'weekly', 'monthly'])
};

export default DataUsageChart;