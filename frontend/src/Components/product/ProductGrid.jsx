import ProductCard from "./ProductCard";

function ProductGrid({ products }) {
    if (!products || products.length === 0) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 py-20 text-center dark:border-white/10 dark:bg-white/[0.02]">
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    No products found
                </p>

                <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                    Try checking back later for new products.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    product={product}
                />
            ))}
        </div>
    );
}

export default ProductGrid;
