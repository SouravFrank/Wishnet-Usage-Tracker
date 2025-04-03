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
        const date = parseCustomDate(dateStr);
        if (!date) return dateStr;
        
        if (timeGranularity === 'session') {
            return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        }
        
        switch (format) {
            case "DD/MM":
                return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            case "MM/DD":
                return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
            case "DD/MM/YY":
                return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
            default:
                return dateStr;
        }
    } catch (error) {
        console.error("Error formatting date:", error);
        return dateStr;
    }
};
