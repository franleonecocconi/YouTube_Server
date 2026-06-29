// index.js - Versión ultra-blindada contra HTTP 500
const API_KEY = "?key=AIzaSyAt9w0768SgSpI87y0D1f8Z313G2D4I4A0";

const GOOGLE_HEADERS = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (ChromiumStylePlatform; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 SmartTV',
    'Origin': 'https://www.youtube.com',
    'Referer': 'https://www.youtube.com/tv',
    'Accept-Language': 'es-419,es;q=0.9'
};

function fixRequestBody(body) {
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

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };

        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        if (url.pathname === '/' || url.pathname === '/api') {
            return new Response('¡Proxy activo, buey!', {
                headers: { 'Content-Type': 'text/plain; charset=utf-8', ...corsHeaders }
            });
        }

        // Limpiamos la ruta por si Retrofit mete barras dobles sin querer
        const cleanPath = url.pathname.replace(/\/+/g, '/');
        let googleEndpoint = '';
        
        if (cleanPath === '/api/browse' || cleanPath === '/browse') googleEndpoint = 'browse';
        if (cleanPath === '/api/search' || cleanPath === '/search') googleEndpoint = 'search';
        if (cleanPath === '/api/next' || cleanPath === '/next') googleEndpoint = 'next';

        if (googleEndpoint) {
            try {
                // Validación para que no explote si el body viene vacío
                let reqBody = {};
                const contentType = request.headers.get('content-type') || '';
                if (contentType.includes('application/json')) {
                    const text = await request.text();
                    if (text && text.trim().length > 0) {
                        reqBody = JSON.parse(text);
                    }
                }

                const cleanBody = fixRequestBody(reqBody);

                const googleResponse = await fetch(`https://youtubei.googleapis.com/v1/${googleEndpoint}${API_KEY}`, {
                    method: 'POST',
                    headers: GOOGLE_HEADERS,
                    body: JSON.stringify(cleanBody)
                });

                const responseText = await googleResponse.text();
                let data;
                try {
                    data = JSON.parse(responseText);
                } catch (e) {
                    data = { rawResponse: responseText };
                }

                return new Response(JSON.stringify(data), {
                    status: googleResponse.status,
                    headers: { 'Content-Type': 'application/json', ...corsHeaders }
                });

            } catch (error) {
                // Si algo falla adentro, te va a escupir el error exacto en formato JSON en vez de un 500 genérico
                return new Response(JSON.stringify({ 
                    error: "Error interno en el Worker", 
                    message: error.message,
                    stack: error.stack 
                }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json', ...corsHeaders }
                });
            }
        }

        return new Response('Ruta no encontrada: ' + url.pathname, { status: 404, headers: corsHeaders });
    }
};