import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { formatCustomDate, formatToYYYYMMDD, parseDate, isSameDay } from '../utils/datahelper';
import { TIME_GRANULARITY, GRANULARITY_PRESETS } from '../constants/dateFilterConstants';
import { calculateDateRange } from '../utils/dateFilterHelpers';
import '../styles/DateFilter.css';

const DateFilter = ({
  onFilterChange,
  initialStartDate,
  initialEndDate,
  minDate: minDateStr,
  maxDate: maxDateStr,
  timeGranularity = TIME_GRANULARITY.DAILY
}) => {
  // Parse min/max dates only once
  const minDate = useMemo(() => parseDate(minDateStr), [minDateStr]);
  const maxDate = useMemo(() => parseDate(maxDateStr), [maxDateStr]);

  // State for date inputs (YYYY-MM-DD format for input control)
  const [inputStartDate, setInputStartDate] = useState('');
  const [inputEndDate, setInputEndDate] = useState('');

  // State for the quick range selector
  const [relativeRange, setRelativeRange] = useState('');

  const [error, setError] = useState('');

  // Determine which presets to use based on granularity
  const presetOptions = useMemo(() => {
    return GRANULARITY_PRESETS[timeGranularity] || GRANULARITY_PRESETS[TIME_GRANULARITY.DAILY];
  }, [timeGranularity]);

  // --- Effect to Sync Inputs from Parent ---
  useEffect(() => {
    const startYYYYMMDD = formatToYYYYMMDD(initialStartDate);
    const endYYYYMMDD = formatToYYYYMMDD(initialEndDate);
    if (startYYYYMMDD) setInputStartDate(startYYYYMMDD);
    if (endYYYYMMDD) setInputEndDate(endYYYYMMDD);
  }, [initialStartDate, initialEndDate]);

  // --- Effect to Sync Dropdown from Dates ---
  useEffect(() => {
    if (!initialStartDate || !initialEndDate || !minDate || !maxDate) {
      setRelativeRange('');
      return;
    }

    const start = parseDate(initialStartDate);
    const end = parseDate(initialEndDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let matchedRange = '';

    for (const preset of presetOptions) {
      if (preset.value === '') continue;

      const calculated = calculateDateRange(preset.value, minDate, maxDate);
      if (!calculated || !calculated.startDate || !calculated.endDate) continue;

      if (isSameDay(start, calculated.startDate) && isSameDay(end, calculated.endDate)) {
        matchedRange = preset.value;
        break;
      }
    }

    setRelativeRange(matchedRange);
  }, [initialStartDate, initialEndDate, minDate, maxDate, presetOptions]);

  const handleRelativeRangeChange = useCallback(
    (value) => {
      setRelativeRange(value);
      setError('');

      if (!value) return;

      const range = calculateDateRange(value, minDate, maxDate);

      if (range && range.startDate && range.endDate) {
        setInputStartDate(formatToYYYYMMDD(range.startDate));
        setInputEndDate(formatToYYYYMMDD(range.endDate));
        onFilterChange({
          startDate: formatCustomDate(range.startDate),
          endDate: formatCustomDate(range.endDate),
        });
      } else {
        console.warn('Could not calculate range for preset:', value);
        setInputStartDate('');
        setInputEndDate('');
        onFilterChange({ startDate: null, endDate: null });
      }
    },
    [minDate, maxDate, onFilterChange],
  );

  const validateDates = useCallback(
    (startStr, endStr) => {
      const start = startStr ? new Date(startStr + 'T00:00:00') : null;
      const end = endStr ? new Date(endStr + 'T00:00:00') : null;

      if (!start || !end) {
        setError('Invalid date format. Please use DD-MM-YYYY.');
        return false;
      }

      if (start > end) {
        setError('Start date cannot be after end date');
        return false;
      }

      if (minDate && start < minDate) {
        setError(`Start date cannot be before ${formatToYYYYMMDD(minDate)}`);
        return false;
      }

      if (maxDate && end > maxDate) {
        setError(`End date cannot be after ${formatToYYYYMMDD(maxDate)}`);
        return false;
      }

      setError('');
      return true;
    },
    [minDate, maxDate],
  );

  const handleDateInputChange = useCallback((e) => {
    const { name, value } = e.target;

    if (name === 'startDate') {
      setInputStartDate(value);
    } else {
      setInputEndDate(value);
    }
    setRelativeRange('');
    setError('');
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (validateDates(inputStartDate, inputEndDate)) {
        const startInputDate = parseDate(inputStartDate);
        const endInputDate = parseDate(inputEndDate);

        if (startInputDate && endInputDate) {
          onFilterChange({
            startDate: formatCustomDate(startInputDate),
            endDate: formatCustomDate(endInputDate),
          });
        } else {
          setError('Invalid date selected in calendar.');
        }
      }
    },
    [inputStartDate, inputEndDate, validateDates, onFilterChange],
  );

  const inputMinDate = useMemo(() => (minDate ? formatToYYYYMMDD(minDate) : ''), [minDate]);
  const inputMaxDate = useMemo(() => (maxDate ? formatToYYYYMMDD(maxDate) : ''), [maxDate]);

  return (
    <div className='date-filter' style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(e);
          onFilterChange({ relativeRange, startDate: inputStartDate, endDate: inputEndDate });
        }}
        className='futuristic-form'
        style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}
      >
        <select
          value={relativeRange}
          onChange={(e) => handleRelativeRangeChange(e.target.value)}
          className='range-select futuristic-select'
          style={{
            appearance: 'none',
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M7 10l5 5 5-5H7z' fill='%23FF0000' /></svg>\")",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 10px center',
            paddingRight: '30px',
          }}
        >
          {presetOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <input
          type='date'
          name='startDate'
          value={inputStartDate}
          onChange={handleDateInputChange}
          min={inputMinDate}
          max={inputEndDate || inputMaxDate}
          required
          disabled={!minDate || relativeRange !== ''}
          className='futuristic-input'
        />
        <input
          type='date'
          name='endDate'
          value={inputEndDate}
          onChange={handleDateInputChange}
          min={inputStartDate || inputMinDate}
          max={inputMaxDate}
          required
          disabled={!maxDate || relativeRange !== ''}
          className='futuristic-input'
        />
        <button type='submit' className='apply-button futuristic-button'>
          Apply Filter
        </button>
      </form>
      {error && <div className='error-message futuristic-error-message'>{error}</div>}
    </div>
  );
};

DateFilter.propTypes = {
  onFilterChange: PropTypes.func.isRequired,
  initialStartDate: PropTypes.string,
  initialEndDate: PropTypes.string,
  minDate: PropTypes.string,
  maxDate: PropTypes.string,
  timeGranularity: PropTypes.oneOf(Object.values(TIME_GRANULARITY)).isRequired,
};

export default React.memo(DateFilter);
