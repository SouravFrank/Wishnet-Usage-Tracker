export const parseDate = (dateString) => {
    const [date, time] = dateString.split(' ');
    const [day, month, year] = date.split('-');
    return new Date(year, month - 1, day, ...time.split(':'));
};

// Parse login time string to Date object
function parseLoginTime(loginTime) {
    const [datePart, timePart] = loginTime.split(' ');
    const [day, month, year] = datePart.split('-').map(Number);
    const [hour, minute, second] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, hour, minute, second);
}

// Convert session time (HH:MM:SS) to milliseconds
function parseSessionTime(sessionTime) {
    const [hours, minutes, seconds] = sessionTime.split(':').map(Number);
    return (hours * 3600 + minutes * 60 + seconds) * 1000;
}

// Get date string in DD-MM-YYYY format
function getDateString(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

// Format time in HH:MM:SS
function formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

// Merge overlapping time ranges
function mergeTimeRanges(ranges) {
    if (!ranges.length) return [];
    ranges.sort((a, b) => a[0] - b[0]);
    const merged = [ranges[0]];
    for (let i = 1; i < ranges.length; i++) {
        const last = merged[merged.length - 1];
        const current = ranges[i];
        if (last[1] >= current[0]) {
            last[1] = Math.max(last[1], current[1]);
        } else {
            merged.push(current);
        }
    }
    return merged;
}

// Get missed session times
function getMissedSessions(dayStart, dayEnd, sessionRanges) {
    const missed = [];
    let lastEnd = dayStart;
    sessionRanges.forEach(range => {
        if (lastEnd < range[0]) {
            missed.push([lastEnd, range[0]]);
        }
        lastEnd = Math.max(lastEnd, range[1]);
    });
    if (lastEnd < dayEnd) {
        missed.push([lastEnd, dayEnd]);
    }
    return missed;
}

// Main function to calculate daily data usage with session and missed session times
export function calculateDailyData(sessions) {
    const dailyData = {};

    // Process each session
    sessions.forEach(session => {
        const startTime = parseLoginTime(session.loginTime);
        const duration = parseSessionTime(session.sessionTime);
        const endTime = new Date(startTime.getTime() + duration);

        // Start at the beginning of the session's first day
        let currentDate = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate(), 0, 0, 0);
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
            currentDate.setDate(currentDate.getDate() + 1);
        }
    });

    // Convert to the requested format
    const result = Object.entries(dailyData).map(([date, data]) => {
        const dayStart = new Date(date.split('-').reverse().join('-')).getTime();
        const dayEnd = dayStart + 86400000 - 1;

        // Merge session ranges
        const mergedSessions = mergeTimeRanges(data.sessionRanges);

        // Get missed session ranges
        const missedSessions = getMissedSessions(dayStart, dayEnd, mergedSessions);

        // Format session and missed session times
        const sessionTime = mergedSessions.map(range => {
            const start = new Date(range[0]);
            const end = new Date(range[1]);
            return `${formatTime(start)} - ${formatTime(end)}`;
        }).join(', ');

        const missedSession = missedSessions.map(range => {
            const start = new Date(range[0]);
            const end = new Date(range[1]);
            return `${formatTime(start)} - ${formatTime(end)}`;
        }).join(', ');

        return {
            date,
            sessionTime: sessionTime || "No sessions",
            missedSession: missedSession || "No missed sessions",
            download: data.download.toFixed(3),
            upload: data.upload.toFixed(3)
        };
    }).sort((a, b) => a.date.localeCompare(b.date));

    return result;
}
