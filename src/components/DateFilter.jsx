import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
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

// Get the start of the year
const getStartOfYear = (date) => {
  if (!date) return null;
  return new Date(date.getFullYear(), 0, 1);
};

// Get the end of the year
const getEndOfYear = (date) => {
  if (!date) return null;
  return new Date(date.getFullYear(), 11, 31);
};

// Get the start of N months ago
const getStartOfNMonthsAgo = (date, monthsAgo) => {
  if (!date) return null;
  // Handles year rollovers correctly
  const targetMonth = date.getMonth() - monthsAgo;
  return new Date(date.getFullYear(), targetMonth, 1);
};

const dailySessionWeeklyPresets = [
  { value: '', label: 'Custom' }, // Custom range first
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'thisWeek', label: 'This Week' },
  { value: 'lastWeek', label: 'Last Week' },
  { value: 'last7', label: 'Last 7 Days' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'last30', label: 'Last 30 Days' },
];

const monthlyPresets = [
  { value: '', label: 'Custom' }, // Custom range first
  { value: 'all', label: 'All Time' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'last3', label: 'Last 3 Months' }, 
  { value: 'last6', label: 'Last 6 Months' },
  { value: 'thisYear', label: 'This Year' },
  { value: 'lastYear', label: 'Last Year' },
  { value: 'last12', label: 'Last 12 Months' }, 
];

const DateFilter = ({ 
  onFilterChange,
  initialStartDate, // DD-MM-YYYY HH:mm:ss format from parent
  initialEndDate,   // DD-MM-YYYY HH:mm:ss format from parent
  minDate: minDateStr, // Renamed props to avoid conflict with parsed Dates
  maxDate: maxDateStr, // Renamed props
  timeGranularity = 'daily' // Default to daily
}) => {
  // Parse min/max dates only once
  const minDate = useMemo(() => parseDate(minDateStr), [minDateStr]);
  const maxDate = useMemo(() => parseDate(maxDateStr), [maxDateStr]);
  
  // State for date inputs (YYYY-MM-DD format for input control)
  const [inputStartDate, setInputStartDate] = useState('');
  const [inputEndDate, setInputEndDate] = useState('');
  
  // State for the quick range selector
  const [relativeRange, setRelativeRange] = useState(''); // Default to Custom initially
  
  const [error, setError] = useState('');

  // Determine which presets to use based on granularity
  const presetOptions = useMemo(() => {
      return timeGranularity === 'monthly' ? monthlyPresets : dailySessionWeeklyPresets;
  }, [timeGranularity]);

  // --- Define Calculate Date Range Function First ---
  // Use useCallback for calculateDateRange as it's in dependency arrays
  const calculateDateRange = useCallback((preset) => {
    let startDate = null;
    let endDate = null;
    const today = new Date();
    
    // Use memoized minDate/maxDate directly
    // const min = minDate ? parseDate(minDate) : null;
    // const max = maxDate ? parseDate(maxDate) : null;
    
    // Determine the *potential* end date based on max data or today
    const potentialEndDate = maxDate ? new Date(maxDate) : new Date();
    potentialEndDate.setHours(0, 0, 0, 0);

    switch (preset) {
      case 'all':
        startDate = minDate ? new Date(minDate) : null;
        endDate = maxDate ? new Date(maxDate) : null;
        break;
      case 'today':
        // Only possible if max date allows today
        if (maxDate && maxDate < today) {
          startDate = new Date(maxDate); // Clamp to maxDate if today isn't reachable
          endDate = new Date(maxDate);
        } else {
          startDate = new Date(today);
          endDate = new Date(today);
        }
        break;
      case 'yesterday': { // Use block scope for const
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        startDate = new Date(yesterday);
        endDate = new Date(yesterday);
        break;
      }
      case 'last7':
        // Use potentialEndDate to determine end
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
        endDate = new Date(potentialEndDate); // End is potential end date
        break;
      case 'lastWeek': { // Use block scope for const
        const startOfThisWeek = getStartOfWeek(potentialEndDate);
        endDate = new Date(startOfThisWeek);
        endDate.setDate(startOfThisWeek.getDate() - 1); // End of last week (Saturday)
        startDate = getStartOfWeek(endDate); // Start of last week (Sunday)
        break;
      }
      case 'thisMonth':
        // Use potentialEndDate to determine 'this month'
        startDate = getStartOfMonth(potentialEndDate);
        endDate = new Date(potentialEndDate); // End is potential end date
        break;
      case 'lastMonth':
        // Use potentialEndDate to determine when 'last month' was
        const startOfThisMonthForLast = getStartOfMonth(potentialEndDate);
        endDate = new Date(startOfThisMonthForLast);
        endDate.setDate(startOfThisMonthForLast.getDate() - 1); // End of last month
        startDate = getStartOfMonth(endDate); // Start of last month
        break;
      // --- Monthly Presets --- 
      case 'last3': // Monthly Only
        endDate = getEndOfMonth(potentialEndDate); // End of current potential month
        startDate = getStartOfNMonthsAgo(potentialEndDate, 2); // Start of 2 months ago
        break;
      case 'last6': // Monthly Only
        endDate = getEndOfMonth(potentialEndDate);
        startDate = getStartOfNMonthsAgo(potentialEndDate, 5);
        break;
      case 'thisYear': // Monthly Only
        startDate = getStartOfYear(potentialEndDate);
        endDate = new Date(potentialEndDate); // Use potential end date
        break;
      case 'lastYear': { // Monthly Only
        const lastYearDate = new Date(potentialEndDate);
        lastYearDate.setFullYear(potentialEndDate.getFullYear() - 1);
        startDate = getStartOfYear(lastYearDate);
        endDate = getEndOfYear(lastYearDate);
        break;
      }
      case 'last12': { // Monthly Only
         endDate = getEndOfMonth(potentialEndDate); // End of the current potential month
         startDate = getStartOfNMonthsAgo(potentialEndDate, 11); // Start of month 11 months ago
         break;
      }
      default:
        // Custom or invalid preset value
        console.warn('Unhandled preset value in calculateDateRange:', preset);
        return null; 
    }

    // Clamp calculated dates by min/max
    if (startDate && minDate && startDate < minDate) startDate = new Date(minDate);
    if (endDate && maxDate && endDate > maxDate) endDate = new Date(maxDate);
    
    // After clamping, ensure start is not after end (can happen if min/max window is small or preset range is outside data)
    if (startDate && endDate && startDate > endDate) {
        // If start is clamped past end, the valid range is effectively empty or just the end date.
        // Depending on desired behavior, either return null or set start = end.
        // Setting start = end might be less confusing for the user than showing nothing.
        startDate = new Date(endDate);
    } 

    return { startDate, endDate };
  }, [minDate, maxDate]); // Use memoized min/max Dates

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
    // Use the memoized minDate/maxDate directly
    // const min = parseDate(minDate);
    // const max = parseDate(maxDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to start of day

    let matchedRange = ''; // Default to Custom

    // Iterate through the *correct* set of presets for the current granularity
    for (const preset of presetOptions) {
        if (preset.value === '') continue; // Skip custom option

        const calculated = calculateDateRange(preset.value); // Use existing function
        if (!calculated || !calculated.startDate || !calculated.endDate) continue;

        // Compare using isSameDay
        if (isSameDay(start, calculated.startDate) && isSameDay(end, calculated.endDate)) {
            matchedRange = preset.value;
            break; // Found a match
        }
    }

    // --- Removed previous repetitive checks, now uses the loop above --- 

    setRelativeRange(matchedRange);

  }, [initialStartDate, initialEndDate, minDate, maxDate, presetOptions, calculateDateRange]); // Added dependencies


  // --- Handlers --- 

  const handleRelativeRangeChange = useCallback((value) => {
    setRelativeRange(value);
    setError('');
    
    if (!value) return; // Switched to Custom, do nothing until Apply

    const range = calculateDateRange(value);

    if (range && range.startDate && range.endDate) {
      // Update the inputs as well when a preset is selected
      setInputStartDate(formatToYYYYMMDD(range.startDate));
      setInputEndDate(formatToYYYYMMDD(range.endDate));
      // Call parent with custom format
      onFilterChange({
        startDate: formatCustomDate(range.startDate),
        endDate: formatCustomDate(range.endDate)
      });
    } else {
      console.warn("Could not calculate range for preset:", value);
      // Clear inputs and filter if calculation fails
      setInputStartDate('');
      setInputEndDate('');
      onFilterChange({ startDate: null, endDate: null }); 
    }
  }, [calculateDateRange, onFilterChange]); // Added calculateDateRange dependency

  const validateDates = useCallback((startStr, endStr) => {
    // Parse using input format YYYY-MM-DD (from input fields)
    const start = startStr ? new Date(startStr + 'T00:00:00') : null; // Prevent timezone issues
    const end = endStr ? new Date(endStr + 'T00:00:00') : null;
    
    if (!start || !end) {
      setError('Invalid date format. Please use DD-MM-YYYY.'); // Or guide based on input format
      return false;
    }

    // Allow start date == end date
    if (start > end) {
      setError('Start date cannot be after end date');
      return false;
    }
    
    // Use memoized minDate/maxDate
    // const min = minDate ? parseDate(minDate) : null;
    // const max = maxDate ? parseDate(maxDate) : null;

    if (minDate && start < minDate) {
      setError(`Start date cannot be before ${formatToYYYYMMDD(minDate)}`); // Show YYYY-MM-DD in error
      return false;
    }
    
    if (maxDate && end > maxDate) {
      setError(`End date cannot be after ${formatToYYYYMMDD(maxDate)}`); // Show YYYY-MM-DD in error
      return false;
    }
    
    setError('');
    return true;
  }, [minDate, maxDate]); // Added dependencies

  const handleDateInputChange = useCallback((e) => {
    const { name, value } = e.target; // value is YYYY-MM-DD from input
    
    if (name === 'startDate') {
      setInputStartDate(value);
    } else {
      setInputEndDate(value);
    }
    // When input changes, switch to Custom mode
    // but don't trigger filter change until Apply
    setRelativeRange(''); 
    setError(''); // Clear validation error on input change
  }, []); // Empty dependency array is correct here

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    // Validate using the current input state (YYYY-MM-DD)
    if (validateDates(inputStartDate, inputEndDate)) {
        // Parse validated dates from inputs
        const startInputDate = parseDate(inputStartDate);
        const endInputDate = parseDate(inputEndDate);

        if (startInputDate && endInputDate) {
          // Convert back to custom format for parent
          onFilterChange({
            startDate: formatCustomDate(startInputDate),
            endDate: formatCustomDate(endInputDate)
          });
          // Optional: Re-run the effect logic here to potentially update dropdown
          // The parent state update should trigger the sync effect anyway.
        } else {
             setError('Invalid date selected in calendar.'); // Should not happen if validateDates passed
        }
    }
  }, [inputStartDate, inputEndDate, validateDates, onFilterChange]); // Added dependencies
  
  // Format dates for min/max attributes of input (YYYY-MM-DD)
  const inputMinDate = useMemo(() => minDate ? formatToYYYYMMDD(minDate) : '', [minDate]);
  const inputMaxDate = useMemo(() => maxDate ? formatToYYYYMMDD(maxDate) : '', [maxDate]);

  return (
    <div className="date-filter" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); onFilterChange({ relativeRange, startDate: inputStartDate, endDate: inputEndDate }); }} className="futuristic-form" style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
        <select 
          value={relativeRange} 
          onChange={(e) => handleRelativeRangeChange(e.target.value)}
          className="range-select futuristic-select"
          style={{ appearance: 'none', backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\'><path d=\'M7 10l5 5 5-5H7z\' fill=\'%23FF0000\' /></svg>")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', paddingRight: '30px' }}  // Updated to red fill
        >
          {/* Use the dynamically selected presets */} 
          {presetOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <input
          type="date"
          name="startDate"
          value={inputStartDate}
          onChange={handleDateInputChange}
          min={inputMinDate}
          max={inputEndDate || inputMaxDate}
          required
          disabled={!minDate || relativeRange !== ''}
          className="futuristic-input"
        />
        <input
          type="date"
          name="endDate"
          value={inputEndDate}
          onChange={handleDateInputChange}
          min={inputStartDate || inputMinDate}
          max={inputMaxDate}
          required
          disabled={!maxDate || relativeRange !== ''}
          className="futuristic-input"
        />
        <button type="submit" className="apply-button futuristic-button">Apply Filter</button>
      </form>
      {error && <div className="error-message futuristic-error-message">{error}</div>}
    </div>
  );
};

// Add PropType definition for timeGranularity
DateFilter.propTypes = {
    onFilterChange: PropTypes.func.isRequired,
    initialStartDate: PropTypes.string,
    initialEndDate: PropTypes.string,
    minDate: PropTypes.string, // Still expecting string from parent (DD-MM-YYYY)
    maxDate: PropTypes.string, // Still expecting string from parent (DD-MM-YYYY)
    timeGranularity: PropTypes.oneOf(['session', 'daily', 'monthly', 'weekly']).isRequired
};

export default React.memo(DateFilter); // Use React.memo as per memory
