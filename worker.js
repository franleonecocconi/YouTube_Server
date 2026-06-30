const express = require('express');
const cors = require('cors');
const YouTubeExt = require('youtube-ext');

const app = express();

// Aplicamos CORS y Express JSON de forma nativa
app.use(cors());
app.use(express.json());

const GOOGLE_HEADERS = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (ChromiumStylePlatform; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 SmartTV',
    'Origin': 'https://www.youtube.com',
    'Referer': 'https://www.youtube.com/tv',
    'Accept-Language': 'es-419,es;q=0.9'
};

// 1. Endpoint: BROWSE
app.get('/api/browse', async (req, res) => {
    try {
        const trending = await YouTubeExt.getTrending({ region: 'AR' });
        res.status(200).json({ success: true, contents: trending.videos });
    } catch (error) {
        res.status(500).json({ error: "Error en browse", message: error.message });
    }
});

// 2. Endpoint: SEARCH
app.get('/api/search', async (req, res) => {
    try {
        const query = req.query.q || '';
        const searchResults = await YouTubeExt.search(query);
        res.status(200).json({ success: true, contents: searchResults.videos });
    } catch (error) {
        res.status(500).json({ error: "Error en search", message: error.message });
    }
});

// 3. Endpoint: NEXT (Detalles y streams de audio)
app.get('/api/next', async (req, res) => {
    try {
        const videoId = req.query.videoId || '';
        if (!videoId) {
            return res.status(400).json({ error: "Falta el videoId" });
        }
        const videoDetails = await YouTubeExt.getVideo(videoId);
        res.status(200).json({
            success: true,
            title: videoDetails.title,
            id: videoDetails.id,
            thumbnails: videoDetails.thumbnails,
            streams: videoDetails.streams || [], // Acá tenés tus URLs de audio limpias
            contents: videoDetails.relatedVideos || []
        });
    } catch (error) {
        res.status(500).json({ error: "Error en next", message: error.message });
    }
});

// En Vercel no se usa app.listen(), exportamos la app directamente para Serverless
module.exports = app;