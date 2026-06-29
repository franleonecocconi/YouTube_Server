// index.js - Versión Corregida y Asegurada
const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

const GOOGLE_HEADERS = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 11; Watch5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36 YouTubeAndroidEmbeddedPlayer/19.25.33V',
    'X-Youtube-Client-Name': '55',
    'X-Youtube-Client-Version': '19.25.33',
    'X-Goog-Api-Format-Version': '2',
    'Origin': 'https://www.youtube.com',
    'Accept-Language': 'es-419,es;q=0.9'
};

// RUTA DE PRUEBA EN LA RAÍZ: Para ver desde la Mac si el servidor está vivo
app.get('/', (req, res) => {
    res.send('¡El servidor proxy de YouTube está vivito y coleando, buey!');
});

// 1. RUTA PARA BROWSE
app.post('/api/browse', async (req, res) => {
    console.log('--> Petición de Inicio (Browse)');
    try {
        const response = await axios.post('https://youtubei.googleapis.com/v1/browse', req.body, { headers: GOOGLE_HEADERS });
        res.json(response.data);
    } catch (error) {
        console.error('Error en Browse:', error.message);
        res.status(error.response?.status || 500).json({ error: error.message });
    }
});

// 2. RUTA PARA SEARCH
app.post('/api/search', async (req, res) => {
    console.log('--> Petición de Búsqueda (Search)');
    try {
        const response = await axios.post('https://youtubei.googleapis.com/v1/search', req.body, { headers: GOOGLE_HEADERS });
        res.json(response.data);
    } catch (error) {
        console.error('Error en Search:', error.message);
        res.status(error.response?.status || 500).json({ error: error.message });
    }
});

// 3. RUTA PARA NEXT
app.post('/api/next', async (req, res) => {
    console.log('--> Petición de Siguiente (Next)');
    try {
        const response = await axios.post('https://youtubei.googleapis.com/v1/next', req.body, { headers: GOOGLE_HEADERS });
        res.json(response.data);
    } catch (error) {
        console.error('Error en Next:', error.message);
        res.status(error.response?.status || 500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`😈 Servidor corriendo en el puerto ${PORT}`);
});