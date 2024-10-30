const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
// const fetch = require('node-fetch');

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

app.use(cors());
app.use(express.json());

const dataFilePath = path.join(__dirname, 'data', 'usageData.json');

app.get('/api/usageData', async (req, res) => {
  try {
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

app.get('/api/fetchWishnetData', async (req, res) => {
  try {
    // First API call
    await fetch(`${BASE_URL}/UsageDetailUI.do6?userNameFromParent=28%3AF8%3AC6%3A5B%3AE2%3AB0&itemIndex=0&Month=1&Group=All`, {
      headers: {
        ...HEADERS,
        "Referer": `${BASE_URL}/UsageDetail.jsp`,
      },
      method: "GET"
    });

    // Second API call
    await fetch(`${BASE_URL}/images/mqnsure.css`, {
      headers: {
        "Referer": `${BASE_URL}/UsageDetailUI.do6?userNameFromParent=28%3AF8%3AC6%3A5B%3AE2%3AB0&itemIndex=0&Month=1&Group=All`,
        "Referrer-Policy": "strict-origin-when-cross-origin"
      },
      method: "GET"
    });

    // Third API call
    await fetch(`${BASE_URL}/UsageDetailUI.do6?userNameFromParent=28%3AF8%3AC6%3A5B%3AE2%3AB0&itemIndex=0&Month=1&Group=All`, {
      headers: {
        ...HEADERS,
        "Referer": `${BASE_URL}/UsageDetailUI.do6?userNameFromParent=28%3AF8%3AC6%3A5B%3AE2%3AB0&itemIndex=0&Month=1&Group=All`,
      },
      method: "GET"
    });

    // Fourth API call
    await fetch(`${BASE_URL}/images/mqnsure.css`, {
      headers: {
        "Referer": `${BASE_URL}/UsageDetailUI.do6?userNameFromParent=28%3AF8%3AC6%3A5B%3AE2%3AB0&itemIndex=0&Month=1&Group=All`,
        "Referrer-Policy": "strict-origin-when-cross-origin"
      },
      method: "GET"
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error fetching Wishnet data:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to fetch Wishnet data',
      details: error.toString()
    });
  }
});

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
