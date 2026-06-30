const express = require('express');
const cors = require('cors');
const yt = require('yt-stream');

const app = express();

app.use(cors());
app.use(express.json());

// Ruta base para verificar que Vercel levantó bien
app.get('/', (req, res) => {
    res.status(200).json({ status: "ok", message: "Servidor con yt-stream activo" });
});

app.get('/api', (req, res) => {
    res.status(200).json({ status: "ok", message: "Servidor con yt-stream activo" });
});

// 1. Endpoint: BROWSE (Búsqueda por defecto de tendencias ya que yt-stream no tiene "homepage")
app.get('/api/browse', async (req, res) => {
    try {
        // Buscamos música top de Argentina como pantalla de inicio
        const results = await yt.search('top musica argentina', 20);
        res.status(200).json({ success: true, contents: results });
    } catch (error) {
        res.status(500).json({ error: "Error en browse", message: error.message });
    }
});

// 2. Endpoint: SEARCH
app.get('/api/search', async (req, res) => {
    const query = req.query.q || '';
    try {
        const searchResults = await yt.search(query, 25); // Trae 25 resultados
        res.status(200).json({ success: true, contents: searchResults });
    } catch (error) {
        res.status(500).json({ error: "Error en search", message: error.message });
    }
});

// 3. Endpoint: NEXT (Detalles del video y las URLs directas de AUDIO)
app.get('/api/next', async (req, res) => {
    const videoId = req.query.videoId || '';
    if (!videoId) {
        return res.status(400).json({ error: "Falta el videoId" });
    }

    try {
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        
        // Obtenemos la info básica del video
        const info = await yt.getVideoInfo(videoUrl);
        
        // Obtenemos todos los streams de audio disponibles
        const audioStreams = await yt.getAudioFeeds(videoUrl);

        // Armamos los datos relacionados haciendo una búsqueda rápida del artista
        let related = [];
        try {
            related = await yt.search(info.author || 'music', 5);
        } catch (e) {
            related = [];
        }

        res.status(200).json({
            success: true,
            title: info.title,
            id: videoId,
            author: info.author,
            thumbnails: [{ url: info.thumbnail }],
            // Enviamos los feeds de audio directos desglosados con sus URLs de Google Video
            streams: audioStreams || [],
            contents: related
        });
    } catch (error) {
        res.status(500).json({ error: "Error en next", message: error.message });
    }
});

module.exports = app;