import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowRight,
    BookOpen,
    Box,
    CupSoda,
    Gem,
    Grid2X2,
    Image as ImageIcon,
    KeyRound,
    Shirt,
    Headphones,
    ShieldCheck,
    Truck,
} from "lucide-react";

import bleach from "../assets/figurebleach.jpg";
import ProductCard from "../Components/ProductCard";
import { getProducts } from "../Services/productApi";

const categories = [
    {
        name: "All",
        icon: Grid2X2,
    },
    {
        name: "Figures",
        icon: Box,
    },
    {
        name: "Apparel",
        icon: Shirt,
    },
    {
        name: "Posters",
        icon: ImageIcon,
    },
    {
        name: "Keychains",
        icon: KeyRound,
    },
    {
        name: "Drinkware",
        icon: CupSoda,
    },
    {
        name: "Manga",
        icon: BookOpen,
    },
    {
        name: "Accessories",
        icon: Gem,
    },
];

function Home() {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await getProducts();

                setProducts(response.data.content);
            } catch (error) {
                console.error(
                    "Failed to fetch products:",
                    error
                );

                setError("Failed to load products.");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) {
        return (
            <main className="min-h-screen bg-white pt-16 text-[#0B1020] dark:bg-[#080C16] dark:text-white">
                <div className="flex min-h-[70vh] items-center justify-center">
                    <div className="text-center">
                        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />

                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Loading products...
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen bg-white pt-16 text-[#0B1020] dark:bg-[#080C16] dark:text-white">
                <div className="flex min-h-[70vh] items-center justify-center px-6">
                    <div className="text-center">
                        <h2 className="text-xl font-semibold">
                            Something went wrong
                        </h2>

                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            {error}
                        </p>

                        <button
                            onClick={() => window.location.reload()}
                            className="mt-6 rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-white text-[#0B1020] dark:bg-[#080C16] dark:text-white">

            {/* ==================== HERO ==================== */}
            <section className="pt-28 pb-16">
                <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-6 md:grid-cols-2">

                    {/* Hero Content */}
                    <div>
                        <p className="mb-5 text-sm font-semibold tracking-[3px] text-blue-500">
                            OFFICIAL ANIME MERCHANDISE
                        </p>

                        <h1 className="text-5xl font-bold leading-[1.08] tracking-tight md:text-6xl">
                            Your Favorite Anime,
                            <span className="block text-blue-500">
                                Closer Than Ever
                            </span>
                        </h1>

                        <p className="mt-6 max-w-lg text-base leading-7 text-gray-500 dark:text-gray-400">
                            Discover authentic figures, apparel,
                            accessories and more from the anime
                            you love.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-4">

                            <button
                                onClick={() =>
                                    navigate("/products")
                                }
                                className="flex items-center gap-2 rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition hover:bg-blue-600"
                            >
                                Shop Now
                                <ArrowRight size={18} />
                            </button>

                            <button
                                onClick={() =>
                                    navigate("/products")
                                }
                                className="rounded-lg border border-gray-300 px-6 py-3 font-semibold transition hover:border-blue-500 hover:text-blue-500 dark:border-white/15 dark:hover:border-blue-500"
                            >
                                Explore Products
                            </button>

                        </div>
                    </div>

                    {/* Hero Image */}
                    <div className="relative">
                        <div className="absolute -inset-4 rounded-3xl bg-blue-500/10 blur-3xl" />

                        <div className="relative h-[380px] overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 dark:border-white/10 dark:bg-white/5 md:h-[430px]">
                            <img
                                src={bleach}
                                className="h-full w-full object-cover"
                                alt="Anime merchandise"
                            />
                        </div>
                    </div>

                </div>
            </section>


            {/* ==================== CATEGORIES ==================== */}
            <section className="mx-auto max-w-7xl px-6 py-12">

                <div className="mb-7 flex items-end justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Shop by Category
                        </h2>

                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Find something you'll love.
                        </p>
                    </div>

                    <button
                        onClick={() =>
                            navigate("/products")
                        }
                        className="hidden items-center gap-1 text-sm font-semibold text-blue-500 transition hover:text-blue-600 sm:flex"
                    >
                        View All
                        <ArrowRight size={16} />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-8">

                    {categories.map((category) => {
                        const Icon = category.icon;

                        return (
                            <button
                                key={category.name}
                                className="group flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white py-5 transition duration-200 hover:-translate-y-1 hover:border-blue-500 hover:shadow-sm dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-blue-500"
                            >
                                <Icon
                                    size={21}
                                    strokeWidth={1.8}
                                    className="text-gray-500 transition group-hover:text-blue-500 dark:text-gray-400"
                                />

                                <span className="text-sm font-medium">
                                    {category.name}
                                </span>
                            </button>
                        );
                    })}

                </div>

                <button
                    onClick={() =>
                        navigate("/products")
                    }
                    className="mt-5 flex items-center gap-1 text-sm font-semibold text-blue-500 sm:hidden"
                >
                    View All
                    <ArrowRight size={16} />
                </button>

            </section>


            {/* ==================== FEATURED PRODUCTS ==================== */}
            <section className="mx-auto max-w-7xl px-6 py-12">

                <div className="mb-7 flex items-end justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Featured Products
                        </h2>

                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Handpicked items for true fans.
                        </p>
                    </div>

                    <button
                        onClick={() =>
                            navigate("/products")
                        }
                        className="hidden items-center gap-1 text-sm font-semibold text-blue-500 transition hover:text-blue-600 sm:flex"
                    >
                        View All
                        <ArrowRight size={16} />
                    </button>
                </div>

                {products.length > 0 ? (
                    <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center dark:border-white/10">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            No products available right now.
                        </p>
                    </div>
                )}

                <button
                    onClick={() =>
                        navigate("/products")
                    }
                    className="mt-6 flex items-center gap-1 text-sm font-semibold text-blue-500 sm:hidden"
                >
                    View All Products
                    <ArrowRight size={16} />
                </button>

            </section>


            {/* ==================== BENEFITS ==================== */}
            <section className="border-t border-gray-200 dark:border-white/10">

                <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-12 md:grid-cols-3">

                    {/* Shipping */}
                    <div className="flex items-start gap-4">
                        <div className="rounded-lg bg-blue-500/10 p-3">
                            <Truck
                                size={22}
                                className="text-blue-500"
                            />
                        </div>

                        <div>
                            <h3 className="font-semibold">
                                Fast Shipping
                            </h3>

                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Quick delivery across Cambodia.
                            </p>
                        </div>
                    </div>

                    {/* Payment */}
                    <div className="flex items-start gap-4">
                        <div className="rounded-lg bg-blue-500/10 p-3">
                            <ShieldCheck
                                size={22}
                                className="text-blue-500"
                            />
                        </div>

                        <div>
                            <h3 className="font-semibold">
                                Secure Payment
                            </h3>

                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Shop with confidence.
                            </p>
                        </div>
                    </div>

                    {/* Support */}
                    <div className="flex items-start gap-4">
                        <div className="rounded-lg bg-blue-500/10 p-3">
                            <Headphones
                                size={22}
                                className="text-blue-500"
                            />
                        </div>

                        <div>
                            <h3 className="font-semibold">
                                Dedicated Support
                            </h3>

                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                We're here when you need us.
                            </p>
                        </div>
                    </div>

                </div>

            </section>

        </main>
    );
}

export default Home;
