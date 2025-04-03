import React from 'react';
import PropTypes from 'prop-types';
import BaseChart from './charts/BaseChart';

const ChartComponent = ({ data, timeGranularity = 'daily', dateFormat }) => {
    // Normalize data based on structure
    const normalizeData = (rawData) => {
        return rawData.map(item => {
            if (timeGranularity === 'session') {
                // Session data structure
                return {
                    timeKey: item.loginTime,
                    sessionTime: item.sessionTime,
                    download: item.download,
                    upload: item.upload
                };
            } else {
                // Daily/aggregated data structure
                return {
                    timeKey: item.date,
                    sessionTime: item.sessionTime,
                    missedSession: item.missedSession,
                    download: item.download,
                    upload: item.upload
                };
            }
        });
    };

    const normalizedData = normalizeData(data);
    const title = `Data Usage Chart (${timeGranularity.charAt(0).toUpperCase() + timeGranularity.slice(1)})`;
    
    return (
        <BaseChart 
            data={normalizedData}
            timeGranularity={timeGranularity}
            dateFormat={dateFormat}
            title={title}
        />
    );
};

ChartComponent.propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape({
        loginTime: PropTypes.string,
        date: PropTypes.string,
        sessionTime: PropTypes.string,
        missedSession: PropTypes.string,
        download: PropTypes.number.isRequired,
        upload: PropTypes.number.isRequired
    })).isRequired,
    timeGranularity: PropTypes.oneOf(['session', 'daily', 'weekly', 'monthly']),
    dateFormat: PropTypes.string
};

export default React.memo(ChartComponent);