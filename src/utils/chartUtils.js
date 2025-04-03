// Format data usage (MB to GB conversion)
export const formatDataUsage = (value) => {
    if (value >= 1000) {
        return `${(value / 1000).toFixed(1)} GB (${value.toFixed(1)} MB)`;
    }
    return `${value.toFixed(1)} MB`;
};

// Format date based on format string
export const formatDate = (dateStr, format = "DD/MM") => {
    if (!dateStr) return '';
    
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        
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
