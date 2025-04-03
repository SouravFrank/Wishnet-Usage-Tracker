import React, { useState, useEffect, useMemo } from 'react';
import ChartComponent from './ChartComponent';
import DateFilter from './DateFilter';
import { parseDate } from '../utils/datahelper';
import PropTypes from 'prop-types';

const DataUsageChart = ({ data = [], timeGranularity = 'daily' }) => {
  console.log(timeGranularity, " 🚀 ~ DataUsageChart ~ data:", data)
  const [filteredData, setFilteredData] = useState(data);

  // Find the earliest date in the data
  const minDate = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    const dates = data.map(item => parseDate(item.loginTime));
    const earliestDate = new Date(Math.min(...dates));
    return earliestDate.toISOString().split('T')[0];
  }, [data]);

  // Apply initial filter when component mounts
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7); // Default to last 7 days
    
    // Ensure start date is not before minDate
    if (minDate && start < new Date(minDate)) {
      start.setTime(new Date(minDate).getTime());
    }
    
    handleFilterChange({
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    });
  }, [data, minDate]);

  const handleFilterChange = ({ startDate, endDate }) => {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    
    if (isNaN(start) || isNaN(end)) return;

    const filtered = data.filter(item => {
      const itemDate = parseDate(item.loginTime);
      return !isNaN(itemDate) && itemDate >= start && itemDate <= end;
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

export default React.memo(DataUsageChart);