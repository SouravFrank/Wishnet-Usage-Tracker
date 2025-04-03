import React from 'react';
import PropTypes from 'prop-types';
import { formatDataUsage, formatDate } from '../../utils/chartUtils';

const ChartTooltip = ({ active, payload, label, timeGranularity }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  return (
    <div
      className='custom-tooltip'
      style={{ background: '#fff', padding: '10px', border: '1px solid #ccc', fontSize: '11.5px' }}
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
