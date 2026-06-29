// index.js (o worker.js) - Versión Cloudflare Workers Anti-Bloqueos
const API_KEY = "?key=AIzaSyAt9w0768SgSpI87y0D1f8Z313G2D4I4A0";

const GOOGLE_HEADERS = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (ChromiumStylePlatform; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 SmartTV',
    'Origin': 'https://www.youtube.com',
    'Referer': 'https://www.youtube.com/tv',
    'Accept-Language': 'es-419,es;q=0.9'
};

// Función para normalizar el JSON que manda el Galaxy Watch5
function fixRequestBody(body) {
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

        // Configuración de CORS para que tu app de Android pueda conectarse sin drama
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };

        // Responder a peticiones OPTIONS (CORS preflight)
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        // 1. RUTA RAÍZ (Para ver si está vivo en el navegador)
        if (url.pathname === '/' && request.method === 'GET') {
            return new Response('YouTube corre perfectamente', {
                headers: { 'Content-Type': 'text/plain; charset=utf-8', ...corsHeaders }
            });
        }

        // Determinar a qué endpoint de Google le pegamos
        let googleEndpoint = '';
        if (url.pathname === '/api/browse') googleEndpoint = 'browse';
        if (url.pathname === '/api/search') googleEndpoint = 'search';
        if (url.pathname === '/api/next') googleEndpoint = 'next';

        if (googleEndpoint) {
            try {
                const reqBody = await request.json();
                const cleanBody = fixRequestBody(reqBody);

                // Hacemos el fetch directo a los servidores de Google
                const googleResponse = await fetch(`https://youtubei.googleapis.com/v1/${googleEndpoint}${API_KEY}`, {
                    method: 'POST',
                    headers: GOOGLE_HEADERS,
                    body: JSON.stringify(cleanBody)
                });

                const data = await googleResponse.json();

                return new Response(JSON.stringify(data), {
                    status: googleResponse.status,
                    headers: { 'Content-Type': 'application/json', ...corsHeaders }
                });

            } catch (error) {
                return new Response(JSON.stringify({ error: error.message }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json', ...corsHeaders }
                });
            }
        }

        // Si no coincide ninguna ruta
        return new Response('Not Found', { status: 404, headers: corsHeaders });
    }
};