const gql = String.raw;

const cartCreate = gql`
    mutation cartCreate($input: CartInput!) {
        cartCreate(input: $input) {
            cart {
                id
                checkoutUrl
                totalQuantity
            }
            userErrors {
                message
                code
                field
            }
        }
    }
`;

const cartLinesAdd = gql`
    mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
            cart {
                id
                checkoutUrl
                totalQuantity
                lines(first: 100) {
                    edges {
                        node {
                            id
                            quantity
                            merchandise {
                                ... on ProductVariant {
                                    id
                                    title
                                    price {
                                        amount
                                        currencyCode
                                    }
                                    product {
                                        title
                                    }
                                    image {
                                        url(transform: { maxHeight: 300, crop: CENTER, maxWidth: 300 })
                                    }
                                }
                            }
                            cost {
                                totalAmount {
                                    amount
                                }
                            }
                        }
                    }
                }
                cost {
                    totalAmount {
                        amount
                        currencyCode
                    }
                    totalTaxAmount {
                        amount
                    }
                }
            }
        }
    }
`;

const cartLinesUpdate = gql`
    mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
            cart {
                id
                checkoutUrl
                totalQuantity
                lines(first: 100) {
                    edges {
                        node {
                            id
                            quantity
                            merchandise {
                                ... on ProductVariant {
                                    id
                                    title
                                    price {
                                        amount
                                        currencyCode
                                    }
                                    product {
                                        title
                                    }
                                    image {
                                        url(transform: { maxHeight: 300, crop: CENTER, maxWidth: 300 })
                                    }
                                }
                            }
                            cost {
                                totalAmount {
                                    amount
                                    currencyCode
                                }
                            }
                        }
                    }
                }
                cost {
                    totalAmount {
                        amount
                        currencyCode
                    }
                    totalTaxAmount {
                        amount
                    }
                }
            }
        }
    }
`;

const getCart = gql`
    query getCart($cartId: ID!) {
        cart(id: $cartId) {
            id
            checkoutUrl
            totalQuantity
            lines(first: 100) {
                edges {
                    node {
                        id
                        quantity
                        merchandise {
                            ... on ProductVariant {
                                id
                                title
                                price {
                                    amount
                                    currencyCode
                                }
                                product {
                                    title
                                }
                                image {
                                    url(transform: { maxHeight: 300, crop: CENTER, maxWidth: 300 })
                                }
                            }
                        }
                        cost {
                            totalAmount {
                                amount
                                currencyCode
                            }
                        }
                    }
                }
            }
            cost {
                totalAmount {
                    amount
                    currencyCode
                }
                totalTaxAmount {
                    amount
                }
            }
        }
    }
`;

const getProductsByCollection = gql`
    query getProductsByColHandle($handle: String!) {
        collection(handle: $handle) {
            id
            title
            descriptionHtml
            products(first: 150) {
                edges {
                    node {
                        id
                        title
                        featuredImage {
                            url(transform: { maxHeight: 300, crop: CENTER, maxWidth: 300 })
                        }
                        variants(first: 10) {
                            edges {
                                node {
                                    id
                                    title
                                    availableForSale
                                    quantityAvailable
                                    price {
                                        amount
                                        currencyCode
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
`;

export { cartCreate, cartLinesAdd, cartLinesUpdate, getCart, getProductsByCollection };
