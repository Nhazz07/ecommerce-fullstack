function ProductCard({ product }) {
    const image = product.productImage?.[0];

    return (
        <article className="overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-white/5">
            <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-white/10">
    {image?.imageUrl ? (
        <img
            src={image.imageUrl}
            alt={image.altText || product.name}
            className="h-full w-full object-cover transition duration-300 hover:scale-105"
        />
    ) : (
        <div className="flex h-full items-center justify-center text-gray-400">
            No Image
        </div>
    )}
</div>

            <div className="p-5">
                <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-xs font-medium text-pink-500">
                        {product.categoryName || "Anime"}
                    </span>

                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {product.status}
                    </span>
                </div>

                <h2 className="truncate text-lg font-bold">
                    {product.name}
                </h2>

                <p className="mt-2 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                    {product.description || "No description available."}
                </p>

                <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-bold text-pink-500">
                        ${Number(product.price || 0).toFixed(2)}
                    </span>

                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {product.brandName || "Unknown Brand"}
                    </span>
                </div>

                <button
    type="button"
    onClick={() => navigate(`/products/${product.id}`)}
    className="mt-4 w-full rounded-lg bg-pink-400 py-2.5 font-semibold text-[#0B1020] transition hover:bg-pink-300"
>
    View Product
</button>
            </div>
        </article>
    );
}

export default ProductCard;
