// Time granularity types
export const TIME_GRANULARITY = {
  SESSION: 'session',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly'
};

// Preset options for different time granularities
export const dailySessionWeeklyPresets = [
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

export const monthlyPresets = [
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

// Mapping of granularity to preset options
export const GRANULARITY_PRESETS = {
  [TIME_GRANULARITY.SESSION]: dailySessionWeeklyPresets,
  [TIME_GRANULARITY.DAILY]: dailySessionWeeklyPresets,
  [TIME_GRANULARITY.WEEKLY]: dailySessionWeeklyPresets,
  [TIME_GRANULARITY.MONTHLY]: monthlyPresets,
}; 