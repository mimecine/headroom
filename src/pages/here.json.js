const prerender = false;

import { getStore } from '@netlify/blobs';
const store = getStore({
    name: 'door',
    consistency: 'strong',
    siteID: '4100fd91-6e10-4220-9ec9-152893b5ef95',
    token: 'nfp_nYnWkqa38c17E6s6od2yos4q3edukjek298e'
});
export async function GET({ params, request }) {
    await store.set('open', new Date(Date.now() + 1000 * 20).toISOString());
    return new Response(JSON.stringify(await store.get('open')));
}
