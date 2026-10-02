import {
    Moon,
    Search,
    ShoppingCart,
    Sun,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
    useLocation,
    useNavigate,
} from "react-router-dom";

import { useCart } from "../Context/CartContent";
import { useAuth } from "../Context/AuthContext";

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const { cartCount } = useCart();
    const { isAuthenticated } = useAuth();

    const [darkMode, setDarkMode] = useState(
        localStorage.getItem("theme") === "dark"
    );

    useEffect(() => {
        document.documentElement.classList.toggle(
            "dark",
            darkMode
        );

        localStorage.setItem(
            "theme",
            darkMode ? "dark" : "light"
        );
    }, [darkMode]);

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <nav className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white dark:border-white/10 dark:bg-[#0B1020]">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

                {/* Logo */}
                <h1
                    onClick={() => navigate("/")}
                    className="cursor-pointer text-2xl font-bold text-[#0B1020] dark:text-white"
                >
                    Ani<span className="text-pink-400">
                        Store
                    </span>
                </h1>

                {/* Navigation */}
                <div className="hidden items-center gap-7 text-sm font-medium text-gray-600 dark:text-gray-300 md:flex">

                    {/* Home */}
                    <button
                        onClick={() => navigate("/")}
                        className={`h-16 ${
                            isActive("/")
                                ? "border-b-2 border-pink-400 text-pink-400"
                                : "hover:text-pink-400"
                        }`}
                    >
                        Home
                    </button>

                    {/* Products */}
                    <button
                        onClick={() => navigate("/products")}
                        className={`h-16 ${
                            isActive("/products")
                                ? "border-b-2 border-pink-400 text-pink-400"
                                : "hover:text-pink-400"
                        }`}
                    >
                        Products
                    </button>

                    {/* Cart */}
                    <button
                        onClick={() => navigate("/cart")}
                        className={`h-16 ${
                            isActive("/cart")
                                ? "border-b-2 border-pink-400 text-pink-400"
                                : "hover:text-pink-400"
                        }`}
                    >
                        Cart
                    </button>

                    {/* Orders */}
                    {isAuthenticated && (
                        <button
                            onClick={() => navigate("/orders")}
                            className={`h-16 ${
                                isActive("/orders")
                                    ? "border-b-2 border-pink-400 text-pink-400"
                                    : "hover:text-pink-400"
                            }`}
                        >
                            Orders
                        </button>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">

                    {/* Search */}
                    <button
                        onClick={() => navigate("/products")}
                        className="text-[#0B1020] transition hover:text-pink-400 dark:text-white"
                        title="Search products"
                    >
                        <Search
                            size={20}
                            strokeWidth={2}
                        />
                    </button>

                    {/* Cart */}
                    <button
                        onClick={() => navigate("/cart")}
                        className="relative text-[#0B1020] transition hover:text-pink-400 dark:text-white"
                        title="Shopping cart"
                    >
                        <ShoppingCart
                            size={20}
                            strokeWidth={2}
                        />

                        <span className="absolute -right-3 -top-3 flex h-4 min-w-4 items-center justify-center rounded-full bg-pink-400 px-1 text-[10px] font-bold text-[#0B1020]">
                            {cartCount}
                        </span>
                    </button>

                    {/* Theme Toggle */}
                    <button
                        onClick={() =>
                            setDarkMode(!darkMode)
                        }
                        className="text-[#0B1020] transition hover:text-pink-400 dark:text-white"
                        title="Change theme"
                    >
                        {darkMode ? (
                            <Sun size={19} />
                        ) : (
                            <Moon size={19} />
                        )}
                    </button>

                    {/* Account / Login */}
                    {isAuthenticated ? (
    <button
        onClick={() => navigate("/account")}
        className="rounded-lg bg-pink-400 px-5 py-2 font-semibold text-[#0B1020] transition hover:bg-pink-300"
    >
        Account
    </button>
) : (
    <button
        onClick={() => navigate("/login")}
        className="rounded-lg bg-pink-400 px-5 py-2 font-semibold text-[#0B1020] transition hover:bg-pink-300"
    >
        Login
    </button>
)}
                </div>
            </div>
        </nav>
    );
}
