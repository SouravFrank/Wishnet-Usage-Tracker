import { parseDate, formatToYYYYMMDD } from './datahelper';

// Format data usage (MB to GB conversion)
export const formatDataUsage = (value) => {
    if (value >= 1000) {
        return `${(value / 1000).toFixed(1)} GB (${value.toFixed(1)} MB)`;
    }
    return `${value.toFixed(1)} MB`;
};

// Parse date from DD-MM-YYYY HH:mm:ss format
export const parseCustomDate = (dateStr) => {
    if (!dateStr) return null;
    
    try {
        // Handle both formats: "DD-MM-YYYY HH:mm:ss" and "DD-MM-YYYY"
        const [datePart, timePart = '00:00:00'] = dateStr.split(' ');
        const [day, month, year] = datePart.split('-');
        const [hours, minutes, seconds] = timePart.split(':');
        
        return new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
            parseInt(hours || 0),
            parseInt(minutes || 0),
            parseInt(seconds || 0)
        );
    } catch (error) {
        console.error("Error parsing date:", error);
        return null;
    }
};

// Format date based on format string and granularity
export const formatDate = (dateStr, format = "DD/MM", timeGranularity = 'daily') => {
    if (!dateStr) return '';
    
    try {
        // Attempt to parse the date. datahelper's parseDate handles multiple formats.
        // We need the Date object to format it according to granularity.
        const date = parseDate(dateStr);
        if (!date || isNaN(date.getTime())) return dateStr; // Return original string if parsing fails
        
        // Granularity-specific formatting
        if (timeGranularity === 'session') {
            // Format: DD/MM HH:mm
            return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        } else if (timeGranularity === 'monthly') {
            // Format: YYYY-MM
            return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        }
        
        // Fallback to format parameter for other cases (e.g., daily)
        switch (format) {
            case "DD/MM":
                return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            case "MM/DD":
                return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
            case "DD/MM/YY":
                return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
            default:
                // If format is unrecognized, maybe return ISO date part?
                return formatToYYYYMMDD(date); // Use the helper for YYYY-MM-DD
        }
    } catch (error) {
        console.error("Error formatting date:", error);
        return dateStr; // Return original string on error
    }
};
