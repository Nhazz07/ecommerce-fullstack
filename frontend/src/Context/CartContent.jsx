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
             *
             * This keeps ProductCard working
             * exactly like before.
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
             * createCart() returns:
             *
             * {
             *     success: true,
             *     message: "...",
             *     data: {
             *         id: ...,
             *         cartToken: "...",
             *         items: [...]
             *     }
             * }
             *
             * Therefore:
             * response.data = actual cart
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
             * Extract the actual cart.
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
    const updateQuantity = (
        productId,
        quantity
    ) => {
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
