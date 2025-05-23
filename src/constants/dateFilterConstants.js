// Time granularity types
export const TIME_GRANULARITY = {
  SESSION: 'session',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly'
};

// Default values for each granularity
export const DEFAULT_PRESETS = {
  [TIME_GRANULARITY.SESSION]: 'last72',    // Last 72 hours for session data
  [TIME_GRANULARITY.DAILY]: 'last7',       // Last 7 days for daily data
  [TIME_GRANULARITY.WEEKLY]: 'last4',      // Last 4 weeks for weekly data
  [TIME_GRANULARITY.MONTHLY]: 'last3'      // Last 3 months for monthly data
};

// Preset options for session granularity (focused on recent data)
export const sessionPresets = [
  { value: '', label: 'Custom' },
  { value: 'last72', label: 'Last 72 Hours' },
  { value: 'last7', label: 'Last 7 Days' },
  { value: 'last14', label: 'Last 14 Days' },
  { value: 'last30', label: 'Last 30 Days' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'all', label: 'All Time' },
];

// Preset options for daily granularity (standard daily views)
export const dailyPresets = [
  { value: '', label: 'Custom' },
  { value: 'last7', label: 'Last 7 Days' },
  { value: 'last14', label: 'Last 14 Days' },
  { value: 'last30', label: 'Last 30 Days' },
  { value: 'last90', label: 'Last 90 Days' },
  { value: 'last180', label: 'Last 180 Days' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'last3', label: 'Last 3 Months' },
  { value: 'last6', label: 'Last 6 Months' },
  { value: 'thisYear', label: 'This Year' },
  { value: 'all', label: 'All Time' },
];

// Preset options for weekly granularity (focused on week-based views)
export const weeklyPresets = [
  { value: '', label: 'Custom' },
  { value: 'last4', label: 'Last 4 Weeks' },
  { value: 'last8', label: 'Last 8 Weeks' },
  { value: 'last12', label: 'Last 12 Weeks' },
  { value: 'last26', label: 'Last 26 Weeks' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'last3', label: 'Last 3 Months' },
  { value: 'last6', label: 'Last 6 Months' },
  { value: 'thisYear', label: 'This Year' },
  { value: 'lastYear', label: 'Last Year' },
  { value: 'all', label: 'All Time' },
];

// Preset options for monthly granularity (focused on month-based views)
export const monthlyPresets = [
  { value: '', label: 'Custom' },
  { value: 'last3', label: 'Last 3 Months' },
  { value: 'last6', label: 'Last 6 Months' },
  { value: 'last12', label: 'Last 12 Months' },
  { value: 'last24', label: 'Last 24 Months' },
  { value: 'thisYear', label: 'This Year' },
  { value: 'lastYear', label: 'Last Year' },
  { value: 'yearToDate', label: 'Year to Date' },
  { value: 'last2Years', label: 'Last 2 Years' },
  { value: 'last3Years', label: 'Last 3 Years' },
  { value: 'last5Years', label: 'Last 5 Years' },
  { value: 'all', label: 'All Time' },
];

// Mapping of granularity to preset options
export const GRANULARITY_PRESETS = {
  [TIME_GRANULARITY.SESSION]: sessionPresets,
  [TIME_GRANULARITY.DAILY]: dailyPresets,
  [TIME_GRANULARITY.WEEKLY]: weeklyPresets,
  [TIME_GRANULARITY.MONTHLY]: monthlyPresets,
}; 