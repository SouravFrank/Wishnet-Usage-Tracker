// Parse custom date format (DD-MM-YYYY HH:mm:ss)
export const parseCustomDate = (dateString) => {
    if (!dateString) return null;
    
    try {
        // Handle custom format (DD-MM-YYYY HH:mm:ss)
        if (dateString.includes('-')) {
            const [date, time] = dateString.split(' ');
            if (!date) return null;
            
            const [day, month, year] = date.split('-');
            const timeComponents = time ? time.split(':').map(Number) : [0, 0, 0];
            
            return new Date(
                parseInt(year),
                parseInt(month) - 1,
                parseInt(day),
                ...timeComponents
            );
        }
        
        // Handle ISO format
        return new Date(dateString);
    } catch (error) {
        console.error("Error parsing date:", error);
        return null;
    }
};

// Parse date string to handle both ISO and custom formats
export const parseDate = (dateString) => {
    if (!dateString) return null;
    
    const date = parseCustomDate(dateString);
    if (!date || isNaN(date.getTime())) {
        console.error("Invalid date format:", dateString);
        return null;
    }
    
    return date;
};

// Format date to custom format (DD-MM-YYYY HH:mm:ss)
export const formatCustomDate = (date) => {
    if (!date || isNaN(date.getTime())) return '';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};

// Parse login time string to Date object
function parseLoginTime(loginTime) {
    return parseCustomDate(loginTime);
}

// Convert session time (HH:MM:SS) to milliseconds
function parseSessionTime(sessionTime) {
    const [hours, minutes, seconds] = sessionTime.split(':').map(Number);
    return (hours * 3600 + minutes * 60 + seconds) * 1000;
}

// Get date string in DD-MM-YYYY format
function getDateString(date) {
    if (!date || isNaN(date.getTime())) return '';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

// Format time in HH:MM:SS
function formatTime(date) {
    if (!date || isNaN(date.getTime())) return '';
    
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

// Merge overlapping time ranges or ranges with gap < 60 seconds
function mergeTimeRanges(ranges) {
    if (!ranges.length) return [];
    ranges.sort((a, b) => a[0] - b[0]);
    const merged = [ranges[0]];
    for (let i = 1; i < ranges.length; i++) {
        const last = merged[merged.length - 1];
        const current = ranges[i];
        if (current[0] < last[1] + 60000) {
            last[1] = Math.max(last[1], current[1]);
        } else {
            merged.push(current);
        }
    }
    return merged;
}

// Get missed session times as human-readable durations, ignoring gaps < 60 seconds
function getMissedSessions(dayStart, dayEnd, sessionRanges) {
    const missed = [];
    let lastEnd = dayStart;
    sessionRanges.forEach(range => {
        const gapDuration = range[0] - lastEnd;
        if (gapDuration >= 60000) { // 60,000 ms = 60 seconds
            missed.push(gapDuration);
        }
        lastEnd = Math.max(lastEnd, range[1]);
    });
    const finalGap = dayEnd - lastEnd;
    if (finalGap >= 60000) {
        missed.push(finalGap);
    }

    // Convert milliseconds to human-readable duration
    return missed.map(duration => {
        const totalMinutes = Math.floor(duration / 60000); // Convert ms to minutes
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        let durationStr = '';
        if (hours > 0) {
            durationStr += `${hours} hour${hours > 1 ? 's' : ''}`;
        }
        if (minutes > 0) {
            if (durationStr) durationStr += ' ';
            durationStr += `${minutes} minute${minutes > 1 ? 's' : ''}`;
        }
        return durationStr || '0 minutes'; // Fallback, though unlikely with >= 60s filter
    });
}

// Main function to calculate daily data usage
export function calculateDailyData(sessions) {
    const dailyData = {};

    sessions.forEach(session => {
        const startTime = parseLoginTime(session.loginTime);
        const duration = parseSessionTime(session.sessionTime);
        const endTime = new Date(startTime.getTime() + duration);

        // Use UTC for day calculations
        let currentDate = new Date(Date.UTC(
            startTime.getUTCFullYear(),
            startTime.getUTCMonth(),
            startTime.getUTCDate()
        ));
        const endDateStr = getDateString(endTime);

        // Iterate over all days the session covers
        while (true) {
            const dateStr = getDateString(currentDate);
            if (dateStr > endDateStr) break;

            const dayStart = currentDate.getTime();
            const dayEnd = dayStart + 86400000 - 1; // End of day: 23:59:59.999

            // Calculate overlap with this day
            const overlapStart = Math.max(startTime.getTime(), dayStart);
            const overlapEnd = Math.min(endTime.getTime(), dayEnd);

            if (overlapStart < overlapEnd) {
                const durationOnDay = overlapEnd - overlapStart;
                const proportion = durationOnDay / duration;
                const allocDownload = session.download * proportion;
                const allocUpload = session.upload * proportion;

                // Initialize day entry if it doesn't exist
                if (!dailyData[dateStr]) {
                    dailyData[dateStr] = {
                        sessionRanges: [],
                        download: 0,
                        upload: 0
                    };
                }

                // Accumulate data
                dailyData[dateStr].download += allocDownload;
                dailyData[dateStr].upload += allocUpload;

                // Add session time range for this day
                dailyData[dateStr].sessionRanges.push([overlapStart, overlapEnd]);
            }

            // Move to the next day
            currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        }
    });

    // Convert to the requested format
    const result = Object.entries(dailyData).map(([date, data]) => {
        const dayStart = parseLoginTime(`${date} 00:00:00`).getTime();
        const dayEnd = dayStart + 86400000 - 1;

        // Merge session ranges
        const mergedSessions = mergeTimeRanges(data.sessionRanges);

        // Format session times
        const sessionTime = mergedSessions.map(range => {
            const start = new Date(range[0]);
            const end = new Date(range[1]);
            return `${formatTime(start)} - ${formatTime(end)}`;
        }).join(', ');

        // Get missed session durations
        const missedSessions = getMissedSessions(dayStart, dayEnd, mergedSessions);
        const missedSession = missedSessions.length > 0 ? missedSessions.join(', ') : "No missed sessions";

        return {
            date,
            sessionTime: sessionTime || "No sessions",
            missedSession,
            download: Number(data.download.toFixed(3)),
            upload: Number(data.upload.toFixed(3))
        };
    });

    // Sort by date correctly (converting DD-MM-YYYY to comparable format)
    result.sort((a, b) => {
        const [dayA, monthA, yearA] = a.date.split('-').map(Number);
        const [dayB, monthB, yearB] = b.date.split('-').map(Number);
        const dateA = new Date(yearA, monthA - 1, dayA);
        const dateB = new Date(yearB, monthB - 1, dayB);
        return dateA - dateB;
    });

    return result;
}