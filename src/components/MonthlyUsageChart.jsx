import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { parseDate } from '../utils/datahelper';

const MonthlyUsageChart = ({ data }) => {
  const monthlyData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Group data by month
    const monthlyUsage = data.reduce((acc, item) => {
      const date = parseDate(item.loginTime);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      if (!acc[monthYear]) {
        acc[monthYear] = {
          month: monthYear,
          totalUsage: 0,
          displayMonth: `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`
        };
      }
      
      // Add data usage (assuming it's in MB)
      acc[monthYear].totalUsage += parseFloat(item.dataUsed || 0);
      
      return acc;
    }, {});
    
    // Convert to array and sort by date
    return Object.values(monthlyUsage).sort((a, b) => {
      const [aMonth, aYear] = a.month.split('/');
      const [bMonth, bYear] = b.month.split('/');
      return new Date(aYear, aMonth - 1) - new Date(bYear, bMonth - 1);
    });
  }, [data]);

  return (
    <div className="chart-container">
      <h2>Monthly Data Usage</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={monthlyData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="displayMonth" />
          <YAxis 
            label={{ value: 'Data Usage (MB)', angle: -90, position: 'insideLeft' }} 
          />
          <Tooltip formatter={(value) => [`${value.toFixed(2)} MB`, 'Data Usage']} />
          <Legend />
          <Bar dataKey="totalUsage" name="Data Usage (MB)" fill="#800303" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyUsageChart;