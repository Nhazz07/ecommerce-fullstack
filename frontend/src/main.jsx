import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import { AuthProvider } from "./Context/AuthContext";
import { CartProvider } from "./Context/CartContent";
import { ThemeProvider } from "./Context/ThemeContext";
import { WishlistProvider } from "./Context/WishlistContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
<ThemeProvider>
    <AuthProvider>
        <CartProvider>
            <WishlistProvider>
                <App />
            </WishlistProvider>
        </CartProvider>
    </AuthProvider>
</ThemeProvider>
    </React.StrictMode>
);
