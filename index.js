require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch').default;
const app = express();

const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());
app.use(express.json());

// Add Content Security Policy (CSP) headers
app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; connect-src 'self' https://api.dub.co; font-src 'self' data:; style-src 'self' 'unsafe-inline';"
    );
    next();
});

// Root route for verification and basic information
app.get('/', (req, res) => {
    res.send('Welcome to the Dub.co Proxy Server! Use POST "/" to create short links and GET "/stats/:key" to fetch stats.');
});

// POST route for creating short links
app.post('/', async (req, res) => {
    console.log('Received request:', req.body);

    const { url, domain } = req.body;
    if (!url || !domain) {
        return res.status(400).send({ error: 'URL and domain are required' });
    }

    try {
        const response = await fetch('https://api.dub.co/links', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.DUB_CO_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url, domain }),
        });

        if (!response.ok) {
            const errorDetails = await response.text();
            console.error('Dub.co API error:', errorDetails);
            return res.status(response.status).send({ error: errorDetails });
        }

        const data = await response.json();
        console.log('Dub.co API response:', data);
        res.json(data);
    } catch (error) {
        console.error('Proxy error:', error.message);
        res.status(500).send({ error: error.message });
    }
});

// GET route for fetching stats of a short link
app.get('/stats/:key', async (req, res) => {
    const { key } = req.params;

    if (!key) {
        return res.status(400).send({ error: 'Key is required to fetch stats.' });
    }

    try {
        const response = await fetch(`https://api.dub.co/links/${key}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.DUB_CO_API_KEY}`,
            },
        });

        if (!response.ok) {
            const errorDetails = await response.text();
            console.error(`Failed to fetch stats for key ${key}:`, errorDetails);
            return res.status(response.status).send({ error: errorDetails });
        }

        const data = await response.json();
        console.log(`Stats for key ${key}:`, data);
        res.json(data);
    } catch (error) {
        console.error('Stats fetch error:', error.message);
        res.status(500).send({ error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Proxy server is running on port ${PORT}`);
});
