import { createStorefrontApiClient } from '@shopify/storefront-api-client';
import { cartCreate, cartLinesAdd, cartLinesUpdate, getCart } from './gqldefs';

let cartId = localStorage.getItem('cartId') || null;
let checkoutUrl = localStorage.getItem('checkoutUrl') || null;
let lines = null;
let cost = null;

const client = createStorefrontApiClient({
    storeDomain: 'http://kioskinkiosk.myshopify.com',
    apiVersion: '2024-10',
    publicAccessToken: '7766fe447c722c1317e528bdc92f1f2d'
});

const initCart = async () => {
    await (async () => {
        const { data, errors, extensions } = await client.request(cartCreate, {
            variables: {
                input: { lines: [] }
            }
        });
        if (errors) {
            console.log('ERR:Create: ', errors);
            return;
        }
        cartId = data.cartCreate.cart.id;
        localStorage.setItem('cartId', cartId);
        checkoutUrl = data.cartCreate.cart.checkoutUrl;
        localStorage.setItem('checkoutUrl', checkoutUrl);
        return cartId;
    })();
};

const fetchCart = async () => {
    if (!cartId || !checkoutUrl) {
        await initCart();
    }
    if (!cartId || !checkoutUrl) {
        return;
    }
    await (async () => {
        const { data, errors, extensions } = await client.request(getCart, {
            variables: {
                cartId
            }
        });
        if (errors) {
            console.log('ERR:Get: ', errors);
            return false;
        }
        cartId = data.cart.id;
        localStorage.setItem('cartId', cartId);
        checkoutUrl = data.cart.checkoutUrl;
        localStorage.setItem('checkoutUrl', checkoutUrl);
        lines = data.cart.lines.edges.map((line) => line.node);
        cost = data.cart.cost.totalAmount.amount;
        console.log('Cart fetched - cartId: ', cartId);
        return cartId;
    })();
};

await fetchCart();

const Cart = await (async (client) => {
    return await (async () => {
        return {
            get lines() {
                return lines;
            },
            get cost() {
                return cost;
            },
            addItem: async (merchandiseId, quantity = 1) => {
                const { data, errors, extensions } = await client.request(cartLinesAdd, {
                    variables: {
                        cartId,
                        lines: [
                            {
                                merchandiseId,
                                quantity
                            }
                        ]
                    }
                });
                if (errors) {
                    console.log('ERR:addVariant: ', errors);
                    return false;
                }
                lines = data.cartLinesAdd.cart.lines.edges.map((line) => line.node);
                cost = data.cartLinesAdd.cart.cost.totalAmount.amount;
                return { lines, cost };
            },
            removeItem: async (merchandiseId, quantity = 1) => {
                let line = lines.find((line) => line.merchandise.id === merchandiseId);
                const { data, errors, extensions } = await client.request(cartLinesUpdate, {
                    variables: {
                        cartId,
                        lines: [
                            {
                                id: line.id,
                                quantity: line.quantity - quantity
                            }
                        ]
                    }
                });
                if (errors) {
                    console.log('ERR:decreaseItem: ', errors);
                    return false;
                }
                lines = data.cartLinesUpdate.cart.lines.edges.map((line) => line.node);
                cost = data.cartLinesUpdate.cart.cost.totalAmount.amount;
                return { lines, cost };
            },
            clearItem: async (merchandiseId) => {
                let line = lines.find((line) => line.merchandise.id === merchandiseId);
                const { data, errors, extensions } = await client.request(cartLinesUpdate, {
                    variables: {
                        cartId,
                        lines: [
                            {
                                id: line.id,
                                quantity: 0
                            }
                        ]
                    }
                });
                if (errors) {
                    console.log('ERR:decreaseItem: ', errors);
                    return false;
                }
                lines = data.cartLinesUpdate.cart.lines.edges.map((line) => line.node);
                cost = data.cartLinesUpdate.cart.cost.totalAmount.amount;
                return { lines, cost };
            },
            clearCart: async () => {
                localStorage.removeItem('cartId');
                localStorage.removeItem('checkoutUrl');
                cartId = null;
                checkoutUrl = null;
                return await fetchCart();
            },
            checkoutUrl,
            cartId,
            fetchCart,
            initCart
        };
    })();
})(client);

console.log('Cart: ', cartId, checkoutUrl, lines, cost);

export default Cart;
