import ProductCard from "./ProductCard";

function ProductGrid({ products }) {
    if (products.length === 0) {
        return (
            <div className="py-16 text-center text-gray-500 dark:text-gray-400">
                No products found.
            </div>
        );
    }

    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
