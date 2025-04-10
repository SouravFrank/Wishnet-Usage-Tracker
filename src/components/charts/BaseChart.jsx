import React from 'react';
import PropTypes from 'prop-types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ChartTooltip from './ChartTooltip';
import { formatDate } from '../../utils/chartUtils';
import '../../styles/DataUsageChart.css';

const BaseChart = ({ data, timeGranularity, dateFormat, title }) => {
    return (
        <div className="chart-container fancy-chart">
            <h2 className="chart-title">{title}</h2>
            <ResponsiveContainer width="100%" height={350}>
                <LineChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 2" />
                    <XAxis
                        dataKey="timeKey"
                        tickFormatter={(value) => formatDate(value, dateFormat, timeGranularity)}
                        tick={{ angle: timeGranularity === 'session' ? -45 : 0, textAnchor: 'end', fontSize: 14 }}
                        style={{ fontFamily: 'Roboto, sans-serif' }}
                        height={60}
                    />
                    <YAxis
                        label={{ value: 'Data Usage (GB)', angle: -90, position: 'insideLeft', fontSize: 15 }}
                        domain={[0, 'dataMax + 1000']}
                        tickFormatter={(value) => (value / 1000).toFixed(1)}
                        interval={0}
                        tick={{ fontSize: 14 }}
                        style={{ fontFamily: 'Roboto, sans-serif' }}
                    />
                    <Tooltip content={(props) => <ChartTooltip {...props} timeGranularity={timeGranularity} />} />
                    <Legend />
                    <Line type="monotone" dataKey="download" stroke="#800303" name="Download" strokeWidth={2} />
                    <Line type="monotone" dataKey="upload" stroke="#ff6767" name="Upload" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

BaseChart.propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape({
        timeKey: PropTypes.string.isRequired,
        download: PropTypes.number.isRequired,
        upload: PropTypes.number.isRequired,
        sessionTime: PropTypes.string
    })).isRequired,
    timeGranularity: PropTypes.oneOf(['session', 'daily', 'monthly', 'weekly']).isRequired,
    dateFormat: PropTypes.string,
    title: PropTypes.string.isRequired
};

export default React.memo(BaseChart);
