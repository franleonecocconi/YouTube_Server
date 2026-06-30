const express = require('express');
const cors = require('cors');
const YouTubeExt = require('youtube-ext');

const app = express();

app.use(cors());
app.use(express.json());

// 1. Endpoint: BROWSE (Corregido para usar la función real de la librería)
app.get('/api/browse', async (req, res) => {
    try {
        // En youtube-ext se usa getHomepage para la pantalla de inicio/tendencias
        const homepage = await YouTubeExt.getHomepage();
        res.status(200).json({ 
            success: true, 
            contents: homepage.videos || homepage.contents || [] 
        });
    } catch (error) {
        // Si getHomepage llega a estar viejo, tiramos un search genérico de seguridad
        try {
            const backup = await YouTubeExt.search('');
            res.status(200).json({ success: true, contents: backup.videos || [] });
        } catch (backupError) {
            res.status(500).json({ error: "Error en browse", message: error.message });
        }
    }
});

// 2. Endpoint: SEARCH
app.get('/api/search', async (req, res) => {
    try {
        const query = req.query.q || '';
        const searchResults = await YouTubeExt.search(query);
        res.status(200).json({ success: true, contents: searchResults.videos || [] });
    } catch (error) {
        res.status(500).json({ error: "Error en search", message: error.message });
    }
});

// 3. Endpoint: NEXT (Corregido para asegurar la extracción de streams de audio)
app.get('/api/next', async (req, res) => {
    try {
        const videoId = req.query.videoId || '';
        if (!videoId) {
            return res.status(400).json({ error: "Falta el videoId" });
        }

        // Buscamos los detalles usando el ID del video
        const videoDetails = await YouTubeExt.getVideo(videoId);
        
        res.status(200).json({
            success: true,
            title: videoDetails.title,
            id: videoDetails.id,
            thumbnails: videoDetails.thumbnails,
            streams: videoDetails.streams || [], // Tus urls de audio
            contents: videoDetails.relatedVideos || []
        });
    } catch (error) {
        res.status(500).json({ error: "Error en next", message: error.message });
    }
});

module.exports = app;