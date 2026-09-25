// src/Context/CartContent.jsx

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

    const [cartToken, setCartToken] = useState(
        localStorage.getItem("cartToken")
    );

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

            setCartId(cart.id);
            setCartToken(cart.cartToken);
            setCartItems(cart.items || []);

            localStorage.setItem(
                "cartId",
                cart.id
            );

            localStorage.setItem(
                "cartToken",
                cart.cartToken
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
            setCartToken(cart.cartToken);

            localStorage.setItem(
                "cartId",
                cart.id
            );

            localStorage.setItem(
                "cartToken",
                cart.cartToken
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
            setCartToken(
                cart.cartToken
            );

            localStorage.setItem(
                "cartId",
                cart.id
            );

            localStorage.setItem(
                "cartToken",
                cart.cartToken
            );
        } catch (error) {
            console.error(
                "Failed to remove cart item:",
                error.response?.data ||
                    error.message
            );
        }
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
