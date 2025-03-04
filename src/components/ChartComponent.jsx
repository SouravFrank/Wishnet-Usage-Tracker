import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles/DataUsageChart.css';

const ChartComponent = ({ data, timeGranularity = 'daily' }) => {
    // Utility function to normalize data based on structure
    const normalizeData = (rawData) => {
        return rawData.map(item => {
            if (item.loginTime) {
                // First data structure
                return {
                    timeKey: item.loginTime,
                    sessionTime: item.sessionTime,
                    download: item.download,
                    upload: item.upload
                };
            } else if (item.date) {
                // Second data structure
                return {
                    timeKey: item.date,
                    sessionTime: item.sessionTime,
                    missedSession: item.missedSession,
                    download: item.download,
                    upload: item.upload
                };
            }
            return item; // Fallback for future structures
        });
    };

    // Format data usage (MB to GB conversion)
    const formatDataUsage = (value) => {
        if (value >= 1000) {
            return `${(value / 1000).toFixed(1)} GB (${value.toFixed(1)} MB)`;
        }
        return `${value.toFixed(1)} MB`;
    };

    // Format time key based on granularity
    const formatTimeKey = (timeString) => {
        switch (timeGranularity) {
            case 'daily':
                {
                    const [day, month, year] = timeString.split(' ')[0].split('-');
                    return `${day} ${month} ${year}`;
                }
            case 'weekly':
                return `Week of ${timeString}`; // Placeholder for weekly format
            case 'monthly':
                {
                    const [_, month, year] = timeString.split('-');
                    return ` ${month} ${year}`;
                }
            default:
                return timeString;
        }
    };
    // Add this to your existing ChartComponent.jsx file
    // I'm assuming you have a ChartComponent that uses a charting library
    
    // Update the formatXAxis function or equivalent in your ChartComponent
    const formatXAxis = (dateStr, dateFormat) => {
      const date = new Date(dateStr);
      if (dateFormat === "DD/MM") {
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      }
      // Add other format options as needed
      return dateStr;
    };
    
    // Then in your render or chart configuration:
    // xAxis: {
    //   ...
    //   tickFormatter: (value) => formatXAxis(value, props.dateFormat || "default"),
    //   ...
    // }
    // Custom tooltip content
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="custom-tooltip" style={{ background: '#fff', padding: '10px', border: '1px solid #ccc', fontSize: '11.5px' }}>
                    <p>{`${timeGranularity === 'session' ? 'Login Time' : 'Date'}: ${formatTimeKey(label)}`}</p>
                    <p>{`Session: ${data.sessionTime}`}</p>
                    {data.missedSession && <p>{`Missed: ${data.missedSession}`}</p>}
                    <p>{`Download: ${formatDataUsage(data.download)}`}</p>
                    <p>{`Upload: ${formatDataUsage(data.upload)}`}</p>
                </div>
            );
        }
        return null;
    };
    const normalizedData = normalizeData(data);
    return (
        <div className="chart-container">
            <h2 className="chart-title">Data Usage Chart ({timeGranularity.charAt(0).toUpperCase() + timeGranularity.slice(1)})</h2>
            <ResponsiveContainer width="100%" height={350}>
                <LineChart data={normalizedData} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 2" />
                    <XAxis
                        dataKey="timeKey"
                        tickFormatter={formatTimeKey}
                        tick={{ angle: 0, textAnchor: 'middle', fontSize: 14 }}
                    />
                    <YAxis
                        label={{ value: 'Data Usage (GB)', angle: -90, position: 'insideLeft', fontSize: 15 }}
                        domain={[0, 'dataMax + 1000']}
                        tickFormatter={(value) => (value / 1000).toFixed(1)}
                        interval={0}
                        tick={{ fontSize: 14 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="download" stroke="#800303" name="Download" />
                    <Line type="monotone" dataKey="upload" stroke="#ff6767" name="Upload" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ChartComponent;