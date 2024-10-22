import type { APIRoute } from 'astro';
export const prerender = false;

export const GET: APIRoute = async (context) => {
    const urlParams = new URL(context.url);
    const url = urlParams.searchParams.get('url');
    if (!url) {
        return new Response('Bad Request', { status: 400 });
    }
    const response = await fetch(url);
    const blob = await response.json();
    return new Response(JSON.stringify({ blob }));
};

export const post: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { url, options } = body;

        if (!url) {
            return new Response(JSON.stringify({ error: 'URL is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const response = await fetch(url, options);
        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Proxy fetch error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
