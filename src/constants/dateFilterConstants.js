// Time granularity types
export const TIME_GRANULARITY = {
  SESSION: 'session',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly'
};

// Default values for each granularity
export const DEFAULT_PRESETS = {
  [TIME_GRANULARITY.SESSION]: 'last7', // Last 7 days for session data
  [TIME_GRANULARITY.DAILY]: 'today',   // Today for daily data
  [TIME_GRANULARITY.WEEKLY]: 'thisWeek', // This week for weekly data
  [TIME_GRANULARITY.MONTHLY]: 'thisMonth' // This month for monthly data
};

// Preset options for session granularity (more focused on recent data)
export const sessionPresets = [
  { value: '', label: 'Custom' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7', label: 'Last 7 Days' },
  { value: 'last24', label: 'Last 24 Hours' },
  { value: 'last48', label: 'Last 48 Hours' },
  { value: 'thisWeek', label: 'This Week' },
  { value: 'lastWeek', label: 'Last Week' },
  { value: 'last30', label: 'Last 30 Days' },
  { value: 'all', label: 'All Time' },
];

// Preset options for daily granularity (standard daily views)
export const dailyPresets = [
  { value: '', label: 'Custom' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7', label: 'Last 7 Days' },
  { value: 'thisWeek', label: 'This Week' },
  { value: 'lastWeek', label: 'Last Week' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'last30', label: 'Last 30 Days' },
  { value: 'all', label: 'All Time' },
];

// Preset options for weekly granularity (focused on week-based views)
export const weeklyPresets = [
  { value: '', label: 'Custom' },
  { value: 'thisWeek', label: 'This Week' },
  { value: 'lastWeek', label: 'Last Week' },
  { value: 'last4', label: 'Last 4 Weeks' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'last12', label: 'Last 12 Weeks' },
  { value: 'thisYear', label: 'This Year' },
  { value: 'lastYear', label: 'Last Year' },
  { value: 'all', label: 'All Time' },
];

// Preset options for monthly granularity (focused on month-based views)
export const monthlyPresets = [
  { value: '', label: 'Custom' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'last3', label: 'Last 3 Months' },
  { value: 'last6', label: 'Last 6 Months' },
  { value: 'thisYear', label: 'This Year' },
  { value: 'lastYear', label: 'Last Year' },
  { value: 'last12', label: 'Last 12 Months' },
  { value: 'yearToDate', label: 'Year to Date' },
  { value: 'all', label: 'All Time' },
];

// Mapping of granularity to preset options
export const GRANULARITY_PRESETS = {
  [TIME_GRANULARITY.SESSION]: sessionPresets,
  [TIME_GRANULARITY.DAILY]: dailyPresets,
  [TIME_GRANULARITY.WEEKLY]: weeklyPresets,
  [TIME_GRANULARITY.MONTHLY]: monthlyPresets,
}; 