/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { authApi, cartApi, accountApi } from "../api/services";
import { messageFrom } from "../api/client";

export const StoreContext = createContext(null);
const CART_KEY = "anteiku_guest_cart";
const USER_KEY = "anteiku_user";

const read = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};

export function StoreProvider({ children }) {
  const [cart, setCart] = useState(() => read(CART_KEY, []));
  const [user, setUser] = useState(() => read(USER_KEY, null));
  const [theme, setTheme] = useState(() => localStorage.getItem("anteiku_theme") || "light");
  const [syncing, setSyncing] = useState(false);
  const [wishlists, setWishlists] = useState(null);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistError, setWishlistError] = useState("");
  const wishlistRequest = useRef(null);
  const wishlistMutations = useRef(new Map());
  const wishlistMutationQueue = useRef(Promise.resolve());

  useEffect(() => { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem("anteiku_theme", theme); document.documentElement.classList.toggle("dark", theme === "dark"); }, [theme]);
  useEffect(() => {
    const expireSession = () => { setUser(null); setWishlists(null); setWishlistError(""); wishlistRequest.current = null; wishlistMutations.current.clear(); wishlistMutationQueue.current = Promise.resolve(); };
    window.addEventListener("anteiku:session-expired", expireSession);
    return () => window.removeEventListener("anteiku:session-expired", expireSession);
  }, []);

  const loadWishlists = useCallback(() => {
    if (!user) return Promise.reject(new Error("Sign in to view your wishlist."));
    if (wishlistRequest.current) return wishlistRequest.current;
    setWishlistLoading(true);
    setWishlistError("");
    const request = accountApi.wishlists()
      .then((result) => {
        setWishlists(result);
        return result;
      })
      .catch((error) => {
        setWishlistError(messageFrom(error));
        throw error;
      })
      .finally(() => {
        wishlistRequest.current = null;
        setWishlistLoading(false);
      });
    wishlistRequest.current = request;
    return request;
  }, [user]);

  useEffect(() => {
    if (!user) {
      wishlistRequest.current = null;
      return;
    }
    loadWishlists().catch(() => {});
  }, [user, loadWishlists]);

  const addToCart = useCallback((item) => setCart((current) => {
    const existing = current.find((entry) => entry.variantId === item.variantId);
    return existing ? current.map((entry) => entry.variantId === item.variantId ? { ...entry, quantity: entry.quantity + item.quantity } : entry) : [...current, item];
  }), []);
  const updateQuantity = useCallback((variantId, quantity) => setCart((current) => quantity < 1 ? current.filter((item) => item.variantId !== variantId) : current.map((item) => item.variantId === variantId ? { ...item, quantity } : item)), []);
  const removeFromCart = useCallback((variantId) => setCart((current) => current.filter((item) => item.variantId !== variantId)), []);

  const syncCart = useCallback(async () => {
    if (!user || !cart.length) return null;
    setSyncing(true);
    try {
      let remoteCart;
      for (const item of cart) remoteCart = await cartApi.add(item);
      return remoteCart;
    } finally { setSyncing(false); }
  }, [cart, user]);

  const signIn = useCallback(async (credentials) => {
    const signedIn = await authApi.login(credentials);
    if (!signedIn?.accessToken) throw new Error("Login response did not include an access token.");
    localStorage.setItem("anteiku_token", signedIn.accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(signedIn));
    setUser(signedIn);
    return signedIn;
  }, []);
  const signOut = useCallback(() => {
    localStorage.removeItem("anteiku_token");
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setWishlists(null);
    setWishlistError("");
    wishlistRequest.current = null;
    wishlistMutations.current.clear();
    wishlistMutationQueue.current = Promise.resolve();
  }, []);

  const queueWishlistMutation = useCallback((key, operation) => {
    const existing = wishlistMutations.current.get(key);
    if (existing) return existing;

    // Mutations are serialized so two quick saves cannot both create an initial
    // wishlist, or overwrite each other's confirmed server response.
    const request = wishlistMutationQueue.current.then(operation);
    wishlistMutationQueue.current = request.catch(() => {});
    wishlistMutations.current.set(key, request);
    request.then(
      () => wishlistMutations.current.delete(key),
      () => wishlistMutations.current.delete(key),
    );
    return request;
  }, []);

  const addWishlistProduct = useCallback((productId) => {
    const key = `add:${productId}`;
    return queueWishlistMutation(key, async () => {
      const current = await loadWishlists();
      const alreadySaved = current.find((list) => (list.productIds || []).some((id) => String(id) === String(productId)));
      if (alreadySaved) return { wishlist: alreadySaved, alreadySaved: true };

      let updated;
      if (current[0]) {
        updated = await accountApi.addWishlistProduct(current[0].id, productId);
      } else {
        try {
          updated = await accountApi.createWishlist({ name: "My wishlist", description: "Saved products", isPublic: false, productIds: [productId] });
        } catch (error) {
          // Creation and adding are separate backend operations; refresh in case
          // creation succeeded but the follow-up product operation failed.
          await loadWishlists().catch(() => {});
          throw error;
        }
      }
      if (!updated?.id || !Array.isArray(updated.productIds) || !updated.productIds.some((id) => String(id) === String(productId))) {
        throw new Error("The wishlist API did not confirm this product was saved.");
      }
      setWishlists((lists) => lists?.length
        ? lists.map((list) => String(list.id) === String(updated.id) ? updated : list)
        : [updated]);
      setWishlistError("");
      return { wishlist: updated, alreadySaved: false };
    });
  }, [loadWishlists, queueWishlistMutation]);

  const removeWishlistProduct = useCallback((wishlistId, productId) => {
    const key = `remove:${wishlistId}:${productId}`;
    return queueWishlistMutation(key, async () => {
      const updated = await accountApi.removeWishlistProduct(wishlistId, productId);
      if (!updated?.id || String(updated.id) !== String(wishlistId) || !Array.isArray(updated.productIds) || updated.productIds.some((id) => String(id) === String(productId))) {
        throw new Error("The wishlist API did not confirm this product was removed.");
      }
      setWishlists((lists) => (lists || []).map((list) => String(list.id) === String(updated.id) ? updated : list));
      return updated;
    });
  }, [queueWishlistMutation]);

  const isWishlisted = useCallback((productId) => (wishlists || []).some((list) => (list.productIds || []).some((id) => String(id) === String(productId))), [wishlists]);

  const value = useMemo(() => ({ cart, user, theme, syncing, addToCart, updateQuantity, removeFromCart, syncCart, signIn, signOut, setTheme, wishlists, wishlistLoading, wishlistError, loadWishlists, addWishlistProduct, removeWishlistProduct, isWishlisted }), [cart, user, theme, syncing, addToCart, updateQuantity, removeFromCart, syncCart, signIn, signOut, wishlists, wishlistLoading, wishlistError, loadWishlists, addWishlistProduct, removeWishlistProduct, isWishlisted]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
