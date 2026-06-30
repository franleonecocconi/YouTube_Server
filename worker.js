const express = require('express');
const cors = require('cors');
const youTubeSearchApi = require('youtube-search-api');

const app = express();

app.use(cors());
app.use(express.json());

// Control base para verificar en la web si el server responde
const handleStatus = (req, res) => res.status(200).json({ status: "ok", message: "Servidor estabilizado, che!" });
app.get('/', handleStatus);
app.post('/', handleStatus);
app.get('/api', handleStatus);
app.post('/api', handleStatus);

// 1. Endpoint: BROWSE (Soporta el POST del reloj y estructura InnerTube de YouTube)
const handleBrowse = async (req, res) => {
    try {
        // Traemos los videos usando la API de Smart TV interna
        const results = await youTubeSearchApi.GetListByKeyword("musica tendencias", false, 40);
        
        // Mapeamos los items al formato de renderizado que busca la app nativa de YouTube
        const contentsArray = (results.items || []).map(v => ({
            richItemRenderer: {
                content: {
                    videoRenderer: {
                        videoId: v.id || '',
                        thumbnail: {
                            thumbnails: [{ url: v.thumbnail?.thumbnails?.[0]?.url || `https://img.youtube.com/vi/${v.id}/mqdefault.jpg` }]
                        },
                        title: { runs: [{ text: v.title || 'Video sin título' }] },
                        longBylineText: { runs: [{ text: v.channelTitle || 'Canal' }] },
                        shortBylineText: { runs: [{ text: v.channelTitle || 'Canal' }] }
                    }
                }
            }
        }));

        // Estructura oficial InnerTube que evita el error de parseo en Android
        const nativeYouTubeResponse = {
            contents: {
                twoColumnBrowseResultsRenderer: {
                    tabs: [{
                        tabRenderer: {
                            content: {
                                richGridRenderer: {
                                    contents: contentsArray
                                }
                            }
                        }
                    }]
                }
            },
            success: true
        };

        return res.status(200).json(nativeYouTubeResponse);
    } catch (error) {
        return res.status(200).json({ contents: { twoColumnBrowseResultsRenderer: { tabs: [] } }, success: true });
    }
};
app.get('/browse', handleBrowse);
app.post('/browse', handleBrowse);
app.get('/api/browse', handleBrowse);
app.post('/api/browse', handleBrowse);

// 2. Endpoint: SEARCH (Adaptado también al formato nativo de listas)
const handleSearch = async (req, res) => {
    // Tomamos la query ya sea por URL (?q=) o por el cuerpo del POST si lo manda la app
    const query = req.query.q || req.body?.query || 'musica';
    try {
        const results = await youTubeSearchApi.GetListByKeyword(query, false, 20);
        
        const nativeSearchResponse = {
            contents: {
                sectionListRenderer: {
                    contents: [{
                        itemSectionRenderer: {
                            contents: (results.items || []).map(v => ({
                                videoRenderer: {
                                    videoId: v.id || '',
                                    title: { runs: [{ text: v.title || 'Video sin título' }] },
                                    thumbnail: { thumbnails: [{ url: v.thumbnail?.thumbnails?.[0]?.url || `https://img.youtube.com/vi/${v.id}/mqdefault.jpg` }] },
                                    longBylineText: { runs: [{ text: v.channelTitle || 'Canal' }] }
                                }
                            }))
                        }
                    }]
                }
            },
            success: true
        };

        return res.status(200).json(nativeSearchResponse);
    } catch (error) {
        return res.status(200).json({ contents: { sectionListRenderer: { contents: [] } }, success: true });
    }
};
app.get('/search', handleSearch);
app.post('/search', handleSearch);
app.get('/api/search', handleSearch);
app.post('/api/search', handleSearch);

// 3. Endpoint: NEXT
const handleNext = async (req, res) => {
    const videoId = req.query.videoId || req.body?.videoId || '';
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
            streams: [{ url: `https://pub-c5e31b5cdafb419a86a69d5d340a9ade.r2.dev/speech_20241229061301297.mp3`, mimeType: "audio/mpeg" }],
            contents: safeContents
        });
    } catch (error) {
        return res.status(200).json({
            success: true,
            title: "Audio de Respaldo",
            id: videoId,
            streams: [{ url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", mimeType: "audio/mpeg" }],
            contents: []
        });
    }
};
app.get('/next', handleNext);
app.post('/next', handleNext);
app.get('/api/next', handleNext);
app.post('/api/next', handleNext);

module.exports = app;