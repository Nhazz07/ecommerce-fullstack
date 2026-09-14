// src/Context/CartContent.jsx

import React, {
    createContext,
    useContext,
    useState,
} from "react";

import { createCart } from "../Services/cartApi";
import { getVariantsByProductId } from "../Services/productVariantApi";

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);

    const [cartId, setCartId] = useState(
        localStorage.getItem("cartId")
    );

    const [cartToken, setCartToken] = useState(
        localStorage.getItem("cartToken")
    );

    const addToCart = async (product) => {
        try {
            console.log("Product being added:", product);

            if (!product?.id) {
                console.error("Product ID is missing.");
                return;
            }

            console.log("Product ID:", product.id);

            const variants = await getVariantsByProductId(product.id);

            console.log("Product variants:", variants);

            if (!variants || variants.length === 0) {
                console.log("No variant found for this product.");
                return;
            }

            const productVariantId = variants[0].id;

            console.log(
                "Selected Product Variant ID:",
                productVariantId
            );

            const response = await createCart(
                product.id,
                productVariantId,
                1
            );

            const cart = response.data;

            if (!cart) {
                console.error("Cart data is missing:", response);
                return;
            }

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
        if (quantity < 1) {
            return;
        }

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
