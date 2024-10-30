// import type { Alpine } from 'alpinejs';

import { createStorefrontApiClient } from '@shopify/storefront-api-client';
import { cartCreate, cartLinesAdd, cartLinesUpdate, getCart, getProductsByCollection } from './assets/gqldefs.js';
import Cart from './assets/cart.js';
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

const getProducts = async (handle) => {
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
    return products;
};

const msg = 'hey';

export default (Alpine) => {
    Alpine.plugin(persist);
    Alpine.plugin(component);
    const obj = {
        open: false,
        child: { msg1: 'hey', msg2: 'ho' },
        toggle() {
            this.open = !this.open;
        }
    };
    Alpine.store('obj', obj);
    console.log('WHOHAA');
    Alpine.store('Cart', Cart);
    Alpine.data('test', () => {
        return {
            msg: 'hey',
            open: false,
            Cart: Cart,
            obj: obj,
            toggle() {
                this.Cart.toggle();
                //                this.open = !this.open;
            }
        };
    });

    Alpine.store('globalCart', {
        checkoutUrl: null,
        cartId: null,
        cost: null,
        lines: [],
        open: false,
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
                localStorage.setItem('cartId', this.cartId);
                this.checkoutUrl = data.cart.checkoutUrl;
                localStorage.setItem('checkoutUrl', this.checkoutUrl);
                this.lines = data.cart.lines.edges.map((line) => line.node);
                this.cost = data.cart.cost.totalAmount.amount;
                console.log('Cart fetched - cartId: ', this.cartId, this.checkoutUrl, this.cost);
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
            this.lines = data.cartLinesAdd.cart.lines.edges.map((line) => line.node);
            this.cost = data.cartLinesAdd.cart.cost.totalAmount.amount;
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
            this.lines = data.cartLinesAdd.cart.lines.edges.map((line) => line.node);
            this.cost = data.cartLinesAdd.cart.cost.totalAmount.amount;
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

    return {
        getproducts: Alpine.data('getproducts', (handle = 'things') => ({
            Cart: Cart,
            dopen: false,
            msg: msg,
            products: [],
            async init() {
                this.dopen = true;
                this.products = await getProducts(handle);
            },
            toggle() {
                this.dopen = !this.dopen;
            }
        })),
        getcart: Alpine.data('getcart', () => {
            let cartId = localStorage.getItem('cartId') || null;
            let checkoutUrl = localStorage.getItem('checkoutUrl') || null;
            let lines = [];
            let cost = null;

            const client = createStorefrontApiClient({
                storeDomain: 'http://kioskinkiosk.myshopify.com',
                apiVersion: '2024-10',
                publicAccessToken: '7766fe447c722c1317e528bdc92f1f2d'
            });

            const initCart = async () => {
                const { data, errors } = await client.request(cartCreate, {
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
            };

            const fetchCart = async () => {
                if (!cartId || !checkoutUrl) {
                    await initCart();
                }
                if (!cartId || !checkoutUrl) {
                    return;
                }
                const { data, errors } = await client.request(getCart, {
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
            };

            fetchCart();

            return {
                open: false,
                toggle() {
                    this.open = !this.open;
                },
                lines: lines,
                cost: cost,
                addItem: async (merchandiseId, quantity = 1) => {
                    const { data, errors } = await client.request(cartLinesAdd, {
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
                    const { data, errors } = await client.request(cartLinesUpdate, {
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
                    const { data, errors } = await client.request(cartLinesUpdate, {
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
        }),
        globalcart: Alpine.data('globalcart', () => ({
            globalCart: Cart
        }))
    };
};
