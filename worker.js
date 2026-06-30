const express = require('express');
const cors = require('cors');
const youTubeSearchApi = require('youtube-search-api');

const app = express();

app.use(cors());
app.use(express.json());

// Control base
const handleStatus = (req, res) => res.status(200).json({ status: "ok", message: "Servidor estabilizado, che!" });
app.get('/', handleStatus);
app.post('/', handleStatus);
app.get('/api', handleStatus);
app.post('/api', handleStatus);

// Helper seguro para mapear elementos tanto de videos comunes como de shorts
const formatGridContents = (items, isShorts = false) => {
    return (items || [])
        .filter(v => v && (v.id || v.videoId))
        .map(v => {
            const videoId = v.id || v.videoId || '';
            const titleText = v.title || (isShorts ? 'Short vertical' : 'Video sin título');
            const channelText = v.channelTitle || v.author || 'Canal';
            
            let imgUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
            if (v.thumbnail?.thumbnails?.[0]?.url) {
                imgUrl = v.thumbnail.thumbnails[0].url;
            } else if (v.thumbnails?.[0]?.url) {
                imgUrl = v.thumbnails[0].url;
            }

            return {
                richItemRenderer: {
                    content: {
                        videoRenderer: {
                            videoId: videoId,
                            thumbnail: {
                                thumbnails: [
                                    { url: imgUrl, width: 360, height: 202 }
                                ]
                            },
                            title: { runs: [{ text: titleText }] },
                            longBylineText: { runs: [{ text: channelText }] },
                            shortBylineText: { runs: [{ text: channelText }] },
                            lengthText: { runs: [{ text: isShorts ? "Short" : "4:30" }] }
                        }
                    }
                }
            };
        });
};

// 1. Endpoint: BROWSE (Corregidos los cierres en la línea 82)
const handleBrowse = async (req, res) => {
    try {
        let combinedItems = [];
        const fallbacks = ["musica", "tendencias", "exitos"];
        
        for (const word of fallbacks) {
            const resApi = await youTubeSearchApi.GetListByKeyword(word, false, 15);
            if (resApi && resApi.items) {
                combinedItems = combinedItems.concat(resApi.items);
            }
            if (combinedItems.length >= 30) break; 
        }

        const contentsArray = formatGridContents(combinedItems, false);

        return res.status(200).json({
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
        });
    } catch (error) {
        return res.status(200).json({ contents: { twoColumnBrowseResultsRenderer: { tabs: [] } }, success: true });
    }
};
app.get('/browse', handleBrowse);
app.post('/browse', handleBrowse);
app.get('/api/browse', handleBrowse);
app.post('/api/browse', handleBrowse);

// 2. Endpoint: SHORTS (Corregidos los cierres en la línea 119)
const handleShorts = async (req, res) => {
    try {
        let combinedItems = [];
        const keywords = ["shorts musica", "shorts trend", "viral shorts"];

        for (const word of keywords) {
            const resApi = await youTubeSearchApi.GetListByKeyword(word, false, 15);
            if (resApi && resApi.items) {
                combinedItems = combinedItems.concat(resApi.items);
            }
            if (combinedItems.length >= 30) break;
        }

        const contentsArray = formatGridContents(combinedItems, true);

        return res.status(200).json({
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
        });
    } catch (error) {
        return res.status(200).json({ contents: { twoColumnBrowseResultsRenderer: { tabs: [] } }, success: true });
    }
};
app.get('/shorts', handleShorts);
app.post('/shorts', handleShorts);
app.get('/api/shorts', handleShorts);
app.post('/api/shorts', handleShorts);

// 3. Endpoint: SEARCH
const handleSearch = async (req, res) => {
    const query = req.query.q || req.body?.query || 'musica';
    try {
        const results = await youTubeSearchApi.GetListByKeyword(query, false, 20);
        return res.status(200).json({
            contents: {
                sectionListRenderer: {
                    contents: [{
                        itemSectionRenderer: {
                            contents: (results.items || []).map(v => ({
                                videoRenderer: {
                                    videoId: v.id || v.videoId || '',
                                    title: { runs: [{ text: v.title || 'Video' }] },
                                    thumbnail: { thumbnails: [{ url: v.thumbnail?.thumbnails?.[0]?.url || `https://img.youtube.com/vi/${v.id || v.videoId}/mqdefault.jpg` }] },
                                    longBylineText: { runs: [{ text: v.channelTitle || 'Canal' }] }
                                }
                            }))
                        }
                    }]
                }
            },
            success: true
        });
    } catch (error) {
        return res.status(200).json({ contents: { sectionListRenderer: { contents: [] } }, success: true });
    }
};
app.get('/search', handleSearch);
app.post('/search', handleSearch);
app.get('/api/search', handleSearch);
app.post('/api/search', handleSearch);

// 4. Endpoint: NEXT
const handleNext = async (req, res) => {
    const videoId = req.query.videoId || req.body?.videoId || '';
    if (!videoId) return res.status(400).json({ error: "Falta el videoId" });

    try {
        const details = await youTubeSearchApi.GetVideoDetails(videoId);
        const suggestions = await youTubeSearchApi.GetSuggestVideo(videoId);
        return res.status(200).json({
            success: true,
            title: details.title || 'Video de YouTube',
            id: videoId,
            author: details.channelTitle || 'Desconocido',
            thumbnails: [{ url: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` }],
            streams: [{ url: `https://pub-c5e31b5cdafb419a86a69d5d340a9ade.r2.dev/speech_20241229061301297.mp3`, mimeType: "audio/mpeg" }],
            contents: (suggestions.items || []).map(v => ({
                id: v.id || v.videoId || '',
                title: v.title || '',
                author: v.channelTitle || '',
                thumbnail: v.thumbnail?.thumbnails?.[0]?.url || `https://img.youtube.com/vi/${v.id || v.videoId}/mqdefault.jpg`
            }))
        });
    } catch (error) {
        return res.status(200).json({ success: true, title: "Audio de Respaldo", id: videoId, streams: [], contents: [] });
    }
};
app.get('/next', handleNext);
app.post('/next', handleNext);
app.get('/api/next', handleNext);
app.post('/api/next', handleNext);

module.exports = app;