/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { authApi, cartApi } from "../api/services";

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

  useEffect(() => { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem("anteiku_theme", theme); document.documentElement.classList.toggle("dark", theme === "dark"); }, [theme]);
  useEffect(() => {
    const expireSession = () => setUser(null);
    window.addEventListener("anteiku:session-expired", expireSession);
    return () => window.removeEventListener("anteiku:session-expired", expireSession);
  }, []);

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
  const signOut = useCallback(() => { localStorage.removeItem("anteiku_token"); localStorage.removeItem(USER_KEY); setUser(null); }, []);

  const value = useMemo(() => ({ cart, user, theme, syncing, addToCart, updateQuantity, removeFromCart, syncCart, signIn, signOut, setTheme }), [cart, user, theme, syncing, addToCart, updateQuantity, removeFromCart, syncCart, signIn, signOut]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
