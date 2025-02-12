import { getStore } from '@netlify/blobs';
export const prerender = false;

const store = getStore({
    name: 'door',
    consistency: 'strong'
});
export async function GET({ params, request }) {
    let wasOpen = await store.get('open');
    await store.set('open', new Date(Date.now() + 1000 * 20).toISOString());
    console.log({ open: await store.get('open'), wasOpen });
    return new Response(JSON.stringify({ open: await store.get('open'), wasOpen }));
}
