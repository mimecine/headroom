export const prerender = false;
import { getStore } from '@netlify/blobs';

export async function GET() {
    let number = Math.random();
    const store = getStore({
        name: 'door',
        consistency: 'strong'
    });
    let expireTime = new Date(await store.get('open')).getTime();
    let isOpen = expireTime > Date.now();

    return new Response(
        JSON.stringify({
            number,
            message: `Here's a random number: ${isOpen}`,
            cwd: process.cwd()
        })
    );
}
