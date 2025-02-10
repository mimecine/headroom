import fs from 'node:fs/promises';
import { getStore } from '@netlify/blobs';
export const prerender = false;

export async function GET({ params, request, redirect }) {
    const store = getStore({
        name: 'door',
        consistency: 'strong'
    });
    let expireTime = new Date(await store.get('open')).getTime();
    let isOpen = expireTime > Date.now();
    let file = await fs.readFile(`./public/images/${isOpen ? 'open' : 'closed'}.png`);
    // return new Response(file, { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=0, must-revalidate' } });
    // return new Response('Hello');
    return Response.redirect(`/images/${isOpen ? 'open' : 'closed'}.png`);
}
