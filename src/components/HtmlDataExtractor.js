import React, { useState } from 'react';
import { saveAs } from 'file-saver';

const HtmlDataExtractor = () => {
  const [extractedData, setExtractedData] = useState([]);
  const [htmlContent, setHtmlContent] = useState('');

  const handleHtmlInput = (event) => {
    setHtmlContent(event.target.value);
  };

  const extractData = () => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    const rows = doc.querySelectorAll('table tr');
    const data = [];

    rows.forEach((row) => {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 5) {
        const date = cells[1].textContent.trim().split(' ')[0];
        const download = parseFloat(cells[3].textContent.trim());
        const upload = parseFloat(cells[4].textContent.trim());
        
        if (!isNaN(download) && !isNaN(upload)) {
          data.push({ date, download, upload });
        }
      }
    });

    setExtractedData(data);
  };

  const saveJsonFile = () => {
    const jsonData = JSON.stringify(extractedData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    saveAs(blob, 'extracted_data.json');
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
        onClick={extractData}
        className="mb-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Extract Data
      </button>
      {extractedData.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Extracted Data:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(extractedData, null, 2)}
          </pre>
          <button 
            onClick={saveJsonFile}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Save as JSON
          </button>
        </div>
      )}
    </div>
  );
};

export default HtmlDataExtractor;
