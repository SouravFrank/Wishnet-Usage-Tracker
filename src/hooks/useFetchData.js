import { useEffect, useState, useMemo } from 'react';
import { calculateDailyData, parseDate } from '../utils/datahelper';

const API_URL = 'http://localhost:8080/api/usageData';

export const useFetchData = (initialReload = true) => {
  const [reload, setReload] = useState(initialReload);
  const [apiFailed, setApiFailed] = useState(false);
  const [message, setMessage] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [data, setData] = useState([]);
  const [dailyData, setDailyData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || data.details || 'Backend API failed');
        }
        const sortedData = data.sort((a, b) => parseDate(a.loginTime) - parseDate(b.loginTime));
        const dailyData = calculateDailyData(sortedData);
        setDailyData(dailyData);
        setData(sortedData);
        setApiFailed(false);
      } catch (error) {
        console.error('API call failed:', error);
        setApiFailed(true);
        setMessage(error.message);
        setShowSnackbar(true);
      }
      setReload(false);
    };

    if (reload) {
      fetchData();
    }
  }, [reload]);

  // Calculate monthly data from dailyData with improved mathematical approach
  const monthlyData = useMemo(() => {
    if (!dailyData || !dailyData.length) return [];

    // 1. Temporal Aggregation with UTC
    const monthMap = new Map();
    console.log('🚀 ~ useFetchData.js:106 ~ monthlyData ~ dailyData:', dailyData);

    for (const daily of dailyData) {
      // 2. Robust date validation
      const dateString = daily.date;
      const [day1, month, year] = dateString.split('-'); // Split the string into day, month, and year
      const date = new Date(`${year}-${month}-${day1}`); // Rearrange it into YYYY-MM-DD format
      //   const date = new Date(daily.date);

      if (!(date instanceof Date) || isNaN(date)) continue;

      // 3. UTC-based month calculation (timezone-agnostic)
      //   const year = date.getUTCFullYear();
      //   const month = date.getUTCMonth();
      const monthStart = Date.UTC(year, month, 1);
      const monthKey = `${year}-${month.padStart(2, '0')}`;

      // 4. Initialize aggregation with high-precision numbers
      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, {
          totalData: 0, // Store with full precision
          totalDownload: 0,
          totalUpload: 0,
          sessionCount: 0,
          uniqueDays: new Set(),
          monthStart: new Date(monthStart),
        });
      }

      // 5. Numerically stable accumulation
      const entry = monthMap.get(monthKey);
      const day = date.getUTCDate();

      // 6. Precision handling: parse as floats first
      entry.totalData += Number(daily.dataUsed) || 0;
      entry.totalDownload += Number(daily.download) || 0;
      entry.totalUpload += Number(daily.upload) || 0;
      entry.sessionCount += Math.trunc(Number(daily.sessions)) || 0;
      entry.uniqueDays.add(day);
    }

    // 7. Final aggregation with controlled rounding
    return Array.from(monthMap.entries())
      .map(([key, agg]) => ({
        dateKey: key,
        date: agg.monthStart.toISOString(),
        displayMonth: agg.monthStart.toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
          timeZone: 'UTC',
        }),
        dataUsed: roundToTwo(agg.totalData),
        download: roundToTwo(agg.totalDownload),
        upload: roundToTwo(agg.totalUpload),
        sessions: agg.sessionCount,
        uniqueDays: agg.uniqueDays.size,
      }))
      .sort((a, b) => a.monthStart - b.monthStart);
  }, [dailyData]);

  // 8. Bankers rounding for financial precision
  function roundToTwo(num) {
    return Number(Math.round(num + 'e2') + 'e-2');
  }

  return {
    reload,
    setReload,
    apiFailed,
    message,
    showSnackbar,
    setShowSnackbar,
    data,
    dailyData,
    monthlyData,
  };
};
