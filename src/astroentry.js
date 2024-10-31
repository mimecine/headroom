// import type { Alpine } from 'alpinejs';

import { createStorefrontApiClient } from '@shopify/storefront-api-client';
import { cartCreate, cartLinesAdd, cartLinesUpdate, getCart, getProductsByCollection } from './assets/gqldefs';
import persist from '@alpinejs/persist';
import component from 'alpinejs-component';

const client = createStorefrontApiClient({
    storeDomain: 'http://kioskinkiosk.myshopify.com',
    apiVersion: '2024-10',
    publicAccessToken: '7766fe447c722c1317e528bdc92f1f2d'
});

document.addEventListener('alpine:init', () => {
    console.log('Alpine.js is ready!');
});

const getCollection = async (handle) => {
    const { data, errors, extensions } = await client.request(getProductsByCollection, {
        variables: {
            handle
        }
    });
    if (errors) {
        console.log('ERR:Get: ', errors);
        return false;
    }
    let products = data.collection.products.edges.map(({ node }) => {
        node.variants = [...node.variants.edges.map(({ node }) => node)];
        return node;
    });
    return {
        products,
        title: data.collection.title,
        descriptionHtml: data.collection.descriptionHtml
    };
};

export default (Alpine) => {
    Alpine.plugin(persist);
    Alpine.plugin(component);
    Alpine.data('getCollection', (handle = 'things') => ({
        products: [],
        title: '',
        descriptionHtml: '',
        async init() {
            let { products, title, descriptionHtml } = await getCollection(handle);
            this.products = products;
            this.title = title;
            this.descriptionHtml = descriptionHtml;
        }
    }));
    Alpine.store('products', []);
    Alpine.store('globalCart', {
        checkoutUrl: null,
        cartId: null,
        cost: null,
        lines: [],
        open: false,
        totalQuantity: null,
        toggle() {
            this.open = !this.open;
        },
        async init() {
            console.log('localStorage.getItem at fetch', localStorage.getItem('cartId'), this.cartId, this.checkoutUrl);
            await this.fetchCart();
            console.log('localStorage.getItem after fetch', localStorage.getItem('cartId'), this.cartId, this.checkoutUrl);
        },
        async createCart() {
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
                console.log('cartId', this.cartId);
                this.cartId = data.cartCreate.cart.id;
                localStorage.setItem('cartId', this.cartId);
                this.checkoutUrl = data.cartCreate.cart.checkoutUrl;
                localStorage.setItem('checkoutUrl', this.checkoutUrl);
                return this.cartId;
            })();
        },
        async fetchCart() {
            this.cartId = localStorage.getItem('cartId');
            this.checkoutUrl = localStorage.getItem('checkoutUrl');
            if (!this.cartId || !this.checkoutUrl) {
                await this.createCart();
            }
            if (!this.cartId || !this.checkoutUrl) {
                return null;
            }
            await (async () => {
                const { data, errors, extensions } = await client.request(getCart, {
                    variables: {
                        cartId: this.cartId
                    }
                });
                if (errors) {
                    console.log('ERR:Get: ', errors);
                    return false;
                }
                this.cartId = data.cart.id;
                this.checkoutUrl = data.cart.checkoutUrl;
                this.lines = data.cart.lines.edges.map((line) => line.node);
                this.cost = data.cart.cost.totalAmount.amount;
                this.totalQuantity = data.cart.totalQuantity;
                console.log('Cart fetched: ', this.cartId, this.checkoutUrl, this.cost, this.lines, data.cart);
                return { lines: this.lines, cost: this.cost };
            })();
        },
        async addItem(merchandiseId, quantity = 1) {
            const { data, errors } = await client.request(cartLinesAdd, {
                variables: {
                    cartId: this.cartId,
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
            this.lines = data.cartLinesAdd.cart.lines.edges.map((line) => line.node);
            this.cost = data.cartLinesAdd.cart.cost.totalAmount.amount;
            console.log('qty', data.cartLinesAdd.cart.id);
            // this.totalQuantity = data.cartLinesAdd.cart.totalQuantity;

            return { lines: this.lines, cost: this.cost };
        },
        async removeItem(merchandiseId, quantity = 1) {
            let line = this.lines.find((line) => line.merchandise.id === merchandiseId);
            const { data, errors } = await client.request(cartLinesUpdate, {
                variables: {
                    cartId: this.cartId,
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
            this.lines = data.cartLinesUpdate.cart.lines.edges.map((line) => line.node);
            this.cost = data.cartLinesUpdate.cart.cost.totalAmount.amount;
            this.totalQuantity = data.cartLinesUpdate.cart.totalQuantity;
            return { lines: this.lines, cost: this.cost };
        },
        async clearItem(merchandiseId) {
            let line = lines.find((line) => line.merchandise.id === merchandiseId);
            const { data, errors } = await client.request(cartLinesUpdate, {
                variables: {
                    cartId: this.cartId,
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
            this.lines = data.cartLinesUpdate.cart.lines.edges.map((line) => line.node);
            this.cost = data.cartLinesUpdate.cart.cost.totalAmount.amount;
            this.totalQuantity = data.cartLinesUpdate.cart.totalQuantity;
            return { lines: this.lines, cost: this.cost };
        },
        async clearCart() {
            localStorage.removeItem('cartId');
            localStorage.removeItem('checkoutUrl');
            this.cartId = null;
            this.checkoutUrl = null;
            return await this.init();
        }
    });
};