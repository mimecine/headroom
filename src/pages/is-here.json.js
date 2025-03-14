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
    let openTime = Date.parse((await storage.getItem('open')) + '');
    let expireTime = openTime ? new Date(openTime).getTime() : 0;
    let isOpen = expireTime > Date.now();
    return new Response(JSON.stringify({ isOpen, openTime, expireTime }));
}
