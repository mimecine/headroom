// import { getStore } from '@netlify/blobs';
import { createStorage } from 'unstorage';
import netlifyBlobsDriver from 'unstorage/drivers/netlify-blobs';

export const prerender = false;

// const store = getStore({
//     name: 'door',
//     consistency: 'strong'
// });
const storage = createStorage({
    driver: netlifyBlobsDriver({
        name: 'door'
        // url: 'https://blobs.netlify.com/v1',
        // token: process.env.NETLIFY_BLOBS_TOKEN,
        // prefix: 'door'
    })
});

export async function GET({ params, request }) {
    // let wasOpen = await store.get('open');
    let wasOpen = await storage.getItem('open');
    await storage.setItem('open', new Date(Date.now() + 1000 * 20).toISOString());
    console.log({ open: await storage.getItem('open'), wasOpen });
    return new Response(JSON.stringify({ open: await storage.getItem('open'), wasOpen }));
}
