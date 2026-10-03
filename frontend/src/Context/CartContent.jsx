import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    createCart,
    updateCart,
    removeCartItem,
} from "../Services/cartApi";

import { getVariantsByProductId } from "../Services/productVariantApi";

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState(() => {
        const savedCartItems =
            localStorage.getItem("cartItems");

        return savedCartItems
            ? JSON.parse(savedCartItems)
            : [];
    });

    const [cartId, setCartId] = useState(
        localStorage.getItem("cartId")
    );

    const [cartToken, setCartToken] = useState(() => {
        const token = localStorage.getItem("cartToken");

        // Prevent the string "null" from being treated as a token
        return token && token !== "null"
            ? token
            : null;
    });

    /*
     * SAVE CART ITEMS
     */
    useEffect(() => {
        localStorage.setItem(
            "cartItems",
            JSON.stringify(cartItems)
        );
    }, [cartItems]);

    /*
     * ADD TO CART
     */
    const addToCart = async (
        product,
        selectedVariant = null,
        quantity = 1
    ) => {
        try {
            if (!product?.id) {
                console.error(
                    "Product ID is missing."
                );
                return false;
            }

            /*
             * Get first variant if no variant
             * was selected.
             */
            if (!selectedVariant) {
                const variants =
                    await getVariantsByProductId(
                        product.id
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

                selectedVariant = variants[0];
            }

            if (!selectedVariant?.id) {
                console.error(
                    "Product variant ID is missing."
                );
                return false;
            }

            if (quantity < 1) {
                return false;
            }

            /*
             * Send cart request.
             *
             * cartToken can be null for
             * authenticated users.
             */
            const response = await createCart(
                product.id,
                selectedVariant.id,
                quantity,
                cartToken
            );

            const cart = response?.data;

            if (!cart) {
                console.error(
                    "Cart data is missing:",
                    response
                );
                return false;
            }

            /*
             * Update cart state.
             */
            setCartId(cart.id);
            setCartItems(cart.items || []);

            /*
             * Only use cartToken when the
             * backend actually returns one.
             */
            const newCartToken =
                cart.cartToken ?? null;

            setCartToken(newCartToken);

            /*
             * Save cart ID.
             */
            if (cart.id != null) {
                localStorage.setItem(
                    "cartId",
                    cart.id
                );
            }

            /*
             * Save/remove cart token safely.
             */
            if (newCartToken) {
                localStorage.setItem(
                    "cartToken",
                    newCartToken
                );
            } else {
                localStorage.removeItem(
                    "cartToken"
                );
            }

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
     * UPDATE QUANTITY
     */
    const updateQuantity = async (
        cartItemId,
        quantity
    ) => {
        if (quantity < 1) {
            return;
        }

        try {
            const item = cartItems.find(
                (item) =>
                    item.id === cartItemId
            );

            if (!item) {
                console.error(
                    "Cart item not found:",
                    cartItemId
                );
                return;
            }

            if (!cartId) {
                console.error(
                    "Cart ID is missing."
                );
                return;
            }

            const response = await updateCart(
                cartId,
                item.productId,
                item.productVariantId,
                quantity,
                cartToken
            );

            const cart = response?.data;

            if (!cart) {
                console.error(
                    "Updated cart data is missing:",
                    response
                );
                return;
            }

            setCartItems(cart.items || []);
            setCartId(cart.id);

            /*
             * Handle nullable cartToken.
             */
            const newCartToken =
                cart.cartToken ?? null;

            setCartToken(newCartToken);

            /*
             * Save cart ID.
             */
            if (cart.id != null) {
                localStorage.setItem(
                    "cartId",
                    cart.id
                );
            }

            /*
             * Save/remove cart token.
             */
            if (newCartToken) {
                localStorage.setItem(
                    "cartToken",
                    newCartToken
                );
            } else {
                localStorage.removeItem(
                    "cartToken"
                );
            }
        } catch (error) {
            console.error(
                "Failed to update cart:",
                error.response?.data ||
                    error.message
            );
        }
    };

    /*
     * REMOVE ITEM
     */
    const removeFromCart = async (
        cartItemId
    ) => {
        try {
            const item = cartItems.find(
                (item) =>
                    item.id === cartItemId
            );

            if (!item) {
                console.error(
                    "Cart item not found:",
                    cartItemId
                );
                return;
            }

            if (!cartId) {
                console.error(
                    "Cart ID is missing."
                );
                return;
            }

            if (!item.productVariantId) {
                console.error(
                    "Product variant ID is missing:",
                    item
                );
                return;
            }

            const response =
                await removeCartItem(
                    cartId,
                    item.productVariantId,
                    cartToken
                );

            const cart = response?.data;

            if (!cart) {
                console.error(
                    "Updated cart data is missing:",
                    response
                );
                return;
            }

            setCartItems(
                cart.items || []
            );

            setCartId(cart.id);

            /*
             * Handle nullable cartToken.
             */
            const newCartToken =
                cart.cartToken ?? null;

            setCartToken(newCartToken);

            /*
             * Save cart ID.
             */
            if (cart.id != null) {
                localStorage.setItem(
                    "cartId",
                    cart.id
                );
            }

            /*
             * Save/remove cart token.
             */
            if (newCartToken) {
                localStorage.setItem(
                    "cartToken",
                    newCartToken
                );
            } else {
                localStorage.removeItem(
                    "cartToken"
                );
            }
        } catch (error) {
            console.error(
                "Failed to remove cart item:",
                error.response?.data ||
                    error.message
            );
        }
    };

    /*
     * CLEAR CART
     */
    const clearCart = () => {
        setCartItems([]);
        setCartId(null);
        setCartToken(null);

        localStorage.removeItem(
            "cartItems"
        );

        localStorage.removeItem(
            "cartId"
        );

        localStorage.removeItem(
            "cartToken"
        );
    };

    /*
     * CART COUNT
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
                updateQuantity,
                removeFromCart,
                clearCart,
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
