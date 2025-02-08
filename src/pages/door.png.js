import fs from 'node:fs/promises';
import { getStore } from '@netlify/blobs';
const prerender = false;

export async function GET({ params, request }) {
    const store = getStore({
        name: 'door',
        consistency: 'strong'
        // siteID: '4100fd91-6e10-4220-9ec9-152893b5ef95',
        // token: 'nfp_nYnWkqa38c17E6s6od2yos4q3edukjek298e'
    });
    const expireTime = new Date(await store.get('open')).getTime();
    const isOpen = expireTime > Date.now();
    const file = await fs.readFile(`./src/assets/images/${isOpen ? 'open' : 'closed'}.png`);
    return new Response(file);
}
