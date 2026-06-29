// index.js - Versión con API Key Incluida
const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

// La API Key oficial que necesita InnerTube para no tirar 403
const API_KEY = "?key=AIzaSyAO_2Tk6996D76v_1S9NOfZbyN_9D8pP4M";

const GOOGLE_HEADERS = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 11; Watch5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36 YouTubeAndroidEmbeddedPlayer/19.25.33V',
    'X-Youtube-Client-Name': '55',
    'X-Youtube-Client-Version': '19.25.33',
    'X-Goog-Api-Format-Version': '2',
    'Origin': 'https://www.youtube.com',
    'Accept-Language': 'es-419,es;q=0.9'
};

app.get('/', (req, res) => {
    res.send('YouTube corre ahora');
});

app.post('/api/browse', async (req, res) => {
    console.log('--> Petición de Inicio (Browse)');
    try {
        // Le sumamos la API_KEY al final de la URL de Google
        const response = await axios.post(`https://youtubei.googleapis.com/v1/browse${API_KEY}`, req.body, { headers: GOOGLE_HEADERS });
        res.json(response.data);
    } catch (error) {
        console.error('Error en Browse:', error.message);
        res.status(error.response?.status || 500).json({ error: error.message });
    }
});

app.post('/api/search', async (req, res) => {
    console.log('--> Petición de Búsqueda (Search)');
    try {
        const response = await axios.post(`https://youtubei.googleapis.com/v1/search${API_KEY}`, req.body, { headers: GOOGLE_HEADERS });
        res.json(response.data);
    } catch (error) {
        console.error('Error en Search:', error.message);
        res.status(error.response?.status || 500).json({ error: error.message });
    }
});

app.post('/api/next', async (req, res) => {
    console.log('--> Petición de Siguiente (Next)');
    try {
        const response = await axios.post(`https://youtubei.googleapis.com/v1/next${API_KEY}`, req.body, { headers: GOOGLE_HEADERS });
        res.json(response.data);
    } catch (error) {
        console.error('Error en Next:', error.message);
        res.status(error.response?.status || 500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`YouTube corriendo en el puerto ${PORT}`);
});