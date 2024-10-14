import React, { useState, useEffect } from 'react';
import '../styles/HtmlDataExtractor.css';

const API_URL = 'http://localhost:8080/api/usageData';

const HtmlDataExtractor = () => {
  const [extractedData, setExtractedData] = useState([]);
  const [htmlContent, setHtmlContent] = useState('');
  const [existingData, setExistingData] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);

  useEffect(() => {
    fetchExistingData();
  }, []);

  const fetchExistingData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setExistingData(data);
    } catch (error) {
      console.error('Error loading existing data:', error);
      setMessage('Error loading existing data. Please try again.');
      setShowSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHtmlInput = (event) => {
    setHtmlContent(event.target.value);
  };

  const extractAndSaveData = async () => {
    setIsLoading(true);
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    const rows = doc.querySelectorAll('table tr');
    const newData = [];

    rows.forEach((row, index) => {
      if (index === 0) return; // Skip header row
      const cells = row.querySelectorAll('td');
      if (cells.length >= 5) {
        const loginTime = cells[1].textContent.trim();
        const sessionTime = cells[2].textContent.trim();
        const download = parseFloat(cells[3].textContent.trim());
        const upload = parseFloat(cells[4].textContent.trim());
        
        if (!isNaN(download) && !isNaN(upload)) {
          newData.push({ loginTime, sessionTime, download, upload });
        }
      }
    });

    // Merge new data with existing data and remove duplicates
    const mergedData = [...existingData, ...newData];
    const uniqueData = Array.from(new Set(mergedData.map(JSON.stringify))).map(JSON.parse);
    
    // Sort data by login time
    uniqueData.sort((a, b) => new Date(a.loginTime) - new Date(b.loginTime));

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(uniqueData),
      });
      if (response.ok) {
        setExtractedData(uniqueData);
        setMessage('Data extracted and saved successfully!');
        setShowSnackbar(true);
        fetchExistingData(); // Refresh the existing data
      } else {
        throw new Error('Failed to save data');
      }
    } catch (error) {
      console.error('Error saving data:', error);
      setMessage('Error saving data. Please try again.');
      setShowSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h1 className="title">HTML Data Extractor</h1>
      <div className="card">
        <textarea
          className="textarea"
          value={htmlContent}
          onChange={handleHtmlInput}
          placeholder="Paste your HTML content here"
          rows="6"
        />
        <button 
          className={`button ${isLoading ? 'loading' : ''}`}
          onClick={extractAndSaveData}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="spinner"></div>
          ) : (
            <>
              <span className="button-icon">&#x2601;</span>
              Extract and Save Data
            </>
          )}
        </button>
      </div>
      {/* {extractedData.length > 0 && (
        <div className="card">
          <h2 className="subtitle">Extracted Data:</h2>
          <pre className="extracted-data">
            {JSON.stringify(extractedData, null, 2)}
          </pre>
        </div>
      )} */}
      {showSnackbar && (
        <div className="snackbar">
          {message}
          <button className="snackbar-close" onClick={() => setShowSnackbar(false)}>
            &times;
          </button>
        </div>
      )}
    </div>
  );
};

export default HtmlDataExtractor;
