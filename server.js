const express = require('express');
const axios = require('axios');
const { promisify } = require('util');

const app = express();
const port = 3000;

app.get('/', (req, res) => {
    const date = new Date();
    const responseData = {
        nodeVersion: process.version,
        timeOfDay: date.toLocaleTimeString(),
        message: 'Welcome, If you are seeing this, it means the api is working',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        ipAddress: req.ip
    };
    res.json(responseData);
});

app.get('/google', async (req, res) => {
    try {
        await axios.get('https://www.google.com');
        res.json({ internet: 'OK', message: 'Google.com call successfull, which means there is internet connection ' });
    } catch (error) {
        res.status(500).json({ error: error.message, internet: 'NONE' });
    }
});

app.get('/env', (req, res) => {
    res.json({ environmentVariables: process.env });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
