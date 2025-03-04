import React, { useState, useEffect } from 'react';
import '../styles/DateFilter.css';

const DateFilter = ({ onFilterChange, minDate }) => {
  // Set default to last 7 days
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [relativeRange, setRelativeRange] = useState('7');
  const [error, setError] = useState('');

  // Set initial dates when component mounts
  useEffect(() => {
    handleRelativeRangeChange('7');
  }, [minDate]);

  const handleRelativeRangeChange = (value) => {
    setRelativeRange(value);
    if (value) {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - parseInt(value));
      
      // Ensure start date is not before minDate
      if (minDate && start < new Date(minDate)) {
        start.setTime(new Date(minDate).getTime());
      }
      
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
    }
  };

  const validateDates = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    
    if (minDate && start < new Date(minDate)) {
      setError(`Start date cannot be before ${new Date(minDate).toLocaleDateString()}`);
      return false;
    }
    
    if (end > today) {
      setError('End date cannot be in the future');
      return false;
    }
    if (start > end) {
      setError('Start date cannot be after end date');
      return false;
    }
    if (Math.abs(end - start) / (1000 * 60 * 60 * 24) > 90) {
      setError('Date range cannot exceed 90 days');
      return false;
    }
    setError('');
    return true;
  };

  const handleApplyFilter = () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    if (validateDates()) {
      onFilterChange({ startDate, endDate });
    }
  };

  return (
    <div className="date-filter">
      <div className="tooltip">
        <input
          type="date"
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value);
            setRelativeRange('');
          }}
          placeholder="Start Date"
          min={minDate}
          max={endDate || new Date().toISOString().split('T')[0]}
          className={error && error.includes('Start date') ? 'invalid' : ''}
        />
        {error && error.includes('Start date') && 
          <span className="tooltip-text">{error}</span>
        }
      </div>
      
      <div className="tooltip">
        <input
          type="date"
          value={endDate}
          onChange={(e) => {
            setEndDate(e.target.value);
            setRelativeRange('');
          }}
          placeholder="End Date"
          min={startDate || minDate}
          max={new Date().toISOString().split('T')[0]}
          className={error && error.includes('End date') ? 'invalid' : ''}
        />
        {error && error.includes('End date') && 
          <span className="tooltip-text">{error}</span>
        }
      </div>
      
      <select
        value={relativeRange}
        onChange={(e) => handleRelativeRangeChange(e.target.value)}
      >
        <option value="">Custom Range</option>
        <option value="3">Last 3 Days</option>
        <option value="7">Last 7 Days</option>
        <option value="14">Last 14 Days</option>
        <option value="30">Last 30 Days</option>
      </select>
      <button onClick={handleApplyFilter}>Apply Filter</button>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default DateFilter;
