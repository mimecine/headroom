import fs from 'node:fs/promises';
import { getStore } from '@netlify/blobs';
export const prerender = false;

export async function GET({ params, request }) {
    const store = getStore({
        name: 'door',
        consistency: 'strong'
    });
    const expireTime = new Date(await store.get('open')).getTime();
    const isOpen = expireTime > Date.now();
    const file = await fs.readFile(`./src/assets/images/${isOpen ? 'open' : 'closed'}.png`);
    // return Response.redirect(`/images/${isOpen ? 'open' : 'closed'}.png`);
    console.log('open', isOpen);
    console.log('expireTime', expireTime, `/images/${isOpen ? 'open' : 'closed'}.png`);
    return new Response(file);
}
