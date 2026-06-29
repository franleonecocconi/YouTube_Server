// index.js - Versión TVHTML5 anti-CAPTCHA
const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

// API Key oficial que usan las Smart TVs y Consolas para YouTube
const API_KEY = "?key=AIzaSyAt9w0768SgSpI87y0D1f8Z313G2D4I4A0";

const GOOGLE_HEADERS = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (ChromiumStylePlatform; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 SmartTV',
    'Origin': 'https://www.youtube.com',
    'Referer': 'https://www.youtube.com/tv',
    'Accept-Language': 'es-419,es;q=0.9'
};

// Modificamos el cuerpo para que Google piense que es una televisión pidiendo videos
function fixRequestBody(body) {
    const updatedBody = { ...body };
    updatedBody.context = {
        client: {
            clientName: "TVHTML5",
            clientVersion: "7.20260620.00.00",
            hl: "es-419",
            gl: "AR",
            userAgent: "Mozilla/5.0 (ChromiumStylePlatform; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 SmartTV,gzip(gfe)"
        },
        user: { lockedSafetyMode: false },
        request: { useSsl: true }
    };
    return updatedBody;
}

app.get('/', (req, res) => {
    res.send('El servidor corre perfectamente');
});

app.post('/api/browse', async (req, res) => {
    console.log('--> Petición de Inicio (Browse - TV Mode)');
    try {
        const cleanBody = fixRequestBody(req.body);
        const response = await axios.post(`https://youtubei.googleapis.com/v1/browse${API_KEY}`, cleanBody, { headers: GOOGLE_HEADERS });
        res.json(response.data);
    } catch (error) {
        console.error('Error en Browse:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ error: error.message });
    }
});

app.post('/api/search', async (req, res) => {
    console.log('--> Petición de Búsqueda (Search - TV Mode)');
    try {
        const cleanBody = fixRequestBody(req.body);
        const response = await axios.post(`https://youtubei.googleapis.com/v1/search${API_KEY}`, cleanBody, { headers: GOOGLE_HEADERS });
        res.json(response.data);
    } catch (error) {
        console.error('Error en Search:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ error: error.message });
    }
});

app.post('/api/next', async (req, res) => {
    console.log('--> Petición de Siguiente (Next - TV Mode)');
    try {
        const cleanBody = fixRequestBody(req.body);
        const response = await axios.post(`https://youtubei.googleapis.com/v1/next${API_KEY}`, cleanBody, { headers: GOOGLE_HEADERS });
        res.json(response.data);
    } catch (error) {
        console.error('Error en Next:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`😈 Servidor corriendo en Modo Smart TV en el puerto ${PORT}`);
});