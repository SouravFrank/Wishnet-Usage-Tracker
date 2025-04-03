import React, { useState, useEffect, useMemo } from 'react';
import {
  formatCustomDate,
  formatToYYYYMMDD,
  parseDate,
  isSameDay,
  getStartOfMonth,
  getEndOfMonth,
  getStartOfLastMonth,
  getEndOfLastMonth,
} from '../utils/datahelper';
import '../styles/DateFilter.css';

// Helper to get start of week (assuming Sunday as start)
const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday, 1 = Monday, ...
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
};

// Helper to get end of week (assuming Saturday as end)
const getEndOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday, 1 = Monday, ...
  const diff = d.getDate() + (6 - day);
  return new Date(d.setDate(diff));
};

const DateFilter = ({ 
  onFilterChange,
  initialStartDate, // DD-MM-YYYY HH:mm:ss format from parent
  initialEndDate,   // DD-MM-YYYY HH:mm:ss format from parent
  minDate,          // DD-MM-YYYY format from parent
  maxDate,          // DD-MM-YYYY format from parent
}) => {
  // State for date inputs (YYYY-MM-DD format for input control)
  const [inputStartDate, setInputStartDate] = useState('');
  const [inputEndDate, setInputEndDate] = useState('');
  
  // State for the quick range selector
  const [relativeRange, setRelativeRange] = useState(''); // Default to Custom initially
  
  const [error, setError] = useState('');

  // --- Effect to Sync Inputs from Parent --- 
  useEffect(() => {
    // Update input fields only if the prop values are valid
    const startYYYYMMDD = formatToYYYYMMDD(initialStartDate);
    const endYYYYMMDD = formatToYYYYMMDD(initialEndDate);
    if (startYYYYMMDD) setInputStartDate(startYYYYMMDD);
    if (endYYYYMMDD) setInputEndDate(endYYYYMMDD);
    
  }, [initialStartDate, initialEndDate]);

  // --- Effect to Sync Dropdown from Dates --- 
  useEffect(() => {
    if (!initialStartDate || !initialEndDate || !minDate || !maxDate) {
        setRelativeRange(''); // Cannot determine preset without full range info
        return;
    }

    const start = parseDate(initialStartDate);
    const end = parseDate(initialEndDate);
    const min = parseDate(minDate);
    const max = parseDate(maxDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to start of day

    let matchedRange = ''; // Default to Custom

    // Check All Time
    if (isSameDay(start, min) && isSameDay(end, max)) {
        matchedRange = 'all';
    }
    // Check Last 7 days (relative to maxDate or today)
    else {
        const effectiveEndDate = max ? new Date(max) : new Date();
        effectiveEndDate.setHours(0,0,0,0);
        const sevenDaysAgo = new Date(effectiveEndDate);
        sevenDaysAgo.setDate(effectiveEndDate.getDate() - 7 + 1); // +1 because it's inclusive
        const clampedSevenDaysAgo = sevenDaysAgo < min ? new Date(min) : sevenDaysAgo;
        if (isSameDay(start, clampedSevenDaysAgo) && isSameDay(end, effectiveEndDate)) {
            matchedRange = 'last7';
        }
    }
    // Add checks for other presets (Today, Yesterday, This Week, Last Week, This Month, Last Month, Last 30 Days) 
    // Example: Check Today (only if maxDate is today or later)
    if (!matchedRange && max && max >= today) { 
        if (isSameDay(start, today) && isSameDay(end, today)) {
            matchedRange = 'today';
        }
    }
    // ... (add similar logic for other presets using helper functions)
    
    // Add Check Last 30 days (similar logic to last 7)
    if (!matchedRange) {
        const effectiveEndDate = max ? new Date(max) : new Date();
        effectiveEndDate.setHours(0,0,0,0);
        const thirtyDaysAgo = new Date(effectiveEndDate);
        thirtyDaysAgo.setDate(effectiveEndDate.getDate() - 30 + 1);
        const clampedThirtyDaysAgo = thirtyDaysAgo < min ? new Date(min) : thirtyDaysAgo;
        if (isSameDay(start, clampedThirtyDaysAgo) && isSameDay(end, effectiveEndDate)) {
            matchedRange = 'last30';
        }
    }
    
    // Add Check This Month
    if (!matchedRange) {
        const effectiveEndDate = max ? new Date(max) : new Date(); // Use max date or today
        effectiveEndDate.setHours(0,0,0,0);
        const startOfMonth = getStartOfMonth(effectiveEndDate);
        const clampedStartOfMonth = startOfMonth < min ? new Date(min) : startOfMonth;
        // End date should be the effective end date, unless start of month is after it
        const effectiveThisMonthEnd = effectiveEndDate < clampedStartOfMonth ? clampedStartOfMonth : effectiveEndDate;
        if (isSameDay(start, clampedStartOfMonth) && isSameDay(end, effectiveThisMonthEnd)) {
            matchedRange = 'thisMonth';
        }
    }

    // Add Check Last Month
    if (!matchedRange) {
        const effectiveEndDate = max ? new Date(max) : new Date(); // Use max date or today
        effectiveEndDate.setHours(0,0,0,0);
        const startOfLastMonth = getStartOfLastMonth(effectiveEndDate);
        const endOfLastMonth = getEndOfLastMonth(effectiveEndDate);

        const clampedStart = startOfLastMonth < min ? new Date(min) : startOfLastMonth;
        // Ensure the end is not after the max available date
        const clampedEnd = endOfLastMonth > max ? new Date(max) : endOfLastMonth;
        
        // Check if the *entire* last month is requested and available
        if (clampedStart <= clampedEnd && isSameDay(start, clampedStart) && isSameDay(end, clampedEnd)) {
             // Additional check: make sure the start wasn't clamped *past* the end
             if (parseDate(minDate) <= endOfLastMonth) { 
                 matchedRange = 'lastMonth';
             }
        }
    }

    setRelativeRange(matchedRange);

  }, [initialStartDate, initialEndDate, minDate, maxDate]);


  // --- Handlers --- 

  const calculateDateRange = (preset) => {
    let startDate = null;
    let endDate = null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const min = minDate ? parseDate(minDate) : null;
    const max = maxDate ? parseDate(maxDate) : null;
    
    // Determine the *potential* end date based on max data or today
    const potentialEndDate = max ? new Date(max) : new Date();
    potentialEndDate.setHours(0, 0, 0, 0);

    switch (preset) {
      case 'all':
        startDate = min;
        endDate = max;
        break;
      case 'today':
        // Only possible if max date allows today
        if (potentialEndDate >= today) {
           startDate = new Date(today);
           endDate = new Date(today);
        } else {
            // Fallback if today isn't possible (e.g., max date is in past)
            startDate = new Date(potentialEndDate);
            endDate = new Date(potentialEndDate);
        }
        break;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        // Check if yesterday is possible within range
        if (potentialEndDate >= yesterday) {
            startDate = new Date(yesterday);
            endDate = new Date(yesterday);
        } else {
            // Fallback: If yesterday is after max, use max. If before min, this is handled by clamping.
            startDate = new Date(potentialEndDate);
            endDate = new Date(potentialEndDate);
        }
        break;
      case 'last7':
        endDate = new Date(potentialEndDate);
        startDate = new Date(potentialEndDate);
        startDate.setDate(potentialEndDate.getDate() - 7 + 1); // Inclusive
        break;
      case 'last30':
        endDate = new Date(potentialEndDate);
        startDate = new Date(potentialEndDate);
        startDate.setDate(potentialEndDate.getDate() - 30 + 1); // Inclusive
        break;
      case 'thisWeek':
        // Use potentialEndDate to determine 'this week'
        startDate = getStartOfWeek(potentialEndDate);
        endDate = new Date(potentialEndDate); // end is potential end date within the week
        break;
      case 'lastWeek':
        // Use potentialEndDate to determine 'last week'
        const startOfThisWeek = getStartOfWeek(potentialEndDate);
        endDate = new Date(startOfThisWeek);
        endDate.setDate(startOfThisWeek.getDate() - 1); // End of last week
        startDate = getStartOfWeek(endDate); // Start of last week
        break;
      case 'thisMonth':
        startDate = getStartOfMonth(potentialEndDate);
        endDate = new Date(potentialEndDate);
        break;
      case 'lastMonth':
        const startOfThisMonthForLast = getStartOfMonth(potentialEndDate);
        endDate = new Date(startOfThisMonthForLast);
        endDate.setDate(startOfThisMonthForLast.getDate() - 1); // End of last month
        startDate = getStartOfMonth(endDate); // Start of last month
        break;
      default:
        return null; // Should not happen for presets
    }

    // Clamp calculated dates by min/max
    if (min && startDate < min) startDate = new Date(min);
    if (max && endDate > max) endDate = new Date(max);
    // After clamping, ensure start is not after end (can happen if min/max window is small)
    if (startDate > endDate) startDate = new Date(endDate); 

    return { startDate, endDate };
  };

  const handleRelativeRangeChange = (value) => {
    setRelativeRange(value);
    setError('');
    
    if (!value) return; // Switched to Custom, do nothing until Apply

    const range = calculateDateRange(value);

    if (range && range.startDate && range.endDate) {
      onFilterChange({
        startDate: formatCustomDate(range.startDate), // Use custom format for parent
        endDate: formatCustomDate(range.endDate)
      });
    } else {
      console.warn("Could not calculate range for preset:", value);
      // Optionally set error state or clear dates
      onFilterChange({ startDate: null, endDate: null }); // Clear filter if calculation fails
    }
  };

  const validateDates = (startStr, endStr) => {
    // Parse using custom format DD-MM-YYYY...
    const start = parseDate(startStr);
    const end = parseDate(endStr);
    
    if (!start || !end) {
      setError('Invalid date format. Please use DD-MM-YYYY.'); // Or guide based on input format
      return false;
    }

    // Allow start date == end date
    if (start > end) {
      setError('Start date cannot be after end date');
      return false;
    }
    
    const min = minDate ? parseDate(minDate) : null;
    const max = maxDate ? parseDate(maxDate) : null;

    if (min && start < min) {
      setError(`Start date cannot be before ${formatToYYYYMMDD(min)}`); // Show YYYY-MM-DD in error
      return false;
    }
    
    if (max && end > max) {
      setError(`End date cannot be after ${formatToYYYYMMDD(max)}`); // Show YYYY-MM-DD in error
      return false;
    }
    
    setError('');
    return true;
  };

  const handleDateInputChange = (e) => {
    const { name, value } = e.target; // value is YYYY-MM-DD from input
    
    if (name === 'startDate') {
      setInputStartDate(value);
    } else {
      setInputEndDate(value);
    }
    // When input changes, switch to Custom mode
    // but don't trigger filter change until Apply
    setRelativeRange(''); 
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Parse input YYYY-MM-DD
    const startInputDate = parseDate(inputStartDate);
    const endInputDate = parseDate(inputEndDate);

    if (!startInputDate || !endInputDate) {
        setError('Invalid date selected in calendar.');
        return;
    }

    // Convert back to custom format for validation and parent
    const customStart = formatCustomDate(startInputDate);
    const customEnd = formatCustomDate(endInputDate);

    if (validateDates(customStart, customEnd)) {
      onFilterChange({
        startDate: customStart,
        endDate: customEnd
      });
      // Optional: Re-run the effect logic here to potentially update dropdown
      // Or rely on the parent state update triggering the sync effect
    }
  };
  
  // Format dates for min/max attributes of input (YYYY-MM-DD)
  const inputMinDate = formatToYYYYMMDD(minDate);
  const inputMaxDate = formatToYYYYMMDD(maxDate);

  return (
    <form onSubmit={handleSubmit} className="date-filter">
      <div className="filter-section">
        <label>Date Range:</label> {/* Changed Label */}
        <select 
          value={relativeRange} 
          onChange={(e) => handleRelativeRangeChange(e.target.value)}
          className="range-select"
        >
          <option value="">Custom</option>
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="thisWeek">This Week</option>
          <option value="lastWeek">Last Week</option>
          <option value="last7">Last 7 Days</option>
          <option value="thisMonth">This Month</option>
          <option value="lastMonth">Last Month</option>
          <option value="last30">Last 30 Days</option>
        </select>
      </div>
      
      <div className="filter-section">
        <div className="date-inputs">
          <div>
            <label>Start Date:</label>
            <input
              type="date"
              name="startDate"
              value={inputStartDate} // Controlled by YYYY-MM-DD state
              onChange={handleDateInputChange}
              min={inputMinDate}
              max={inputEndDate || inputMaxDate} // Prevent start > end via picker
              required
              disabled={!minDate} // Disable if no data range
            />
          </div>
          <div>
            <label>End Date:</label>
            <input
              type="date"
              name="endDate"
              value={inputEndDate} // Controlled by YYYY-MM-DD state
              onChange={handleDateInputChange}
              min={inputStartDate || inputMinDate} // Prevent end < start via picker
              max={inputMaxDate}
              required
              disabled={!maxDate} // Disable if no data range
            />
          </div>
        </div>
        {/* Show Apply button only when in Custom mode */} 
        {relativeRange === '' && (
          <button type="submit" className="apply-button">Apply Filter</button>
        )}
      </div>
      
      {error && <div className="error-message">{error}</div>}
    </form>
  );
};

export default DateFilter;
