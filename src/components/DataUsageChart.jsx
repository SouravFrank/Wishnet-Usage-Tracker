import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ChartComponent from './ChartComponent';
import DateFilter from './DateFilter';
import { parseDate, formatCustomDate } from '../utils/datahelper';
import PropTypes from 'prop-types';

const DataUsageChart = ({ data = [], timeGranularity = 'daily' }) => {
  const [filteredData, setFilteredData] = useState([]);
  const [filterStartDate, setFilterStartDate] = useState(null);
  const [filterEndDate, setFilterEndDate] = useState(null);

  // Find the date range in the data
  const dateRange = useMemo(() => {
    if (!data || data.length === 0) return { minDate: null, maxDate: null };
    
    const dates = data.map(item => parseDate(item.loginTime || item.date));
    const validDates = dates.filter(d => d !== null);
    if (validDates.length === 0) return { minDate: null, maxDate: null };
    
    const timestamps = validDates.map(d => d.getTime());
    const earliestDate = new Date(Math.min(...timestamps));
    const latestDate = new Date(Math.max(...timestamps));
    
    return {
      minDate: formatCustomDate(earliestDate).split(' ')[0], // Custom format for display/logic
      maxDate: formatCustomDate(latestDate).split(' ')[0]  // Custom format for display/logic
    };
  }, [data]);

  // Apply initial filter (last 7 days or available range) when component mounts or data changes
  useEffect(() => {
    if (!data.length || !dateRange.minDate || !dateRange.maxDate) {
      setFilteredData([]);
      setFilterStartDate(null);
      setFilterEndDate(null);
      return;
    }
    
    // Determine default end date (today or maxDate)
    const today = new Date();
    const maxDataDate = parseDate(dateRange.maxDate);
    const initialEndDate = today > maxDataDate ? maxDataDate : today;
    
    // Determine default start date (7 days before end or minDate)
    const initialStartDate = new Date(initialEndDate);
    initialStartDate.setDate(initialEndDate.getDate() - 7);
    const minDataDate = parseDate(dateRange.minDate);
    
    if (initialStartDate < minDataDate) {
      initialStartDate.setTime(minDataDate.getTime());
    }

    const startFormatted = formatCustomDate(initialStartDate);
    const endFormatted = formatCustomDate(initialEndDate);

    setFilterStartDate(startFormatted);
    setFilterEndDate(endFormatted);

  }, [data, dateRange]);

  // Filter data whenever the date range changes
  useEffect(() => {
    if (!filterStartDate || !filterEndDate) {
      setFilteredData(data); // Show all data if no filter set
      return;
    }
    
    const start = parseDate(filterStartDate);
    const end = parseDate(filterEndDate);

    if (!start || !end) {
      console.warn('Invalid date range for filtering:', { filterStartDate, filterEndDate });
      setFilteredData([]); // Or handle error appropriately
      return;
    }
    
    // Set end time to end of day for inclusive filtering
    end.setHours(23, 59, 59, 999);

    const filtered = data.filter(item => {
      const itemDate = parseDate(item.loginTime || item.date);
      return itemDate && itemDate >= start && itemDate <= end;
    });

    setFilteredData(filtered);
  }, [data, filterStartDate, filterEndDate]);

  // Callback for DateFilter to update the range
  const handleFilterChange = useCallback(({ startDate, endDate }) => {
    setFilterStartDate(startDate);
    setFilterEndDate(endDate);
  }, []);

  return (
    <div>
      <DateFilter 
        onFilterChange={handleFilterChange} 
        initialStartDate={filterStartDate}
        initialEndDate={filterEndDate}
        minDate={dateRange.minDate}
        maxDate={dateRange.maxDate}
      />
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