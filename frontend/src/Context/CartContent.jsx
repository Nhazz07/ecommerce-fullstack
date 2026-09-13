

import React, { createContext, useContext, useState } from "react";
import { createCart } from "../Services/cartApi";

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);
    const [cartId, setCartId] = useState(
        localStorage.getItem("cartId")
    );
    const [cartToken, setCartToken] = useState(
        localStorage.getItem("cartToken")
    );

    const addToCart = async (product, productVariantId) => {
        try {
            console.log("Product being added:", product);
            console.log("Product ID:", product.id);
            console.log("Product Variant ID:", productVariantId);

            if (!product?.id) {
                console.error("Product ID is missing.");
                return;
            }

            if (!productVariantId) {
                console.error("Product Variant ID is missing.");
                return;
            }

            const response = await createCart(
                product.id,
                productVariantId,
                1
            );

            const cart = response.data;

            setCartId(cart.id);
            setCartToken(cart.cartToken);
            setCartItems(cart.items || []);

            localStorage.setItem("cartId", cart.id);
            localStorage.setItem("cartToken", cart.cartToken);

            console.log("Cart added successfully:", cart);
        } catch (error) {
            console.error(
                "Failed to add product to cart:",
                error.response?.data || error.message
            );
        }
    };

    const removeFromCart = (productId) => {
        setCartItems((prevItems) =>
            prevItems.filter((item) => item.id !== productId)
        );
    };

    const updateQuantity = (productId, quantity) => {
        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.id === productId
                    ? { ...item, quantity }
                    : item
            )
        );
    };

    const cartCount = cartItems.reduce(
        (total, item) => total + item.quantity,
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
