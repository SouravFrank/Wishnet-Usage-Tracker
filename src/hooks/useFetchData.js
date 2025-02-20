import { useEffect, useState } from 'react';
import { calculateDailyData, parseDate } from '../utils/datahelper';

const API_URL = 'http://localhost:8080/api/usageData';

export const useFetchData = (initialReload = true) => {
    const [reload, setReload] = useState(initialReload);
    const [apiFailed, setApiFailed] = useState(false);
    const [message, setMessage] = useState('');
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(API_URL);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || data.details || 'Backend API failed');
                }
                const sortedData = data.sort((a, b) => parseDate(a.loginTime) - parseDate(b.loginTime));
                try {
                    console.log("🚀 ~ fetchData ~ sortedData:", calculateDailyData(sortedData))
                } catch (error) {
                    console.log("🚀 ~ fetchData ~ error:", error)
                }
                setData(sortedData);
                setApiFailed(false);
            } catch (error) {
                console.error("API call failed:", error);
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

    return { reload, setReload, apiFailed, message, showSnackbar, setShowSnackbar, data };
};