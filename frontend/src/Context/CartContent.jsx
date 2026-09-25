

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    createCart,
    updateCart,
} from "../Services/cartApi";

import { getVariantsByProductId } from "../Services/productVariantApi";

const CartContext = createContext();

export function CartProvider({ children }) {
    /*
     * Load cart items from localStorage
     * when the app starts.
     */
    const [cartItems, setCartItems] = useState(() => {
        const savedCartItems =
            localStorage.getItem("cartItems");

        return savedCartItems
            ? JSON.parse(savedCartItems)
            : [];
    });

    /*
     * Load cart ID from localStorage.
     */
    const [cartId, setCartId] = useState(
        localStorage.getItem("cartId")
    );

    /*
     * Load cart token from localStorage.
     */
    const [cartToken, setCartToken] = useState(
        localStorage.getItem("cartToken")
    );

    /*
     * Save cart items whenever they change.
     */
    useEffect(() => {
        localStorage.setItem(
            "cartItems",
            JSON.stringify(cartItems)
        );
    }, [cartItems]);

    /*
     * Add product to cart.
     *
     * ProductCard:
     *     addToCart(product)
     *
     * ProductDetail:
     *     addToCart(product, selectedVariant, quantity)
     */
    const addToCart = async (
        product,
        selectedVariant = null,
        quantity = 1
    ) => {
        try {
            console.log(
                "Product being added:",
                product
            );

            /*
             * Validate product.
             */
            if (!product?.id) {
                console.error(
                    "Product ID is missing."
                );

                return false;
            }

            /*
             * If no variant was provided,
             * get the variants from the backend.
             */
            if (!selectedVariant) {
                console.log(
                    "No variant provided. Fetching product variants..."
                );

                const variants =
                    await getVariantsByProductId(
                        product.id
                    );

                console.log(
                    "Product variants:",
                    variants
                );

                if (
                    !variants ||
                    variants.length === 0
                ) {
                    console.error(
                        "No variant found for this product."
                    );

                    return false;
                }

                /*
                 * Use the first variant when
                 * ProductCard adds the product.
                 */
                selectedVariant =
                    variants[0];

                console.log(
                    "Automatically selected variant:",
                    selectedVariant
                );
            }

            /*
             * Validate selected variant.
             */
            if (!selectedVariant?.id) {
                console.error(
                    "Product variant ID is missing."
                );

                return false;
            }

            /*
             * Validate quantity.
             */
            if (quantity < 1) {
                console.error(
                    "Quantity must be at least 1."
                );

                return false;
            }

            console.log(
                "Product ID:",
                product.id
            );

            console.log(
                "Product Variant ID:",
                selectedVariant.id
            );

            console.log(
                "Quantity:",
                quantity
            );

            console.log(
                "Cart token:",
                cartToken
            );

            /*
             * Create/update cart on backend.
             */
            const response = await createCart(
                product.id,
                selectedVariant.id,
                quantity,
                cartToken
            );

            console.log(
                "Cart API response:",
                response
            );

            /*
             * Extract actual cart.
             */
            const cart = response?.data;

            console.log(
                "Actual cart:",
                cart
            );

            if (!cart) {
                console.error(
                    "Cart data is missing:",
                    response
                );

                return false;
            }

            /*
             * Save cart ID.
             */
            setCartId(cart.id);

            localStorage.setItem(
                "cartId",
                cart.id
            );

            /*
             * Save cart token.
             */
            setCartToken(
                cart.cartToken
            );

            localStorage.setItem(
                "cartToken",
                cart.cartToken
            );

            /*
             * Use the complete cart returned
             * by the backend.
             */
            setCartItems(
                cart.items || []
            );

            console.log(
                "Cart added successfully:",
                cart
            );

            return true;

        } catch (error) {
            console.error(
                "Failed to add product to cart:",
                error.response?.data ||
                    error.message
            );

            return false;
        }
    };

    /*
     * Remove item from cart.
     *
     * For now this only changes the frontend.
     * We will connect backend delete/remove
     * after quantity update is confirmed working.
     */
    const removeFromCart = (productId) => {
        setCartItems((previousItems) =>
            previousItems.filter(
                (item) =>
                    item.id !== productId
            )
        );
    };

    /*
     * Update item quantity.
     */
    const updateQuantity = async (
        productId,
        quantity
    ) => {
        /*
         * Quantity cannot be less than 1.
         */
        if (quantity < 1) {
            return;
        }

        try {
            /*
             * Find the cart item.
             */
            const item = cartItems.find(
                (item) =>
                    item.id === productId
            );

            if (!item) {
                console.error(
                    "Cart item not found:",
                    productId
                );

                return;
            }

            console.log(
                "Cart item being updated:",
                item
            );

            /*
             * Get product ID.
             */
            const productIdValue =
                item.productId ||
                item.product?.id;

            /*
             * Get product variant ID.
             */
            const productVariantId =
                item.productVariantId ||
                item.productVariant?.id ||
                item.variant?.id;

            /*
             * Validate product ID.
             */
            if (!productIdValue) {
                console.error(
                    "Product ID is missing from cart item:",
                    item
                );

                return;
            }

            /*
             * Validate variant ID.
             */
            if (!productVariantId) {
                console.error(
                    "Product variant ID is missing from cart item:",
                    item
                );

                return;
            }

            /*
             * Validate cart ID.
             */
            if (!cartId) {
                console.error(
                    "Cart ID is missing."
                );

                return;
            }

            console.log(
                "Updating cart:",
                {
                    cartId,
                    productId:
                        productIdValue,
                    productVariantId,
                    quantity,
                }
            );

            /*
             * Send update to backend.
             */
            const response =
                await updateCart(
                    cartId,
                    productIdValue,
                    productVariantId,
                    quantity,
                    cartToken
                );

            console.log(
                "Updated cart response:",
                response
            );

            /*
             * Extract actual cart.
             */
            const cart =
                response?.data;

            if (!cart) {
                console.error(
                    "Updated cart data is missing:",
                    response
                );

                return;
            }

            /*
             * Update cart items using
             * backend response.
             */
            setCartItems(
                cart.items || []
            );

            /*
             * Keep cart ID synchronized.
             */
            setCartId(cart.id);

            localStorage.setItem(
                "cartId",
                cart.id
            );

            /*
             * Keep cart token synchronized.
             */
            setCartToken(
                cart.cartToken
            );

            localStorage.setItem(
                "cartToken",
                cart.cartToken
            );

            console.log(
                "Cart quantity updated successfully."
            );

        } catch (error) {
            console.error(
                "Failed to update cart:",
                error.response?.data ||
                    error.message
            );
        }
    };

    /*
     * Calculate total number of items
     * in the cart.
     */
    const cartCount = cartItems.reduce(
        (total, item) =>
            total +
            Number(item.quantity || 0),
        0
    );

    return (
        <CartContext.Provider
            value={{
                cartItems,
                cartId,
                cartToken,
                addToCart,
                removeFromCart,
                updateQuantity,
                cartCount,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
