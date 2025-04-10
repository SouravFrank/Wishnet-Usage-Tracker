import React from 'react';
import PropTypes from 'prop-types';
import { formatDataUsage, formatDate } from '../../utils/chartUtils';
import '../../styles/ChartTooltip.css';

const ChartTooltip = ({ active, payload, label, timeGranularity }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  return (
    <div
      className='modern-tooltip'
      style={{ 
        background: '#fff', 
        padding: '10px', 
        border: '1px solid #ccc', 
        fontSize: '11.5px', 
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)', 
        transition: 'all 0.3s ease-in-out' 
      }}
    >
      <p>{`${timeGranularity === 'session' ? 'Login Time' : 'Date'}: ${formatDate(
        label,
        'DD/MM/YY',
        timeGranularity,
      )}`}</p>
      <p>{`Session: ${data.sessionTime}`}</p>
      {data.missedSession && <p>{`Missed: ${data.missedSession}`}</p>}
      <p>{`Download: ${formatDataUsage(data.download)}`}</p>
      <p>{`Upload: ${formatDataUsage(data.upload)}`}</p>
    </div>
  );
};

ChartTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  label: PropTypes.string,
  timeGranularity: PropTypes.string.isRequired,
};

export default React.memo(ChartTooltip);
