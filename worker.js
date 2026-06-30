const express = require('express');
const cors = require('cors');
const youTubeSearchApi = require('youtube-search-api');

const app = express();

app.use(cors());
app.use(express.json());

// Control base
app.get('/', (req, res) => res.status(200).json({ status: "ok" }));
app.get('/api', (req, res) => res.status(200).json({ status: "ok" }));

// 1. Endpoint: BROWSE (Pega a los trends de música estables)
const handleBrowse = async (req, res) => {
    try {
        // Obtenemos los videos más populares directamente de la API de YouTube
        const results = await youTubeSearchApi.GetTrendingVideo();
        
        const safeContents = (results.items || []).map(v => ({
            id: v.id || '',
            title: v.title || 'Video sin título',
            author: v.author || 'Canal',
            thumbnail: v.thumbnail?.thumbnails?.[0]?.url || `https://img.youtube.com/vi/${v.id}/mqdefault.jpg`
        }));
        
        return res.status(200).json({ success: true, contents: safeContents });
    } catch (error) {
        return res.status(500).json({ error: "Error en browse", message: error.message });
    }
};
app.get('/browse', handleBrowse);
app.get('/api/browse', handleBrowse);

// 2. Endpoint: SEARCH (Búsqueda limpia por Smart TV API)
const handleSearch = async (req, res) => {
    const query = req.query.q || '';
    try {
        const results = await youTubeSearchApi.GetListByKeyword(query, false, 20);
        
        const safeSearch = (results.items || []).map(v => ({
            id: v.id || '',
            title: v.title || 'Video sin título',
            author: v.channelTitle || 'Canal',
            thumbnail: v.thumbnail?.thumbnails?.[0]?.url || `https://img.youtube.com/vi/${v.id}/mqdefault.jpg`
        }));
        
        return res.status(200).json({ success: true, contents: safeSearch });
    } catch (error) {
        return res.status(500).json({ error: "Error en search", message: error.message });
    }
};
app.get('/search', handleSearch);
app.get('/api/search', handleSearch);

// 3. Endpoint: NEXT (Detalles y sugeridos)
const handleNext = async (req, res) => {
    const videoId = req.query.videoId || '';
    if (!videoId) return res.status(400).json({ error: "Falta el videoId" });

    try {
        const details = await youTubeSearchApi.GetVideoDetails(videoId);
        const suggestions = await youTubeSearchApi.GetSuggestVideo(videoId);

        const safeContents = (suggestions.items || []).map(v => ({
            id: v.id || '',
            title: v.title || '',
            author: v.channelTitle || '',
            thumbnail: v.thumbnail?.thumbnails?.[0]?.url || `https://img.youtube.com/vi/${v.id}/mqdefault.jpg`
        }));

        return res.status(200).json({
            success: true,
            title: details.title || 'Video de YouTube',
            id: videoId,
            author: details.channelTitle || 'Desconocido',
            thumbnails: [{ url: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` }],
            // Pasamos una URL directa armada usando un formato estándar para el reproductor del reloj
            streams: [{ url: `https://www.youtube.com/watch?v=${videoId}`, mimeType: "audio/mp4" }],
            contents: safeContents
        });
    } catch (error) {
        return res.status(500).json({ error: "Error en next", message: error.message });
    }
};
app.get('/next', handleNext);
app.get('/api/next', handleNext);

module.exports = app;