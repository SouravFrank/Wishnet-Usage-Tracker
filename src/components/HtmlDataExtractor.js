import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8080/api/usageData';

const HtmlDataExtractor = () => {
  const [extractedData, setExtractedData] = useState([]);
  const [htmlContent, setHtmlContent] = useState('');
  const [existingData, setExistingData] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchExistingData();
  }, []);

  const fetchExistingData = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setExistingData(data);
    } catch (error) {
      console.error('Error loading existing data:', error);
      setMessage('Error loading existing data. Please try again.');
    }
  };

  const handleHtmlInput = (event) => {
    setHtmlContent(event.target.value);
  };

  const extractAndSaveData = async () => {
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
        fetchExistingData(); // Refresh the existing data
      } else {
        throw new Error('Failed to save data');
      }
    } catch (error) {
      console.error('Error saving data:', error);
      setMessage('Error saving data. Please try again.');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">HTML Data Extractor</h1>
      <textarea
        value={htmlContent}
        onChange={handleHtmlInput}
        className="w-full h-48 mb-4 p-2 border rounded"
        placeholder="Paste your HTML content here"
      />
      <button 
        onClick={extractAndSaveData}
        className="mb-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Extract and Save Data
      </button>
      {message && (
        <p className="mb-4 text-blue-600">{message}</p>
      )}
      {extractedData.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Extracted Data:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(extractedData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default HtmlDataExtractor;
