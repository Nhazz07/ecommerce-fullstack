// src/Context/CartContent.jsx

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import { createCart } from "../Services/cartApi";
import { getVariantsByProductId } from "../Services/productVariantApi";

const CartContext = createContext();

export function CartProvider({ children }) {
    /*
     * Load cart items from localStorage when the app starts.
     */
    const [cartItems, setCartItems] = useState(() => {
        const savedCartItems = localStorage.getItem("cartItems");

        return savedCartItems
            ? JSON.parse(savedCartItems)
            : [];
    });

    /*
     * Load cart ID and cart token from localStorage.
     */
    const [cartId, setCartId] = useState(
        localStorage.getItem("cartId")
    );

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

            /*
             * Send the existing cart token to the backend.
             * If there is no token, the backend creates a new cart.
             */
            console.log("Cart token being sent:", cartToken);

            const response = await createCart(
                product.id,
                productVariantId,
                1,
                cartToken
            );

            /*
             * createCart() returns response.data from Axios.
             * Therefore, the actual cart is response.data.
             */
            const cart = response.data;

            if (!cart) {
                console.error("Cart data is missing:", response);
                return;
            }

            /*
             * Save the latest cart ID and token.
             */
            setCartId(cart.id);
            setCartToken(cart.cartToken);

            localStorage.setItem("cartId", cart.id);
            localStorage.setItem("cartToken", cart.cartToken);

            /*
             * Use the complete cart items returned by the backend.
             * Do not manually merge quantities because the backend
             * already calculates the updated quantity.
             */
            setCartItems(cart.items || []);

            console.log("Cart added successfully:", cart);
        } catch (error) {
            console.error(
                "Failed to add product to cart:",
                error.response?.data || error.message
            );
        }
    };

    const removeFromCart = (productId) => {
        setCartItems((previousItems) =>
            previousItems.filter(
                (item) => item.id !== productId
            )
        );
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity < 1) {
            return;
        }

        setCartItems((previousItems) =>
            previousItems.map((item) =>
                item.id === productId
                    ? {
                          ...item,
                          quantity,
                      }
                    : item
            )
        );
    };

    const cartCount = cartItems.reduce(
        (total, item) =>
            total + Number(item.quantity || 0),
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
