import {
    Home,
    Moon,
    Package,
    Search,
    ShoppingCart,
    Sun,
    User,
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
        <nav className="fixed left-0 top-0 z-50 w-full border-b border-gray-200/80 bg-white/95 backdrop-blur-md dark:border-white/10 dark:bg-[#080C16]/95">

            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

                {/* ==================== LOGO ==================== */}

                <button
                    onClick={() => navigate("/")}
                    className="text-2xl font-bold tracking-tight"
                >
                    <span className="text-[#0B1020] dark:text-white">
                        Ani
                    </span>

                    <span className="text-blue-500">
                        Store
                    </span>
                </button>


                {/* ==================== NAVIGATION ==================== */}

                <div className="hidden items-center gap-7 md:flex">

                    {/* Home */}
                    <button
                        onClick={() => navigate("/")}
                        className={`flex h-16 items-center gap-2 border-b-2 text-sm font-medium transition ${
                            isActive("/")
                                ? "border-blue-500 text-blue-500"
                                : "border-transparent text-gray-600 hover:text-blue-500 dark:text-gray-300"
                        }`}
                    >
                        <Home size={16} />
                        Home
                    </button>


                    {/* Products */}
                    <button
                        onClick={() =>
                            navigate("/products")
                        }
                        className={`flex h-16 items-center gap-2 border-b-2 text-sm font-medium transition ${
                            isActive("/products")
                                ? "border-blue-500 text-blue-500"
                                : "border-transparent text-gray-600 hover:text-blue-500 dark:text-gray-300"
                        }`}
                    >
                        <Package size={16} />
                        Products
                    </button>


                    {/* Cart */}
                    <button
                        onClick={() => navigate("/cart")}
                        className={`flex h-16 items-center gap-2 border-b-2 text-sm font-medium transition ${
                            isActive("/cart")
                                ? "border-blue-500 text-blue-500"
                                : "border-transparent text-gray-600 hover:text-blue-500 dark:text-gray-300"
                        }`}
                    >
                        <ShoppingCart size={16} />
                        Cart
                    </button>


                    {/* Orders */}
                    {isAuthenticated && (
                        <button
                            onClick={() =>
                                navigate("/orders")
                            }
                            className={`flex h-16 items-center gap-2 border-b-2 text-sm font-medium transition ${
                                isActive("/orders")
                                    ? "border-blue-500 text-blue-500"
                                    : "border-transparent text-gray-600 hover:text-blue-500 dark:text-gray-300"
                            }`}
                        >
                            <Package size={16} />
                            Orders
                        </button>
                    )}

                </div>


                {/* ==================== ACTIONS ==================== */}

                <div className="flex items-center gap-4">

                    {/* Search */}
                    <button
                        onClick={() =>
                            navigate("/products")
                        }
                        className="text-gray-700 transition hover:text-blue-500 dark:text-gray-200"
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
                        className="relative text-gray-700 transition hover:text-blue-500 dark:text-gray-200"
                        title="Shopping cart"
                    >
                        <ShoppingCart
                            size={20}
                            strokeWidth={2}
                        />

                        {cartCount > 0 && (
                            <span className="absolute -right-3 -top-3 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-500 px-1 text-[10px] font-bold text-white">
                                {cartCount}
                            </span>
                        )}
                    </button>


                    {/* Theme */}
                    <button
                        onClick={() =>
                            setDarkMode((previous) => !previous)
                        }
                        className="text-gray-700 transition hover:text-blue-500 dark:text-gray-200"
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
                            onClick={() =>
                                navigate("/account")
                            }
                            className="flex items-center gap-2 rounded-lg bg-blue-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
                        >
                            <User size={16} />
                            Account
                        </button>
                    ) : (
                        <button
                            onClick={() =>
                                navigate("/login")
                            }
                            className="rounded-lg bg-blue-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
                        >
                            Login
                        </button>
                    )}

                </div>

            </div>

        </nav>
    );
}
