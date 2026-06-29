// index.js - Versión Web Blindada
const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

// API Key oficial que usa la versión Web de YouTube
const API_KEY = "?key=AIzaSyAunp6-B2RXYLdtYp528A6Mv458fP_7-A0";

const GOOGLE_HEADERS = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    'X-Youtube-Client-Name': '1', // 1 significa cliente WEB
    'X-Youtube-Client-Version': '2.20260626.01.00',
    'Origin': 'https://www.youtube.com',
    'Referer': 'https://www.youtube.com/',
    'Accept-Language': 'es-419,es;q=0.9'
};

app.get('/', (req, res) => {
    res.send('El servidor proxy de YouTube esta corriendo');
});

app.post('/api/browse', async (req, res) => {
    console.log('--> Petición de Inicio (Browse)');
    try {
        const response = await axios.post(`https://youtubei.googleapis.com/v1/browse${API_KEY}`, req.body, { headers: GOOGLE_HEADERS });
        res.json(response.data);
    } catch (error) {
        console.error('Error en Browse:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ error: error.message });
    }
});

app.post('/api/search', async (req, res) => {
    console.log('--> Petición de Búsqueda (Search)');
    try {
        const response = await axios.post(`https://youtubei.googleapis.com/v1/search${API_KEY}`, req.body, { headers: GOOGLE_HEADERS });
        res.json(response.data);
    } catch (error) {
        console.error('Error en Search:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ error: error.message });
    }
});

app.post('/api/next', async (req, res) => {
    console.log('--> Petición de Siguiente (Next)');
    try {
        const response = await axios.post(`https://youtubei.googleapis.com/v1/next${API_KEY}`, req.body, { headers: GOOGLE_HEADERS });
        res.json(response.data);
    } catch (error) {
        console.error('Error en Next:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`😈 Servidor corriendo con cliente WEB en el puerto ${PORT}`);
});