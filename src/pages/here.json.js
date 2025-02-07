const prerender = false;

import { getStore } from '@netlify/blobs';
const store = getStore({ name: 'door', consistency: 'strong' });

export async function GET({ params, request }) {
    await store.set('open', new Date(Date.now() + 1000 * 20).toISOString());
    return new Response(JSON.stringify(await store.get('open')));
}
