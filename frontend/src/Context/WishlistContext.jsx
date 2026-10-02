import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    getMyWishlists,
    createWishlist,
    addProductToWishlist,
    removeProductFromWishlist,
} from "../Services/wishlistApi";

import { useAuth } from "./AuthContext";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();

    const [wishlist, setWishlist] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            setWishlist(null);
            return;
        }

        loadWishlist();
    }, [isAuthenticated]);

    const loadWishlist = async () => {
        try {
            setLoading(true);

            const response = await getMyWishlists();

            const wishlists = response?.data || [];

            setWishlist(wishlists[0] || null);
        } catch (error) {
            console.error(
                "Failed to load wishlist:",
                error.response?.data || error
            );

            setWishlist(null);
        } finally {
            setLoading(false);
        }
    };

    const addToWishlist = async (product) => {
        if (!isAuthenticated) {
            return {
                requiresLogin: true,
            };
        }

        try {
            let currentWishlist = wishlist;

            // No wishlist exists yet
            if (!currentWishlist) {
                const response = await createWishlist({
                    name: "My Wishlist",
                    description: "My favorite AniStore products",
                    isPublic: false,
                    productIds: [product.id],
                });

                currentWishlist = response?.data;

                setWishlist(currentWishlist);

                return {
                    success: true,
                    added: true,
                };
            }

            // Already in wishlist
            if (
                currentWishlist.productIds?.includes(
                    product.id
                )
            ) {
                return {
                    success: true,
                    added: false,
                    alreadyExists: true,
                };
            }

            const updatedWishlist =
                await addProductToWishlist(
                    currentWishlist.id,
                    product.id
                );

            setWishlist(updatedWishlist);

            return {
                success: true,
                added: true,
            };
        } catch (error) {
            console.error(
                "Failed to add wishlist item:",
                error.response?.data || error
            );

            throw error;
        }
    };

    const removeFromWishlist = async (productId) => {
        if (!wishlist) {
            return;
        }

        try {
            const updatedWishlist =
                await removeProductFromWishlist(
                    wishlist.id,
                    productId
                );

            setWishlist(updatedWishlist);
        } catch (error) {
            console.error(
                "Failed to remove wishlist item:",
                error.response?.data || error
            );

            throw error;
        }
    };

    const isInWishlist = (productId) => {
        return (
            wishlist?.productIds?.includes(productId) ||
            false
        );
    };

    return (
        <WishlistContext.Provider
            value={{
                wishlist,
                loading,
                addToWishlist,
                removeFromWishlist,
                isInWishlist,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    return useContext(WishlistContext);
};
