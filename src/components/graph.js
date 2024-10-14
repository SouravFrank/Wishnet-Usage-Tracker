import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { date: '14-10-2024', download: 1555.502, upload: 337.188 },
  { date: '14-10-2024', download: 6406.712, upload: 3465.203 },
  { date: '13-10-2024', download: 7682.87, upload: 775.058 },
  { date: '13-10-2024', download: 7155.647, upload: 1535.564 },
  { date: '12-10-2024', download: 7432.196, upload: 1532.811 },
  { date: '12-10-2024', download: 6992.512, upload: 790.374 },
  { date: '12-10-2024', download: 3126.663, upload: 501.732 },
  { date: '11-10-2024', download: 6905.485, upload: 1032.04 },
  { date: '11-10-2024', download: 5656.871, upload: 601.892 },
  { date: '10-10-2024', download: 7695.967, upload: 703.727 },
  { date: '10-10-2024', download: 7006.259, upload: 466.153 },
  { date: '10-10-2024', download: 2387.385, upload: 587.808 },
  { date: '09-10-2024', download: 5354.564, upload: 851.63 },
  { date: '09-10-2024', download: 211.111, upload: 30.027 },
  { date: '09-10-2024', download: 918.276, upload: 133.876 },
  { date: '09-10-2024', download: 1693.488, upload: 463.137 },
  { date: '08-10-2024', download: 4249.962, upload: 536.13 },
  { date: '08-10-2024', download: 1692.217, upload: 424.283 },
  { date: '07-10-2024', download: 5379.694, upload: 807.268 },
  { date: '07-10-2024', download: 5416.915, upload: 505.652 },
  { date: '06-10-2024', download: 6811.326, upload: 613.578 },
  { date: '06-10-2024', download: 2293.557, upload: 487.663 },
  { date: '06-10-2024', download: 1968.108, upload: 472.931 },
  { date: '05-10-2024', download: 2061.902, upload: 599.759 },
  { date: '05-10-2024', download: 46.711, upload: 16.368 },
  { date: '05-10-2024', download: 1841.043, upload: 574.31 },
  { date: '04-10-2024', download: 1946.162, upload: 515.972 },
  { date: '04-10-2024', download: 2198.428, upload: 565.147 },
  { date: '04-10-2024', download: 1080.264, upload: 201.789 },
  { date: '03-10-2024', download: 4312.289, upload: 539.145 },
  { date: '03-10-2024', download: 5452.559, upload: 733.088 },
  { date: '02-10-2024', download: 4546.971, upload: 567.341 },
  { date: '02-10-2024', download: 2122.364, upload: 484.614 },
  { date: '02-10-2024', download: 5526.275, upload: 758.82 },
  { date: '01-10-2024', download: 7569.225, upload: 831.912 },
  { date: '01-10-2024', download: 5327.697, upload: 688.541 },
];

const DataUsageGraph = () => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis label={{ value: 'Data Usage (MB)', angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="download" stroke="#8884d8" name="Download (MB)" />
        <Line type="monotone" dataKey="upload" stroke="#82ca9d" name="Upload (MB)" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default DataUsageGraph;