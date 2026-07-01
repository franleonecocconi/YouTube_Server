const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(cors());
app.use(express.json());

const GOOGLE_API_KEY = "AIzaSyCejfkwwYK5B6yChz2o2PJPf8JoYQGr2JY";

const handleStatus = (req, res) => res.status(200).json({ status: "ok", message: "Servidor de youtube corriendo" });
app.get('/', handleStatus);
app.post('/', handleStatus);
app.get('/api', handleStatus);
app.post('/api', handleStatus);

const handleBrowse = async (req, res) => {
    try {
        const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&chart=mostPopular&regionCode=AR&maxResults=20&key=${GOOGLE_API_KEY}`;
        
        const response = await axios.get(url);
        const items = response.data.items || [];

        const contents = items.map(v => ({
            richItemRenderer: {
                content: {
                    videoRenderer: {
                        videoId: v.id,
                        thumbnail: { thumbnails: [{ url: v.snippet?.thumbnails?.medium?.url || v.snippet?.thumbnails?.default?.url, width: 360, height: 202 }] },
                        title: { runs: [{ text: v.snippet?.title || 'Video sin título' }] },
                        longBylineText: { runs: [{ text: v.snippet?.channelTitle || 'Canal' }] },
                        shortBylineText: { runs: [{ text: v.snippet?.channelTitle || 'Canal' }] },
                        lengthText: { runs: [{ text: "Video" }] }
                    }
                }
            }
        }));

        return res.status(200).json({
            contents: { twoColumnBrowseResultsRenderer: { tabs: [{ tabRenderer: { content: { richGridRenderer: { contents } } } }] } },
            success: true
        });
    } catch (error) {
        console.error("Error en la API de YouTube (Browse):", error.response?.data || error.message);
        return res.status(200).json({ contents: { twoColumnBrowseResultsRenderer: { tabs: [] } }, success: true });
    }
};
app.get('/browse', handleBrowse);
app.post('/browse', handleBrowse);
app.get('/api/browse', handleBrowse);
app.post('/api/browse', handleBrowse);

const handleShorts = async (req, res) => {
    try {
        const queryReloj = req.query.q || req.body?.query || "shorts virales";
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoDuration=short&q=${encodeURIComponent(queryReloj)}&maxResults=25&key=${GOOGLE_API_KEY}`;
        
        const response = await axios.get(url);
        const items = response.data.items || [];

        const contents = items.map(v => ({
            richItemRenderer: {
                content: {
                    videoRenderer: {
                        videoId: v.id?.videoId,
                        thumbnail: { thumbnails: [{ url: v.snippet?.thumbnails?.medium?.url, width: 360, height: 202 }] },
                        title: { runs: [{ text: v.snippet?.title || 'Short' }] },
                        longBylineText: { runs: [{ text: v.snippet?.channelTitle || 'Canal' }] },
                        shortBylineText: { runs: [{ text: v.snippet?.channelTitle || 'Canal' }] },
                        lengthText: { runs: [{ text: "Short" }] }
                    }
                }
            }
        }));

        return res.status(200).json({
            contents: { twoColumnBrowseResultsRenderer: { tabs: [{ tabRenderer: { content: { richGridRenderer: { contents } } } }] } },
            success: true
        });
    } catch (error) {
        console.error("Error en la API de YouTube (Shorts):", error.response?.data || error.message);
        return res.status(200).json({ contents: { twoColumnBrowseResultsRenderer: { tabs: [] } }, success: true });
    }
};
app.get('/shorts', handleShorts);
app.post('/shorts', handleShorts);
app.get('/api/shorts', handleShorts);
app.post('/api/shorts', handleShorts);

module.exports = app;