import fs from 'node:fs/promises';
import { getStore } from '@netlify/blobs';
const store = getStore({ name: 'door', consistency: 'strong' });
const prerender = false;

// export async function GET({ params, request }) {
//     const open = new Date(await store.get('open')).getTime() > Date.now() + 1000 * 1000;
//     console.log(open, new Date(await store.get('open')).getTime() % 10000, (Date.now() + 1000 * 10) % 10000);

//     const file = await fs.readFile(`./src/assets/images/${open ? 'open' : 'closed'}.png`);
//     return new Response(file);
// }

export async function GET({ params, request }) {
    const expireTime = new Date(await store.get('open')).getTime();
    const isOpen = expireTime > Date.now();
    const file = await fs.readFile(`./src/assets/images/${isOpen ? 'open' : 'closed'}.png`);
    return new Response(file);
}
