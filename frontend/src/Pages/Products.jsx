import { Package, RefreshCw } from "lucide-react";

import useProducts from "../hooks/useProducts";
import ProductGrid from "../Components/product/ProductGrid";

function Products() {
    const {
        products,
        isLoading,
        error,
    } = useProducts();

    return (
        <main className="min-h-screen bg-white px-4 pb-20 pt-24 text-[#0B1020] dark:bg-[#080C16] dark:text-white sm:px-6">

            <div className="mx-auto max-w-7xl">

                {/* ================= HEADER ================= */}

                <section className="mb-10">

                    <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                            <Package
                                size={21}
                                className="text-blue-500"
                            />
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[2px] text-blue-500">
                                AniStore Collection
                            </p>

                            <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
                                Anime Products
                            </h1>
                        </div>

                    </div>

                    <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400 sm:text-base">
                        Discover your favorite anime figures,
                        apparel, accessories, and merchandise.
                    </p>

                </section>


                {/* ================= LOADING ================= */}

                {isLoading && (
                    <section className="py-20">

                        <div className="flex flex-col items-center justify-center text-center">

                            <div className="h-9 w-9 animate-spin rounded-full border-2 border-gray-200 border-t-blue-500 dark:border-white/10 dark:border-t-blue-500" />

                            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                                Loading products...
                            </p>

                        </div>

                    </section>
                )}


                {/* ================= ERROR ================= */}

                {!isLoading && error && (
                    <section className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-500/20 dark:bg-red-500/5">

                        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">

                            <div>
                                <h2 className="font-semibold text-red-600 dark:text-red-400">
                                    Unable to load products
                                </h2>

                                <p className="mt-1 text-sm text-red-500/80 dark:text-red-400/70">
                                    {error}
                                </p>
                            </div>

                            <button
                                onClick={() =>
                                    window.location.reload()
                                }
                                className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50 dark:border-red-500/20 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-500/10"
                            >
                                <RefreshCw size={16} />
                                Try Again
                            </button>

                        </div>

                    </section>
                )}


                {/* ================= PRODUCTS ================= */}

                {!isLoading && !error && (
                    <section>

                        <div className="mb-5 flex items-center justify-between">

                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {products.length}{" "}
                                {products.length === 1
                                    ? "product"
                                    : "products"}{" "}
                                available
                            </p>

                        </div>

                        {products.length > 0 ? (
                            <ProductGrid
                                products={products}
                            />
                        ) : (
                            <div className="rounded-xl border border-dashed border-gray-300 py-20 text-center dark:border-white/10">

                                <Package
                                    size={32}
                                    className="mx-auto text-gray-400"
                                />

                                <h2 className="mt-4 font-semibold">
                                    No products found
                                </h2>

                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    There are no products available
                                    right now.
                                </p>

                            </div>
                        )}

                    </section>
                )}

            </div>

        </main>
    );
}

export default Products;
