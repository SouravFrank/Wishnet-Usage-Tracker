const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const { JSDOM } = require('jsdom');

const app = express();
const port = 8080;

// Define constants for the Wishnet API
const BASE_URL = 'http://192.168.182.201:9085/Kolkata/WISHN';
const HEADERS = {
  "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "accept-language": "en-IN,en-US;q=0.9,en-GB;q=0.8,en;q=0.7",
  "upgrade-insecure-requests": "1",
  "cookie": "JSESSIONID=78407236A605800351936E0D6E35F299",
  "Referrer-Policy": "strict-origin-when-cross-origin"
};

const dataFilePath = path.join(__dirname, 'data', 'usageData.json');

app.use(cors());
app.use(express.json());

app.get('/api/fetchWishnetData', async (req, res) => {
  try {
    // Third API call contains the actual data we need
    const response = await fetch(`${BASE_URL}/UsageDetailUI.do6?userNameFromParent=28%3AF8%3AC6%3A5B%3AE2%3AB0&itemIndex=0&Month=1&Group=All`, {
      headers: {
        ...HEADERS,
        "Referer": `${BASE_URL}/UsageDetailUI.do6?userNameFromParent=28%3AF8%3AC6%3A5B%3AE2%3AB0&itemIndex=0&Month=1&Group=All`,
      },
      method: "GET"
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const htmlContent = await response.text();

    // Parse the HTML content to extract usage data
    // This is similar to what HtmlDataExtractor does in the frontend
    const usageData = parseHtmlContent(htmlContent);

    if (!usageData || usageData.length === 0) {
      throw new Error('No usage data found in the response');
    }

    // Read existing data
    let existingData = [];
    try {
      const fileContent = await fs.readFile(dataFilePath, 'utf8');
      existingData = JSON.parse(fileContent);
    } catch (error) {
      console.log('No existing data file found, creating new one');
    }

    // Merge new data with existing data, removing duplicates
    const mergedData = mergeData(existingData, usageData);

    // Save the merged data
    await fs.writeFile(dataFilePath, JSON.stringify(mergedData, null, 2));

    res.json({ 
      success: true,
      message: 'Data successfully fetched and saved',
      newRecords: usageData.length
    });

  } catch (error) {
    console.error('Error fetching Wishnet data:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to fetch Wishnet data',
      details: error.toString()
    });
  }
});

function parseHtmlContent(html) {
  try {
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    
    const rows = doc.querySelectorAll('table tr');
    const usageData = [];

    rows.forEach((row, index) => {
      if (index === 0) return; // Skip header row
      const cells = row.querySelectorAll('td');
      if (cells.length >= 5) {
        const loginTime = cells[1].textContent.trim();
        const sessionTime = cells[2].textContent.trim();
        const download = parseFloat(cells[3].textContent.trim());
        const upload = parseFloat(cells[4].textContent.trim());
        
        if (!isNaN(download) && !isNaN(upload)) {
          usageData.push({ 
            loginTime, 
            sessionTime, 
            download, 
            upload 
          });
        }
      }
    });

    return usageData;
  } catch (error) {
    console.error('Error parsing HTML:', error);
    throw new Error('Failed to parse HTML content');
  }
}

function mergeData(existingData, newData) {
  // Create a map of existing data using loginTime as key
  const dataMap = new Map(existingData.map(item => [item.loginTime, item]));

  // Add new data, overwriting if same loginTime exists
  newData.forEach(item => {
    dataMap.set(item.loginTime, item);
  });

  // Convert map back to array and sort by loginTime (newest first)
  return Array.from(dataMap.values())
    .sort((a, b) => new Date(b.loginTime) - new Date(a.loginTime));
}

app.get('/api/usageData', async (req, res) => {
  try {
    await fetch('http://localhost:8080/api/fetchWishnetData')
    const data = await fs.readFile(dataFilePath, 'utf8');
    const jsonData = JSON.parse(data);
    const sortedData = jsonData.sort((a, b) => new Date(b.loginTime) - new Date(a.loginTime));
    res.json(sortedData);
  } catch (error) {
    console.error('Error reading data:', error);
    res.status(500).json({ error: 'Error reading data' });
  }
});

app.post('/api/usageData', async (req, res) => {
  try {
    const newData = req.body;
    await fs.writeFile(dataFilePath, JSON.stringify(newData, null, 2));
    res.json({ success: true });
  } catch (error) {
    console.error('Error writing data:', error);
    res.status(500).json({ error: 'Error writing data' });
  }
});

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
