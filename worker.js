// worker.js - Versión Full con Require, Next y Headers Originales de TV
const YouTubeExt = require('youtube-ext');

const GOOGLE_HEADERS = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (ChromiumStylePlatform; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 SmartTV',
    'Origin': 'https://www.youtube.com',
    'Referer': 'https://www.youtube.com/tv',
    'Accept-Language': 'es-419,es;q=0.9'
};

function injectExtractorContext(body) {
    if (!body) body = {};
    const updatedBody = { ...body };
    updatedBody.context = {
        client: {
            clientName: "TVHTML5",
            clientVersion: "7.20260620.00.00",
            hl: "es-419",
            gl: "AR",
            userAgent: "Mozilla/5.0 (ChromiumStylePlatform; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 SmartTV,gzip(gfe)"
        },
        user: { lockedSafetyMode: false },
        request: { useSsl: true }
    };
    return updatedBody;
}

module.exports = {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };

        // Soporte CORS para la app del Galaxy Watch
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        const cleanPath = url.pathname.replace(/\/+/g, '/');

        // Capturamos el body original por si viene con data del reloj
        let reqBody = {};
        const contentType = request.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            const text = await request.text();
            if (text && text.trim().length > 0) {
                try {
                    reqBody = JSON.parse(text);
                } catch (e) {}
            }
        }

        const cleanBody = injectExtractorContext(reqBody);

        // 1. Endpoint: BROWSE
        if (cleanPath === '/api/browse' || cleanPath === '/browse') {
            try {
                const trending = await YouTubeExt.getTrending({ region: 'AR' });
                return new Response(JSON.stringify({
                    success: true,
                    contents: trending.videos,
                    _headersMocked: GOOGLE_HEADERS,
                    _contextMocked: cleanBody.context
                }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json', ...corsHeaders }
                });
            } catch (error) {
                return new Response(JSON.stringify({ error: "Error en browse", message: error.message }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json', ...corsHeaders }
                });
            }
        }

        // 2. Endpoint: SEARCH
        if (cleanPath === '/api/search' || cleanPath === '/search') {
            try {
                const query = url.searchParams.get('q') || cleanBody.query || '';
                const searchResults = await YouTubeExt.search(query);
                return new Response(JSON.stringify({
                    success: true,
                    contents: searchResults.videos,
                    _headersMocked: GOOGLE_HEADERS
                }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json', ...corsHeaders }
                });
            } catch (error) {
                return new Response(JSON.stringify({ error: "Error en search", message: error.message }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json', ...corsHeaders }
                });
            }
        }

        // 3. Endpoint: NEXT (Videos siguientes / relacionados)
        if (cleanPath === '/api/next' || cleanPath === '/next') {
            try {
                const videoId = url.searchParams.get('videoId') || cleanBody.videoId || '';
                // Usamos el extractor para traer los detalles del video siguiente
                const videoDetails = await YouTubeExt.getVideo(videoId);
                return new Response(JSON.stringify({
                    success: true,
                    contents: videoDetails.relatedVideos || [],
                    _headersMocked: GOOGLE_HEADERS
                }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json', ...corsHeaders }
                });
            } catch (error) {
                return new Response(JSON.stringify({ error: "Error en next", message: error.message }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json', ...corsHeaders }
                });
            }
        }

        return new Response('Ruta no encontrada', { status: 404, headers: corsHeaders });
    }
};