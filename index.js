const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Add CSP Headers
app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; connect-src 'self' https://api.dub.co; font-src 'self' data:; style-src 'self' 'unsafe-inline';"
    );
    next();
});

app.post('/', async (req, res) => {
    const { url, domain } = req.body;
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
            return res.status(response.status).send(errorDetails);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server is running on port ${PORT}`);
});
