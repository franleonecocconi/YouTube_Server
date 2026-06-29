// index.js - Servidor Proxy Completo y Gratis para YouTube en Wear OS
const express = require('express');
const axios = require('axios');
const app = express();

// Seteamos el puerto automático para que Render no tire error al levantar
const PORT = process.env.PORT || 3000;

// Interceptor para poder leer los JSON que manda el reloj
app.use(express.json());

// Cabeceras fijas que le van a mentir a Google para que crea que somos la app oficial
const GOOGLE_HEADERS = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 11; Watch5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36 YouTubeAndroidEmbeddedPlayer/19.25.33V',
    'X-Youtube-Client-Name': '55',
    'X-Youtube-Client-Version': '19.25.33',
    'X-Goog-Api-Format-Version': '2',
    'Origin': 'https://www.youtube.com',
    'Accept-Language': 'es-419,es;q=0.9'
};

// 1. RUTA PARA EL HOME / INICIO (Browse)
app.post('/api/browse', async (req, res) => {
    console.log('--> Petición de Inicio recibida desde el Watch5');
    try {
        const response = await axios.post(
            'https://youtubei.googleapis.com/v1/browse',
            req.body,
            { headers: GOOGLE_HEADERS }
        );
        res.json(response.data);
    } catch (error) {
        console.error('Bardo en Browse:', error.message);
        res.status(error.response?.status || 500).json({ error: error.message });
    }
});

// 2. RUTA PARA LAS BÚSQUEDAS (Search)
app.post('/api/search', async (req, res) => {
    console.log(`--> Petición de Búsqueda recibida: ${req.body.query}`);
    try {
        const response = await axios.post(
            'https://youtubei.googleapis.com/v1/search',
            req.body,
            { headers: GOOGLE_HEADERS }
        );
        res.json(response.data);
    } catch (error) {
        console.error('Bardo en Search:', error.message);
        res.status(error.response?.status || 500).json({ error: error.message });
    }
});

// 3. RUTA PARA EL SIGUIENTE VIDEO / COMPLEMENTOS (Next)
app.post('/api/next', async (req, res) => {
    console.log('--> Petición de Siguiente Contenido (Next) recibida');
    try {
        const response = await axios.post(
            'https://youtubei.googleapis.com/v1/next',
            req.body,
            { headers: GOOGLE_HEADERS }
        );
        res.json(response.data);
    } catch (error) {
        console.error('Bardo en Next:', error.message);
        res.status(error.response?.status || 500).json({ error: error.message });
    }
});

// Ruta de prueba por si entrás desde la Mac para ver si está vivo
app.get('/', (req, res) => {
    res.send('¡El servidor proxy de YouTube está vivito y coleando, buey!');
});

// Arrancamos el servidor
app.listen(PORT, () => {
    console.log(`😈 Servidor malvado corriendo en el puerto ${PORT}`);
});