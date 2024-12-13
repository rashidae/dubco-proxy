require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post('/proxy', async (req, res) => {
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
            console.error(`Error from Dub.co: ${errorDetails}`);
            return res.status(response.status).send(errorDetails);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error(`Proxy error: ${error.message}`);
        res.status(500).send({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server is running on port ${PORT}`);
});
