// Helper to get start of week (assuming Sunday as start)
export const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday, 1 = Monday, ...
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
};

// Helper to get end of week (assuming Saturday as end)
export const getEndOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday, 1 = Monday, ...
  const diff = d.getDate() + (6 - day);
  return new Date(d.setDate(diff));
};

// Get the start of the year
export const getStartOfYear = (date) => {
  if (!date) return null;
  return new Date(date.getFullYear(), 0, 1);
};

// Get the end of the year
export const getEndOfYear = (date) => {
  if (!date) return null;
  return new Date(date.getFullYear(), 11, 31);
};

// Get the start of N months ago
export const getStartOfNMonthsAgo = (date, monthsAgo) => {
  if (!date) return null;
  // Handles year rollovers correctly
  const targetMonth = date.getMonth() - monthsAgo;
  return new Date(date.getFullYear(), targetMonth, 1);
};

// Get the start of month
export const getStartOfMonth = (date) => {
  if (!date) return null;
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

// Get the end of month
export const getEndOfMonth = (date) => {
  if (!date) return null;
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

export const calculateDateRange = (preset, minDate, maxDate) => {
  let startDate = null;
  let endDate = null;
  const today = new Date();
  
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
    case 'yesterday': {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      startDate = new Date(yesterday);
      endDate = new Date(yesterday);
      break;
    }
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
      startDate = getStartOfWeek(potentialEndDate); 
      endDate = new Date(potentialEndDate);
      break;
    case 'lastWeek': {
      const startOfThisWeek = getStartOfWeek(potentialEndDate);
      endDate = new Date(startOfThisWeek);
      endDate.setDate(startOfThisWeek.getDate() - 1);
      startDate = getStartOfWeek(endDate);
      break;
    }
    case 'thisMonth':
      startDate = getStartOfMonth(potentialEndDate);
      endDate = new Date(potentialEndDate);
      break;
    case 'lastMonth':
      const startOfThisMonthForLast = getStartOfMonth(potentialEndDate);
      endDate = new Date(startOfThisMonthForLast);
      endDate.setDate(startOfThisMonthForLast.getDate() - 1);
      startDate = getStartOfMonth(endDate);
      break;
    case 'last3':
      endDate = getEndOfMonth(potentialEndDate);
      startDate = getStartOfNMonthsAgo(potentialEndDate, 2);
      break;
    case 'last6':
      endDate = getEndOfMonth(potentialEndDate);
      startDate = getStartOfNMonthsAgo(potentialEndDate, 5);
      break;
    case 'thisYear':
      startDate = getStartOfYear(potentialEndDate);
      endDate = new Date(potentialEndDate);
      break;
    case 'lastYear': {
      const lastYearDate = new Date(potentialEndDate);
      lastYearDate.setFullYear(potentialEndDate.getFullYear() - 1);
      startDate = getStartOfYear(lastYearDate);
      endDate = getEndOfYear(lastYearDate);
      break;
    }
    case 'last12': {
      endDate = getEndOfMonth(potentialEndDate);
      startDate = getStartOfNMonthsAgo(potentialEndDate, 11);
      break;
    }
    default:
      console.warn('Unhandled preset value in calculateDateRange:', preset);
      return null;
  }

  // Clamp calculated dates by min/max
  if (startDate && minDate && startDate < minDate) startDate = new Date(minDate);
  if (endDate && maxDate && endDate > maxDate) endDate = new Date(maxDate);
  
  // After clamping, ensure start is not after end
  if (startDate && endDate && startDate > endDate) {
    startDate = new Date(endDate);
  }

  return { startDate, endDate };
}; 