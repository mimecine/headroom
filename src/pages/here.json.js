// import { getStore } from '@netlify/blobs';
import { createStorage } from 'unstorage';
import netlifyBlobsDriver from 'unstorage/drivers/netlify-blobs';

export const prerender = false;

const storage = createStorage({
    driver: netlifyBlobsDriver({
        name: 'door',
        consistency: 'strong'
    })
});

export async function GET({ params, request }) {
    // let wasOpen = await store.get('open');
    let wasOpen = await storage.getItem('open');
    await storage.setItem('open', new Date(Date.now() + 1000 * 20).toISOString());
    console.log({ open: await storage.getItem('open'), wasOpen });
    return new Response(JSON.stringify({ open: await storage.getItem('open'), wasOpen }));
}
