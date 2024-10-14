const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const port = 8080;

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

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
