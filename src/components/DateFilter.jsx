import React, { useState } from 'react';
import '../styles/DateFilter.css';

const DateFilter = ({ onFilterChange }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [relativeRange, setRelativeRange] = useState('');

  const handleApplyFilter = () => {
    if (relativeRange) {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - parseInt(relativeRange));
      onFilterChange({ startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] });
    } else if (startDate && endDate) {
      onFilterChange({ startDate, endDate });
    }
  };

  return (
    <div className="date-filter">
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        placeholder="Start Date"
      />
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        placeholder="End Date"
      />
      <select
        value={relativeRange}
        onChange={(e) => setRelativeRange(e.target.value)}
      >
        <option value="">Custom Range</option>
        <option value="3">Last 3 Days</option>
        <option value="7">Last 7 Days</option>
        <option value="14">Last 14 Days</option>
        <option value="30">Last 30 Days</option>
      </select>
      <button onClick={handleApplyFilter}>Apply Filter</button>
    </div>
  );
};

export default DateFilter;
