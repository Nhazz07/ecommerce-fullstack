import useProducts from "../hooks/useProducts";
import ProductGrid from "../Components/product/ProductGrid";

function Products() {
    const {
        products,
        isLoading,
        error,
    } = useProducts();

    return (
        <main className="min-h-screen bg-white px-4 pb-16 pt-24 text-[#0B1020] dark:bg-[#0B1020] dark:text-white sm:px-6">
            <div className="mx-auto max-w-7xl">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">
                        Anime Products
                    </h1>

                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                        Discover your favorite anime figures and merchandise.
                    </p>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="py-16 text-center">
                        <p className="text-gray-500 dark:text-gray-400">
                            Loading products...
                        </p>
                    </div>
                )}

                {/* Error */}
                {!isLoading && error && (
                    <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
                        {error}
                    </div>
                )}

                {/* Products */}
                {!isLoading && !error && (
                    <ProductGrid products={products} />
                )}

            </div>
        </main>
    );
}

export default Products;
